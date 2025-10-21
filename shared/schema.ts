import { sql } from "drizzle-orm";
import { pgTable, text, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Keyword analysis types
export interface KeywordData {
  primaryKeyword: string;
  subKeywords: string[];
  companyName: string;
}

export interface PrimaryKeywordAnalysis {
  keyword: string;
  inFirstParagraph: boolean;
  inFirstHeading: boolean;
  inLastHeading: boolean;
  inLastParagraph: boolean;
  currentCount: number;
  currentPercentage: number;
  targetPercentage: { min: number; max: number };
  targetCount: { min: number; max: number };
}

export interface SubKeywordAnalysis {
  keyword: string;
  inH2Heading: boolean;
  inSameH2Paragraph: boolean;
  h2HeadingsContaining: string[];
  currentCount: number;
  currentPercentage: number;
  targetPercentage: { min: number; max: number };
  targetCount: { min: number; max: number };
}

export interface CompanyNameAnalysis {
  name: string;
  currentCount: number;
  currentPercentage: number;
  targetPercentage: { min: number; max: number };
  targetCount: { min: number; max: number };
}
