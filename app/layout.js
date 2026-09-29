import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'iLovePDF — Free Online PDF Tools (Convert, Compress, Split, Merge)',
  description:
    'Convert PDF to Word (.docx), PDF to Excel (.xlsx), Compress PDF with 50% and 70% options, Split PDF pages, and Merge multiple PDFs in seconds with 100% security.',
  keywords: 'pdf converter, pdf to word, pdf to excel, compress pdf, split pdf, merge pdf, ilovepdf clone',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
