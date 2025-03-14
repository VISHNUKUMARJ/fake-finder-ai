
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const TextDetection = () => {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | {
    isAIGenerated: boolean;
    confidenceScore: number;
    humanScore: number;
    detailsText: string;
  }>(null);

  const handleAnalyze = () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate analysis process with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Simulate an analysis result
          const isAIGenerated = Math.random() > 0.5;
          const confidenceScore = Math.floor(Math.random() * 30) + (isAIGenerated ? 70 : 20);
          const humanScore = 100 - confidenceScore;
          
          setResult({
            isAIGenerated,
            confidenceScore,
            humanScore,
            detailsText: isAIGenerated
              ? "This text shows patterns consistent with AI-generated content. The analysis found statistical patterns that match known AI writing styles."
              : "This text appears to be human-written based on our analysis. The content shows natural language patterns consistent with human writing.",
          });
          
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
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
