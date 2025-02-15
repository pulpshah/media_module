import { createClient } from "@deepgram/sdk";
import ytdl from "ytdl-core";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // Parse the request body to extract the YouTube URL
    let { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 });
    }

    // Convert embed URL to standard watch URL
    if (url.includes("/embed/")) {
      url = url.replace("/embed/", "/watch?v=");
    }

    // Validate the transformed URL
    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
    }

    console.log("Fetching YouTube audio stream from URL:", url);

    // Stream and buffer audio data from YouTube
    const audioStream = ytdl(url, {
      filter: "audioonly", // Extract audio-only
      quality: "highestaudio", // Use the highest audio quality available
      highWaterMark: 1 << 25, // Increase buffer size to handle large files
    });

    // Buffer the audio data
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    console.log("Audio successfully buffered. Buffer size:", buffer.length);

    // Initialize Deepgram and transcribe the audio
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(buffer, {
      model: "nova-3", // Use the "nova-3" transcription model
      smart_format: true, // Enable smart formatting
    });

    if (error) {
      console.error("Deepgram transcription error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Transcription successful.");
    return NextResponse.json(result); // Send the transcription result
  } catch (err: unknown) {
    console.error("Error during transcription:", err);
    const errorMessage = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
