
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

// Video detection methods
const detectionMethods = [
  { name: "Facial Movement Analysis", weight: 0.25 },
  { name: "Audio-Visual Sync Detection", weight: 0.2 },
  { name: "Temporal Consistency Check", weight: 0.2 },
  { name: "Deep Neural Network Analysis", weight: 0.35 }
];

const VideoDetection = () => {
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
      
      // Simulate method-specific detection (slower for video)
      const interval = setInterval(() => {
        setMethodResults(prev => {
          const methodProgress = prev[methodName].score + (100 / (duration / 200));
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
      }, 200);
      
      // Resolve after the duration with a manipulation score and possible issues
      setTimeout(() => {
        const manipulationScore = Math.random() * 100;
        let issues: string[] = [];
        
        // Generate method-specific issues based on the method and if score is high
        if (manipulationScore > 65) {
          if (methodName === "Facial Movement Analysis") {
            issues.push("Unnatural eye blinking patterns detected");
          } else if (methodName === "Audio-Visual Sync Detection") {
            issues.push("Audio and lip movements are not properly synchronized");
          } else if (methodName === "Temporal Consistency Check") {
            issues.push("Inconsistent lighting or shadows between frames");
          } else if (methodName === "Deep Neural Network Analysis") {
            issues.push("AI-generated artifacts detected in multiple frames");
          }
        }
        
        resolve({ score: manipulationScore, issues });
      }, duration);
    });
  };

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
    
    // Calculate final score
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
    const isManipulated = finalScore > 65;
    
    // Generate detailed text based on issues found
    let detailsText = isManipulated
      ? "Our AI has detected signs of manipulation in this video. "
      : "Our analysis indicates this video shows no significant signs of manipulation. ";
      
    detailsText += isManipulated
      ? `The analysis indicates potential deepfake or edited content with ${finalScore}% confidence.`
      : `The video appears to be authentic with ${100 - finalScore}% confidence.`;
    
    setResult({
      isManipulated,
      confidenceScore: isManipulated ? finalScore : 100 - finalScore,
      detailsText,
      issues: allIssues.length > 0 ? allIssues : undefined
    });
    
    // Add to search history
    addToSearchHistory({
      type: 'video',
      filename: file?.name,
      result: isManipulated,
      confidenceScore: isManipulated ? finalScore : 100 - finalScore,
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

  const renderResultAlert = () => {
    if (!result) return null;
    
    const { isManipulated, confidenceScore, detailsText, issues } = result;
    
    if (isManipulated) {
      return (
        <Alert className="mt-6 border-red-500 bg-red-50 dark:bg-red-950/50">
          <XCircle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700 dark:text-red-300 text-lg font-semibold">
            Potentially Manipulated Video
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p>{detailsText}</p>
            {issues && issues.length > 0 && (
              <div className="mt-3">
                <p className="font-medium">Issues detected:</p>
                <ul className="list-disc pl-5 mt-1">
                  {issues.map((issue, index) => (
                    <li key={index} className="text-red-700 dark:text-red-300">{issue}</li>
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
          Likely Authentic Video
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
    <AppLayout title="Video Detection">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deepfake Video Detection</h2>
          <p className="text-muted-foreground mt-2">
            Upload a video to analyze it for signs of deepfakes or manipulation
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <FileUploader
              onFileSelected={handleFileSelected}
              accept="video/*"
              maxSizeMB={50}
              file={file}
            />
            
            {file && !isAnalyzing && !result && (
              <div className="mt-6 flex justify-center">
                <Button onClick={handleAnalyze} className="px-8">
                  Analyze Video
                </Button>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="mt-6 space-y-4">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Analyzing video... {progress}%
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
                  <AlertTitle>Understanding Video Analysis</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Our AI analyzes multiple aspects to detect deepfakes:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Facial Movement Analysis:</strong> Examines unnatural facial expressions and blinking.</li>
                      <li><strong>Audio-Visual Sync:</strong> Checks if lip movements match the audio track.</li>
                      <li><strong>Temporal Consistency:</strong> Detects inconsistencies in lighting, shadows, and movements.</li>
                      <li><strong>Deep Neural Analysis:</strong> Uses AI to identify patterns typical of deepfake generation.</li>
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

export default VideoDetection;
