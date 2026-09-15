import React, { useState } from 'react';
import { 
  CheckCircle, 
  Clock, 
  Lightbulb, 
  ArrowLeft, 
  Copy, 
  Check, 
  Printer, 
  RotateCcw,
  Sparkles,
  AlertCircle,
  ThumbsUp
} from 'lucide-react';
import { FinalAdvice, DraftIteration } from '../types';

interface ActionableNextStepsProps {
  advice: FinalAdvice | null;
  currentDraft: DraftIteration | null;
  onBackToDraft: () => void;
  onApproveDraft?: () => void;
  onStartNew?: () => void;
}

export const ActionableNextSteps: React.FC<ActionableNextStepsProps> = ({ 
  advice,
  currentDraft,
  onBackToDraft,
  onApproveDraft,
  onStartNew,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!currentDraft) return;
    const textToCopy = currentDraft.subject
      ? `Subject: ${currentDraft.subject}\n\n${currentDraft.body}`
      : currentDraft.body;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // State when advice isn't ready or draft is not approved yet
  if (!advice || !currentDraft) {
    return (
      <div id="actionable-next-steps-empty" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-10 space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Clock className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
              Step 4 of 4
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">Action Plan Awaiting Approval</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Your peer mentor advice and prioritized next steps unlock once you review and affirm your letter draft. This ensures advice aligns directly with what you actually send.
          </p>
        </div>

        {currentDraft ? (
          <div className="max-w-lg mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Current Draft (v{currentDraft.version}):</span>
              <span className="text-slate-500 italic">Pending your review</span>
            </div>
            <p className="text-xs text-slate-600 line-clamp-3 italic">
              "{currentDraft.body}"
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-200/80">
              <button
                type="button"
                onClick={onBackToDraft}
                className="px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 font-medium text-xs transition-colors"
              >
                Review in Draft Tab
              </button>
              {onApproveDraft && (
                <button
                  id="empty-state-approve-btn"
                  type="button"
                  onClick={onApproveDraft}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Approve Draft & Unlock Plan</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-2">
            <button
              type="button"
              onClick={onBackToDraft}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go to Step 2: Situation Context</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="actionable-next-steps-section" className="space-y-6 animate-in fade-in duration-300">
      {/* Step Header */}
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-emerald-100 pb-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-sm shadow-emerald-600/20 shrink-0">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Step 4 of 4 • Unlocked
                </span>
                <span className="text-xs text-slate-400 font-medium">•</span>
                <span className="text-xs text-emerald-800 font-semibold">Draft Approved by You</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                Your Action Plan & Prioritized Next Steps
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Concrete, prioritized actions to take now that your message has been tailored and approved. Advice is designed for immediate follow-through.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-4 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold text-xs transition-all flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-emerald-700" />
                  <span>Copy Approved Letter</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs transition-all flex items-center gap-1.5"
              title="Print letter for mailing"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {/* Mentor Affirmation Banner */}
        <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 text-xs sm:text-sm text-emerald-950 font-medium leading-relaxed flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900 block mb-0.5">Peer Mentor Feedback:</span>
            {advice.affirmationMessage}
          </div>
        </div>

        {/* Prioritized Steps (1, 2, 3) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Prioritized Action Steps (Follow in Order):</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {advice.prioritizedNextSteps.map((stepItem) => (
              <div
                key={stepItem.step}
                id={`action-step-${stepItem.step}`}
                className="p-5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-7 h-7 rounded-lg bg-amber-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                      {stepItem.step}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Priority {stepItem.step}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{stepItem.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {stepItem.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tips for Future Reference */}
        <div className="bg-amber-50/70 rounded-xl p-5 border border-amber-200/80 space-y-3">
          <h3 className="text-xs font-bold text-amber-950 flex items-center gap-2 uppercase tracking-wider">
            <Lightbulb className="w-4 h-4 text-amber-700" />
            <span>Tips for Future Reference (Professional Etiquette & Calendar Hygiene):</span>
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700">
            {advice.futureReferenceTips.map((tip, idx) => (
              <li key={idx} className="flex items-start gap-2 bg-white/70 p-3 rounded-lg border border-amber-200/50">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                <span className="leading-relaxed">{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Page Footer Navigation */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToDraft}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Draft & Adjustments</span>
          </button>

          {onStartNew && (
            <button
              type="button"
              onClick={onStartNew}
              className="px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Start Another Letter</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
