import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  BookOpen, 
  Sparkles, 
  Search, 
  FileUp, 
  Library, 
  FolderSearch, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Book, UserSettings } from './types/library';
import { 
  initDB, 
  getBooksByOwner, 
  saveBookToDB, 
  deleteBookFromDB, 
  createSamplePdfBlob 
} from './services/db';
import { getSavedSession, logoutSession } from './services/auth';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { Toolbar } from './components/Toolbar';
import { BookCard } from './components/BookCard';
import { AddBookModal } from './components/AddBookModal';
import { EditBookModal } from './components/EditBookModal';
import { PdfViewerModal } from './components/PdfViewerModal';
import { ThemeModal } from './components/ThemeModal';
import { BackupModal } from './components/BackupModal';
import { AuthScreen } from './components/AuthScreen';

const DEFAULT_SETTINGS: UserSettings = {
  name: 'লাইব্রেরি',
  color: '#4f46e5',
  dark: false,
  viewMode: 'grid',
  sortBy: 'recent',
  sortOrder: 'desc',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reading' | 'completed' | 'favorite'>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isReaderModalOpen, setIsReaderModalOpen] = useState(false);
  const [readingBook, setReadingBook] = useState<Book | null>(null);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Load session on startup
  useEffect(() => {
    const init = async () => {
      try {
        await initDB();
        const savedUser = getSavedSession();
        if (savedUser) {
          await loadUserData(savedUser);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Synchronize document theme and CSS variables
  useEffect(() => {
    document.documentElement.style.setProperty('--main', settings.color);
    document.title = settings.name ? `${settings.name} - অফলাইন বাংলা PDF লাইব্রেরি` : 'লাইব্রেরি';
    if (settings.dark) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.color, settings.dark, settings.name]);

  // Load user data & settings
  const loadUserData = async (username: string) => {
    setCurrentUser(username);
    try {
      const savedSettingsStr = localStorage.getItem(`lib_settings_${username}`);
      if (savedSettingsStr) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettingsStr) });
      } else {
        setSettings(DEFAULT_SETTINGS);
      }

      const userBooks = await getBooksByOwner(username);
      setBooks(userBooks);
    } catch (err) {
      console.error('Failed to load user books:', err);
    }
  };

  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      if (currentUser) {
        localStorage.setItem(`lib_settings_${currentUser}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [currentUser]);

  const handleToggleDark = useCallback(() => {
    updateSettings({ dark: !settings.dark });
  }, [settings.dark, updateSettings]);

  const handleLogout = useCallback(() => {
    logoutSession();
    setCurrentUser(null);
    setBooks([]);
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Reload books from IndexedDB
  const refreshBooks = useCallback(async () => {
    if (!currentUser) return;
    const userBooks = await getBooksByOwner(currentUser);
    setBooks(userBooks);
  }, [currentUser]);

  // Add starter demo book
  const handleAddSampleBook = async () => {
    if (!currentUser) return;
    const sampleBlob = createSamplePdfBlob();
    const sampleBook: Book = {
      id: 'starter_guide_' + Date.now(),
      owner: currentUser,
      title: 'লাইব্রেরি নির্দেশিকা ও ডেমো বই',
      category: 'নির্দেশিকা',
      cover: '',
      lastPage: 1,
      totalPages: 3,
      status: 'reading',
      rating: 5,
      favorite: true,
      note: 'অফলাইন ডিজিটাল লাইব্রেরির প্রথম ডেমো বই। এখান থেকে রিডার পরীক্ষা করুন।',
      fileName: 'Library_Demo_Guide.pdf',
      size: sampleBlob.size,
      addedAt: Date.now(),
      lastReadAt: Date.now(),
      blob: sampleBlob,
    };

    await saveBookToDB(sampleBook);
    await refreshBooks();
  };

  // Add multiple books
  const handleAddBooks = async (files: File[], category: string, coverDataUrl: string) => {
    if (!currentUser) return;

    for (const f of files) {
      if (!f.name.toLowerCase().endsWith('.pdf')) continue;
      const cleanTitle = f.name
        .replace(/\.pdf$/i, '')
        .replace(/[_-]/g, ' ')
        .trim();

      const newBook: Book = {
        id: Date.now() + '_' + Math.random().toString(36).slice(2, 8),
        owner: currentUser,
        title: cleanTitle || f.name,
        category: category || 'সাধারণ',
        cover: coverDataUrl,
        lastPage: 0,
        status: 'unread',
        note: '',
        fileName: f.name,
        size: f.size,
        addedAt: Date.now(),
        blob: f,
      };

      await saveBookToDB(newBook);
    }

    await refreshBooks();
  };

  // Save book edit
  const handleSaveEdit = async (updated: Book) => {
    await saveBookToDB(updated);
    await refreshBooks();
    // If updating currently read book, sync it
    if (readingBook && readingBook.id === updated.id) {
      setReadingBook(updated);
    }
  };

  // Delete book
  const handleDeleteBook = async (book: Book) => {
    if (confirm(`আপনি কি নিশ্চিত "${book.title}" বইটি লাইব্রেরি থেকে মুছে ফেলতে চান?`)) {
      await deleteBookFromDB(book.id);
      await refreshBooks();
      if (readingBook && readingBook.id === book.id) {
        setIsReaderModalOpen(false);
        setReadingBook(null);
      }
    }
  };

  // Toggle favorite
  const handleToggleFavorite = async (book: Book) => {
    const updated: Book = {
      ...book,
      favorite: !book.favorite,
    };
    await saveBookToDB(updated);
    await refreshBooks();
  };

  // Save reader page progress
  const handleSaveReadingProgress = async (bookId: string, pageNumber: number, note?: string) => {
    const book = books.find((b) => b.id === bookId);
    if (!book) return;

    const updated: Book = {
      ...book,
      lastPage: pageNumber,
      note: typeof note === 'string' ? note : book.note,
      lastReadAt: Date.now(),
      status: book.status === 'completed' ? 'completed' : 'reading',
    };

    await saveBookToDB(updated);
    await refreshBooks();
    setReadingBook(updated);
  };

  // Category list
  const categories = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      if (b.category && b.category.trim()) {
        set.add(b.category.trim());
      }
    });
    return Array.from(set);
  }, [books]);

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return books
      .filter((book) => {
        // Status filter
        if (statusFilter === 'reading' && !(book.lastPage > 0 && book.status !== 'completed')) return false;
        if (statusFilter === 'completed' && book.status !== 'completed') return false;
        if (statusFilter === 'favorite' && !book.favorite) return false;

        // Category filter
        if (selectedCategory && (book.category || '') !== selectedCategory) return false;

        // Search text filter
        if (q) {
          const matchTitle = (book.title || '').toLowerCase().includes(q);
          const matchCat = (book.category || '').toLowerCase().includes(q);
          const matchNote = (book.note || '').toLowerCase().includes(q);
          const matchFile = (book.fileName || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchNote && !matchFile) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (settings.sortBy) {
          case 'page':
            return (b.lastPage || 0) - (a.lastPage || 0);
          case 'title':
            return (a.title || '').localeCompare(b.title || '', 'bn');
          case 'size':
            return (b.size || 0) - (a.size || 0);
          case 'lastRead':
            return (b.lastReadAt || 0) - (a.lastReadAt || 0);
          case 'recent':
          default:
            return (b.addedAt || 0) - (a.addedAt || 0);
        }
      });
  }, [books, searchQuery, selectedCategory, statusFilter, settings.sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">লাইব্রেরি প্রস্তুত হচ্ছে...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show AuthScreen
  if (!currentUser) {
    return (
      <AuthScreen
        onSuccess={(username) => loadUserData(username)}
        themeColor={settings.color}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        settings={settings}
        user={currentUser}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenThemeModal={() => setIsThemeModalOpen(true)}
        onOpenBackupModal={() => setIsBackupModalOpen(true)}
        onToggleDark={handleToggleDark}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {/* Statistics Bar */}
        <StatsBar books={books} />

        {/* Toolbar with Filters, Search and Sorting */}
        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          settings={settings}
          onUpdateSettings={updateSettings}
          totalCount={books.length}
          filteredCount={filteredBooks.length}
        />

        {/* Books Grid / List */}
        {filteredBooks.length > 0 ? (
          <div
            className={
              settings.viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'
                : settings.viewMode === 'compact'
                ? 'grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3'
                : 'space-y-3'
            }
          >
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                viewMode={settings.viewMode}
                themeColor={settings.color}
                onOpenReader={(b) => {
                  setReadingBook(b);
                  setIsReaderModalOpen(true);
                }}
                onOpenEdit={(b) => {
                  setEditingBook(b);
                  setIsEditModalOpen(true);
                }}
                onDelete={handleDeleteBook}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 text-center border border-slate-200/80 dark:border-slate-700/80 shadow-xs max-w-lg mx-auto my-12">
            <div
              className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white mb-4 shadow-md"
              style={{ backgroundColor: settings.color }}
            >
              <Library className="w-8 h-8" />
            </div>

            {books.length === 0 ? (
              <>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  আপনার লাইব্রেরি এখনও খালি
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                  আপনার ডিভাইসে থাকা পছন্দের PDF বইগুলো যুক্ত করুন অথবা সরাসরি একটি ডেমো নির্দেশিকা বই দিয়ে পরীক্ষা করে দেখুন।
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 mt-6">
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:opacity-95 transition-all"
                    style={{ backgroundColor: settings.color }}
                  >
                    <Plus className="w-4 h-4" />
                    <span>নতুন PDF বই যোগ করুন</span>
                  </button>

                  <button
                    onClick={handleAddSampleBook}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>নমুনা বই লোড করুন</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                  কোনো বইয়ের সাথে মিল পাওয়া যায়নি
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                  অন্য কোনো নাম বা ক্যাটাগরি দিয়ে খুঁজে দেখতে পারেন।
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                    setStatusFilter('all');
                  }}
                  className="mt-5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                >
                  সব ফিল্টার মুছে ফেলুন
                </button>
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/60 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>{settings.name || 'লাইব্রেরি'} — শতভাগ অফলাইন বাংলা ডিজিটাল পাঠাগার</span>
          <span className="flex items-center gap-1 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>ব্রাউজার লোকাল ডেটাবেজে সংরক্ষিত</span>
          </span>
        </div>
      </footer>

      {/* Modals */}
      <AddBookModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        categories={categories}
        themeColor={settings.color}
        onAddBooks={handleAddBooks}
      />

      <EditBookModal
        isOpen={isEditModalOpen}
        book={editingBook}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingBook(null);
        }}
        onSave={handleSaveEdit}
        themeColor={settings.color}
        categories={categories}
      />

      <PdfViewerModal
        isOpen={isReaderModalOpen}
        book={readingBook}
        onClose={() => {
          setIsReaderModalOpen(false);
          setReadingBook(null);
        }}
        onSaveProgress={handleSaveReadingProgress}
        themeColor={settings.color}
      />

      <ThemeModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        books={books}
        settings={settings}
        user={currentUser}
        themeColor={settings.color}
        onImportComplete={refreshBooks}
      />
    </div>
  );
}
