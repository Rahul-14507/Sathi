import { NextResponse } from "next/server";
import { usersContainer, initDB } from "@/lib/cosmos";

export async function GET(request: Request) {
  try {
    await initDB();
    if (!usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const url = new URL(request.url);
    const detailsId = url.searchParams.get("details");

    if (detailsId) {
      // Fetch CR
      const crQuery = {
        query:
          "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.role = 'cr'",
        parameters: [{ name: "@sectionId", value: detailsId }],
      };
      const { resources: crs } = await usersContainer.items
        .query(crQuery)
        .fetchAll();

      // Fetch Students
      const studentQuery = {
        query:
          "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.role = 'student'",
        parameters: [{ name: "@sectionId", value: detailsId }],
      };
      const { resources: students } = await usersContainer.items
        .query(studentQuery)
        .fetchAll();

      return NextResponse.json({
        crId: crs.length > 0 ? crs[0].domainId : "",
        students: students.map((s) => s.domainId),
      });
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

    if (action === "edit_section") {
      if (!sectionId) {
        return NextResponse.json(
          { error: "Missing sectionId" },
          { status: 400 },
        );
      }

      // 1. If crId is provided, we must find the old CR for this section and delete it, then add the new one.
      if (crId) {
        // Find existing CR
        const crQuery = {
          query:
            "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.role = 'cr'",
          parameters: [{ name: "@sectionId", value: sectionId }],
        };
        const { resources: oldCrs } = await usersContainer.items
          .query(crQuery)
          .fetchAll();

        // Delete old CR mappings
        for (const oldCr of oldCrs) {
          await usersContainer
            .item(oldCr.id, sectionId)
            .delete()
            .catch(() => {});
        }

        // Add new CR mapping
        await usersContainer.items.create({
          id: crypto.randomUUID(),
          sectionId: sectionId,
          domainId: crId,
          role: "cr",
          type: "user_mapping",
        });
      }

      // 2. Sync student domain IDs
      if (domainIds && Array.isArray(domainIds)) {
        const emailSet = new Set(
          domainIds
            .map((e: string) => e.trim().toLowerCase())
            .filter((e: string) => e.length > 0),
        );

        // Get existing students
        const studentQuery = {
          query:
            "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.role = 'student'",
          parameters: [{ name: "@sectionId", value: sectionId }],
        };
        const { resources: existingStudents } = await usersContainer.items
          .query(studentQuery)
          .fetchAll();

        const existingEmails = new Set(
          existingStudents.map((s: any) => s.domainId.toLowerCase()),
        );

        // Add new ones
        for (const email of emailSet) {
          if (!existingEmails.has(email)) {
            await usersContainer.items.create({
              id: crypto.randomUUID(),
              sectionId: sectionId,
              domainId: email,
              role: "student",
              type: "user_mapping",
            });
          }
        }

        // Delete removed ones
        for (const student of existingStudents) {
          if (!emailSet.has(student.domainId.toLowerCase())) {
            await usersContainer
              .item(student.id, sectionId)
              .delete()
              .catch(() => {});
          }
        }
      }

      return NextResponse.json({ success: true, sectionId }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
