import { useState } from "react";
import { ColorPresets } from "./ColorPresets";
import { useColorPresets } from "../hooks/useColorPresets";

interface ColorStop {
  color: string;
  position: number;
}

interface CursorSettings {
  size: number;
  fill: string;
  stroke: string;
  strokeWidth: number;
  fillGradient: ColorStop[];
  strokeGradient: ColorStop[];
  useFillGradient: boolean;
  useStrokeGradient: boolean;
}

interface CursorSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CursorSettings;
  onSettingsChange: (settings: CursorSettings) => void;
}

const GradientEditor = ({
  stops,
  onChange,
  enabled,
  onToggle,
  label,
}: {
  stops: ColorStop[];
  onChange: (stops: ColorStop[]) => void;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  label: string;
}) => {
  const addStop = () => {
    const newStop: ColorStop = {
      color: "#000000",
      position: 100,
    };
    onChange([...stops, newStop]);
  };

  const removeStop = (index: number) => {
    onChange(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, updates: Partial<ColorStop>) => {
    const newStops = [...stops];
    newStops[index] = { ...newStops[index], ...updates };
    onChange(newStops);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">{label}</label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.target.checked)}
        />
      </div>

      {enabled && (
        <div className="space-y-2 pl-4">
          {stops.map((stop, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateStop(index, { color: e.target.value })}
                className="w-20"
              />
              <input
                type="number"
                value={stop.position}
                onChange={(e) =>
                  updateStop(index, { position: Number(e.target.value) })
                }
                min="0"
                max="100"
                className="w-20 p-1 border rounded"
              />
              <button
                onClick={() => removeStop(index)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={addStop}
            className="text-sm text-blue-500 hover:text-blue-700"
          >
            + Add Color Stop
          </button>
        </div>
      )}
    </div>
  );
};

export const CursorSettingsModal = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
}: CursorSettingsModalProps) => {
  const [localSettings, setLocalSettings] = useState<CursorSettings>(settings);
  const { presets } = useColorPresets();

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const handlePresetChange = (fill: string, stroke: string) => {
    setLocalSettings({
      ...localSettings,
      fill,
      stroke,
      useFillGradient: false,
      useStrokeGradient: false,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
      <div className="bg-white text-black p-6 rounded-lg w-[480px] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Cursor Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>

        <div className="space-y-6">
          <ColorPresets
            currentFill={localSettings.fill}
            currentStroke={localSettings.stroke}
            presets={presets}
            onPresetClick={handlePresetChange}
            onLogoClick={() => { } }
            logoSrc="/logo.png" activePresetId={null}          />

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Size (px)
              </label>
              <input
                type="number"
                value={localSettings.size}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    size: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
                min="12"
                max="64"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Fill Color
              </label>
              <input
                type="color"
                value={localSettings.fill}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, fill: e.target.value })
                }
                className="w-full p-1 border rounded"
                disabled={localSettings.useFillGradient}
              />
            </div>

            <GradientEditor
              stops={localSettings.fillGradient}
              onChange={(stops) =>
                setLocalSettings({ ...localSettings, fillGradient: stops })
              }
              enabled={localSettings.useFillGradient}
              onToggle={(enabled) =>
                setLocalSettings({ ...localSettings, useFillGradient: enabled })
              }
              label="Fill Gradient"
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Stroke Color
              </label>
              <input
                type="color"
                value={localSettings.stroke}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, stroke: e.target.value })
                }
                className="w-full p-1 border rounded"
                disabled={localSettings.useStrokeGradient}
              />
            </div>

            <GradientEditor
              stops={localSettings.strokeGradient}
              onChange={(stops) =>
                setLocalSettings({ ...localSettings, strokeGradient: stops })
              }
              enabled={localSettings.useStrokeGradient}
              onToggle={(enabled) =>
                setLocalSettings({
                  ...localSettings,
                  useStrokeGradient: enabled,
                })
              }
              label="Stroke Gradient"
            />

            <div>
              <label className="block text-sm font-medium mb-1">
                Stroke Width
              </label>
              <input
                type="number"
                value={localSettings.strokeWidth}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    strokeWidth: Number(e.target.value),
                  })
                }
                className="w-full p-2 border rounded"
                min="0"
                max="5"
                step="0.5"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
