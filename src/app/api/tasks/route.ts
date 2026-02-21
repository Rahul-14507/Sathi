import { NextResponse } from "next/server";
import { tasksContainer } from "@/lib/cosmos";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "global";

    const querySpec = {
      query: "SELECT * from c WHERE c.userId = @userId OR c.userId = 'global'",
      parameters: [{ name: "@userId", value: userId }],
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

    const { resources: tasks } = await tasksContainer.items
      .query(querySpec)
      .fetchAll();
    return NextResponse.json(tasks);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
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
