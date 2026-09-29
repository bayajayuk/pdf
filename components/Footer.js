import React from 'react';
import Link from 'next/link';
import { Heart, ShieldCheck, Zap, Lock } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerGrid}>
          {/* Brand & Description */}
          <div className={styles.footerBrandCol}>
            <div className={styles.footerBrand}>
              <Heart size={20} color="var(--primary)" fill="var(--primary)" />
              <span>
                iLove<strong>PDF</strong>
              </span>
            </div>
            <p className={styles.footerDesc}>
              The ultimate online PDF toolkit to convert, compress, split, and merge your documents with ease and top security.
            </p>
          </div>

          {/* PDF Tools */}
          <div>
            <h4 className={styles.footerHeading}>PDF Tools</h4>
            <ul className={styles.footerLinkList}>
              <li><Link href="/merge" className={styles.footerLink}>Merge PDF</Link></li>
              <li><Link href="/split" className={styles.footerLink}>Split PDF</Link></li>
              <li><Link href="/compress" className={styles.footerLink}>Compress PDF</Link></li>
            </ul>
          </div>

          {/* Converters */}
          <div>
            <h4 className={styles.footerHeading}>Converters</h4>
            <ul className={styles.footerLinkList}>
              <li><Link href="/convert/pdf-to-word" className={styles.footerLink}>PDF to Word</Link></li>
              <li><Link href="/convert/pdf-to-excel" className={styles.footerLink}>PDF to Excel</Link></li>
            </ul>
          </div>

          {/* Security & Trust */}
          <div>
            <h4 className={styles.footerHeading}>Security & Privacy</h4>
            <ul className={styles.footerLinkList}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <ShieldCheck size={16} color="var(--accent-green)" /> 100% Secure Processing
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Lock size={16} color="var(--accent-blue)" /> End-to-End Encrypted
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                <Zap size={16} color="var(--accent-amber)" /> Lightning Fast
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} iLovePDF Clone — All PDF Tools Ready.</p>
          <p>Built with Next.js & Modern Vanilla CSS</p>
        </div>
      </div>
    </footer>
  );
}
