import { NextResponse } from "next/server";
import { usersContainer, otpsContainer, initDB } from "@/lib/cosmos";

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

    if (users.length === 0) {
      return NextResponse.json(
        {
          error:
            "Access Denied: Domain ID not registered for this Section/Role.",
        },
        { status: 403 },
      );
    }

    // Step 2: Verify the OTP against Cosmos DB
    if (!otpsContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    const otpQuery = {
      query:
        "SELECT * FROM c WHERE c.email = @email AND c.otp = @otp AND c.expiresAt > @now",
      parameters: [
        { name: "@email", value: domainId },
        { name: "@otp", value: body.otp },
        { name: "@now", value: Date.now() },
      ],
    };

    const { resources: matchingOtps } = await otpsContainer.items
      .query(otpQuery)
      .fetchAll();

    if (matchingOtps.length === 0) {
      return NextResponse.json(
        { error: "Invalid or expired OTP. Please request a new one." },
        { status: 401 },
      );
    }

    // Optional: Delete the OTP so it cannot be reused
    await otpsContainer
      .item(domainId, domainId)
      .delete()
      .catch(() => {});

    // Validated
    return NextResponse.json({ success: true, user: users[0] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
