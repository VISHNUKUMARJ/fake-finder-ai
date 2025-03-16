
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

const AudioDetection = () => {
  const [file, setFile] = useState<File | null>(null);
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

  const explanationMethods = audioDetectionMethods.map(method => ({
    name: method.name,
    description: method.description || ""
  }));

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
              <AnalysisProgress
                progress={progress}
                activeMethod={activeMethod}
                methodResults={methodResults}
                methods={audioDetectionMethods}
              />
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
