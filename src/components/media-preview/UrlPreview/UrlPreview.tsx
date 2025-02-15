import { isYouTubeUrl } from "@/utils/YTUtil";
import { YTPreview } from "./YTPreview";
import { useState } from "react";

interface UrlPreviewProps {
  url: string;
  title: string;
}

export function UrlPreview({ url, title }: UrlPreviewProps) {
  const [iframeError, setIframeError] = useState(false);

  if (isYouTubeUrl(url)) {
    return <YTPreview url={url} />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1 bg-black flex justify-center relative">
        {!iframeError ? (
          <iframe
            src={url}
            className="w-full h-full border-0"
            title={title}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-400">
            <svg className="w-16 h-16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
            <div className="text-center">
              <p className="text-lg font-semibold mb-2">
                Content cannot be embedded
              </p>
              <p className="mb-4">Please click below to open in a new tab</p>
              <div className="flex flex-col gap-2">
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Open in New Tab
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(url)}
                  className="text-sm hover:underline"
                >
                  Copy URL
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
