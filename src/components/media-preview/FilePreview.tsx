import { useState, useEffect } from "react";
import { marked } from "marked";
import { ImagePreview } from "./ImagePreview";
import { VideoPreview } from "./VideoPreview";
import { AudioPreview } from "./AudioPreview";
import { PdfPreview } from "./PdfPreview";
import { TextPreview } from "./TextPreview";

interface FilePreviewProps {
  file: File;
}

export function FilePreview({ file }: FilePreviewProps) {
  const [content, setContent] = useState<string>("");
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    if (
      file.type === "text/plain" ||
      file.type === "text/markdown" ||
      file.name.endsWith(".md")
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (file.type === "text/markdown" || file.name.endsWith(".md")) {
          Promise.resolve(marked(text)).then(setContent);
        } else {
          setContent(text);
        }
      };
      reader.readAsText(file);
    }

    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (file.type.startsWith("image/") && objectUrl) {
    return <ImagePreview url={objectUrl} alt={file.name} file={file} />;
  }

  if (file.type.startsWith("video/") && objectUrl) {
    return (
      <VideoPreview urls={[{ url: objectUrl, type: file.type }]} file={file} />
    );
  }

  if (file.type.startsWith("audio/") && objectUrl) {
    return <AudioPreview url={objectUrl} type={file.type} file={file} />;
  }

  if (file.type === "application/pdf" && objectUrl) {
    return <PdfPreview url={objectUrl} title={file.name} />;
  }

  if (content) {
    const isMarkdown =
      file.type === "text/markdown" || file.name.endsWith(".md");
    return <TextPreview content={content} isMarkdown={isMarkdown} />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <p className="text-gray-500">Preview not available for {file.type}</p>
    </div>
  );
}
