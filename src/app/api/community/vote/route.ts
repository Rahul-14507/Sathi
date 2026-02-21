import { NextResponse } from "next/server";
import { communityContainer, initDB } from "@/lib/cosmos";

export async function POST(request: Request) {
  try {
    await initDB();
    if (!communityContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const body = await request.json();
    const { postId, category, action, userId } = body;

    if (
      !postId ||
      !category ||
      !userId ||
      !["upvote", "downvote"].includes(action)
    ) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 },
      );
    }

    // Fetch the specific post
    const { resource: post } = await communityContainer
      .item(postId, category)
      .read();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Initialize votes dictionary if it doesn't exist
    if (!post.votes) {
      post.votes = {};
    }

    // Modify the upvote count for this specific user
    const voteValue = action === "upvote" ? 1 : -1;

    // If the user clicks the same vote again, it could toggle off, but for MVP let's just assert the state.
    post.votes[userId] = voteValue;

    // Recalculate total upvotes
    post.upvotes = Object.values(post.votes).reduce(
      (sum: number, val: any) => sum + (val as number),
      0,
    );

    // Save back to DB
    const { resource: updatedPost } = await communityContainer
      .item(postId, category)
      .replace(post);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
