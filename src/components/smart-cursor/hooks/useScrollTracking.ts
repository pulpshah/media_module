import { useEffect, useState, useRef } from "react";

interface ScrollData {
  depth: number;
  timestamp: number;
}

export const useScrollTracking = () => {
  const [maxScrollDepth, setMaxScrollDepth] = useState(0);
  const scrollDataRef = useRef<ScrollData[]>([]);

  const handleScroll = () => {
    const scrollTop = window.scrollY;
    const documentHeight = document.documentElement.scrollHeight;
    const windowHeight = window.innerHeight;
    const scrollPercent = (scrollTop / (documentHeight - windowHeight)) * 100;

    if (scrollPercent > maxScrollDepth) {
      setMaxScrollDepth(scrollPercent);
      scrollDataRef.current.push({
        depth: scrollPercent,
        timestamp: Date.now(),
      });
      console.log("Scroll Depth:", {
        percent: scrollPercent.toFixed(2) + "%",
        timestamp: new Date(),
      });
    }
  };

  useEffect(() => {
    document.addEventListener("scroll", handleScroll);
    return () => {
      document.removeEventListener("scroll", handleScroll);
    };
  }, [maxScrollDepth]);

  return {
    maxScrollDepth,
    scrollHistory: scrollDataRef.current,
  };
};
