import * as pdfjsLib from "pdfjs-dist";

export async function extractPdfText(file: File): Promise<string> {
    const pdf = await pdfjsLib.getDocument(URL.createObjectURL(file)).promise;
    let text = "";
  
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => ('str' in item ? item.str : '')).join(" ");
    }
  
    return text;
  }