import { NextResponse } from "next/server";
import { communityContainer, initDB } from "@/lib/cosmos";

export async function POST(request: Request) {
  try {
    await initDB();
    if (!communityContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const body = await request.json();
    const { postId, category, action } = body;

    if (!postId || !category || !["upvote", "downvote"].includes(action)) {
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

    // Modify the upvote count
    if (action === "upvote") {
      post.upvotes = (post.upvotes || 0) + 1;
    } else {
      post.upvotes = Math.max(0, (post.upvotes || 0) - 1);
    }

    // Save back to DB
    const { resource: updatedPost } = await communityContainer
      .item(postId, category)
      .replace(post);

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
