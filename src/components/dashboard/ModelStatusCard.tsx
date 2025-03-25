
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, BarChart } from "lucide-react";
import { DetectionType } from "@/types/detection";
import { useTrainableDetection } from "@/context/TrainableDetectionContext";

interface ModelStatusCardProps {
  type: DetectionType;
}

export const ModelStatusCard = ({ type }: ModelStatusCardProps) => {
  const { modelState } = useTrainableDetection();
  const model = modelState[type];

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
        <CardTitle className="text-lg">{typeLabels[type]} Model</CardTitle>
        <CardDescription>
          {model.isCustomTrained ? "Custom trained model" : "Default detection model"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
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
      </CardContent>
    </Card>
  );
};
