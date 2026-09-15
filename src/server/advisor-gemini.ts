import { GoogleGenAI, Type } from "@google/genai";
import {
  generateRealisticFallbackDraft,
  refineDraftLocally,
  generateFinalStepsFallback,
} from "../lib/mentor-fallback.ts";

let geminiClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

export const PEER_ADVISOR_SYSTEM_INSTRUCTION = `
You are a Peer Career Advisor and Mentor with Professional Experience.
Your Purpose:
Act as a trusted guide and peer mentor in a professional context. Provide perspective as if you are a seasoned, supportive professional who has navigated these situations firsthand.
Your core task is helping write authentic, respectful, and effective communications (such as an apology email to someone in their network for missing a coffee chat or networking opportunity, rescheduling, follow-ups, or professional letters).

Behavioral Rules:
1. Professional tone - act as a calm, pragmatic sounding board.
2. Show empathy and reassurance, especially if the user is anxious, guilty, or nervous about missing an opportunity or sounding rude. However, do NOT dwell overly on emotions or use physical sensations ("I feel your pain").
3. Do NOT start with an excessively deferential or groveling tone (e.g. "I offer my deepest, humblest apologies"). That sounds unnatural and awkward in modern professional life. Show sincerity through brief, direct ownership of the situation and appreciation for their time.
4. Keep communications concise and to the point. Professionals appreciate brevity and clear proposals.
5. Preserve the user's authentic voice. Do not invent achievements, false credentials, or elaborate fabricated excuses. If reason is unknown, use placeholders like "[brief context or personal conflict]".
6. Use placeholders like [Name], [Day, Time], [Specific Topic] where important facts are missing.
7. Always end your response by asking explicitly: "Is this draft ok?"
`;

export async function callGeminiWithFallback(
  ai: GoogleGenAI,
  makeParams: (model: string) => any
): Promise<any> {
  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastErr: any = null;

  for (const model of models) {
    try {
      const params = makeParams(model);
      const apiPromise = ai.models.generateContent(params);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Gemini generation timed out")), 20000)
      );
      const response = (await Promise.race([apiPromise, timeoutPromise])) as any;
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastErr = err;
      console.log(`[Gemini API Notice] Model ${model} notice (${err?.status || err?.code || "unavailable"}). Checking fallback...`);
    }
  }

  throw lastErr;
}

export async function handleGenerateDraft(body: any) {
  const ai = getGenAI();
  if (!ai) {
    return {
      success: true,
      data: generateRealisticFallbackDraft(body),
      provider: "mentor_engine",
    };
  }

  try {
    const {
      formats = ["email"],
      recipientName,
      senderName,
      relationship,
      situation,
      timeline,
      location,
      reason,
      userFeeling,
      emotionalState,
      tonePreference,
      additionalContext,
    } = body;

    const prompt = `
Generate an authentic, professional outreach/apology letter based on the following context:
- Requested Formats: ${formats.join(", ")}
- Recipient Name: ${recipientName || "[Name]"}
- Sender Name: ${senderName || "[Your Name]"}
- Recipient Relationship / Hierarchy: ${relationship || "Professional contact / Mentor"}
- Situation: ${situation || "Missed coffee chat / networking meeting"}
- Timeline (when it happened): ${timeline || "Recently"}
- Location/Medium: ${location || "Coffee shop / Video call"}
- Reason / Context: ${reason || "[unexpected conflict / personal emergency]"}
- User's Typed Feelings / Worries: ${userFeeling || emotionalState || "Nervous about seeming rude or burning bridges"}
- Desired Tone: ${tonePreference || "Professional, genuine, concise, not overly deferential"}
- Additional Details: ${additionalContext || "None provided"}

Output Requirements:
1. Reassurance & Mentor Perspective: A calm, validating mentor perspective directly addressing the user's typed feelings without being dramatic or dismissing their concerns. Explain why this happens and how taking prompt ownership resolves it.
2. Advisor Note: A 1-2 sentence peer mentor note.
3. Subject: (If email format is included) A clear, professional subject line.
4. Body: The full text of the letter/message. Keep it concise, natural, sincere, not groveling, using placeholders like [Name] and [Your Name] where facts are not specified.
5. MissingInfoFlags: Any facts the user should verify or insert.
6. Explicit Question: Must include "Is this draft ok?"
`;

    const response = await callGeminiWithFallback(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        systemInstruction: PEER_ADVISOR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reassurance: {
              type: Type.STRING,
              description: "Calm, empathetic mentor reassurance addressing the user's specific worry.",
            },
            advisorNote: {
              type: Type.STRING,
              description: "Brief peer advisor rationale on why this phrasing was chosen.",
            },
            subject: {
              type: Type.STRING,
              description: "Subject line for email format.",
            },
            body: {
              type: Type.STRING,
              description: "The complete text of the apology/rescheduling note.",
            },
            missingInfoFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "List of missing facts or bracketed placeholders the user should verify.",
            },
            promptQuestion: {
              type: Type.STRING,
              description: "Exact closing question, must be 'Is this draft ok?' or 'Is this email ok?'",
            },
          },
          required: ["reassurance", "advisorNote", "body", "promptQuestion"],
        },
      },
    }));

    const parsed = JSON.parse(response.text || "{}");
    return {
      success: true,
      data: parsed,
      provider: "gemini",
    };
  } catch (error: any) {
    console.log("[PeerAdvisor] Using mentor strategy rules fallback.");
    return {
      success: true,
      data: generateRealisticFallbackDraft(body),
      provider: "mentor_engine",
    };
  }
}

export async function handleRefineDraft(body: any) {
  const ai = getGenAI();
  if (!ai) {
    return {
      success: true,
      data: refineDraftLocally(body),
      provider: "mentor_engine",
    };
  }

  try {
    const {
      previousDraft,
      previousSubject,
      feedback,
      formats = ["email"],
      recipientName,
      senderName,
      relationship,
    } = body;

    const prompt = `
Regenerate and refine this professional letter draft based on the user's specific feedback:
Current Draft:
"""
${previousDraft}
"""
Current Subject: ${previousSubject || "N/A"}
User's Feedback / Requested Adjustments: "${feedback}"
Recipient Relationship: ${relationship || "Professional contact"}
Sender Name: ${senderName || "[Your Name]"}
Recipient Name: ${recipientName || "[Name]"}
Formats: ${formats.join(", ")}

Strict Instructions:
1. Regenerate the letter body by organically weaving the user's requested adjustment ("${feedback}") directly into the natural sentences and paragraphs of the letter.
2. ABSOLUTELY FORBIDDEN: Do NOT append the adjustment at the end of the letter as a note, bracketed tag, footer, or "P.S.". It must be fully integrated into the letter itself.
3. If the user asks to change names, reasons, meeting types, dates, or tone, update those elements directly in the body and subject.
4. Maintain sincere accountability without sounding overly deferential, groveling, or defensive.
5. Keep the text concise, professional, and authentic to the user's voice.
6. In changeSummary, state clearly what modifications were made.
7. End promptQuestion with: "Is this draft ok?" (or "Is this email ok?").
`;

    const response = await callGeminiWithFallback(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        systemInstruction: PEER_ADVISOR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            body: {
              type: Type.STRING,
              description: "The revised letter body text.",
            },
            subject: {
              type: Type.STRING,
              description: "Updated subject line if applicable.",
            },
            advisorNote: {
              type: Type.STRING,
              description: "A short note explaining how the feedback was incorporated.",
            },
            changeSummary: {
              type: Type.STRING,
              description: "Brief summary of the changes made between this draft and the previous one.",
            },
            promptQuestion: {
              type: Type.STRING,
              description: "Must be 'Is this draft ok?' or 'Is this email ok?'",
            },
          },
          required: ["body", "advisorNote", "changeSummary", "promptQuestion"],
        },
      },
    }));

    const parsed = JSON.parse(response.text || "{}");
    return {
      success: true,
      data: parsed,
      provider: "gemini",
    };
  } catch (error: any) {
    console.log("[PeerAdvisor] Refining draft with local mentor rule engine.");
    return {
      success: true,
      data: refineDraftLocally(body),
      provider: "mentor_engine",
    };
  }
}

export async function handleFinalizeSteps(body: any) {
  const ai = getGenAI();
  if (!ai) {
    return {
      success: true,
      data: generateFinalStepsFallback(body),
      provider: "mentor_engine",
    };
  }

  try {
    const { approvedDraft, recipientName, senderName, relationship, formats } = body;

    const prompt = `
The user has confirmed they are satisfied with their letter:
"""
${approvedDraft}
"""
Recipient: ${recipientName || "[Name]"} (${relationship || "Professional contact"})
Sender: ${senderName || "[Your Name]"}
Format: ${(formats || []).join(", ")}

As an experienced peer career mentor:
1. Provide a brief, warm affirmation of the completed message.
2. Recommend 3 prioritized, highly concrete next steps the user should take right now (e.g. sending window, rescheduling readiness, calendar reminder buffer).
3. Provide 3 high-impact tips for future reference (scheduling hygiene, calendar buffering, professional etiquette).
`;

    const response = await callGeminiWithFallback(ai, (model) => ({
      model,
      contents: prompt,
      config: {
        systemInstruction: PEER_ADVISOR_SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            affirmationMessage: {
              type: Type.STRING,
              description: "Warm, professional affirmation of the finalized message.",
            },
            prioritizedNextSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  step: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                },
                required: ["step", "title", "description"],
              },
            },
            futureReferenceTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Actionable tips for future professional scheduling and communication.",
            },
          },
          required: ["affirmationMessage", "prioritizedNextSteps", "futureReferenceTips"],
        },
      },
    }));

    const parsed = JSON.parse(response.text || "{}");
    return {
      success: true,
      data: parsed,
      provider: "gemini",
    };
  } catch (error: any) {
    console.log("[PeerAdvisor] Generating action steps with mentor strategy rules.");
    return {
      success: true,
      data: generateFinalStepsFallback(body),
      provider: "mentor_engine",
    };
  }
}
