import { createClient } from "@deepgram/sdk";
import ytdl from "@distube/ytdl-core";
import { NextResponse } from "next/server";
import { Readable } from "stream";

// YouTube authorization data
const YOUTUBE_AUTH = {
  youtube: {
    client_id: process.env.YOUTUBE_CLIENT_ID || "",
    client_secret: process.env.YOUTUBE_CLIENT_SECRET || "",
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN || "",
    access_token: process.env.YOUTUBE_ACCESS_TOKEN || "",
    token_type: "Bearer",
    cookie: "", // Required for the token type
  },
};

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

    console.log("Attempting to stream audio from URL:", url);

    try {
      // Get audio stream with specific format and quality
      const audioStream = ytdl(url, {
        filter: "audioonly",
        quality: "highestaudio",
        highWaterMark: 1 << 25, // 32MB buffer
        requestOptions: {
          headers: {
            // Add common headers to appear more like a browser request
            cookie: "",
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
            "Sec-Fetch-Dest": "audio",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "cross-site",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 9.8; Win64; x64) AppleWebKit/537.35 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.35",
          },
        },
      });

      // Convert stream to buffer
      const chunks: Buffer[] = [];
      let totalSize = 0;
      const MAX_SIZE = 50 * 1024 * 1024; // 50MB limit

      for await (const chunk of audioStream) {
        chunks.push(chunk);
        totalSize += chunk.length;

        if (totalSize > MAX_SIZE) {
          throw new Error("Audio file too large - please try a shorter video");
        }
      }

      const buffer = Buffer.concat(chunks);
      console.log("Audio successfully buffered. Buffer size:", buffer.length);

      // Initialize Deepgram and transcribe the audio
      const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
      const { result, error } =
        await deepgram.listen.prerecorded.transcribeFile(buffer, {
          model: "nova-3",
          smart_format: true,
        });

      if (error) {
        console.error("Deepgram transcription error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log("Transcription successful.");
      return NextResponse.json(result);
    } catch (streamError: any) {
      console.error("Error during streaming:", streamError);

      if (streamError.message?.includes("Sign in to confirm")) {
        return NextResponse.json(
          {
            error:
              "YouTube is blocking automated access. Please try:\n1. A different video\n2. Wait a few minutes and try again\n3. Use a shorter video",
          },
          { status: 429 }
        );
      }

      if (streamError.message?.includes("age-restricted")) {
        return NextResponse.json(
          {
            error: "This video is age-restricted and cannot be accessed",
          },
          { status: 403 }
        );
      }

      if (streamError.message?.includes("private")) {
        return NextResponse.json(
          {
            error: "This video is private and cannot be accessed",
          },
          { status: 403 }
        );
      }

      if (streamError.message?.includes("not available")) {
        return NextResponse.json(
          {
            error:
              "This video is not available - it may be region-locked or deleted",
          },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          error: "Could not access video - please try a different one",
        },
        { status: 400 }
      );
    }
  } catch (err: unknown) {
    console.error("Error during transcription:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";

    return NextResponse.json(
      {
        error:
          "Failed to process video - please try again with a different video",
      },
      { status: 500 }
    );
  }
}
