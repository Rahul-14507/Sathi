import { NextResponse } from "next/server";
import { usersContainer, initDB } from "@/lib/cosmos";

export async function GET(request: Request) {
  try {
    await initDB();
    if (!usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const url = new URL(request.url);
    const email = url.searchParams.get("email");
    const sectionId = url.searchParams.get("sectionId");

    if (!email || !sectionId) {
      return NextResponse.json(
        { error: "Missing email or sectionId parameter" },
        { status: 400 },
      );
    }

    const decodedSectionId = decodeURIComponent(sectionId);

    // Find the specific user mapping document
    const querySpec = {
      query:
        "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.domainId = @email AND c.type = 'user_mapping'",
      parameters: [
        { name: "@sectionId", value: decodedSectionId },
        { name: "@email", value: email },
      ],
    };

    const { resources: users } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    if (users.length === 0) {
      // Auto-provision a blank profile for beta test emails that were manually typed in
      return NextResponse.json({ email, name: "", secondaryEmail: "" });
    }

    const userDoc = users[0];
    return NextResponse.json({
      email: userDoc.domainId,
      name: userDoc.name || "",
      secondaryEmail: userDoc.secondaryEmail || "",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await initDB();
    if (!usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const body = await request.json();
    const { email, sectionId, name, secondaryEmail } = body;

    if (!email || !sectionId) {
      return NextResponse.json(
        { error: "Missing email or sectionId" },
        { status: 400 },
      );
    }

    const decodedSectionId = decodeURIComponent(sectionId);

    // Find the user mapping document
    const querySpec = {
      query:
        "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.domainId = @email AND c.type = 'user_mapping'",
      parameters: [
        { name: "@sectionId", value: decodedSectionId },
        { name: "@email", value: email },
      ],
    };

    const { resources: users } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    if (users.length === 0) {
      // Auto-enroll the user if they aren't explicitly in the section yet (useful for testing)
      const newUserDoc = {
        id: crypto.randomUUID(),
        sectionId: decodedSectionId,
        domainId: email,
        role: "student",
        type: "user_mapping",
        name: name,
        secondaryEmail: secondaryEmail,
      };
      await usersContainer.items.create(newUserDoc);
      return NextResponse.json({ email, name, secondaryEmail });
    }

    // Update the existing document
    const userDoc = users[0];
    userDoc.name = name;
    userDoc.secondaryEmail = secondaryEmail;

    const { resource: updatedUser } = await usersContainer
      .item(userDoc.id, decodedSectionId)
      .replace(userDoc);

    return NextResponse.json({
      email: updatedUser.domainId,
      name: updatedUser.name,
      secondaryEmail: updatedUser.secondaryEmail,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
