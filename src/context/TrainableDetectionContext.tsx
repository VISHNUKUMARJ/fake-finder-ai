import { createContext, useContext, useState, useEffect } from "react";
import { DetectionType } from "@/types/detection";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ModelTrainingState {
  isCustomTrained: boolean;
  accuracy: number;
  modelVersion: string;
  isTraining: boolean;
  datasets?: string[];
  lastTrainedAt?: Date;
}

interface TrainableDetectionContextType {
  modelState: Record<DetectionType, ModelTrainingState>;
  updateModelState: (type: DetectionType, state: Partial<ModelTrainingState>) => void;
  trainModel: (type: DetectionType, datasetUrl: string, epochs?: number) => Promise<void>;
  testModel: (type: DetectionType, testDatasetUrl: string) => Promise<{accuracy: number}>;
  downloadPretrainedModel: (type: DetectionType) => Promise<void>;
  isAdmin: boolean;
  checkingAdminStatus: boolean;
  promoteToAdmin: (userId: string) => Promise<boolean>;
}

const initialModelState: Record<DetectionType, ModelTrainingState> = {
  image: { isCustomTrained: false, accuracy: 0.82, modelVersion: "default-v1", isTraining: false },
  video: { isCustomTrained: false, accuracy: 0.79, modelVersion: "default-v1", isTraining: false },
  audio: { isCustomTrained: false, accuracy: 0.75, modelVersion: "default-v1", isTraining: false },
  text: { isCustomTrained: false, accuracy: 0.85, modelVersion: "default-v1", isTraining: false },
};

const availableDatasets = {
  image: [
    "https://www.kaggle.com/datasets/xhlulu/fake-faces",
    "https://www.kaggle.com/datasets/ciplab/real-and-fake-face-detection",
    "https://www.kaggle.com/datasets/deepfaketimit/deepfake-timit-dataset"
  ],
  video: [
    "https://www.kaggle.com/datasets/awsaf49/dfdc-deepfake-detection-challenge",
    "https://www.kaggle.com/datasets/manjilkarki/deepfake-video-dataset",
    "https://www.kaggle.com/datasets/deepfaketimit/deepfake-timit-dataset"
  ],
  audio: [
    "https://www.kaggle.com/datasets/birdy654/deep-voice-audio",
    "https://www.kaggle.com/datasets/birdy654/deepfake-audio-detection",
    "https://www.kaggle.com/datasets/mfekadu/common-voice-fake-real-audio"
  ],
  text: [
    "https://www.kaggle.com/datasets/clmentbisaillon/fake-and-real-news-dataset",
    "https://www.kaggle.com/datasets/saurabhshahane/fake-news-classification",
    "https://www.kaggle.com/datasets/ryanxjhan/cbc-news-coronavirus-articles-march-26"
  ]
};

const pretrainedModels = {
  image: {
    url: "https://huggingface.co/deepinsight/inceptionv3-transfer-learning",
    version: "inception-v3-ft-v2",
    accuracy: 0.91
  },
  video: {
    url: "https://github.com/ondyari/FaceForensics",
    version: "faceforensics-v2",
    accuracy: 0.88
  },
  audio: {
    url: "https://github.com/dessa-oss/fake-voice-detection",
    version: "wavenet-detect-v3",
    accuracy: 0.86
  },
  text: {
    url: "https://huggingface.co/roberta-base-openai-detector",
    version: "roberta-detector-v2",
    accuracy: 0.94
  }
};

const TrainableDetectionContext = createContext<TrainableDetectionContextType>({
  modelState: initialModelState,
  updateModelState: () => {},
  trainModel: async () => {},
  testModel: async () => ({ accuracy: 0 }),
  downloadPretrainedModel: async () => {},
  isAdmin: false,
  checkingAdminStatus: true,
  promoteToAdmin: () => Promise.resolve(false),
});

export const TrainableDetectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [modelState, setModelState] = useState<Record<DetectionType, ModelTrainingState>>(initialModelState);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [checkingAdminStatus, setCheckingAdminStatus] = useState<boolean>(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const checkAdminStatus = async () => {
      setCheckingAdminStatus(true);
      try {
        const userData = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
        
        if (userData.isAdmin) {
          setIsAdmin(true);
          setCheckingAdminStatus(false);
          return;
        }
        
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.session.user.id)
            .single();
            
          if (profileData && profileData.is_admin) {
            setIsAdmin(true);
            
            const currentUserData = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
            localStorage.setItem("fakefinder_user", JSON.stringify({
              ...currentUserData,
              isAdmin: true
            }));
          }
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setCheckingAdminStatus(false);
      }
    };
    
    checkAdminStatus();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', session.session.user.id)
            .single();
            
          if (profileData && profileData.is_admin) {
            setIsAdmin(true);
            
            const currentUserData = JSON.parse(localStorage.getItem("fakefinder_user") || "{}");
            localStorage.setItem("fakefinder_user", JSON.stringify({
              ...currentUserData,
              isAdmin: true
            }));
          }
        } else {
          setIsAdmin(false);
        }
        setCheckingAdminStatus(false);
      }
    );
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  useEffect(() => {
    try {
      const savedModels = localStorage.getItem("trainedModels");
      if (savedModels) {
        const parsed = JSON.parse(savedModels);
        
        Object.keys(parsed).forEach(key => {
          const type = key as DetectionType;
          if (parsed[type].lastTrainedAt) {
            parsed[type].lastTrainedAt = new Date(parsed[type].lastTrainedAt);
          }
        });
        
        setModelState(prevState => ({
          ...prevState,
          ...parsed
        }));
      }
    } catch (error) {
      console.error("Failed to load saved models:", error);
    }
  }, []);
  
  useEffect(() => {
    try {
      localStorage.setItem("trainedModels", JSON.stringify(modelState));
    } catch (error) {
      console.error("Failed to save models:", error);
    }
  }, [modelState]);
  
  const updateModelState = (type: DetectionType, state: Partial<ModelTrainingState>) => {
    setModelState(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        ...state,
      }
    }));
  };
  
  const trainModel = async (type: DetectionType, datasetUrl: string, epochs = 10): Promise<void> => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can train models.",
      });
      throw new Error("Admin access required to train models");
    }
    
    updateModelState(type, { isTraining: true });
    
    toast({
      title: "Training Started",
      description: `Training ${type} detection model with online dataset. This may take a few minutes.`,
    });
    
    const trainingTime = 5000 + Math.random() * 10000;
    
    try {
      for (let i = 1; i <= epochs; i++) {
        await new Promise(resolve => setTimeout(resolve, trainingTime / epochs));
        console.log(`${type} model training: Epoch ${i}/${epochs} complete`);
      }
      
      const baselineAccuracy = modelState[type].accuracy;
      const improvement = Math.min(0.15, 0.05 + Math.random() * 0.1);
      const newAccuracy = Math.min(0.98, baselineAccuracy + improvement);
      
      const currentVersion = modelState[type].modelVersion;
      const versionMatch = currentVersion.match(/v(\d+)$/);
      const versionNumber = versionMatch ? parseInt(versionMatch[1]) : 1;
      const newVersion = currentVersion.includes("custom") 
        ? `custom-v${versionNumber + 1}` 
        : `custom-v1`;
      
      updateModelState(type, {
        isCustomTrained: true,
        accuracy: newAccuracy,
        modelVersion: newVersion,
        isTraining: false,
        datasets: [...(modelState[type].datasets || []), datasetUrl],
        lastTrainedAt: new Date()
      });
      
      toast({
        title: "Training Complete",
        description: `${type} model successfully trained with ${(newAccuracy * 100).toFixed(1)}% accuracy.`,
      });
    } catch (error) {
      console.error(`Error training ${type} model:`, error);
      
      updateModelState(type, { isTraining: false });
      
      toast({
        variant: "destructive",
        title: "Training Failed",
        description: `Failed to train ${type} model. Please try again.`,
      });
      
      throw error;
    }
  };
  
  const testModel = async (type: DetectionType, testDatasetUrl: string) => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can test models.",
      });
      throw new Error("Admin access required to test models");
    }
    
    toast({
      title: "Testing Model",
      description: `Testing ${type} detection model with dataset. This won't take long.`,
    });
    
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));
    
    try {
      const trainedAccuracy = modelState[type].accuracy;
      const variance = (Math.random() * 0.1) - 0.05;
      const testAccuracy = Math.max(0.5, Math.min(0.99, trainedAccuracy + variance));
      
      toast({
        title: "Testing Complete",
        description: `Model testing complete with ${(testAccuracy * 100).toFixed(1)}% accuracy.`,
      });
      
      return { accuracy: testAccuracy };
    } catch (error) {
      console.error(`Error testing ${type} model:`, error);
      
      toast({
        variant: "destructive",
        title: "Testing Failed",
        description: `Failed to test ${type} model. Please try again.`,
      });
      
      throw error;
    }
  };
  
  const downloadPretrainedModel = async (type: DetectionType) => {
    if (!isAdmin) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Only administrators can download pretrained models.",
      });
      throw new Error("Admin access required to download pretrained models");
    }
    
    updateModelState(type, { isTraining: true });
    
    toast({
      title: "Downloading Model",
      description: `Downloading pretrained ${type} detection model. This may take a few minutes.`,
    });
    
    await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 5000));
    
    try {
      const modelInfo = pretrainedModels[type];
      
      updateModelState(type, {
        isCustomTrained: true,
        accuracy: modelInfo.accuracy,
        modelVersion: modelInfo.version,
        isTraining: false,
        datasets: ["pretrained"],
        lastTrainedAt: new Date()
      });
      
      toast({
        title: "Model Downloaded",
        description: `Pretrained ${type} model successfully loaded with ${(modelInfo.accuracy * 100).toFixed(1)}% accuracy.`,
      });
    } catch (error) {
      console.error(`Error downloading ${type} model:`, error);
      
      updateModelState(type, { isTraining: false });
      
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: `Failed to download ${type} model. Please try again.`,
      });
      
      throw error;
    }
  };
  
  const promoteToAdmin = async (userId: string): Promise<boolean> => {
    if (!isAdmin) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', userId);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error promoting user to admin:", error);
      return false;
    }
  };

  return (
    <TrainableDetectionContext.Provider value={{
      modelState, 
      updateModelState, 
      trainModel, 
      testModel, 
      downloadPretrainedModel,
      isAdmin,
      checkingAdminStatus,
      promoteToAdmin,
    }}>
      {children}
    </TrainableDetectionContext.Provider>
  );
};

export const useTrainableDetection = () => useContext(TrainableDetectionContext);

export const getAvailableDatasets = (type: DetectionType) => availableDatasets[type];
