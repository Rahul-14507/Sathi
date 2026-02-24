<div align="center">
  <img src="public/globe.svg" alt="Sathi Logo" width="120" />
  <h1>Sathi</h1>
  <p><em>The Intelligent Student Task Hub & Academic Community</em></p>

[![Next.js](https://img.shields.io/badge/built%20with-Next.js%2014-black)](https://nextjs.org/)
[![Azure](https://img.shields.io/badge/database-Azure%20Cosmos%20DB-0078D4)](https://azure.microsoft.com/)
[![OpenAI](https://img.shields.io/badge/AI-Azure%20OpenAI%20GPT--4o-412991)](https://azure.microsoft.com/)
[![TypeScript](https://img.shields.io/badge/language-TypeScript-3178C6)](https://www.typescriptlang.org/)

</div>

<br />

**Sathi** is a next-generation academic synchronization platform designed to eliminate the chaos of fragmented university communication. It replaces messy WhatsApp groups and lost emails with a centralized, AI-powered hub for deadlines, announcements, peer discussions, and up-skilling resources.

---

## ✨ Key Features

### 🎓 Triple-Portal Architecture

Sathi dynamically routes users based on their institutional role:

- **Management Portal**: Administrative control to create and manage Class Sections.
- **Class Representative (CR) / IC Portal**: Empowered dashboard to broadcast official academic tasks, announcements, and trigger automated email reminders to specific sections.
- **Student Portal**: A personalized, time-aware dashboard displaying personal workload alongside official section deadlines.

### 🧠 Sathi AI & Automation (Hackathon Highlights)

- **AI Syllabus Scanner**: Students can upload an image or PDF of their syllabus. Powered by **Azure OpenAI GPT-4o Vision**, Sathi automatically extracts assignments and deadlines, syncing them directly into the student's Cosmos DB task list.
- **Community Brain (Contextual RAG)**: A floating AI assistant integrated into the community tab. It uses a Retrieval-Augmented Generation (RAG) pipeline to fetch real-time context from peer discussions, campus events, and resources before answering questions. If unresolved, it auto-drafts a new community post.
- **Automated Reminders**: Built-in Cron job system utilizing `nodemailer` to blast 24-hour deadline warnings to assigned students.

### 🤝 Hub & Community

- **Time-Aware Dashboard**: Tasks automatically categorize into "Due Today", "Upcoming", and "Overdue" with visual urgency indicators.
- **Peer-to-Peer Community**: Global tabs for Discussions, Hackathons/Events, and Up-skilling resources with a real-time upvoting algorithm.

---

## 🏗️ System Architecture & Tech Stack

Sathi is built using a modern, scalable Serverless architecture.

- **Frontend Framework**: Next.js (App Router)
- **UI/UX**: React 19, Tailwind CSS, shadcn/ui, Framer Motion (Micro-animations)
- **Backend API**: Next.js Route Handlers (Serverless Node.js)
- **Database**: Azure Cosmos DB (NoSQL)
- **Authentication**: Google OAuth 2.0 & Institutional Nodemailer OTP Validation
- **AI Integration**: `@azure/openai` SDK
- **CI/CD**: GitHub Actions deployment to Azure Web Apps

---

## 🚀 Local Development Setup

Follow these instructions to run Sathi on your local machine.

### Prerequisites

- Node.js (v20+ recommended)
- Git
- An Azure Account (for Cosmos DB and OpenAI)
- A Google Cloud Console project (for OAuth)

### 1. Clone the Repository

```bash
git clone https://github.com/Rahul-14507/Sathi.git
cd Sathi
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory and populate it with the following secure keys:

```env
# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Azure Cosmos DB
COSMOS_ENDPOINT="your_cosmos_db_uri"
COSMOS_KEY="your_cosmos_db_key"

# Nodemailer / Email Auth Service
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"

# Azure OpenAI (Sathi AI Features)
AZURE_OPENAI_ENDPOINT="https://your-resource.openai.azure.com/"
AZURE_OPENAI_KEY="your_azure_openai_key"
AZURE_OPENAI_API_VERSION="2024-08-01-preview"
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

---

## 🗄️ Database Structure (Cosmos DB)

Sathi utilizes 4 primary NoSQL containers:

1. **Users**: Stores domain profiles, roles (student/cr/management), and section mappings.
2. **Tasks**: The core workload engine. Stores official CR broadcasts and personal student tasks.
3. **Community**: Stores crowdsourced posts, events, and upskill resources with a `votes` tracking map.
4. **OTPs**: Transient collection with Time-To-Live (TTL) indexing for secure, short-lived email authentication codes.

---

_Developed with ♥ for the Hackathon._
