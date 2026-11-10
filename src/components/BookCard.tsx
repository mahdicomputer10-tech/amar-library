import React, { useMemo } from 'react';
import { 
  BookOpen, 
  Edit3, 
  Trash2, 
  Download, 
  Bookmark, 
  Heart, 
  CheckCircle2, 
  FileText,
  Clock
} from 'lucide-react';
import { Book, UserSettings } from '../types/library';
import { formatFileSize, generateArtisticCover } from '../services/imageHelper';

interface BookCardProps {
  book: Book;
  viewMode: UserSettings['viewMode'];
  themeColor: string;
  onOpenReader: (book: Book) => void;
  onOpenEdit: (book: Book) => void;
  onDelete: (book: Book) => void;
  onToggleFavorite: (book: Book) => void;
}

export const BookCard: React.FC<BookCardProps> = ({
  book,
  viewMode,
  themeColor,
  onOpenReader,
  onOpenEdit,
  onDelete,
  onToggleFavorite,
}) => {
  // Generate cover fallback if no custom cover was uploaded
  const coverSrc = useMemo(() => {
    return book.cover || generateArtisticCover(book.title, book.category);
  }, [book.cover, book.title, book.category]);

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = URL.createObjectURL(book.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = book.fileName.endsWith('.pdf') ? book.fileName : `${book.title}.pdf`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  /* List View */
  if (viewMode === 'list') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group">
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Miniature cover */}
          <div 
            onClick={() => onOpenReader(book)}
            className="w-14 h-20 rounded-lg overflow-hidden shrink-0 shadow-xs cursor-pointer relative group-hover:scale-105 transition-transform"
          >
            <img src={coverSrc} alt={book.title} className="w-full h-full object-cover" />
            {book.lastPage > 0 && (
              <span className="absolute bottom-1 right-1 bg-black/75 text-[10px] text-white px-1.5 py-0.5 rounded font-mono">
                {book.lastPage}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {book.category || 'সাধারণ'}
              </span>
              {book.status === 'completed' && (
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> সমাপ্ত
                </span>
              )}
              <span className="text-xs text-slate-400">
                {formatFileSize(book.size)}
              </span>
            </div>

            <h3 
              onClick={() => onOpenReader(book)}
              className="text-base font-bold text-slate-800 dark:text-slate-100 truncate cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
              title={book.title}
            >
              {book.title}
            </h3>

            {book.note ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 flex items-center gap-1">
                <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                <span>{book.note}</span>
              </p>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                {book.lastPage > 0 ? `সর্বশেষ পঠিত পাতা: ${book.lastPage}` : 'এখনও পড়া শুরু হয়নি'}
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
          <button
            onClick={() => onToggleFavorite(book)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-rose-500 transition-colors"
            title="প্রিয় তালিকায় যোগ"
          >
            <Heart className={`w-4 h-4 ${book.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            title="PDF ফাইল ডাউনলোড"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenEdit(book)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            title="বইয়ের তথ্য ও পৃষ্ঠা সম্পাদনা"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(book)}
            className="p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-400 hover:text-rose-600 transition-colors"
            title="মুছে ফেলুন"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenReader(book)}
            className="px-4 py-2 rounded-xl text-white font-medium text-xs sm:text-sm flex items-center gap-1.5 shadow-xs hover:opacity-95 transition-all"
            style={{ backgroundColor: themeColor }}
          >
            <BookOpen className="w-4 h-4" />
            <span>পড়ুন</span>
          </button>
        </div>
      </div>
    );
  }

  /* Compact View */
  if (viewMode === 'compact') {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-3 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-md transition-all flex flex-col group relative">
        <div 
          onClick={() => onOpenReader(book)}
          className="h-36 rounded-xl overflow-hidden relative cursor-pointer mb-2.5 bg-slate-100 dark:bg-slate-900"
        >
          <img src={coverSrc} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          {book.lastPage > 0 && (
            <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-white text-[11px] font-medium px-2 py-0.5 rounded-full">
              পাতা {book.lastPage}
            </span>
          )}
        </div>
        <h4 
          onClick={() => onOpenReader(book)}
          className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-1 cursor-pointer hover:underline"
          title={book.title}
        >
          {book.title}
        </h4>
        <div className="text-[11px] text-slate-400 flex justify-between items-center mt-1">
          <span>{book.category || 'সাধারণ'}</span>
          <span>{formatFileSize(book.size)}</span>
        </div>
        <div className="flex items-center gap-1 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <button
            onClick={() => onOpenReader(book)}
            className="flex-1 py-1 rounded-lg text-white text-xs font-medium flex items-center justify-center gap-1"
            style={{ backgroundColor: themeColor }}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>পড়ুন</span>
          </button>
          <button
            onClick={() => onOpenEdit(book)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
            title="তথ্য"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  /* Default Grid View */
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-3.5 border border-slate-200/80 dark:border-slate-700/60 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative">
      {/* Cover container */}
      <div 
        onClick={() => onOpenReader(book)}
        className="h-56 sm:h-60 rounded-xl overflow-hidden relative cursor-pointer mb-3.5 bg-slate-900 shadow-sm"
      >
        <img 
          src={coverSrc} 
          alt={book.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        
        {/* Subtle top overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

        {/* Favorite Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(book);
          }}
          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/40 backdrop-blur-md text-white hover:text-rose-400 hover:scale-110 transition-all z-10"
          title="প্রিয়"
        >
          <Heart className={`w-4 h-4 ${book.favorite ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Category Badge */}
        <span className="absolute top-2.5 left-2.5 bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-full z-10 shadow-xs">
          {book.category || 'সাধারণ'}
        </span>

        {/* Reading progress banner at bottom of cover */}
        <div className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between text-white z-10">
          {book.lastPage > 0 ? (
            <span className="bg-amber-500 text-slate-950 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
              <Bookmark className="w-3 h-3 fill-slate-950" />
              <span>পাতা {book.lastPage}</span>
            </span>
          ) : (
            <span className="bg-black/60 text-slate-200 text-xs px-2.5 py-1 rounded-full">
              নতুন বই
            </span>
          )}

          <span className="text-[11px] text-white/80 bg-black/50 px-2 py-0.5 rounded-md font-mono">
            {formatFileSize(book.size)}
          </span>
        </div>
      </div>

      {/* Book Title */}
      <h3 
        onClick={() => onOpenReader(book)}
        className="font-bold text-base text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 mb-1"
        title={book.title}
      >
        {book.title}
      </h3>

      {/* Bookmark note or excerpt */}
      {book.note ? (
        <div className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50 p-2 rounded-xl mb-3 line-clamp-1 flex items-center gap-1.5" title={book.note}>
          <FileText className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{book.note}</span>
        </div>
      ) : (
        <div className="text-xs text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{new Date(book.addedAt).toLocaleDateString('bn-BD')} এ যুক্ত</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center gap-1.5">
        <button
          onClick={() => onOpenReader(book)}
          className="flex-1 py-2 px-3 rounded-xl text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-xs hover:opacity-95 active:scale-95 transition-all"
          style={{ backgroundColor: themeColor }}
        >
          <BookOpen className="w-4 h-4" />
          <span>পড়ুন</span>
        </button>

        <button
          onClick={() => onOpenEdit(book)}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          title="বইয়ের তথ্য, পাতা ও কভার পরিবর্তন"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={handleDownload}
          className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
          title="PDF ডাউনলোড"
        >
          <Download className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(book)}
          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 transition-colors"
          title="বইটি মুছে ফেলুন"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
