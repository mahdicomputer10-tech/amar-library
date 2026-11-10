import React, { useState, useEffect, useRef } from 'react';
import { Edit3, X, Save, Image as ImageIcon, Trash2, Check, BookOpen, Bookmark } from 'lucide-react';
import { Book } from '../types/library';
import { compressImage } from '../services/imageHelper';

interface EditBookModalProps {
  isOpen: boolean;
  book: Book | null;
  onClose: () => void;
  onSave: (updated: Book) => Promise<void>;
  themeColor: string;
  categories: string[];
}

export const EditBookModal: React.FC<EditBookModalProps> = ({
  isOpen,
  book,
  onClose,
  onSave,
  themeColor,
  categories,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [lastPage, setLastPage] = useState<number>(0);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<Book['status']>('unread');
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [clearCover, setClearCover] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setCategory(book.category || '');
      setLastPage(book.lastPage || 0);
      setNote(book.note || '');
      setStatus(book.status || (book.lastPage > 0 ? 'reading' : 'unread'));
      setCoverPreview(book.cover || '');
      setClearCover(false);
    }
  }, [book, isOpen]);

  if (!isOpen || !book) return null;

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const compressed = await compressImage(file);
        setCoverPreview(compressed);
        setClearCover(false);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleRemoveCover = () => {
    setCoverPreview('');
    setClearCover(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('বইয়ের নাম খালি রাখা যাবে না');
      return;
    }

    setIsSaving(true);
    try {
      const updated: Book = {
        ...book,
        title: title.trim(),
        category: category.trim(),
        lastPage: Math.max(0, Number(lastPage) || 0),
        note: note.trim(),
        status: status,
        cover: clearCover ? '' : (coverPreview || book.cover || ''),
        lastReadAt: lastPage > 0 ? Date.now() : book.lastReadAt,
      };

      await onSave(updated);
      onClose();
    } catch (err: any) {
      alert('তথ্য সংরক্ষণে ব্যর্থ: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: themeColor }}>
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                বইয়ের তথ্য ও পাঠ অগ্রগতি
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                পৃষ্ঠা নম্বর ও বুকমার্ক নোট আপডেট করুন
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              বইয়ের নাম
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ক্যাটাগরি
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                list="editCatList"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <datalist id="editCatList">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                পঠন অবস্থা
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="unread">এখনও পড়া হয়নি</option>
                <option value="reading">বর্তমানে পড়ছি</option>
                <option value="completed">পড়া সম্পন্ন হয়েছে</option>
                <option value="want_to_read">ভবিষ্যতে পড়ব</option>
              </select>
            </div>
          </div>

          {/* Last read page */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                <span>সর্বশেষ পড়া পৃষ্ঠা নম্বর</span>
              </span>
              <span className="text-[11px] text-slate-400">রিডার খোলার সময় এই পাতা থেকে শুরু হবে</span>
            </label>
            <input
              type="number"
              min={0}
              value={lastPage}
              onChange={(e) => setLastPage(parseInt(e.target.value || '0', 10))}
              placeholder="যেমন: 45"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Personal Note / Bookmark */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              ছোট নোট বা বুকমার্ক মন্তব্য
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="যেমন: অধ্যায় ৪ থেকে বাকি, গুরুত্বপূর্ণ উক্তি পাতা ১২-তে..."
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>

          {/* Cover photo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              বইয়ের কভার ছবি
            </label>
            <div className="flex items-center gap-3">
              {coverPreview ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-14 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveCover}
                    className="text-xs text-rose-500 hover:text-rose-600 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>কভার মুছুন (স্বয়ংক্রিয় আর্ট ব্যবহার)</span>
                  </button>
                </div>
              ) : (
                <div className="text-xs text-slate-400 italic">
                  বর্তমানে স্বয়ংক্রিয় আর্ট কভার ব্যবহৃত হচ্ছে
                </div>
              )}

              <button
                type="button"
                onClick={() => coverInputRef.current?.click()}
                className="ml-auto px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center gap-1.5"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>নতুন ছবি দিন</span>
              </button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                onChange={handleCoverChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit & Cancel */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium"
            >
              বাতিল
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
              style={{ backgroundColor: themeColor }}
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'সংরক্ষণ হচ্ছে...' : 'সেভ করুন'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
