'use client';

import React, { useState } from 'react';
import FileDropzone from '@/components/FileDropzone';
import ProcessingModal from '@/components/ProcessingModal';
import { Minimize2, ArrowRight, Check, Zap, Gauge } from 'lucide-react';

export default function CompressPdfPage() {
  const [files, setFiles] = useState([]);
  const [level, setLevel] = useState('50'); // '50' | '70'
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [stepText, setStepText] = useState('');
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCompress = async () => {
    if (files.length === 0) return;

    setStatus('processing');
    setProgress(15);
    setStepText(`Preparing ${level}% compression engine...`);

    try {
      const formData = new FormData();
      formData.append('file', files[0]);
      formData.append('level', level);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 85) {
            clearInterval(interval);
            return 85;
          }
          return prev + 15;
        });
      }, 180);

      setStepText('Optimizing object streams and compressing structures...');

      const response = await fetch('/api/compress', {
        method: 'POST',
        body: formData,
      });

      clearInterval(interval);

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to compress PDF.');
      }

      setProgress(95);
      setStepText('Finalizing compressed PDF...');

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      const safeFilename = files[0].name.replace(/\.pdf$/i, '') + `-compressed-${level}pct.pdf`;

      const origHeader = response.headers.get('X-Original-Size');
      const compHeader = response.headers.get('X-Compressed-Size');
      const savedPctHeader = response.headers.get('X-Saved-Percentage');

      const originalSize = origHeader ? parseInt(origHeader, 10) : files[0].size;
      const newSize = compHeader ? parseInt(compHeader, 10) : blob.size;
      const savedPercentage = savedPctHeader ? parseInt(savedPctHeader, 10) : parseInt(level, 10);

      setProgress(100);
      setResultData({
        downloadUrl,
        filename: safeFilename,
        originalSize,
        newSize,
        savedPercentage,
      });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMessage(err.message || 'Error occurred while compressing PDF.');
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
        <h1 className="hero-title">Compress PDF file</h1>
        <p className="hero-subtitle">
          Reduce file size while keeping maximum quality. Choose between 50% and 70% compression levels.
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
                <Minimize2 size={22} color="var(--primary)" />
                <span>Select Compression Level</span>
              </div>

              {/* Compression Mode Selector Cards */}
              <div className="compression-grid">
                {/* 50% Compression */}
                <div
                  className={`compression-card ${level === '50' ? 'selected' : ''}`}
                  onClick={() => setLevel('50')}
                  role="button"
                  tabIndex={0}
                >
                  <span className="compression-badge badge-recommended">
                    RECOMMENDED
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="compression-percentage">50%</div>
                    {level === '50' && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>
                    Medium Compression
                  </div>
                  <p className="compression-desc">
                    Good quality, medium file size. Optimal balance for emails, presentations, and daily sharing.
                  </p>
                </div>

                {/* 70% Compression */}
                <div
                  className={`compression-card ${level === '70' ? 'selected' : ''}`}
                  onClick={() => setLevel('70')}
                  role="button"
                  tabIndex={0}
                >
                  <span className="compression-badge badge-extreme">
                    HIGH REDUCTION
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="compression-percentage">70%</div>
                    {level === '70' && (
                      <div
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          background: 'var(--primary)',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Check size={16} />
                      </div>
                    )}
                  </div>
                  <div style={{ fontWeight: '700', fontSize: '16px', marginBottom: '6px' }}>
                    Extreme Compression
                  </div>
                  <p className="compression-desc">
                    Less quality, high compression. Maximizes space reduction for archiving large manuals and books.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCompress}
                  className="btn btn-primary btn-large"
                >
                  <span>Compress PDF ({level}%)</span>
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
