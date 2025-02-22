import { useEffect, useRef } from "react";

interface ActivityData {
  type: "visibility" | "navigation";
  timestamp: number;
  data: any;
}

export const useActivityTracking = () => {
  const activityLogRef = useRef<ActivityData[]>([]);
  const startTimeRef = useRef(Date.now());

  const handleVisibilityChange = () => {
    const data = {
      state: document.visibilityState,
      timestamp: new Date(),
      currentPath: window.location.pathname,
    };
    activityLogRef.current.push({
      type: "visibility",
      timestamp: Date.now(),
      data,
    });
    // console.log("Page Visibility:", data);
  };

  useEffect(() => {
    // Track page visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Log initial page load
    const initialData = {
      path: window.location.pathname,
      timestamp: new Date(),
      referrer: document.referrer,
    };
    activityLogRef.current.push({
      type: "navigation",
      timestamp: Date.now(),
      data: initialData,
    });
    // console.log("Page Navigation:", initialData);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return {
    activityLog: activityLogRef.current,
    sessionDuration: () => Date.now() - startTimeRef.current,
  };
};
