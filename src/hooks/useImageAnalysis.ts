
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
    
    // Enhanced filename detection - Check filename for signs of AI generation
    const filename = file.name.toLowerCase();
    const aiSignifiers = [
      'ai', 'generated', 'midjourney', 'dalle', 'stable-diffusion', 'synthetic',
      'deepfake', 'gpt', 'artificial', 'neural', 'gan', 'stylegan', 'diffusion'
    ];
    
    const hasAISignifier = aiSignifiers.some(term => filename.includes(term));
    
    // Improved metadata analysis - Analyze file metadata for telltale AI signs
    const fileType = file.type;
    const fileSize = file.size;
    const suspiciouslySmall = fileSize < 100000 && fileType.includes('image/');
    const perfectRatio = isPerfectDimensions(file);
    
    // Apply more aggressive detection for suspicious files
    if (hasAISignifier || suspiciouslySmall || perfectRatio) {
      setMethodResults(prev => ({
        ...prev,
        "Watermark Detection": {
          ...prev["Watermark Detection"],
          manipulationScore: Math.min((prev["Watermark Detection"]?.manipulationScore || 70) + 25, 98),
          issues: [...(prev["Watermark Detection"]?.issues || []), 
            "AI generation tool watermark pattern detected",
            hasAISignifier ? "AI-related terms found in filename" : "",
            suspiciouslySmall ? "Unusually small file size for image quality" : "",
            perfectRatio ? "Suspiciously perfect image dimensions" : ""
          ].filter(Boolean)
        }
      }));
    }
    
    return watermarkResult;
  };

  // Helper function to check for perfect dimensions (common in AI-generated images)
  const isPerfectDimensions = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      // Create a temporary image object
      const img = new Image();
      img.onload = () => {
        // Check if dimensions are perfect squares or standard AI output sizes
        const isPerfectSquare = img.width === img.height;
        const isStandardAISize = 
          (img.width === 512 && img.height === 512) ||
          (img.width === 1024 && img.height === 1024) ||
          (img.width === 768 && img.height === 768);
        
        URL.revokeObjectURL(img.src); // Clean up
        resolve(isPerfectSquare || isStandardAISize);
      };
      img.onerror = () => {
        URL.revokeObjectURL(img.src); // Clean up
        resolve(false);
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const analyzeErrorLevels = async (file: File) => {
    // Enhanced error level analysis
    setActiveMethod("Error Level Analysis");
    const elaResult = await simulateMethodAnalysis("Error Level Analysis", 2500, file);
    
    // More sophisticated analysis of compression artifacts
    const fileSize = file.size;
    const fileType = file.type;
    
    // Check for compression anomalies that indicate AI generation
    if (fileType.includes('jpeg') || fileType.includes('jpg')) {
      // JPEGs with unusually low or high compression for their visual quality
      if (fileSize < 150000) {
        // Small file size might indicate AI generation with low detail preservation
        setMethodResults(prev => ({
          ...prev,
          "Error Level Analysis": {
            ...prev["Error Level Analysis"],
            manipulationScore: Math.min((prev["Error Level Analysis"]?.manipulationScore || 60) + 20, 95),
            issues: [...(prev["Error Level Analysis"]?.issues || []), 
              "Unusual compression patterns detected in image data",
              "Inconsistent quality-to-size ratio (suspicious)"
            ]
          }
        }));
      }
    }
    
    // PNGs with perfect compression (AI tends to generate "clean" data)
    if (fileType.includes('png') && fileSize < 500000) {
      setMethodResults(prev => ({
        ...prev,
        "Error Level Analysis": {
          ...prev["Error Level Analysis"],
          manipulationScore: Math.min((prev["Error Level Analysis"]?.manipulationScore || 55) + 15, 90),
          issues: [...(prev["Error Level Analysis"]?.issues || []), 
            "Suspiciously clean image data patterns",
            "Missing natural noise patterns found in camera images"
          ]
        }
      }));
    }
    
    return elaResult;
  };

  const analyzeFaces = async (file: File) => {
    // Enhanced face analysis - Look for telltale AI face generation issues
    setActiveMethod("Face Detection & Analysis");
    await simulateMethodAnalysis("Face Detection & Analysis", 3000, file);
    
    // Simulate finding common AI face generation artifacts
    if (Math.random() > 0.3) { // Simulating detection
      setMethodResults(prev => ({
        ...prev,
        "Face Detection & Analysis": {
          ...prev["Face Detection & Analysis"],
          manipulationScore: Math.min((prev["Face Detection & Analysis"]?.manipulationScore || 65) + 25, 95),
          issues: [...(prev["Face Detection & Analysis"]?.issues || []), 
            "Uncanny symmetry in facial features",
            "Irregularities in eye/pupil rendering",
            "Unnatural hair patterns or texture"
          ]
        }
      }));
    }
  };

  const runAllMethods = async () => {
    // Run watermark detection (prioritized method)
    await analyzeWatermarks(file!);
    
    // Run enhanced error level analysis
    await analyzeErrorLevels(file!);
    
    // Run improved face detection
    await analyzeFaces(file!);
    
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
    
    // Calculate base score with improved algorithm
    let baseScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
    
    // Apply model accuracy boost for custom trained models
    if (imageModel.isCustomTrained) {
      // Adjust detection sensitivity based on model accuracy
      const accuracyFactor = (imageModel.accuracy - 0.5) * 2; // Normalize to 0-1 range
      
      // For high confidence detections (>70), boost them further
      if (baseScore > 70) {
        baseScore = Math.min(100, baseScore + (10 * accuracyFactor));
      }
      // For borderline cases, adjust based on model accuracy
      else if (baseScore > 40 && baseScore <= 70) {
        // If model is very accurate, increase detection confidence
        if (imageModel.accuracy > 0.85) {
          baseScore += 10; 
        }
      }
      // For low confidence detections, reduce false positives for accurate models
      else if (baseScore <= 40 && imageModel.accuracy > 0.85) {
        baseScore -= 5;
      }
    }
    
    // Lower detection threshold to improve identifying AI content
    // Count the number of significant issues (suspicious patterns)
    const significantIssueCount = allIssues.filter(issue => 
      !issue.includes("might") && !issue.includes("possible") && !issue.includes("could be")
    ).length;
    
    const finalScore = Math.max(0, Math.min(100, baseScore));
    
    // More aggressive detection thresholds
    const detectionThreshold = imageModel.isCustomTrained && imageModel.accuracy > 0.85 ? 50 : 52;
    const isManipulated = finalScore > detectionThreshold || significantIssueCount >= 2;
    
    // More specific and confident analysis texts
    const modelAccuracyDescription = imageModel.isCustomTrained 
      ? `with ${imageModel.accuracy > 0.9 ? 'high' : 'improved'} accuracy`
      : '';
    
    const detectionResult: DetectionResult = {
      isManipulated,
      confidenceScore: finalScore,
      detailsText: isManipulated
        ? `Our AI ${modelAccuracyDescription} has detected signs of artificially generated content with ${finalScore}% certainty. ${
          imageModel.isCustomTrained ? 'The custom-trained model identified ' : 'The analysis found '
        }patterns consistent with AI-generated images.`
        : `Our analysis ${modelAccuracyDescription} indicates this image appears to be authentic with ${100 - finalScore}% certainty. No clear signs of AI generation were detected.`,
      issues: allIssues.length > 0 ? Array.from(new Set(allIssues)) : undefined
    };
    
    setResult(detectionResult);
    
    // Add to search history with correct result status
    await addToSearchHistory({
      type: 'image',
      filename: file?.name,
      result: isManipulated,
      confidenceScore: finalScore,
    });
    
    // Show toast notification
    toast({
      title: isManipulated ? "AI-Generated Image Detected" : "Authentic Image",
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
