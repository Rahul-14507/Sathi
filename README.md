# Sathi - Student Task Hub

**Sathi** is an intelligent web app that centralizes college deadlines, announcements, and resources for Students and Class Representatives (CRs), eliminating fragmented communication across WhatsApp and emails.

## 🚀 Key Features

- **Triple-Portal Architecture:** Dedicated dashboards for Management (Setup), CRs (Broadcasts & Reminders), and Students.
- **Time-Aware Dashboard:** Automatically prioritizes overarching deadlines, overdue tasks, and "Due Today" items.
- **Sathi AI & Automation:**
  - **Syllabus Scanner:** Upload a syllabus image to auto-extract and sync deadlines using GPT-4o Vision.
  - **Community Brain (RAG):** AI Chatbot that searches Discussions, Events, and Resources to answer questions or draft new posts.
  - **Smart Reminders:** Automated 24-hr email alerts via Nodemailer.
- **Community Hub:** Peer-to-peer sharing for Discussions, Hackathons, and Up-skilling with real-time upvoting.
- **Secure Authentication:** 2FA domain verification via Nodemailer OTP.

## 💻 Tech Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS, shadcn/ui.
- **Backend & Database:** Node.js, Azure Cosmos DB (NoSQL).
- **AI & Integrations:** Azure OpenAI (GPT-4o), Nodemailer.

## 🛠️ Local Setup

1. **Clone & Install:**

   ```bash
   git clone <repository-url>
   cd Sathi
   npm install
   ```

2. **Environment Configuration (`.env.local`):**

   ```env
   # Database
   COSMOS_ENDPOINT="your_cosmos_db_uri"
   COSMOS_KEY="your_cosmos_db_key"

   # Email Auth & Reminders
   EMAIL_USER="your_email@gmail.com"
   EMAIL_PASS="your_app_password"

   # Sathi AI
   AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
   AZURE_OPENAI_KEY="your_azure_openai_key"
   AZURE_OPENAI_API_VERSION="2024-08-01-preview"
   ```

3. **Run:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

---

_Built for the Hackathon._
