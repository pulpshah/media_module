"use client";
import { useState, useEffect } from "react";
import { usePageData } from "./hooks/usePageData";
import { useTextHighlighter } from "./hooks/useTextHighlighter";
import { SearchInput } from "./components/SearchInput";
import { useActivityTracking } from "./hooks/useActivityTracking";
import { useKeyboardTracking } from "./hooks/useKeyboardTracking";
import { useMouseTracking } from "./hooks/useMouseTracking";
import { useScrollTracking } from "./hooks/useScrollTracking";
import { CursorSettingsModal } from "./components/CursorSettings";
import { useColorPresets, PresetColor } from "./hooks/useColorPresets";
import { ColorPresets } from "./components/ColorPresets";
import { useHighlightedText } from "./hooks/useHighlightedText";

const SmartCursor = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const pageData = usePageData();
  const { highlightMatches } = useTextHighlighter();
  const { maxScrollDepth } = useScrollTracking();
  const { presets, updatePreset } = useColorPresets();
  const {
    highlightedTexts,
    addHighlightedText,
    clearHighlightedTexts,
    getHighlightedTextsByPreset,
  } = useHighlightedText();

  const { mousePositions, currentGesture, isGesturing, gesturePath } =
    useMouseTracking();
  useKeyboardTracking();
  useActivityTracking();

  // State for tracking cursor position
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [cursorSettings, setCursorSettings] = useState({
    size: 24,
    fill: "#000000",
    stroke: "#FFFFFF",
    strokeWidth: 1.5,
    fillGradient: [
      { color: "#000000", position: 0 },
      { color: "#444444", position: 100 },
    ],
    strokeGradient: [
      { color: "#FFFFFF", position: 0 },
      { color: "#CCCCCC", position: 100 },
    ],
    useFillGradient: false,
    useStrokeGradient: false,
    activePresetId: null as string | null,
  });

  const [editingPresets, setEditingPresets] = useState(false);

  useEffect(() => {
    const updateCursor = (e: MouseEvent) => {
      setCursorPos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", updateCursor);
    return () => window.removeEventListener("mousemove", updateCursor);
  }, []);

  useEffect(() => {
    const handleTextSelection = () => {
      // Remove any existing buttons first
      document
        .querySelectorAll(".selection-button")
        .forEach((el) => el.remove());

      const selection = window.getSelection();
      if (!selection || !cursorSettings.activePresetId) return;

      const selectedText = selection.toString().trim();
      if (!selectedText) return;

      const range = selection.getRangeAt(0);
      const span = document.createElement("span");
      span.className = "smart-cursor-highlight";
      span.style.borderBottom = `2px solid ${cursorSettings.fill}`;

      const activePreset = presets.find(
        (p) => p.id === cursorSettings.activePresetId
      );
      if (!activePreset) return;

      // Create "Send to Preset" button
      const button = document.createElement("button");
      button.textContent = `Send to ${activePreset.name}`;
      button.style.position = "fixed";
      button.style.zIndex = "10000";
      button.style.padding = "4px 8px";
      button.style.background = cursorSettings.fill;
      button.style.color = "white";
      button.style.border = "none";
      button.style.borderRadius = "4px";
      button.style.cursor = "pointer";

      // Position the button near the selection
      const rect = range.getBoundingClientRect();
      button.style.left = `${rect.left}px`;
      button.style.top = `${rect.bottom + 5}px`;

      // Handle click
      button.onclick = () => {
        addHighlightedText(selectedText, activePreset.id, activePreset.name);
        range.surroundContents(span);
        button.remove();
      };

      button.className = "selection-button";
      document.body.appendChild(button);
    };

    // Handle clicks outside of selection
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest(".selection-button")) {
        document
          .querySelectorAll(".selection-button")
          .forEach((el) => el.remove());
      }
    };

    document.addEventListener("selectionchange", handleTextSelection);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("selectionchange", handleTextSelection);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [cursorSettings.activePresetId, cursorSettings.fill, presets]);

  const handleGenerate = () => {
    const textsByPreset = getHighlightedTextsByPreset();
    console.log(textsByPreset);
    clearHighlightedTexts();
  };

  // Log gesture detection
  useEffect(() => {
    if (currentGesture) {
      console.log(`Gesture Detected: ${currentGesture.toUpperCase()}`);
      console.log("Gesture Path:", gesturePath);
    }
  }, [currentGesture, gesturePath]);

  return (
    <>
      {/* Custom Cursor Overlay */}
      <div
        className="custom-cursor"
        style={{
          position: "fixed",
          top: cursorPos.y,
          left: cursorPos.x,
          width: `${cursorSettings.size}px`,
          height: `${cursorSettings.size}px`,
          pointerEvents: "none",
          transform: `translate(-${cursorSettings.size / 8}px, -${
            cursorSettings.size / 8
          }px)`,
          zIndex: 100000000,
        }}
      >
        <svg
          width={cursorSettings.size}
          height={cursorSettings.size}
          viewBox="0 0 24 24"
          style={{
            width: `${cursorSettings.size}px`,
            height: `${cursorSettings.size}px`,
          }}
        >
          <defs>
            {cursorSettings.useFillGradient && (
              <linearGradient
                id="fillGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                {cursorSettings.fillGradient.map((stop, index) => (
                  <stop
                    key={index}
                    offset={`${stop.position}%`}
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            )}
            {cursorSettings.useStrokeGradient && (
              <linearGradient
                id="strokeGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                {cursorSettings.strokeGradient.map((stop, index) => (
                  <stop
                    key={index}
                    offset={`${stop.position}%`}
                    stopColor={stop.color}
                  />
                ))}
              </linearGradient>
            )}
          </defs>
          <path
            d="M5 2l14 11.2L14 14l2.8 7L15 22l-2.8-7L8 17.8z"
            fill={
              cursorSettings.useFillGradient
                ? "url(#fillGradient)"
                : cursorSettings.fill
            }
            stroke={
              cursorSettings.useStrokeGradient
                ? "url(#strokeGradient)"
                : cursorSettings.stroke
            }
            strokeWidth={cursorSettings.strokeWidth}
          />
        </svg>
      </div>

      {/* Gesture Path Visualization */}
      {isGesturing && gesturePath.length > 0 && (
        <svg
          className="fixed inset-0 pointer-events-none z-[99999]"
          style={{ width: "100vw", height: "100vh" }}
        >
          <path
            d={`M ${gesturePath[0].x} ${gesturePath[0].y} ${gesturePath
              .slice(1)
              .map((point) => `L ${point.x} ${point.y}`)
              .join(" ")}`}
            fill="none"
            stroke={cursorSettings.fill}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              opacity: 0.6,
              filter: "blur(1px)",
            }}
          />
        </svg>
      )}

      {/* Hide Default Cursor */}
      <style jsx global>{`
        * {
          cursor: none; /* Hide default system cursor */
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
      `}</style>

      {/* SmartCursor UI */}
      <div className="fixed top-5 right-5 p-2.5 bg-black/80 text-white rounded-lg text-sm z-[9999]">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          onHighlight={() => highlightMatches(searchQuery)}
        />
        <br />
        <div style={{ marginTop: "8px" }}>
          <span>Smart Cursor Active</span>
          <button
            onClick={handleGenerate}
            className="ml-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Generate
          </button>
        </div>
        <div style={{ fontSize: "12px", opacity: 0.8 }}>
          Scroll Depth: {maxScrollDepth.toFixed(2)}%
        </div>
      </div>

      {/* Circular Preset UI */}
      <div className="fixed -bottom-2 right-5">
        <ColorPresets
          currentFill={cursorSettings.fill}
          currentStroke={cursorSettings.stroke}
          activePresetId={cursorSettings.activePresetId}
          presets={presets}
          onPresetClick={(fill, stroke, presetId) => {
            setCursorSettings({
              ...cursorSettings,
              fill,
              stroke,
              activePresetId: presetId,
              useFillGradient: false,
              useStrokeGradient: false,
            });
          }}
          onLogoClick={() => setEditingPresets(true)}
          logoSrc="/logo.png"
        />
      </div>

      {/* Preset Editor Modal */}
      {editingPresets && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001]">
          <div className="bg-white text-black p-6 rounded-lg w-[480px] max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Edit Presets</h2>
              <button
                onClick={() => setEditingPresets(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              {presets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex items-center gap-4 p-3 border rounded-lg"
                >
                  <div className="w-10 h-10">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill={preset.fill}
                        stroke={preset.stroke}
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={preset.name}
                    onChange={(e) =>
                      updatePreset(preset.id, { name: e.target.value })
                    }
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    type="color"
                    value={preset.fill}
                    onChange={(e) =>
                      updatePreset(preset.id, { fill: e.target.value })
                    }
                    className="w-12 h-8"
                    title="Fill Color"
                  />
                  <input
                    type="color"
                    value={preset.stroke}
                    onChange={(e) =>
                      updatePreset(preset.id, { stroke: e.target.value })
                    }
                    className="w-12 h-8"
                    title="Stroke Color"
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => setEditingPresets(false)}
              className="w-full mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SmartCursor;
