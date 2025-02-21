import React from "react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onHighlight: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onHighlight,
}) => {
  return (
    <div>
      <input
        type="text"
        placeholder="Search & highlight..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "180px",
          padding: "5px",
          marginBottom: "8px",
          borderRadius: "4px",
          border: "1px solid white",
          background: "white",
          color: "black",
        }}
      />
      <button
        onClick={onHighlight}
        style={{
          padding: "5px 10px",
          borderRadius: "4px",
          border: "none",
          background: "white",
          color: "black",
          cursor: "pointer",
        }}
      >
        Highlight
      </button>
    </div>
  );
};
