"use client";
import { useState, useEffect } from "react";
import { usePageData } from "./hooks/usePageData";
import { useTextHighlighter } from "./hooks/useTextHighlighter";
import { SearchInput } from "./components/SearchInput";
import { useActivityTracking } from "./hooks/useActivityTracking";
import { useKeyboardTracking } from "./hooks/useKeyboardTracking";
import { useMouseTracking } from "./hooks/useMouseTracking";
import { useScrollTracking } from "./hooks/useScrollTracking";

const SmartCursor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const pageData = usePageData();
  const { highlightMatches } = useTextHighlighter();

  // Initialize all tracking hooks
  const { maxScrollDepth } = useScrollTracking();
  useMouseTracking();
  useKeyboardTracking();
  useActivityTracking();

  const handleHighlight = () => {
    highlightMatches(searchQuery);
  };

  return (
    <div className="fixed top-5 right-5 p-2.5 bg-black/80 text-white rounded-lg text-sm z-[9999]">
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onHighlight={handleHighlight}
      />
      <br />
      <div style={{ marginTop: "8px" }}>
        <span>Smart Cursor Active</span>
      </div>
      <div style={{ fontSize: "12px", opacity: 0.8 }}>
        Scroll Depth: {maxScrollDepth.toFixed(2)}%
      </div>
    </div>
  );
};

export default SmartCursor;
