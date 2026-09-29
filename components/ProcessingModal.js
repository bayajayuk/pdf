'use client';

import React from 'react';
import { CheckCircle2, Download, RefreshCw, AlertCircle, FileCheck } from 'lucide-react';

export default function ProcessingModal({
  status, // 'idle' | 'processing' | 'success' | 'error'
  progress = 0,
  stepText = 'Processing...',
  resultData = null, // { downloadUrl, filename, originalSize, newSize, savedPercentage, pageCount }
  errorMessage = '',
  onReset,
}) {
  if (status === 'idle') return null;

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="progress-card">
      {status === 'processing' && (
        <div>
          <div className="progress-spinner" />
          <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
            {stepText}
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Please wait while we process your PDF document...
          </p>
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min(100, Math.max(10, progress))}%` }}
            />
          </div>
          <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>
            {progress}% Completed
          </span>
        </div>
      )}

      {status === 'success' && resultData && (
        <div>
          <div className="success-icon-circle">
            <CheckCircle2 size={44} color="#0E9F6E" />
          </div>
          <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px' }}>
            Your file is ready!
          </h3>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Processed successfully with 100% accuracy.
          </p>

          {/* Metrics summary if available */}
          {(resultData.savedPercentage !== undefined || resultData.originalSize) && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
                padding: '16px',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '28px',
                border: '1px solid var(--border-light)',
              }}
            >
              {resultData.originalSize && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Original Size</div>
                  <div style={{ fontSize: '16px', fontWeight: '700' }}>
                    {formatFileSize(resultData.originalSize)}
                  </div>
                </div>
              )}
              {resultData.newSize && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Compressed</div>
                  <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--accent-green)' }}>
                    {formatFileSize(resultData.newSize)}
                  </div>
                </div>
              )}
              {resultData.savedPercentage !== undefined && (
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Reduction</div>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                    -{resultData.savedPercentage}%
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Download CTA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', alignItems: 'center' }}>
            <a
              href={resultData.downloadUrl}
              download={resultData.filename || 'converted_file'}
              className="btn btn-primary btn-large"
              style={{ width: '100%', maxWidth: '340px' }}
            >
              <Download size={22} />
              <span>Download {resultData.filename || 'File'}</span>
            </a>

            <button
              type="button"
              onClick={onReset}
              className="btn btn-secondary"
              style={{ width: '100%', maxWidth: '340px' }}
            >
              <RefreshCw size={16} />
              <span>Process another PDF</span>
            </button>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: '#FEE2E2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}
          >
            <AlertCircle size={40} />
          </div>
          <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#DC2626', marginBottom: '8px' }}>
            Processing Failed
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            {errorMessage || 'An error occurred while processing the PDF file. Please try again.'}
          </p>
          <button type="button" onClick={onReset} className="btn btn-secondary">
            <RefreshCw size={16} />
            <span>Try Again</span>
          </button>
        </div>
      )}
    </div>
  );
}
