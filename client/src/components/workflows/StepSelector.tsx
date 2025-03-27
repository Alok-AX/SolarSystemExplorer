import { StepTypes } from '@shared/schema';
import { Code, Mail, Type, Check } from 'lucide-react';

interface StepOption {
  type: string;
  label: string;
  icon: React.ReactNode;
  bgColor: string;
  iconColor: string;
}

interface StepSelectorProps {
  onAddStep: (type: string) => void;
}

export function StepSelector({ onAddStep }: StepSelectorProps) {
  const stepOptions: StepOption[] = [
    {
      type: StepTypes.API_CALL,
      label: 'API Call',
      icon: <Code className="h-5 w-5" />,
      bgColor: 'bg-primary/20',
      iconColor: 'text-primary',
    },
    {
      type: StepTypes.EMAIL,
      label: 'Email',
      icon: <Mail className="h-5 w-5" />,
      bgColor: 'bg-secondary/20',
      iconColor: 'text-secondary',
    },
    {
      type: StepTypes.TEXT_BOX,
      label: 'Text Box',
      icon: <Type className="h-5 w-5" />,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      type: StepTypes.CONDITION,
      label: 'Condition',
      icon: <Check className="h-5 w-5" />,
      bgColor: 'bg-gray-200',
      iconColor: 'text-gray-600',
    },
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-base font-medium text-gray-900 mb-4">Add Step</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stepOptions.map((option) => (
          <div
            key={option.type}
            className="border border-gray-300 rounded-md p-3 hover:border-primary hover:bg-primary/5 cursor-pointer"
            onClick={() => onAddStep(option.type)}
          >
            <div className="flex items-center space-x-3">
              <div className={`${option.bgColor} ${option.iconColor} p-2 rounded`}>
                {option.icon}
              </div>
              <span className="text-sm font-medium">{option.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
