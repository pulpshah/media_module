import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import PDFParser from 'pdf2json';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const uploadedFile = formData.get('filepond'); // Get single file instead of using getAll

    if (!uploadedFile || !(uploadedFile instanceof File)) {
      return NextResponse.json({ error: "Invalid file format" }, { status: 400 });
    }

    // Generate a unique filename
    const fileName = "Temp";
    const tempFilePath = `/tmp/${fileName}.pdf`;

    // Convert ArrayBuffer to Buffer and save file
    const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
    await fs.writeFile(tempFilePath, fileBuffer);

    // Parse the PDF using pdf2json
    const pdfParser = new (PDFParser as any)(null, 1);

    return new Promise((resolve) => {
      pdfParser.on('pdfParser_dataError', (errData: any) => {
        console.error(errData.parserError);
        resolve(NextResponse.json({ error: "Error parsing PDF" }, { status: 500 }));
      });

      pdfParser.on('pdfParser_dataReady', () => {
        const parsedText = (pdfParser as any).getRawTextContent();
        resolve(NextResponse.json({ text: parsedText, fileName }));
      });

      pdfParser.loadPDF(tempFilePath);
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
  