import React, { useState } from 'react';
import { diffWordsWithSpace, Change } from 'diff';
import { GitCompare, Eye, Columns, Check, History, ArrowRight } from 'lucide-react';
import { DraftIteration } from '../types';

interface DiffViewerProps {
  previousDraft?: DraftIteration | null;
  currentDraft: DraftIteration;
  draftHistory: DraftIteration[];
  onSelectIteration: (iteration: DraftIteration) => void;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  previousDraft,
  currentDraft,
  draftHistory,
  onSelectIteration,
}) => {
  const [viewMode, setViewMode] = useState<'inline' | 'side-by-side' | 'clean'>('inline');

  // Compute diff if previous draft exists and is different
  const hasPrevious = !!previousDraft && previousDraft.id !== currentDraft.id;
  const changes: Change[] = hasPrevious
    ? diffWordsWithSpace(previousDraft.body, currentDraft.body)
    : [];

  const addedCount = changes.filter((c) => c.added).length;
  const removedCount = changes.filter((c) => c.removed).length;

  return (
    <div id="diff-viewer-container" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header & Controls */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
            <GitCompare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Iteration #{currentDraft.version} Diff Tracking
              </h3>
              {hasPrevious && (
                <span className="text-[11px] font-medium text-slate-500">
                  (Comparing v{previousDraft.version} → v{currentDraft.version})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {hasPrevious
                ? `Changes detected: +${addedCount} word additions, -${removedCount} deletions`
                : 'Initial draft version (no previous iteration to compare yet)'}
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        {hasPrevious && (
          <div className="flex items-center bg-slate-200/70 p-0.5 rounded-lg text-xs font-medium text-slate-600">
            <button
              id="diff-mode-inline-btn"
              type="button"
              onClick={() => setViewMode('inline')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'inline' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Inline Diff</span>
            </button>
            <button
              id="diff-mode-side-btn"
              type="button"
              onClick={() => setViewMode('side-by-side')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'side-by-side' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              id="diff-mode-clean-btn"
              type="button"
              onClick={() => setViewMode('clean')}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                viewMode === 'clean' ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Clean Text</span>
            </button>
          </div>
        )}
      </div>

      {/* Version History Breadcrumbs */}
      {draftHistory.length > 1 && (
        <div className="px-5 py-2 bg-slate-100/60 border-b border-slate-200/60 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 flex items-center gap-1 font-medium">
            <History className="w-3 h-3" />
            History:
          </span>
          {draftHistory.map((item) => (
            <button
              key={item.id}
              id={`history-iteration-${item.id}`}
              type="button"
              onClick={() => onSelectIteration(item)}
              className={`px-2.5 py-1 rounded-full font-medium transition-all ${
                item.id === currentDraft.id
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              v{item.version} {item.id === currentDraft.id ? '(Active)' : ''}
            </button>
          ))}
        </div>
      )}

      {/* Diff Content Body */}
      <div className="p-6">
        {!hasPrevious || viewMode === 'clean' ? (
          /* Clean View */
          <div className="space-y-4">
            {currentDraft.subject && (
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Subject Line
                </span>
                <p className="text-sm font-semibold text-slate-900">{currentDraft.subject}</p>
              </div>
            )}
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                Letter Body
              </span>
              <div className="text-sm text-slate-800 font-normal whitespace-pre-line leading-relaxed">
                {currentDraft.body}
              </div>
            </div>
          </div>
        ) : viewMode === 'inline' ? (
          /* Inline Diff View */
          <div className="space-y-4">
            {/* Subject Diff if available */}
            {currentDraft.subject && previousDraft?.subject && currentDraft.subject !== previousDraft.subject && (
              <div className="pb-3 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Subject Line Revisions
                </span>
                <div className="text-sm">
                  {diffWordsWithSpace(previousDraft.subject, currentDraft.subject).map((part, idx) => {
                    if (part.added) {
                      return (
                        <span
                          key={idx}
                          className="bg-emerald-100 text-emerald-900 underline decoration-emerald-500 font-semibold px-1 rounded mx-0.5"
                        >
                          {part.value}
                        </span>
                      );
                    }
                    if (part.removed) {
                      return (
                        <span
                          key={idx}
                          className="bg-rose-100 text-rose-800 line-through decoration-rose-400 font-medium px-1 rounded mx-0.5"
                        >
                          {part.value}
                        </span>
                      );
                    }
                    return <span key={idx}>{part.value}</span>;
                  })}
                </div>
              </div>
            )}

            {/* Body Diff */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Visual Diff (Strike-through deletions, highlighted additions)
                </span>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="inline-flex items-center gap-1 text-rose-700">
                    <span className="w-2.5 h-2.5 rounded bg-rose-200 inline-block border border-rose-400" />
                    Deleted text
                  </span>
                  <span className="inline-flex items-center gap-1 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-200 inline-block border border-emerald-400" />
                    New text
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm leading-relaxed whitespace-pre-line font-sans text-slate-800">
                {changes.map((part, idx) => {
                  if (part.added) {
                    return (
                      <span
                        key={idx}
                        className="bg-emerald-100 text-emerald-900 underline decoration-emerald-500/80 font-medium px-1 rounded mx-0.5"
                        title="Added in this iteration"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  if (part.removed) {
                    return (
                      <span
                        key={idx}
                        className="bg-rose-100 text-rose-800 line-through decoration-rose-400/80 font-normal px-1 rounded mx-0.5"
                        title="Removed from previous iteration"
                      >
                        {part.value}
                      </span>
                    );
                  }
                  return <span key={idx}>{part.value}</span>;
                })}
              </div>
            </div>
          </div>
        ) : (
          /* Side-by-Side Comparison */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Previous Version */}
            <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200">
              <div className="flex items-center justify-between border-b border-rose-200/60 pb-2 mb-3">
                <span className="text-xs font-bold text-rose-900">
                  Version {previousDraft.version} (Previous)
                </span>
                <span className="text-[10px] text-rose-700 font-medium">Original</span>
              </div>
              {previousDraft.subject && (
                <div className="text-xs font-medium text-slate-700 mb-2">
                  <span className="font-semibold text-slate-500">Subject:</span> {previousDraft.subject}
                </div>
              )}
              <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                {previousDraft.body}
              </div>
            </div>

            {/* Current Version */}
            <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-200">
              <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 mb-3">
                <span className="text-xs font-bold text-emerald-900">
                  Version {currentDraft.version} (Current Revision)
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Revised</span>
              </div>
              {currentDraft.subject && (
                <div className="text-xs font-medium text-slate-700 mb-2">
                  <span className="font-semibold text-slate-500">Subject:</span> {currentDraft.subject}
                </div>
              )}
              <div className="text-xs text-slate-800 whitespace-pre-line leading-relaxed font-medium">
                {currentDraft.body}
              </div>
            </div>
          </div>
        )}

        {/* Change summary badge if available */}
        {currentDraft.changeSummary && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200/70 text-xs text-amber-900 flex items-start gap-2">
            <span className="font-bold text-amber-800 shrink-0">Revision Notes:</span>
            <span>{currentDraft.changeSummary}</span>
          </div>
        )}
      </div>
    </div>
  );
};
