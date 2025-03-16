
import { DetectionMethod } from "@/types/detection";

// Video detection methods
export const videoDetectionMethods: DetectionMethod[] = [
  { 
    name: "Facial Movement Analysis", 
    weight: 0.25,
    description: "Examines unnatural facial expressions and blinking."
  },
  { 
    name: "Audio-Visual Sync Detection", 
    weight: 0.2,
    description: "Checks if lip movements match the audio track."
  },
  { 
    name: "Temporal Consistency Check", 
    weight: 0.2,
    description: "Detects inconsistencies in lighting, shadows, and movements."
  },
  { 
    name: "Deep Neural Network Analysis", 
    weight: 0.35,
    description: "Uses AI to identify patterns typical of deepfake generation."
  }
];
