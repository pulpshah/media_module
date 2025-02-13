interface TextPreviewProps {
    content: string;
    isMarkdown?: boolean;
  }
  
  export function TextPreview({ content, isMarkdown }: TextPreviewProps) {
    return (
      <div className="w-full h-full overflow-auto p-4 bg-white text-black">
        {isMarkdown ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <pre className="whitespace-pre-wrap">{content}</pre>
        )}
      </div>
    );
  }
  