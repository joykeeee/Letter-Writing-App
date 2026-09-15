export type LetterFormat = 'email' | 'handwritten' | 'typed';

export type RelationshipType = 
  | 'mentor'
  | 'senior_leader'
  | 'peer'
  | 'alumni'
  | 'client'
  | 'recruiter';

export type SituationType =
  | 'missed_coffee_chat'
  | 'missed_virtual_chat'
  | 'reschedule_request'
  | 'calendar_mixup'
  | 'custom';

export type EmotionalState =
  | 'very_anxious'
  | 'moderately_nervous'
  | 'calm_pragmatic';

export interface DraftIteration {
  id: number;
  version: number;
  timestamp: string;
  subject?: string;
  body: string;
  reassurance?: string;
  advisorNote?: string;
  changeSummary?: string;
  missingInfoFlags?: string[];
  promptQuestion?: string;
  isUserApproved?: boolean;
}

export interface NextStep {
  step: number;
  title: string;
  description: string;
}

export interface FinalAdvice {
  affirmationMessage: string;
  prioritizedNextSteps: NextStep[];
  futureReferenceTips: string[];
}

export interface AssistantContext {
  formats: LetterFormat[];
  recipientName: string;
  senderName: string;
  relationship: RelationshipType | string;
  situation: SituationType | string;
  timeline: string;
  location: string;
  reason: string;
  userFeeling?: string;
  emotionalState: EmotionalState;
  tonePreference: string;
  additionalContext: string;
}

export type ActiveTab = 'format' | 'context' | 'draft-adjustments' | 'action-plan';
