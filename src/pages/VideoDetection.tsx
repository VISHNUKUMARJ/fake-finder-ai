
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/detection/FileUploader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

const VideoDetection = () => {
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
              ? "Our AI has detected signs of manipulation in this video. The analysis indicates potential deepfake or edited content."
              : "Our analysis indicates this video shows no signs of manipulation. The video appears to be authentic.",
          });
          
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 5; // Slower progress for video analysis
      });
    }, 600);
  };

  const renderResultAlert = () => {
    if (!result) return null;
    
    const { isManipulated, confidenceScore, detailsText } = result;
    
    if (isManipulated) {
      return (
        <Alert className="mt-6 border-red-500 bg-red-50 dark:bg-red-950/50">
          <XCircle className="h-5 w-5 text-red-500" />
          <AlertTitle className="text-red-700 dark:text-red-300 text-lg font-semibold">
            Potentially Manipulated Video
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
              </div>
            )}
            
            {renderResultAlert()}
            
            {result && (
              <div className="mt-6">
                <Alert className="bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800">
                  <Info className="h-5 w-5 text-blue-500" />
                  <AlertTitle>Understanding Video Analysis</AlertTitle>
                  <AlertDescription>
                    Our AI analyzes facial movements, lip sync, visual artifacts, and 
                    frame consistency. Video deepfake detection is complex and results
                    should be interpreted as probabilities, not definitive conclusions.
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
