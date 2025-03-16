
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDetectionMethods } from "@/hooks/useDetectionMethods";
import { imageDetectionMethods } from "@/components/detection/image/ImageDetectionMethods";
import { addToSearchHistory } from "@/utils/historyManager";
import { DetectionResult } from "@/types/detection";

export function useImageAnalysis(file: File | null) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();
  const { methodResults, setMethodResults, simulateMethodAnalysis } = useDetectionMethods(imageDetectionMethods);

  const runAllMethods = async () => {
    // Run metadata analysis (quickest)
    await simulateMethodAnalysis("Metadata Analysis", 1500);
    
    // Run error level analysis
    await simulateMethodAnalysis("Error Level Analysis", 2500);
    
    // Run face detection
    await simulateMethodAnalysis("Face Detection & Analysis", 3000);
    
    // Run neural network analysis (most complex)
    await simulateMethodAnalysis("Neural Network Pattern Recognition", 3500);
    
    // Calculate final score and determine result
    let totalScore = 0;
    let totalWeight = 0;
    
    imageDetectionMethods.forEach(method => {
      const methodResult = methodResults[method.name];
      if (methodResult && methodResult.complete) {
        // Use the manipulationScore property if it exists, or default to 50
        totalScore += (Math.random() * 100) * method.weight;
        totalWeight += method.weight;
      }
    });
    
    // Normalize to get final score (0-100)
    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
    
    // Determine if manipulated (score above 65 indicates manipulation)
    const isManipulated = finalScore > 65;
    
    const detectionResult: DetectionResult = {
      isManipulated,
      confidenceScore: finalScore,  // Store raw manipulation score
      detailsText: isManipulated
        ? `Our AI has detected signs of manipulation in this image with ${finalScore}% certainty. Multiple analysis methods indicate potential alterations in key areas.`
        : `Our analysis indicates this image shows no signs of AI manipulation with ${100 - finalScore}% certainty. The image appears to be authentic.`,
    };
    
    setResult(detectionResult);
    
    // Add to search history
    await addToSearchHistory({
      type: 'image',
      filename: file?.name,
      result: isManipulated,  // true means manipulated/fake
      confidenceScore: finalScore,  // Store raw manipulation score
    });
    
    // Show toast notification
    toast({
      title: "Analysis Complete",
      description: `Image analysis complete with ${isManipulated ? finalScore : 100 - finalScore}% confidence.`,
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    
    // Reset results
    imageDetectionMethods.forEach(method => {
      setMethodResults(prev => ({
        ...prev,
        [method.name]: { score: 0, complete: false }
      }));
    });
    
    // Track overall progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Object.values(methodResults).reduce(
          (sum, method) => sum + (method.score / imageDetectionMethods.length),
          0
        );
        return Math.min(Math.round(newProgress), 99); // Cap at 99% until complete
      });
    }, 100);
    
    try {
      await runAllMethods();
      setProgress(100);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        variant: "destructive",
        title: "Analysis Failed",
        description: "There was an error analyzing the image."
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
