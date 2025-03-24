
import { DetectionMethod } from "@/types/detection";

// Video detection methods
export const videoDetectionMethods: DetectionMethod[] = [
  { 
    name: "Facial Consistency Analysis", 
    weight: 0.3,
    description: "Detects unnatural facial movements, blinking patterns, and micro-expressions."
  },
  { 
    name: "Audio-Visual Sync Detection", 
    weight: 0.25,
    description: "Identifies mismatches between lip movements and speech audio."
  },
  { 
    name: "Temporal Consistency Check", 
    weight: 0.2,
    description: "Analyzes frame-to-frame consistency in lighting, shadows, and physical objects."
  },
  { 
    name: "DeepFake Signature Detection", 
    weight: 0.25,
    description: "Identifies telltale artifacts and patterns left by deepfake generation models."
  }
];
