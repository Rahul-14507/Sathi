import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import { usersContainer, initDB } from "@/lib/cosmos";

const client = new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);

export async function POST(request: Request) {
  try {
    await initDB();
    const body = await request.json();
    const { credential, sectionId, role } = body;

    // Hardcode management bypass since admins don't really have sections
    // And their email won't match "admin" from our mock.
    if (role === "management") {
      return NextResponse.json(
        { error: "Google Sign-In is for Students & CRs only." },
        { status: 403 },
      );
    }

    if (!credential || !sectionId || !role) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 },
      );
    }

    // 1. Verify Google JWT Credential using google-auth-library
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return NextResponse.json(
        { error: "Invalid Google credentials" },
        { status: 401 },
      );
    }

    const domainId = payload.email; // Use Google verified email as the domainId

    // 2. Query Cosmos DB to check if this Domain ID belongs to this exactly requested Section & Role.
    if (!usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

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

    if (users.length === 0) {
      return NextResponse.json(
        {
          error: `Access Denied: The Google account (${domainId}) is not registered inside Cosmos DB for this Section (${sectionId}) as a ${role}.`,
        },
        { status: 403 },
      );
    }

    // Validated - User matches the specific role and section without needing an OTP!
    return NextResponse.json({
      success: true,
      user: users[0],
      domainId,
    });
  } catch (err: any) {
    console.error("Google Auth Error:", err);
    return NextResponse.json(
      { error: "Authentication failed. Token may be expired." },
      { status: 500 },
    );
  }
}
