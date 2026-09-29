import React from 'react';
import Link from 'next/link';
import {
  Layers,
  Scissors,
  Minimize2,
  FileText,
  FileSpreadsheet,
  ArrowRight,
  Shield,
  Zap,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

const tools = [
  {
    id: 'merge',
    title: 'Merge PDF',
    desc: 'Combine multiple PDF files into one single organized document in your desired order.',
    href: '/merge',
    icon: Layers,
    accentColor: '#8B5CF6',
    accentBg: 'rgba(139, 92, 246, 0.12)',
    tag: 'Popular',
  },
  {
    id: 'split',
    title: 'Split PDF',
    desc: 'Separate one page, custom ranges (1-3, 5), or extract all pages into separate PDF files.',
    href: '/split',
    icon: Scissors,
    accentColor: '#F59E0B',
    accentBg: 'rgba(245, 158, 11, 0.12)',
    tag: 'Precise',
  },
  {
    id: 'compress',
    title: 'Compress PDF',
    desc: 'Reduce file size with selectable 50% (balanced) or 70% (high compression) profiles.',
    href: '/compress',
    icon: Minimize2,
    accentColor: '#10B981',
    accentBg: 'rgba(16, 185, 129, 0.12)',
    tag: '50% & 70%',
  },
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    desc: 'Convert your PDF documents into editable Word (.docx) files with incredible accuracy.',
    href: '/convert/pdf-to-word',
    icon: FileText,
    accentColor: '#3B82F6',
    accentBg: 'rgba(59, 130, 246, 0.12)',
    tag: 'Accurate DOCX',
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    desc: 'Extract table data and columns straight from PDFs into clean Excel (.xlsx) spreadsheets.',
    href: '/convert/pdf-to-excel',
    icon: FileSpreadsheet,
    accentColor: '#059669',
    accentBg: 'rgba(5, 150, 105, 0.12)',
    tag: 'Clean XLSX',
  },
];

export default function HomePage() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section className="hero-section">
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'var(--primary-light)', borderRadius: 'var(--radius-full)', color: 'var(--primary)', fontSize: '14px', fontWeight: '700', marginBottom: '16px' }}>
          <Sparkles size={16} /> All-in-One Online PDF Suite
        </div>
        <h1 className="hero-title">
          Every tool you need to work with PDFs in one place
        </h1>
        <p className="hero-subtitle">
          Every tool you need to use PDFs, at your fingertips. 100% free and easy to use! Merge, split, compress, and convert PDF to Word & Excel in just a few clicks.
        </p>
      </section>

      {/* Tools Grid */}
      <div className="tools-grid">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.id}
              href={tool.href}
              className="tool-card"
              style={{
                '--card-accent': tool.accentColor,
                '--card-accent-bg': tool.accentBg,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div className="tool-icon-wrapper">
                  <Icon size={28} />
                </div>
                {tool.tag && (
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      background: tool.accentBg,
                      color: tool.accentColor,
                    }}
                  >
                    {tool.tag}
                  </span>
                )}
              </div>

              <h2 className="tool-title">{tool.title}</h2>
              <p className="tool-desc">{tool.desc}</p>

              <div className="tool-action-arrow">
                <span>Open tool</span>
                <ArrowRight size={16} />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Value Proposition Highlights */}
      <section
        style={{
          margin: '40px 0 80px',
          padding: '40px 32px',
          background: 'var(--bg-surface)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 36px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: '800', marginBottom: '8px' }}>
            The PDF Software Trusted by Thousands
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>
            Process documents directly in your browser with maximum speed, fidelity, and privacy.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '28px',
          }}
        >
          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
                Instant Processing
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                High-performance engines process conversions, merges, and splits in under a second.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-green-light)',
                color: 'var(--accent-green)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Shield size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
                100% Privacy & Security
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Your documents are never permanently stored. Stateless processing guarantees full confidentiality.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-blue-light)',
                color: 'var(--accent-blue)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CheckCircle size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '17px', fontWeight: '700', marginBottom: '4px' }}>
                Accurate Formatting
              </h3>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                Retains headers, paragraphs, and table columns when outputting to Word and Excel.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
