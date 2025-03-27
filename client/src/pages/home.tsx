import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { WorkflowList } from '@/components/workflows/WorkflowList';
import { WorkflowCreatorWrapper } from '@/components/workflows/WorkflowCreator';
import { useLocation } from 'wouter';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  const [location] = useLocation();
  
  // Determine which tab to activate based on the current path
  const getActiveTab = () => {
    if (location.startsWith('/create') || location.startsWith('/edit')) {
      return 'create';
    } else if (location.startsWith('/history')) {
      return 'history';
    }
    return 'list';
  };

  // Extract workflowId from path if in edit mode
  const getWorkflowId = () => {
    if (location.startsWith('/edit/')) {
      return location.split('/edit/')[1];
    }
    return undefined;
  };

  return (
    <AppLayout>
      <Tabs defaultValue={getActiveTab()} className="w-full">
        <TabsList className="mb-4 border-b border-gray-200 w-full justify-start space-x-8 bg-transparent">
          <TabsTrigger 
            value="list" 
            className="border-primary data-[state=active]:text-primary data-[state=active]:border-b-2 border-transparent pb-2 px-1 font-medium rounded-none hover:text-gray-700"
          >
            Workflow List
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="border-primary data-[state=active]:text-primary data-[state=active]:border-b-2 border-transparent pb-2 px-1 font-medium rounded-none hover:text-gray-700"
          >
            Create Workflow
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="border-primary data-[state=active]:text-primary data-[state=active]:border-b-2 border-transparent pb-2 px-1 font-medium rounded-none hover:text-gray-700"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <WorkflowList />
        </TabsContent>

        <TabsContent value="create">
          <WorkflowCreatorWrapper workflowId={getWorkflowId()} />
        </TabsContent>

        <TabsContent value="history">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Workflow Execution History</h2>
            <p className="text-gray-500">Execution history will appear here.</p>
          </div>
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}
