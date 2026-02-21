import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { tasksContainer, usersContainer, initDB } from "@/lib/cosmos";

export async function POST(request: Request) {
  try {
    await initDB();
    const { taskId, sectionId } = await request.json();

    if (!taskId || !sectionId) {
      return NextResponse.json(
        { error: "Missing taskId or sectionId" },
        { status: 400 },
      );
    }

    if (!tasksContainer || !usersContainer) {
      return NextResponse.json({ error: "DB not connected" }, { status: 500 });
    }

    // 1. Fetch the specific Task details
    const taskQuery = {
      query: "SELECT * FROM c WHERE c.id = @taskId AND c.userId = @userId",
      parameters: [
        { name: "@taskId", value: taskId },
        { name: "@userId", value: `section:${sectionId}` },
      ],
    };

    const { resources: matchingTasks } = await tasksContainer.items
      .query(taskQuery)
      .fetchAll();

    if (matchingTasks.length === 0) {
      return NextResponse.json(
        { error: "Academic Task not found" },
        { status: 404 },
      );
    }

    const task = matchingTasks[0];

    // 2. Fetch all student emails for this section
    const studentQuery = {
      query:
        "SELECT * FROM c WHERE c.sectionId = @sectionId AND c.role = 'student'",
      parameters: [{ name: "@sectionId", value: sectionId }],
    };

    const { resources: students } = await usersContainer.items
      .query(studentQuery)
      .fetchAll();

    if (students.length === 0) {
      return NextResponse.json(
        { error: "No students in this section to email" },
        { status: 400 },
      );
    }

    const studentEmails = students.map((s) => s.domainId);

    // 3. Email the Reminder Blast via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const taskDeadlineStr = task.deadline
      ? new Date(task.deadline).toLocaleString()
      : "No set deadline";

    const mailOptions = {
      from: `"Sathi Academic Reminders" <${process.env.EMAIL_USER}>`,
      to: studentEmails, // Nodemailer allows an array of strings for bulk emailing!
      subject: `🚨 [Urgent Reminder] Task Deadline: ${task.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-left: 5px solid #ef4444;">
          <h2 style="color: #1e293b; margin-top: 0;">Academic Task Reminder</h2>
          <p style="color: #475569; font-size: 16px;">
            Your Class Representative for <strong>Section ${sectionId}</strong> has sent an urgent reminder regarding an upcoming academic task!
          </p>
          
          <div style="background-color: white; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0f172a;">${task.title}</h3>
            ${task.description ? `<p style="color: #64748b;">${task.description}</p>` : ""}
            
            <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #f1f5f9;">
              <strong style="color: #ef4444;">Deadline:</strong> <span style="color: #334155;">${taskDeadlineStr}</span>
            </div>
          </div>
          
          <p style="color: #94a3b8; font-size: 13px;">
            Please log in to your Sathi Student Dashboard to manage your task status or view more details.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: `Blast sent to ${studentEmails.length} students`,
    });
  } catch (err: any) {
    console.error("Reminder Error:", err);
    return NextResponse.json(
      { error: "Failed to process reminder request" },
      { status: 500 },
    );
  }
}
