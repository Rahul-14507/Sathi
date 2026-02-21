import { NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import { initDB, communityContainer } from "@/lib/cosmos";
import { v4 as uuidv4 } from "uuid";

const getClient = () => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;

  if (!endpoint || !apiKey) {
    throw new Error("Azure OpenAI credentials are not set.");
  }

  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview"; // Use your deployment's version
  const deployment = "gpt-4o";

  return new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
};

export async function POST(request: Request) {
  try {
    const { query, userId } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Missing query parameter." },
        { status: 400 },
      );
    }

    await initDB();

    // 1. Contextual RAG Mockup: Fetch recent/top posts from all community tabs
    const querySpec = {
      query:
        "SELECT TOP 15 c.title, c.content, c.category FROM c WHERE c.category IN ('discussion', 'events', 'upskill') ORDER BY c.upvotes DESC",
    };

    const { resources: discussions } = await communityContainer.items
      .query(querySpec)
      .fetchAll();

    const contextText = discussions
      .map((d) => `Title: ${d.title}\nContent: ${d.content}`)
      .join("\n\n---\n\n");

    // 2. Pass context to Azure OpenAI GPT-4o
    const client = getClient();
    console.log("Sending query to AI Assistant with Community Context...");

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an intelligent academic assistant for university students. You have access to the following recent community discussions:\n\n${contextText}\n\nAnswer the user's query thoughtfully based on the provided context if possible. If the context does not contain the answer, provide general helpful academic advice, and inform the user that you are drafting this as a new post for the community to answer. Format your response cleanly using markdown. Be encouraging, concise, and smart.`,
        },
        { role: "user", content: query },
      ],
      max_tokens: 800,
    });

    const aiAnswer =
      response.choices[0].message?.content ||
      "I couldn't generate an answer at this time.";

    // 3. Draft a post automatically if it seems like a new question (simple heuristic: the LLM is instructed to explicitly say it is drafting a post)
    let postDrafted = false;
    if (
      aiAnswer.toLowerCase().includes("drafting this as a new post") ||
      aiAnswer.toLowerCase().includes("drafted a post")
    ) {
      const newPost = {
        id: uuidv4(),
        category: "discussion",
        authorId: userId || "AI Assistant",
        title: `Q: ${query.substring(0, 50)}${query.length > 50 ? "..." : ""}`,
        content: query,
        upvotes: 1, // Start with 1 upvote from the author
        votes: { [userId || "AI Assistant"]: 1 }, // Map to store individual votes
        createdAt: new Date().toISOString(),
      };

      await communityContainer.items.create(newPost);
      postDrafted = true;
    }

    return NextResponse.json({
      success: true,
      answer: aiAnswer,
      postDrafted,
    });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to communicate with AI Assistant." },
      { status: 500 },
    );
  }
}
