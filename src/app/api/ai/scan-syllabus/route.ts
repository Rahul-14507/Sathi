import { NextResponse } from "next/server";
import { AzureOpenAI } from "openai";
import { initDB, tasksContainer } from "@/lib/cosmos";
import { v4 as uuidv4 } from "uuid";

// Configure Azure OpenAI client
const getClient = () => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
  const apiKey = process.env.AZURE_OPENAI_KEY;

  if (!endpoint || !apiKey) {
    throw new Error(
      "Azure OpenAI credentials are not set in environment variables.",
    );
  }

  // Assuming a standard GPT-4o deployment name, might need adjustment based on user's specific deployment
  const apiVersion =
    process.env.AZURE_OPENAI_API_VERSION || "2024-08-01-preview";
  const deployment = "gpt-4o";

  return new AzureOpenAI({ endpoint, apiKey, apiVersion, deployment });
};

export async function POST(request: Request) {
  try {
    const { base64Image, userId } = await request.json();

    if (!base64Image) {
      return NextResponse.json(
        { error: "Missing base64Image data" },
        { status: 400 },
      );
    }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const client = getClient();
    await initDB();

    console.log("Analyzing syllabus image with Azure OpenAI GPT-4o Vision...");

    const response = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an academic assistant. Analyze this image of a syllabus/timetable and extract all deadlines, exam dates, and class times. Return ONLY a JSON array of objects with fields: title (string), deadline (ISO 8601 date string), type (always 'academic'), and description (string). Do not include any explanation or markdown formatting outside of the JSON array.",
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      response_format: { type: "json_object" }, // Enforce JSON response if supported by deployment, otherwise rely on prompt
    });

    const aiResponseText = response.choices[0].message?.content;

    if (!aiResponseText) {
      throw new Error("Failed to get a response from Azure OpenAI.");
    }

    console.log("Raw Azure OpenAI Response:", aiResponseText);

    // Attempt to parse the JSON array
    let extractedTasks = [];
    try {
      // Strip markdown code block syntax if present despite prompt instructions
      const cleanJsonStr = aiResponseText
        .replace(/```json\n|\n```/g, "")
        .trim();

      // Sometimes the model returns { "tasks": [...] } if response_format is json_object
      const parsed = JSON.parse(cleanJsonStr);
      if (Array.isArray(parsed)) {
        extractedTasks = parsed;
      } else if (parsed.tasks && Array.isArray(parsed.tasks)) {
        extractedTasks = parsed.tasks;
      } else if (typeof parsed === "object" && parsed !== null) {
        if (parsed.title) {
          extractedTasks = [parsed];
        } else {
          // Sometimes the AI nests the array under a random key like "academicData"
          const firstArrayValue = Object.values(parsed).find((val) =>
            Array.isArray(val),
          );
          if (firstArrayValue) {
            extractedTasks = firstArrayValue;
          }
        }
      } else {
        return NextResponse.json(
          {
            error:
              "Azure OpenAI returned invalid JSON structure. Expected an array.",
          },
          { status: 500 },
        );
      }
    } catch (parseError) {
      console.error(
        "JSON Parse Error:",
        parseError,
        "Raw string:",
        aiResponseText,
      );
      return NextResponse.json(
        {
          error: "Failed to parse JSON from Azure OpenAI.",
          raw: aiResponseText,
        },
        { status: 500 },
      );
    }

    if (extractedTasks.length === 0) {
      return NextResponse.json({
        message: "No tasks found in the syllabus.",
        count: 0,
      });
    }

    // Bulk insert into Cosmos DB
    const insertPromises = extractedTasks.map(async (task: any) => {
      const newTask = {
        id: uuidv4(),
        userId,
        title: task.title || "Untitled AI Task",
        description: task.description || "Auto-extracted from syllabus",
        deadline: task.deadline || new Date().toISOString(), // Fallback
        type: "academic",
        priority: "high", // Assume exams/deadlines are high priority
        status: "pending",
        createdAt: new Date().toISOString(),
      };
      return tasksContainer.items.create(newTask);
    });

    await Promise.all(insertPromises);

    return NextResponse.json({
      success: true,
      message: `Successfully extracted and saved ${extractedTasks.length} tasks!`,
      count: extractedTasks.length,
      tasks: extractedTasks,
    });
  } catch (error: any) {
    console.error("Syllabus Scan Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process syllabus image." },
      { status: 500 },
    );
  }
}
