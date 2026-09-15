import React, { useState } from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  Smile, 
  AlertCircle, 
  Clock, 
  MapPin, 
  UserCheck, 
  Briefcase,
  Heart,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { AssistantContext, EmotionalState, RelationshipType, SituationType } from '../types';

interface ContextFormProps {
  context: AssistantContext;
  onChange: (updated: AssistantContext) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onBack?: () => void;
}

export const ContextForm: React.FC<ContextFormProps> = ({
  context,
  onChange,
  onSubmit,
  isLoading,
  onBack,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Dynamic peer mentor perspective based on what the user types
  const getPeerMentorPerspective = (feeling?: string): string => {
    const text = (feeling || '').toLowerCase().trim();
    if (!text) {
      return "Type how you're feeling above (e.g., feeling guilty about delaying your reply, worried about seeming rude, or anxious about sounding defensive). As your peer mentor, I'll provide grounded, straightforward perspective to reassure you.";
    }
    if (text.includes('guilt') || text.includes('bad') || text.includes('awful') || text.includes('shame')) {
      return "Feeling guilty is completely understandable, but letting it fester only makes reaching out harder. Senior professionals have busy calendars and unexpected emergencies themselves—they will respect you taking prompt, clean ownership today much more than prolonged silence.";
    }
    if (text.includes('wait') || text.includes('delay') || text.includes('late') || text.includes('days') || text.includes('time')) {
      return "It's easy to feel like waiting a couple of days made things worse, but the best time to fix it is right now. A brief note acknowledging the delay without drama or long-winded excuses immediately clears the air and re-establishes your professionalism.";
    }
    if (text.includes('rude') || text.includes('upset') || text.includes('angry') || text.includes('bridge') || text.includes('disrespect')) {
      return "Missing one coffee chat or meeting does not burn a bridge or make you rude. In the professional world, what counts is your accountability: apologize directly, keep your explanation to one sentence, and make rescheduling as effortless as possible.";
    }
    if (text.includes('excuse') || text.includes('defensive') || text.includes('sound')) {
      return "You're spot-on to avoid sounding defensive. A peer-level apology doesn't need theatrical remorse or lengthy stories—just an honest statement of what happened, respect for their time, and clear flexibility for next steps.";
    }
    if (text.includes('nervous') || text.includes('anxious') || text.includes('worried') || text.includes('scared')) {
      return "Take a deep breath. Reaching out feels nerve-wracking, but in reality, recipients are usually understanding and just glad to hear from you. We'll make sure your draft strikes the right chord without being overly deferential.";
    }
    return `Thanks for putting that into words. Acknowledge what happened honestly, keep the explanation to one concise sentence, and focus on moving forward. Reaching out promptly with ownership is the single best way to resolve this.`;
  };

  return (
    <form
      id="letter-context-form"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6"
    >
      {/* Form Header */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
            Step 2 of 4
          </span>
          <span className="text-xs text-slate-400 font-medium">•</span>
          <span className="text-xs text-slate-500 font-medium">Context & Voice Calibration</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <span>Situation Context & Sounding Board</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          Tell us a little about what happened. We only ask questions that materially shape your letter’s tone, keeping your authentic voice front and center without over-explaining.
        </p>
      </div>

      {/* User Feeling Input & Dynamic Peer Mentor Perspective */}
      <div className="bg-slate-50 rounded-xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="user-feeling-input" className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>How are you feeling right now about reaching out?</span>
          </label>
          <span className="text-[11px] text-slate-400 font-normal">Type in your own words</span>
        </div>

        <div>
          <textarea
            id="user-feeling-input"
            rows={2}
            value={context.userFeeling || ''}
            onChange={(e) => {
              const val = e.target.value;
              let inferredState: EmotionalState = 'moderately_nervous';
              const lower = val.toLowerCase();
              if (lower.includes('anxious') || lower.includes('worried') || lower.includes('scared') || lower.includes('guilt')) {
                inferredState = 'very_anxious';
              } else if (lower.includes('ready') || lower.includes('calm') || lower.includes('fine')) {
                inferredState = 'calm_pragmatic';
              }
              onChange({ ...context, userFeeling: val, emotionalState: inferredState });
            }}
            placeholder="Type how you're feeling (e.g. 'I feel guilty because I waited 2 days to reply and I'm worried they think I was rude', or 'I'm nervous about sounding defensive')..."
            className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white resize-none"
          />
        </div>

        {/* Dynamic Peer Mentor Perspective Box */}
        <div className="p-3.5 bg-amber-50/90 rounded-xl border border-amber-200/70 text-xs text-amber-900 flex items-start gap-3">
          <div className="w-5 h-5 rounded-full bg-amber-200/80 flex items-center justify-center shrink-0 mt-0.5 text-amber-900 font-bold text-[11px]">
            i
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-amber-950">
              Peer Mentor Perspective:
            </div>
            <p className="text-amber-900/90 leading-relaxed">
              {getPeerMentorPerspective(context.userFeeling)}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Context Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recipient Name */}
        <div>
          <label htmlFor="recipient-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
            Recipient's Name <span className="text-slate-400 font-normal">(Leave blank for [Name])</span>
          </label>
          <input
            id="recipient-name-input"
            type="text"
            value={context.recipientName}
            onChange={(e) => onChange({ ...context, recipientName: e.target.value })}
            placeholder="e.g. Jordan or Dr. Vance"
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Sender Name */}
        <div>
          <label htmlFor="sender-name-input" className="block text-xs font-semibold text-slate-700 mb-1">
            Your Name <span className="text-slate-400 font-normal">(Leave blank for [Your Name])</span>
          </label>
          <input
            id="sender-name-input"
            type="text"
            value={context.senderName}
            onChange={(e) => onChange({ ...context, senderName: e.target.value })}
            placeholder="e.g. Alex"
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        {/* Relationship */}
        <div>
          <label htmlFor="relationship-select" className="block text-xs font-semibold text-slate-700 mb-1">
            Your Relationship with the Recipient
          </label>
          <select
            id="relationship-select"
            value={context.relationship}
            onChange={(e) => onChange({ ...context, relationship: e.target.value as RelationshipType })}
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          >
            <option value="mentor">Mentor or Advisor (Warm, respectful)</option>
            <option value="senior_leader">Senior Leader / Executive (Polite, direct, highly mindful of time)</option>
            <option value="peer">Peer or Colleague (Casual, straightforward)</option>
            <option value="alumni">School Alumni (Warm, connected)</option>
            <option value="recruiter">Recruiter or Hiring Manager (Professional, concise)</option>
            <option value="client">Client or External Partner (Polished, courteous)</option>
          </select>
        </div>

        {/* Timeline */}
        <div>
          <label htmlFor="timeline-input" className="block text-xs font-semibold text-slate-700 mb-1">
            When did this happen?
          </label>
          <input
            id="timeline-input"
            type="text"
            value={context.timeline}
            onChange={(e) => onChange({ ...context, timeline: e.target.value })}
            placeholder="e.g. Earlier today / Yesterday afternoon / 2 days ago"
            className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      {/* Brief Reason */}
      <div>
        <label htmlFor="reason-textarea" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span>Briefly, what happened? (No need for elaborate excuses)</span>
          <span className="text-[11px] font-normal text-slate-400">Keep it honest & brief</span>
        </label>
        <textarea
          id="reason-textarea"
          rows={2}
          value={context.reason}
          onChange={(e) => onChange({ ...context, reason: e.target.value })}
          placeholder="e.g. An unexpected project emergency came up at work, and my phone died before I could message you."
          className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 resize-none"
        />
        <p className="text-[11px] text-slate-500 mt-1">
          Rule of thumb: Briefly acknowledging an unexpected conflict is much more professional than offering long, defensive paragraphs.
        </p>
      </div>

      {/* Toggle Advanced Context */}
      <div className="border-t border-slate-100 pt-3">
        <button
          id="toggle-advanced-context-btn"
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1.5"
        >
          {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showAdvanced ? 'Hide Additional Details' : 'Add Location & Tone Nuances (Optional)'}</span>
        </button>

        {showAdvanced && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div>
              <label htmlFor="location-input" className="block text-xs font-semibold text-slate-700 mb-1">
                Planned Meeting Location / Platform
              </label>
              <input
                id="location-input"
                type="text"
                value={context.location}
                onChange={(e) => onChange({ ...context, location: e.target.value })}
                placeholder="e.g. Blue Bottle Coffee downtown / Zoom"
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>

            <div>
              <label htmlFor="tone-preference-select" className="block text-xs font-semibold text-slate-700 mb-1">
                Tone Nuance
              </label>
              <select
                id="tone-preference-select"
                value={context.tonePreference}
                onChange={(e) => onChange({ ...context, tonePreference: e.target.value })}
                className="w-full text-sm px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
              >
                <option value="Professional, genuine, concise, not overly deferential">Balanced & Direct (Recommended)</option>
                <option value="Slightly warmer, friendly, peer-oriented">Warm & Approachable</option>
                <option value="Crisp, executive brevity, ultra-concise">Ultra-Concise & Time-Conscious</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        {onBack ? (
          <button
            id="context-back-btn"
            type="button"
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Format</span>
          </button>
        ) : <div />}

        <button
          id="generate-draft-btn"
          type="submit"
          disabled={isLoading}
          className="w-full sm:w-auto py-3 px-6 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-amber-600/10 transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Drafting with Peer Mentor Perspective...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Draft & Go to Adjustments</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
};
