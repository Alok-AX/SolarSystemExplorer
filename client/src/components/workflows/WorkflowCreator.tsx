import { useCallback, useEffect, useState, useRef } from 'react';
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  addEdge,
  Connection,
  ReactFlowProvider,
  useReactFlow,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { nodeTypes } from './NodeTypes';
import { StepSelector } from './StepSelector';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { StepTypes, WorkflowStatus } from '@shared/schema';
import { v4 as uuidv4 } from 'uuid';
import { Loader2, Save } from 'lucide-react';

// Default node positions
const DEFAULT_START_NODE_POSITION = { x: 250, y: 50 };
const DEFAULT_END_NODE_POSITION = { x: 250, y: 400 };
const VERTICAL_NODE_SPACING = 120;

const formSchema = z.object({
  name: z.string().min(3, { message: "Workflow name must be at least 3 characters" }),
});

type FormValues = z.infer<typeof formSchema>;

interface WorkflowCreatorProps {
  workflowId?: string;
}

export function WorkflowCreator({ workflowId }: WorkflowCreatorProps) {
  const [isEditMode] = useState(!!workflowId);
  const [isLoading, setIsLoading] = useState(isEditMode);
  const [isSaving, setIsSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { project } = useReactFlow();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  // Initialize flow with default nodes on mount
  useEffect(() => {
    if (!isEditMode) {
      // Add start and end nodes by default
      const initialNodes: Node[] = [
        {
          id: 'start',
          type: StepTypes.START,
          position: DEFAULT_START_NODE_POSITION,
          data: {},
        },
        {
          id: 'end',
          type: StepTypes.END,
          position: DEFAULT_END_NODE_POSITION,
          data: {},
        },
      ];

      setNodes(initialNodes);
    } else if (workflowId) {
      // Fetch workflow data when in edit mode
      const fetchWorkflow = async () => {
        try {
          const response = await fetch(`/api/workflows/${workflowId}`);
          if (!response.ok) throw new Error('Failed to fetch workflow');
          
          const workflow = await response.json();
          
          // Set form values
          form.setValue('name', workflow.name);
          
          // Set nodes and edges from workflow data
          if (workflow.steps && Array.isArray(workflow.steps)) {
            const flowNodes = workflow.steps.map((step: any) => ({
              id: step.id,
              type: step.type,
              position: step.position,
              data: { 
                ...step.data,
                onDelete: handleDeleteNode
              },
            }));
            setNodes(flowNodes);
          }
          
          if (workflow.connections && Array.isArray(workflow.connections)) {
            setEdges(workflow.connections);
          }
          
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to load workflow',
            variant: 'destructive',
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchWorkflow();
    }
  }, [isEditMode, workflowId, form, setNodes, setEdges, toast]);

  // Update nodes with onDelete handler after loading
  useEffect(() => {
    if (nodes.length > 0) {
      setNodes(nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          onDelete: handleDeleteNode
        }
      })));
    }
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
    setEdges((edges) => edges.filter((edge) => edge.source !== id && edge.target !== id));
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(
        { 
          ...connection, 
          id: `e${connection.source}-${connection.target}` 
        }, 
        eds
      ));
    },
    [setEdges]
  );

  const handleAddStep = (type: string) => {
    // Calculate position for new node
    const nodeCount = nodes.filter(node => node.id !== 'start' && node.id !== 'end').length;
    const newNodeId = uuidv4();
    
    // Create new node
    const newNode: Node = {
      id: newNodeId,
      type,
      position: {
        x: 250,
        y: DEFAULT_START_NODE_POSITION.y + VERTICAL_NODE_SPACING * (nodeCount + 1),
      },
      data: {
        onDelete: handleDeleteNode,
      },
    };
    
    // Insert the new node and adjust end node position
    setNodes(nodes => {
      const endNode = nodes.find(node => node.id === 'end');
      if (endNode) {
        // Move end node down
        const updatedNodes = nodes.map(node => {
          if (node.id === 'end') {
            return {
              ...node,
              position: {
                ...node.position,
                y: DEFAULT_START_NODE_POSITION.y + VERTICAL_NODE_SPACING * (nodeCount + 2),
              },
            };
          }
          return node;
        });
        return [...updatedNodes, newNode];
      }
      return [...nodes, newNode];
    });
  };

  const onSave = async (values: FormValues) => {
    setIsSaving(true);
    
    try {
      // Convert nodes and edges to the format expected by the API
      const workflowData = {
        name: values.name,
        steps: nodes.map(node => ({
          id: node.id,
          type: node.type,
          position: node.position,
          data: { ...node.data, onDelete: undefined },
        })),
        connections: edges,
        status: WorkflowStatus.DRAFT,
      };
      
      if (isEditMode && workflowId) {
        // Update existing workflow
        await apiRequest('PUT', `/api/workflows/${workflowId}`, workflowData);
        toast({
          title: 'Success',
          description: 'Workflow updated successfully',
        });
      } else {
        // Create new workflow
        await apiRequest('POST', '/api/workflows', workflowData);
        toast({
          title: 'Success',
          description: 'Workflow created successfully',
        });
      }
      
      // Invalidate workflows query to update the list
      queryClient.invalidateQueries({ queryKey: ['/api/workflows'] });
      
      // Navigate back to workflows list
      setLocation('/');
      
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save workflow',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const onCancel = () => {
    setLocation('/');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-900">
          {isEditMode ? 'Edit Workflow' : 'Create New Workflow'}
        </h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSave)}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Form {...form}>
          <form className="mb-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workflow Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter workflow name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <div 
          className="relative bg-[#F5F5E9] border border-gray-300 rounded-lg h-[500px] overflow-hidden"
          ref={reactFlowWrapper}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            deleteKeyCode={['Backspace', 'Delete']}
            snapToGrid
            snapGrid={[15, 15]}
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
      </div>

      <StepSelector onAddStep={handleAddStep} />
    </div>
  );
}

// Wrapper component with ReactFlowProvider
export function WorkflowCreatorWrapper(props: WorkflowCreatorProps) {
  return (
    <ReactFlowProvider>
      <WorkflowCreator {...props} />
    </ReactFlowProvider>
  );
}
