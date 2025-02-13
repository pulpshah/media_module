import { FileIcon } from './FileIcon';
import { DragEvent, useState } from 'react';

interface TabBarProps {
  files: { type: string; name: string; }[];
  activeIndex: number;
  onTabClick: (index: number) => void;
  onCloseTab: (index: number) => void;
  onReorderTabs: (fromIndex: number, toIndex: number) => void;
}

export function TabBar({ files, activeIndex, onTabClick, onCloseTab, onReorderTabs }: TabBarProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent<HTMLButtonElement>, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLButtonElement>, index: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorderTabs(draggedIndex, index);
      setDraggedIndex(index);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="flex overflow-x-auto bg-[#252526] border-b border-[#3C3C3C]">
      {files.map((file, index) => (
        <div
          key={index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          onClick={() => onTabClick(index)}
          className={`
            flex items-center gap-2 px-4 py-2 min-w-[120px] cursor-pointer
            border-r border-[#3C3C3C] group
            ${activeIndex === index ? 'bg-[#1E1E1E] text-white' : 'bg-[#2D2D2D] text-gray-400'}
            hover:bg-[#2D2D2D] transition-colors
          `}
        >
          <FileIcon fileType={file.type} />
          <span className="truncate">{file.name}</span>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onCloseTab(index);
            }}
            className="ml-2 opacity-0 group-hover:opacity-100 hover:bg-[#3C3C3C] rounded-sm p-0.5 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
} 