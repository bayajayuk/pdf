'use client';

import React, { useState } from 'react';
import FileDropzone from '@/components/FileDropzone';
import ProcessingModal from '@/components/ProcessingModal';
import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function PdfToWordPage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle'); // 'idle' | 'processing' | 'success' | 'error'
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleConvert = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(15);
    setStepText('Uploading PDF document...');

    try {
      const formData = new FormData();
      formData.append('file', files[0]);

      // Progress animation simulation while server processes
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);

      setStepText('Analyzing layout and extracting text...');

      const response = await fetch('/api/convert/to-word', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to convert PDF to Word.');
      }

      setProgress(95);
      setStepText('Generating Word (.docx) document...');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const filename = files[0].name.replace(/\.[^/.]+$/, '') + '.docx';
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
        <h1 className="hero-title">PDF to WORD Converter</h1>
        <p className="hero-subtitle">
          Convert your PDF to WORD documents with incredible accuracy.
          <br />
          Powered by smart document parsing.
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
            helperText="or drop PDF here"
          />

          {files.length > 0 && (
            <div className="action-panel-card">
              <div className="action-panel-title">
                <FileText size={22} color="var(--primary)" />
                <span>Conversion Settings</span>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={18} color="var(--accent-green)" />
                  <span style={{ fontSize: '15px', fontWeight: '600' }}>
                    Standard DOCX with Paragraph & Heading Preservation
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginLeft: '26px' }}>
                  Text styles, margins, and headings will be neatly preserved in Microsoft Word format.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleConvert}
                  className="btn btn-primary btn-large"
                >
                  <span>Convert to WORD</span>
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
