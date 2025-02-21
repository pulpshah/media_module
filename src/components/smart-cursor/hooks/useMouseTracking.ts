import { useEffect, useRef } from "react";

interface MousePosition {
  x: number;
  y: number;
  timestamp: number;
}

export const useMouseTracking = () => {
  const mousePositionsRef = useRef<MousePosition[]>([]);
  const lastActivityRef = useRef(new Date());

  const handleMouseMove = (e: MouseEvent) => {
    const currentTime = new Date();
    const position = {
      x: e.clientX,
      y: e.clientY,
      timestamp: currentTime.getTime(),
    };

    if (currentTime.getTime() - lastActivityRef.current.getTime() > 100) {
      mousePositionsRef.current.push(position);
      lastActivityRef.current = currentTime;

      // console.log("Mouse Movement Pattern:", {
      //   ...position,
      //   path: e
      //     .composedPath()
      //     .map((el) => (el as Element).tagName)
      //     .filter(Boolean),
      // });
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
    console.log("Click Pattern:", {
      ...clickData,
      className: target.className,
      id: target.id,
    });
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseenter", handleMouseHover, true);
    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseenter", handleMouseHover, true);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return {
    mousePositions: mousePositionsRef.current,
  };
};
