import { useMemo } from "react";
import { Handle, Position } from "reactflow";
import { StepTypes } from '@shared/schema';
import { Button } from "@/components/ui/button";
import { X, Code, Mail, Type } from "lucide-react";

// Start Node
export function StartNode({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center">
      <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="mt-2 text-sm text-gray-600">Start</span>
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
}

// End Node
export function EndNode({ data }: { data: any }) {
  return (
    <div className="flex flex-col items-center">
      <Handle type="target" position={Position.Top} id="in" />
      <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
        </svg>
      </div>
      <span className="mt-2 text-sm text-gray-600">End</span>
    </div>
  );
}

// API Call Node
export function ApiCallNode({ data, selected, id }: { data: any, selected: boolean, id: string }) {
  const onDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} id="in" />
      <div className={`w-48 bg-white border ${selected ? 'border-primary' : 'border-gray-300'} rounded-lg shadow-sm p-3`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center">
            <span className="bg-primary/20 text-primary p-1 rounded mr-2">
              <Code className="h-4 w-4" />
            </span>
            API Call
          </span>
          <Button size="icon" variant="ghost" className="h-5 w-5 text-gray-400 hover:text-gray-600" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-2">Endpoint:</span>
            <span className="truncate">{data.endpoint || 'https://api.example.com'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-2">Method:</span>
            <span>{data.method || 'GET'}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
}

// Email Node
export function EmailNode({ data, selected, id }: { data: any, selected: boolean, id: string }) {
  const onDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} id="in" />
      <div className={`w-48 bg-white border ${selected ? 'border-primary' : 'border-gray-300'} rounded-lg shadow-sm p-3`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center">
            <span className="bg-secondary/20 text-secondary p-1 rounded mr-2">
              <Mail className="h-4 w-4" />
            </span>
            Email
          </span>
          <Button size="icon" variant="ghost" className="h-5 w-5 text-gray-400 hover:text-gray-600" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-2">To:</span>
            <span className="truncate">{data.to || 'recipient@example.com'}</span>
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium mr-2">Subject:</span>
            <span>{data.subject || 'Workflow Notification'}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
}

// Text Box Node
export function TextBoxNode({ data, selected, id }: { data: any, selected: boolean, id: string }) {
  const onDelete = () => {
    if (data.onDelete) {
      data.onDelete(id);
    }
  };

  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} id="in" />
      <div className={`w-48 bg-white border ${selected ? 'border-primary' : 'border-gray-300'} rounded-lg shadow-sm p-3`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium flex items-center">
            <span className="bg-purple-100 text-purple-600 p-1 rounded mr-2">
              <Type className="h-4 w-4" />
            </span>
            Text Box
          </span>
          <Button size="icon" variant="ghost" className="h-5 w-5 text-gray-400 hover:text-gray-600" onClick={onDelete}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-xs text-gray-500">
            <span className="truncate">{data.text || 'Enter text here'}</span>
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="out" />
    </div>
  );
}

// Custom node type components mapping
export const nodeTypes = {
  [StepTypes.START]: StartNode,
  [StepTypes.END]: EndNode,
  [StepTypes.API_CALL]: ApiCallNode,
  [StepTypes.EMAIL]: EmailNode,
  [StepTypes.TEXT_BOX]: TextBoxNode,
};
