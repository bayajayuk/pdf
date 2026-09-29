'use client';

import React, { useState } from 'react';
import FileDropzone from '@/components/FileDropzone';
import ProcessingModal from '@/components/ProcessingModal';
import { Scissors, ArrowRight, Layers, FileArchive, Sliders } from 'lucide-react';

export default function SplitPdfPage() {
  const [files, setFiles] = useState([]);
  const [mode, setMode] = useState('range'); // 'range' | 'all' | 'every'
  const [rangeStr, setRangeStr] = useState('1-2');
  const [everyN, setEveryN] = useState('1');

  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSplit = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(20);
    setStepText('Reading and validating PDF pages...');

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('mode', mode);
      formData.append('rangeStr', rangeStr);
      formData.append('everyN', everyN);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 180);

      setStepText('Extracting specified pages...');

      const response = await fetch('/api/split', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to split PDF.');
      }

      setProgress(95);
      setStepText('Packaging split files...');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const isZip = blob.type.includes('zip') || mode === 'all' || mode === 'every';
      const baseName = files[0].name.replace(/\.pdf$/i, '');
      const filename = isZip
        ? `${baseName}-split.zip`
        : `${baseName}-pages-${rangeStr.replace(/[^0-9,-]/g, '_')}.pdf`;

      setProgress(100);
      setResultData({
        downloadUrl,
        filename,
        originalSize: files[0].size,
        newSize: blob.size,
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while splitting PDF.');
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
        <h1 className="hero-title">Split PDF file</h1>
        <p className="hero-subtitle">
          Separate one page or a whole set for easy conversion into independent PDF files.
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
                <Scissors size={22} color="var(--primary)" />
                <span>Split Options</span>
              </div>

              {/* Mode Selection Tabs */}
              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  marginBottom: '24px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className={`pill-chip ${mode === 'range' ? 'active' : ''}`}
                  onClick={() => setMode('range')}
                  style={{ padding: '10px 18px', fontSize: '14px' }}
                >
                  <Sliders size={16} /> Custom Page Range
                </button>
                <button
                  type="button"
                  className={`pill-chip ${mode === 'all' ? 'active' : ''}`}
                  onClick={() => setMode('all')}
                  style={{ padding: '10px 18px', fontSize: '14px' }}
                >
                  <FileArchive size={16} /> Extract All Pages (ZIP)
                </button>
                <button
                  type="button"
                  className={`pill-chip ${mode === 'every' ? 'active' : ''}`}
                  onClick={() => setMode('every')}
                  style={{ padding: '10px 18px', fontSize: '14px' }}
                >
                  <Layers size={16} /> Split Every N Pages
                </button>
              </div>

              {/* Range Mode Controls */}
              {mode === 'range' && (
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                    }}
                  >
                    Specify Pages to Extract (e.g., <code>1-3, 5, 8</code>):
                  </label>
                  <input
                    type="text"
                    value={rangeStr}
                    onChange={(e) => setRangeStr(e.target.value)}
                    placeholder="e.g. 1-2, 4"
                    className="text-input"
                    style={{ marginBottom: '12px' }}
                  />

                  {/* Quick Preset Chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)', alignSelf: 'center' }}>
                      Presets:
                    </span>
                    <button
                      type="button"
                      className="pill-chip"
                      onClick={() => setRangeStr('1')}
                    >
                      First Page (1)
                    </button>
                    <button
                      type="button"
                      className="pill-chip"
                      onClick={() => setRangeStr('1-3')}
                    >
                      Pages 1-3
                    </button>
                    <button
                      type="button"
                      className="pill-chip"
                      onClick={() => setRangeStr('1, 3, 5, 7, 9')}
                    >
                      Odd Pages
                    </button>
                    <button
                      type="button"
                      className="pill-chip"
                      onClick={() => setRangeStr('2, 4, 6, 8, 10')}
                    >
                      Even Pages
                    </button>
                  </div>
                </div>
              )}

              {/* Every N Mode Controls */}
              {mode === 'every' && (
                <div style={{ marginBottom: '24px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '8px',
                    }}
                  >
                    Split every:
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={everyN}
                      onChange={(e) => setEveryN(e.target.value)}
                      className="text-input"
                      style={{ width: '120px' }}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                      page(s) into separate PDF files.
                    </span>
                  </div>
                </div>
              )}

              {/* All Mode Info */}
              {mode === 'all' && (
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                  Every single page of this PDF will be saved into its own individual PDF file, archived together in a ZIP file for convenient download.
                </p>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleSplit}
                  className="btn btn-primary btn-large"
                >
                  <span>Split PDF</span>
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
