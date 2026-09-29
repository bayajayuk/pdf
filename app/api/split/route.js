import { NextResponse } from 'next/server';
import { splitPDF } from '@/lib/pdf-service';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const mode = formData.get('mode') || 'range'; // 'range' | 'all' | 'every'
    const rangeStr = formData.get('rangeStr') || '1';
    const everyN = parseInt(formData.get('everyN') || '1', 10);

    if (!file || typeof file !== 'object') {
      return NextResponse.json(
        { error: 'Please upload a PDF file to split.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await splitPDF(buffer, { mode, rangeStr, everyN });

    const contentType = result.type === 'zip' ? 'application/zip' : 'application/pdf';

    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'X-Total-Pages': String(result.totalPages),
        'Access-Control-Expose-Headers': 'X-Total-Pages, Content-Disposition',
      },
    });
  } catch (error) {
    console.error('Split API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to split PDF.' },
      { status: 500 }
    );
  }
}
