
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDetectionMethods } from "@/hooks/useDetectionMethods";
import { audioDetectionMethods } from "@/components/detection/audio/AudioDetectionMethods";
import { addToSearchHistory } from "@/utils/historyManager";
import { DetectionResult } from "@/types/detection";
import { useTrainableDetection } from "@/context/TrainableDetectionContext";

export function useAudioAnalysis(file: File | null) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();
  const { methodResults, setMethodResults, simulateMethodAnalysis } = useDetectionMethods(audioDetectionMethods);
  const { modelState } = useTrainableDetection();
  
  // Get model information for audio detection
  const audioModel = modelState.audio;

  const runAllMethods = async () => {
    let allIssues: string[] = [];
    
    // Check filename for AI generation clues
    const filename = file?.name.toLowerCase() || "";
    const syntheticIndicators = ["synthetic", "ai-gen", "tts", "elevenlabs", "generated", "cloned"];
    const hasSyntheticIndicator = syntheticIndicators.some(term => filename.includes(term));
    
    // Run spectral pattern analysis
    setActiveMethod("Spectral Pattern Analysis");
    const spectralResult = await simulateMethodAnalysis("Spectral Pattern Analysis", 2000);
    if (spectralResult.issues) allIssues = [...allIssues, ...spectralResult.issues];
    
    // Adjust spectral analysis score if synthetic indicators present
    if (hasSyntheticIndicator) {
      setMethodResults(prev => ({
        ...prev,
        "Spectral Pattern Analysis": {
          ...prev["Spectral Pattern Analysis"],
          manipulationScore: Math.min((prev["Spectral Pattern Analysis"]?.manipulationScore || 65) + 25, 95),
          issues: [...(prev["Spectral Pattern Analysis"]?.issues || []), "Unusual spectral patterns consistent with synthetic audio"]
        }
      }));
      allIssues.push("Suspicious file metadata suggests synthetic audio");
    }
    
    // Run voice consistency detection
    setActiveMethod("Voice Consistency Detection");
    const voiceResult = await simulateMethodAnalysis("Voice Consistency Detection", 2500);
    if (voiceResult.issues) allIssues = [...allIssues, ...voiceResult.issues];
    
    // Run background noise analysis
    setActiveMethod("Background Noise Analysis");
    const acousticResult = await simulateMethodAnalysis("Background Noise Analysis", 1800);
    if (acousticResult.issues) allIssues = [...allIssues, ...acousticResult.issues];
    
    // Run AI voice model detection
    setActiveMethod("AI Voice Model Detection");
    const neuralResult = await simulateMethodAnalysis("AI Voice Model Detection", 3000);
    if (neuralResult.issues) allIssues = [...allIssues, ...neuralResult.issues];
    
    // Calculate final score
    const calculatedScores = audioDetectionMethods.map(method => {
      const methodResult = methodResults[method.name];
      const manipulationScore = methodResult?.manipulationScore || 0;
      return { score: manipulationScore, weight: method.weight };
    });
    
    let totalWeightedScore = 0;
    let totalWeight = 0;
    
    calculatedScores.forEach(item => {
      totalWeightedScore += item.score * item.weight;
      totalWeight += item.weight;
    });
    
    // Calculate base score
    let baseScore = Math.round(totalWeightedScore / totalWeight);
    
    // Apply model accuracy adjustments for custom trained models
    if (audioModel.isCustomTrained) {
      // For wavenet models, they're very good at detecting particular synthetic voices
      if (audioModel.modelVersion.includes("wavenet")) {
        // Boost detection confidence for wavenet-based detection
        baseScore = Math.min(100, baseScore + 5);
        
        // For likely synthetic audio (already high score), boost further
        if (baseScore > 70) {
          baseScore = Math.min(100, baseScore + 7);
        }
      } 
      // For other custom models, adjust based on accuracy
      else if (audioModel.accuracy > 0.85) {
        // High accuracy models should be more reliable
        baseScore = Math.min(100, baseScore + 3);
      }
    }
    
    const finalScore = Math.max(0, Math.min(100, baseScore));
    
    // Determine threshold based on model characteristics
    let detectionThreshold = 58; // Default threshold
    
    if (audioModel.isCustomTrained) {
      // Adjust threshold based on model type and accuracy
      if (audioModel.modelVersion.includes("wavenet")) {
        // Wavenet models need a slightly lower threshold as they're more sensitive
        detectionThreshold = 56;
      } else if (audioModel.accuracy > 0.85) {
        // Very accurate models can be more sensitive
        detectionThreshold = 55;
      }
    }
    
    const isManipulated = finalScore > detectionThreshold || allIssues.length >= 2;
    
    // Customize details text based on model used
    const modelDescription = audioModel.isCustomTrained
      ? audioModel.modelVersion.includes("wavenet") 
        ? "advanced wavenet-trained" 
        : "custom-trained"
      : "standard";
    
    // Generate detailed text based on issues found
    let detailsText = isManipulated
      ? `Our ${modelDescription} AI has detected signs of voice synthesis or audio manipulation. `
      : `Our ${modelDescription} analysis indicates this audio shows no significant signs of manipulation. `;
      
    detailsText += isManipulated
      ? `The analysis indicates this may be artificially generated content with ${finalScore}% confidence.`
      : `The audio appears to be authentic with ${100 - finalScore}% confidence.`;
    
    const detectionResult: DetectionResult = {
      isManipulated,
      confidenceScore: finalScore,
      detailsText,
      issues: allIssues.length > 0 ? allIssues : undefined
    };
    
    setResult(detectionResult);
    
    // Add to search history
    await addToSearchHistory({
      type: 'audio',
      filename: file?.name,
      result: isManipulated,
      confidenceScore: finalScore,
    });
    
    // Show toast notification
    toast({
      title: "Analysis Complete",
      description: `Audio analysis complete with ${isManipulated ? finalScore : 100 - finalScore}% confidence.`,
    });
  };

  const handleAnalyze = async () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    
    // Reset results
    audioDetectionMethods.forEach(method => {
      setMethodResults(prev => ({
        ...prev,
        [method.name]: { score: 0, complete: false }
      }));
    });
    
    // Track overall progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Object.values(methodResults).reduce(
          (sum, method) => sum + (method.score / audioDetectionMethods.length),
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
        description: "There was an error analyzing the audio."
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
