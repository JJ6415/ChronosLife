'use client';

import React from 'react';
import { Shield, ArrowRight, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Transformation {
  original: string;
  replacement: string;
  info_type: string;
}

interface DlpComparisonViewerProps {
  originalText: string;
  sanitizedText: string;
  detectedInfoTypes: string[];
  transformations?: Transformation[];
}

export default function DlpComparisonViewer({
  originalText,
  sanitizedText,
  detectedInfoTypes,
  transformations = []
}: DlpComparisonViewerProps) {
  const t = useTranslations('DlpComparisonViewer');

  return (
    <div className="w-full bg-gray-900/50 backdrop-blur-md rounded-xl p-6 border border-gray-800 shadow-xl overflow-hidden">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
          <Shield className="w-6 h-6 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold text-white tracking-tight">{t('layer_title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
        {/* Arrow in middle for md and above */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gray-800 rounded-full items-center justify-center border-4 border-gray-900 z-10 shadow-lg">
          <ArrowRight className="w-5 h-5 text-gray-400" />
        </div>

        {/* Original */}
        <div className="bg-gray-950/80 rounded-xl p-5 border border-red-900/30 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-300">{t('raw_input')}</h3>
            <span className="flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {t('pii_included')}
            </span>
          </div>
          <p className="font-mono text-gray-300 text-sm leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto">
            {originalText}
          </p>
        </div>

        {/* Sanitized */}
        <div className="bg-gray-950/80 rounded-xl p-5 border border-green-900/30 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-300">{t('sanitized_text')}</h3>
            <span className="flex items-center text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              {t('safe')}
            </span>
          </div>
          <p className="font-mono text-gray-300 text-sm leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto">
            {sanitizedText}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500 mr-2 uppercase font-semibold">{t('detected_entities')}</span>
        {detectedInfoTypes.map((type, idx) => (
          <span key={idx} className="px-2 py-1 text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-md">
            {type}
          </span>
        ))}
        {detectedInfoTypes.length === 0 && (
          <span className="text-xs text-gray-500 italic">{t('none')}</span>
        )}
      </div>
    </div>
  );
}
