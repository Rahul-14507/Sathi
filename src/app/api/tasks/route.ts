import { NextResponse } from "next/server";
import { tasksContainer, initDB } from "@/lib/cosmos";

export async function GET(request: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "";
    const sectionId = searchParams.get("sectionId") || "";

    const sectionUserId = sectionId ? `section:${sectionId}` : "global";

    const queryPersonal = {
      query: "SELECT * from c WHERE c.userId = @userId",
      parameters: [{ name: "@userId", value: userId }],
    };

    const querySection = {
      query: "SELECT * from c WHERE c.userId = @sectionUserId",
      parameters: [{ name: "@sectionUserId", value: sectionUserId }],
    };

    if (!tasksContainer) {
      // Mock data if no DB connected
      return NextResponse.json([
        {
          id: "mock-1",
          userId: "global",
          title: "Assignment 1 (Mock)",
          deadline: new Date().toISOString(),
          type: "academic",
          status: "pending",
        },
      ]);
    }

    const [personalRes, sectionRes] = await Promise.all([
      tasksContainer.items.query(queryPersonal).fetchAll(),
      tasksContainer.items.query(querySection).fetchAll(),
    ]);

    const tasks = [...personalRes.resources, ...sectionRes.resources];
    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const newTask = {
      id: crypto.randomUUID(),
      userId: body.userId || "global",
      title: body.title,
      description: body.description || "",
      deadline: body.deadline,
      type: body.type || "academic",
      priority: body.priority || "medium",
      status: body.status || "pending",
    };

    if (!tasksContainer) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    const { resource } = await tasksContainer.items.create(newTask);
    return NextResponse.json(resource, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { id, userId, ...updates } = body;

    if (!tasksContainer) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    const { resource } = await tasksContainer.item(id, userId).read();
    if (!resource)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updatedResource = { ...resource, ...updates };
    const { resource: newResource } = await tasksContainer
      .item(id, userId)
      .replace(updatedResource);
    return NextResponse.json(newResource, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await initDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");

    if (!id || !userId) {
      return NextResponse.json(
        { error: "Missing id or userId" },
        { status: 400 },
      );
    }

    if (!tasksContainer) {
      return NextResponse.json(
        { error: "DB not initialized" },
        { status: 500 },
      );
    }

    await tasksContainer.item(id, userId).delete();
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
