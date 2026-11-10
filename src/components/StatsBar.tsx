import React from 'react';
import { Book, Bookmark, CheckCircle2, Database, Flame } from 'lucide-react';
import { Book as BookType } from '../types/library';
import { formatFileSize } from '../services/imageHelper';

interface StatsBarProps {
  books: BookType[];
}

export const StatsBar: React.FC<StatsBarProps> = ({ books }) => {
  const totalBooks = books.length;
  const readingCount = books.filter((b) => b.lastPage > 0 && b.status !== 'completed').length;
  const completedCount = books.filter((b) => b.status === 'completed').length;
  const totalBytes = books.reduce((acc, b) => acc + (b.size || 0), 0);
  const totalPagesRead = books.reduce((acc, b) => acc + (b.lastPage || 0), 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <Book className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">মোট বই</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
            {totalBooks} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <Flame className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">চলমান পাঠ</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
            {readingCount} <span className="text-xs font-normal text-slate-400">টি</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Bookmark className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">পঠিত পৃষ্ঠা</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
            {totalPagesRead} <span className="text-xs font-normal text-slate-400">পাতা</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <Database className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">স্টোরেজ সাইজ</div>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 truncate">
            {formatFileSize(totalBytes)}
          </div>
        </div>
      </div>
    </div>
  );
};
