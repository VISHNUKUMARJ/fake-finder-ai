
import { Progress } from "@/components/ui/progress";
import { DetectionMethod } from "@/types/detection";

interface AnalysisProgressProps {
  progress: number;
  activeMethod: string;
  methodResults: Record<string, { score: number, complete: boolean, manipulationScore?: number }>;
  methods: DetectionMethod[];
}

export const AnalysisProgress = ({ 
  progress, 
  activeMethod, 
  methodResults, 
  methods 
}: AnalysisProgressProps) => {
  return (
    <div className="mt-6 space-y-4">
      <Progress value={progress} className="h-2" />
      <p className="text-center text-sm text-muted-foreground">
        Analyzing... {progress}%
      </p>
      
      <div className="space-y-2 mt-4">
        {methods.map((method) => (
          <div key={method.name} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className={`${activeMethod === method.name ? 'font-bold text-primary' : ''}`}>
                {method.name}
              </span>
              <span>
                {methodResults[method.name]?.score.toFixed(0)}%
              </span>
            </div>
            <Progress 
              value={methodResults[method.name]?.score || 0}
              className={`h-1 ${activeMethod === method.name ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-800'}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
