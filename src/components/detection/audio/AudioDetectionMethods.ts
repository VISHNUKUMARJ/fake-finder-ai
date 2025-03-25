
import { DetectionMethod } from "@/types/detection";

// Audio detection methods
export const audioDetectionMethods: DetectionMethod[] = [
  { 
    name: "Spectral Pattern Analysis", 
    weight: 0.25,
    description: "Examines frequency patterns for synthetic generation artifacts.",
    type: "audio-analysis"
  },
  { 
    name: "Voice Consistency Detection", 
    weight: 0.3,
    description: "Analyzes micro-variations in voice tone, pitch, and timbre for authenticity.",
    type: "audio-analysis"
  },
  { 
    name: "Background Noise Analysis", 
    weight: 0.2,
    description: "Identifies unnatural audio environments and inconsistent background sounds.",
    type: "audio-analysis"
  },
  { 
    name: "AI Voice Model Detection", 
    weight: 0.25,
    description: "Identifies specific patterns consistent with popular voice synthesis models.",
    type: "audio-analysis"
  }
];
