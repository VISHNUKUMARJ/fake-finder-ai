
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/detection/FileUploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const AudioDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<null | {
    isManipulated: boolean;
    confidenceScore: number;
    detailsText: string;
  }>(null);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
  };

  const handleAnalyze = () => {
    if (!file) return;
    
    setIsAnalyzing(true);
    setProgress(0);
    
    // Simulate analysis process with progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          
          // Simulate a analysis result (randomly fake or real)
          const isManipulated = Math.random() > 0.5;
          const confidenceScore = Math.floor(Math.random() * 30) + (isManipulated ? 70 : 20);
          
          setResult({
            isManipulated,
            confidenceScore,
            detailsText: isManipulated
              ? "Our AI has detected signs of voice cloning or audio manipulation. The analysis indicates this audio may have been artificially generated or edited."
              : "Our analysis indicates this audio shows no signs of manipulation. The voice patterns appear natural and authentic.",
          });
          
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 8;
      });
    }, 400);
  };

  const renderResultAlert = () => {
    if (!result) return null;
    
    const { isManipulated, confidenceScore, detailsText } = result;
    
    if (isManipulated) {
      return (
        <Alert className="mt-6 border-orange-500 bg-orange-50 dark:bg-orange-950/50">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <AlertTitle className="text-orange-700 dark:text-orange-300 text-lg font-semibold">
            Potentially Manipulated Audio
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
              </div>
            )}
            
            {renderResultAlert()}
            
            {file && !isAnalyzing && result && (
              <div className="mt-6">
                <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-500" />
                  <AlertTitle>Understanding Audio Analysis</AlertTitle>
                  <AlertDescription>
                    Our AI analyzes voice patterns, frequency distributions, and 
                    acoustic inconsistencies to detect synthetic or cloned voices.
                    As voice synthesis technology improves, detection becomes more
                    challenging, so consider results as probabilities.
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
