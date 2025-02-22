import { PresetColor } from '../hooks/useColorPresets';

interface PresetEditorProps {
  preset: PresetColor;
  onSave: (updates: Partial<PresetColor>) => void;
  onClose: () => void;
}

export const PresetEditor = ({ preset, onSave, onClose }: PresetEditorProps) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Edit Preset</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={preset.name}
            onChange={(e) => onSave({ name: e.target.value })}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Fill Color</label>
          <input
            type="color"
            value={preset.fill}
            onChange={(e) => onSave({ fill: e.target.value })}
            className="w-full p-1 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Stroke Color</label>
          <input
            type="color"
            value={preset.stroke}
            onChange={(e) => onSave({ stroke: e.target.value })}
            className="w-full p-1 border rounded"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 