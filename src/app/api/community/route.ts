import { NextResponse } from "next/server";
import { communityContainer, initDB } from "@/lib/cosmos";

export async function GET(request: Request) {
  try {
    await initDB();
    if (!communityContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const url = new URL(request.url);
    const category = url.searchParams.get("category");
    const search = url.searchParams.get("search");

    let query = "SELECT * FROM c";
    const parameters: any[] = [];
    const conditions: string[] = [];

    if (category) {
      conditions.push("c.category = @category");
      parameters.push({ name: "@category", value: category });
    }

    if (search) {
      conditions.push(
        "(CONTAINS(LOWER(c.title), @search) OR CONTAINS(LOWER(c.content), @search))",
      );
      parameters.push({ name: "@search", value: search.toLowerCase() });
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    const { resources: items } = await communityContainer.items
      .query({
        query,
        parameters,
      })
      .fetchAll();

    // Sort by upvotes (highest first), then chronologically
    items.sort((a: any, b: any) => {
      const aUpvotes = a.upvotes || 0;
      const bUpvotes = b.upvotes || 0;
      if (bUpvotes !== aUpvotes) {
        return bUpvotes - aUpvotes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return NextResponse.json(items);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    if (!communityContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const body = await request.json();
    const { category, title, content, link, authorId, sectionId } = body;

    if (!category || !title || !content || !authorId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const newItem = {
      id: crypto.randomUUID(),
      category, // 'Discussion', 'Events', or 'Upskill' (Partition Key)
      title,
      content,
      link, // Optional external URL for Upskill resources or Event signups
      authorId, // e.g. Domain ID or "Anonymous"
      sectionId, // To optionally tag where it came from
      upvotes: 0,
      createdAt: new Date().toISOString(),
    };

    const { resource } = await communityContainer.items.create(newItem);

    return NextResponse.json(resource, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initDB();
    if (!communityContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const body = await request.json();
    const { id, category, authorId, title, content, link } = body;

    if (!id || !category || !authorId || !title || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { resource: post } = await communityContainer
      .item(id, category)
      .read();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== authorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    post.title = title;
    post.content = content;
    if (link !== undefined) post.link = link;
    post.isEdited = true;

    const { resource: updatedPost } = await communityContainer
      .item(id, category)
      .replace(post);

    return NextResponse.json(updatedPost);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initDB();
    if (!communityContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    const category = url.searchParams.get("category");
    const authorId = url.searchParams.get("authorId");

    if (!id || !category || !authorId) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    const { resource: post } = await communityContainer
      .item(id, category)
      .read();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== authorId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await communityContainer.item(id, category).delete();

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
