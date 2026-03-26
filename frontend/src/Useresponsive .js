// useResponsive.js — shared responsive hook for CattleSense
import { useState, useEffect } from 'react';

export function useResponsive() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return {
    isMobile:  width < 640,          // phones
    isTablet:  width >= 640 && width < 1024,  // tablets
    isDesktop: width >= 1024,         // desktops
    width,
  };
}
