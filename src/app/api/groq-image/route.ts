import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileField = formData.get("file");

    if (!fileField) {
      return NextResponse.json({ error: "No file found" }, { status: 400 });
    }

    const file = fileField as File;

    // Validate image size (limit: 4MB)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image exceeds 4MB size limit" },
        { status: 413 }
      );
    }

    // Convert image to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    // Create Groq request
    const visionResponse = await groq.chat.completions.create({
      model: "llama-3.2-90b-vision-preview",
      messages: [
        {
          role: "user",
          content: `Analyze this image and return JSON with:
          - "description": detailed visual description
          Example response: 
          {
            "description": "A street scene showing..."
          }`,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64Image}`
              }
            }
          ],
        },  
      ],
      response_format: { type: "json_object" },
      max_tokens: 1024,
    });

    // Extract the response content
    const responseContent = visionResponse.choices[0]?.message?.content;

    // Verify if response content is valid JSON
    try {
      if (!responseContent) {
        throw new Error("Empty response content from Groq API");
      }
      const parsedContent = JSON.parse(responseContent);
      return NextResponse.json(parsedContent);
    } catch (jsonError) {
      console.error("Invalid JSON response:", responseContent);
      return NextResponse.json(
        { error: "Invalid JSON response from Groq API" },
        { status: 500 }
      );
    }
  } catch (err: unknown) {
    const errorMessage =
      err instanceof Error ? err.message : "Unexpected error";
    console.error("Error during image analysis:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
