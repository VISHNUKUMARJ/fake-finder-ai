
import { DetectionMethod } from "@/types/detection";

// Text detection methods
export const textDetectionMethods: DetectionMethod[] = [
  { 
    name: "Statistical Pattern Analysis", 
    weight: 0.2,
    description: "Analyzes text patterns for statistical anomalies."
  },
  { 
    name: "Perplexity Measurement", 
    weight: 0.2,
    description: "Measures how predictable the text is to language models."
  },
  { 
    name: "Stylometric Analysis", 
    weight: 0.3,
    description: "Examines writing style and consistency of tone."
  },
  { 
    name: "Semantic Consistency Check", 
    weight: 0.3,
    description: "Checks logical flow and coherence throughout the text."
  }
];

export const textFeatures = [
  { name: "Repeated Phrases", humanRange: [0, 30], aiRange: [20, 75] },
  { name: "Sentence Complexity", humanRange: [40, 90], aiRange: [60, 95] },
  { name: "Linguistic Diversity", humanRange: [50, 95], aiRange: [20, 70] },
  { name: "Contextual Coherence", humanRange: [60, 95], aiRange: [30, 85] },
  { name: "Factual Consistency", humanRange: [70, 95], aiRange: [30, 80] }
];
