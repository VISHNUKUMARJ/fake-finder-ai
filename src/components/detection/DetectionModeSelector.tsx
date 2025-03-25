
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Search, Brain } from "lucide-react";
import { DetectionType } from "@/types/detection";
import { TrainingMode } from "@/components/detection/TrainingMode";

interface DetectionModeSelectorProps {
  type: DetectionType;
}

export const DetectionModeSelector = ({ type }: DetectionModeSelectorProps) => {
  const [mode, setMode] = useState<"detection" | "training">("detection");
  const [trainingModalOpen, setTrainingModalOpen] = useState(false);
  
  const handleToggleMode = () => {
    if (mode === "detection") {
      setTrainingModalOpen(true);
    } else {
      setMode("detection");
    }
  };

  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <div className="bg-muted rounded-full p-1 flex">
          <Button
            variant={mode === "detection" ? "default" : "ghost"}
            size="sm"
            className="rounded-full flex items-center gap-1"
            onClick={() => setMode("detection")}
          >
            <Search className="h-4 w-4" />
            <span>Detection</span>
          </Button>
          <Button
            variant={mode === "training" ? "default" : "ghost"}
            size="sm"
            className="rounded-full flex items-center gap-1"
            onClick={handleToggleMode}
          >
            <Brain className="h-4 w-4" />
            <span>Train & Test</span>
          </Button>
        </div>
      </div>

      <Dialog open={trainingModalOpen} onOpenChange={setTrainingModalOpen}>
        <DialogContent className="max-w-4xl p-0">
          <TrainingMode 
            type={type} 
            onClose={() => setTrainingModalOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
};
