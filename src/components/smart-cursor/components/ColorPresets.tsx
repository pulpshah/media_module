import Image from "next/image";
import { PresetColor } from "../hooks/useColorPresets";

interface ColorPresetsProps {
  currentFill: string;
  currentStroke: string;
  activePresetId: string | null;
  presets: PresetColor[];
  onPresetClick: (fill: string, stroke: string, presetId: string) => void;
  onLogoClick: () => void;
  logoSrc: string;
}

const normalizeColor = (color: string) => {
  // Convert color to lowercase and remove spaces
  return color.toLowerCase().replace(/\s/g, "");
};

export const ColorPresets = ({
  currentFill,
  currentStroke,
  activePresetId,
  presets,
  onPresetClick,
  onLogoClick,
  logoSrc,
}: ColorPresetsProps) => {
  // Calculate positions for paw-like arrangement
  const getPresetPosition = (index: number, total: number) => {
    const radius = 50; // Increased from 40 to 50
    const spreadAngle = Math.PI * 0.8; // Increased from 0.6 to 0.8 for wider spread
    const startAngle = -Math.PI / 2 - spreadAngle / 2; // Center above logo
    const angle = startAngle + (index * spreadAngle) / (total - 1);
    return {
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius - 15, // Increased lift from 10 to 15
    };
  };

  return (
    <div className="relative w-[140px] h-[140px]">
      {" "}
      {/* Smaller container */}
      {/* Center Logo Button */}
      <button
        onClick={onLogoClick}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full overflow-hidden hover:scale-110 transition-transform shadow-lg ml-4"
      >
        <Image
          src={logoSrc}
          alt="Logo"
          width={48}
          height={48}
          className="w-full h-full object-cover"
        />
      </button>
      {/* Paw-like Preset Arrangement */}
      {presets.slice(0, 5).map((preset, index) => {
        const { x, y } = getPresetPosition(index, Math.min(presets.length, 5));

        return (
          <div
            key={preset.id}
            className="absolute"
            style={{
              transform: `translate(${x + 70}px, ${y + 70}px)`,
            }}
          >
            <button
              onClick={() =>
                onPresetClick(preset.fill, preset.stroke, preset.id)
              }
              className="group relative w-8 h-8 hover:scale-110 transition-transform"
            >
              <svg
                viewBox="0 0 100 100"
                className="w-full h-full drop-shadow-md"
              >
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill={preset.fill}
                  stroke={preset.stroke}
                  strokeWidth="2"
                />
              </svg>
              {activePresetId === preset.id && (
                <div className="absolute inset-0 border-2 border-white rounded-full" />
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
};
