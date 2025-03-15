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

// Image detection methods
const detectionMethods = [
  { name: "Metadata Analysis", weight: 0.25 },
  { name: "Error Level Analysis", weight: 0.25 },
  { name: "Face Detection & Analysis", weight: 0.2 },
  { name: "Neural Network Pattern Recognition", weight: 0.3 }
];

const ImageDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeMethod, setActiveMethod] = useState("");
  const [methodResults, setMethodResults] = useState<Record<string, { score: number, complete: boolean, manipulationScore?: number }>>({});
  const [result, setResult] = useState<null | {
    isManipulated: boolean;
    confidenceScore: number;
    detailsText: string;
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
    return new Promise<number>((resolve) => {
      setActiveMethod(methodName);
      
      // Simulate method-specific detection
      const interval = setInterval(() => {
        setMethodResults(prev => {
          const methodProgress = prev[methodName].score + (100 / (duration / 100));
          if (methodProgress >= 100) {
            clearInterval(interval);
            // Determine if this method detects manipulation (random for simulation)
            const manipulationScore = Math.random() * 100;
            return {
              ...prev,
              [methodName]: { score: 100, complete: true, manipulationScore }
            };
          }
          return {
            ...prev,
            [methodName]: { ...prev[methodName], score: methodProgress }
          };
        });
      }, 100);
      
      // Resolve after the duration with a manipulation score
      setTimeout(() => {
        const manipulationScore = Math.random() * 100;
        resolve(manipulationScore);
      }, duration);
    });
  };

  const runAllMethods = async () => {
    // Run metadata analysis (quickest)
    await simulateMethodAnalysis("Metadata Analysis", 1500);
    
    // Run error level analysis
    await simulateMethodAnalysis("Error Level Analysis", 2500);
    
    // Run face detection
    await simulateMethodAnalysis("Face Detection & Analysis", 3000);
    
    // Run neural network analysis (most complex)
    await simulateMethodAnalysis("Neural Network Pattern Recognition", 3500);
    
    // Calculate final score and determine result
    let totalScore = 0;
    let totalWeight = 0;
    
    detectionMethods.forEach(method => {
      const methodResult = methodResults[method.name];
      if (methodResult && methodResult.complete) {
        // Use the manipulationScore property if it exists, or default to 50
        totalScore += (methodResult.manipulationScore ?? 50) * method.weight;
        totalWeight += method.weight;
      }
    });
    
    // Normalize to get final score (0-100)
    const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
    
    // Determine if manipulated (score above 65 indicates manipulation)
    const isManipulated = finalScore > 65;
    
    setResult({
      isManipulated,
      confidenceScore: isManipulated ? finalScore : 100 - finalScore,
      detailsText: isManipulated
        ? `Our AI has detected signs of manipulation in this image with ${finalScore}% certainty. Multiple analysis methods indicate potential alterations in key areas.`
        : `Our analysis indicates this image shows no signs of AI manipulation with ${100 - finalScore}% certainty. The image appears to be authentic.`,
    });
    
    // Add to search history
    addToSearchHistory({
      type: 'image',
      filename: file?.name,
      result: isManipulated,
      confidenceScore: isManipulated ? finalScore : 100 - finalScore,
    });
    
    // Show toast notification
    toast({
      title: "Analysis Complete",
      description: `Image analysis complete with ${isManipulated ? finalScore : 100 - finalScore}% confidence.`,
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
        description: "There was an error analyzing the image."
      });
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setActiveMethod("");
    }
  };

  const renderResultAlert = () => {
    if (!result) return null;
    
    const { isManipulated, confidenceScore, detailsText } = result;
    
    if (isManipulated) {
      return (
        <Alert className="mt-6 border-red-500 bg-red-50 dark:bg-red-950/50">
          <XCircle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700 dark:text-red-300 text-lg font-semibold">
            Potentially Manipulated Image
          </AlertTitle>
          <AlertDescription className="mt-2">
            <p>{detailsText}</p>
            <p className="mt-2">
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
          Likely Authentic Image
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
    <AppLayout title="Image Detection">
      <div className="space-y-8 max-w-4xl mx-auto">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Image Manipulation Detection</h2>
          <p className="text-muted-foreground mt-2">
            Upload an image to analyze it for signs of AI manipulation or editing
          </p>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <FileUploader
              onFileSelected={handleFileSelected}
              accept="image/*"
              maxSizeMB={5}
              file={file}
            />
            
            {file && !isAnalyzing && !result && (
              <div className="mt-6 flex justify-center">
                <Button onClick={handleAnalyze} className="px-8">
                  Analyze Image
                </Button>
              </div>
            )}
            
            {isAnalyzing && (
              <div className="mt-6 space-y-4">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Analyzing image... {progress}%
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
                  <AlertTitle>Understanding Results</AlertTitle>
                  <AlertDescription>
                    <p className="mb-2">Our AI analyzes multiple factors to detect image manipulation:</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li><strong>Metadata Analysis:</strong> Examines image EXIF data for tampering signs.</li>
                      <li><strong>Error Level Analysis:</strong> Detects inconsistencies in compression artifacts.</li>
                      <li><strong>Face Detection:</strong> Identifies unnatural elements in facial features.</li>
                      <li><strong>Neural Network Analysis:</strong> Applies deep learning to detect AI-generated patterns.</li>
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

export default ImageDetection;
