import { useEffect, useRef, useState } from "react";

interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

interface GesturePoint {
  x: number;
  y: number;
}

type GestureType = "circle" | "w" | "p" | null;

const GESTURE_THRESHOLD = 10; // Minimum points needed (reduced from 20)
const CIRCLE_THRESHOLD = 0.4; // Much more forgiving circle detection
const MIN_GESTURE_SIZE = 20; // Smaller minimum size

export const useMouseTracking = () => {
  const mousePositionsRef = useRef<MousePosition[]>([]);
  const lastActivityRef = useRef(new Date());
  const gesturePointsRef = useRef<GesturePoint[]>([]);
  const isGesturingRef = useRef(false);
  const [detectedGesture, setDetectedGesture] = useState<GestureType>(null);
  const [gesturePath, setGesturePath] = useState<GesturePoint[]>([]);

  const resetGesture = () => {
    gesturePointsRef.current = [];
    isGesturingRef.current = false;
    setDetectedGesture(null);
    setGesturePath([]);
  };

  const getGestureSize = (
    points: GesturePoint[]
  ): { width: number; height: number } => {
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    return {
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  };

  const detectCircle = (points: GesturePoint[]): boolean => {
    if (points.length < GESTURE_THRESHOLD) return false;

    const size = getGestureSize(points);
    if (size.width < MIN_GESTURE_SIZE && size.height < MIN_GESTURE_SIZE)
      return false;

    // Simple circle detection: check if end point is near start point
    const start = points[0];
    const end = points[points.length - 1];
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
    );

    // If end point is close to start point, it's probably a circle
    return distance < Math.min(size.width, size.height) * 0.3;
  };

  const detectW = (points: GesturePoint[]): boolean => {
    if (points.length < GESTURE_THRESHOLD) return false;

    const size = getGestureSize(points);
    if (size.width < MIN_GESTURE_SIZE && size.height < MIN_GESTURE_SIZE)
      return false;

    // Count direction changes
    let changes = 0;
    let lastY = points[0].y;

    for (let i = 1; i < points.length; i++) {
      const dy = points[i].y - lastY;
      if (Math.abs(dy) > size.height * 0.1) {
        // Reduced threshold
        changes++;
        lastY = points[i].y;
      }
    }

    return changes >= 2; // Need fewer changes to detect a W
  };

  const detectP = (points: GesturePoint[]): boolean => {
    if (points.length < GESTURE_THRESHOLD) return false;

    const size = getGestureSize(points);
    if (size.width < MIN_GESTURE_SIZE && size.height < MIN_GESTURE_SIZE)
      return false;

    // Check if we have a vertical line (first part of P)
    const midPoint = Math.floor(points.length / 2);
    const firstHalf = points.slice(0, midPoint);

    const verticalDist = Math.abs(
      firstHalf[0].y - firstHalf[firstHalf.length - 1].y
    );
    const horizontalDist = Math.abs(
      firstHalf[0].x - firstHalf[firstHalf.length - 1].x
    );

    // Less strict vertical line check
    const hasVerticalLine = verticalDist > horizontalDist * 0.8;

    // Check for any curve in second half
    const secondHalf = points.slice(midPoint);
    let maxX = secondHalf[0].x;
    let hasLoop = false;

    for (const point of secondHalf) {
      if (point.x > maxX) {
        maxX = point.x;
        hasLoop = true;
      }
    }

    return hasVerticalLine && hasLoop;
  };

  const detectGesture = () => {
    const points = gesturePointsRef.current;
    console.log("Checking gesture with points:", points.length);

    if (detectCircle(points)) {
      console.log("Circle detected!");
      setDetectedGesture("circle");
      return;
    }

    if (detectW(points)) {
      console.log("W detected!");
      setDetectedGesture("w");
      return;
    }

    if (detectP(points)) {
      console.log("P detected!");
      setDetectedGesture("p");
      return;
    }

    setDetectedGesture(null);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const currentTime = new Date();
    const position = {
      x: e.clientX,
      y: e.clientY,
      timestamp: currentTime.getTime(),
    };

    if (currentTime.getTime() - lastActivityRef.current.getTime() > 20) {
      // Increased sampling rate
      mousePositionsRef.current.push(position);
      lastActivityRef.current = currentTime;

      if (isGesturingRef.current) {
        gesturePointsRef.current.push({ x: e.clientX, y: e.clientY });
        setGesturePath([...gesturePointsRef.current].slice(-50)); // Keep more points for trail
        detectGesture(); // Check for gesture on every move
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.altKey && !isGesturingRef.current) {
      console.log("Gesture mode activated");
      isGesturingRef.current = true;
      gesturePointsRef.current = [];
      setGesturePath([]);
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!e.altKey && isGesturingRef.current) {
      console.log("Gesture mode deactivated");
      isGesturingRef.current = false;
      detectGesture();
      setTimeout(resetGesture, 1000);
    }
  };

  const handleMouseHover = (e: MouseEvent) => {
    const target = e.target as Element;
    // console.log("Hover Activity:", {
    //   element: target.tagName,
    //   className: target.className,
    //   timestamp: new Date(),
    //   position: { x: e.clientX, y: e.clientY },
    // });
  };

  const handleClick = (e: MouseEvent) => {
    const target = e.target as Element;
    const clickData = {
      x: e.clientX,
      y: e.clientY,
      timestamp: Date.now(),
      element: target.tagName,
    };
    // console.log("Click Pattern:", {
    //   ...clickData,
    //   className: target.className,
    //   id: target.id,
    // });
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseHover, true);
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keyup", handleKeyUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseHover, true);
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return {
    mousePositions: mousePositionsRef.current,
    currentGesture: detectedGesture,
    isGesturing: isGesturingRef.current,
    gesturePath,
  };
};
