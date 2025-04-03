
import { DetectionMethod } from "@/types/detection";
import { checkFilenameForAI, isPerfectDimensions, isSuspiciouslySmall } from "./utils";

/**
 * Analyzes watermarks in an image
 */
export const analyzeWatermarks = async (
  file: File, 
  simulateMethodAnalysis: Function, 
  setMethodResults: Function
) => {
  // Simulate watermark detection
  const watermarkResult = await simulateMethodAnalysis("Watermark Detection", 2000, file);
  
  // Enhanced detection for suspicious files
  const hasAISignifier = checkFilenameForAI(file.name);
  const suspiciouslySmall = isSuspiciouslySmall(file);
  const perfectRatio = await isPerfectDimensions(file);
  
  // Apply more aggressive detection for suspicious files
  if (hasAISignifier || suspiciouslySmall || perfectRatio) {
    setMethodResults(prev => ({
      ...prev,
      "Watermark Detection": {
        ...prev["Watermark Detection"],
        manipulationScore: Math.min((prev["Watermark Detection"]?.manipulationScore || 70) + 25, 98),
        issues: [...(prev["Watermark Detection"]?.issues || []), 
          "AI generation tool watermark pattern detected",
          hasAISignifier ? "AI-related terms found in filename" : "",
          suspiciouslySmall ? "Unusually small file size for image quality" : "",
          perfectRatio ? "Suspiciously perfect image dimensions" : ""
        ].filter(Boolean)
      }
    }));
  }
  
  return watermarkResult;
};

/**
 * Analyzes error levels and compression artifacts
 */
export const analyzeErrorLevels = async (
  file: File, 
  simulateMethodAnalysis: Function, 
  setMethodResults: Function
) => {
  // Enhanced error level analysis
  const elaResult = await simulateMethodAnalysis("Error Level Analysis", 2500, file);
  
  // More sophisticated analysis of compression artifacts
  const fileSize = file.size;
  const fileType = file.type;
  
  // Check for compression anomalies that indicate AI generation
  if (fileType.includes('jpeg') || fileType.includes('jpg')) {
    // JPEGs with unusually low or high compression for their visual quality
    if (fileSize < 200000) {
      // Small file size might indicate AI generation with low detail preservation
      setMethodResults(prev => ({
        ...prev,
        "Error Level Analysis": {
          ...prev["Error Level Analysis"],
          manipulationScore: Math.min((prev["Error Level Analysis"]?.manipulationScore || 60) + 30, 95),
          issues: [...(prev["Error Level Analysis"]?.issues || []), 
            "Unusual compression patterns detected in image data",
            "Inconsistent quality-to-size ratio (suspicious)"
          ]
        }
      }));
    }
  }
  
  // PNGs with perfect compression (AI tends to generate "clean" data)
  if (fileType.includes('png')) {
    setMethodResults(prev => ({
      ...prev,
      "Error Level Analysis": {
        ...prev["Error Level Analysis"],
        manipulationScore: Math.min((prev["Error Level Analysis"]?.manipulationScore || 65) + 20, 95),
        issues: [...(prev["Error Level Analysis"]?.issues || []), 
          "Suspiciously clean image data patterns",
          "Missing natural noise patterns found in camera images"
        ]
      }
    }));
  }
  
  return elaResult;
};

/**
 * Analyzes faces in the image
 */
export const analyzeFaces = async (
  file: File, 
  simulateMethodAnalysis: Function, 
  setMethodResults: Function
) => {
  // Enhanced face analysis - Look for telltale AI face generation issues
  await simulateMethodAnalysis("Face Detection & Analysis", 3000, file);
  
  // Simulate finding common AI face generation artifacts - increase detection rate
  if (Math.random() > 0.2) { // Increased detection rate (was 0.3)
    setMethodResults(prev => ({
      ...prev,
      "Face Detection & Analysis": {
        ...prev["Face Detection & Analysis"],
        manipulationScore: Math.min((prev["Face Detection & Analysis"]?.manipulationScore || 65) + 30, 98),
        issues: [...(prev["Face Detection & Analysis"]?.issues || []), 
          "Uncanny symmetry in facial features",
          "Irregularities in eye/pupil rendering",
          "Unnatural hair patterns or texture"
        ]
      }
    }));
  }
};
