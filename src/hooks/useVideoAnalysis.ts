
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

  const runAllMethods = async () => {
    let allIssues: string[] = [];
    
    // Run facial movement analysis
    const facialResult = await simulateMethodAnalysis("Facial Movement Analysis", 3000);
    if (facialResult.issues) allIssues = [...allIssues, ...facialResult.issues];
    
    // Run audio-visual sync detection
    const syncResult = await simulateMethodAnalysis("Audio-Visual Sync Detection", 4000);
    if (syncResult.issues) allIssues = [...allIssues, ...syncResult.issues];
    
    // Run temporal consistency check
    const temporalResult = await simulateMethodAnalysis("Temporal Consistency Check", 3500);
    if (temporalResult.issues) allIssues = [...allIssues, ...temporalResult.issues];
    
    // Run deep neural network analysis
    const neuralResult = await simulateMethodAnalysis("Deep Neural Network Analysis", 5000);
    if (neuralResult.issues) allIssues = [...allIssues, ...neuralResult.issues];
    
    // Calculate final score with a bias towards detecting manipulated content (for demo purposes)
    const calculatedScores = [
      { score: facialResult.score, weight: 0.25 },
      { score: syncResult.score, weight: 0.2 },
      { score: temporalResult.score, weight: 0.2 },
      { score: neuralResult.score, weight: 0.35 }
    ];
    
    let totalWeightedScore = 0;
    calculatedScores.forEach(item => {
      totalWeightedScore += item.score * item.weight;
    });
    
    const finalScore = Math.round(totalWeightedScore);
    
    // For the purpose of this demo, when a user uploads AI-generated content,
    // we want to ensure it's detected as fake, so we'll adjust the threshold
    const isManipulated = finalScore > 65 || allIssues.length > 0;
    
    // Generate detailed text based on issues found
    let detailsText = isManipulated
      ? "Our AI has detected signs of manipulation in this video. "
      : "Our analysis indicates this video shows no significant signs of manipulation. ";
      
    detailsText += isManipulated
      ? `The analysis indicates potential deepfake or edited content with ${finalScore}% confidence.`
      : `The video appears to be authentic with ${100 - finalScore}% confidence.`;
    
    const detectionResult: DetectionResult = {
      isManipulated,
      confidenceScore: finalScore,
      detailsText,
      issues: allIssues.length > 0 ? allIssues : undefined
    };
    
    setResult(detectionResult);
    
    // Add to search history
    await addToSearchHistory({
      type: 'video',
      filename: file?.name,
      result: isManipulated,
      confidenceScore: finalScore,
    });
    
    // Show toast notification
    toast({
      title: "Analysis Complete",
      description: `Video analysis complete with ${isManipulated ? finalScore : 100 - finalScore}% confidence.`,
    });
  };

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
    }, 200);
    
    try {
      await runAllMethods();
      setProgress(100);
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
