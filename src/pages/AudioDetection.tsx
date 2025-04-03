
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/detection/FileUploader";
import { AnalysisProgress } from "@/components/detection/AnalysisProgress";
import { ResultAlert } from "@/components/detection/ResultAlert";
import { ResultExplanation } from "@/components/detection/ResultExplanation";
import { useAudioAnalysis } from "@/hooks/useAudioAnalysis";
import { audioDetectionMethods } from "@/components/detection/audio/AudioDetectionMethods";
import { DetectionModeSelector } from "@/components/detection/DetectionModeSelector";
import { useToast } from "@/components/ui/use-toast";
import { X } from "lucide-react";

const AudioDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();
  const {
    isAnalyzing,
    progress,
    activeMethod,
    setActiveMethod,
    methodResults,
    result,
    handleAnalyze
  } = useAudioAnalysis(file);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const handleClear = () => {
    setFile(null);
    if (result) {
      // Reload the page to reset analysis state
      window.location.reload();
    } else {
      toast({
        title: "Cleared",
        description: "Uploaded audio has been cleared.",
      });
    }
  };

  const explanationMethods = audioDetectionMethods.map(method => ({
    name: method.name,
    description: method.description || ""
  }));

  return (
    <AppLayout>
      <div className="container max-w-6xl py-6 space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <h1 className="text-3xl font-bold">Audio Detection</h1>
          <p className="text-muted-foreground max-w-[700px]">
            Upload an audio file to detect if it has been manipulated or generated by AI
          </p>
        </div>

        <DetectionModeSelector type="audio" />
        
        <Card>
          <CardContent className="pt-6">
            <FileUploader
              onFileSelected={handleFileSelected}
              accept="audio/*"
              maxSizeMB={20}
              file={file}
            />
            
            {file && !isAnalyzing && !result && (
              <div className="mt-6 flex justify-center gap-4">
                <Button onClick={handleAnalyze} className="px-8">
                  Analyze Audio
                </Button>
                <Button variant="clear" onClick={handleClear}>
                  <X className="mr-1" />
                  Clear
                </Button>
              </div>
            )}
            
            {isAnalyzing && (
              <AnalysisProgress
                progress={progress}
                activeMethod={activeMethod}
                methodResults={methodResults}
                methods={audioDetectionMethods}
              />
            )}
            
            {result && (
              <div className="mt-6 flex justify-center">
                <Button variant="clear" onClick={handleClear}>
                  <X className="mr-1" />
                  Clear Results
                </Button>
              </div>
            )}
            
            <ResultAlert result={result} color="orange" />
            
            {result && (
              <ResultExplanation 
                title="Understanding Audio Analysis" 
                methods={explanationMethods} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default AudioDetection;
