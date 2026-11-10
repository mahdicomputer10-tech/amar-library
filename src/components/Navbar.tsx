import React from 'react';
import { 
  BookOpen, 
  Plus, 
  Palette, 
  Moon, 
  Sun, 
  Download, 
  LogOut, 
  Search, 
  HardDrive
} from 'lucide-react';
import { UserSettings } from '../types/library';

interface NavbarProps {
  settings: UserSettings;
  user: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddModal: () => void;
  onOpenThemeModal: () => void;
  onOpenBackupModal: () => void;
  onToggleDark: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  user,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onOpenThemeModal,
  onOpenBackupModal,
  onToggleDark,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-30 shadow-md transition-colors" style={{ backgroundColor: settings.color }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Title */}
          <div 
            onClick={onOpenThemeModal}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="লাইব্রেরির নাম বা থিম পরিবর্তন করতে ক্লিক করুন"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white shadow-inner group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-wide leading-tight group-hover:underline">
                {settings.name || 'লাইব্রেরি'}
              </h1>
              <div className="text-[11px] text-white/80 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{user}</span>
                <span className="opacity-60">• অফলাইন সক্রিয়</span>
              </div>
            </div>
          </div>

          {/* Quick Search on larger screens */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-white/70">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="বইয়ের নাম, ক্যাটাগরি বা নোট দিয়ে খুঁজুন... (Ctrl+K)"
                className="w-full pl-9 pr-4 py-2 bg-white/15 border border-white/30 rounded-xl text-white placeholder-white/70 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/25 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 bg-white text-gray-900 font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm shadow-sm hover:bg-gray-100 hover:shadow transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">বই যোগ</span>
              <span className="sm:hidden">যোগ</span>
            </button>

            <button
              onClick={onOpenThemeModal}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              title="থিমের রং ও নাম পরিবর্তন"
            >
              <Palette className="w-4 h-4" />
              <span className="hidden lg:inline">থিম</span>
            </button>

            <button
              onClick={onToggleDark}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              title={settings.dark ? 'লাইট মোড চালু করুন' : 'ডার্ক মোড চালু করুন'}
            >
              {settings.dark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={onOpenBackupModal}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              title="ব্যাকআপ ও রিস্টোর"
            >
              <HardDrive className="w-4 h-4" />
              <span className="hidden lg:inline">ব্যাকআপ</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-red-500/80 hover:bg-red-600 text-white text-xs sm:text-sm flex items-center gap-1 transition-colors ml-1"
              title="লগআউট"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
