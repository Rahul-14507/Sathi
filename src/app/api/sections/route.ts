import { NextResponse } from "next/server";
import { usersContainer, initDB } from "@/lib/cosmos";

export async function GET(request: Request) {
  try {
    await initDB();
    if (!usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    // A simple query to get all distinct 'section' items representing the metadata
    const querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'section_metadata'",
    };

    const { resources: sections } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    return NextResponse.json(sections);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { action, sectionId, sectionName, domainIds, crId } = body;

    if (!usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    if (action === "create_section") {
      // Create section metadata
      const newSection = {
        id: crypto.randomUUID(),
        sectionId: sectionId,
        sectionName: sectionName,
        type: "section_metadata",
        createdAt: new Date().toISOString(),
      };
      await usersContainer.items.create(newSection);

      // Create CR mapping if provided
      if (crId) {
        await usersContainer.items.create({
          id: crypto.randomUUID(),
          sectionId: sectionId,
          domainId: crId,
          role: "cr",
          type: "user_mapping",
        });
      }

      // Create Student mappings
      if (domainIds && Array.isArray(domainIds)) {
        for (const email of domainIds) {
          const cleanEmail = email.trim();
          if (cleanEmail) {
            await usersContainer.items.create({
              id: crypto.randomUUID(),
              sectionId: sectionId,
              domainId: cleanEmail,
              role: "student",
              type: "user_mapping",
            });
          }
        }
      }

      return NextResponse.json({ success: true, sectionId }, { status: 201 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
