
export type DetectionType = 'image' | 'video' | 'text' | 'audio';

export interface SearchHistoryItem {
  id: string;
  type: DetectionType;
  filename?: string;
  textSnippet?: string;
  result: boolean;  // true means manipulated/AI-generated, false means authentic
  confidenceScore: number;
  date: string;
}

export interface DetectionMethod {
  name: string;
  weight: number;
  description?: string;
  type: string; // Add the 'type' property that was missing
}

export interface DetectionResult {
  isManipulated: boolean;
  confidenceScore: number;
  detailsText: string;
  issues?: string[];
  humanScore?: number;
}
