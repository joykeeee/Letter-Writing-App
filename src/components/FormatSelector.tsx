import React from 'react';
import { Mail, PenTool, FileText, Check, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { LetterFormat } from '../types';

interface FormatSelectorProps {
  selectedFormats: LetterFormat[];
  onChange: (formats: LetterFormat[]) => void;
  onNext?: () => void;
}

interface FormatOption {
  id: LetterFormat;
  title: string;
  subtitle: string;
  badge: string;
  icon: React.FC<{ className?: string }>;
  description: string;
  bestFor: string;
  specs: string;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  selectedFormats,
  onChange,
  onNext,
}) => {
  const options: FormatOption[] = [
    {
      id: 'email',
      title: 'Email Format',
      subtitle: 'Fast, modern digital reach-out',
      badge: 'Most Common',
      icon: Mail,
      description: 'Clean email client layout with subject line, professional salutation, and signature block.',
      bestFor: 'Immediate follow-up, busy professionals, offering calendar reschedule links.',
      specs: 'Includes clear Subject line & 1-click clipboard copy',
    },
    {
      id: 'handwritten',
      title: 'Hand-written Card',
      subtitle: 'Warm, personal note or card',
      badge: 'Warm & Memorable',
      icon: PenTool,
      description: 'Lined paper styling with authentic cursive typography, ideal for thank-yous and sincere gestures.',
      bestFor: 'High-touch gestures, genuine apologies, mentors with whom you have personal rapport.',
      specs: 'Authentic cursive script on lined cream stationery',
    },
    {
      id: 'typed',
      title: 'Typed Letter',
      subtitle: 'Formal printed correspondence',
      badge: 'Formal & Traditional',
      icon: FileText,
      description: 'Classic serif typography, formal date and recipient block, suited for printed archival stationery.',
      bestFor: 'Senior executives, physical office delivery, printed portfolios, or formal records.',
      specs: 'Clean serif layout formatted for standard 8.5x11 print',
    },
  ];

  const toggleFormat = (format: LetterFormat) => {
    if (selectedFormats.includes(format)) {
      // Prevent deselecting all (keep at least one)
      if (selectedFormats.length > 1) {
        onChange(selectedFormats.filter((f) => f !== format));
      }
    } else {
      onChange([...selectedFormats, format]);
    }
  };

  return (
    <div id="format-selector-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-8 animate-in fade-in duration-200">
      {/* Step Header */}
      <div className="border-b border-slate-100 pb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/60">
              Step 1 of 4
            </span>
            <span className="text-xs text-slate-400 font-medium">•</span>
            <span className="text-xs text-slate-500 font-medium">Multiple selections supported</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Choose Delivery Format(s)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Select how you intend to present or deliver your letter. You can select multiple formats—the assistant will generate tailored styling, responsive typography, and layout rules for each.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-amber-50 px-3.5 py-2 rounded-xl border border-amber-200 text-amber-900 text-xs font-semibold">
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>{selectedFormats.length} format{selectedFormats.length > 1 ? 's' : ''} currently active</span>
        </div>
      </div>

      {/* Format Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
        {options.map((option) => {
          const isSelected = selectedFormats.includes(option.id);
          const Icon = option.icon;

          return (
            <div
              key={option.id}
              onClick={() => toggleFormat(option.id)}
              id={`format-btn-${option.id}`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === ' ' || e.key === 'Enter') {
                  e.preventDefault();
                  toggleFormat(option.id);
                }
              }}
              className={`relative text-left p-5 sm:p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-600 bg-amber-50/40 shadow-sm ring-2 ring-amber-500/20'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between w-full mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-xs ${
                      isSelected ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div
                    className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-bold text-base text-slate-900">{option.title}</h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {option.badge}
                  </span>
                </div>
                <p className="text-xs font-semibold text-amber-800 mb-2">{option.subtitle}</p>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {option.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100/80 space-y-1.5 text-[11px]">
                <div className="text-slate-500">
                  <strong className="text-slate-700">Best for:</strong> {option.bestFor}
                </div>
                <div className="text-slate-400">
                  <strong className="text-slate-600">Features:</strong> {option.specs}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Format Deliverability Guide */}
      <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Professional Delivery & Etiquette Recommendation</span>
        </h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          For missed coffee chats, <strong>Email</strong> is recommended as your primary reach-out because promptness shows respect for their time. You can also generate a <strong>Hand-written note</strong> or <strong>Typed letter</strong> to accompany a gesture (such as treating them to coffee on your next meetup or mailing a sincere note).
        </p>
      </div>

      {/* Step Action Bar */}
      {onNext && (
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            Selected: <span className="font-semibold text-slate-900">{selectedFormats.join(', ')}</span>
          </div>

          <button
            id="format-continue-btn"
            type="button"
            onClick={onNext}
            className="px-6 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-semibold text-sm shadow-sm transition-all flex items-center gap-2"
          >
            <span>Continue to Situation & Context</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

