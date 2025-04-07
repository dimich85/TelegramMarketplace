import { pgTable, text, serial, integer, boolean, timestamp, jsonb, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegramId: integer("telegram_id").notNull().unique(),
  username: text("username"),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  photoUrl: text("photo_url"),
  balance: real("balance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  balance: true,
});

// Services table
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  icon: text("icon").notNull(),
  available: boolean("available").notNull().default(true),
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // 'topup' or 'purchase'
  amount: real("amount").notNull(),
  description: text("description").notNull(),
  serviceId: integer("service_id"),
  reference: text("reference"), // payment reference
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
});

// IP Check results table
export const ipChecks = pgTable("ip_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ipAddress: text("ip_address").notNull(),
  country: text("country"),
  city: text("city"),
  isp: text("isp"),
  isSpam: boolean("is_spam"),
  isBlacklisted: boolean("is_blacklisted"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertIpCheckSchema = createInsertSchema(ipChecks).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type IpCheck = typeof ipChecks.$inferSelect;
export type InsertIpCheck = z.infer<typeof insertIpCheckSchema>;

// Таблица Phone Check результатов
export const phoneChecks = pgTable("phone_checks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  phoneNumber: text("phone_number").notNull(),
  country: text("country"),
  operator: text("operator"),
  isActive: boolean("is_active"),
  isSpam: boolean("is_spam"),
  isVirtual: boolean("is_virtual"),
  fraudScore: integer("fraud_score"),
  details: jsonb("details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPhoneCheckSchema = createInsertSchema(phoneChecks).omit({
  id: true,
  createdAt: true,
});

export type PhoneCheck = typeof phoneChecks.$inferSelect;
export type InsertPhoneCheck = z.infer<typeof insertPhoneCheckSchema>;

// DTO schemas for API requests/responses
export const topUpSchema = z.object({
  amount: z.number().min(10),
});

export const ipCheckRequestSchema = z.object({
  ipAddress: z.string().ip(),
});

export const phoneCheckRequestSchema = z.object({
  phoneNumber: z.string().min(8).max(15),
});

export const purchaseServiceSchema = z.object({
  serviceId: z.number().int().positive(),
});

export type TopUpRequest = z.infer<typeof topUpSchema>;
export type IpCheckRequest = z.infer<typeof ipCheckRequestSchema>;
export type PhoneCheckRequest = z.infer<typeof phoneCheckRequestSchema>;
export type PurchaseServiceRequest = z.infer<typeof purchaseServiceSchema>;
