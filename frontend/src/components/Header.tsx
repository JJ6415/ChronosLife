'use client';

import { Activity, Globe } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';

export default function Header() {
  const t = useTranslations('Header');
  const locale = useLocale();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <span className="text-2xl drop-shadow-[0_0_12px_rgba(96,165,250,0.6)]">⏳</span>
        <div>
          <h1 className="text-lg md:text-xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
            ChronosLife
          </h1>
        </div>
      </div>
      
      <div className="hidden md:block">
        <p className="text-xs font-semibold text-slate-400 tracking-wide flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-indigo-400" />
          <span>{t('description')}</span>
        </p>
      </div>

      <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg p-1 text-xs">
        <Globe className="w-3.5 h-3.5 text-slate-400 ml-1 mr-0.5" />
        <Link
          href="/ja"
          className={`px-2 py-0.5 rounded transition-colors ${
            locale === 'ja'
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          JA
        </Link>
        <Link
          href="/ko"
          className={`px-2 py-0.5 rounded transition-colors ${
            locale === 'ko'
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          KO
        </Link>
        <Link
          href="/en"
          className={`px-2 py-0.5 rounded transition-colors ${
            locale === 'en'
              ? 'bg-indigo-600 text-white font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          EN
        </Link>
      </div>
    </header>
  );
}
