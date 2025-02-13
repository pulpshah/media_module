interface PdfPreviewProps {
    url: string;
    title: string;
  }
  
  export function PdfPreview({ url, title }: PdfPreviewProps) {
    return (
      <div className="w-full h-full">
        <iframe
          src={url}
          className="w-full h-full border-0"
          title={title}
        />
      </div>
    );
  }
  