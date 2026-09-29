'use client';

import React, { useState } from 'react';
import FileDropzone from '@/components/FileDropzone';
import ProcessingModal from '@/components/ProcessingModal';
import { FileSpreadsheet, ArrowRight, Table } from 'lucide-react';

export default function PdfToExcelPage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConvert = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(15);
    setStepText('Uploading PDF spreadsheet...');

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);

      setStepText('Detecting tables and parsing columns...');

      const response = await fetch('/api/convert/to-excel', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to convert PDF to Excel.');
      }

      setProgress(95);
      setStepText('Formatting Excel (.xlsx) workbook...');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const filename = files[0].name.replace(/\.[^/.]+$/, '') + '.xlsx';
      const pageCount = response.headers.get('X-Page-Count');

      setProgress(100);
      setResultData({
        downloadUrl,
        filename,
        originalSize: files[0].size,
        newSize: blob.size,
        pageCount: pageCount || 1,
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred during conversion.');
      setStatus('error');
    }
  };

  const handleReset = () => {
    if (resultData?.downloadUrl) {
      URL.revokeObjectURL(resultData.downloadUrl);
    }
    setFiles([]);
    setStatus('idle');
    setProgress(0);
    setResultData(null);
    setErrorMessage('');
  };

  return (
    <div className="container">
      {/* Hero Header */}
      <section className="hero-section">
        <h1 className="hero-title">PDF to EXCEL Converter</h1>
        <p className="hero-subtitle">
          Pull data straight from PDFs into Excel spreadsheets in a few short seconds.
          <br />
          Auto-formats columns, headers, and rows into valid .xlsx sheets.
        </p>
      </section>

      {/* Main Interactive Workspace */}
      {status === 'idle' && (
        <>
          <FileDropzone
            multiple={false}
            files={files}
            onFilesChange={setFiles}
            buttonText="Select PDF file"
            helperText="or drop PDF spreadsheet here"
          />

          {files.length > 0 && (
            <div className="action-panel-card">
              <div className="action-panel-title">
                <Table size={22} color="var(--accent-green)" />
                <span>Spreadsheet Configuration</span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>
                    Auto Table & Column Detection
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Each page will be mapped into dedicated sheets with styled headers and borders.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleConvert}
                  className="btn btn-primary btn-large"
                  style={{ background: '#059669' }}
                >
                  <span>Convert to EXCEL</span>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Processing & Success Modal */}
      <ProcessingModal
        status={status}
        progress={progress}
        stepText={stepText}
        resultData={resultData}
        errorMessage={errorMessage}
        onReset={handleReset}
      />
    </div>
  );
}
