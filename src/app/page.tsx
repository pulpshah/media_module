"use client";
import { useState } from "react";
import { FilePreview } from "@/components/media-preview/FilePreview";
import { TabBar } from "@/components/TabBar";
import { UrlPreview } from "@/components/media-preview/UrlPreview/UrlPreview";
import { getVideoEmbedUrl } from "@/utils/YTUtil";
import { MediaItem } from "@/types/media";

export default function Home() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [urlInput, setUrlInput] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    const newItems = selectedFiles.map((file) => ({
      type: "file" as const,
      content: file,
      name: file.name,
    }));
    setMediaItems([...mediaItems, ...newItems]);
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      try {
        const url = new URL(urlInput);
        const embedUrl = getVideoEmbedUrl(url.toString());
        if (embedUrl) {
          setMediaItems([
            ...mediaItems,
            {
              type: "url",
              content: embedUrl,
              name: url.hostname + url.pathname,
            },
          ]);
          setUrlInput("");
        }
      } catch (error) {
        alert("Please enter a valid URL"+error);
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
            <div className="bg-[#1E1E1E] p-4">
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
          </div>
        )}
      </main>
    </div>
  );
}
