# Sathi - Student Task Hub

**Sathi** is a unified, intelligent web application designed for class CRs (Class Representatives), Incharges, and Students to streamline academic and personal workload management. Built with modern web technologies, Sathi resolves the "Information Fragmented" problem in colleges by replacing scattered WhatsApp groups and cluttered LMS emails with a single, authoritative feed for deadlines, announcements, and resources.

## 🚀 Features

### Triple-Portal Architecture

- **Management Portal:** School-wide administrator setup. Create sections, assign CRs, and bulk-load student domain IDs securely.
- **CR/Incharge Portal:** Dedicated broadcast dashboard for Class Representatives to post urgent academic tasks and impending deadlines to their section's feed. Includes a one-click "Ping" to send email reminders to the entire class.
- **Student Dashboard:** A personalized, time-aware task hub featuring a sleek glassmorphism UI.

### Time-Aware Student Dashboard

- **Contextual Prioritization:** The dashboard dynamically checks the system time and adjusts the view. It prioritizes overarching deadlines, overdue tasks, and "Due Today" items to reduce cognitive load.
- **Zero-Training Required:** Students enter via a Section-scoped login, instantly filtering all data (Tasks, Timetables, Announcements) to their specific academic context.
- **Profile Modal:** Persistent accessibility to user settings via a top-left avatar, keeping the workspace uncluttered.

### Secure 2FA Authentication

- **Domain Verification:** Implements a two-step domain verification flow (Email -> OTP -> Session) utilizing **Nodemailer** and a temporary DB-backed OTP container.
- **Auto-Enrollment Logic:** New testing users attempting to login are seamlessly provisioned a section profile on the fly.

### Community Hub

- **Peer-to-Peer Growth:** Includes sub-tabs for Discussions, Hackathons/Events, and Free Resources.
- **Upvoting Ecosystem:** Uses community metadata (upvoting/downvoting) to surface high-quality course links and peer-vetted materials.
- **Schedule Integration:** Users can instantly add Community Events to their personal schedule.

### Real-Time Sync & Notifications

- **Broadcast Engine:** A lightweight API polling engine triggers **push toasts** (via Sonner) on the student dashboard for new teacher/CR announcements without needing a manual page refresh.

## 💻 Tech Stack

- **Frontend:** React, Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Lucide React.
- **Backend:** Next.js API Routes (Node.js).
- **Database:** Azure Cosmos DB (NoSQL).
- **Mail Service:** Nodemailer (for OTPs and "Ping" class-wide reminders).

## 🏗️ Architecture & Scalability

Sathi is built from the ground up to scale across thousands of departments:

- **Database Partitioning:** Azure Cosmos DB uses `/sectionId` as the primary partition key, ensuring that queries for a specific class remain ultra-fast, even as the platform scales to millions of users.
- **Atomic Data Schema:** Employs individual `user_mapping` documents instead of monolithic arrays. This allows the system to seamlessly scale students in and out of sections without risking heavy master-list transaction timeouts.
- **Connection Optimization:** Iterates a cached CosmosClient on `globalThis` with static container references, drastically reducing API response times and preventing DB connection exhaust during hot-reloads.

## 🛠️ Local Setup & Installation

### Prerequisites

- Node.js (v18+ recommended)
- An Azure Cosmos DB account (NoSQL API)
- A Gmail account for Nodemailer (with "App Passwords" enabled)

### Environment Variables

Create a `.env.local` file in the root directory and add the following keys. These are critical for the app to function properly:

```env
# Azure Cosmos DB Configuration
COSMOS_ENDPOINT="your_cosmos_db_uri"
COSMOS_KEY="your_cosmos_db_primary_key"

# Email Configuration (Nodemailer for OTPs and Reminders)
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_app_password"
```

### Running the Development Server

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd Sathi
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

_Built for the Hackathon._
