import React from 'react';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  List, 
  Columns3, 
  ArrowUpDown, 
  Heart, 
  BookMarked, 
  CheckCircle2, 
  Sparkles 
} from 'lucide-react';
import { UserSettings } from '../types/library';

interface ToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  statusFilter: 'all' | 'reading' | 'completed' | 'favorite';
  onStatusFilterChange: (status: 'all' | 'reading' | 'completed' | 'favorite') => void;
  settings: UserSettings;
  onUpdateSettings: (s: Partial<UserSettings>) => void;
  totalCount: number;
  filteredCount: number;
}

export const Toolbar: React.FC<ToolbarProps> = ({
  searchQuery,
  onSearchChange,
  categories,
  selectedCategory,
  onSelectCategory,
  statusFilter,
  onStatusFilterChange,
  settings,
  onUpdateSettings,
  totalCount,
  filteredCount,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/60 shadow-xs mb-6 space-y-4">
      {/* Mobile Search Bar */}
      <div className="relative md:hidden w-full">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="বইয়ের নাম, ক্যাটাগরি বা নোট দিয়ে খুঁজুন..."
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            ✕
          </button>
        )}
      </div>

      {/* Row 1: Status Filters & View Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl overflow-x-auto text-xs sm:text-sm">
          <button
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            সব বই ({totalCount})
          </button>
          <button
            onClick={() => onStatusFilterChange('reading')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'reading'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>পড়ছি</span>
          </button>
          <button
            onClick={() => onStatusFilterChange('completed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'completed'
                ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>শেষ</span>
          </button>
          <button
            onClick={() => onStatusFilterChange('favorite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'favorite'
                ? 'bg-white dark:bg-slate-800 text-rose-500 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>প্রিয়</span>
          </button>
        </div>

        {/* View Mode & Sort */}
        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1.5 rounded-xl text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={settings.sortBy}
              onChange={(e) => onUpdateSettings({ sortBy: e.target.value as any })}
              className="bg-transparent border-0 py-0 pl-1 pr-6 focus:ring-0 text-xs sm:text-sm font-medium cursor-pointer"
            >
              <option value="recent">সর্বশেষ যোগ</option>
              <option value="page">পঠিত পাতা</option>
              <option value="title">বইয়ের নাম (অ-হ)</option>
              <option value="size">ফাইলের আকার</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-xl">
            <button
              onClick={() => onUpdateSettings({ viewMode: 'grid' })}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="গ্রিড ভিউ"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSettings({ viewMode: 'list' })}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.viewMode === 'list'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="লিস্ট ভিউ"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => onUpdateSettings({ viewMode: 'compact' })}
              className={`p-1.5 rounded-lg transition-colors ${
                settings.viewMode === 'compact'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title="কম্প্যাক্ট কার্ড ভিউ"
            >
              <Columns3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Categories Horizontal Scroll & Count */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-700/50">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full text-xs">
          <span className="text-slate-400 flex items-center gap-1 pl-1 pr-2 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>ক্যাটাগরি:</span>
          </span>
          <button
            onClick={() => onSelectCategory('')}
            className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all ${
              !selectedCategory
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            সবগুলো
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium shrink-0 ml-auto">
          দেখানো হচ্ছে: <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredCount}</span> টি বই
        </div>
      </div>
    </div>
  );
};
