interface VideoPreviewProps {
  urls: { url: string; type: string }[];
}

export function VideoPreview({ urls }: VideoPreviewProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      {urls.map((video, index) => (
        <div key={index} className="mb-4">
          <video controls className="max-w-full max-h-[600px]" key={video.url}>
            <source src={video.url} type={video.type} />
            Your browser does not support the video tag.
          </video>
        </div>
      ))}
    </div>
  );
}
