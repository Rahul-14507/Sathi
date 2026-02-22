import { CosmosClient, Container } from "@azure/cosmos";

const endpoint = process.env.COSMOS_ENDPOINT || "https://localhost:8081";
const key =
  process.env.COSMOS_KEY ||
  "C2y6yDjf5/R+ob0N8A7Cgv30VRDJIWEHLM+4QDU5DE2nQ9nDuVTqobD4b8mGGyPMbIZnqyMsEcaGQy67XIw/Jw==";

import * as https from "https";

// Use a global variable to preserve the CosmosClient across hot-reloads in dev
const globalForCosmos = global as unknown as { cosmosClient: CosmosClient };

const client =
  globalForCosmos.cosmosClient ||
  new CosmosClient({
    endpoint,
    key,
    agent: new https.Agent({ rejectUnauthorized: false }), // Fixes local clock skew/SSL certificate authorization errors
  });

if (process.env.NODE_ENV !== "production")
  globalForCosmos.cosmosClient = client;

export const database = client.database("SathiDB");
export const tasksContainer = database.container("Tasks");
export const usersContainer = database.container("Users");
export const otpsContainer = database.container("OTPs");
export const communityContainer = database.container("Community");

// Helper to initialize DB (can be called on startup or first API hit)
export async function initDB() {
  // We no longer call `createIfNotExists()` on every API request.
  // The containers were already scaffolded, and calling this was adding massive latency.
  return;
}
