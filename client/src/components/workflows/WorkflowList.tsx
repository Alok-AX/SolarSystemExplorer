import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { WorkflowListItem } from './WorkflowListItem';
import { ExecuteWorkflowModal } from './ExecuteWorkflowModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';
import { Workflow } from '@shared/schema';
import { Loader2, Plus, Search } from 'lucide-react';

export function WorkflowList() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<number | null>(null);
  const [isExecuteModalOpen, setIsExecuteModalOpen] = useState(false);
  const { toast } = useToast();
  
  const { data: workflows, isLoading } = useQuery<Workflow[]>({
    queryKey: ['/api/workflows'],
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCreateWorkflow = () => {
    setLocation('/create');
  };

  const handleEditWorkflow = (id: number) => {
    setLocation(`/edit/${id}`);
  };

  const handleExecuteWorkflow = (id: number) => {
    setSelectedWorkflowId(id);
    setIsExecuteModalOpen(true);
  };

  const handleConfirmExecution = async () => {
    if (selectedWorkflowId) {
      try {
        await apiRequest('POST', `/api/workflows/${selectedWorkflowId}/execute`, {});
        toast({
          title: "Workflow Execution Started",
          description: "The workflow is now running.",
        });
        
        // Invalidate workflows to refresh the list
        queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      } catch (error: any) {
        toast({
          title: "Execution Failed",
          description: error.message || "Could not execute the workflow.",
          variant: "destructive",
        });
      }
    }
    setIsExecuteModalOpen(false);
  };

  const filteredWorkflows = workflows?.filter(workflow => 
    workflow.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    workflow.id.toString().includes(searchQuery)
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
        <div className="relative max-w-xs w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="-ml-1 mr-2 h-5 w-5" />
          Create Workflow
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredWorkflows && filteredWorkflows.length > 0 ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredWorkflows.map((workflow) => (
              <WorkflowListItem
                key={workflow.id}
                workflow={workflow}
                onEdit={handleEditWorkflow}
                onExecute={handleExecuteWorkflow}
              />
            ))}
          </ul>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
          <p className="text-gray-500">No workflows found</p>
        </div>
      )}

      <ExecuteWorkflowModal
        open={isExecuteModalOpen}
        onClose={() => setIsExecuteModalOpen(false)}
        onConfirm={handleConfirmExecution}
      />
    </div>
  );
}
