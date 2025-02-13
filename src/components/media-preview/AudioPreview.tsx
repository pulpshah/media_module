interface AudioPreviewProps {
    url: string;
    type: string;
  }
  
  export function AudioPreview({ url, type }: AudioPreviewProps) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4">
        <audio controls className="w-full">
          <source src={url} type={type} />
          Your browser does not support the audio tag.
        </audio>
      </div>
    );
  }
  