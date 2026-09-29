import { NextResponse } from 'next/server';
import { convertPDFToExcel } from '@/lib/pdf-service';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file !== 'object') {
      return NextResponse.json(
        { error: 'Please upload a PDF file to convert to Excel.' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const result = await convertPDFToExcel(buffer, file.name);

    const safeBaseName = file.name ? file.name.replace(/\.[^/.]+$/, '') : 'spreadsheet';

    return new NextResponse(result.data, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${safeBaseName}.xlsx"`,
        'X-Page-Count': String(result.pageCount),
        'Access-Control-Expose-Headers': 'X-Page-Count, Content-Disposition',
      },
    });
  } catch (error) {
    console.error('PDF to Excel API error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to convert PDF to Excel.' },
      { status: 500 }
    );
  }
}
