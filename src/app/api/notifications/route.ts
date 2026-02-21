import { NextResponse } from "next/server";

// In a real app, this would be stored in Cosmos DB or a fast cache like Redis.
// For the MVP, we will use a server-side array to store the latest announcements.
// Note: This relies on the Next.js server instance running continuously, which works for dev/demo.
// For production serverless, this MUST be moved to a DB container.
let recentAnnouncements: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sectionId = searchParams.get("sectionId");
  const lastSync = parseInt(searchParams.get("lastSync") || "0", 10);

  if (!sectionId) {
    return NextResponse.json({ error: "Missing sectionId" }, { status: 400 });
  }

  // Filter announcements for this section that are newer than the client's lastSync time
  const newAnnouncements = recentAnnouncements.filter(
    (a) => a.sectionId === sectionId && a.timestamp > lastSync,
  );

  return NextResponse.json({ announcements: newAnnouncements });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sectionId, message, authorId } = body;

    if (!sectionId || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const announcement = {
      id: crypto.randomUUID(),
      sectionId,
      message,
      authorId: authorId || "CR",
      timestamp: Date.now(),
    };

    recentAnnouncements.push(announcement);

    // Keep memory clean, only store the last 50
    if (recentAnnouncements.length > 50) {
      recentAnnouncements = recentAnnouncements.slice(-50);
    }

    return NextResponse.json({ success: true, announcement });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
