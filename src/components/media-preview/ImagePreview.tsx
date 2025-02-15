import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ImagePreviewProps {
  url: string;
  alt: string;
  file: File;
}

interface AWSAnalysis {
  labels: { Name: string; Confidence: number }[];
  text: { DetectedText: string; Confidence: number }[];
  faces: {
    BoundingBox: { Height: number; Width: number; Left: number; Top: number };
    AgeRange: { Low: number; High: number };
    Emotions: { Type: string; Confidence: number }[];
    Gender: { Value: string; Confidence: number };
  }[];
  moderation: { Name: string; Confidence: number }[];
  celebrities: { Name: string; Confidence?: number }[];
}

interface GroqAnalysis {
  description: string;
}

export function ImagePreview({ url, alt, file }: ImagePreviewProps) {
  const [processing, setProcessing] = useState(false);
  const [awsAnalysis, setAwsAnalysis] = useState<AWSAnalysis | null>(null);
  const [groqAnalysis, setGroqAnalysis] = useState<GroqAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number, naturalWidth: number; naturalHeight: number } | null>(null);


  const handleProcessImage = async () => {
    setProcessing(true);
    setError(null);
    setAwsAnalysis(null);
    setGroqAnalysis(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // AWS Rekognition API call
      const awsResponse = await fetch("/api/aws-image", {
        method: "POST",
        body: formData,
      });
      if (!awsResponse.ok) {
        throw new Error(`AWS API Error: ${awsResponse.statusText}`);
      }
      const awsData: AWSAnalysis = await awsResponse.json();
      setAwsAnalysis(awsData);

      // Groq API call
      const groqResponse = await fetch("/api/groq-image", {
        method: "POST",
        body: formData,
      });
      if (!groqResponse.ok) {
        throw new Error(`Groq API Error: ${groqResponse.statusText}`);
      }
      const groqData: GroqAnalysis = await groqResponse.json();
      setGroqAnalysis(groqData);
    } catch (err) {
      console.error("Error processing image:", err);
      setError("Failed to analyze the image. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (imageRef.current) {
      const imageElement = imageRef.current;
      setImageDimensions({
        width: imageElement.offsetWidth,
        height: imageElement.offsetHeight,
        naturalWidth: imageElement.naturalWidth,
        naturalHeight: imageElement.naturalHeight,
      });
    }
  }, [url]);


  const calculateBoundingBox = (boundingBox: { Height: number; Width: number; Left: number; Top: number }) => {
    if (!imageDimensions) return {};

    const { width, height, naturalWidth, naturalHeight } = imageDimensions;
    const scaleX = width / naturalWidth;
    const scaleY = height / naturalHeight;

    return {
      top: `${boundingBox.Top * height}px`,
      left: `${boundingBox.Left * width}px`,
      width: `${boundingBox.Width * width}px`,
      height: `${boundingBox.Height * height}px`,
    };
  };


  return (
    <div className="flex flex-col items-center w-full p-4 relative">
      {/* Image Preview with Bounding Box Overlay */}
      <div className="relative w-full h-96 border rounded-lg overflow-hidden bg-gray-900">
        <img
          ref={imageRef}
          src={url}
          alt={alt}
          className="object-contain w-full h-full"
        />
        {awsAnalysis?.faces.map((face, index) => {
          const boundingBoxStyles = calculateBoundingBox(face.BoundingBox);

          return (
            <div
              key={`face-bbox-${index}`}
              className="absolute border-2 border-blue-500"
              style={boundingBoxStyles}
            >
              <span
                className="absolute bg-blue-500 text-white text-xs px-1 rounded"
                style={{ top: 0, left: 0 }}
              >
                Age: {face.AgeRange.Low}-{face.AgeRange.High}
              </span>
            </div>
          );
        })}
      </div>

      {/* Analyze Button */}
      <button
        onClick={handleProcessImage}
        disabled={processing}
        className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-500 disabled:opacity-50 my-4"
      >
        {processing ? "Analyzing..." : "Analyze Image"}
      </button>

      {/* Error Message */}
      {error && <div className="w-full p-4 bg-red-700 text-white rounded-lg">{error}</div>}

      {/* AWS Analysis Results */}
      {awsAnalysis && (
        <div className="w-full bg-gray-800 p-4 rounded-lg mb-6 space-y-6">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">
            AWS Analysis
          </h3>

          {/* Labels */}
          {awsAnalysis.labels.length > 0 && (
            <div>
              <h4 className="font-medium">Labels:</h4>
              <ul className="list-disc list-inside">
                {awsAnalysis.labels.map((label, index) => (
                  <li key={`${label.Name}-${index}`}>
                    {label.Name} ({label.Confidence.toFixed(2)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Detected Text */}
          {awsAnalysis.text.length > 0 && (
            <div>
              <h4 className="font-medium">Detected Text:</h4>
              <ul className="list-disc list-inside">
                {awsAnalysis.text.map((text, index) => (
                  <li key={`text-${index}`}>
                    {text.DetectedText} ({text.Confidence.toFixed(2)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Faces */}
          {awsAnalysis.faces.length > 0 && (
            <div>
              <h4 className="font-medium">Faces:</h4>
              {awsAnalysis.faces.map((face, index) => (
                <div key={`face-details-${index}`} className="mb-2">
                  <p>Age Range: {face.AgeRange.Low}-{face.AgeRange.High}</p>
                  <p>Gender: {face.Gender.Value} ({face.Gender.Confidence.toFixed(2)}%)</p>
                  <p>Emotions:</p>
                  <ul className="list-disc list-inside">
                    {face.Emotions.map((emotion, idx) => (
                      <li key={`emotion-${index}-${idx}`}>
                        {emotion.Type} ({emotion.Confidence.toFixed(2)}%)
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* Celebrities */}
          {awsAnalysis.celebrities.length > 0 && (
            <div>
              <h4 className="font-medium">Recognized Celebrities:</h4>
              <ul className="list-disc list-inside">
                {awsAnalysis.celebrities.map((celeb, index) => (
                  <li key={`${celeb.Name}-${index}`}>
                    {celeb.Name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Moderation */}
          {awsAnalysis.moderation.length > 0 && (
            <div>
              <h4 className="font-medium">Content Moderation:</h4>
              <ul className="list-disc list-inside">
                {awsAnalysis.moderation.map((label, index) => (
                  <li key={`moderation-${index}`}>
                    {label.Name} ({label.Confidence.toFixed(2)}%)
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      

      {/* Groq Analysis Results */}
      {groqAnalysis && (
        <div className="w-full bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">
            Groq Analysis
          </h3>
          <p>
            <strong>Description:</strong> {groqAnalysis.description}
          </p>
        </div>
      )}
    </div>
  );
}