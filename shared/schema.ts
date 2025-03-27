import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Define step types
export const StepTypes = {
  START: 'start',
  END: 'end',
  API_CALL: 'api_call',
  EMAIL: 'email',
  TEXT_BOX: 'text_box',
  CONDITION: 'condition',
} as const;

export type StepType = typeof StepTypes[keyof typeof StepTypes];

// Define the status of a workflow
export const WorkflowStatus = {
  DRAFT: 'draft',
  PASSED: 'passed',
  FAILED: 'failed',
} as const;

export type WorkflowStatusType = typeof WorkflowStatus[keyof typeof WorkflowStatus];

// Define the schema for a step
export const stepSchema = z.object({
  id: z.string(),
  type: z.enum([
    StepTypes.START,
    StepTypes.END,
    StepTypes.API_CALL,
    StepTypes.EMAIL,
    StepTypes.TEXT_BOX,
    StepTypes.CONDITION,
  ]),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.record(z.any()).optional(),
});

export type Step = z.infer<typeof stepSchema>;

// Define the schema for a connection between steps
export const connectionSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

export type Connection = z.infer<typeof connectionSchema>;

// Define the schema for a workflow
export const workflows = pgTable("workflows", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  steps: jsonb("steps").notNull().$type<Step[]>(),
  connections: jsonb("connections").notNull().$type<Connection[]>(),
  status: text("status").notNull().$type<WorkflowStatusType>(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  lastRunAt: timestamp("last_run_at"),
});

export const insertWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  createdAt: true,
  lastRunAt: true,
});

export const updateWorkflowSchema = createInsertSchema(workflows).omit({
  id: true,
  userId: true,
  createdAt: true,
});

export type InsertWorkflow = z.infer<typeof insertWorkflowSchema>;
export type UpdateWorkflow = z.infer<typeof updateWorkflowSchema>;
export type Workflow = typeof workflows.$inferSelect;

// Define the execution history
export const workflowExecutions = pgTable("workflow_executions", {
  id: serial("id").primaryKey(),
  workflowId: integer("workflow_id").notNull().references(() => workflows.id),
  status: text("status").notNull().$type<WorkflowStatusType>(),
  logs: jsonb("logs").notNull(),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

export const insertWorkflowExecutionSchema = createInsertSchema(workflowExecutions).omit({
  id: true,
  executedAt: true,
});

export type InsertWorkflowExecution = z.infer<typeof insertWorkflowExecutionSchema>;
export type WorkflowExecution = typeof workflowExecutions.$inferSelect;
