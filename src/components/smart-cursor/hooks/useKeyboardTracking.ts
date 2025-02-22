import { useEffect, useRef } from "react";

interface KeystrokeData {
  key: string;
  timestamp: number;
  isShortcut: boolean;
  modifiers?: {
    ctrl: boolean;
    alt: boolean;
    shift: boolean;
    meta: boolean;
  };
}

export const useKeyboardTracking = () => {
  const keystrokesRef = useRef<KeystrokeData[]>([]);

  const handleKeyPress = (e: KeyboardEvent) => {
    const isShortcut = e.ctrlKey || e.metaKey || e.altKey;
    const keystrokeData = {
      key: e.key,
      timestamp: Date.now(),
      isShortcut,
      modifiers: {
        ctrl: e.ctrlKey,
        alt: e.altKey,
        shift: e.shiftKey,
        meta: e.metaKey,
      },
    };
    keystrokesRef.current.push(keystrokeData);
    // console.log("Keystroke:", keystrokeData);
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      // console.log("Text Selection:", {
      //   selectedText: selection.toString(),
      //   timestamp: new Date(),
      //   range: {
      //     start: selection.anchorOffset,
      //     end: selection.focusOffset,
      //   },
      // });
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);
    document.addEventListener("selectionchange", handleTextSelection);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
      document.removeEventListener("selectionchange", handleTextSelection);
    };
  }, []);

  return {
    keystrokes: keystrokesRef.current,
    getShortcutCount: () =>
      keystrokesRef.current.filter((k) => k.isShortcut).length,
  };
};
