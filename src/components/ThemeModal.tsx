import React, { useState } from 'react';
import { Palette, X, Sun, Moon, Check } from 'lucide-react';
import { UserSettings } from '../types/library';

interface ThemeModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
}

const PRESET_COLORS = [
  { label: 'ইন্ডিগো (Indigo)', hex: '#4f46e5' },
  { label: 'এমারেল্ড (Emerald)', hex: '#059669' },
  { label: 'নীল (Blue)', hex: '#2563eb' },
  { label: 'ভায়োলেট (Violet)', hex: '#7c3aed' },
  { label: 'রোজ (Rose)', hex: '#e11d48' },
  { label: 'অ্যাম্বার (Amber)', hex: '#d97706' },
  { label: 'টিয়াল (Teal)', hex: '#0d9488' },
  { label: 'ডার্ক স্লেট (Slate)', hex: '#334155' },
];

export const ThemeModal: React.FC<ThemeModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [libName, setLibName] = useState(settings.name || 'লাইব্রেরি');

  if (!isOpen) return null;

  const handleNameSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (libName.trim()) {
      onUpdateSettings({ name: libName.trim() });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: settings.color }}>
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                থিম ও লাইব্রেরি সেটিংস
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                নাম এবং পছন্দের রং পরিবর্তন করুন
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
          {/* Library Name */}
          <form onSubmit={handleNameSave}>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              লাইব্রেরির নাম
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={libName}
                onChange={(e) => setLibName(e.target.value)}
                placeholder="যেমন: আমার পাঠাগার, লাইব্রেরি..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-xs hover:opacity-95"
                style={{ backgroundColor: settings.color }}
              >
                আপডেট
              </button>
            </div>
          </form>

          {/* Color Palette presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              থিমের মূল রং (Accent Color)
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {PRESET_COLORS.map((col) => {
                const isSelected = settings.color.toLowerCase() === col.hex.toLowerCase();
                return (
                  <button
                    key={col.hex}
                    type="button"
                    onClick={() => onUpdateSettings({ color: col.hex })}
                    className={`h-11 rounded-xl flex items-center justify-center transition-all ${
                      isSelected ? 'ring-2 ring-offset-2 ring-slate-800 dark:ring-white scale-105' : 'hover:scale-102'
                    }`}
                    style={{ backgroundColor: col.hex }}
                    title={col.label}
                  >
                    {isSelected && <Check className="w-5 h-5 text-white drop-shadow" />}
                  </button>
                );
              })}
            </div>

            {/* Custom Color input */}
            <div className="flex items-center gap-3 mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700">
              <input
                type="color"
                value={settings.color}
                onChange={(e) => onUpdateSettings({ color: e.target.value })}
                className="w-10 h-8 rounded-lg cursor-pointer border-0 p-0"
              />
              <div className="text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-200">কাস্টম কালার নির্বাচন: </span>
                <span className="font-mono text-slate-400">{settings.color}</span>
              </div>
            </div>
          </div>

          {/* Dark / Light Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              অ্যাপ ভিউ মোড
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ dark: false })}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                  !settings.dark
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span>☀️ লাইট মোড</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ dark: true })}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-medium transition-all ${
                  settings.dark
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span>🌙 ডার্ক মোড</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold shadow-xs"
              style={{ backgroundColor: settings.color }}
            >
              সম্পন্ন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
