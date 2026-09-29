import { NextResponse } from 'next/server';
import { compressPDF } from '@/lib/pdf-service';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const level = formData.get('level') || '50'; // '50' or '70'

    if (!file || typeof file !== 'object') {
      return NextResponse.json(
        { error: 'Please upload a PDF file to compress.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await compressPDF(buffer, level);

    const safeFilename = file.name ? file.name.replace(/\.pdf$/i, '') : 'document';

    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeFilename}-compressed-${level}pct.pdf"`,
        'X-Original-Size': String(result.originalSize),
        'X-Compressed-Size': String(result.compressedSize),
        'X-Saved-Percentage': String(result.savedPercentage),
        'Access-Control-Expose-Headers': 'X-Original-Size, X-Compressed-Size, X-Saved-Percentage, Content-Disposition',
      },
    });
  } catch (error) {
    console.error('Compress API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to compress PDF.' },
      { status: 500 }
    );
  }
}
