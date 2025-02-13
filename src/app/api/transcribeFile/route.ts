import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Extract the file from the FormData
    const formData = await request.formData();
    const fileField = formData.get("file");
    if (!fileField) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    // Convert the File (Web API) into a Node.js Buffer
    const file = fileField as File;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
      buffer,
      {
        model: "nova-3",
        smart_format: true,
      }
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
