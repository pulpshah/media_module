import { createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { url } = await request.json();
  if (!url) {
    return NextResponse.json({ error: "No URL provided" }, { status: 400 });
  }

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  try {
    const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
      { url },
      { model: "nova-3", smart_format: true }
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
