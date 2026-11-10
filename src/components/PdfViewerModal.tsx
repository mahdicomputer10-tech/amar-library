import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ExternalLink, 
  Bookmark, 
  Save, 
  Check, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Download,
  BookOpen
} from 'lucide-react';
import { Book } from '../types/library';

interface PdfViewerModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSaveProgress: (bookId: string, pageNumber: number, note?: string) => Promise<void>;
  themeColor: string;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({
  isOpen,
  book,
  onClose,
  onSaveProgress,
  themeColor,
}) => {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentNote, setCurrentNote] = useState<string>('');
  const [showNotesDrawer, setShowNotesDrawer] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>('');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Setup blob URL on book open
  useEffect(() => {
    if (book && isOpen) {
      setCurrentPage(book.lastPage > 0 ? book.lastPage : 1);
      setCurrentNote(book.note || '');
      setSavedSuccess(false);

      const url = URL.createObjectURL(book.blob);
      setPdfBlobUrl(url);

      return () => {
        URL.revokeObjectURL(url);
      };
    } else {
      setPdfBlobUrl('');
    }
  }, [book, isOpen]);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose]);

  if (!isOpen || !book) return null;

  const handlePageChange = (newPage: number) => {
    const validPage = Math.max(1, newPage);
    setCurrentPage(validPage);
    // Reload iframe anchor if needed
    if (iframeRef.current && pdfBlobUrl) {
      iframeRef.current.src = `${pdfBlobUrl}#page=${validPage}`;
    }
  };

  const handleSavePage = async () => {
    if (!book) return;
    try {
      await onSaveProgress(book.id, currentPage, currentNote);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert('অগ্রগতি সংরক্ষণে ব্যর্থ');
    }
  };

  const handleDownload = () => {
    if (!book) return;
    const url = URL.createObjectURL(book.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = book.fileName.endsWith('.pdf') ? book.fileName : `${book.title}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const pageHash = currentPage > 0 ? `#page=${currentPage}` : '';
  const viewerUrl = pdfBlobUrl ? `${pdfBlobUrl}${pageHash}` : '';

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 flex flex-col bg-slate-950/95 text-white ${
        isFullscreen ? 'p-0' : 'p-2 sm:p-4'
      }`}
    >
      <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full w-full overflow-hidden shadow-2xl">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900 border-b border-slate-800 shrink-0">
          {/* Book Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: themeColor }}>
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md" title={book.title}>
                {book.title}
              </h2>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>{book.category || 'সাধারণ'}</span>
                <span>•</span>
                <span className="text-amber-400">সর্বশেষ সংরক্ষিত পাতা: {book.lastPage || 0}</span>
              </div>
            </div>
          </div>

          {/* Page Controls & Actions */}
          <div className="flex items-center gap-2 flex-wrap ml-auto">
            {/* Quick Page Jump & Save */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl p-1 gap-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="p-1 rounded-lg hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent text-slate-300"
                title="পূর্ববর্তী পাতা"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1 px-1">
                <span className="text-xs text-slate-400">পাতা:</span>
                <input
                  type="number"
                  min={1}
                  value={currentPage}
                  onChange={(e) => setCurrentPage(parseInt(e.target.value || '1', 10))}
                  className="w-14 px-1.5 py-0.5 bg-slate-900 border border-slate-700 rounded-md text-xs font-mono text-center text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                className="p-1 rounded-lg hover:bg-slate-700 text-slate-300"
                title="পরবর্তী পাতা"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleSavePage}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  savedSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                }`}
                title="বর্তমান পাতা বুকমার্ক হিসেবে সেভ করুন"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>সেভ হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>পাতা সেভ</span>
                  </>
                )}
              </button>
            </div>

            {/* Notes Toggle */}
            <button
              onClick={() => setShowNotesDrawer(!showNotesDrawer)}
              className={`p-2 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors ${
                showNotesDrawer
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="রিডিং নোট ও মন্তব্য"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">নোট</span>
            </button>

            {/* Open in external tab */}
            <a
              href={viewerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="নতুন ব্রাউজার ট্যাবে খুলুন"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            {/* Download */}
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="PDF ফাইল ডাউনলোড করুন"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isFullscreen ? 'স্বাভাবিক ভিউ' : 'ফুলস্ক্রিন ভিউ'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white transition-colors ml-1"
              title="বন্ধ করুন (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Area: PDF Viewer + Notes Drawer */}
        <div className="flex-1 flex overflow-hidden relative bg-slate-950">
          {/* Main Iframe Viewer */}
          <div className="flex-1 h-full w-full relative">
            {viewerUrl ? (
              <iframe
                ref={iframeRef}
                src={viewerUrl}
                title={book.title}
                className="w-full h-full border-0 bg-white"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                PDF লোড হচ্ছে...
              </div>
            )}
          </div>

          {/* Side Notes Drawer */}
          {showNotesDrawer && (
            <div className="w-80 bg-slate-900 border-l border-slate-800 flex flex-col p-4 z-20 shrink-0 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>বইয়ের রিডিং নোট</span>
                </div>
                <button
                  onClick={() => setShowNotesDrawer(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 flex-1 flex flex-col gap-2">
                <label className="text-xs text-slate-400">
                  পড়ার সময় গুরুত্বপূর্ণ লাইন বা মন্তব্য লিখে রাখুন:
                </label>
                <textarea
                  value={currentNote}
                  onChange={(e) => setCurrentNote(e.target.value)}
                  placeholder="যেমন: এই পরিচ্ছেদটি খুব অনুপ্রেরণামূলক... পাতা ৩৫ এর সূত্রটি মুখস্থ করতে হবে..."
                  className="flex-1 w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none font-sans"
                />
              </div>

              <button
                onClick={handleSavePage}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>নোট ও পাতা সংরক্ষণ করুন</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
