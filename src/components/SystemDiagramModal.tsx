import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  User, 
  GitCompare, 
  ShieldCheck, 
  Send, 
  FileText, 
  Mail, 
  PenTool, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  Server,
  Layers,
  HeartHandshake
} from 'lucide-react';

interface SystemDiagramModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemDiagramModal: React.FC<SystemDiagramModalProps> = ({ isOpen, onClose }) => {
  const [selectedNode, setSelectedNode] = useState<string | null>('agent');

  if (!isOpen) return null;

  const nodeDetails: Record<string, { title: string; role: string; inputs: string[]; outputs: string[]; guardrails: string[] }> = {
    user: {
      title: "1. User Interaction & Empathy Ingestion",
      role: "Captures user's communication intent, formats (Email, Hand-written, Typed), timeline, situational context, and emotional anxiety (e.g. guilt over missed coffee chat).",
      inputs: ["Format preference (Single or Multi-select)", "Context & Recipient Relationship", "Timeline & Reason", "Nervousness/Emotional State"],
      outputs: ["Structured context payload", "User voice preservation baseline"],
      guardrails: ["Empathetic reassurance triggers without excessive emotional dwelling", "Non-intrusive questions that only materially impact tone"]
    },
    agent: {
      title: "2. Peer Career Advisor & Letter Agent",
      role: "Core domain-specific AI Agent acting as an experienced professional peer mentor. Synthesizes context, normalizes anxiety, enforces peer-to-peer equilibrium, and structures iterations.",
      inputs: ["User Context", "Historical Iteration Diffs", "Professional Mentorship Guidelines", "Anti-Groveling & Voice Preserving Rules"],
      outputs: ["Calm Reassurance", "Draft body with [placeholders]", "Peer Mentor reasoning notes", "Mandatory 'Is this draft ok?' inquiry"],
      guardrails: [
        "Anti-deferential check: Bans groveling or exaggerated apologies",
        "Anti-hallucination: Never invents fake credentials, metrics, or false excuses",
        "Placeholder integrity: Unknown facts marked as [Name] or [Date]"
      ]
    },
    llm: {
      title: "3. Server-Side Gemini 3.8 Flash Engine",
      role: "High-speed reasoning model executing server-side via @google/genai SDK with strict JSON schema enforcement.",
      inputs: ["System instructions (Peer Mentor Persona)", "User prompt & Context parameters", "Schema validation constraints"],
      outputs: ["Structured JSON with body, reassurance, mentor note, missingInfoFlags, and prompt question"],
      guardrails: ["Server-side only execution", "API keys isolated from client runtime", "Zero-leakage telemetry headers"]
    },
    diff: {
      title: "4. Iteration & Diff Tracking Engine",
      role: "Computes word-by-word differences between successive letter iterations so the user clearly sees additions, deletions, and phrasing refinements.",
      inputs: ["Previous draft text", "New revision draft text"],
      outputs: ["Inline diff view (green additions, red strikethrough deletions)", "Side-by-side comparative inspection"],
      guardrails: ["Preserves exact punctuation and spacing", "Version rollback support across draft history"]
    },
    gatekeeper: {
      title: "5. Affirmation Gatekeeper ('Is this draft ok?')",
      role: "Strict behavioral enforcement preventing premature advice. Next steps and future tips are locked until the user explicitly confirms they are satisfied.",
      inputs: ["User evaluation ('Yes, this looks great!' or 'I'd like to refine')"],
      outputs: ["State unlock flag", "Trigger for next steps generation"],
      guardrails: ["Cannot give next steps/tips until explicit user approval", "No direct-send email integration (strictly copy & print only)"]
    },
    artifacts: {
      title: "6. Multi-Format Artifacts & Actionable Mentorship",
      role: "Renders realistic letter representations across Email (desktop client preview), Hand-written (stationery & cursive), and Typed (formal letterhead), with printable layout and prioritized next steps.",
      inputs: ["Approved final draft", "Situation context"],
      outputs: ["Print-ready layout via CSS", "1-click highlight/copy to clipboard", "Prioritized 3-step action checklist", "Future reference etiquette tips"],
      guardrails: ["No third-party email transmission", "Self-contained local clipboard and print actions"]
    }
  };

  const active = selectedNode ? nodeDetails[selectedNode] : null;

  return (
    <div 
      id="system-diagram-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="system-diagram-modal"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-semibold border border-amber-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 tracking-tight">System Architecture & Agent Flow</h2>
              <p className="text-xs text-slate-500">Peer Career Advisor & Letter Writing Assistant System Blueprint</p>
            </div>
          </div>
          <button
            id="close-system-diagram-btn"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Close System Diagram"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Interactive Pipeline Diagram */}
          <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-800 shadow-inner">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium mb-3 flex items-center justify-between">
              <span>Interactive Pipeline Diagram (Click any stage to inspect specifications)</span>
              <span className="text-[11px] text-amber-400">● Live Architecture</span>
            </div>

            {/* Stages Flow */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3 pt-2">
              {/* Node 1: User */}
              <button
                id="diagram-node-user"
                type="button"
                onClick={() => setSelectedNode('user')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedNode === 'user'
                    ? 'border-amber-400 bg-amber-950/40 text-white ring-2 ring-amber-400/30'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">1. User Client</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">Format (Email/Handwritten/Typed) & Context</p>
              </button>

              {/* Node 2: Agent */}
              <button
                id="diagram-node-agent"
                type="button"
                onClick={() => setSelectedNode('agent')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedNode === 'agent'
                    ? 'border-amber-400 bg-amber-950/40 text-white ring-2 ring-amber-400/30'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <HeartHandshake className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">2. Advisor Agent</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">Peer Mentor Persona, Voice & Reassurance</p>
              </button>

              {/* Node 3: LLM Engine */}
              <button
                id="diagram-node-llm"
                type="button"
                onClick={() => setSelectedNode('llm')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedNode === 'llm'
                    ? 'border-amber-400 bg-amber-950/40 text-white ring-2 ring-amber-400/30'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">3. Gemini 3.8</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">Express Server-side Structured JSON</p>
              </button>

              {/* Node 4: Diff Engine */}
              <button
                id="diagram-node-diff"
                type="button"
                onClick={() => setSelectedNode('diff')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedNode === 'diff'
                    ? 'border-amber-400 bg-amber-950/40 text-white ring-2 ring-amber-400/30'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <GitCompare className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">4. Diff Tracker</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">Word-level Additions & Strikethroughs</p>
              </button>

              {/* Node 5: Gatekeeper */}
              <button
                id="diagram-node-gatekeeper"
                type="button"
                onClick={() => setSelectedNode('gatekeeper')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedNode === 'gatekeeper'
                    ? 'border-amber-400 bg-amber-950/40 text-white ring-2 ring-amber-400/30'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">5. Gatekeeper</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">"Is this draft ok?" Approval Check</p>
              </button>

              {/* Node 6: Artifacts */}
              <button
                id="diagram-node-artifacts"
                type="button"
                onClick={() => setSelectedNode('artifacts')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  selectedNode === 'artifacts'
                    ? 'border-amber-400 bg-amber-950/40 text-white ring-2 ring-amber-400/30'
                    : 'border-slate-800 bg-slate-800/60 hover:bg-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-semibold">6. Delivery</span>
                </div>
                <p className="text-[11px] text-slate-400 line-clamp-2">Print / Copy + Actionable Next Steps</p>
              </button>
            </div>
          </div>

          {/* Node Detailed Inspection Card */}
          {active && (
            <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm space-y-4">
              <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{active.title}</h3>
                  <p className="text-sm text-slate-600 mt-0.5">{active.role}</p>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                  Inspecting Stage Details
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Inputs */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <ArrowRight className="w-3.5 h-3.5 text-amber-600" />
                    Inputs & Telemetry
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    {active.inputs.map((inp, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span>{inp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Outputs */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    Outputs Produced
                  </div>
                  <ul className="space-y-1.5 text-slate-600">
                    {active.outputs.map((out, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-indigo-500 mt-0.5">•</span>
                        <span>{out}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Guardrails */}
                <div className="bg-amber-50/50 p-3.5 rounded-lg border border-amber-200/80">
                  <div className="font-semibold text-amber-900 mb-2 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    Agent Guardrails & Ethics
                  </div>
                  <ul className="space-y-1.5 text-amber-900/90">
                    {active.guardrails.map((grd, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-amber-600 mt-0.5">•</span>
                        <span>{grd}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Architectural Principles & System Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-amber-600" />
                The Peer Career Advisor Persona
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Rather than acting like a cold grammar tool or a subservient assistant, the agent embodies a supportive, senior peer in your professional network. It understands that missing a coffee chat causes genuine anxiety, eases self-blame, prevents awkward over-apologizing, and keeps correspondence concise and respectful.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="font-semibold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <GitCompare className="w-4 h-4 text-emerald-600" />
                Transparent Iteration Diffing
              </h4>
              <p className="text-slate-600 leading-relaxed">
                As you provide feedback (e.g. "make it more direct" or "mention my train delay"), the assistant tracks history across revisions. Deletions are shown in soft red strikethrough and new wording in emerald highlight, giving you total transparency over every sentence before you approve it.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Security Notice: Never transmits emails directly. Designed strictly for drafting, diffing, and export.</span>
          <button
            id="close-system-diagram-footer-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors"
          >
            Close Diagram
          </button>
        </div>
      </div>
    </div>
  );
};
