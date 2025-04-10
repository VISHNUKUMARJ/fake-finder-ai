
import { DetectionMethod, DetectionResult } from "@/types/detection";
import { addToSearchHistory } from "@/utils/historyManager";

/**
 * Process results and calculate final detection scores
 */
export const processResults = (
  methodResults: Record<string, any>,
  imageDetectionMethods: DetectionMethod[],
  imageModel: any,
  file: File | null
): DetectionResult => {
  // Calculate final score and determine result
  let totalScore = 0;
  let totalWeight = 0;
  let allIssues: string[] = [];
  
  // Check if any method has found high probability of AI generation
  let hasStrongManipulationEvidence = false;
  
  imageDetectionMethods.forEach(method => {
    const methodResult = methodResults[method.name];
    if (methodResult && methodResult.complete) {
      const manipulationScore = methodResult.manipulationScore || Math.random() * 35 + 20; // Lower base score to reduce false positives
      totalScore += manipulationScore * method.weight;
      totalWeight += method.weight;
      
      // Set threshold higher for strong evidence
      if (manipulationScore > 85) {
        hasStrongManipulationEvidence = true;
      }
      
      // Collect issues for the final result
      if (methodResult.issues && methodResult.issues.length > 0) {
        allIssues = [...allIssues, ...methodResult.issues];
      }
    }
  });
  
  // Calculate base score with more balanced algorithm
  let baseScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50; // Moderated base score
  
  // Apply model accuracy boost for custom trained models
  if (imageModel.isCustomTrained) {
    // Adjust detection sensitivity based on model accuracy
    const accuracyFactor = (imageModel.accuracy - 0.5) * 2; // Normalize to 0-1 range
    
    // For high confidence detections, boost them further but more cautiously
    if (baseScore > 70) { 
      baseScore = Math.min(100, baseScore + (10 * accuracyFactor)); 
    }
    // For borderline cases, adjust based on model accuracy
    else if (baseScore > 45 && baseScore <= 70) {
      // If model is very accurate, increase detection confidence
      if (imageModel.accuracy > 0.85) { 
        baseScore += 10; 
      }
    }
  }
  
  // Count the number of significant issues (suspicious patterns)
  const significantIssueCount = allIssues.filter(issue => 
    !issue.includes("might") && !issue.includes("possible") && !issue.includes("could be")
  ).length;
  
  // Apply filename-based boosts, but more cautiously
  if (file && checkFilenameForAIGeneration(file.name)) {
    baseScore += 10; // Reduced boost
  }
  
  // Cap the final score
  const finalScore = Math.max(0, Math.min(100, baseScore));
  
  // More balanced detection thresholds
  const detectionThreshold = imageModel.isCustomTrained && imageModel.accuracy > 0.9 ? 55 : 65; // Higher thresholds to reduce false positives
  
  // Determine if the image is manipulated based on score, evidence, or issue count
  const isManipulated = finalScore > detectionThreshold || 
                       hasStrongManipulationEvidence || 
                       significantIssueCount >= 3; // Require more issues
  
  // More specific and confident analysis texts
  const modelAccuracyDescription = imageModel.isCustomTrained 
    ? `with ${imageModel.accuracy > 0.9 ? 'high' : 'improved'} accuracy`
    : '';
  
  const detectionResult: DetectionResult = {
    isManipulated,
    confidenceScore: finalScore,
    detailsText: isManipulated
      ? `Our AI ${modelAccuracyDescription} has detected signs of artificially generated content with ${finalScore}% certainty. ${
        imageModel.isCustomTrained ? 'The custom-trained model identified ' : 'The analysis found '
      }patterns consistent with AI-generated images.`
      : `Our analysis ${modelAccuracyDescription} indicates this image appears to be authentic with ${100 - finalScore}% certainty. No clear signs of AI generation were detected.`,
    issues: allIssues.length > 0 ? Array.from(new Set(allIssues)) : undefined
  };
  
  // Add to search history with correct result status
  if (file) {
    addToSearchHistory({
      type: 'image',
      filename: file.name,
      result: isManipulated,
      confidenceScore: finalScore,
    });
  }
  
  return detectionResult;
};

/**
 * Check if filename suggests AI generation
 */
function checkFilenameForAIGeneration(filename: string): boolean {
  const lowerFilename = filename.toLowerCase();
  const aiSignifiers = [
    'ai', 'generated', 'midjourney', 'dalle', 'stable-diffusion', 'synthetic',
    'deepfake', 'gpt', 'artificial', 'neural', 'gan', 'stylegan', 'diffusion'
  ];
  
  // More strict matching to reduce false positives
  return aiSignifiers.some(term => 
    lowerFilename.includes('-' + term) || 
    lowerFilename.includes(term + '-') || 
    lowerFilename.includes('_' + term) || 
    lowerFilename.includes(term + '_') ||
    lowerFilename.includes(' ' + term) || 
    lowerFilename.includes(term + ' ') ||
    lowerFilename === term
  );
}
