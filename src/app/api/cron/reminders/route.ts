import { NextResponse } from "next/server";
import { initDB, tasksContainer, usersContainer } from "@/lib/cosmos";
import nodemailer from "nodemailer";

export async function GET(request: Request) {
  try {
    // Basic security: In a real app, verify a webhook secret or cron token here.
    // For this hackathon demo, we will allow it to be triggered freely.

    await initDB();

    const now = new Date();
    const twentyFourHoursFromNow = new Date(
      now.getTime() + 24 * 60 * 60 * 1000,
    );

    // 1. Query all tasks due within the next 24 hours that haven't been completed
    const querySpec = {
      query:
        "SELECT * FROM c WHERE c.status = 'pending' AND c.deadline >= @now AND c.deadline <= @twentyFourHours",
      parameters: [
        { name: "@now", value: now.toISOString() },
        {
          name: "@twentyFourHours",
          value: twentyFourHoursFromNow.toISOString(),
        },
      ],
    };

    const { resources: urgentTasks } = await tasksContainer.items
      .query(querySpec)
      .fetchAll();

    if (urgentTasks.length === 0) {
      return NextResponse.json({
        message: "No urgent tasks found for reminders.",
      });
    }

    // 2. Setup Nodemailer
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let emailsSent = 0;

    // 3. Process each urgent task and send emails
    for (const task of urgentTasks) {
      let targetEmails: string[] = [];

      if (task.userId.startsWith("section:")) {
        // Global Task: Fetch all students in this section
        const sectionId = task.userId.split(":")[1];
        const sectionQuery = {
          query:
            "SELECT c.domainIds FROM c WHERE c.sectionId = @sectionId AND c.type = 'section_mapping'",
          parameters: [{ name: "@sectionId", value: sectionId }],
        };
        const { resources: sections } = await usersContainer.items
          .query(sectionQuery)
          .fetchAll();

        if (sections.length > 0 && sections[0].domainIds) {
          targetEmails = sections[0].domainIds;
        }
      } else if (task.userId.startsWith("student:")) {
        // Personal Task: Send only to that student
        const email = task.userId.split(":")[1];

        // Try to fetch their secondary/alert email if they configured one
        const userQuery = {
          query:
            "SELECT c.secondaryEmail FROM c WHERE c.email = @email AND c.type = 'user_mapping'",
          parameters: [{ name: "@email", value: email }],
        };
        const { resources: users } = await usersContainer.items
          .query(userQuery)
          .fetchAll();

        if (users.length > 0 && users[0].secondaryEmail) {
          targetEmails = [users[0].secondaryEmail]; // Prefer alert email
        } else {
          targetEmails = [email]; // Fallback to primary domain ID
        }
      }

      if (targetEmails.length === 0) continue;

      // Construct Email HTML (matching the aesthetic of our app)
      const htmlContent = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 12px; overflow: hidden; border: 1px solid #1e293b;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #ec4899 100%); padding: 30px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Sathi Alert</h1>
          </div>
          <div style="padding: 40px 30px; background-color: #0f172a;">
            <p style="color: #94a3b8; font-size: 16px; margin-bottom: 24px;">This is an automated reminder regarding an upcoming academic deadline.</p>
            
            <div style="background-color: #1e293b; padding: 24px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 30px;">
                <h2 style="margin: 0 0 10px 0; color: #f1f5f9; font-size: 20px;">${task.title}</h2>
                <p style="margin: 0 0 15px 0; color: #cbd5e1; font-size: 15px;">${task.description || "No description provided."}</p>
                <div style="display: inline-block; background-color: #f59e0b20; color: #fcd34d; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px; border: 1px solid #f59e0b40;">
                    Due: ${new Date(task.deadline).toLocaleString()}
                </div>
            </div>

            <p style="color: #64748b; font-size: 14px; text-align: center; margin-top: 40px; border-top: 1px solid #1e293b; padding-top: 20px;">
              Manage your tasks efficiently at <a href="#" style="color: #818cf8; text-decoration: none;">Sathi Dashboard</a>
            </p>
          </div>
        </div>
      `;

      // Send the email batch
      await transporter.sendMail({
        from: `"Sathi Bot" <${process.env.EMAIL_USER}>`,
        to: targetEmails,
        subject: `[URGENT] Due in < 24 Hours: ${task.title}`,
        html: htmlContent,
      });

      emailsSent += targetEmails.length;
    }

    return NextResponse.json({
      success: true,
      message: `Cron job executed successfully. Sent ${emailsSent} reminder emails for ${urgentTasks.length} urgent tasks.`,
    });
  } catch (error: any) {
    console.error("Cron Reminder Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute cron reminders." },
      { status: 500 },
    );
  }
}
