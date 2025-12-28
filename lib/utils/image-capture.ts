import { snapdom } from '@zumer/snapdom';

// Helper: Wait for images to load
function waitForImages(element: HTMLElement): Promise<void> {
  const images = element.querySelectorAll('img');
  if (images.length === 0) return Promise.resolve();

  return Promise.all(
    Array.from(images).map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) resolve();
          else {
            img.onload = () => resolve();
            img.onerror = () => resolve();
          }
        })
    )
  ).then(() => undefined);
}

// Helper: Wait for fonts to load
function waitForFonts(): Promise<void> {
  if (document.fonts?.ready) {
    return document.fonts.ready.then(() => new Promise((resolve) => setTimeout(resolve, 100)));
  }
  return new Promise((resolve) => setTimeout(resolve, 300));
}

// Helper: Force framer-motion elements to final state
function forceFramerMotionToFinalState(element: HTMLElement): void {
  element.querySelectorAll('*').forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.style;
    if (style.transform && style.transform !== 'none') {
      if (style.opacity === '' || parseFloat(style.opacity || '1') > 0.5) {
        style.transform = 'none';
      }
    }
    if (style.opacity === '' || parseFloat(style.opacity || '1') > 0.5) {
      style.opacity = '1';
    }
  });
}

// Helper: Wait for counter animations
function waitForCounterAnimations(element: HTMLElement): Promise<void> {
  if (element.querySelector('[data-counter-ready="true"]')) return Promise.resolve();

  const hasCounter =
    element.textContent?.includes('messages') || element.querySelector('[class*="gradient"]');

  if (!hasCounter) return Promise.resolve();

  return new Promise((resolve) => {
    let attempts = 0;
    const maxAttempts = 60;
    const interval = setInterval(() => {
      if (element.querySelector('[data-counter-ready="true"]') || attempts >= maxAttempts) {
        clearInterval(interval);
        element.querySelectorAll('*').forEach((el) => {
          const htmlEl = el as HTMLElement;
          if (htmlEl.textContent && /^\d+[\d,]*$/.test(htmlEl.textContent.trim().replace(/,/g, ''))) {
            htmlEl.style.opacity = '1';
            htmlEl.style.visibility = 'visible';
          }
        });
        resolve();
      }
      attempts++;
    }, 50);
  });
}

// Helper: Wait for framer-motion animations
function waitForFramerMotionAnimations(element: HTMLElement): Promise<void> {
  const motionElements = element.querySelectorAll('[data-framer-name], [style*="transform"]');
  if (motionElements.length === 0) return Promise.resolve();

  return new Promise((resolve) => {
    setTimeout(() => {
      forceFramerMotionToFinalState(element);
      void element.offsetHeight;
      setTimeout(() => resolve(), 200);
    }, 1500);
  });
}

// Helper: Wait for all content to load
async function waitForContentLoad(element: HTMLElement, scrollToTop = false): Promise<void> {
  const rect = element.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) {
    throw new Error('Element is not visible or has zero dimensions');
  }

  if (scrollToTop) {
    element.scrollTop = 0;
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  } else {
    element.scrollIntoView({ behavior: 'instant', block: 'nearest' });
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
  await waitForCounterAnimations(element);
  await waitForFramerMotionAnimations(element);
  await waitForImages(element);
  await waitForFonts();
  await new Promise((resolve) => setTimeout(resolve, 1000));
  void element.offsetHeight;
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => requestAnimationFrame(resolve));
}

// Helper: Resize canvas for social media formats
function resizeForSocialMedia(
  canvas: HTMLCanvasElement,
  format: 'square' | 'story' = 'story'
): HTMLCanvasElement {
  const { width, height } = canvas;
  const targetWidth = 1080;
  const targetHeight = format === 'story' ? 1920 : 1080;
  const targetAspectRatio = targetWidth / targetHeight;
  const sourceAspectRatio = width / height;

  let newWidth: number;
  let newHeight: number;
  let offsetX = 0;
  let offsetY = 0;

  if (sourceAspectRatio > targetAspectRatio) {
    newHeight = targetHeight;
    newWidth = targetHeight * sourceAspectRatio;
    offsetX = (targetWidth - newWidth) / 2;
  } else {
    newWidth = targetWidth;
    newHeight = targetWidth / sourceAspectRatio;
    offsetY = (targetHeight - newHeight) / 2;
  }

  const resizedCanvas = document.createElement('canvas');
  resizedCanvas.width = targetWidth;
  resizedCanvas.height = targetHeight;
  const ctx = resizedCanvas.getContext('2d');
  if (!ctx) return canvas;

  ctx.fillStyle = '#1a1a2e';
  ctx.fillRect(0, 0, targetWidth, targetHeight);
  ctx.drawImage(canvas, offsetX, offsetY, newWidth, newHeight);
  return resizedCanvas;
}

// Helper: Wait for element to be ready
async function waitForElementReady(element: HTMLElement, maxWait = 5000): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    if (!element.isConnected) throw new Error('Element is not connected to the DOM');
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error('Element did not become ready within timeout');
}

// Helper: Find stable capture element
function findStableCaptureElement(element: HTMLElement): HTMLElement {
  if (!element.isConnected) throw new Error('Element is not connected to the DOM');
  const motionParent = element.closest('[data-framer-name]');
  if (motionParent) {
    for (const child of Array.from(element.children) as HTMLElement[]) {
      const rect = child.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0 && child.isConnected) return child;
    }
  }
  return element;
}

// Helper: Convert gradient text to SVG
async function convertGradientText(element: HTMLElement): Promise<
  Array<{ 
    element: HTMLElement; 
    originalHTML: string;
    originalDisplay?: string;
    originalWidth?: string;
    originalHeight?: string;
    originalMargin?: string;
    originalPadding?: string;
  }>
> {
  const gradientElements: Array<{ 
    element: HTMLElement; 
    originalHTML: string;
    originalDisplay?: string;
    originalWidth?: string;
    originalHeight?: string;
    originalMargin?: string;
    originalPadding?: string;
  }> = [];
  const allElements = element.querySelectorAll('*');

  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const classes = Array.from(htmlEl.classList);
    const hasGradient = classes.some((cls) => cls.includes('gradient-messenger') || cls === 'bg-clip-text');

    if (hasGradient && htmlEl.textContent?.trim()) {
      const text = htmlEl.textContent.trim();
      const computedStyle = window.getComputedStyle(htmlEl);
      const fontSize = computedStyle.fontSize;
      const fontFamily = computedStyle.fontFamily.split(',')[0].replace(/['"]/g, '');
      const fontWeight = computedStyle.fontWeight;
      const textAlign = computedStyle.textAlign;
      const display = computedStyle.display;
      const width = htmlEl.offsetWidth || 200;
      // Increase height to prevent text cutoff - use actual height or add padding
      const actualHeight = htmlEl.offsetHeight;
      const fontSizeValue = parseFloat(fontSize);
      // Add extra padding (20% of font size) to prevent bottom cutoff
      const heightPadding = fontSizeValue * 0.2;
      const height = actualHeight > 0 
        ? Math.max(actualHeight + heightPadding, fontSizeValue * 1.4) // Ensure minimum height with padding
        : fontSizeValue * 1.7;
      const lineHeight = computedStyle.lineHeight;

      // Calculate x position based on text alignment
      // Check parent's text-align if element doesn't have it explicitly
      const parentTextAlign = htmlEl.parentElement 
        ? window.getComputedStyle(htmlEl.parentElement).textAlign 
        : 'left';
      const effectiveTextAlign = (textAlign && textAlign !== 'start' && textAlign !== 'initial') 
        ? textAlign 
        : (parentTextAlign || 'left');

      let textX = '0';
      let textAnchor = 'start';
      if (effectiveTextAlign === 'center') {
        textX = (width / 2).toString();
        textAnchor = 'middle';
      } else if (effectiveTextAlign === 'right' || effectiveTextAlign === 'end') {
        textX = width.toString();
        textAnchor = 'end';
      }

      // Calculate y position - use line-height if available, otherwise center
      // Add padding to prevent bottom cutoff
      let textY: number;
      if (lineHeight && lineHeight !== 'normal') {
        const lineHeightValue = parseFloat(lineHeight);
        textY = Math.max(lineHeightValue * 0.8, fontSizeValue * 0.8); // Use larger value
      } else {
        textY = height / 2;
      }
      
      // Ensure textY doesn't exceed height (with some padding)
      const padding = fontSizeValue * 0.1;
      textY = Math.min(textY, height - padding);

      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<defs>
<linearGradient id="grad${gradientElements.length}" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#0084FF;stop-opacity:1" />
<stop offset="100%" style="stop-color:#9B59B6;stop-opacity:1" />
</linearGradient>
</defs>
<text x="${textX}" y="${textY}" text-anchor="${textAnchor}" dominant-baseline="central" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="url(#grad${gradientElements.length})">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
</svg>`;

      const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
      const img = document.createElement('img');
      img.src = svgDataUrl;
      img.style.width = width + 'px';
      img.style.height = height + 'px';
      
      // Preserve original display and alignment properties
      img.style.display = display || 'inline-block';
      img.style.verticalAlign = computedStyle.verticalAlign || 'baseline';
      img.style.margin = computedStyle.margin;
      img.style.padding = computedStyle.padding;

      // Store original properties for restoration
      const originalDisplay = htmlEl.style.display;
      const originalWidth = htmlEl.style.width;
      const originalHeight = htmlEl.style.height;
      const originalMargin = htmlEl.style.margin;
      const originalPadding = htmlEl.style.padding;

      gradientElements.push({ 
        element: htmlEl, 
        originalHTML: htmlEl.innerHTML,
        originalDisplay,
        originalWidth,
        originalHeight,
        originalMargin,
        originalPadding
      });
      
      htmlEl.innerHTML = '';
      // Preserve original display style
      htmlEl.style.display = display || 'block';
      htmlEl.style.width = width + 'px';
      htmlEl.style.height = height + 'px';
      htmlEl.appendChild(img);
    }
  });

  if (gradientElements.length > 0) {
    await Promise.all(
      gradientElements.map(
        ({ element: el }) =>
          new Promise<void>((resolve) => {
            const img = el.querySelector('img');
            if (img) {
              if (img.complete) resolve();
              else {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              }
            } else resolve();
          })
      )
    );
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return gradientElements;
}

// Helper: Ensure element is visible and ready for capture
function ensureElementVisible(element: HTMLElement): void {
  // Just ensure element is in view - don't modify its natural appearance
  const rect = element.getBoundingClientRect();
  if (rect.top < 0 || rect.left < 0 || rect.bottom > window.innerHeight || rect.right > window.innerWidth) {
    element.scrollIntoView({ behavior: 'instant', block: 'center' });
  }
}

// Helper: Expand container to fit all content for capture (handles overflow)
function expandForCapture(element: HTMLElement): { restore: () => void } {
  const originalStyles: Map<HTMLElement, { overflow: string; height: string; maxHeight: string; minHeight: string }> = new Map();
  
  // Find all ancestors with overflow hidden/auto/scroll and expand them
  let current: HTMLElement | null = element;
  while (current) {
    const style = window.getComputedStyle(current);
    if (style.overflow !== 'visible' || style.overflowY !== 'visible') {
      originalStyles.set(current, {
        overflow: current.style.overflow,
        height: current.style.height,
        maxHeight: current.style.maxHeight,
        minHeight: current.style.minHeight,
      });
      current.style.overflow = 'visible';
      current.style.height = 'auto';
      current.style.maxHeight = 'none';
      current.style.minHeight = 'auto';
    }
    current = current.parentElement;
  }
  
  // Also expand the element itself
  const elementOriginal = {
    overflow: element.style.overflow,
    height: element.style.height,
    maxHeight: element.style.maxHeight,
    minHeight: element.style.minHeight,
  };
  element.style.overflow = 'visible';
  element.style.height = 'auto';
  element.style.maxHeight = 'none';
  
  return {
    restore: () => {
      element.style.overflow = elementOriginal.overflow;
      element.style.height = elementOriginal.height;
      element.style.maxHeight = elementOriginal.maxHeight;
      element.style.minHeight = elementOriginal.minHeight;
      
      originalStyles.forEach((styles, el) => {
        el.style.overflow = styles.overflow;
        el.style.height = styles.height;
        el.style.maxHeight = styles.maxHeight;
        el.style.minHeight = styles.minHeight;
      });
    }
  };
}

// Helper: Convert video elements to canvas images for capture
async function convertVideosToImages(
  element: HTMLElement
): Promise<Array<{ video: HTMLVideoElement; canvas: HTMLCanvasElement; parent: HTMLElement }>> {
  const videoElements: Array<{ video: HTMLVideoElement; canvas: HTMLCanvasElement; parent: HTMLElement }> = [];
  const videos = element.querySelectorAll('video');

  for (const video of Array.from(videos)) {
    const parent = video.parentElement;
    if (!parent) continue;

    // Create canvas with video dimensions
    const canvas = document.createElement('canvas');
    const videoWidth = video.videoWidth || video.offsetWidth || 640;
    const videoHeight = video.videoHeight || video.offsetHeight || 360;
    canvas.width = videoWidth;
    canvas.height = videoHeight;
    
    // Copy video styles to canvas
    canvas.style.cssText = window.getComputedStyle(video).cssText;
    canvas.style.width = video.offsetWidth + 'px';
    canvas.style.height = video.offsetHeight + 'px';
    canvas.className = video.className;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw current video frame to canvas
      try {
        ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
      } catch {
        // If video can't be drawn (cross-origin), fill with placeholder
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, videoWidth, videoHeight);
        ctx.fillStyle = '#fff';
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Video Preview', videoWidth / 2, videoHeight / 2);
      }
    }

    videoElements.push({ video, canvas, parent });
    
    // Replace video with canvas
    video.style.display = 'none';
    parent.insertBefore(canvas, video);
  }

  return videoElements;
}

// Helper: Restore video elements after capture
function restoreVideos(
  videoElements: Array<{ video: HTMLVideoElement; canvas: HTMLCanvasElement; parent: HTMLElement }>
): void {
  for (const { video, canvas, parent } of videoElements) {
    video.style.display = '';
    parent.removeChild(canvas);
  }
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
    socialMediaOptimized?: boolean;
    socialMediaFormat?: 'square' | 'story';
    scrollToTop?: boolean;
  }
): Promise<void> {
  let captureElement: HTMLElement;
  try {
    captureElement = findStableCaptureElement(element);
  } catch {
    if (!element.isConnected) {
      throw new Error('Element is not connected to the DOM. Please wait for the slide to finish loading.');
    }
    captureElement = element;
  }

  try {
    if (!captureElement.isConnected) {
      throw new Error('Element is not connected to the DOM. Please wait for the slide to finish loading.');
    }

    await waitForElementReady(captureElement);
    await waitForContentLoad(captureElement, options?.scrollToTop || false);

    if (!captureElement.isConnected) {
      throw new Error('Element was removed from DOM during capture preparation. Please try again.');
    }

    // Ensure element is visible without modifying its appearance
    ensureElementVisible(captureElement);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const rect = captureElement.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      throw new Error('Element has no dimensions. Please wait for the slide to finish loading.');
    }

    // Wait for final paint
    await new Promise((resolve) => requestAnimationFrame(resolve));

    // Expand container to capture all content (handles overflow)
    const { restore: restoreExpand } = expandForCapture(captureElement);
    await new Promise((resolve) => setTimeout(resolve, 50)); // Let layout settle

    // Convert videos to canvas images for capture
    const videoElements = await convertVideosToImages(captureElement);

    // Convert gradient text to SVG
    const gradientElements = await convertGradientText(captureElement);

    // Filter function for snapdom - hide download buttons
    const filter = (el: Element): boolean => {
      if (!(el instanceof HTMLElement)) return true;
      const ariaLabel = el.getAttribute('aria-label');
      const title = el.getAttribute('title');
      const textContent = el.textContent || '';
      return !(
        (ariaLabel?.includes('Download') || title?.includes('Save')) ||
        textContent.includes('View Full Dashboard') ||
        textContent.includes('Dashboard')
      );
    };

    // Capture with snapdom using best practices
    let snapResult;
    let svgBlob: Blob;
    try {
      snapResult = await snapdom(captureElement, {
        backgroundColor: options?.backgroundColor || '#1a1a2e',
        scale: options?.scale || 3,
        quality: 1.0,
        filter,
        outerTransforms: false,
        outerShadows: false,
      });

      // Convert snapdom SVG result to PNG using canvas
      svgBlob = await snapResult.toBlob();
    } finally {
      // Restore container immediately after capture
      restoreExpand();
    }
    const svgUrl = URL.createObjectURL(svgBlob);
    
    // Create an image from the SVG and draw to canvas to get PNG
    const bgColor = options?.backgroundColor || '#1a1a2e';
    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Failed to get canvas context'));
          return;
        }
        // Fill background color first
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Then draw the SVG on top
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(svgUrl);
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create PNG blob'));
          }
        }, 'image/png', 1.0);
      };
      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG for PNG conversion'));
      };
      img.src = svgUrl;
    });

    // Restore gradient elements
    gradientElements.forEach(({ 
      element: el, 
      originalHTML,
      originalDisplay,
      originalWidth,
      originalHeight,
      originalMargin,
      originalPadding
    }) => {
      el.innerHTML = originalHTML;
      if (originalDisplay !== undefined) el.style.display = originalDisplay;
      if (originalWidth !== undefined) el.style.width = originalWidth;
      if (originalHeight !== undefined) el.style.height = originalHeight;
      if (originalMargin !== undefined) el.style.margin = originalMargin;
      if (originalPadding !== undefined) el.style.padding = originalPadding;
    });

    // Restore video elements
    restoreVideos(videoElements);

    // Detect if we're on desktop (width > 768px)
    const isDesktop = window.innerWidth > 768;
    
    // Skip social media optimization on desktop - just download the raw capture
    // On mobile, use story format (9:16) for better sharing
    const shouldOptimize = options?.socialMediaOptimized !== false && !isDesktop;
    const format = options?.socialMediaFormat || 'story';

    // Convert to canvas for social media resizing if needed (mobile only)
    if (shouldOptimize) {
      const img = new Image();
      const imgUrl = URL.createObjectURL(pngBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(imgUrl);

          const finalCanvas = resizeForSocialMedia(canvas, format);
          finalCanvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to create image blob'));
              return;
            }
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setTimeout(() => URL.revokeObjectURL(url), 100);
            resolve();
          }, 'image/png', 1.0);
        };
        img.onerror = () => {
          URL.revokeObjectURL(imgUrl);
          reject(new Error('Failed to load captured image'));
        };
        img.src = imgUrl;
      });
    } else {
      // Direct download without resizing
      const url = URL.createObjectURL(pngBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }

  } catch (error) {
    console.error('Error capturing image:', error);
    if (error instanceof Error) {
      if (error.message.includes('Unable to find element')) {
        throw new Error('Unable to capture image. The slide may still be transitioning. Please wait a moment and try again.');
      }
      throw error;
    }
    throw error;
  }
}
