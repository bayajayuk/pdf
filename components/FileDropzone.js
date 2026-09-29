'use client';

import React, { useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  X,
  Plus,
  ArrowUp,
  ArrowDown,
  Cloud,
  HardDrive,
} from 'lucide-react';

export default function FileDropzone({
  multiple = false,
  files = [],
  onFilesChange,
  buttonText = 'Select PDF file',
  helperText = 'or drop PDF here',
  allowReorder = false,
}) {
  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFilesSelected(Array.from(e.target.files));
    }
    // reset input so same file can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFilesSelected = (newFiles) => {
    const pdfFiles = newFiles.filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );

    if (pdfFiles.length === 0) {
      alert('Please select valid PDF file(s).');
      return;
    }

    if (multiple) {
      onFilesChange([...files, ...pdfFiles]);
    } else {
      onFilesChange([pdfFiles[0]]);
    }
  };

  const removeFile = (indexToRemove) => {
    onFilesChange(files.filter((_, idx) => idx !== indexToRemove));
  };

  const moveFile = (index, direction) => {
    const newFiles = [...files];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newFiles.length) return;
    const temp = newFiles[index];
    newFiles[index] = newFiles[targetIndex];
    newFiles[targetIndex] = temp;
    onFilesChange(newFiles);
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="upload-card-wrapper">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInput}
        accept="application/pdf"
        multiple={multiple}
        style={{ display: 'none' }}
        id="pdf-file-input"
      />

      {files.length === 0 ? (
        <div
          className={`dropzone-area ${isDragOver ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            <button
              type="button"
              className="dropzone-cta-btn"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              <UploadCloud size={24} />
              <span>{buttonText}</span>
            </button>

            {/* Cloud integrations icons (like iLovePDF Drive/Dropbox) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div
                title="Google Drive"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Cloud integration ready. Click "Select PDF file" to choose from device.');
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                <Cloud size={18} />
              </div>
              <div
                title="Dropbox"
                onClick={(e) => {
                  e.stopPropagation();
                  alert('Cloud integration ready. Click "Select PDF file" to choose from device.');
                }}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--primary)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                }}
              >
                <HardDrive size={18} />
              </div>
            </div>
          </div>

          <p className="dropzone-subtext">{helperText}</p>
        </div>
      ) : (
        <div className="files-preview-container">
          {files.map((file, idx) => (
            <div key={`${file.name}-${idx}`} className="file-item-card">
              <div className="file-info-group">
                <div className="file-icon-box">
                  <FileText size={24} />
                </div>
                <div className="file-details">
                  <span className="file-name" title={file.name}>
                    {file.name}
                  </span>
                  <span className="file-size">{formatFileSize(file.size)}</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {allowReorder && multiple && (
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => moveFile(idx, -1)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 8px', opacity: idx === 0 ? 0.3 : 1 }}
                      title="Move up"
                    >
                      <ArrowUp size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === files.length - 1}
                      onClick={() => moveFile(idx, 1)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 8px', opacity: idx === files.length - 1 ? 0.3 : 1 }}
                      title="Move down"
                    >
                      <ArrowDown size={16} />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="btn btn-secondary"
                  style={{
                    padding: '8px',
                    borderRadius: '50%',
                    color: '#EF4444',
                    border: '1px solid var(--border-light)',
                  }}
                  title="Remove file"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}

          {multiple && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
                style={{ borderRadius: 'var(--radius-full)', padding: '10px 22px' }}
              >
                <Plus size={18} />
                <span>Add more files</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
