
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileUploader } from "@/components/detection/FileUploader";
import { Brain, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { DetectionType } from "@/types/detection";

interface TrainingDatasetItem {
  file?: File;
  text?: string;
  label: "authentic" | "manipulated";
}

interface TrainingModeProps {
  type: DetectionType;
  onClose: () => void;
}

export const TrainingMode = ({ type, onClose }: TrainingModeProps) => {
  const [activeTab, setActiveTab] = useState<"upload" | "train" | "test">("upload");
  const [trainingDataset, setTrainingDataset] = useState<TrainingDatasetItem[]>([]);
  const [testingDataset, setTestingDataset] = useState<TrainingDatasetItem[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [testingProgress, setTestingProgress] = useState(0);
  const [trainingResults, setTrainingResults] = useState<null | {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  }>(null);
  const [testingResults, setTestingResults] = useState<null | {
    accuracy: number;
    confusionMatrix: {
      truePositives: number;
      trueNegatives: number;
      falsePositives: number;
      falseNegatives: number;
    }
  }>(null);
  const { toast } = useToast();

  const handleFileUpload = (file: File | null, label: "authentic" | "manipulated", dataset: "training" | "testing") => {
    if (!file) return;
    
    if (dataset === "training") {
      setTrainingDataset(prev => [...prev, { file, label }]);
    } else {
      setTestingDataset(prev => [...prev, { file, label }]);
    }
    
    toast({
      title: "File added",
      description: `Added ${file.name} to ${dataset} dataset as ${label}`,
    });
  };

  const handleTextUpload = (text: string, label: "authentic" | "manipulated", dataset: "training" | "testing") => {
    if (!text.trim()) return;
    
    if (dataset === "training") {
      setTrainingDataset(prev => [...prev, { text, label }]);
    } else {
      setTestingDataset(prev => [...prev, { text, label }]);
    }
    
    toast({
      title: "Text sample added",
      description: `Added text sample to ${dataset} dataset as ${label}`,
    });
  };

  const handleStartTraining = () => {
    if (trainingDataset.length < 5) {
      toast({
        variant: "destructive",
        title: "Not enough training data",
        description: "Please add at least 5 samples to the training dataset."
      });
      return;
    }
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    // Simulate training progress
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTraining(false);
          
          // Generate simulated training results
          setTrainingResults({
            accuracy: 0.85 + Math.random() * 0.1,
            precision: 0.82 + Math.random() * 0.12,
            recall: 0.78 + Math.random() * 0.15,
            f1Score: 0.80 + Math.random() * 0.12
          });
          
          return 100;
        }
        return prev + 5;
      });
    }, 500);
  };

  const handleStartTesting = () => {
    if (testingDataset.length < 3) {
      toast({
        variant: "destructive",
        title: "Not enough test data",
        description: "Please add at least 3 samples to the testing dataset."
      });
      return;
    }
    
    if (!trainingResults) {
      toast({
        variant: "destructive",
        title: "Training required",
        description: "Please train the model before testing."
      });
      return;
    }
    
    setIsTesting(true);
    setTestingProgress(0);
    
    // Simulate testing progress
    const interval = setInterval(() => {
      setTestingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsTesting(false);
          
          // Generate simulated testing results
          const truePositives = Math.floor(testingDataset.length * 0.4);
          const trueNegatives = Math.floor(testingDataset.length * 0.35);
          const falsePositives = Math.floor(testingDataset.length * 0.15);
          const falseNegatives = Math.floor(testingDataset.length * 0.1);
          
          setTestingResults({
            accuracy: (truePositives + trueNegatives) / testingDataset.length,
            confusionMatrix: {
              truePositives,
              trueNegatives,
              falsePositives,
              falseNegatives
            }
          });
          
          return 100;
        }
        return prev + 8;
      });
    }, 300);
  };

  const getFileAcceptType = () => {
    switch (type) {
      case "image": return "image/*";
      case "video": return "video/*";
      case "audio": return "audio/*";
      default: return "*/*";
    }
  };

  const datasetSummary = (dataset: TrainingDatasetItem[]) => {
    const authenticCount = dataset.filter(item => item.label === "authentic").length;
    const manipulatedCount = dataset.filter(item => item.label === "manipulated").length;
    
    return (
      <div className="text-sm text-muted-foreground">
        <p>Total samples: {dataset.length}</p>
        <p>Authentic: {authenticCount}</p>
        <p>Manipulated: {manipulatedCount}</p>
      </div>
    );
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Train & Test {type.charAt(0).toUpperCase() + type.slice(1)} Detection AI
        </CardTitle>
        <CardDescription>
          Upload labeled datasets, train your custom model, and test its performance
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="train">Train Model</TabsTrigger>
            <TabsTrigger value="test">Test Model</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <div className="grid md:grid-cols-2 gap-6 mt-4">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Training Dataset</h3>
                
                {type !== "text" ? (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Authentic Samples</h4>
                      <FileUploader 
                        onFileSelected={(file) => handleFileUpload(file, "authentic", "training")}
                        accept={getFileAcceptType()}
                        maxSizeMB={20}
                        file={null}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Manipulated Samples</h4>
                      <FileUploader 
                        onFileSelected={(file) => handleFileUpload(file, "manipulated", "training")}
                        accept={getFileAcceptType()}
                        maxSizeMB={20}
                        file={null}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Authentic Text</h4>
                      <textarea 
                        className="w-full min-h-[120px] p-2 border rounded-md"
                        placeholder="Enter authentic text sample..."
                        onChange={(e) => e.target.value.length > 50 && handleTextUpload(e.target.value, "authentic", "training")}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          const textarea = document.querySelector('textarea');
                          if (textarea && textarea.value.length > 50) {
                            handleTextUpload(textarea.value, "authentic", "training");
                            textarea.value = '';
                          }
                        }}
                      >
                        Add Authentic Text
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">AI-Generated Text</h4>
                      <textarea 
                        className="w-full min-h-[120px] p-2 border rounded-md"
                        placeholder="Enter AI-generated text sample..."
                        onChange={(e) => e.target.value.length > 50 && handleTextUpload(e.target.value, "manipulated", "training")}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          const textareas = document.querySelectorAll('textarea');
                          if (textareas[1] && textareas[1].value.length > 50) {
                            handleTextUpload(textareas[1].value, "manipulated", "training");
                            textareas[1].value = '';
                          }
                        }}
                      >
                        Add AI Text
                      </Button>
                    </div>
                  </>
                )}
                
                {trainingDataset.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Training Dataset Summary</h4>
                    {datasetSummary(trainingDataset)}
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Testing Dataset</h3>
                
                {type !== "text" ? (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Authentic Samples</h4>
                      <FileUploader 
                        onFileSelected={(file) => handleFileUpload(file, "authentic", "testing")}
                        accept={getFileAcceptType()}
                        maxSizeMB={20}
                        file={null}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Manipulated Samples</h4>
                      <FileUploader 
                        onFileSelected={(file) => handleFileUpload(file, "manipulated", "testing")}
                        accept={getFileAcceptType()}
                        maxSizeMB={20}
                        file={null}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Authentic Text</h4>
                      <textarea 
                        className="w-full min-h-[120px] p-2 border rounded-md"
                        placeholder="Enter authentic text sample..."
                        onChange={(e) => e.target.value.length > 50 && handleTextUpload(e.target.value, "authentic", "testing")}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          const textareas = document.querySelectorAll('textarea');
                          if (textareas[2] && textareas[2].value.length > 50) {
                            handleTextUpload(textareas[2].value, "authentic", "testing");
                            textareas[2].value = '';
                          }
                        }}
                      >
                        Add Authentic Text
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">AI-Generated Text</h4>
                      <textarea 
                        className="w-full min-h-[120px] p-2 border rounded-md"
                        placeholder="Enter AI-generated text sample..."
                        onChange={(e) => e.target.value.length > 50 && handleTextUpload(e.target.value, "manipulated", "testing")}
                      />
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => {
                          const textareas = document.querySelectorAll('textarea');
                          if (textareas[3] && textareas[3].value.length > 50) {
                            handleTextUpload(textareas[3].value, "manipulated", "testing");
                            textareas[3].value = '';
                          }
                        }}
                      >
                        Add AI Text
                      </Button>
                    </div>
                  </>
                )}
                
                {testingDataset.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Testing Dataset Summary</h4>
                    {datasetSummary(testingDataset)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={() => setActiveTab("train")}
                disabled={trainingDataset.length < 5}
              >
                Next: Train Model
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="train">
            <div className="space-y-6 mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Training Dataset</h3>
                {datasetSummary(trainingDataset)}
              </div>
              
              {isTraining ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Training in Progress</h3>
                  <Progress value={trainingProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Training model... {trainingProgress}%
                  </p>
                </div>
              ) : trainingResults ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Training Complete
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">Accuracy</p>
                      <p className="text-2xl font-bold">{(trainingResults.accuracy * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">Precision</p>
                      <p className="text-2xl font-bold">{(trainingResults.precision * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-purple-50 dark:bg-purple-950/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">Recall</p>
                      <p className="text-2xl font-bold">{(trainingResults.recall * 100).toFixed(1)}%</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
                      <p className="text-sm font-medium">F1 Score</p>
                      <p className="text-2xl font-bold">{(trainingResults.f1Score * 100).toFixed(1)}%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Train Your Model</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Training will improve the AI's ability to detect {type} manipulation based on your dataset.
                  </p>
                  <Button onClick={handleStartTraining}>
                    Start Training
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("upload")}>
                Back: Upload Data
              </Button>
              <Button 
                onClick={() => setActiveTab("test")}
                disabled={!trainingResults}
              >
                Next: Test Model
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="test">
            <div className="space-y-6 mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Testing Dataset</h3>
                {datasetSummary(testingDataset)}
              </div>
              
              {isTesting ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Testing in Progress</h3>
                  <Progress value={testingProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Evaluating model... {testingProgress}%
                  </p>
                </div>
              ) : testingResults ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    Testing Complete
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Accuracy</p>
                      <p className="text-3xl font-bold mb-1">{(testingResults.accuracy * 100).toFixed(1)}%</p>
                      <p className="text-sm text-muted-foreground">
                        Overall performance on test dataset
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                      <p className="text-sm font-medium mb-2">Confusion Matrix</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                          <p className="font-medium">True Positive</p>
                          <p className="text-xl font-bold">{testingResults.confusionMatrix.truePositives}</p>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
                          <p className="font-medium">False Positive</p>
                          <p className="text-xl font-bold">{testingResults.confusionMatrix.falsePositives}</p>
                        </div>
                        <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded">
                          <p className="font-medium">False Negative</p>
                          <p className="text-xl font-bold">{testingResults.confusionMatrix.falseNegatives}</p>
                        </div>
                        <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded">
                          <p className="font-medium">True Negative</p>
                          <p className="text-xl font-bold">{testingResults.confusionMatrix.trueNegatives}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Test Your Model</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Testing will evaluate your model's performance on unseen data.
                  </p>
                  <Button onClick={handleStartTesting}>
                    Start Testing
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("train")}>
                Back: Train Model
              </Button>
              <Button 
                onClick={onClose}
              >
                Finish
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
