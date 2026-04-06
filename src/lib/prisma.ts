import { Prisma, PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env.DATABASE_URL;

const prismaOptions: Prisma.PrismaClientOptions = {
  ...(databaseUrl ? { adapter: new PrismaPg({ connectionString: databaseUrl }) } : {}),
  log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
