
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useDetectionMethods } from "@/hooks/useDetectionMethods";
import { audioDetectionMethods } from "@/components/detection/audio/AudioDetectionMethods";
import { addToSearchHistory } from "@/utils/historyManager";
import { DetectionResult } from "@/types/detection";

export function useAudioAnalysis(file: File | null) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [result, setResult] = useState<DetectionResult | null>(null);
  const { toast } = useToast();
  const { methodResults, setMethodResults, simulateMethodAnalysis } = useDetectionMethods(audioDetectionMethods);

  const runAllMethods = async () => {
    let allIssues: string[] = [];
    
    // Run spectral analysis
    const spectralResult = await simulateMethodAnalysis("Spectral Analysis", 2000);
    if (spectralResult.issues) allIssues = [...allIssues, ...spectralResult.issues];
    
    // Run voice pattern recognition
    const voiceResult = await simulateMethodAnalysis("Voice Pattern Recognition", 2500);
    if (voiceResult.issues) allIssues = [...allIssues, ...voiceResult.issues];
    
    // Run acoustic inconsistency detection
    const acousticResult = await simulateMethodAnalysis("Acoustic Inconsistency Detection", 1800);
    if (acousticResult.issues) allIssues = [...allIssues, ...acousticResult.issues];
    
    // Run neural audio analysis
    const neuralResult = await simulateMethodAnalysis("Neural Audio Analysis", 3000);
    if (neuralResult.issues) allIssues = [...allIssues, ...neuralResult.issues];
    
    // Calculate final score with a bias towards detecting manipulated content
    const calculatedScores = [
      { score: spectralResult.score, weight: 0.25 },
      { score: voiceResult.score, weight: 0.3 },
      { score: acousticResult.score, weight: 0.2 },
      { score: neuralResult.score, weight: 0.25 }
    ];
    
    let totalWeightedScore = 0;
    calculatedScores.forEach(item => {
      totalWeightedScore += item.score * item.weight;
    });
    
    const finalScore = Math.round(totalWeightedScore);
    
    // Lower the threshold to 60 to catch more AI-generated audio
    const isManipulated = finalScore > 60 || allIssues.length > 0;
    
    // Generate detailed text based on issues found
    let detailsText = isManipulated
      ? "Our AI has detected signs of voice cloning or audio manipulation. "
      : "Our analysis indicates this audio shows no significant signs of manipulation. ";
      
    detailsText += isManipulated
      ? `The analysis indicates this audio may have been artificially generated or edited with ${finalScore}% confidence.`
      : `The voice patterns appear natural and authentic with ${100 - finalScore}% confidence.`;
    
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
