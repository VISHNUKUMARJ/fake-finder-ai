
import { DetectionMethod } from "@/types/detection";

// Image detection methods
export const imageDetectionMethods: DetectionMethod[] = [
  { 
    name: "Watermark Detection", 
    weight: 0.3, // Adjusted weight
    description: "Identifies invisible AI watermarks embedded by generation tools like DALL-E, Midjourney, and Stable Diffusion.",
    type: "image-recognition"
  },
  { 
    name: "Error Level Analysis", 
    weight: 0.35, // Maintained weight
    description: "Detects inconsistencies in compression artifacts and noise patterns typical in AI-generated images.",
    type: "image-recognition"
  },
  { 
    name: "Face Detection & Analysis", 
    weight: 0.2, // Reduced weight to minimize false positives
    description: "Identifies unnatural symmetry, perfect features, and unrealistic details in faces.",
    type: "image-recognition"
  },
  { 
    name: "Neural Network Pattern Recognition", 
    weight: 0.25, // Reduced weight
    description: "Uses deep learning to detect model-specific generation patterns and artifacts.",
    type: "image-recognition"
  }
];
