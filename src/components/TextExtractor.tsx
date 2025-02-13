import { useEffect, useState } from "react";
import { extractPdfText } from "@/utils/pdfUtils"; 
import { extractText } from "@/utils/textUtils"; 

interface TextExtractorProps {
  file: File;
}

export function TextExtractor({ file }: TextExtractorProps) {
  const [content, setContent] = useState<string>("");

  useEffect(() => {
    const processFile = async () => {
      let textContent = "";

      if (file.type === "application/pdf") {
        textContent = await extractPdfText(file);
      } else if (
        file.type === "text/plain" ||
        file.type === "text/markdown" ||
        file.name.endsWith(".md")
      ) {
        textContent = await extractText(file);
      } else {
        console.error("Unsupported file type:", file.type);
        return;
      }

      setContent(textContent);
      console.log("Extracted Text:", textContent);
    };

    processFile();
  }, [file]);

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="text-lg font-semibold">Extracted Text:</h3>
      <pre className="whitespace-pre-wrap">{content || "Processing..."}</pre>
    </div>
  );
}
