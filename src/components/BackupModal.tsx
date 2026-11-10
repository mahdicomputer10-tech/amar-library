import React, { useState, useEffect, useRef } from 'react';
import { 
  HardDrive, 
  X, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  Database,
  FileJson,
  ShieldCheck
} from 'lucide-react';
import { Book, UserSettings } from '../types/library';
import { exportLibraryBackup, importLibraryBackup } from '../services/backup';
import { formatFileSize } from '../services/imageHelper';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  books: Book[];
  settings: UserSettings;
  user: string;
  themeColor: string;
  onImportComplete: () => Promise<void>;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  books,
  settings,
  user,
  themeColor,
  onImportComplete,
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [storageEstimate, setStorageEstimate] = useState<{ used: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
      navigator.storage.estimate().then((est) => {
        setStorageEstimate({
          used: est.usage || 0,
          total: est.quota || 0,
        });
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = async () => {
    if (books.length === 0) {
      setStatusMessage({ type: 'error', text: 'ব্যাকআপ নেওয়ার মতো কোনো বই নেই।' });
      return;
    }

    setIsExporting(true);
    setProgress(0);
    setStatusMessage(null);

    try {
      await exportLibraryBackup(books, settings, user, (pct) => setProgress(pct));
      setStatusMessage({ type: 'success', text: `মোট ${books.length} টি বই সফলভাবে ব্যাকআপ ফাইল হিসেবে ডাউনলোড হয়েছে!` });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'ব্যাকআপ রপ্তানিতে সমস্যা হয়েছে।' });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    setStatusMessage(null);

    try {
      const res = await importLibraryBackup(file, user, (pct) => setProgress(pct));
      await onImportComplete();
      setStatusMessage({
        type: 'success',
        text: `অভিনন্দন! সফলভাবে ${res.count} টি বই রিস্টোর করা হয়েছে।`,
      });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'রিস্টোর ব্যর্থ হয়েছে।' });
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const totalBytes = books.reduce((acc, b) => acc + (b.size || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                ব্যাকআপ ও রিস্টোর
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                আপনার বই ও পাঠের ডেটা নিরাপদে সংরক্ষণ করুন
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Message */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-2xl flex items-start gap-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Progress bar */}
          {(isExporting || isImporting) && (
            <div className="space-y-1.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-200">
                <span>{isExporting ? 'ব্যাকআপ তৈরি হচ্ছে...' : 'বই রিস্টোর হচ্ছে...'}</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Export Section */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-indigo-500" />
                  <span>সম্পূর্ণ লাইব্রেরি ব্যাকআপ (Export)</span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  বইয়ের PDF ফাইল, কভার, নোট এবং পড়ার শেষ পাতার তথ্যসহ একটি .json ফাইল ডাউনলোড হবে।
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-600 dark:text-slate-300">
                মোট বই: <strong>{books.length} টি</strong> ({formatFileSize(totalBytes)})
              </span>
              <button
                onClick={handleExport}
                disabled={isExporting || isImporting || books.length === 0}
                className="px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs hover:opacity-95 disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                <Download className="w-4 h-4" />
                <span>ব্যাকআপ ডাউনলোড</span>
              </button>
            </div>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 space-y-3">
            <div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Upload className="w-4 h-4 text-emerald-500" />
                <span>ব্যাকআপ রিস্টোর (Import / Restore)</span>
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                আগের সংরক্ষিত .json ব্যাকআপ ফাইলটি নির্বাচন করে লাইব্রেরিতে সকল বই পুনরুদ্ধার করুন।
              </p>
            </div>

            <div className="pt-1 flex justify-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isExporting || isImporting}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs disabled:opacity-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                <span>ব্যাকআপ ফাইল নির্বাচন</span>
              </button>
            </div>
          </div>

          {/* Device storage estimation */}
          {storageEstimate && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-100/70 dark:bg-slate-900/60 text-xs text-slate-500 dark:text-slate-400">
              <Database className="w-4 h-4 text-slate-400 shrink-0" />
              <span>
                ডিভাইস স্টোরেজ ব্যবহৃত: <strong>{formatFileSize(storageEstimate.used)}</strong> / সর্বোচ্চ {formatFileSize(storageEstimate.total)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>সকল ডেটা শতভাগ আপনার ডিভাইসে অফলাইনে সংরক্ষিত থাকে, কোনো রিমোট সার্ভারে পাঠানো হয় না।</span>
          </div>
        </div>
      </div>
    </div>
  );
};
