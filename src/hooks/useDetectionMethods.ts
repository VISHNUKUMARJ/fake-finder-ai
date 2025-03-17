
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
  
  const simulateMethodAnalysis = (methodName: string, duration: number, imageFile?: File) => {
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
      
      // Determine if it's a portrait image (approximate heuristic)
      const isPortrait = imageFile?.name.toLowerCase().includes('portrait') || 
                         imageFile?.type.includes('image') || 
                         true; // For demo purposes, consider all as potential portraits
      
      // Resolve after the duration with a manipulation score and possible issues
      setTimeout(() => {
        // Bias more strongly toward detecting fake content for portrait-like images
        let manipulationScore = Math.random() * 60; // Base random score
        
        // Add significant bias for potential AI-generated portraits
        const portraitBias = isPortrait ? 30 : 0;
        const methodBias = Math.random() > 0.3 ? 10 : 0; // Additional random bias
        
        const adjustedScore = Math.min(manipulationScore + portraitBias + methodBias, 100);
        
        let issues: string[] = [];
        
        // Generate more specific issues for portrait detection
        if (adjustedScore > 65) {
          if (methodName === "Face Detection & Analysis") {
            issues.push("Detected unnatural facial symmetry and perfectionism");
            if (Math.random() > 0.5) {
              issues.push("Unnatural eye highlights and too-perfect skin texture");
            }
          } else if (methodName === "Neural Network Pattern Recognition") {
            issues.push("AI-generated pattern signatures detected");
            if (Math.random() > 0.5) {
              issues.push("Background blur patterns consistent with AI generation");
            }
          } else if (methodName === "Error Level Analysis") {
            issues.push("Inconsistent compression artifacts detected");
          } else if (methodName === "Metadata Analysis") {
            issues.push("Missing or suspicious metadata patterns");
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
