import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronDown, Globe, Database, Brain, RefreshCw, Download, ShieldAlert } from "lucide-react";
import { useTrainableDetection, getAvailableDatasets } from "@/context/TrainableDetectionContext";
import { DetectionType } from "@/types/detection";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface OnlineDatasetTrainingProps {
  type: DetectionType;
  onClose: () => void;
}

export const OnlineDatasetTraining = ({ type, onClose }: OnlineDatasetTrainingProps) => {
  const { modelState, trainModel, testModel, downloadPretrainedModel, isAdmin } = useTrainableDetection();
  const [activeTab, setActiveTab] = useState<"browse" | "train" | "test">("browse");
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const [customDatasetUrl, setCustomDatasetUrl] = useState<string>("");
  const [testDatasetUrl, setTestDatasetUrl] = useState<string>("");
  const [epochs, setEpochs] = useState(10);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [isTraining, setIsTraining] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<{accuracy: number} | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const availableDatasets = getAvailableDatasets(type);
  const currentModel = modelState[type];

  useEffect(() => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can access model training features.",
      });
      onClose();
    }
  }, [isAdmin, onClose, toast]);
  
  const handleSelectDataset = (dataset: string) => {
    setSelectedDataset(dataset);
  };
  
  const handleStartTraining = async () => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can train models.",
      });
      return;
    }
    
    const datasetUrl = selectedDataset || customDatasetUrl;
    if (!datasetUrl) return;
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 500);
    
    try {
      await trainModel(type, datasetUrl, epochs);
      setTrainingProgress(100);
      setActiveTab("test");
    } catch (error) {
      console.error("Training error:", error);
    } finally {
      clearInterval(interval);
      setIsTraining(false);
    }
  };
  
  const handleDownloadPretrained = async () => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can download pretrained models.",
      });
      return;
    }
    
    setIsTraining(true);
    setTrainingProgress(0);
    
    const interval = setInterval(() => {
      setTrainingProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return 95;
        }
        return prev + Math.floor(Math.random() * 8) + 2;
      });
    }, 300);
    
    try {
      await downloadPretrainedModel(type);
      setTrainingProgress(100);
      setActiveTab("test");
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      clearInterval(interval);
      setIsTraining(false);
    }
  };
  
  const handleTestModel = async () => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can test models.",
      });
      return;
    }
    
    if (!testDatasetUrl && !selectedDataset) return;
    
    setIsTesting(true);
    
    try {
      const results = await testModel(type, testDatasetUrl || selectedDataset);
      setTestResults(results);
    } catch (error) {
      console.error("Testing error:", error);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isAdmin) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            Access Denied
          </CardTitle>
          <CardDescription>
            This feature requires administrator privileges
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-medium mb-2">Administrator Access Required</h3>
          <p className="text-center text-muted-foreground mb-6 max-w-md">
            Only administrators can train and test detection models. 
            Please contact your system administrator if you need access to this feature.
          </p>
          <Button onClick={onClose}>
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Train {type.charAt(0).toUpperCase() + type.slice(1)} Detection with Online Datasets
        </CardTitle>
        <CardDescription>
          Use online datasets to train your AI detection model and improve accuracy
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse">Browse Datasets</TabsTrigger>
            <TabsTrigger value="train">Train Model</TabsTrigger>
            <TabsTrigger value="test">Test Model</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse">
            <div className="space-y-6 mt-4">
              <div className="grid gap-4">
                <h3 className="text-lg font-medium">Available Online Datasets</h3>
                <p className="text-sm text-muted-foreground">
                  Select from curated datasets or enter a custom dataset URL
                </p>
                
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="datasets">
                    <AccordionTrigger className="text-base font-medium">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Curated {type} Datasets
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2 mt-2">
                        {availableDatasets.map((dataset, index) => (
                          <div 
                            key={index}
                            className={`p-3 border rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                              selectedDataset === dataset ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' : ''
                            }`}
                            onClick={() => handleSelectDataset(dataset)}
                          >
                            <div className="font-medium">{dataset.split('/').pop()}</div>
                            <div className="text-sm text-muted-foreground truncate">{dataset}</div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="space-y-2 mt-2">
                  <h4 className="text-sm font-medium">Or enter a custom dataset URL</h4>
                  <Input
                    placeholder="Enter dataset URL (Kaggle, Hugging Face, etc.)"
                    value={customDatasetUrl}
                    onChange={(e) => setCustomDatasetUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-md mt-4">
                  <h4 className="font-medium mb-2">Current Model Information</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Version: <span className="font-medium">{currentModel.modelVersion}</span></div>
                    <div>Accuracy: <span className="font-medium">{(currentModel.accuracy * 100).toFixed(1)}%</span></div>
                    <div>Custom Trained: <span className="font-medium">{currentModel.isCustomTrained ? 'Yes' : 'No'}</span></div>
                    <div>Last Trained: <span className="font-medium">
                      {currentModel.lastTrainedAt 
                        ? new Date(currentModel.lastTrainedAt).toLocaleDateString() 
                        : 'Never'}
                    </span></div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadPretrained}
                    disabled={isTraining}
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Pretrained Model
                  </Button>
                  
                  <Button
                    onClick={() => setActiveTab("train")}
                    disabled={!selectedDataset && !customDatasetUrl}
                  >
                    Next: Configure Training
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="train">
            <div className="space-y-6 mt-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Selected Dataset</h3>
                <p className="text-sm text-muted-foreground break-all">
                  {selectedDataset || customDatasetUrl || "No dataset selected"}
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Training Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Number of Epochs</label>
                    <Select
                      value={epochs.toString()}
                      onValueChange={(value) => setEpochs(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select epochs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 (Quick)</SelectItem>
                        <SelectItem value="10">10 (Standard)</SelectItem>
                        <SelectItem value="20">20 (Thorough)</SelectItem>
                        <SelectItem value="50">50 (Extended)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      More epochs = better accuracy but longer training time
                    </p>
                  </div>
                </div>
              </div>
              
              {isTraining ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Training in Progress</h3>
                  <Progress value={trainingProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Training model... {trainingProgress}%
                  </p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Train Your Model</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
                    Training will improve the AI's ability to detect {type} manipulation based on the selected dataset.
                  </p>
                  <Button onClick={handleStartTraining} className="gap-1">
                    <RefreshCw className="h-4 w-4" />
                    Start Training
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("browse")}>
                Back: Browse Datasets
              </Button>
              <Button
                onClick={() => setActiveTab("test")}
                disabled={!currentModel.isCustomTrained}
              >
                Next: Test Model
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="test">
            <div className="space-y-6 mt-4">
              <div className="bg-green-50 dark:bg-green-950/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2 flex items-center gap-2">
                  <Brain className="h-5 w-5 text-green-500" />
                  Trained Model
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Version: <span className="font-medium">{currentModel.modelVersion}</span></div>
                  <div>Accuracy: <span className="font-medium">{(currentModel.accuracy * 100).toFixed(1)}%</span></div>
                  <div>Custom Trained: <span className="font-medium">{currentModel.isCustomTrained ? 'Yes' : 'No'}</span></div>
                  <div>Last Trained: <span className="font-medium">
                    {currentModel.lastTrainedAt 
                      ? new Date(currentModel.lastTrainedAt).toLocaleDateString() 
                      : 'Never'}
                  </span></div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Test with Dataset</h3>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Test Dataset</label>
                  <Select
                    value={selectedDataset}
                    onValueChange={setSelectedDataset}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a test dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDatasets.map((dataset, index) => (
                        <SelectItem key={index} value={dataset}>
                          {dataset.split('/').pop()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Or enter custom test dataset URL</label>
                  <Input
                    placeholder="Enter test dataset URL"
                    value={testDatasetUrl}
                    onChange={(e) => setTestDatasetUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              
              {testResults && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Test Results</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {(testResults.accuracy * 100).toFixed(1)}%
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">Accuracy on test dataset</p>
                  </div>
                </div>
              )}
              
              <Button 
                onClick={handleTestModel}
                disabled={isTesting || (!testDatasetUrl && !selectedDataset)}
                className="w-full"
              >
                {isTesting ? "Testing..." : "Test Model"}
              </Button>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setActiveTab("train")}>
                Back
              </Button>
              <Button onClick={onClose}>
                Finish
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
