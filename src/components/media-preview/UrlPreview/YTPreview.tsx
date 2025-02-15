import { useState, useRef, useEffect, useCallback } from "react";
import { TranscriptResult } from "@/types/media";
import { extractVideoId } from "@/utils/YTUtil";

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: typeof YT;
  }
}

interface YTPreviewProps {
  url: string;
}

export function YTPreview({ url }: YTPreviewProps) {
  const [transcriptData, setTranscriptData] = useState<TranscriptResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<YT.Player | null>(null);

  const handleTranscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/transcribeYoutube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setTranscriptData(data);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerStateChange = useCallback(
    (event: YT.OnStateChangeEvent) => {
      if (event.data === YT.PlayerState.PLAYING) {
        const interval = setInterval(() => {
          if (playerRef.current) {
            setCurrentTime(playerRef.current.getCurrentTime());
          }
        }, 500);

        return () => clearInterval(interval);
      }
    },
    []
  );

  const onYouTubeIframeAPIReady = useCallback(() => {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error("Invalid YouTube URL");

    if (playerRef.current) {
      playerRef.current.destroy();
    }

    playerRef.current = new YT.Player("player", {
      videoId: videoId,
      events: {
        onStateChange: handlePlayerStateChange,
      },
    });
  }, [url, handlePlayerStateChange]);

  useEffect(() => {
    const loadYouTubePlayerAPI = () => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    };

    if (!window.YT) {
      loadYouTubePlayerAPI();
    } else {
      onYouTubeIframeAPIReady();
    }

    window.onYouTubeIframeAPIReady = () => {
      onYouTubeIframeAPIReady();
    };
  }, [onYouTubeIframeAPIReady]);

  return (
    <div className="w-full h-full flex flex-col">
      <YTPlayerContainer
        iframeError={iframeError}
        setIframeError={setIframeError}
        transcriptData={transcriptData}
        currentTime={currentTime}
        url={url}
      />

      <TranscriptionControls
        loading={loading}
        handleTranscribe={handleTranscribe}
      />
    </div>
  );
}

function YTPlayerContainer({
  iframeError,
  transcriptData,
  currentTime,
  url,
}: {
  iframeError: boolean;
  setIframeError: (value: boolean) => void;
  transcriptData: TranscriptResult | null;
  currentTime: number;
  url: string;
}) {
  if (iframeError) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
        <p>Error: Content cannot be embedded</p>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Open in New Tab
        </a>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-black flex justify-center relative">
      <div className="w-full max-w-4xl aspect-video relative">
        <div id="player" className="w-full h-full" />

        {transcriptData && (
          <TranscriptionOverlay
            transcriptData={transcriptData}
            currentTime={currentTime}
          />
        )}
      </div>
    </div>
  );
}

function TranscriptionOverlay({
  transcriptData,
  currentTime,
}: {
  transcriptData: TranscriptResult;
  currentTime: number;
}) {
  const words = transcriptData.results.channels[0].alternatives[0].words;

  // Find the single word that matches the current playback time
  const activeWord = words.find(
    (word) => currentTime >= word.start && currentTime < word.end
  );

  return (
    <div className="absolute bottom-16 left-0 right-0">
      <div className="bg-gradient-to-t from-black/80 to-transparent pt-4 px-4">
        <div className="max-h-[100px] overflow-y-auto">
          <div className="text-white text-sm font-medium leading-relaxed">
            {transcriptData.results.channels[0].alternatives[0].paragraphs?.paragraphs.map(
              (paragraph, pIndex) => (
                <p key={pIndex} className="mb-2">
                  {paragraph.sentences.map((sentence, sIndex) => (
                    <span key={sIndex}>
                      {sentence.text.split(" ").map((textWord, wIndex) => {
                        // Remove punctuation from the word
                        const cleanWord = textWord.replace(/[.,!?]/g, "");

                        // Check if this specific word matches the active word
                        const isActive =
                          activeWord?.word.toLowerCase() ===
                          cleanWord.toLowerCase();

                        return (
                          <span
                            key={wIndex}
                            className={`transition-colors ${
                              isActive ? "text-yellow-400 font-bold" : "text-white"
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
  );
}




function TranscriptionControls({
  loading,
  handleTranscribe,
}: {
  loading: boolean;
  handleTranscribe: () => void;
}) {
  return (
    <div className="bg-gray-800 p-4 border-t border-gray-700">
      <button
        onClick={handleTranscribe}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        {loading ? "Transcribing..." : "Transcribe YouTube Video"}
      </button>
    </div>
  );
}
