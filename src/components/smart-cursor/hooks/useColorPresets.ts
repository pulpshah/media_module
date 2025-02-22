import { useState, useEffect } from 'react';

export interface PresetColor {
  id: string;
  fill: string;
  stroke: string;
  name: string;
}

const DEFAULT_PRESETS: PresetColor[] = [
  { id: '1', fill: "#f60404", stroke: "#ffffff", name: "Classic" },
  { id: '2', fill: "#e69b19", stroke: "#ffffff", name: "Orange" },
  { id: '3', fill: "#371fea", stroke: "#ffffff", name: "Blue" },
  { id: '4', fill: "#00ccff", stroke: "#ffffff", name: "Cyan" },
  { id: '5', fill: "#9673d3", stroke: "#ffffff", name: "Purple" },
];

export const useColorPresets = () => {
  const [presets, setPresets] = useState<PresetColor[]>(DEFAULT_PRESETS);

  useEffect(() => {
    const saved = localStorage.getItem('cursorPresets');
    if (saved) {
      setPresets(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cursorPresets', JSON.stringify(presets));
  }, [presets]);

  const updatePreset = (id: string, updates: Partial<PresetColor>) => {
    setPresets(current => 
      current.map(preset => 
        preset.id === id ? { ...preset, ...updates } : preset
      )
    );
  };

  const resetPresets = () => {
    setPresets(DEFAULT_PRESETS);
  };

  return { presets, updatePreset, resetPresets };
}; 