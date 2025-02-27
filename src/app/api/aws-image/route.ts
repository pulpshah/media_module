import { NextResponse } from "next/server";
import {
  RekognitionClient,
  DetectLabelsCommand,
  DetectTextCommand,
  DetectFacesCommand,
  DetectModerationLabelsCommand,
  RecognizeCelebritiesCommand,
} from "@aws-sdk/client-rekognition";

// Configure AWS Rekognition
const rekognition = new RekognitionClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Maximum file size (5MB in bytes)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileField = formData.get("file");

    if (!fileField) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    const file = fileField as File;

    // Check file size before processing
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      );
    }

    // Convert image to bytes
    const arrayBuffer = await file.arrayBuffer();
    const imageBytes = new Uint8Array(arrayBuffer);

    // AWS Rekognition Parameters
    const imageParams = { Bytes: imageBytes };

    // Create commands
    const commands = [
      new DetectLabelsCommand({
        Image: imageParams,
        MaxLabels: 10,
        MinConfidence: 70,
      }),
      new DetectTextCommand({ Image: imageParams }),
      new DetectFacesCommand({
        Image: imageParams,
        Attributes: ["ALL"],
      }),
      new DetectModerationLabelsCommand({ Image: imageParams }),
      new RecognizeCelebritiesCommand({ Image: imageParams }),
    ];

    // Execute commands in parallel
    const [labels, text, faces, moderation, celebrities] = await Promise.all(
      commands.map((command) => rekognition.send(command))
    );

    const response = {
      labels: labels.Labels || [],
      text: text.TextDetections || [],
      faces: faces.FaceDetails || [],
      moderation: moderation.ModerationLabels || [],
      celebrities: celebrities.CelebrityFaces || [],
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";
    console.error("Error in AWS analysis:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
