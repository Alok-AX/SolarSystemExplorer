import { 
  users, 
  workflows, 
  workflowExecutions, 
  User, 
  InsertUser, 
  Workflow, 
  InsertWorkflow, 
  UpdateWorkflow, 
  WorkflowExecution, 
  InsertWorkflowExecution,
  WorkflowStatus
} from "@shared/schema";

// Modify the interface with any CRUD methods
// you might need
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Workflow methods
  getWorkflows(userId: number): Promise<Workflow[]>;
  getWorkflow(id: number): Promise<Workflow | undefined>;
  createWorkflow(workflow: InsertWorkflow): Promise<Workflow>;
  updateWorkflow(id: number, workflow: UpdateWorkflow): Promise<Workflow | undefined>;
  deleteWorkflow(id: number): Promise<boolean>;

  // Workflow execution methods
  executeWorkflow(workflowId: number): Promise<WorkflowExecution>;
  getWorkflowExecutions(workflowId: number): Promise<WorkflowExecution[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workflows: Map<number, Workflow>;
  private workflowExecutions: Map<number, WorkflowExecution>;
  private userIdCounter: number;
  private workflowIdCounter: number;
  private executionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.workflows = new Map();
    this.workflowExecutions = new Map();
    this.userIdCounter = 1;
    this.workflowIdCounter = 1;
    this.executionIdCounter = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Workflow methods
  async getWorkflows(userId: number): Promise<Workflow[]> {
    return Array.from(this.workflows.values()).filter(
      (workflow) => workflow.userId === userId,
    );
  }

  async getWorkflow(id: number): Promise<Workflow | undefined> {
    return this.workflows.get(id);
  }

  async createWorkflow(insertWorkflow: InsertWorkflow): Promise<Workflow> {
    const id = this.workflowIdCounter++;
    const now = new Date();
    const workflow: Workflow = { 
      ...insertWorkflow, 
      id, 
      createdAt: now, 
      lastRunAt: null 
    };
    this.workflows.set(id, workflow);
    return workflow;
  }

  async updateWorkflow(id: number, updateWorkflow: UpdateWorkflow): Promise<Workflow | undefined> {
    const existingWorkflow = this.workflows.get(id);
    if (!existingWorkflow) return undefined;

    const updatedWorkflow: Workflow = { 
      ...existingWorkflow, 
      ...updateWorkflow 
    };
    
    this.workflows.set(id, updatedWorkflow);
    return updatedWorkflow;
  }

  async deleteWorkflow(id: number): Promise<boolean> {
    return this.workflows.delete(id);
  }

  // Workflow execution methods
  async executeWorkflow(workflowId: number): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Simulate workflow execution
    const executionSuccess = Math.random() > 0.2; // 80% success rate for simulation
    const status = executionSuccess ? WorkflowStatus.PASSED : WorkflowStatus.FAILED;
    
    // Update workflow status and last run time
    const now = new Date();
    workflow.status = status;
    workflow.lastRunAt = now;
    this.workflows.set(workflowId, workflow);
    
    // Create execution record
    const id = this.executionIdCounter++;
    const execution: WorkflowExecution = {
      id,
      workflowId,
      status,
      logs: { message: executionSuccess ? 'Workflow executed successfully' : 'Workflow execution failed' },
      executedAt: now,
    };
    
    this.workflowExecutions.set(id, execution);
    return execution;
  }

  async getWorkflowExecutions(workflowId: number): Promise<WorkflowExecution[]> {
    return Array.from(this.workflowExecutions.values()).filter(
      (execution) => execution.workflowId === workflowId,
    );
  }
}

export const storage = new MemStorage();
