import { formatDistanceToNow, format } from 'date-fns';
import { Workflow, WorkflowStatus } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WorkflowListItemProps {
  workflow: Workflow;
  onEdit: (id: number) => void;
  onExecute: (id: number) => void;
}

export function WorkflowListItem({ workflow, onEdit, onExecute }: WorkflowListItemProps) {
  const statusBadgeClasses = {
    [WorkflowStatus.PASSED]: "bg-green-100 text-green-800",
    [WorkflowStatus.FAILED]: "bg-red-100 text-red-800",
    [WorkflowStatus.DRAFT]: "bg-gray-100 text-gray-800",
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Never';
    return format(date, 'MMM d, yyyy');
  };

  const formatLastRunTime = (date: Date | null | undefined) => {
    if (!date) return 'Never run';
    return `${formatDistanceToNow(date)} ago`;
  };

  return (
    <li className="hover:bg-gray-50">
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <p className="text-sm font-medium text-primary truncate">{workflow.name}</p>
            <span 
              className={cn(
                "px-2 inline-flex text-xs leading-5 font-semibold rounded-full",
                statusBadgeClasses[workflow.status]
              )}
            >
              {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
            </span>
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEdit(workflow.id)}
            >
              Edit
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onExecute(workflow.id)}
            >
              Execute
            </Button>
          </div>
        </div>
        <div className="mt-2 sm:flex sm:justify-between">
          <div className="sm:flex sm:space-x-4">
            <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span>Created on <time dateTime={workflow.createdAt?.toString()}>{formatDate(workflow.createdAt)}</time></span>
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
            <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{formatLastRunTime(workflow.lastRunAt)}</span>
          </div>
        </div>
      </div>
    </li>
  );
}
