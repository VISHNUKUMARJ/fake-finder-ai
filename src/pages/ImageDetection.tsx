
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUploader } from "@/components/detection/FileUploader";
import { AnalysisProgress } from "@/components/detection/AnalysisProgress";
import { ResultAlert } from "@/components/detection/ResultAlert";
import { ResultExplanation } from "@/components/detection/ResultExplanation";
import { useImageAnalysis } from "@/hooks/useImageAnalysis";
import { imageDetectionMethods } from "@/components/detection/image/ImageDetectionMethods";

const ImageDetection = () => {
  const [file, setFile] = useState<File | null>(null);
  const {
    isAnalyzing,
    progress,
    activeMethod,
    setActiveMethod,
    methodResults,
    result,
    handleAnalyze
  } = useImageAnalysis(file);

  const handleFileSelected = (selectedFile: File) => {
    setFile(selectedFile);
  };

  const explanationMethods = imageDetectionMethods.map(method => ({
    name: method.name,
    description: method.description || ""
  }));

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
              <AnalysisProgress
                progress={progress}
                activeMethod={activeMethod}
                methodResults={methodResults}
                methods={imageDetectionMethods}
              />
            )}
            
            <ResultAlert result={result} color="red" />
            
            {result && (
              <ResultExplanation 
                title="Understanding Results" 
                methods={explanationMethods} 
              />
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ImageDetection;
