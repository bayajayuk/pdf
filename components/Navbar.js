'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Heart,
  ChevronDown,
  Sun,
  Moon,
  Menu,
  X,
  FileText,
  FileSpreadsheet,
  Layers,
  Scissors,
  Minimize2,
  Sparkles,
} from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('pdf-theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('pdf-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  // Close menus when route changes
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className={styles.header}>
      <div className={styles.navContainer}>
        {/* Brand Logo */}
        <Link href="/" className={styles.brand}>
          <span className={styles.brandHeart}>
            <Heart size={26} fill="currentColor" />
          </span>
          <span className={styles.brandText}>
            iLove<span className={styles.brandAccent}>PDF</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.navLinks}>
          <Link
            href="/merge"
            className={`${styles.navLink} ${pathname === '/merge' ? styles.active : ''}`}
          >
            MERGE PDF
          </Link>
          <Link
            href="/split"
            className={`${styles.navLink} ${pathname === '/split' ? styles.active : ''}`}
          >
            SPLIT PDF
          </Link>
          <Link
            href="/compress"
            className={`${styles.navLink} ${pathname === '/compress' ? styles.active : ''}`}
          >
            COMPRESS PDF
          </Link>

          {/* Convert PDF Dropdown */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => setDropdownOpen(true)}
            onMouseLeave={() => setDropdownOpen(false)}
          >
            <button
              className={styles.dropdownTrigger}
              onClick={() => setDropdownOpen((prev) => !prev)}
              aria-expanded={dropdownOpen}
            >
              <span>CONVERT PDF</span>
              <ChevronDown size={14} />
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <Link href="/convert/pdf-to-word" className={styles.dropdownItem}>
                  <FileText size={18} color="#3B82F6" />
                  <span>PDF to Word</span>
                </Link>
                <Link href="/convert/pdf-to-excel" className={styles.dropdownItem}>
                  <FileSpreadsheet size={18} color="#10B981" />
                  <span>PDF to Excel</span>
                </Link>
              </div>
            )}
          </div>

          <Link href="/" className={styles.navLink}>
            ALL PDF TOOLS
          </Link>
        </nav>

        {/* Right Actions: Theme Toggle, Auth */}
        <div className={styles.navRight}>
          <button
            onClick={toggleTheme}
            className={styles.themeToggle}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          <button className={styles.authBtn}>Login</button>
          <button className={styles.signUpBtn}>Sign up</button>

          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <Link href="/merge" className={styles.mobileLink}>
            <Layers size={18} color="#8B5CF6" />
            <span>Merge PDF</span>
          </Link>
          <Link href="/split" className={styles.mobileLink}>
            <Scissors size={18} color="#F59E0B" />
            <span>Split PDF</span>
          </Link>
          <Link href="/compress" className={styles.mobileLink}>
            <Minimize2 size={18} color="#10B981" />
            <span>Compress PDF</span>
          </Link>
          <Link href="/convert/pdf-to-word" className={styles.mobileLink}>
            <FileText size={18} color="#3B82F6" />
            <span>PDF to Word</span>
          </Link>
          <Link href="/convert/pdf-to-excel" className={styles.mobileLink}>
            <FileSpreadsheet size={18} color="#10B981" />
            <span>PDF to Excel</span>
          </Link>
        </div>
      )}
    </header>
  );
}
