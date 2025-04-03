
/**
 * Checks if the image dimensions match common AI generation sizes
 */
export const isPerfectDimensions = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    // Create a temporary image object
    const img = new Image();
    img.onload = () => {
      // Check if dimensions are perfect squares or standard AI output sizes
      const isPerfectSquare = img.width === img.height;
      const isStandardAISize = 
        (img.width === 512 && img.height === 512) ||
        (img.width === 1024 && img.height === 1024) ||
        (img.width === 768 && img.height === 768) ||
        (img.width === 256 && img.height === 256) ||
        (img.width === 1024 && img.height === 1024) ||
        (img.width === 2048 && img.height === 2048) ||
        // Add more standard Midjourney, DALL-E, and Stable Diffusion sizes
        (img.width === 1024 && img.height === 1792) || // DALL-E 3 portrait
        (img.width === 1792 && img.height === 1024) || // DALL-E 3 landscape
        (img.width === 1344 && img.height === 768) ||  // Midjourney standard
        (img.width === 896 && img.height === 1152);    // Midjourney portrait
      
      URL.revokeObjectURL(img.src); // Clean up
      resolve(isPerfectSquare || isStandardAISize);
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
  const aiSignifiers = [
    'ai', 'generated', 'midjourney', 'mj', 'dalle', 'dall-e', 'stable-diffusion', 'sd', 
    'synthetic', 'deepfake', 'gpt', 'artificial', 'neural', 'gan', 'stylegan', 'diffusion',
    'leonardo', 'ai-gen', 'aiart', 'openai', 'generative'
  ];
  
  return aiSignifiers.some(term => lowerFilename.includes(term));
};

/**
 * Checks if file size is suspiciously small for the file type
 */
export const isSuspiciouslySmall = (file: File): boolean => {
  const fileType = file.type;
  const fileSize = file.size;
  
  // More aggressive detection for smaller files
  if (fileType.includes('image/jpeg') || fileType.includes('image/jpg')) {
    return fileSize < 150000; // JPEGs smaller than 150KB are suspicious
  }
  
  if (fileType.includes('image/png')) {
    return fileSize < 200000; // PNGs smaller than 200KB are suspicious
  }
  
  return fileSize < 100000 && fileType.includes('image/');
};
