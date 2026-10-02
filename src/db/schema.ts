import {
  pgTable,
  uuid,
  text,
  integer,
  doublePrecision,
  timestamp,
  serial,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  emailIdx: uniqueIndex("users_email_idx").on(t.email),
  phoneIdx: uniqueIndex("users_phone_idx").on(t.phone),
}));

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  color: text("color").notNull().default("#22c55e"),
  icon: text("icon").notNull().default("dumbbell"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdx: index("categories_user_idx").on(t.userId),
}));

export const exercises = pgTable("exercises", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  nameEn: text("name_en"),
  imageUrl: text("image_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdx: index("exercises_user_idx").on(t.userId),
  categoryIdx: index("exercises_category_idx").on(t.categoryId),
}));

export const prLogs = pgTable("pr_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").notNull().references(() => exercises.id, { onDelete: "cascade" }),
  weightKg: doublePrecision("weight_kg").notNull(),
  reps: integer("reps").notNull().default(1),
  note: text("note"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  userIdx: index("pr_logs_user_idx").on(t.userId),
  exerciseIdx: index("pr_logs_exercise_idx").on(t.exerciseId),
  loggedAtIdx: index("pr_logs_logged_at_idx").on(t.loggedAt),
}));

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(users, { fields: [categories.userId], references: [users.id] }),
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  user: one(users, { fields: [exercises.userId], references: [users.id] }),
  category: one(categories, { fields: [exercises.categoryId], references: [categories.id] }),
  logs: many(prLogs),
}));

export const prLogsRelations = relations(prLogs, ({ one }) => ({
  user: one(users, { fields: [prLogs.userId], references: [users.id] }),
  exercise: one(exercises, { fields: [prLogs.exerciseId], references: [exercises.id] }),
}));

export type User = typeof users.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Exercise = typeof exercises.$inferSelect;
export type PrLog = typeof prLogs.$inferSelect;
