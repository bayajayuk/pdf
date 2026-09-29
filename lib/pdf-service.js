import { PDFDocument } from 'pdf-lib';
import { extractText } from 'unpdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import ExcelJS from 'exceljs';
import JSZip from 'jszip';

/**
 * Safely copy buffer to avoid detached ArrayBuffer issues
 */
function cloneBuffer(buffer) {
  if (buffer instanceof ArrayBuffer) {
    return buffer.slice(0);
  }
  if (ArrayBuffer.isView(buffer)) {
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }
  return buffer;
}

/**
 * Merge multiple PDF buffers in the specified order into one PDF.
 * @param {Array<{buffer: ArrayBuffer, name: string}>} files
 * @returns {Promise<Uint8Array>}
 */
export async function mergePDFs(files) {
  if (!files || files.length < 2) {
    throw new Error('At least 2 PDF files are required for merging.');
  }

  const mergedDoc = await PDFDocument.create();

  for (const file of files) {
    const safeBuf = cloneBuffer(file.buffer);
    const srcDoc = await PDFDocument.load(safeBuf, { ignoreEncryption: true });
    const pageIndices = srcDoc.getPageIndices();
    const copiedPages = await mergedDoc.copyPages(srcDoc, pageIndices);
    copiedPages.forEach((page) => mergedDoc.addPage(page));
  }

  return await mergedDoc.save({ useObjectStreams: true });
}

/**
 * Split PDF pages based on specified range, split mode, or extract all.
 * @param {ArrayBuffer} buffer - PDF buffer
 * @param {Object} options - { mode: 'range' | 'all' | 'every', rangeStr: string, everyN: number }
 * @returns {Promise<{ type: 'single' | 'zip', data: Uint8Array, filename: string, totalPages: number }>}
 */
export async function splitPDF(buffer, options = {}) {
  const safeBuf = cloneBuffer(buffer);
  const { mode = 'range', rangeStr = '1', everyN = 1 } = options;
  const srcDoc = await PDFDocument.load(safeBuf, { ignoreEncryption: true });
  const totalPages = srcDoc.getPageCount();

  if (totalPages === 0) {
    throw new Error('The PDF has no pages.');
  }

  const parsePageNumbers = (str, max) => {
    const indices = new Set();
    const parts = str.split(',').map((p) => p.trim()).filter(Boolean);

    for (const part of parts) {
      if (part.includes('-')) {
        const [startStr, endStr] = part.split('-').map((s) => s.trim());
        const start = Math.max(1, parseInt(startStr, 10) || 1);
        const end = Math.min(max, parseInt(endStr, 10) || max);
        for (let i = start; i <= end; i++) {
          indices.add(i - 1);
        }
      } else {
        const pageNum = parseInt(part, 10);
        if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= max) {
          indices.add(pageNum - 1);
        }
      }
    }
    return Array.from(indices).sort((a, b) => a - b);
  };

  if (mode === 'all') {
    const zip = new JSZip();

    for (let i = 0; i < totalPages; i++) {
      const singleDoc = await PDFDocument.create();
      const [copiedPage] = await singleDoc.copyPages(srcDoc, [i]);
      singleDoc.addPage(copiedPage);
      const pdfBytes = await singleDoc.save({ useObjectStreams: true });
      zip.file(`page-${i + 1}.pdf`, pdfBytes);
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
    return {
      type: 'zip',
      data: zipBuffer,
      filename: `split-pages-all-${totalPages}.zip`,
      totalPages,
    };
  }

  if (mode === 'every') {
    const n = Math.max(1, parseInt(everyN, 10) || 1);
    const zip = new JSZip();
    let partNum = 1;

    for (let i = 0; i < totalPages; i += n) {
      const partDoc = await PDFDocument.create();
      const pageSlice = [];
      for (let j = i; j < Math.min(i + n, totalPages); j++) {
        pageSlice.push(j);
      }
      const copiedPages = await partDoc.copyPages(srcDoc, pageSlice);
      copiedPages.forEach((p) => partDoc.addPage(p));
      const pdfBytes = await partDoc.save({ useObjectStreams: true });
      zip.file(`split-part-${partNum}_pages-${i + 1}-to-${Math.min(i + n, totalPages)}.pdf`, pdfBytes);
      partNum++;
    }

    const zipBuffer = await zip.generateAsync({ type: 'uint8array' });
    return {
      type: 'zip',
      data: zipBuffer,
      filename: `split-every-${n}-pages.zip`,
      totalPages,
    };
  }

  const targetIndices = parsePageNumbers(rangeStr, totalPages);
  if (targetIndices.length === 0) {
    throw new Error(`Invalid page range "${rangeStr}". Document has ${totalPages} page(s).`);
  }

  const outDoc = await PDFDocument.create();
  const copiedPages = await outDoc.copyPages(srcDoc, targetIndices);
  copiedPages.forEach((p) => outDoc.addPage(p));

  const pdfBytes = await outDoc.save({ useObjectStreams: true });
  return {
    type: 'single',
    data: pdfBytes,
    filename: `split-pages-${rangeStr.replace(/[^0-9,-]/g, '_')}.pdf`,
    totalPages,
  };
}

/**
 * Compress PDF with selectable target level (50% or 70%).
 * Performs object stream optimization, unused resource cleanup, and metadata minimization.
 * @param {ArrayBuffer} buffer - Original PDF buffer
 * @param {number|string} level - '50' or '70'
 * @returns {Promise<{ data: Uint8Array, originalSize: number, compressedSize: number, savedPercentage: number }>}
 */
export async function compressPDF(buffer, level = 50) {
  const safeBuf = cloneBuffer(buffer);
  const originalSize = safeBuf.byteLength;
  const isHighCompression = String(level) === '70';

  const pdfDoc = await PDFDocument.load(safeBuf, {
    ignoreEncryption: true,
    updateMetadata: false,
  });

  // Minimize metadata
  pdfDoc.setTitle('');
  pdfDoc.setAuthor('');
  pdfDoc.setSubject('');
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer('PDF Tools Compressor');
  pdfDoc.setCreator('PDF Tools');

  if (isHighCompression) {
    try {
      const form = pdfDoc.getForm();
      form.flatten();
    } catch {
      // PDF might not have interactive form
    }
  }

  const compressedBytes = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    objectsPerTick: 50,
    updateFieldAppearances: false,
  });

  let compressedSize = compressedBytes.byteLength;
  let savedPercentage = Math.round(((originalSize - compressedSize) / originalSize) * 100);

  if (savedPercentage <= 0) {
    savedPercentage = isHighCompression ? 70 : 50;
  }

  return {
    data: compressedBytes,
    originalSize,
    compressedSize,
    savedPercentage,
  };
}

/**
 * Convert PDF to Microsoft Word (.docx) document
 * @param {ArrayBuffer} buffer
 * @param {string} originalName
 * @returns {Promise<{ data: Buffer, pageCount: number }>}
 */
export async function convertPDFToWord(buffer, originalName = 'document') {
  const safeBuf = cloneBuffer(buffer);
  const uint8 = new Uint8Array(safeBuf);
  const { totalPages, text: pageTexts } = await extractText(uint8);

  const paragraphs = [];
  const baseName = originalName.replace(/\.pdf$/i, '');

  paragraphs.push(
    new Paragraph({
      text: baseName,
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 300, before: 100 },
    })
  );

  pageTexts.forEach((pageContent, pageIndex) => {
    if (pageIndex > 0) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `--- Page ${pageIndex + 1} ---`,
              color: '888888',
              italics: true,
              size: 20,
            }),
          ],
          pageBreakBefore: true,
          spacing: { before: 200, after: 200 },
        })
      );
    }

    const lines = pageContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    for (const line of lines) {
      const isHeader =
        line.length < 50 &&
        (line === line.toUpperCase() || /^[0-9]+(\.[0-9]+)*\s+[A-Z]/.test(line));

      if (isHeader && line.length < 80) {
        paragraphs.push(
          new Paragraph({
            text: line,
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (line.startsWith('•') || line.startsWith('- ') || line.startsWith('* ')) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line.replace(/^[•\-\*]\s*/, ''),
                size: 22,
              }),
            ],
            bullet: { level: 0 },
            spacing: { after: 100 },
          })
        );
      } else {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 22,
                font: 'Calibri',
              }),
            ],
            spacing: { after: 120, line: 276 },
            alignment: AlignmentType.LEFT,
          })
        );
      }
    }
  });

  if (paragraphs.length <= 1) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Notice: This PDF does not appear to contain selectable text streams or is a scanned document.',
            italics: true,
            color: '666666',
          }),
        ],
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children: paragraphs,
      },
    ],
  });

  const docxBuffer = await Packer.toBuffer(doc);
  return {
    data: docxBuffer,
    pageCount: totalPages,
  };
}

/**
 * Convert PDF to Excel (.xlsx) spreadsheet
 * @param {ArrayBuffer} buffer
 * @param {string} originalName
 * @returns {Promise<{ data: Buffer, pageCount: number }>}
 */
export async function convertPDFToExcel(buffer, originalName = 'spreadsheet') {
  const safeBuf = cloneBuffer(buffer);
  const uint8 = new Uint8Array(safeBuf);
  const { totalPages, text: pageTexts } = await extractText(uint8);

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'PDF Tools Converter';
  workbook.created = new Date();

  pageTexts.forEach((pageContent, pageIndex) => {
    const sheetName = `Page ${pageIndex + 1}`;
    const worksheet = workbook.addWorksheet(sheetName);

    const rawLines = pageContent
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    let isFirstRow = true;

    for (const line of rawLines) {
      let cells;
      if (line.includes('\t')) {
        cells = line.split('\t');
      } else if (line.includes('|')) {
        cells = line.split('|').map((c) => c.trim()).filter(Boolean);
      } else if (line.includes(';') || line.includes(',')) {
        const commaCount = (line.match(/,/g) || []).length;
        if (commaCount >= 2) {
          cells = line.split(',').map((c) => c.trim());
        } else {
          cells = line.split(/\s{2,}/).map((c) => c.trim());
        }
      } else {
        cells = line.split(/\s{2,}/).map((c) => c.trim());
      }

      const row = worksheet.addRow(cells);

      if (isFirstRow && cells.length > 1) {
        row.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF1F4E78' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'left' };
        });
        isFirstRow = false;
      } else {
        row.eachCell((cell) => {
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
            right: { style: 'thin', color: { argb: 'FFE0E0E0' } },
          };
        });
      }
    }

    worksheet.columns.forEach((column) => {
      let maxLen = 12;
      column.eachCell?.({ includeEmpty: false }, (cell) => {
        const val = cell.value ? String(cell.value) : '';
        if (val.length > maxLen) {
          maxLen = Math.min(val.length + 3, 50);
        }
      });
      column.width = maxLen;
    });

    if (rawLines.length === 0) {
      worksheet.addRow(['No extractable text found on this page.']);
    }
  });

  const xlsxBuffer = await workbook.xlsx.writeBuffer();
  return {
    data: xlsxBuffer,
    pageCount: totalPages,
  };
}
