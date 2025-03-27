import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { Workflow, WorkflowStatus } from '@shared/schema';
import { useAuth } from '@/components/auth/AuthProvider';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface WorkflowContextProps {
  workflows: Workflow[];
  isLoading: boolean;
  executeWorkflow: (id: number) => Promise<void>;
  createWorkflow: (workflow: Partial<Workflow>) => Promise<void>;
  updateWorkflow: (id: number, workflow: Partial<Workflow>) => Promise<void>;
  getWorkflow: (id: number) => Workflow | undefined;
}

const WorkflowContext = createContext<WorkflowContextProps>({
  workflows: [],
  isLoading: false,
  executeWorkflow: async () => {},
  createWorkflow: async () => {},
  updateWorkflow: async () => {},
  getWorkflow: () => undefined,
});

export const useWorkflow = () => useContext(WorkflowContext);

interface WorkflowProviderProps {
  children: ReactNode;
}

export function WorkflowProvider({ children }: WorkflowProviderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const {
    data: workflows = [],
    isLoading,
    refetch,
  } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows'],
    enabled: !!user,
  });

  const executeWorkflow = async (id: number) => {
    try {
      await apiRequest('POST', `/api/workflows/${id}/execute`, {});
      refetch();
      toast({
        title: 'Workflow Executed',
        description: 'The workflow has been executed successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to execute workflow',
        variant: 'destructive',
      });
    }
  };

  const createWorkflow = async (workflow: Partial<Workflow>) => {
    try {
      await apiRequest('POST', '/api/workflows', workflow);
      refetch();
      toast({
        title: 'Workflow Created',
        description: 'The workflow has been created successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create workflow',
        variant: 'destructive',
      });
    }
  };

  const updateWorkflow = async (id: number, workflow: Partial<Workflow>) => {
    try {
      await apiRequest('PUT', `/api/workflows/${id}`, workflow);
      refetch();
      toast({
        title: 'Workflow Updated',
        description: 'The workflow has been updated successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update workflow',
        variant: 'destructive',
      });
    }
  };

  const getWorkflow = (id: number) => {
    return workflows.find(workflow => workflow.id === id);
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflows,
        isLoading,
        executeWorkflow,
        createWorkflow,
        updateWorkflow,
        getWorkflow,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}
