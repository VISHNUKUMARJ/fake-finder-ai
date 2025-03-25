
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Brain, BarChart, Zap, Globe } from "lucide-react";
import { DetectionType } from "@/types/detection";
import { useTrainableDetection } from "@/context/TrainableDetectionContext";
import { TrainingMode } from "@/components/detection/TrainingMode";
import { OnlineDatasetTraining } from "@/components/detection/OnlineDatasetTraining";

interface ModelStatusCardProps {
  type: DetectionType;
}

export const ModelStatusCard = ({ type }: ModelStatusCardProps) => {
  const { modelState } = useTrainableDetection();
  const model = modelState[type];
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trainingMode, setTrainingMode] = useState<"custom" | "online">("custom");

  const typeLabels: Record<DetectionType, string> = {
    image: "Image",
    video: "Video",
    audio: "Audio",
    text: "Text"
  };
  
  const accuracyColor = () => {
    if (model.accuracy >= 0.85) return "text-green-500";
    if (model.accuracy >= 0.75) return "text-yellow-500";
    return "text-orange-500";
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{typeLabels[type]} Model</span>
          {model.isCustomTrained && (
            <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-2 py-0.5 rounded-full">
              Trained
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {model.isCustomTrained ? "Custom trained model" : "Default detection model"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-indigo-500" />
            <span className="text-sm font-medium">{model.modelVersion}</span>
          </div>
          <div className="flex items-center gap-1">
            <BarChart className={`h-4 w-4 ${accuracyColor()}`} />
            <span className={`font-medium ${accuracyColor()}`}>
              {(model.accuracy * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        
        {/* Last trained date */}
        {model.lastTrainedAt && (
          <div className="text-xs text-muted-foreground mb-3">
            Last trained: {new Date(model.lastTrainedAt).toLocaleDateString()}
          </div>
        )}
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <div className="flex gap-2">
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-1"
                onClick={() => setTrainingMode("custom")}
              >
                <Zap className="h-3 w-3" />
                Train Model
              </Button>
            </DialogTrigger>
            
            <DialogTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full gap-1"
                onClick={() => setTrainingMode("online")}
              >
                <Globe className="h-3 w-3" />
                Online Datasets
              </Button>
            </DialogTrigger>
          </div>
          
          <DialogContent className="max-w-4xl">
            {trainingMode === "custom" ? (
              <TrainingMode 
                type={type} 
                onClose={() => setDialogOpen(false)} 
              />
            ) : (
              <OnlineDatasetTraining 
                type={type} 
                onClose={() => setDialogOpen(false)} 
              />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
