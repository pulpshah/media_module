"use client";
import { useState } from "react";
import { FilePreview } from "@/components/media-preview/FilePreview";
import { TabBar } from "@/components/TabBar";
import { UrlPreview } from "@/components/media-preview/UrlPreview";
import { getVideoEmbedUrl } from "@/utils/videoUtils";
import { MediaItem, ACRResult } from "@/types/media";

export default function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [acrResults, setAcrResults] = useState<{ [key: number]: ACRResult }>(
    {}
  );
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newItems = selectedFiles.map((file) => ({
      type: "file" as const,
      content: file,
      name: file.name,
    }));

    const simulateACR = (file: File): string => {
      if (file.type.startsWith("text/") || file.name.endsWith(".md")) {
        return `Simulated ACR Content for text/markdown file: "${file.name}"`;
      }
      if (file.type === "application/pdf") {
        return `Simulated ACR Content for PDF: "${file.name}" with placeholder extracted text.`;
      }
      if (file.type.startsWith("image/")) {
        return `Simulated ACR Content for image file: "${file.name}" (e.g., detected text or metadata).`;
      }
      if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
        return `Simulated ACR Content for media file: "${file.name}" (e.g., transcriptions).`;
      }
      return `Simulated ACR Content for unsupported file type: "${file.name}".`;
    };

    // Simulate ACR for each file immediately
    selectedFiles.forEach((file, index) => {
      const simulatedACRContent = simulateACR(file);
      setAcrResults((prev) => ({
        ...prev,
        [mediaItems.length + index]: { content: simulatedACRContent },
      }));
    });

    setMediaItems([...mediaItems, ...newItems]);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      try {
        const url = new URL(urlInput);
        const embedUrl = getVideoEmbedUrl(url.toString());
        if (embedUrl) {
          // Create the new media item for the URL
          const newItem = {
            type: "url" as const,
            content: embedUrl,
            name: url.hostname + url.pathname,
          };
          setMediaItems([...mediaItems, newItem]);

          // Call Deepgram's transcription API with the embed URL
          const response = await fetch("/api/transcribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: embedUrl }),
          });
          if (response.ok) {
            const data = await response.json();
            const transcript =
              data.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
              "Transcript not available.";
            setAcrResults((prev) => ({
              ...prev,
              [mediaItems.length]: { content: transcript },
            }));
          } else {
            console.error("Transcription API error", await response.text());
          }
          setUrlInput("");
        }
      } catch (error) {
        console.error(error);
        alert("Please enter a valid URL");
      }
    }
  };

  // New transcription function for the active media item
  const handleTranscribe = async () => {
    const activeMediaItem = mediaItems[activeIndex];
    console.log("Transcribe button clicked.");
    console.log("Active media item:", activeMediaItem);

    if (!activeMediaItem) {
      console.warn("No active media item found.");
      return;
    }

    if (activeMediaItem.type === "url") {
      console.log("Calling Deepgram API for URL:", activeMediaItem.content);
      try {
        const response = await fetch("/api/transcribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: activeMediaItem.content }),
        });
        console.log("Response object:", response);
        if (response.ok) {
          const data = await response.json();
          console.log("Data returned from Deepgram API:", data);
          const transcript =
            data.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
            "Transcript not available.";
          setAcrResults((prev) => ({
            ...prev,
            [activeIndex]: { content: transcript },
          }));
        } else {
          const errorText = await response.text();
          console.error("Transcription API error:", errorText);
        }
      } catch (error) {
        console.error("Failed to transcribe:", error);
      }
    } else if (activeMediaItem.type === "file") {
      // For files: create FormData and send to /api/transcribeFile
      try {
        const formData = new FormData();
        formData.append("file", activeMediaItem.content);
        console.log("Calling Deepgram API for file:", activeMediaItem.name);
        const response = await fetch("/api/transcribeFile", {
          method: "POST",
          body: formData,
        });
        console.log("Response for file transcription:", response);
        if (response.ok) {
          const data = await response.json();
          console.log("Data returned from file transcription endpoint:", data);
          const transcript =
            data.results?.channels?.[0]?.alternatives?.[0]?.transcript ||
            "Transcript not available.";
          setAcrResults((prev) => ({
            ...prev,
            [activeIndex]: { content: transcript },
          }));
        } else {
          console.error("File transcription API error", await response.text());
        }
      } catch (error) {
        console.error("File transcription failed:", error);
      }
    }
  };

  const handleCloseTab = (index: number) => {
    const newItems = mediaItems.filter((_, i) => i !== index);
    setMediaItems(newItems);
    if (activeIndex >= newItems.length) {
      setActiveIndex(Math.max(0, newItems.length - 1));
    }
  };

  const handleReorderTabs = (fromIndex: number, toIndex: number) => {
    const newItems = [...mediaItems];
    const [movedItem] = newItems.splice(fromIndex, 1);
    newItems.splice(toIndex, 0, movedItem);
    setMediaItems(newItems);
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-white">
      <main className="container mx-auto p-4">
        <div className="mb-6 flex gap-4">
          <div>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              accept="video/*,audio/*,image/*,.pdf,.md,.txt"
              className="hidden"
              id="fileInput"
            />
            <label
              htmlFor="fileInput"
              className="cursor-pointer bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Select Files
            </label>
          </div>

          <form onSubmit={handleUrlSubmit} className="flex gap-2">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL (article, video, etc.)"
              className="px-3 py-2 rounded bg-[#2D2D2D] border border-[#3C3C3C] text-white w-80"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              Add URL
            </button>
          </form>
        </div>

        {mediaItems.length > 0 && (
          <div className="border border-[#3C3C3C] rounded-lg overflow-hidden">
            <TabBar
              files={mediaItems.map((item) => ({
                type:
                  item.type === "file" ? (item.content as File).type : "url",
                name: item.name,
              }))}
              activeIndex={activeIndex}
              onTabClick={setActiveIndex}
              onCloseTab={handleCloseTab}
              onReorderTabs={handleReorderTabs}
            />
            <div className="h-[650px] bg-[#1E1E1E] p-4">
              {mediaItems[activeIndex] &&
                (mediaItems[activeIndex].type === "file" ? (
                  <FilePreview file={mediaItems[activeIndex].content as File} />
                ) : (
                  <UrlPreview
                    url={mediaItems[activeIndex].content as string}
                    title={mediaItems[activeIndex].name}
                  />
                ))}
            </div>
            {/* ACR Section with Transcribe button */}
            <div className="bg-gray-800 text-white p-4 border-t border-[#3C3C3C]">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold mb-2">ACR Details:</h3>
                <button
                  onClick={handleTranscribe}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                >
                  Transcribe
                </button>
              </div>
              <pre className="whitespace-pre-wrap text-sm">
                {acrResults[activeIndex]?.content
                  ? acrResults[activeIndex].content
                  : "No ACR details available for this media."}
              </pre>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
