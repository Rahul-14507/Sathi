import { NextResponse } from "next/server";
import { usersContainer, initDB } from "@/lib/cosmos";

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { domainId, sectionId, role } = body;

    // Hardcode management login for the MVP
    if (role === "management") {
      if (domainId === "admin" && body.otp === "admin") {
        return NextResponse.json({ success: true, role: "management" });
      }
      return NextResponse.json(
        { error: "Invalid admin credentials" },
        { status: 401 },
      );
    }

    if (!domainId || !sectionId || !role) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 },
      );
    }

    if (!usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    // Verify if the domainId exists for the given role and section
    const querySpec = {
      query:
        "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.domainId = @domainId AND c.role = @role AND c.type = 'user_mapping'",
      parameters: [
        { name: "@sectionId", value: sectionId },
        { name: "@domainId", value: domainId },
        { name: "@role", value: role },
      ],
    };

    const { resources: users } = await usersContainer.items
      .query(querySpec)
      .fetchAll();

    if (users.length > 0) {
      // Validated
      return NextResponse.json({ success: true, user: users[0] });
    } else {
      // Rejected
      return NextResponse.json(
        {
          error:
            "Access Denied: Domain ID not registered for this Section/Role.",
        },
        { status: 403 },
      );
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
