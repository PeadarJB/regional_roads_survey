// src/hooks/useMobileDetection.ts
import { useEffect } from 'react';
import { usePavementStore } from '../store/usePavementStore';

// Mobile breakpoint (matches Ant Design's sm breakpoint)
const MOBILE_BREAKPOINT = 768;

export const useMobileDetection = () => {
  const setIsMobileView = usePavementStore((state) => state.setIsMobileView);
  const isMobileView = usePavementStore((state) => state.isMobileView);

  useEffect(() => {
    // Check if mobile on mount and window resize
    const checkMobile = () => {
      const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobileView(isMobile);
    };

    // Initial check
    checkMobile();

    // Add event listener
    window.addEventListener('resize', checkMobile);

    // Cleanup
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, [setIsMobileView]);

  return isMobileView;
};