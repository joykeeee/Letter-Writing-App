import React from 'react';
import { 
  Layout, 
  UserCheck, 
  Edit3, 
  CheckCircle2, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ActiveTab, AssistantContext, DraftIteration } from '../types';

interface TabNavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  context: AssistantContext;
  currentDraft: DraftIteration | null;
  isApproved: boolean;
  draftCount: number;
}

interface TabItem {
  id: ActiveTab;
  stepNumber: string;
  title: string;
  shortTitle: string;
  description: string;
  icon: React.FC<{ className?: string }>;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  context,
  currentDraft,
  isApproved,
  draftCount,
}) => {
  const tabs: TabItem[] = [
    {
      id: 'format',
      stepNumber: '1',
      title: 'Format',
      shortTitle: 'Format',
      description: `${context.formats.length} format${context.formats.length > 1 ? 's' : ''} selected`,
      icon: Layout,
    },
    {
      id: 'context',
      stepNumber: '2',
      title: 'Situation & Context',
      shortTitle: 'Context',
      description: context.recipientName ? `To: ${context.recipientName}` : 'Circumstances & Tone',
      icon: UserCheck,
    },
    {
      id: 'draft-adjustments',
      stepNumber: '3',
      title: 'Draft & Adjustments',
      shortTitle: 'Draft & Adjust',
      description: currentDraft ? `Version ${currentDraft.version} • ${isApproved ? 'Approved' : 'Review'}` : 'Generate & Diff',
      icon: Edit3,
    },
    {
      id: 'action-plan',
      stepNumber: '4',
      title: 'Action Plan',
      shortTitle: 'Action Plan',
      description: isApproved ? 'Prioritized Steps' : 'Unlocks on Approval',
      icon: CheckCircle2,
    },
  ];

  return (
    <nav aria-label="Workflow Steps" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-1.5 sm:p-2">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(tab.id)}
              className={`group relative text-left p-2.5 sm:p-3 rounded-xl transition-all flex flex-col justify-between border ${
                isActive
                  ? 'bg-amber-500/10 border-amber-500/40 text-slate-900 shadow-xs ring-1 ring-amber-500/30'
                  : 'bg-transparent border-transparent hover:bg-slate-100/70 text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : 'bg-slate-200 text-slate-600 group-hover:bg-slate-300'
                    }`}
                  >
                    {tab.stepNumber}
                  </span>
                  <span className="hidden sm:inline-block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Step {tab.stepNumber}
                  </span>
                </div>

                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-amber-600/15 text-amber-800'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                    <span className="hidden md:inline">{tab.title}</span>
                    <span className="md:hidden">{tab.shortTitle}</span>
                  </span>
                  {tab.id === 'draft-adjustments' && currentDraft && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-200/60 text-amber-900 font-bold">
                      v{currentDraft.version}
                    </span>
                  )}
                  {tab.id === 'action-plan' && isApproved && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold">
                      Ready
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-medium">
                  {tab.description}
                </p>
              </div>

              {/* Active Indicator bar */}
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-amber-600 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
