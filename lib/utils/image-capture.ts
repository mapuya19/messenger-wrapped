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
 * Force all framer-motion elements to their final state
 */
function forceFramerMotionToFinalState(element: HTMLElement): void {
  // Find all elements with inline transforms/opacity (framer-motion applies these)
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el) => {
    const htmlEl = el as HTMLElement;
    const style = htmlEl.style;
    
    // If element has transform, check if it's in final state
    if (style.transform && style.transform !== 'none') {
      // For elements that should be visible, remove transform
      // This forces them to render in their natural position
      if (style.opacity === '' || parseFloat(style.opacity || '1') > 0.5) {
        style.transform = 'none';
      }
    }
    
    // Ensure opacity is 1 for visible elements
    if (style.opacity === '' || parseFloat(style.opacity || '1') > 0.5) {
      style.opacity = '1';
    }
  });
}

/**
 * Wait for counter animations to complete (like the message count counter)
 */
function waitForCounterAnimations(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    // Check if there's a counter that's marked as ready
    const counterReady = element.querySelector('[data-counter-ready="true"]');
    
    if (counterReady) {
      // Counter is already ready, resolve immediately
      resolve();
      return;
    }
    
    // Check if there's a counter animation by looking for elements that might be counting
    // The TotalMessagesSlide uses a counter that animates over 2 seconds
    const hasCounter = element.textContent && (
      element.textContent.includes('messages') || 
      element.querySelector('[class*="gradient"]') // Counter is usually in gradient text
    );
    
    if (hasCounter) {
      // Wait for counter animation to complete (2 seconds) plus a buffer
      // Poll for the data-counter-ready attribute
      let attempts = 0;
      const maxAttempts = 60; // 3 seconds max (60 * 50ms)
      const checkInterval = setInterval(() => {
        const ready = element.querySelector('[data-counter-ready="true"]');
        if (ready || attempts >= maxAttempts) {
          clearInterval(checkInterval);
          // Force counter to final state by finding number elements and ensuring they're visible
          const numberElements = element.querySelectorAll('*');
          numberElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            // If element contains a number and might be part of a counter, ensure it's visible
            if (htmlEl.textContent && /^\d+[\d,]*$/.test(htmlEl.textContent.trim().replace(/,/g, ''))) {
              htmlEl.style.opacity = '1';
              htmlEl.style.visibility = 'visible';
            }
          });
          resolve();
        }
        attempts++;
      }, 50); // Check every 50ms
    } else {
      resolve();
    }
  });
}

/**
 * Wait for framer-motion animations to complete
 */
function waitForFramerMotionAnimations(element: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    // Check for motion components (framer-motion adds data attributes)
    const motionElements = element.querySelectorAll('[data-framer-name], [style*="transform"]');
    
    if (motionElements.length === 0) {
      // No motion elements, resolve immediately
      resolve();
      return;
    }
    
    // Wait for animations to complete
    // Framer Motion animations typically take 300-500ms, but we'll wait longer
    // Also account for counter animations which can take up to 2 seconds
    setTimeout(() => {
      // Force all animations to final state
      forceFramerMotionToFinalState(element);
      
      // Force a reflow to ensure all changes are applied
      void element.offsetHeight;
      
      // Wait a bit more for the browser to paint
      setTimeout(() => {
        resolve();
      }, 200);
    }, 1500); // Wait 1.5 seconds for animations to complete
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
  
  // Wait for counter animations first (these can take up to 2 seconds)
  await waitForCounterAnimations(element);
  
  // Wait for framer-motion animations
  await waitForFramerMotionAnimations(element);
  
  // Wait for images
  await waitForImages(element);
  
  // Wait for SVGs/charts
  await waitForSVGs(element);
  
  // Wait for fonts
  await waitForFonts();
  
  // Additional delay to ensure animations complete and everything is painted
  // Longer delay for complex charts and to ensure all CSS transitions are done
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Force a final reflow to ensure everything is painted
  void element.offsetHeight;
  
  // Wait one more frame to ensure all styles are computed
  await new Promise(resolve => requestAnimationFrame(resolve));
  await new Promise(resolve => requestAnimationFrame(resolve));
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
 * Wait for element to be available and have dimensions
 */
async function waitForElementReady(element: HTMLElement, maxWait: number = 5000): Promise<void> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    const rect = element.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      // Element has dimensions, wait a bit more for layout to stabilize
      await new Promise(resolve => setTimeout(resolve, 100));
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  
  throw new Error('Element did not become ready within timeout');
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
  // Store original state for cleanup
  const originalClasses = element.className;
  const originalElementStyle = element.style.cssText;
  
  try {
    // First, ensure element is ready
    await waitForElementReady(element);
    
    // Wait for all content to be fully loaded
    await waitForContentLoad(element, options?.scrollToTop || false);
    
    // Force mobile layout for downloads
    // Use mobile viewport width (375px is standard iPhone width)
    // This ensures all responsive breakpoints (sm:, md:, lg:, xl:) use mobile styles
    const mobileViewportWidth = 375;
    
    // Temporarily set a mobile viewport class or data attribute to force mobile styles
    // This helps ensure Tailwind's responsive classes use mobile breakpoints
    element.classList.add('force-mobile-layout');
    element.setAttribute('data-mobile-capture', 'true');
    
    // Ensure element is centered before capture
    // Set explicit styles to ensure centering
    const originalElementDisplay = element.style.display;
    const originalElementWidth = element.style.width;
    const originalElementMargin = element.style.margin;
    const originalElementMaxWidth = element.style.maxWidth;
    const originalElementAlignItems = element.style.alignItems;
    const originalElementJustifyContent = element.style.justifyContent;
    const originalElementPadding = element.style.padding;
    const originalElementBoxSizing = element.style.boxSizing;
    const originalElementTextAlign = element.style.textAlign;
    
    // Set up element for centering
    // Don't constrain width too tightly - let content determine width to avoid cutoff
    element.style.display = 'flex';
    element.style.flexDirection = 'column';
    element.style.alignItems = 'center';
    element.style.justifyContent = 'center';
    element.style.width = 'auto'; // Let content determine width
    element.style.maxWidth = `${mobileViewportWidth}px`; // But cap at mobile width
    element.style.margin = '0 auto';
    element.style.boxSizing = 'border-box';
    element.style.textAlign = 'center';
    element.style.padding = '20px'; // Add padding to prevent edge cutoff
    
    // Also ensure all direct children are centered
    Array.from(element.children).forEach((child) => {
      const childEl = child as HTMLElement;
      if (childEl.style) {
        childEl.style.marginLeft = 'auto';
        childEl.style.marginRight = 'auto';
      }
    });
    
    // Force a reflow to ensure styles are applied
    void element.offsetHeight;
    
    // Get the actual dimensions of the content (not the container)
    // Wait a bit for layout to settle
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const rect = element.getBoundingClientRect();
    // Get the actual scroll width to ensure we capture all content
    // Add extra padding to ensure nothing is cut off
    const extraPadding = 60; // Extra padding on all sides to prevent cutoff
    const scrollWidth = element.scrollWidth || rect.width;
    const scrollHeight = element.scrollHeight || rect.height;
    
    // Use the actual content width + padding, but ensure minimum mobile width
    const elementWidth = Math.max(scrollWidth + extraPadding, mobileViewportWidth);
    const elementHeight = scrollHeight + extraPadding;
    
    // Ensure we have valid dimensions
    if (elementWidth <= 0 || elementHeight <= 0) {
      throw new Error(`Invalid element dimensions: ${elementWidth}x${elementHeight}`);
    }
    
    // Use html2canvas - it's more reliable, but we need to handle gradients specially
    // html2canvas does NOT support background-clip: text (see https://html2canvas.hertzen.com/features)
    // So we convert gradient text to SVG images before capture
    const gradientElements: Array<{ element: HTMLElement; img: HTMLImageElement; originalHTML: string }> = [];
    
    // Find all gradient text elements and convert them to SVG
    const allElements = element.querySelectorAll('*');
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const classes = Array.from(htmlEl.classList);
      const hasGradient = classes.some(cls => cls.includes('gradient-messenger') || cls === 'bg-clip-text');
      
      if (hasGradient && htmlEl.textContent && htmlEl.textContent.trim()) {
        const text = htmlEl.textContent.trim();
        const computedStyle = window.getComputedStyle(htmlEl);
        const fontSize = computedStyle.fontSize;
        const fontFamily = computedStyle.fontFamily.split(',')[0].replace(/['"]/g, ''); // Get first font, remove quotes
        const fontWeight = computedStyle.fontWeight;
        const width = htmlEl.offsetWidth || 200;
        const height = htmlEl.offsetHeight || parseFloat(fontSize) * 1.5;
        
        // Create SVG with gradient text (135deg = diagonal gradient)
        // Convert 135deg to SVG coordinates: x1=0%, y1=0%, x2=100%, y2=100%
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
<defs>
<linearGradient id="grad${gradientElements.length}" x1="0%" y1="0%" x2="100%" y2="100%">
<stop offset="0%" style="stop-color:#0084FF;stop-opacity:1" />
<stop offset="100%" style="stop-color:#9B59B6;stop-opacity:1" />
</linearGradient>
</defs>
<text x="0" y="${parseFloat(fontSize) * 0.8}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${fontWeight}" fill="url(#grad${gradientElements.length})">${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</text>
</svg>`;
        
        const svgDataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        const img = document.createElement('img');
        img.src = svgDataUrl;
        img.style.width = width + 'px';
        img.style.height = height + 'px';
        img.style.display = 'inline-block';
        img.style.verticalAlign = 'baseline';
        
        // Store original and replace
        gradientElements.push({
          element: htmlEl,
          img: img,
          originalHTML: htmlEl.innerHTML
        });
        
        htmlEl.innerHTML = '';
        htmlEl.style.display = 'inline-block';
        htmlEl.appendChild(img);
      }
    });
    
    // Wait for all SVG images to load
    if (gradientElements.length > 0) {
      await Promise.all(
        gradientElements.map(({ img }) => 
          new Promise<void>((resolve) => {
            if (img.complete) {
              resolve();
            } else {
              img.onload = () => resolve();
              img.onerror = () => resolve(); // Continue even if image fails
            }
          })
        )
      );
      // Small delay to ensure images are painted
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Now capture with html2canvas
    // See https://html2canvas.hertzen.com/configuration for all options
    // The element is already centered with flexbox, so capture it as-is
    // Calculate offset to center content if it's narrower than canvas
    const contentWidth = element.scrollWidth || mobileViewportWidth;
    const offsetX = contentWidth < elementWidth ? (elementWidth - contentWidth) / 2 : 0;
    const offsetY = 0; // Start from top
    
    const canvas = await html2canvas(element, {
      backgroundColor: options?.backgroundColor || '#1a1a2e',
      scale: options?.scale || 3,
      logging: false,
      useCORS: true,
      allowTaint: true,
      width: elementWidth, // Use calculated width with padding
      height: elementHeight,
      windowWidth: mobileViewportWidth, // Force mobile viewport for responsive breakpoints
      windowHeight: elementHeight,
      x: -offsetX, // Offset to center content horizontally
      y: -offsetY,
      scrollX: 0,
      scrollY: 0,
      foreignObjectRendering: true, // Use ForeignObject for better rendering quality
      imageTimeout: 0, // Disable timeout for images (wait indefinitely)
      removeContainer: true, // Clean up cloned DOM elements
      ignoreElements: (element) => {
        // Filter out download buttons and dashboard button using ignoreElements
        if (element instanceof HTMLElement) {
          const ariaLabel = element.getAttribute('aria-label');
          const title = element.getAttribute('title');
          const textContent = element.textContent || '';
          
          // Hide download buttons
          if ((ariaLabel && ariaLabel.includes('Download')) || 
              (title && title.includes('Save'))) {
            return true; // Ignore this element
          }
          
          // Hide "View Full Dashboard" button
          if (textContent.includes('View Full Dashboard') || 
              textContent.includes('Dashboard')) {
            return true; // Ignore this element
          }
        }
        return false; // Don't ignore
      },
    });
    
    // Restore original gradient elements
    gradientElements.forEach(({ element: el, originalHTML }) => {
      el.innerHTML = originalHTML;
      el.style.display = ''; // Reset display style
    });
    
    // Restore original element styles
    element.style.display = originalElementDisplay;
    element.style.width = originalElementWidth;
    element.style.margin = originalElementMargin;
    element.style.maxWidth = originalElementMaxWidth;
    element.style.boxSizing = originalElementBoxSizing;
    element.style.alignItems = originalElementAlignItems;
    element.style.justifyContent = originalElementJustifyContent;
    element.style.textAlign = originalElementTextAlign;
    element.style.padding = originalElementPadding;
    
    // Restore children margins
    Array.from(element.children).forEach((child) => {
      const childEl = child as HTMLElement;
      if (childEl.style) {
        childEl.style.marginLeft = '';
        childEl.style.marginRight = '';
      }
    });
    
    // Resize for social media if requested
    const finalCanvas = options?.socialMediaOptimized !== false
      ? resizeForSocialMedia(canvas, options?.socialMediaFormat || 'story')
      : canvas;
    
    // Convert canvas to blob and download
    await new Promise<void>((resolve, reject) => {
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
    });
    
    // Clean up - restore original state
    element.className = originalClasses;
    element.removeAttribute('data-mobile-capture');
    element.style.cssText = originalElementStyle;
  } catch (error) {
    console.error('Error capturing image:', error);
    // Restore original state even on error
    element.className = originalClasses;
    element.removeAttribute('data-mobile-capture');
    element.style.cssText = originalElementStyle;
    throw error;
  }
}


