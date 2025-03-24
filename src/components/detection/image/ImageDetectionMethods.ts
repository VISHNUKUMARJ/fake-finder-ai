
import { DetectionMethod } from "@/types/detection";

// Image detection methods
export const imageDetectionMethods: DetectionMethod[] = [
  { 
    name: "Watermark Detection", 
    weight: 0.3,
    description: "Identifies invisible AI watermarks embedded by generation tools like DALL-E, Midjourney, and Stable Diffusion."
  },
  { 
    name: "Error Level Analysis", 
    weight: 0.3,
    description: "Detects inconsistencies in compression artifacts and noise patterns typical in AI-generated images."
  },
  { 
    name: "Face Detection & Analysis", 
    weight: 0.2,
    description: "Identifies unnatural symmetry, perfect features, and unrealistic details in faces."
  },
  { 
    name: "Neural Network Pattern Recognition", 
    weight: 0.2,
    description: "Uses deep learning to detect model-specific generation patterns and artifacts."
  }
];
