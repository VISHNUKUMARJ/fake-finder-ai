
import { File } from "@/types/detection";

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
        (img.width === 768 && img.height === 768);
      
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
    'ai', 'generated', 'midjourney', 'dalle', 'stable-diffusion', 'synthetic',
    'deepfake', 'gpt', 'artificial', 'neural', 'gan', 'stylegan', 'diffusion'
  ];
  
  return aiSignifiers.some(term => lowerFilename.includes(term));
};

/**
 * Checks if file size is suspiciously small for the file type
 */
export const isSuspiciouslySmall = (file: File): boolean => {
  const fileType = file.type;
  const fileSize = file.size;
  return fileSize < 100000 && fileType.includes('image/');
};
