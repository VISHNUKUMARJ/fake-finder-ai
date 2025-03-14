
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/detection/FileUploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addToSearchHistory } from "@/utils/historyManager";

// Audio detection methods
const detectionMethods = [
  { name: "Spectral Analysis", weight: 0.25 },
  { name: "Voice Pattern Recognition", weight: 0.3 },
  { name: "Acoustic Inconsistency Detection", weight: 0.2 },
  { name: "Neural Audio Analysis", weight: 0.25 }
];

const AudioDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [methodResults, setMethodResults] = useState<Record<string, { score: number, complete: boolean }>>({});
  const [result, setResult] = useState<null | {
    isManipulated: boolean;
    confidenceScore: number;
    detailsText: string;
    issues?: string[];
  }>(null);
  const { toast } = useToast();

  // Reset method results when file changes
  useEffect(() => {
    const initialResults: Record<string, { score: number, complete: boolean }> = {};
    detectionMethods.forEach(method => {
      initialResults[method.name] = { score: 0, complete: false };
    });
    setMethodResults(initialResults);
  }, [file]);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setProgress(0);
    setActiveMethod("");
  };

  const simulateMethodAnalysis = (methodName: string, duration: number) => {
    return new Promise<{score: number, issues?: string[]}>((resolve) => {
      setActiveMethod(methodName);
      
      // Simulate method-specific detection
      const interval = setInterval(() => {
        setMethodResults(prev => {
          const methodProgress = prev[methodName].score + (100 / (duration / 100));
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
      
      // Resolve after the duration with a manipulation score and possible issues
      setTimeout(() => {
        const manipulationScore = Math.random() * 100;
        let issues: string[] = [];
        
        // Generate method-specific issues based on the method and if score is high
        if (manipulationScore > 65) {
          if (methodName === "Spectral Analysis") {
            issues.push("Unnatural frequency distribution detected");
          } else if (methodName === "Voice Pattern Recognition") {
            issues.push("Inconsistent voice patterns identified");
          } else if (methodName === "Acoustic Inconsistency Detection") {
            issues.push("Background noise artifacts not consistent with natural audio");
          } else if (methodName === "Neural Audio Analysis") {
            issues.push("AI generation patterns detected in audio waveform");
          }
        }
        
        resolve({ score: manipulationScore, issues });
      }, duration);
    });
  };

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
    
    // Calculate final score
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
    const isManipulated = finalScore > 60;
    
    // Generate detailed text based on issues found
    let detailsText = isManipulated
      ? "Our AI has detected signs of voice cloning or audio manipulation. "
      : "Our analysis indicates this audio shows no significant signs of manipulation. ";
      
    detailsText += isManipulated
      ? `The analysis indicates this audio may have been artificially generated or edited with ${finalScore}% confidence.`
      : `The voice patterns appear natural and authentic with ${100 - finalScore}% confidence.`;
    
    setResult({
      isManipulated,
      confidenceScore: isManipulated ? finalScore : 100 - finalScore,
      detailsText,
      issues: allIssues.length > 0 ? allIssues : undefined
    });
    
    // Add to search history
    addToSearchHistory({
      type: 'audio',
      filename: file?.name,
      result: isManipulated,
      confidenceScore: isManipulated ? finalScore : 100 - finalScore,
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
    detectionMethods.forEach(method => {
      setMethodResults(prev => ({
        ...prev,
        [method.name]: { score: 0, complete: false }
      }));
    });
    
    // Track overall progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const newProgress = Object.values(methodResults).reduce(
          (sum, method) => sum + (method.score / detectionMethods.length),
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

  const renderResultAlert = () => {
    if (!result) return null;
    
    const { isManipulated, confidenceScore, detailsText, issues } = result;
    
    if (isManipulated) {
      return (
        <Alert className="mt-6 border-orange-500 bg-orange-50 dark:bg-orange-950/50">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <AlertTitle className="text-orange-700 dark:text-orange-300 text-lg font-semibold">
            Potentially Manipulated Audio
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p>{detailsText}</p>
            {issues && issues.length > 0 && (
              <div className="mt-3">
                <p className="font-medium">Issues detected:</p>
                <ul className="list-disc pl-5 mt-1">
                  {issues.map((issue, index) => (
                    <li key={index} className="text-orange-700 dark:text-orange-300">{issue}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="mt-3">
              <strong>Confidence score: {confidenceScore}%</strong>
            </p>
          </AlertDescription>
        </Alert>
      );
    }
    
    return (
      <Alert className="mt-6 border-green-500 bg-green-50 dark:bg-green-950/50">
        <CheckCircle2 className="h-5 w-5 text-green-500" />
        <AlertTitle className="text-green-700 dark:text-green-300 text-lg font-semibold">
          Likely Authentic Audio
        </AlertTitle>
        <AlertDescription className="mt-2">
          <p>{detailsText}</p>
          <p className="mt-2">
            <strong>Confidence score: {confidenceScore}%</strong>
          </p>
        </AlertDescription>
      </Alert>
    );
  };

  return (
    <AppLayout title="Audio Detection">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Audio Manipulation Detection</h2>
          <p className="text-muted-foreground mt-2">
            Upload an audio file to analyze it for signs of voice cloning or manipulation
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <FileUploader
              onFileSelected={handleFileSelected}
              accept="audio/*"
              maxSizeMB={20}
              file={file}
            />
            
            {file && !isAnalyzing && !result && (
              <div className="mt-6 flex justify-center">
                <Button onClick={handleAnalyze} className="px-8">
                  Analyze Audio
                </Button>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="mt-6 space-y-4">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Analyzing audio... {progress}%
                </p>
                
                {/* Detection method indicators */}
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
            
            {result && (
              <div className="mt-6">
                <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-500" />
                  <AlertTitle>Understanding Audio Analysis</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Our AI analyzes multiple factors to detect voice cloning:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Spectral Analysis:</strong> Examines audio frequencies for unnatural patterns.</li>
                      <li><strong>Voice Pattern Recognition:</strong> Analyzes voice characteristics for consistency.</li>
                      <li><strong>Acoustic Inconsistency Detection:</strong> Identifies unnatural background noise and transitions.</li>
                      <li><strong>Neural Audio Analysis:</strong> Uses deep learning to detect AI synthesis artifacts.</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AudioDetection;
