import { TranscriptResult } from "@/types/media";
import React, { useState, useRef } from "react";

interface AudioPreviewProps {
  url: string;
  type: string;
  file?: File;
}

export function AudioPreview({ url, type, file }: AudioPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptResult | null>(
    null
  );
  const [currentTime, ] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleTranscribe = async () => {
    if (!file) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/transcribeFile", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setTranscriptData(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4">
        <audio ref={audioRef} controls className="w-full">
          <source src={url} type={type} />
          Your browser does not support the audio tag.
        </audio>
      </div>

      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <button
          onClick={handleTranscribe}
          disabled={loading}
          className="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Transcribing..." : "Transcribe"}
        </button>

        {transcriptData && (
          <div className="space-y-4">
            {transcriptData.results.channels[0].alternatives[0].paragraphs?.paragraphs.map(
              (paragraph, pIndex) => (
                <div key={pIndex} className="mb-4">
                  <p className="text-gray-300">
                    {paragraph.sentences.map((sentence, sIndex) => (
                      <span key={sIndex}>
                        {sentence.text.split(" ").map((textWord, wIndex) => {
                          const cleanWord = textWord.replace(/[.,!?]/g, "");
                          const wordObj =
                            transcriptData.results.channels[0].alternatives[0].words.find(
                              (w) =>
                                w.word.toLowerCase() === cleanWord.toLowerCase()
                            );

                          const isActive = wordObj
                            ? currentTime >= wordObj.start &&
                              currentTime < wordObj.end
                            : false;

                          return (
                            <span
                              key={wIndex}
                              className={`transition-colors ${
                                isActive
                                  ? "text-yellow-400 font-bold"
                                  : "text-gray-300"
                              }`}
                            >
                              {textWord}{" "}
                            </span>
                          );
                        })}
                      </span>
                    ))}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
