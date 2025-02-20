"use client";
import { useEffect, useState } from "react";
import PdfToImg from "pdftoimg-js/browser";

interface PdfPreviewProps {
  url: string;
  title: string;
  file: File;
}

export function PdfPreview({ url, title, file }: PdfPreviewProps) {
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractedImages, setExtractedImages] = useState<string[]>([]);
  const [loadingText, setLoadingText] = useState<boolean>(true);
  const [loadingImages, setLoadingImages] = useState<boolean>(true);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [errorImages, setErrorImages] = useState<string | null>(null);

  useEffect(() => {
    // Extract images using `pdftoimg-js`
    const extractImagesFromPdf = async () => {
      try {
        setLoadingImages(true);
        const pdfArrayBuffer = await file.arrayBuffer();
        const imgArray = await PdfToImg(pdfArrayBuffer); // Extract images as Base64
        setExtractedImages(imgArray);
      } catch (err) {
        setErrorImages("Error extracting images");
      } finally {
        setLoadingImages(false);
      }
    };

    // Extract text from PDF using `pdf.js` (optional)
    const extractTextFromPdf = async () => {
      try {
        setLoadingText(true);
        const formData = new FormData();
        formData.append("filepond", file);

        const response = await fetch("/api/extract-pdf-text", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Failed to extract text");

        const text = await response.text();
        setExtractedText(text);
      } catch (err) {
        setErrorText("Error extracting text");
      } finally {
        setLoadingText(false);
      }
    };

    extractImagesFromPdf();
    extractTextFromPdf();
  }, [file]);

  return (
    <div className="w-full">
      {/* PDF Viewer */}
      <div className="w-full h-[600px] mb-4">
        <iframe src={url} className="w-full h-full border-0" title={title} />
      </div>

      {/* Extracted Text */}
      {loadingText ? (
        <p className="text-gray-500">Extracting text...</p>
      ) : errorText ? (
        <p className="text-red-500">{errorText}</p>
      ) : (
        extractedText && (
          <div className="p-4 border rounded bg-gray-100">
            <h3 className="font-semibold mb-2">Extracted Text:</h3>
            <pre className="whitespace-pre-wrap text-gray-700">{extractedText}</pre>
          </div>
        )
      )}

      {/* Extracted Images */}
      {loadingImages ? (
        <p className="text-gray-500">Extracting images...</p>
      ) : errorImages ? (
        <p className="text-red-500">{errorImages}</p>
      ) : (
        extractedImages.length > 0 && (
          <div className="p-4 border rounded bg-gray-100 mt-4">
            <h3 className="font-semibold mb-2">Extracted Images:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {extractedImages.map((imgSrc, index) => (
                <img
                  key={index}
                  src={imgSrc}
                  alt={`Extracted image ${index + 1}`}
                  className="w-full h-auto rounded border"
                />
              ))}
            </div>
          </div>
        )
      )}
    </div>
  );
}
