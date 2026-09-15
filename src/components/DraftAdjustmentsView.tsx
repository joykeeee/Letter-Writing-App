import React from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Edit3, 
  GitCompare, 
  CheckCircle2, 
  Clock, 
  ThumbsUp, 
  FileText
} from 'lucide-react';
import { 
  AssistantContext, 
  DraftIteration, 
  LetterFormat 
} from '../types';
import { LetterPreview } from './LetterPreview';
import { PeerAdvisorCard } from './PeerAdvisorCard';
import { DiffViewer } from './DiffViewer';

interface DraftAdjustmentsViewProps {
  context: AssistantContext;
  currentDraft: DraftIteration | null;
  draftHistory: DraftIteration[];
  selectedDisplayFormat: LetterFormat;
  onSelectDisplayFormat: (format: LetterFormat) => void;
  isApproved: boolean;
  onApprove: () => void;
  onRefine: (feedback: string) => void;
  isRefining: boolean;
  onBackToContext: () => void;
  onProceedToActionPlan: () => void;
  onGenerateInitialDraft?: () => void;
  isLoadingInitial?: boolean;
  onSelectIteration: (iteration: DraftIteration) => void;
  onDirectEdit?: (updatedBody: string, updatedSubject?: string) => void;
}

export const DraftAdjustmentsView: React.FC<DraftAdjustmentsViewProps> = ({
  context,
  currentDraft,
  draftHistory,
  selectedDisplayFormat,
  onSelectDisplayFormat,
  isApproved,
  onApprove,
  onRefine,
  isRefining,
  onBackToContext,
  onProceedToActionPlan,
  onGenerateInitialDraft,
  isLoadingInitial,
  onSelectIteration,
  onDirectEdit,
}) => {
  // If no draft has been generated yet
  if (!currentDraft) {
    return (
      <div id="draft-adjustments-empty" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 space-y-6 text-center animate-in fade-in duration-200">
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
          <Edit3 className="w-7 h-7" />
        </div>
        <div className="max-w-md mx-auto space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
              Step 3 of 4
            </span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">No Draft Generated Yet</h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Provide the details of your situation in Step 2, and we will generate your tailored letter, peer mentor assessment, and visual diff tracker right here.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onBackToContext}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go to Step 2: Situation Context</span>
          </button>
          {onGenerateInitialDraft && (
            <button
              id="empty-generate-btn"
              type="button"
              disabled={isLoadingInitial}
              onClick={onGenerateInitialDraft}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-2 disabled:opacity-60"
            >
              {isLoadingInitial ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Drafting...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Draft with Current Details</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  const previousDraft = draftHistory.length > 1 ? draftHistory[draftHistory.length - 2] : null;

  return (
    <div id="draft-adjustments-section" className="space-y-6 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
                Step 3 of 4
              </span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs text-slate-500 font-medium">Draft & Adjustments</span>
              <span className="text-xs text-slate-400 font-medium">•</span>
              <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Iteration #{currentDraft.version}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Letter Draft, Adjustments & Visual Diff Tracker
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Review your draft, request tone or phrasing tweaks with instant side-by-side diff tracking, and affirm when it sounds right to unlock your concrete action plan.
            </p>
          </div>

          {/* Approval Status Badge */}
          <div>
            {isApproved ? (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Draft Approved by You</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold shadow-xs">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Pending Your Review</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Context Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-semibold text-slate-700">Message context:</span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            To: {context.recipientName || '[Recipient]'} ({context.relationship})
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            From: {context.senderName || '[Your Name]'}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 font-medium">
            Tone: {context.tonePreference}
          </span>
        </div>
      </div>

      {/* Main Grid: Letter Preview (Left) + Peer Advisor & Adjustments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Letter Preview Column */}
        <div className="lg:col-span-7 space-y-4">
          <LetterPreview
            draft={currentDraft}
            formats={context.formats}
            selectedFormat={selectedDisplayFormat}
            onSelectFormat={onSelectDisplayFormat}
            recipientName={context.recipientName}
            senderName={context.senderName}
            onDirectEdit={onDirectEdit}
          />
        </div>

        {/* Peer Advisor & Adjustments Console Column */}
        <div className="lg:col-span-5 space-y-4">
          <PeerAdvisorCard
            draft={currentDraft}
            isApproved={isApproved}
            onApprove={onApprove}
            onRefine={onRefine}
            isRefining={isRefining}
          />
        </div>
      </div>

      {/* Visual Diff Tracker (Highlighted Differences between iterations) */}
      {draftHistory.length > 1 && (
        <div id="draft-diff-section" className="space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <GitCompare className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Iteration Differences & Revisions
            </h3>
            <span className="text-xs text-slate-500">
              (Comparing Iteration #{currentDraft.version} vs #{previousDraft?.version || 1})
            </span>
          </div>

          <DiffViewer
            currentDraft={currentDraft}
            previousDraft={previousDraft}
            draftHistory={draftHistory}
            onSelectIteration={onSelectIteration}
          />
        </div>
      )}

      {/* Step Footer Navigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToContext}
          className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Situation Context</span>
        </button>

        <div className="flex items-center gap-3">
          {!isApproved ? (
            <button
              id="footer-approve-btn"
              type="button"
              onClick={onApprove}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 font-semibold text-xs sm:text-sm transition-colors flex items-center gap-2"
            >
              <ThumbsUp className="w-4 h-4" />
              <span>Affirm Draft</span>
            </button>
          ) : null}

          <button
            id="proceed-to-action-plan-btn"
            type="button"
            onClick={onProceedToActionPlan}
            className={`px-6 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 ${
              isApproved
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10'
                : 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10'
            }`}
          >
            <span>Proceed to Action Plan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
