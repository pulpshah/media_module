import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import path from "path";

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    // Parse the request body to get the URL
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing URL in the request body" },
        { status: 400 }
      );
    }

    // Path to the Rust scraper binary
    const scraperPath = path.resolve("..//target/release/website-scraper");

    // Execute the Rust scraper with the provided URL
    const { stdout } = await execAsync(`${scraperPath} ${url}`);

    // Parse the JSON output from the Rust scraper
    const scrapedData = JSON.parse(stdout);

    // Return the JSON response
    return NextResponse.json(scrapedData, { status: 200 });
  } catch (error) {
    console.error("Error while running the scraper:", error);
    return NextResponse.json(
      { 
        error: "Failed to scrape the website", 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
