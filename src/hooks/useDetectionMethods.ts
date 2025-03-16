
import { useState, useEffect } from "react";
import { DetectionMethod } from "@/types/detection";

export function useDetectionMethods(methods: DetectionMethod[]) {
  const [methodResults, setMethodResults] = useState<Record<string, { score: number, complete: boolean, manipulationScore?: number }>>({});
  
  // Reset method results when dependencies change
  useEffect(() => {
    const initialResults: Record<string, { score: number, complete: boolean }> = {};
    methods.forEach(method => {
      initialResults[method.name] = { score: 0, complete: false };
    });
    setMethodResults(initialResults);
  }, [methods]);
  
  const simulateMethodAnalysis = (methodName: string, duration: number) => {
    return new Promise<{score: number, issues?: string[], manipulationScore?: number}>((resolve) => {
      // Simulate method-specific detection
      const interval = setInterval(() => {
        setMethodResults(prev => {
          const methodProgress = prev[methodName]?.score + (100 / (duration / 100)) || 0;
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
        // Bias toward detecting fake content for demo purposes
        const manipulationScore = Math.random() * 100;
        const bias = Math.random() > 0.6 ? 20 : 0; // Add bias to increase manipulation score
        const adjustedScore = Math.min(manipulationScore + bias, 100);
        
        let issues: string[] = [];
        
        // Generate method-specific issues based on the method and if score is high
        if (adjustedScore > 65) {
          issues.push(`Detected inconsistency in ${methodName}`);
          // Add another issue with 50% probability to make detection more robust
          if (Math.random() > 0.5) {
            issues.push(`Additional anomaly found during ${methodName}`);
          }
        }
        
        resolve({ 
          score: 100, // Progress score is 100%
          manipulationScore: adjustedScore, // Actual manipulation detection score
          issues 
        });
      }, duration);
    });
  };
  
  return { methodResults, setMethodResults, simulateMethodAnalysis };
}
