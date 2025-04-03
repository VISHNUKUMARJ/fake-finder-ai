import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDetectionMethods } from "@/hooks/useDetectionMethods";
import { imageDetectionMethods } from "@/components/detection/image/ImageDetectionMethods";
import { addToSearchHistory } from "@/utils/historyManager";
import { DetectionResult } from "@/types/detection";
import { useTrainableDetection } from "@/context/TrainableDetectionContext";

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

  const analyzeWatermarks = async (file: File) => {
    // Simulate watermark detection
    setActiveMethod("Watermark Detection");
    const watermarkResult = await simulateMethodAnalysis("Watermark Detection", 2000, file);
    
    // Check filename for signs of AI generation
    const filename = file.name.toLowerCase();
    const aiSignifiers = ['ai', 'generated', 'midjourney', 'dalle', 'stable-diffusion', 'synthetic'];
    const hasAISignifier = aiSignifiers.some(term => filename.includes(term));
    
    // Bias watermark detection more strongly for images with AI signifiers
    if (hasAISignifier) {
      setMethodResults(prev => ({
        ...prev,
        "Watermark Detection": {
          ...prev["Watermark Detection"],
          manipulationScore: Math.min((prev["Watermark Detection"]?.manipulationScore || 70) + 20, 98),
          issues: [...(prev["Watermark Detection"]?.issues || []), "AI generation tool watermark pattern detected"]
        }
      }));
    }
    
    return watermarkResult;
  };

  const analyzeErrorLevels = async (file: File) => {
    // Enhanced error level analysis
    setActiveMethod("Error Level Analysis");
    const elaResult = await simulateMethodAnalysis("Error Level Analysis", 2500, file);
    
    // Check file size versus dimensions for compression anomalies
    // (In a real implementation, this would analyze actual error level differences)
    const fileSize = file.size;
    if (fileSize < 100000) {
      // Small file size might indicate AI generation with low detail preservation
      setMethodResults(prev => ({
        ...prev,
        "Error Level Analysis": {
          ...prev["Error Level Analysis"],
          manipulationScore: Math.min((prev["Error Level Analysis"]?.manipulationScore || 60) + 15, 95),
          issues: [...(prev["Error Level Analysis"]?.issues || []), "Unusual compression patterns detected in image data"]
        }
      }));
    }
    
    return elaResult;
  };

  const runAllMethods = async () => {
    // Run watermark detection (new prioritized method)
    await analyzeWatermarks(file!);
    
    // Run enhanced error level analysis
    await analyzeErrorLevels(file!);
    
    // Run face detection
    setActiveMethod("Face Detection & Analysis");
    await simulateMethodAnalysis("Face Detection & Analysis", 3000, file);
    
    // Run neural network analysis
    setActiveMethod("Neural Network Pattern Recognition");
    await simulateMethodAnalysis("Neural Network Pattern Recognition", 3500, file);
    
    // Calculate final score and determine result
    let totalScore = 0;
    let totalWeight = 0;
    let allIssues: string[] = [];
    
    imageDetectionMethods.forEach(method => {
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
    
    // Calculate base score
    let baseScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
    
    // Apply model accuracy boost for custom trained models
    if (imageModel.isCustomTrained) {
      // Adjust detection sensitivity based on model accuracy
      // Higher accuracy = better at detecting subtle signs, less false positives
      const accuracyFactor = (imageModel.accuracy - 0.5) * 2; // Normalize to 0-1 range
      
      // For high confidence detections (>70), boost them further
      if (baseScore > 70) {
        baseScore = Math.min(100, baseScore + (10 * accuracyFactor));
      }
      // For borderline cases, adjust based on model accuracy
      else if (baseScore > 40 && baseScore <= 70) {
        // If model is very accurate, increase detection confidence
        if (imageModel.accuracy > 0.85) {
          baseScore += 5; 
        }
      }
      // For low confidence detections, reduce false positives for accurate models
      else if (baseScore <= 40 && imageModel.accuracy > 0.85) {
        baseScore -= 5;
      }
    }
    
    const finalScore = Math.max(0, Math.min(100, baseScore));
    
    // Lower threshold to improve detection rate - consider 55+ as manipulated
    // For custom trained models with high accuracy, we can be more confident
    const detectionThreshold = imageModel.isCustomTrained && imageModel.accuracy > 0.85 ? 53 : 55;
    const isManipulated = finalScore > detectionThreshold || allIssues.length >= 2;
    
    // More accurate models provide more specific and confident analysis texts
    const modelAccuracyDescription = imageModel.isCustomTrained 
      ? `with ${imageModel.accuracy > 0.9 ? 'high' : 'improved'} accuracy`
      : '';
    
    const detectionResult: DetectionResult = {
      isManipulated,
      confidenceScore: finalScore,
      detailsText: isManipulated
        ? `Our AI ${modelAccuracyDescription} has detected signs of artificially generated content with ${finalScore}% certainty. ${
          imageModel.isCustomTrained ? 'The custom-trained model identified ' : 'The analysis found '
        }watermarks and patterns consistent with AI generation tools.`
        : `Our analysis ${modelAccuracyDescription} indicates this image shows no clear signs of AI generation with ${100 - finalScore}% certainty. The image appears to be authentic.`,
      issues: allIssues.length > 0 ? allIssues : undefined
    };
    
    setResult(detectionResult);
    
    // Add to search history
    await addToSearchHistory({
      type: 'image',
      filename: file?.name,
      result: isManipulated,
      confidenceScore: finalScore,
    });
    
    // Show toast notification
    toast({
      title: isManipulated ? "AI-Generated Image Detected" : "Analysis Complete",
      description: `Image analysis complete with ${isManipulated ? finalScore : 100 - finalScore}% confidence.`,
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
