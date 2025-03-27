import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertWorkflowSchema, 
  updateWorkflowSchema,
  WorkflowStatus
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Users
  app.post('/api/users', async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user with email already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email already exists' });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid user data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating user' });
      }
    }
  });

  // Workflows
  app.get('/api/workflows', async (req: Request, res: Response) => {
    try {
      // For demo purposes using a mock user ID since we don't have full auth
      const userId = 1;
      const workflows = await storage.getWorkflows(userId);
      res.json(workflows);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching workflows' });
    }
  });

  app.get('/api/workflows/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const workflow = await storage.getWorkflow(id);
      
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      res.json(workflow);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching workflow' });
    }
  });

  app.post('/api/workflows', async (req: Request, res: Response) => {
    try {
      // Set user ID (mock for demo)
      const userId = 1;
      const workflowData = {
        ...req.body,
        userId,
        status: WorkflowStatus.DRAFT
      };
      
      const validWorkflow = insertWorkflowSchema.parse(workflowData);
      const workflow = await storage.createWorkflow(validWorkflow);
      res.status(201).json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid workflow data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error creating workflow' });
      }
    }
  });

  app.put('/api/workflows/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const workflowData = updateWorkflowSchema.parse(req.body);
      
      const workflow = await storage.updateWorkflow(id, workflowData);
      
      if (!workflow) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      res.json(workflow);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid workflow data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Error updating workflow' });
      }
    }
  });

  app.delete('/api/workflows/:id', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteWorkflow(id);
      
      if (!success) {
        return res.status(404).json({ message: 'Workflow not found' });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting workflow' });
    }
  });

  app.post('/api/workflows/:id/execute', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const execution = await storage.executeWorkflow(id);
      res.status(200).json(execution);
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Error executing workflow' });
      }
    }
  });

  app.get('/api/workflows/:id/executions', async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const executions = await storage.getWorkflowExecutions(id);
      res.json(executions);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching workflow executions' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
