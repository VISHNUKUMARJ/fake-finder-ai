
import { DetectionMethod } from "@/types/detection";

// Image detection methods
export const imageDetectionMethods: DetectionMethod[] = [
  { 
    name: "Metadata Analysis", 
    weight: 0.25,
    description: "Examines image EXIF data for tampering signs."
  },
  { 
    name: "Error Level Analysis", 
    weight: 0.25,
    description: "Detects inconsistencies in compression artifacts."
  },
  { 
    name: "Face Detection & Analysis", 
    weight: 0.2,
    description: "Identifies unnatural elements in facial features."
  },
  { 
    name: "Neural Network Pattern Recognition", 
    weight: 0.3,
    description: "Applies deep learning to detect AI-generated patterns."
  }
];
