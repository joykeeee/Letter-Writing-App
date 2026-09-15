import React, { useState } from 'react';
import { 
  HeartHandshake, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  Send, 
  Sparkles, 
  ThumbsUp, 
  Edit3,
  MessageSquare,
  HelpCircle,
  Clock
} from 'lucide-react';
import { DraftIteration } from '../types';

interface PeerAdvisorCardProps {
  draft: DraftIteration;
  onApprove: () => void;
  onRefine: (feedback: string) => void;
  isRefining: boolean;
  isApproved: boolean;
}

export const PeerAdvisorCard: React.FC<PeerAdvisorCardProps> = ({
  draft,
  onApprove,
  onRefine,
  isRefining,
  isApproved,
}) => {
  const [showRefineInput, setShowRefineInput] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');

  const quickRefineChips = [
    'Make it more concise',
    'Warm up the tone a bit',
    'More direct and executive',
    'Propose specific days (Tuesday / Thursday)',
    'Sound less formal / more peer-to-peer',
    'Mention I will buy the coffee next time',
  ];

  const handleQuickChip = (chip: string) => {
    setShowRefineInput(true);
    setFeedbackText((prev) => (prev ? `${prev}. ${chip}` : chip));
  };

  const handleRefineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || isRefining) return;
    onRefine(feedbackText.trim());
    setFeedbackText('');
  };

  return (
    <div id="peer-advisor-card" className="bg-white rounded-2xl border border-amber-200/90 shadow-sm p-6 space-y-5">
      {/* Mentor Header */}
      <div className="flex items-start justify-between border-b border-amber-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-600/20">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Peer Career Advisor Feedback</h3>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300/50">
                Mentor Perspective
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Experienced perspective on tone, professional etiquette, and networking dynamics
            </p>
          </div>
        </div>

        {isApproved && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Approved by You</span>
          </span>
        )}
      </div>

      {/* Reassurance Message */}
      {draft.reassurance && (
        <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-950 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-900">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Peer Advisor Reassurance:</span>
          </div>
          <p className="leading-relaxed text-slate-700 font-medium">
            {draft.reassurance}
          </p>
        </div>
      )}

      {/* Missing Facts & Placeholder Checklist */}
      {draft.missingInfoFlags && draft.missingInfoFlags.length > 0 && (
        <div className="space-y-1.5 text-xs">
          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
            <span>Items to verify or fill in before copying:</span>
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {draft.missingInfoFlags.map((flag, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>{flag}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CORE MANDATORY QUESTION: "Is this draft ok?" */}
      <div className="border-t border-slate-100 pt-4">
        {!isApproved ? (
          <div className="bg-slate-900 text-white p-5 rounded-xl space-y-4 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white tracking-wide">
                  {draft.promptQuestion || 'Is this email ok?'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400">
                Confirming unlocks tailored next steps & etiquette tips
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Read through the draft above. If it reflects your authentic voice and sounds right, confirm it below. If you want any adjustments (shorter, warmer, different excuse or dates), we will revise it and show you the exact diff!
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {/* Positive Affirmation Button */}
              <button
                id="approve-draft-btn"
                type="button"
                onClick={onApprove}
                className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all flex items-center gap-2"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Yes, this draft looks great!</span>
              </button>

              {/* Revision Trigger Button */}
              <button
                id="request-refine-btn"
                type="button"
                onClick={() => setShowRefineInput(!showRefineInput)}
                className="px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all flex items-center gap-2"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>I'd like a few tweaks...</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold">
                You've confirmed this draft! Check out your concrete next steps and mentor tips below.
              </span>
            </div>
            <button
              id="reopen-revisions-btn"
              type="button"
              onClick={() => setShowRefineInput(true)}
              className="text-xs text-emerald-700 hover:text-emerald-900 underline font-medium"
            >
              Need another tweak?
            </button>
          </div>
        )}

        {/* Refinement Expansion Panel */}
        {showRefineInput && (
          <form onSubmit={handleRefineSubmit} className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <label htmlFor="refine-feedback-input" className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>What would you like to adjust?</span>
              </label>
              <button
                type="button"
                onClick={() => setShowRefineInput(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Cancel
              </button>
            </div>

            {/* Quick Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickRefineChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickChip(chip)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white hover:bg-amber-50 hover:text-amber-900 hover:border-amber-300 border border-slate-200 text-slate-600 transition-colors"
                >
                  + {chip}
                </button>
              ))}
            </div>

            {/* Feedback Input */}
            <div className="space-y-2">
              <textarea
                id="refine-feedback-input"
                rows={3}
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="e.g. Make it warmer and more peer-to-peer. Replace the excuse with an unexpected family matter. Mention that I can do next Tuesday afternoon, and the coffee is on me."
                className="w-full text-xs px-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white leading-relaxed resize-y"
              />
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">
                  Requests are organically rewritten into the letter (never tacked on as an afterthought).
                </span>
                <button
                  id="submit-refine-btn"
                  type="submit"
                  disabled={!feedbackText.trim() || isRefining}
                  className="px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors flex items-center gap-2 disabled:opacity-50 shadow-xs"
                >
                  {isRefining ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Regenerating...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Regenerate Draft & Diff</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
