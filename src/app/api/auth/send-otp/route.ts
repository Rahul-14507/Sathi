import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { otpsContainer, usersContainer, initDB } from "@/lib/cosmos";

export async function POST(request: Request) {
  try {
    await initDB();
    const { domainId, sectionId, role } = await request.json();

    if (!domainId) {
      return NextResponse.json(
        { error: "Email/Domain ID is required" },
        { status: 400 },
      );
    }

    // Step 1: Verification Check
    // If it's a student or CR, ensure they actually exist in the DB for that section first!
    if (role === "student" || role === "cr") {
      if (!sectionId) {
        return NextResponse.json(
          { error: "Section is required" },
          { status: 400 },
        );
      }
      const querySpec = {
        query:
          "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.domainId = @domainId AND c.role = @role",
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
          { error: "Email not registered for this Section or Role." },
          { status: 403 },
        );
      }
    }

    // Step 2: Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes from now

    // Step 3: Save OTP to Cosmos DB
    await otpsContainer.items.upsert({
      id: domainId, // Use email as Document ID to implicitly overwrite previous unsent OTPs for the same user
      email: domainId,
      otp: otp,
      expiresAt: expiresAt,
      ttl: 600, // Cosmos DB Time-to-Live (10 minutes)
    });

    // Step 4: Email the OTP
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Sathi Portal Security" <${process.env.EMAIL_USER}>`,
      to: domainId,
      subject: "Your Sathi Login Verification Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 40px; text-align: center; background-color: #f4f4f5; border-radius: 10px;">
          <h2 style="color: #1e1b4b;">Sathi Authentication</h2>
          <p style="color: #3f3f46; font-size: 16px;">Here is your secure One-Time Password to login:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4338ca; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #71717a; font-size: 14px;">This code will expire in 10 minutes. Do not share it with anyone.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err: any) {
    console.error("OTP Error:", err);
    return NextResponse.json(
      { error: "Failed to process OTP request" },
      { status: 500 },
    );
  }
}
