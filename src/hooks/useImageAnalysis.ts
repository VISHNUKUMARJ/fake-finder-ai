
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDetectionMethods } from "@/hooks/useDetectionMethods";
import { imageDetectionMethods } from "@/components/detection/image/ImageDetectionMethods";
import { DetectionResult } from "@/types/detection";
import { useTrainableDetection } from "@/context/TrainableDetectionContext";
import { 
  analyzeWatermarks, 
  analyzeErrorLevels, 
  analyzeFaces 
} from "./image-analysis/analysis-methods";
import { processResults } from "./image-analysis/result-processor";

export function useImageAnalysis(file: File | null) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();
  const { methodResults, setMethodResults, simulateMethodAnalysis } = useDetectionMethods(imageDetectionMethods);
  const { modelState } = useTrainableDetection();
  
  // Get model information for image detection
  const imageModel = modelState.image;

  const resetAnalysis = () => {
    setResult(null);
    setProgress(0);
    setActiveMethod("");
    setIsAnalyzing(false);
    imageDetectionMethods.forEach(method => {
      setMethodResults(prev => ({
        ...prev,
        [method.name]: { score: 0, complete: false }
      }));
    });
  };

  const runAllMethods = async () => {
    if (!file) return;
    
    // Run watermark detection (prioritized method)
    await analyzeWatermarks(file, simulateMethodAnalysis, setMethodResults);
    
    // Run enhanced error level analysis
    await analyzeErrorLevels(file, simulateMethodAnalysis, setMethodResults);
    
    // Run improved face detection
    await analyzeFaces(file, simulateMethodAnalysis, setMethodResults);
    
    // Run neural network analysis
    setActiveMethod("Neural Network Pattern Recognition");
    await simulateMethodAnalysis("Neural Network Pattern Recognition", 3500, file);
    
    // Process results and calculate final detection score
    const detectionResult = processResults(
      methodResults,
      imageDetectionMethods,
      imageModel,
      file
    );
    
    setResult(detectionResult);
    
    // Show toast notification
    toast({
      title: detectionResult.isManipulated ? "AI-Generated Image Detected" : "Authentic Image",
      description: `Image analysis complete with ${detectionResult.isManipulated ? detectionResult.confidenceScore : 100 - detectionResult.confidenceScore}% confidence.`,
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setResult(null);
    
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
    handleAnalyze,
    resetAnalysis
  };
}
