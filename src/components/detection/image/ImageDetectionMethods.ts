
import { DetectionMethod } from "@/types/detection";

// Image detection methods
export const imageDetectionMethods: DetectionMethod[] = [
  { 
    name: "Metadata Analysis", 
    weight: 0.25,
    description: "Examines image EXIF data for AI generation fingerprints and tampering signs."
  },
  { 
    name: "Error Level Analysis", 
    weight: 0.25,
    description: "Detects inconsistencies in compression patterns typical in AI-generated images."
  },
  { 
    name: "Face Detection & Analysis", 
    weight: 0.2,
    description: "Identifies unnatural symmetry, perfect features, and unrealistic details in faces."
  },
  { 
    name: "Neural Network Pattern Recognition", 
    weight: 0.3,
    description: "Uses deep learning to detect AI model-specific generation patterns."
  }
];
