
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

interface ResultExplanationProps {
  title: string;
  methods: { name: string; description: string }[];
}

export const ResultExplanation = ({ title, methods }: ResultExplanationProps) => {
  return (
    <div className="mt-6">
      <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
        <Info className="h-5 w-5 text-blue-500" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <p className="mb-2">Our AI analyzes multiple factors to detect manipulation:</p>
          <ul className="list-disc pl-5 space-y-1">
            {methods.map((method, index) => (
              <li key={index}><strong>{method.name}:</strong> {method.description}</li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};
