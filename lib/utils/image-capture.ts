import html2canvas from 'html2canvas';

/**
 * Wait for all images to load within an element
 */
function waitForImages(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const images = element.querySelectorAll('img');
    if (images.length === 0) {
      resolve();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const checkComplete = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        resolve();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        checkComplete();
      } else {
        img.onload = checkComplete;
        img.onerror = checkComplete; // Continue even if image fails
      }
    });
  });
}

/**
 * Wait for SVG/charts to render (Recharts uses SVG)
 */
function waitForSVGs(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    const svgs = element.querySelectorAll('svg');
    if (svgs.length === 0) {
      resolve();
      return;
    }

    // Wait a bit for SVG rendering
    setTimeout(() => {
      resolve();
    }, 500);
  });
}

/**
 * Wait for fonts to load
 */
function waitForFonts(): Promise<void> {
  return new Promise((resolve) => {
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        setTimeout(resolve, 100); // Small delay after fonts load
      });
    } else {
      setTimeout(resolve, 300);
    }
  });
}

/**
 * Wait for all content to be fully loaded and rendered
 */
async function waitForContentLoad(element: HTMLElement, scrollToTop: boolean = false): Promise<void> {
  // Ensure element is visible
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    throw new Error('Element is not visible or has zero dimensions');
  }
  
  // Scroll element to top if requested (for dashboard captures)
  if (scrollToTop) {
    element.scrollTop = 0;
    // Also scroll window if element is in viewport
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  } else {
    // Scroll element into view if needed
    element.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }
  
  // Wait a bit for scroll to complete
  await new Promise(resolve => setTimeout(resolve, 200));
  
  // Wait for images
  await waitForImages(element);
  
  // Wait for SVGs/charts
  await waitForSVGs(element);
  
  // Wait for fonts
  await waitForFonts();
  
  // Additional delay to ensure animations complete and everything is painted
  // Longer delay for complex charts
  await new Promise(resolve => setTimeout(resolve, 800));
}

/**
 * Resize canvas to social media friendly dimensions
 * Supports square (1:1) and Instagram Story (9:16) formats
 */
function resizeForSocialMedia(
  canvas: HTMLCanvasElement,
  format: 'square' | 'story' = 'story'
): HTMLCanvasElement {
  const { width, height } = canvas;
  
  // Instagram Story: 1080x1920 (9:16)
  // Square: 1080x1080 (1:1)
  const targetWidth = format === 'story' ? 1080 : 1080;
  const targetHeight = format === 'story' ? 1920 : 1080;
  const targetAspectRatio = targetWidth / targetHeight; // 0.5625 for story, 1.0 for square
  
  // Calculate aspect ratio of source canvas
  const sourceAspectRatio = width / height;
  
  let newWidth: number;
  let newHeight: number;
  let offsetX = 0;
  let offsetY = 0;
  
  if (sourceAspectRatio > targetAspectRatio) {
    // Source is wider than target: fit to height, center horizontally
    newHeight = targetHeight;
    newWidth = targetHeight * sourceAspectRatio;
    offsetX = (targetWidth - newWidth) / 2;
  } else {
    // Source is taller than target: fit to width, center vertically
    newWidth = targetWidth;
    newHeight = targetWidth / sourceAspectRatio;
    offsetY = (targetHeight - newHeight) / 2;
  }
  
  // Create new canvas with target size
  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = targetWidth;
  resizedCanvas.height = targetHeight;
  
  const ctx = resizedCanvas.getContext('2d');
  if (!ctx) return canvas;
  
  // Fill background
  ctx.fillStyle = '#1a1a2e'; // messenger-dark
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  
  // Draw original canvas centered
  ctx.drawImage(canvas, offsetX, offsetY, newWidth, newHeight);
  
  return resizedCanvas;
}

/**
 * Capture an element as an image and download it
 * Optimized for social media sharing with proper loading waits
 */
export async function captureAndDownload(
  element: HTMLElement,
  filename: string,
  options?: {
    backgroundColor?: string;
    scale?: number;
    windowHeight?: number;
    windowWidth?: number;
    socialMediaOptimized?: boolean;
    socialMediaFormat?: 'square' | 'story'; // Instagram Story (9:16) or Square (1:1)
    scrollToTop?: boolean; // For dashboard captures
  }
): Promise<void> {
  try {
    // Wait for all content to be fully loaded
    await waitForContentLoad(element, options?.scrollToTop || false);
    
    const canvas = await html2canvas(element, {
      backgroundColor: options?.backgroundColor || '#1a1a2e', // messenger-dark background
      scale: options?.scale || 3, // Higher scale for better quality (3x for social media)
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: options?.windowWidth || element.scrollWidth || window.innerWidth,
      windowHeight: options?.windowHeight || element.scrollHeight || window.innerHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Hide any download buttons or UI elements we don't want in the image
        const downloadButtons = clonedDoc.querySelectorAll('[aria-label*="Download"], [title*="Save"]');
        downloadButtons.forEach((btn) => {
          (btn as HTMLElement).style.display = 'none';
        });
      },
    });

    // Resize for social media if requested (default: true, format: story for slides)
    const finalCanvas = options?.socialMediaOptimized !== false
      ? resizeForSocialMedia(canvas, options?.socialMediaFormat || 'story')
      : canvas;

    // Convert canvas to blob with high quality
    finalCanvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }, 'image/png', 1.0); // Maximum quality
  } catch (error) {
    console.error('Error capturing image:', error);
    throw error;
  }
}

/**
 * Capture an element as an image and return as data URL
 * Optimized for social media sharing with proper loading waits
 */
export async function captureAsDataURL(
  element: HTMLElement,
  options?: {
    backgroundColor?: string;
    scale?: number;
    windowHeight?: number;
    windowWidth?: number;
    socialMediaOptimized?: boolean;
    socialMediaFormat?: 'square' | 'story'; // Instagram Story (9:16) or Square (1:1)
    scrollToTop?: boolean; // For dashboard captures
  }
): Promise<string> {
  try {
    // Wait for all content to be fully loaded
    await waitForContentLoad(element, options?.scrollToTop || false);
    
    const canvas = await html2canvas(element, {
      backgroundColor: options?.backgroundColor || '#1a1a2e',
      scale: options?.scale || 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
      windowWidth: options?.windowWidth || element.scrollWidth || window.innerWidth,
      windowHeight: options?.windowHeight || element.scrollHeight || window.innerHeight,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        // Hide any download buttons or UI elements we don't want in the image
        const downloadButtons = clonedDoc.querySelectorAll('[aria-label*="Download"], [title*="Save"]');
        downloadButtons.forEach((btn) => {
          (btn as HTMLElement).style.display = 'none';
        });
      },
    });

    // Resize for social media if requested (default: true, format: story for slides)
    const finalCanvas = options?.socialMediaOptimized !== false
      ? resizeForSocialMedia(canvas, options?.socialMediaFormat || 'story')
      : canvas;

    return finalCanvas.toDataURL('image/png', 1.0); // Maximum quality
  } catch (error) {
    console.error('Error capturing image:', error);
    throw error;
  }
}

