import { NextResponse } from "next/server";
import AWS from "aws-sdk";

// Configure AWS Rekognition
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const rekognition = new AWS.Rekognition();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileField = formData.get("file");

    if (!fileField) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    const file = fileField as File;
    // Convert image to bytes
    const arrayBuffer = await file.arrayBuffer();
    const imageBytes = Buffer.from(arrayBuffer);

    // AWS Rekognition Parameters
    const detectLabelsParams = {
      Image: { Bytes: imageBytes },
      MaxLabels: 10,
      MinConfidence: 70,
    };
    const detectTextParams = { Image: { Bytes: imageBytes } };
    const detectFacesParams = {
      Image: { Bytes: imageBytes },
      Attributes: ["ALL"],
    };
    const detectModerationLabelsParams = { Image: { Bytes: imageBytes } };
    const recognizeCelebritiesParams = { Image: { Bytes: imageBytes } };

    // Call AWS Rekognition APIs in parallel
    const [labels, text, faces, moderation, celebrities] = await Promise.all([
      rekognition.detectLabels(detectLabelsParams).promise(),
      rekognition.detectText(detectTextParams).promise(),
      rekognition.detectFaces(detectFacesParams).promise(),
      rekognition.detectModerationLabels(detectModerationLabelsParams).promise(),
      rekognition.recognizeCelebrities(recognizeCelebritiesParams).promise(),
    ]);

    const response = {
      labels: labels.Labels || [],
      text: text.TextDetections || [],
      faces: faces.FaceDetails || [],
      moderation: moderation.ModerationLabels || [],
      celebrities: celebrities.CelebrityFaces || [],
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unexpected error";
    console.error("Error in AWS analysis:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
