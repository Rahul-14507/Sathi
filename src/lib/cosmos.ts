import { CosmosClient } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT || "https://localhost:8081";
const key =
  process.env.COSMOS_KEY ||
  "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";

// Initialize connection safely so it doesn't crash on build without env vars
const client = new CosmosClient({ endpoint, key });

export const database = client.database("SathiDB");
export const tasksContainer = database.container("Tasks");
export const usersContainer = database.container("Users");

export interface TaskItem {
  id: string;
  userId: string; // The user who owns this task, or 'global' for global student tasks
  title: string;
  description?: string;
  deadline: string; // ISO String
  type: "academic" | "personal";
  priority?: "low" | "medium" | "high";
  status: "pending" | "completed";
}

// Helper to initialize DB (can be called on startup or first API hit)
export async function initDB() {
  try {
    const { database: db } = await client.databases.createIfNotExists({
      id: "SathiDB",
    });
    await db.containers.createIfNotExists({
      id: "Tasks",
      partitionKey: { paths: ["/userId"] },
    });
    await db.containers.createIfNotExists({
      id: "Users",
      partitionKey: { paths: ["/sectionId"] },
    });
    console.log("✅ Cosmos DB initialized: SathiDB / Tasks & Users");
  } catch (err) {
    console.error("❌ Failed to initialize Cosmos DB:", err);
  }
}
