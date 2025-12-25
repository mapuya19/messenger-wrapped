import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isDesktop: boolean;
  supportsFileSystemAPI: boolean;
  preferredUploadMethod: 'folder' | 'zip';
  isMounted: boolean;
}

export function useDeviceDetection(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isDesktop: true,
    supportsFileSystemAPI: false,
    preferredUploadMethod: 'zip',
    isMounted: false,
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const userAgent = navigator.userAgent.toLowerCase();
      
      // Detect mobile
      const isMobile = width < 768 || /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Check File System Access API support
      // Note: Brave might have this API but it could be blocked by Shields
      const supportsFileSystemAPI = 'showDirectoryPicker' in window;
      
      
      // Determine preferred method
      const preferredUploadMethod = (isMobile || !supportsFileSystemAPI) ? 'zip' : 'folder';

      setDeviceInfo({
        isMobile,
        isDesktop: !isMobile,
        supportsFileSystemAPI,
        preferredUploadMethod,
        isMounted: true,
      });
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  return deviceInfo;
}

