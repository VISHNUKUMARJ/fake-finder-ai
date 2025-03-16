
import { useState, useEffect } from "react";
import { DetectionMethod } from "@/types/detection";

export function useDetectionMethods(methods: DetectionMethod[]) {
  const [methodResults, setMethodResults] = useState<Record<string, { score: number, complete: boolean }>>({});
  
  // Reset method results when dependencies change
  useEffect(() => {
    const initialResults: Record<string, { score: number, complete: boolean }> = {};
    methods.forEach(method => {
      initialResults[method.name] = { score: 0, complete: false };
    });
    setMethodResults(initialResults);
  }, [methods]);
  
  const simulateMethodAnalysis = (methodName: string, duration: number) => {
    return new Promise<{score: number, issues?: string[]}>((resolve) => {
      // Simulate method-specific detection
      const interval = setInterval(() => {
        setMethodResults(prev => {
          const methodProgress = prev[methodName].score + (100 / (duration / 100));
          if (methodProgress >= 100) {
            clearInterval(interval);
            return {
              ...prev,
              [methodName]: { score: 100, complete: true }
            };
          }
          return {
            ...prev,
            [methodName]: { ...prev[methodName], score: methodProgress }
          };
        });
      }, 100);
      
      // Resolve after the duration with a manipulation score and possible issues
      setTimeout(() => {
        const manipulationScore = Math.random() * 100;
        let issues: string[] = [];
        
        // Generate method-specific issues based on the method and if score is high
        if (manipulationScore > 65) {
          issues.push("Generated issue for " + methodName);
        }
        
        resolve({ score: manipulationScore, issues });
      }, duration);
    });
  };
  
  return { methodResults, setMethodResults, simulateMethodAnalysis };
}
