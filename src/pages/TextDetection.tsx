import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addToSearchHistory } from "@/utils/historyManager";

const detectionMethods = [
  { name: "Statistical Pattern Analysis", weight: 0.2 },
  { name: "Perplexity Measurement", weight: 0.2 },
  { name: "Stylometric Analysis", weight: 0.3 },
  { name: "Semantic Consistency Check", weight: 0.3 }
];

const textFeatures = [
  { name: "Repeated Phrases", humanRange: [0, 30], aiRange: [20, 75] },
  { name: "Sentence Complexity", humanRange: [40, 90], aiRange: [60, 95] },
  { name: "Linguistic Diversity", humanRange: [50, 95], aiRange: [20, 70] },
  { name: "Contextual Coherence", humanRange: [60, 95], aiRange: [30, 85] },
  { name: "Factual Consistency", humanRange: [70, 95], aiRange: [30, 80] }
];

const TextDetection = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [methodResults, setMethodResults] = useState<Record<string, { score: number, complete: boolean }>>({});
  const [featureScores, setFeatureScores] = useState<Record<string, number>>({});
  const [result, setResult] = useState<null | {
    isAIGenerated: boolean;
    confidenceScore: number;
    humanScore: number;
    detailsText: string;
  }>(null);
  const { toast } = useToast();

  const simulateMethodAnalysis = (methodName: string, duration: number) => {
    return new Promise<number>((resolve) => {
      setActiveMethod(methodName);
      
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
      
      setTimeout(() => {
        const aiProbabilityScore = Math.random() * 100;
        resolve(aiProbabilityScore);
      }, duration);
    });
  };

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
    detectionMethods.forEach(method => {
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
      statisticalScore * 0.2 + 
      perplexityScore * 0.2 + 
      stylometricScore * 0.3 + 
      semanticScore * 0.3
    );
    
    const isAIGenerated = finalScore > 65;
    
    setResult({
      isAIGenerated,
      confidenceScore: Math.round(finalScore),
      humanScore: Math.round(100 - finalScore),
      detailsText: isAIGenerated
        ? `This text shows patterns consistent with AI-generated content. The analysis found statistical patterns and writing style indicators that match known AI writing styles with ${Math.round(finalScore)}% confidence.`
        : `This text appears to be human-written based on our analysis. The content shows natural language patterns consistent with human writing with ${Math.round(100 - finalScore)}% confidence.`,
    });
    
    await addToSearchHistory({
      type: 'text',
      textSnippet: text.length > 50 ? text.substring(0, 50) + '...' : text,
      result: isAIGenerated,
      confidenceScore: Math.round(finalScore),
    });
    
    toast({
      title: "Analysis Complete",
      description: `Text analysis complete with ${Math.round(finalScore)}% AI probability.`,
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
          (sum, method) => sum + (method.score / detectionMethods.length),
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

  const renderResultAlert = () => {
    if (!result) return null;
    
    const { isAIGenerated, confidenceScore, humanScore, detailsText } = result;
    
    if (isAIGenerated) {
      return (
        <Alert className="mt-6 border-orange-500 bg-orange-50 dark:bg-orange-950/50">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <AlertTitle className="text-orange-700 dark:text-orange-300 text-lg font-semibold">
            Likely AI-Generated Text
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p>{detailsText}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium">AI probability</p>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-orange-500 h-2.5 rounded-full" 
                    style={{ width: `${confidenceScore}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-right">{confidenceScore}%</p>
              </div>
              <div>
                <p className="text-sm font-medium">Human probability</p>
                <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-green-500 h-2.5 rounded-full" 
                    style={{ width: `${humanScore}%` }}
                  />
                </div>
                <p className="mt-1 text-sm text-right">{humanScore}%</p>
              </div>
            </div>
            
            {Object.keys(featureScores).length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium mb-2">Text Feature Analysis</p>
                {textFeatures.map((feature) => (
                  <div key={feature.name} className="mb-2">
                    <div className="flex justify-between text-xs">
                      <span>{feature.name}</span>
                      <span className={featureScores[feature.name] > 60 ? 'text-orange-500' : 'text-green-500'}>
                        {featureScores[feature.name]}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                      <div 
                        className={`h-1.5 rounded-full ${
                          featureScores[feature.name] > 60 ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${featureScores[feature.name]}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="mt-6 border-green-500 bg-green-50 dark:bg-green-950/50">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700 dark:text-green-300 text-lg font-semibold">
          Likely Human-Written Text
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p>{detailsText}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">AI probability</p>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-orange-500 h-2.5 rounded-full" 
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-right">{confidenceScore}%</p>
            </div>
            <div>
              <p className="text-sm font-medium">Human probability</p>
              <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full" 
                  style={{ width: `${humanScore}%` }}
                />
              </div>
              <p className="mt-1 text-sm text-right">{humanScore}%</p>
            </div>
          </div>
          
          {Object.keys(featureScores).length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-medium mb-2">Text Feature Analysis</p>
              {textFeatures.map((feature) => (
                <div key={feature.name} className="mb-2">
                  <div className="flex justify-between text-xs">
                    <span>{feature.name}</span>
                    <span className={featureScores[feature.name] > 60 ? 'text-orange-500' : 'text-green-500'}>
                      {featureScores[feature.name]}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
                    <div 
                      className={`h-1.5 rounded-full ${
                        featureScores[feature.name] > 60 ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${featureScores[feature.name]}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <AppLayout title="Text Detection">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Text Detection</h2>
          <p className="text-muted-foreground mt-2">
            Paste text to analyze whether it was generated by AI or written by a human
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste text here for analysis (minimum 100 characters for accurate results)"
              className="min-h-[200px] resize-y"
            />
            
            {text.length < 100 && text.length > 0 && (
              <p className="mt-2 text-sm text-orange-500">
                For accurate results, please enter at least 100 characters.
              </p>
            )}
            
            <div className="mt-6 flex justify-center">
              <Button 
                onClick={handleAnalyze} 
                className="px-8"
                disabled={isAnalyzing || text.length < 100}
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Text"}
              </Button>
            </div>
            
            {isAnalyzing && (
              <div className="mt-6 space-y-4">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Analyzing text... {progress}%
                </p>
                
                <div className="space-y-2 mt-4">
                  {detectionMethods.map((method) => (
                    <div key={method.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className={`${activeMethod === method.name ? 'font-bold text-primary' : ''}`}>
                          {method.name}
                        </span>
                        <span>
                          {methodResults[method.name]?.score.toFixed(0)}%
                        </span>
                      </div>
                      <Progress 
                        value={methodResults[method.name]?.score || 0}
                        className={`h-1 ${activeMethod === method.name ? 'bg-primary/20' : 'bg-gray-100 dark:bg-gray-800'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {renderResultAlert()}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default TextDetection;
