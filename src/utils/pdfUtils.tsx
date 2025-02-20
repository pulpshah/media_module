import * as pdfjsLib from "pdfjs-dist";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import { pipeline } from "stream";
import fetch from "node-fetch";


const streamPipeline = promisify(pipeline);

export async function downloadFileFromUrl({
  urlToDownload,
  downloadDirectoryPath,
}: {
  urlToDownload: string;
  downloadDirectoryPath: string;
}): Promise<{ filePath?: string; error?: string }[]> {
  try {
    if (!urlToDownload) {
      return [{ error: "No URL provided" }];
    }

    console.log("Downloading file from URL:", urlToDownload);

    // Fetch file from URL
    const response = await fetch(urlToDownload);

    if (!response.ok) {
      return [{ error: `Failed to fetch file: ${response.statusText}` }];
    }

    // Get filename from URL or generate one
    const fileName = path.basename(new URL(urlToDownload).pathname) || `downloaded-${Date.now()}.pdf`;
    const filePath = path.join(downloadDirectoryPath, fileName);

    // Ensure directory exists
    if (!fs.existsSync(downloadDirectoryPath)) {
      fs.mkdirSync(downloadDirectoryPath, { recursive: true });
    }

    // Write file to disk
    const fileStream = fs.createWriteStream(filePath);
    await streamPipeline(response.body, fileStream);

    console.log("File downloaded successfully:", filePath);

    return [{ filePath }];
  } catch (error) {
    console.error("Error downloading file:", error);
    return [{ error: (error as Error).message }];
  }
}
