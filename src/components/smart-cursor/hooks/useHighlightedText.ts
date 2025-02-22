import { useState, useEffect } from "react";

interface HighlightedText {
  text: string;
  presetId: string;
  presetName: string;
}

export const useHighlightedText = () => {
  const [highlightedTexts, setHighlightedTexts] = useState<HighlightedText[]>(
    []
  );

  const addHighlightedText = (
    text: string,
    presetId: string,
    presetName: string
  ) => {
    setHighlightedTexts((prev) => [...prev, { text, presetId, presetName }]);
  };

  const clearHighlightedTexts = () => {
    // Remove all highlight spans from the DOM
    document.querySelectorAll(".smart-cursor-highlight").forEach((el) => {
      const parent = el.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(el.textContent || ""), el);
        parent.normalize();
      }
    });
    setHighlightedTexts([]);
  };

  const getHighlightedTextsByPreset = () => {
    const textsByPreset: { [key: string]: string[] } = {};
    highlightedTexts.forEach(({ text, presetName }) => {
      if (!textsByPreset[presetName]) {
        textsByPreset[presetName] = [];
      }
      textsByPreset[presetName].push(text);
    });
    return textsByPreset;
  };

  return {
    highlightedTexts,
    addHighlightedText,
    clearHighlightedTexts,
    getHighlightedTextsByPreset,
  };
};
