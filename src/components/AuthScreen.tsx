import React, { useState } from 'react';
import { BookOpen, KeyRound, User, ArrowRight, ShieldCheck, UserCheck, Sparkles, Eye, EyeOff } from 'lucide-react';
import { loginUser, registerUser, quickGuestLogin } from '../services/auth';

interface AuthScreenProps {
  onSuccess: (username: string) => void;
  themeColor: string;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess, themeColor }) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        const res = await registerUser(username, password);
        if (res.success) {
          setMessage({ text: res.message, isError: false });
          setIsRegisterMode(false);
          setPassword('');
        } else {
          setMessage({ text: res.message, isError: true });
        }
      } else {
        const res = await loginUser(username, password);
        if (res.success && res.user) {
          onSuccess(res.user);
        } else {
          setMessage({ text: res.message || 'ভুল ইউজারনেম বা পাসওয়ার্ড', isError: true });
        }
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'অনাকাঙ্ক্ষিত ত্রুটি ঘটেছে', isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsLoading(true);
    try {
      const guest = await quickGuestLogin();
      onSuccess(guest);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-indigo-50/40 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-300">
        {/* App Logo */}
        <div className="text-center mb-6">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-white shadow-lg mb-3"
            style={{ backgroundColor: themeColor }}
          >
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            লাইব্রেরি
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            আপনার ব্যক্তিগত অফলাইন বাংলা PDF লাইব্রেরি ও বুকমার্কিং সিস্টেম
          </p>
        </div>

        {/* Tab switch between Login and Register */}
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(false);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              !isRegisterMode
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            লগইন
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegisterMode(true);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              isRegisterMode
                ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            নতুন অ্যাকাউন্ট
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`p-3 rounded-xl mb-4 text-xs font-medium text-center ${
              message.isError
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              ইউজারনেম
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="আপনার নাম বা ইউজারনেম"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="পাসওয়ার্ড (কমপক্ষে ৪ অক্ষর)"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm hover:opacity-95 active:scale-98 transition-all disabled:opacity-50"
            style={{ backgroundColor: themeColor }}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>{isRegisterMode ? 'অ্যাকাউন্ট তৈরি করুন' : 'প্রবেশ করুন'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-slate-800 px-3 text-slate-400">অথবা</span>
          </div>
        </div>

        {/* Quick Guest Access */}
        <button
          type="button"
          onClick={handleGuestLogin}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
        >
          <UserCheck className="w-4 h-4 text-emerald-500" />
          <span>গেস্ট হিসেবে সরাসরি প্রবেশ করুন</span>
        </button>

        {/* Offline Security Info */}
        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>অফলাইন সুরক্ষিত এনক্রিপশন (SHA-256)</span>
        </div>
      </div>
    </div>
  );
};
