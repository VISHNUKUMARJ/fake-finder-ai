
import { DetectionMethod } from "@/types/detection";

// Text detection methods
export const textDetectionMethods: DetectionMethod[] = [
  { 
    name: "Pattern Recognition", 
    weight: 0.25,
    description: "Analyzes text for statistical patterns common in AI-generated content."
  },
  { 
    name: "Perplexity & Burstiness", 
    weight: 0.25,
    description: "Measures text predictability and variation patterns typical of AI models."
  },
  { 
    name: "Stylometric Fingerprinting", 
    weight: 0.25,
    description: "Examines writing style, word choice, and sentence structures."
  },
  { 
    name: "Semantic Coherence Analysis", 
    weight: 0.25,
    description: "Evaluates logical flow, factual grounding, and narrative consistency."
  }
];

export const textFeatures = [
  { name: "Repetitive Patterns", humanRange: [0, 30], aiRange: [20, 75] },
  { name: "Sentence Complexity Variance", humanRange: [40, 90], aiRange: [30, 60] },
  { name: "Linguistic Diversity", humanRange: [50, 95], aiRange: [20, 65] },
  { name: "Contextual Depth", humanRange: [60, 95], aiRange: [30, 70] },
  { name: "Factual Specificity", humanRange: [70, 95], aiRange: [30, 75] }
];
