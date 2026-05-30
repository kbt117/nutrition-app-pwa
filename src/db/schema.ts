import { pgTable, serial, text, timestamp, integer, real } from "drizzle-orm/pg-core";

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  resultCount: integer("result_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedFoods = pgTable("saved_foods", {
  id: serial("id").primaryKey(),
  fdcId: integer("fdc_id").notNull(),
  description: text("description").notNull(),
  brandOwner: text("brand_owner"),
  calories: real("calories"),
  protein: real("protein"),
  totalFat: real("total_fat"),
  carbohydrates: real("carbohydrates"),
  fiber: real("fiber"),
  sugar: real("sugar"),
  sodium: real("sodium"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});
import { pgTable, serial, text, timestamp, integer, real } from "drizzle-orm/pg-core";

export const searchHistory = pgTable("search_history", {
  id: serial("id").primaryKey(),
  query: text("query").notNull(),
  resultCount: integer("result_count").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedFoods = pgTable("saved_foods", {
  id: serial("id").primaryKey(),
  fdcId: integer("fdc_id").notNull(),
  description: text("description").notNull(),
  brandOwner: text("brand_owner"),
  calories: real("calories"),
  protein: real("protein"),
  totalFat: real("total_fat"),
  carbohydrates: real("carbohydrates"),
  fiber: real("fiber"),
  sugar: real("sugar"),
  sodium: real("sodium"),
  savedAt: timestamp("saved_at").defaultNow().notNull(),
});
