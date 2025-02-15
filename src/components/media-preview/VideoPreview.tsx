import { TranscriptResult } from "@/types/media";
import React, { useState, useRef, useEffect } from "react";

interface VideoPreviewProps {
  urls: { url: string; type: string }[];
  file?: File;
}

export function VideoPreview({ urls, file }: VideoPreviewProps) {
  const [loading, setLoading] = useState(false);
  const [transcriptData, setTranscriptData] = useState<TranscriptResult | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

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

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !transcriptData) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", updateTime);

    return () => video.removeEventListener("timeupdate", updateTime);
  }, [transcriptData]);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Video Container with fixed aspect ratio */}
      <div className="flex-1 bg-black flex justify-center">
        <div className="w-full max-w-4xl aspect-video relative">
          <video
            ref={videoRef}
            controls
            className="w-full h-full object-contain"
            key={urls[0]?.url} // Assuming single video source
          >
            <source src={urls[0]?.url} type={urls[0]?.type} />
            Your browser does not support the video tag.
          </video>

          {/* Transcript Overlay */}
          {transcriptData && (
            <div className="absolute bottom-16 left-0 right-0">
              <div className="bg-gradient-to-t from-black/80 to-transparent pt-4 px-4">
                <div className="max-h-[100px] overflow-y-auto">
                  <div className="text-white text-sm font-medium leading-relaxed">
                    {transcriptData.results.channels[0].alternatives[0].paragraphs?.paragraphs.map(
                      (paragraph, pIndex) => (
                        <p key={pIndex} className="mb-2">
                          {paragraph.sentences.map((sentence, sIndex) => (
                            <span key={sIndex}>
                              {sentence.text
                                .split(" ")
                                .map((textWord, wIndex) => {
                                  const cleanWord = textWord.replace(
                                    /[.,!?]/g,
                                    ""
                                  );
                                  const wordObj =
                                    transcriptData.results.channels[0].alternatives[0].words.find(
                                      (w) =>
                                        w.word.toLowerCase() ===
                                        cleanWord.toLowerCase()
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
                                          : "text-white"
                                      }`}
                                    >
                                      {textWord}{" "}
                                    </span>
                                  );
                                })}
                            </span>
                          ))}
                        </p>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Transcription Controls */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <button
          onClick={handleTranscribe}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Transcribing..." : "Transcribe"}
        </button>
      </div>
    </div>
  );
}
