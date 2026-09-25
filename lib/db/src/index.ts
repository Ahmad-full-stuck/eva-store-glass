import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg, { type Pool } from "pg";
import * as schema from "./schema";

export { z } from "zod";

export type Database = NodePgDatabase<typeof schema>;

const configuredUrl = process.env.DATABASE_URL?.trim() || undefined;
let poolInstance: Pool | undefined;
let databaseInstance: Database | undefined;

export const isDatabaseConfigured = Boolean(configuredUrl);

export function getPool(): Pool {
  if (!configuredUrl) {
    throw new Error("DATABASE_URL is required to create a database pool");
  }
  poolInstance ??= new pg.Pool({ connectionString: configuredUrl });
  return poolInstance;
}

export function getDb(): Database {
  databaseInstance ??= drizzle(getPool(), { schema });
  return databaseInstance;
}

export const pool = configuredUrl ? getPool() : undefined;
export const db = configuredUrl ? getDb() : undefined;

export * from "./schema";
