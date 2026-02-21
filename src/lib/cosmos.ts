import { CosmosClient, Container } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT || "https://localhost:8081";
const key =
  process.env.COSMOS_KEY ||
  "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";

// Initialize connection safely so it doesn't crash on build without env vars
const client = new CosmosClient({ endpoint, key });

export const database = client.database("SathiDB");
let tasksContainer: Container;
let usersContainer: Container;
let otpsContainer: Container;
let communityContainer: Container;

// Export initialized containers for use in API routes
export { tasksContainer, usersContainer, otpsContainer, communityContainer };

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

    const { container: tContainer } = await db.containers.createIfNotExists({
      id: "Tasks",
      partitionKey: { paths: ["/userId"] },
    });
    tasksContainer = tContainer;

    const { container: uContainer } = await db.containers.createIfNotExists({
      id: "Users",
      partitionKey: { paths: ["/sectionId"] },
    });
    usersContainer = uContainer;

    const { container: oContainer } = await db.containers.createIfNotExists({
      id: "OTPs",
      partitionKey: { paths: ["/email"] },
      defaultTtl: 600, // 10 minute expiry
    });
    otpsContainer = oContainer;

    const { container: commContainer } = await db.containers.createIfNotExists({
      id: "Community",
      partitionKey: { paths: ["/category"] },
    });
    communityContainer = commContainer;

    console.log(
      "✅ Cosmos DB initialized: SathiDB / Tasks, Users, OTPs, Community",
    );
  } catch (err) {
    console.error("❌ Failed to initialize Cosmos DB:", err);
  }
}
