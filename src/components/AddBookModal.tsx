import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { compressImage, formatFileSize } from '../services/imageHelper';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  themeColor: string;
  onAddBooks: (
    files: File[],
    category: string,
    coverDataUrl: string
  ) => Promise<void>;
}

const PRESET_CATEGORIES = [
  'গল্প ও উপন্যাস',
  'ইসলামিক সাহিত্য',
  'কবিতা',
  'ইতিহাস ও ঐতিহ্য',
  'বিজ্ঞান ও প্রযুক্তি',
  'আত্মউন্নয়ন ও মোটিভেশন',
  'অনুবাদ সাহিত্য',
  'শিশু কিশোর সাহিত্য',
  'জীবনী ও স্মৃতিচারণ',
  'সাধারণ',
];

export const AddBookModal: React.FC<AddBookModalProps> = ({
  isOpen,
  onClose,
  categories,
  themeColor,
  onAddBooks,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [category, setCategory] = useState('');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files).filter((f) =>
        f.name.toLowerCase().endsWith('.pdf')
      );
      if (filesArray.length === 0) {
        setErrorMessage('দয়া করে শুধুমাত্র .pdf ফাইল নির্বাচন করুন');
        return;
      }
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setErrorMessage('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files).filter((f) =>
        f.name.toLowerCase().endsWith('.pdf')
      );
      if (filesArray.length === 0) {
        setErrorMessage('দয়া করে শুধুমাত্র .pdf ফাইল ড্রপ করুন');
        return;
      }
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      setErrorMessage('');
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      try {
        const compressed = await compressImage(file);
        setCoverPreview(compressed);
      } catch {
        const url = URL.createObjectURL(file);
        setCoverPreview(url);
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length === 0) {
      setErrorMessage('অন্তত একটি PDF ফাইল নির্বাচন করুন');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      let finalCover = '';
      if (coverFile) {
        finalCover = await compressImage(coverFile);
      }

      await onAddBooks(selectedFiles, category.trim(), finalCover);
      // Reset & close
      setSelectedFiles([]);
      setCategory('');
      setCoverPreview('');
      setCoverFile(null);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'বই যোগ করতে সমস্যা হয়েছে');
    } finally {
      setIsSubmitting(false);
    }
  };

  const combinedCategories = Array.from(new Set([...categories, ...PRESET_CATEGORIES]));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
              <UploadCloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                নতুন PDF বই যোগ করুন
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                এক বা একাধিক PDF ফাইল একসাথে নির্বাচন করতে পারেন
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

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-indigo-200 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 rounded-2xl p-6 text-center cursor-pointer bg-indigo-50/30 dark:bg-slate-900/40 transition-colors group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-800 shadow-xs mx-auto flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              PDF ফাইলগুলো এখানে টেনে আনুন বা ক্লিক করে ব্রাউজ করুন
            </div>
            <p className="text-xs text-slate-400 mt-1">
              একসাথে একাধিক PDF বই নির্বাচন করা যাবে
            </p>
          </div>

          {/* Selected Files List */}
          {selectedFiles.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span>নির্বাচিত বই ({selectedFiles.length} টি)</span>
                <button
                  type="button"
                  onClick={() => setSelectedFiles([])}
                  className="text-rose-500 hover:underline"
                >
                  সব মুছুন
                </button>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700 text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-indigo-500 shrink-0" />
                      <span className="font-medium text-slate-700 dark:text-slate-200 truncate">
                        {file.name}
                      </span>
                      <span className="text-slate-400 shrink-0 font-mono">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category Input & Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ক্যাটাগরি বা বিষয় (ঐচ্ছিক)
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="যেমন: গল্প, ইসলামিক সাহিত্য, উপন্যাস..."
              list="modalCatList"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <datalist id="modalCatList">
              {combinedCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PRESET_CATEGORIES.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                    category === cat
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-600 dark:text-indigo-300 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Optional Cover Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
              <span>বইয়ের কভার ছবি (ঐচ্ছিক)</span>
              <span className="text-[11px] text-slate-400 font-normal">না দিলে অটো কভার তৈরি হবে</span>
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-1.5"
              >
                <ImageIcon className="w-4 h-4 text-indigo-500" />
                <span>ছবি নির্বাচন করুন</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />

              {coverPreview && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-12 rounded-md overflow-hidden shadow-xs border border-slate-200 dark:border-slate-700">
                    <img src={coverPreview} alt="Cover preview" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setCoverPreview('');
                      setCoverFile(null);
                    }}
                    className="text-xs text-rose-500 hover:underline"
                  >
                    মুছে ফেলুন
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-start gap-2">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>
              <strong>টিপস:</strong> আপনার PDF বইগুলো ব্রাউজারের সুরক্ষিত অফলাইন ডেটাবেজে সম্পূর্ণ নিরাপদে সংরক্ষিত থাকবে। ইন্টারনেট ছাড়াও সবসময় পড়তে পারবেন।
            </span>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition-colors"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSubmitting || selectedFiles.length === 0}
              className="px-6 py-2 rounded-xl text-white font-medium text-xs sm:text-sm flex items-center gap-2 shadow-sm hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              style={{ backgroundColor: themeColor }}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>সংরক্ষণ হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>লাইব্রেরিতে যোগ করুন ({selectedFiles.length})</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
