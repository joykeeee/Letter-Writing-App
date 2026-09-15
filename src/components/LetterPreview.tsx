import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Printer, 
  Mail, 
  PenTool, 
  FileText, 
  Maximize2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { LetterFormat, DraftIteration } from '../types';

interface LetterPreviewProps {
  formats: LetterFormat[];
  draft: DraftIteration;
  recipientName: string;
  senderName: string;
  selectedFormat?: LetterFormat;
  onSelectFormat?: (format: LetterFormat) => void;
}

export const LetterPreview: React.FC<LetterPreviewProps> = ({
  formats,
  draft,
  recipientName,
  senderName,
  selectedFormat,
  onSelectFormat,
}) => {
  const [internalActiveFormat, setInternalActiveFormat] = useState<LetterFormat>(formats[0] || 'email');
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const activeFormat = selectedFormat !== undefined ? selectedFormat : internalActiveFormat;
  const setActiveFormat = onSelectFormat || setInternalActiveFormat;

  // If activeFormat is not in current formats, reset to first format
  const currentFormat = formats.includes(activeFormat) ? activeFormat : formats[0] || 'email';

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2500);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const effectiveRecipient = recipientName.trim() || '[Recipient Name]';
  const effectiveSender = senderName.trim() || '[Your Name]';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div id="letter-preview-card" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Format Switcher Bar (If multiple formats selected) */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Format Preview:
          </span>
          <div className="flex items-center gap-1.5">
            {formats.map((fmt) => (
              <button
                key={fmt}
                id={`preview-tab-${fmt}`}
                type="button"
                onClick={() => setActiveFormat(fmt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  currentFormat === fmt
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {fmt === 'email' && <Mail className="w-3.5 h-3.5" />}
                {fmt === 'handwritten' && <PenTool className="w-3.5 h-3.5" />}
                {fmt === 'typed' && <FileText className="w-3.5 h-3.5" />}
                <span className="capitalize">{fmt === 'typed' ? 'Typed Letter' : fmt}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls: Copy & Print (Strictly NO send button!) */}
        <div className="flex items-center gap-2">
          <button
            id="copy-letter-body-btn"
            type="button"
            onClick={() => copyToClipboard(draft.body, 'body')}
            className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            title="Copy letter text to clipboard"
          >
            {copiedType === 'body' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          {currentFormat === 'email' && draft.subject && (
            <button
              id="copy-full-email-btn"
              type="button"
              onClick={() =>
                copyToClipboard(
                  `Subject: ${draft.subject}\n\n${draft.body}`,
                  'full'
                )
              }
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-white text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              title="Copy subject line and email body"
            >
              {copiedType === 'full' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-semibold">Subject & Body Copied!</span>
                </>
              ) : (
                <>
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy with Subject</span>
                </>
              )}
            </button>
          )}

          <button
            id="print-letter-btn"
            type="button"
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50/70 hover:bg-amber-100 text-xs font-medium text-amber-900 transition-colors flex items-center gap-1.5"
            title="Download or print this letter formatted for stationery"
          >
            <Printer className="w-3.5 h-3.5 text-amber-700" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Format-Specific Rendered Sheet */}
      <div className="p-6 md:p-8 bg-slate-100/60 flex justify-center">
        {/* 1. EMAIL FORMAT PREVIEW */}
        {currentFormat === 'email' && (
          <div
            id="printable-letter-email"
            className="w-full max-w-2xl bg-white rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all"
          >
            {/* Mock Email Header */}
            <div className="bg-slate-50 border-b border-slate-200 p-4 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-400 pb-1 border-b border-slate-200/50">
                <div className="flex items-center gap-1.5 font-medium text-slate-500">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  <span>Email Client Draft</span>
                </div>
                <span>{todayFormatted}</span>
              </div>
              <div className="flex items-center text-slate-600 gap-2">
                <span className="w-16 font-semibold text-slate-400">To:</span>
                <span className="font-medium text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {effectiveRecipient} &lt;recipient@example.com&gt;
                </span>
              </div>
              <div className="flex items-center text-slate-600 gap-2">
                <span className="w-16 font-semibold text-slate-400">From:</span>
                <span className="font-medium text-slate-800">
                  {effectiveSender} &lt;you@example.com&gt;
                </span>
              </div>
              {draft.subject && (
                <div className="flex items-center text-slate-700 gap-2 pt-1">
                  <span className="w-16 font-semibold text-slate-400">Subject:</span>
                  <span className="font-bold text-slate-900 select-all">{draft.subject}</span>
                </div>
              )}
            </div>

            {/* Email Body */}
            <div className="p-6 text-sm text-slate-800 font-sans leading-relaxed whitespace-pre-line select-text">
              {draft.body}
            </div>

            {/* Email Footer / Notice */}
            <div className="px-6 py-3 bg-slate-50/80 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Ready to copy & paste into Gmail, Outlook, or Apple Mail</span>
              <span className="text-amber-700 font-medium">No direct send (Strict user privacy)</span>
            </div>
          </div>
        )}

        {/* 2. HAND-WRITTEN FORMAT PREVIEW */}
        {currentFormat === 'handwritten' && (
          <div
            id="printable-letter-handwritten"
            className="w-full max-w-2xl bg-[#faf6ed] rounded-xl border border-amber-200/80 shadow-md p-8 md:p-10 relative overflow-hidden transition-all text-slate-800"
            style={{
              backgroundImage:
                'repeating-linear-gradient(transparent, transparent 31px, #e8dfcf 31px, #e8dfcf 32px)',
              backgroundAttachment: 'local',
            }}
          >
            {/* Margin Red Line on left */}
            <div className="absolute top-0 bottom-0 left-10 md:left-14 w-px bg-rose-300/60 pointer-events-none" />

            <div className="pl-6 md:pl-10 space-y-4">
              <div className="text-right text-xs text-slate-500 font-serif italic mb-6">
                {todayFormatted}
              </div>

              {/* Hand-written Cursive Text */}
              <div
                className="text-xl md:text-2xl text-slate-900 leading-[32px] whitespace-pre-line select-text font-normal"
                style={{ fontFamily: "'Caveat', cursive, sans-serif" }}
              >
                {draft.body}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-amber-200/40 text-right text-xs text-amber-800/80 font-serif italic">
              — Formatted for personal stationery or handwritten note card —
            </div>
          </div>
        )}

        {/* 3. TYPED LETTER FORMAT PREVIEW */}
        {currentFormat === 'typed' && (
          <div
            id="printable-letter-typed"
            className="w-full max-w-2xl bg-white rounded-xl border border-slate-300 shadow-md p-8 md:p-12 transition-all font-serif text-slate-900"
          >
            {/* Letterhead Header */}
            <div className="border-b-2 border-slate-800 pb-4 mb-6 flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold tracking-tight uppercase text-slate-900">
                  {effectiveSender}
                </h4>
                <p className="text-xs text-slate-500 font-sans mt-0.5">
                  Professional Correspondence • Personal Reach-out
                </p>
              </div>
              <div className="text-right text-xs text-slate-600 font-sans">
                {todayFormatted}
              </div>
            </div>

            {/* Recipient Block */}
            <div className="text-xs text-slate-700 font-sans space-y-0.5 mb-6">
              <p className="font-semibold text-slate-900">{effectiveRecipient}</p>
              <p className="text-slate-500">Professional Network Connection</p>
            </div>

            {/* Letter Body in classic serif */}
            <div 
              className="text-sm md:text-base leading-relaxed whitespace-pre-line text-slate-800 select-text mb-8"
              style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}
            >
              {draft.body}
            </div>

            {/* Print Archival Notice */}
            <div className="pt-6 border-t border-slate-200 text-[11px] font-sans text-slate-400 flex items-center justify-between">
              <span>Standard 8.5" × 11" Letterhead Template</span>
              <span>Click 'Print / Save PDF' to generate official document</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
