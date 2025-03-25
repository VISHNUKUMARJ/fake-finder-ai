
import { createContext, useContext, useState } from "react";
import { DetectionType } from "@/types/detection";

interface ModelTrainingState {
  isCustomTrained: boolean;
  accuracy: number;
  modelVersion: string;
}

interface TrainableDetectionContextType {
  modelState: Record<DetectionType, ModelTrainingState>;
  updateModelState: (type: DetectionType, state: Partial<ModelTrainingState>) => void;
}

const initialModelState: Record<DetectionType, ModelTrainingState> = {
  image: { isCustomTrained: false, accuracy: 0.82, modelVersion: "default-v1" },
  video: { isCustomTrained: false, accuracy: 0.79, modelVersion: "default-v1" },
  audio: { isCustomTrained: false, accuracy: 0.75, modelVersion: "default-v1" },
  text: { isCustomTrained: false, accuracy: 0.85, modelVersion: "default-v1" },
};

const TrainableDetectionContext = createContext<TrainableDetectionContextType>({
  modelState: initialModelState,
  updateModelState: () => {},
});

export const TrainableDetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [modelState, setModelState] = useState<Record<DetectionType, ModelTrainingState>>(initialModelState);
  
  const updateModelState = (type: DetectionType, state: Partial<ModelTrainingState>) => {
    setModelState(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...state,
      }
    }));
  };
  
  return (
    <TrainableDetectionContext.Provider value={{ modelState, updateModelState }}>
      {children}
    </TrainableDetectionContext.Provider>
  );
};

export const useTrainableDetection = () => useContext(TrainableDetectionContext);
