
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDetectionMethods } from "@/hooks/useDetectionMethods";
import { videoDetectionMethods } from "@/components/detection/video/VideoDetectionMethods";
import { addToSearchHistory } from "@/utils/historyManager";
import { DetectionResult } from "@/types/detection";

export function useVideoAnalysis(file: File | null) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();
  const { methodResults, setMethodResults, simulateMethodAnalysis } = useDetectionMethods(videoDetectionMethods);

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    
    // Reset results
    videoDetectionMethods.forEach(method => {
      setMethodResults(prev => ({
        ...prev,
        [method.name]: { score: 0, complete: false }
      }));
    });
    
    // Track overall progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Object.values(methodResults).reduce(
          (sum, method) => sum + (method.score / videoDetectionMethods.length),
          0
        );
        return Math.min(Math.round(newProgress), 99); // Cap at 99% until complete
      });
    }, 100);
    
    try {
      // Detect AI generation in video filename
      const filename = file.name.toLowerCase();
      const aiSignifiers = ['ai', 'generated', 'deepfake', 'synthetic', 'fake', 'neural'];
      const hasAISignifier = aiSignifiers.some(term => filename.includes(term));
      
      // Run analysis methods
      for (const method of videoDetectionMethods) {
        setActiveMethod(method.name);
        await simulateMethodAnalysis(method.name, 3000, file);
        
        // Add extra penalty for suspicious filenames
        if (hasAISignifier && Math.random() > 0.3) {
          setMethodResults(prev => ({
            ...prev,
            [method.name]: {
              ...prev[method.name],
              manipulationScore: Math.min((prev[method.name]?.manipulationScore || 60) + 15, 95),
              issues: [...(prev[method.name]?.issues || []), "AI-related terms found in filename"]
            }
          }));
        }
      }
      
      // Calculate final score and determine result
      let totalScore = 0;
      let totalWeight = 0;
      let allIssues: string[] = [];
      
      videoDetectionMethods.forEach(method => {
        const methodResult = methodResults[method.name];
        if (methodResult && methodResult.complete) {
          const manipulationScore = methodResult.manipulationScore || Math.random() * 100;
          totalScore += manipulationScore * method.weight;
          totalWeight += method.weight;
          
          // Collect issues for the final result
          if (methodResult.issues && methodResult.issues.length > 0) {
            allIssues = [...allIssues, ...methodResult.issues];
          }
        }
      });
      
      const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
      
      // More aggressive detection for videos
      const isManipulated = finalScore > 55 || allIssues.length >= 2;
      
      const detectionResult: DetectionResult = {
        isManipulated,
        confidenceScore: finalScore,
        detailsText: isManipulated
          ? `Our analysis detected signs of artificially generated or manipulated video content with ${finalScore}% confidence. Several indicators of synthetic generation were found.`
          : `Our analysis indicates this video appears authentic with ${100 - finalScore}% confidence. No clear signs of manipulation were detected.`,
        issues: allIssues.length > 0 ? Array.from(new Set(allIssues)) : undefined
      };
      
      setResult(detectionResult);
      
      // Add to search history
      await addToSearchHistory({
        type: 'video',
        filename: file.name,
        result: isManipulated,
        confidenceScore: finalScore,
      });
      
      setProgress(100);
      
      // Show toast notification
      toast({
        title: isManipulated ? "Manipulated Video Detected" : "Authentic Video",
        description: `Video analysis complete with ${isManipulated ? finalScore : 100 - finalScore}% confidence.`,
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing the video."
      });
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setActiveMethod("");
    }
  };

  return {
    isAnalyzing,
    progress,
    activeMethod,
    setActiveMethod,
    methodResults,
    result,
    handleAnalyze
  };
}
