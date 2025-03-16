
import { DetectionMethod } from "@/types/detection";

// Audio detection methods
export const audioDetectionMethods: DetectionMethod[] = [
  { 
    name: "Spectral Analysis", 
    weight: 0.25,
    description: "Examines audio frequencies for unnatural patterns."
  },
  { 
    name: "Voice Pattern Recognition", 
    weight: 0.3,
    description: "Analyzes voice characteristics for consistency."
  },
  { 
    name: "Acoustic Inconsistency Detection", 
    weight: 0.2,
    description: "Identifies unnatural background noise and transitions."
  },
  { 
    name: "Neural Audio Analysis", 
    weight: 0.25,
    description: "Uses deep learning to detect AI synthesis artifacts."
  }
];
