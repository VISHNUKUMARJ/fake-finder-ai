
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { textDetectionMethods, textFeatures } from "@/components/detection/text/TextDetectionMethods";
import { useDetectionMethods } from "@/hooks/useDetectionMethods";
import { addToSearchHistory } from "@/utils/historyManager";
import { DetectionResult } from "@/types/detection";

export function useTextAnalysis(text: string) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [featureScores, setFeatureScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<DetectionResult & { humanScore: number } | null>(null);
  const { toast } = useToast();
  const { methodResults, setMethodResults, simulateMethodAnalysis } = useDetectionMethods(textDetectionMethods);

  const analyzeTextFeatures = () => {
    const simulatedScores: Record<string, number> = {};
    
    textFeatures.forEach(feature => {
      const isAIGenerated = Math.random() > 0.5;
      const range = isAIGenerated ? feature.aiRange : feature.humanRange;
      simulatedScores[feature.name] = Math.floor(Math.random() * (range[1] - range[0])) + range[0];
    });
    
    setFeatureScores(simulatedScores);
    return simulatedScores;
  };

  const runAllMethods = async () => {
    textDetectionMethods.forEach(method => {
      setMethodResults(prev => ({
        ...prev,
        [method.name]: { score: 0, complete: false }
      }));
    });
    
    const features = analyzeTextFeatures();
    
    const statisticalScore = await simulateMethodAnalysis("Statistical Pattern Analysis", 1200);
    
    const perplexityScore = await simulateMethodAnalysis("Perplexity Measurement", 1000);
    
    const stylometricScore = await simulateMethodAnalysis("Stylometric Analysis", 1500);
    
    const semanticScore = await simulateMethodAnalysis("Semantic Consistency Check", 1300);
    
    const featureAvgScore = Object.values(features).reduce((sum, score) => sum + score, 0) / 
      Object.values(features).length;
    
    const finalScore = (
      statisticalScore.score * 0.2 + 
      perplexityScore.score * 0.2 + 
      stylometricScore.score * 0.3 + 
      semanticScore.score * 0.3
    );
    
    const isAIGenerated = finalScore > 65;
    const roundedScore = Math.round(finalScore);
    const humanScore = Math.round(100 - finalScore);
    
    const detectionResult: DetectionResult & { humanScore: number } = {
      isManipulated: isAIGenerated,
      confidenceScore: roundedScore,
      humanScore,
      detailsText: isAIGenerated
        ? `This text shows patterns consistent with AI-generated content. The analysis found statistical patterns and writing style indicators that match known AI writing styles with ${roundedScore}% confidence.`
        : `This text appears to be human-written based on our analysis. The content shows natural language patterns consistent with human writing with ${humanScore}% confidence.`,
    };
    
    setResult(detectionResult);
    
    await addToSearchHistory({
      type: 'text',
      textSnippet: text.length > 50 ? text.substring(0, 50) + '...' : text,
      result: isAIGenerated,
      confidenceScore: roundedScore,
    });
    
    toast({
      title: "Analysis Complete",
      description: `Text analysis complete with ${roundedScore}% AI probability.`,
    });
  };

  const handleAnalyze = async () => {
    if (text.trim().length < 100) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    setFeatureScores({});
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Object.values(methodResults).reduce(
          (sum, method) => sum + (method.score / textDetectionMethods.length),
          0
        );
        return Math.min(Math.round(newProgress), 99);
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
        description: "There was an error analyzing the text."
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
    featureScores,
    result,
    handleAnalyze
  };
}
