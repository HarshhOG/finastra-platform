import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Prisma } from "@prisma/client";

export function getDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  return connectionString;
}

export function createPrismaClientOptions(): Prisma.PrismaClientOptions {
  const connectionString = getDatabaseUrl();

  return {
    adapter: new PrismaPg(connectionString)
  };
}
