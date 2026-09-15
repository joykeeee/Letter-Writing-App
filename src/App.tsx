import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Info, 
  RotateCcw, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';
import { 
  AssistantContext, 
  DraftIteration, 
  FinalAdvice, 
  LetterFormat, 
  ActiveTab 
} from './types';
import { TabNavigation } from './components/TabNavigation';
import { FormatSelector } from './components/FormatSelector';
import { ContextForm } from './components/ContextForm';
import { DraftAdjustmentsView } from './components/DraftAdjustmentsView';
import { ActionableNextSteps } from './components/ActionableNextSteps';
import { SystemDiagramModal } from './components/SystemDiagramModal';
import {
  generateRealisticFallbackDraft,
  refineDraftLocally,
  generateFinalStepsFallback,
} from './lib/mentor-fallback';

const INITIAL_CONTEXT: AssistantContext = {
  formats: ['email'],
  recipientName: '',
  senderName: '',
  relationship: 'mentor',
  situation: 'missed_coffee_chat',
  timeline: '',
  location: '',
  reason: '',
  userFeeling: '',
  emotionalState: 'moderately_nervous',
  tonePreference: 'Professional, genuine, concise, not overly deferential',
  additionalContext: '',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('format');
  const [context, setContext] = useState<AssistantContext>(INITIAL_CONTEXT);
  const [draftHistory, setDraftHistory] = useState<DraftIteration[]>([]);
  const [currentDraft, setCurrentDraft] = useState<DraftIteration | null>(null);
  const [previousDraft, setPreviousDraft] = useState<DraftIteration | null>(null);
  const [selectedDisplayFormat, setSelectedDisplayFormat] = useState<LetterFormat>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [advice, setAdvice] = useState<FinalAdvice | null>(null);
  const [isDiagramOpen, setIsDiagramOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update selectedDisplayFormat if formats array changes and doesn't contain current
  useEffect(() => {
    if (!context.formats.includes(selectedDisplayFormat)) {
      setSelectedDisplayFormat(context.formats[0] || 'email');
    }
  }, [context.formats, selectedDisplayFormat]);

  const generateInitialDraft = async (ctx: AssistantContext, navigateToDraft = true) => {
    setIsLoading(true);
    setErrorMessage(null);
    setIsApproved(false);
    setAdvice(null);

    try {
      let draftData: any = null;

      try {
        const response = await fetch('/api/generate-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ctx),
        });

        if (response.ok) {
          const res = await response.json();
          draftData = res.data;
        } else {
          console.warn('Backend API returned non-ok status, switching to mentor rule engine');
        }
      } catch (networkErr) {
        console.warn('Network unreachable or serverless cold-start, switching to mentor rule engine:', networkErr);
      }

      if (!draftData) {
        draftData = generateRealisticFallbackDraft(ctx);
      }

      const newIteration: DraftIteration = {
        id: Date.now(),
        version: 1,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: draftData.subject,
        body: draftData.body,
        reassurance: draftData.reassurance,
        advisorNote: draftData.advisorNote,
        missingInfoFlags: draftData.missingInfoFlags || [],
        promptQuestion: draftData.promptQuestion || 'Is this draft ok?',
        isUserApproved: false,
      };

      setDraftHistory([newIteration]);
      setCurrentDraft(newIteration);
      setPreviousDraft(null);

      if (navigateToDraft) {
        setActiveTab('draft-adjustments');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'An unexpected error occurred while generating draft');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefine = async (feedback: string) => {
    if (!currentDraft) return;

    setIsRefining(true);
    setErrorMessage(null);

    try {
      let refinedData: any = null;

      try {
        const response = await fetch('/api/refine-draft', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            previousDraft: currentDraft.body,
            previousSubject: currentDraft.subject,
            feedback,
            formats: context.formats,
            recipientName: context.recipientName,
            senderName: context.senderName,
            relationship: context.relationship,
          }),
        });

        if (response.ok) {
          const res = await response.json();
          refinedData = res.data;
        } else {
          console.warn('Backend refine API returned non-ok status, using local mentor refinement');
        }
      } catch (networkErr) {
        console.warn('Network unreachable, using local mentor refinement:', networkErr);
      }

      if (!refinedData) {
        refinedData = refineDraftLocally({
          previousDraft: currentDraft.body,
          previousSubject: currentDraft.subject,
          feedback,
          formats: context.formats,
          recipientName: context.recipientName,
          senderName: context.senderName,
          relationship: context.relationship,
          reason: context.reason,
        });
      }

      const newVersionNum = draftHistory.length + 1;
      const nextIteration: DraftIteration = {
        id: Date.now(),
        version: newVersionNum,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        subject: refinedData.subject || currentDraft.subject,
        body: refinedData.body,
        reassurance: currentDraft.reassurance,
        advisorNote: refinedData.advisorNote,
        changeSummary: refinedData.changeSummary,
        missingInfoFlags: currentDraft.missingInfoFlags,
        promptQuestion: refinedData.promptQuestion || 'Is this draft ok?',
        isUserApproved: false,
      };

      setPreviousDraft(currentDraft);
      setCurrentDraft(nextIteration);
      setDraftHistory((prev) => [...prev, nextIteration]);
      setIsApproved(false);
      setAdvice(null);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Failed to refine draft');
    } finally {
      setIsRefining(false);
    }
  };

  const handleApprove = async () => {
    if (!currentDraft) return;

    setIsApproved(true);
    setErrorMessage(null);

    try {
      let finalAdviceData: any = null;

      try {
        const response = await fetch('/api/finalize-steps', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            approvedDraft: currentDraft.body,
            situation: context.situation,
            relationship: context.relationship,
            formats: context.formats,
            recipientName: context.recipientName,
            senderName: context.senderName,
          }),
        });

        if (response.ok) {
          const res = await response.json();
          finalAdviceData = res.data;
        }
      } catch (networkErr) {
        console.warn('Backend finalize API unreachable, using local mentor final steps:', networkErr);
      }

      if (!finalAdviceData) {
        finalAdviceData = generateFinalStepsFallback({
          relationship: context.relationship,
        });
      }

      setAdvice(finalAdviceData);
    } catch (err: any) {
      console.error('Error finalizing steps:', err);
      setAdvice(generateFinalStepsFallback({ relationship: context.relationship }));
    }
  };

  const handleSelectIteration = (iteration: DraftIteration) => {
    const currentIndex = draftHistory.findIndex((d) => d.id === iteration.id);
    const prev = currentIndex > 0 ? draftHistory[currentIndex - 1] : null;
    setPreviousDraft(prev);
    setCurrentDraft(iteration);
  };

  const handleReset = () => {
    setContext(INITIAL_CONTEXT);
    setActiveTab('format');
    generateInitialDraft(INITIAL_CONTEXT, false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-24">
      {/* Top Application Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center font-bold shadow-sm shadow-amber-600/20">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                Letter Writing Assistant
              </h1>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
                <span>Peer Career Advisor</span>
                <span className="text-slate-300">•</span>
                <span>Context, Adjustments & Diff Engine</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Info Button: Displays System Diagram */}
            <button
              id="system-diagram-info-btn"
              type="button"
              onClick={() => setIsDiagramOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs"
              title="View system architecture diagram including the agent"
            >
              <Info className="w-4 h-4 text-amber-700" />
              <span className="hidden sm:inline">System Diagram</span>
            </button>

            {/* Reset / New Letter */}
            <button
              id="reset-form-btn"
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1"
              title="Reset context and draft a new letter"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab / Multi-Page Navigation Bar */}
        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          context={context}
          currentDraft={currentDraft}
          isApproved={isApproved}
          draftCount={draftHistory.length}
        />

        {/* Dynamic Multi-Page Content Area */}
        <div className="mt-4">
          {/* TAB 1: Format Selection */}
          {activeTab === 'format' && (
            <section aria-label="Format Selection">
              <FormatSelector
                selectedFormats={context.formats}
                onChange={(formats) => setContext({ ...context, formats })}
                onNext={() => setActiveTab('context')}
              />
            </section>
          )}

          {/* TAB 2: Situation & Context Sounding Board */}
          {activeTab === 'context' && (
            <section aria-label="Situation Context">
              <ContextForm
                context={context}
                onChange={setContext}
                onSubmit={() => generateInitialDraft(context, true)}
                isLoading={isLoading}
                onBack={() => setActiveTab('format')}
              />
            </section>
          )}

          {/* TAB 3: Draft, Adjustments & Visual Diff Tracker (Grouped together) */}
          {activeTab === 'draft-adjustments' && (
            <section aria-label="Draft and Adjustments">
              <DraftAdjustmentsView
                context={context}
                currentDraft={currentDraft}
                draftHistory={draftHistory}
                selectedDisplayFormat={selectedDisplayFormat}
                onSelectDisplayFormat={setSelectedDisplayFormat}
                isApproved={isApproved}
                onApprove={handleApprove}
                onRefine={handleRefine}
                isRefining={isRefining}
                onBackToContext={() => setActiveTab('context')}
                onProceedToActionPlan={() => setActiveTab('action-plan')}
                onGenerateInitialDraft={() => generateInitialDraft(context, true)}
                isLoadingInitial={isLoading}
                onSelectIteration={handleSelectIteration}
              />
            </section>
          )}

          {/* TAB 4: Action Plan & Prioritized Next Steps */}
          {activeTab === 'action-plan' && (
            <section aria-label="Action Plan">
              <ActionableNextSteps
                advice={advice}
                currentDraft={currentDraft}
                onBackToDraft={() => setActiveTab('draft-adjustments')}
                onApproveDraft={handleApprove}
                onStartNew={handleReset}
              />
            </section>
          )}
        </div>
      </main>

      {/* System Diagram Modal behind Info Button */}
      <SystemDiagramModal
        isOpen={isDiagramOpen}
        onClose={() => setIsDiagramOpen(false)}
      />
    </div>
  );
}
