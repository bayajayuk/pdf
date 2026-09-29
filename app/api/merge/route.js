import { NextResponse } from 'next/server';
import { mergePDFs } from '@/lib/pdf-service';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files');

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: 'Please upload at least 2 PDF files to merge.' },
        { status: 400 }
      );
    }

    const processedFiles = [];
    for (const file of files) {
      if (typeof file === 'object' && file.arrayBuffer) {
        const buffer = await file.arrayBuffer();
        processedFiles.push({
          name: file.name,
          buffer,
        });
      }
    }

    const mergedBytes = await mergePDFs(processedFiles);

    return new NextResponse(mergedBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="merged-document.pdf"',
      },
    });
  } catch (error) {
    console.error('Merge API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to merge PDF files.' },
      { status: 500 }
    );
  }
}
