
/**
 * Checks if the image dimensions match common AI generation sizes
 */
export const isPerfectDimensions = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create a temporary image object
    const img = new Image();
    img.onload = () => {
      // Check if dimensions are perfect squares or standard AI output sizes
      // Only exact matches to known AI sizes
      const isStandardAISize = 
        (img.width === 512 && img.height === 512) ||
        (img.width === 1024 && img.height === 1024) ||
        (img.width === 768 && img.height === 768) ||
        (img.width === 256 && img.height === 256) ||
        (img.width === 2048 && img.height === 2048) ||
        // Standard sizes from specific models
        (img.width === 1024 && img.height === 1792) || // DALL-E 3 portrait
        (img.width === 1792 && img.height === 1024) || // DALL-E 3 landscape
        (img.width === 1344 && img.height === 768) ||  // Midjourney standard
        (img.width === 896 && img.height === 1152);    // Midjourney portrait
      
      URL.revokeObjectURL(img.src); // Clean up
      resolve(isStandardAISize);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src); // Clean up
      resolve(false);
    };
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Checks filename for signs of AI generation
 */
export const checkFilenameForAI = (filename: string): boolean => {
  const lowerFilename = filename.toLowerCase();
  // More specific matching patterns to avoid false positives
  const aiSignifiers = [
    '-ai-', 'ai-', '-ai', '_ai_', 'ai_', '_ai',
    'generated-by', 'midjourney', 'dalle', 'dall-e', 
    'stable-diffusion', 'deepfake', 'stylegan'
  ];
  
  return aiSignifiers.some(term => lowerFilename.includes(term));
};

/**
 * Checks if file size is suspiciously small for the file type
 */
export const isSuspiciouslySmall = (file: File): boolean => {
  const fileType = file.type;
  const fileSize = file.size;
  
  // More conservative thresholds to reduce false positives
  if (fileType.includes('image/jpeg') || fileType.includes('image/jpg')) {
    return fileSize < 80000; // JPEGs smaller than 80KB are suspicious
  }
  
  if (fileType.includes('image/png')) {
    return fileSize < 120000; // PNGs smaller than 120KB are suspicious
  }
  
  return fileSize < 60000 && fileType.includes('image/');
};
