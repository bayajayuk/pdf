'use client';

import React, { useState } from 'react';
import FileDropzone from '@/components/FileDropzone';
import ProcessingModal from '@/components/ProcessingModal';
import { Layers, ArrowRight, AlertCircle } from 'lucide-react';

export default function MergePdfPage() {
  const [files, setFiles] = useState([]);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleMerge = async () => {
    if (files.length < 2) {
      alert('Please upload at least 2 PDF files to merge.');
      return;
    }

    setStatus('processing');
    setProgress(20);
    setStepText(`Reading ${files.length} PDF files in sequence...`);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 200);

      setStepText('Combining pages and linking bookmarks...');

      const response = await fetch('/api/merge', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to merge PDF files.');
      }

      setProgress(95);
      setStepText('Finalizing merged document...');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const totalOriginalSize = files.reduce((acc, f) => acc + f.size, 0);

      setProgress(100);
      setResultData({
        downloadUrl,
        filename: 'merged-document.pdf',
        originalSize: totalOriginalSize,
        newSize: blob.size,
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while merging PDFs.');
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
        <h1 className="hero-title">Merge PDF files</h1>
        <p className="hero-subtitle">
          Combine multiple PDFs in the order you want with the easiest PDF merger available.
        </p>
      </section>

      {/* Main Interactive Workspace */}
      {status === 'idle' && (
        <>
          <FileDropzone
            multiple={true}
            files={files}
            onFilesChange={setFiles}
            buttonText="Select PDF files"
            helperText="or drop multiple PDFs here"
            allowReorder={true}
          />

          {files.length > 0 && (
            <div className="action-panel-card">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div className="action-panel-title" style={{ margin: 0 }}>
                  <Layers size={22} color="var(--primary)" />
                  <span>Merge Queue ({files.length} files selected)</span>
                </div>
                {files.length < 2 && (
                  <span
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '13px',
                      color: 'var(--accent-amber)',
                      fontWeight: '600',
                    }}
                  >
                    <AlertCircle size={16} /> Need at least 2 files to merge
                  </span>
                )}
              </div>

              <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                Use the <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>↑ / ↓</span> buttons
                above to reorder your PDF files before merging them into a single document.
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  disabled={files.length < 2}
                  onClick={handleMerge}
                  className="btn btn-primary btn-large"
                  style={{ opacity: files.length < 2 ? 0.5 : 1, cursor: files.length < 2 ? 'not-allowed' : 'pointer' }}
                >
                  <span>Merge PDF ({files.length} files)</span>
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
