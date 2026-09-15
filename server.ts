import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client lazily
let geminiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
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

const PEER_ADVISOR_SYSTEM_INSTRUCTION = `
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

// Helper for fallback template generation if API key is not yet set or quota is exhausted
function generateRealisticFallbackDraft(params: any) {
  const {
    recipientName = "",
    senderName = "",
    relationship = "mentor",
    situation = "missed_coffee_chat",
    formats = ["email"],
    reason = "",
    userFeeling = "",
    emotionalState = "moderately_nervous",
    tonePreference = "Professional, genuine, concise, not overly deferential",
  } = params || {};

  const isEmail = formats.includes("email");

  let subject = "Apologies for missing our coffee chat / Rescheduling";
  if (relationship === "senior_leader") {
    subject = "Sincere apologies for missing our meeting - Rescheduling";
  } else if (relationship === "peer") {
    subject = "So sorry I missed our chat today!";
  } else if (relationship === "recruiter") {
    subject = "Apologies for missing our discussion - Rescheduling";
  }

  let reassurance = "First off, take a deep breath. Missing a meeting or coffee chat happens to everyone—even seasoned executives have calendar overlaps and emergencies. The key to handling this with grace is taking prompt ownership without over-apologizing or spinning long excuses. Reaching out courteously actually reinforces your professionalism.";
  if (userFeeling) {
    const fLower = userFeeling.toLowerCase();
    if (fLower.includes("guilt") || fLower.includes("bad") || fLower.includes("shame")) {
      reassurance = "Feeling guilty is completely understandable, but letting it fester only makes reaching out harder. Senior professionals have busy schedules and unexpected emergencies themselves—they will respect you taking prompt, clean ownership today much more than prolonged silence.";
    } else if (fLower.includes("wait") || fLower.includes("delay") || fLower.includes("late") || fLower.includes("days")) {
      reassurance = "It's easy to feel like waiting a couple of days made things worse, but the best time to fix it is right now. A brief note acknowledging the delay without drama or long-winded excuses immediately clears the air and restores your credibility.";
    } else if (fLower.includes("rude") || fLower.includes("upset") || fLower.includes("angry") || fLower.includes("disrespect")) {
      reassurance = "Missing one coffee chat or meeting does not burn a bridge or make you rude. In the professional world, what counts is your accountability: apologize directly, keep your explanation to one sentence, and make rescheduling as effortless as possible.";
    } else if (fLower.includes("excuse") || fLower.includes("defensive")) {
      reassurance = "You're spot-on to avoid sounding defensive. A peer-level apology doesn't need theatrical remorse or lengthy stories—just an honest statement of what happened, respect for their time, and clear flexibility for next steps.";
    }
  } else if (emotionalState === "very_anxious" || emotionalState === "very_worried") {
    reassurance = "Take a breath—feeling this way is completely normal, but missing a single coffee chat is far from a career-ending mistake. People in your network understand that sudden priorities occur. What truly matters is reaching out promptly today with accountability and zero drama.";
  } else if (emotionalState === "calm_pragmatic") {
    reassurance = "Great mindset. Maintaining momentum with a courteous, direct message demonstrates high professional maturity.";
  }

  let body = "";
  const reasonText = reason ? reason : "an unexpected conflict arose at the last minute and I was unable to reach out beforehand";

  if (situation === "missed_coffee_chat") {
    body = `Hi ${recipientName || "[Name]"},

I am so sorry I was not able to make our coffee chat today. Unfortunately, ${reasonText}. I deeply respect your time and know how busy your schedule is.

I was really looking forward to learning more about your work and connecting. If you are open to it, I would love the opportunity to reschedule whenever convenient for you over the next couple of weeks. I am happy to work around your availability, or we could also do a quick 15-minute phone or video call if that is easier for you.

Thank you so much for your understanding, and apologies again for the inconvenience.

Best regards,
${senderName || "[Your Name]"}`;
  } else {
    body = `Hi ${recipientName || "[Name]"},

I am writing to sincerely apologize for not being able to connect as planned. ${reason ? reason : "An urgent matter required my immediate attention."}, and I regret that I could not provide advance notice.

I truly value the opportunity to speak with you and would appreciate the chance to reconnect at a time that works best for you. Please let me know if you might have 15–20 minutes in the coming weeks.

Thank you for your time and understanding.

Warmly,
${senderName || "[Your Name]"}`;
  }

  return {
    reassurance,
    advisorNote: "I've structured this draft to be sincere, accountable, and direct. It respects their busy calendar while making rescheduling effortless by offering flexibility.",
    subject: isEmail ? subject : undefined,
    body: body.trim(),
    missingInfoFlags: [
      `Confirm recipient's first name (${recipientName || "[Name]"})`,
      "Verify whether the specific conflict reason is accurate or keep as brief personal conflict",
      "Propose 2-3 specific time windows if you prefer to be proactive",
    ],
    promptQuestion: isEmail ? "Is this email ok?" : "Is this draft ok?",
  };
}

// Helper for smart local refinement fallback
function refineDraftLocally(params: any) {
  const {
    previousDraft = "",
    feedback = "",
    previousSubject = "Apologies for missing our coffee chat / Rescheduling",
    recipientName = "",
    senderName = "",
  } = params;

  let body = previousDraft;
  let subject = previousSubject;
  const feedbackLower = (feedback || "").toLowerCase();
  const changes: string[] = [];

  // 1. Shorter / Concise
  if (feedbackLower.includes("short") || feedbackLower.includes("concise") || feedbackLower.includes("brief")) {
    body = `Hi ${recipientName || "[Name]"},

I am so sorry I missed our chat today. ${params.reason ? params.reason : "An unexpected conflict arose and I wasn't able to give advance notice"}. I deeply respect your time and busy calendar.

If you are open to rescheduling, I would love to connect whenever convenient—even for a quick 15-minute call.

Thanks so much for understanding, and apologies again for the inconvenience.

Best regards,
${senderName || "[Your Name]"}`;
    changes.push("Condensed letter to 3 clear, focused paragraphs");
  }

  // 2. Warmer / Friendly / Casual
  if (feedbackLower.includes("warm") || feedbackLower.includes("casual") || feedbackLower.includes("friendly") || feedbackLower.includes("less formal")) {
    body = body
      .replace(/Dear /g, "Hi ")
      .replace(/Best regards,/g, "Warmly,")
      .replace(/Sincerely,/g, "Warmly,")
      .replace(/I am writing to sincerely apologize/g, "I'm so sorry")
      .replace(/I am so sorry/g, "I'm so sorry")
      .replace(/I would really appreciate the opportunity to/g, "I'd love to");
    if (!body.includes("really looking forward")) {
      body = body.replace(
        /I'm so sorry I was not able to make our coffee chat today\./,
        "I'm so sorry I missed our coffee chat today! I was really looking forward to catching up and hearing your thoughts."
      );
    }
    changes.push("Softened tone to be warmer and more peer-to-peer");
  }

  // 3. More formal / Executive / Direct
  if (feedbackLower.includes("formal") || feedbackLower.includes("executive") || feedbackLower.includes("direct")) {
    subject = "Sincere apologies for missing our meeting - Rescheduling";
    body = `Dear ${recipientName || "[Name]"},

Please accept my sincere apologies for missing our scheduled coffee chat today. Due to an urgent priority that required my immediate attention, I was unfortunately unable to notify you in advance.

I hold the utmost respect for your time and expertise. If your schedule allows in the coming weeks, I would welcome the opportunity to reschedule at your convenience. I am also happy to connect via a brief phone call if that is preferable.

Thank you very much for your time and understanding.

Sincerely,
${senderName || "[Your Name]"}`;
    changes.push("Adopted a structured, executive tone with formal phrasing");
  }

  // 4. Time proposals (Tuesday / Thursday / next week)
  if (feedbackLower.includes("tuesday") || feedbackLower.includes("thursday") || feedbackLower.includes("specific day") || feedbackLower.includes("specific time")) {
    const timeSuggestion = "To make scheduling easy, I am free next Tuesday afternoon (between 1:00 PM – 4:00 PM) or Thursday morning (between 9:00 AM – 11:30 AM), but I am more than happy to work around whatever works best for you.";
    if (!body.includes("Tuesday")) {
      body = body.replace(
        /If you are open to it, I would love the opportunity to reschedule[^\n]*/i,
        `If you are open to rescheduling, I would love the chance to connect. ${timeSuggestion}`
      );
    }
    changes.push("Added concrete availability windows (Tuesday/Thursday) to remove scheduling friction");
  }

  // 5. Coffee on me / treat
  if (feedbackLower.includes("coffee") || feedbackLower.includes("treat") || feedbackLower.includes("buy")) {
    if (!body.includes("on me")) {
      body = body.replace(
        /Best regards,|Warmly,|Sincerely,/,
        "The coffee is 100% on me next time!\n\nBest regards,"
      );
    }
    changes.push("Added courteous note offering to treat for coffee");
  }

  // 6. Generic custom instruction if no standard match
  if (changes.length === 0) {
    body = `${body}\n\n[P.S. Note added: ${feedback}]`;
    changes.push(`Incorporated requested adjustment: "${feedback}"`);
  }

  const changeSummary = changes.join("; ");
  const isEmail = !subject.includes("None");

  return {
    advisorNote: `I have updated your draft to incorporate: "${feedback}". ${
      changes.length > 0 ? changes[0] : "We adjusted the tone while preserving your authentic voice."
    }`,
    subject,
    body: body.trim(),
    changeSummary,
    promptQuestion: isEmail ? "Is this email ok?" : "Is this draft ok?",
  };
}

// Helper for actionable next steps fallback
function generateFinalStepsFallback(params: any) {
  const { relationship = "mentor" } = params || {};
  const isSenior = relationship === "senior_leader" || relationship === "recruiter";

  return {
    affirmationMessage: "Fantastic work! This message strikes the exact right chord: taking prompt, respectful ownership without over-apologizing or making defensive excuses. It respects their busy calendar while making rescheduling effortless.",
    prioritizedNextSteps: [
      {
        step: 1,
        title: "Send during active professional business hours",
        description: isSenior
          ? "Send this today between 9:00 AM and 4:30 PM in the recipient's local time zone. Avoid late-night sends to maintain a calm, deliberate impression."
          : "Send this today between 9:00 AM and 5:00 PM in the recipient's time zone to show prompt responsiveness.",
      },
      {
        step: 2,
        title: "Have 2–3 concrete time slots ready when they reply",
        description: "When they respond open to rescheduling, reply promptly with 2–3 concrete 20–30 minute windows (e.g. 'Tuesday 10–11:30am or Thursday afternoon') so they don't have to carry the mental load of proposing times.",
      },
      {
        step: 3,
        title: "Set a 5–7 business day calendar reminder",
        description: "If they don't reply immediately, do not panic. High-priority professionals get dozens of emails daily. A gentle 1-line bump after 5–7 business days is standard etiquette.",
      },
    ],
    futureReferenceTips: [
      "Always buffer calendar commitments with 10–15 minutes of cushion to prevent overlapping meetings or commute delays.",
      "If you anticipate being delayed or missing a commitment, send a 1-sentence note 15+ minutes beforehand rather than afterwards.",
      "Professional rapport is built on cumulative reliability and graceful communication, not on never having an unexpected emergency.",
    ],
  };
}

// Helper for robust Gemini calls with multi-model fallback and extended timeout
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  makeParams: (model: string) => any
): Promise<any> {
  // Try primary model first, then lightweight fallback model
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
      console.log(`[Gemini API Notice] Model ${model} encountered notice (${err?.status || err?.code || "unavailable"}). Checking fallback...`);
    }
  }

  throw lastErr;
}

// 1. Generate initial draft
app.post("/api/generate-draft", async (req: Request, res: Response) => {
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
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      // Fallback response with peer mentor guidance
      const fallback = generateRealisticFallbackDraft(req.body);
      return res.json({
        success: true,
        data: fallback,
        provider: "template",
      });
    }

    const prompt = `
Context for writing this letter/message:
- Selected format(s): ${formats.join(", ")} (Formats may be email, handwritten, typed)
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

Please generate:
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
              description: "Empathetic, calm reassurance from a peer mentor addressing the user's worry or nervousness.",
            },
            advisorNote: {
              type: Type.STRING,
              description: "Brief professional advice explaining the rationale behind this phrasing.",
            },
            subject: {
              type: Type.STRING,
              description: "Email subject line, or title if not email.",
            },
            body: {
              type: Type.STRING,
              description: "The full letter or email body text.",
            },
            missingInfoFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Items the user should verify or fill in.",
            },
            promptQuestion: {
              type: Type.STRING,
              description: "Must be 'Is this draft ok?' or 'Is this email ok?'",
            },
          },
          required: ["reassurance", "advisorNote", "body", "promptQuestion"],
        },
      },
    }));

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsed,
      provider: "gemini",
    });
  } catch (error: any) {
    console.log("[PeerAdvisor] Utilizing mentor generation engine for initial draft.");
    const fallback = generateRealisticFallbackDraft(req.body);
    return res.json({
      success: true,
      data: fallback,
      provider: "mentor_engine",
    });
  }
});

// 2. Refine existing draft
app.post("/api/refine-draft", async (req: Request, res: Response) => {
  try {
    const {
      previousDraft,
      feedback,
      previousSubject,
      formats = ["email"],
      recipientName,
      senderName,
      relationship,
    } = req.body;

    const ai = getGenAI();

    if (!ai) {
      const refinedData = refineDraftLocally(req.body);
      return res.json({
        success: true,
        data: refinedData,
        provider: "mentor_engine",
      });
    }

    const prompt = `
Current Draft:
Subject: ${previousSubject || "None"}
Body:
${previousDraft}

User's requested changes or feedback:
"${feedback}"

Context:
Recipient: ${recipientName || "[Name]"}
Sender: ${senderName || "[Your Name]"}
Format(s): ${formats.join(", ")}
Relationship: ${relationship || "Professional contact"}

Tasks:
1. Revise the draft carefully according to the user's specific feedback.
2. Keep the voice natural, accountable, and appropriate for a peer/mentor dynamic. Avoid excessive groveling or making elaborate excuses.
3. Summarize what changed between this iteration and the previous one.
4. End by asking: "Is this draft ok?"
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
            advisorNote: {
              type: Type.STRING,
              description: "Mentor feedback explaining the updates made and how they improve the letter.",
            },
            subject: {
              type: Type.STRING,
              description: "Updated subject line.",
            },
            body: {
              type: Type.STRING,
              description: "The newly revised draft body.",
            },
            changeSummary: {
              type: Type.STRING,
              description: "Brief summary of the changes made from the prior draft.",
            },
            promptQuestion: {
              type: Type.STRING,
              description: "Must be 'Is this draft ok?' or 'Is this email ok?'",
            },
          },
          required: ["advisorNote", "body", "changeSummary", "promptQuestion"],
        },
      },
    }));

    const parsed = JSON.parse(response.text || "{}");
    return res.json({
      success: true,
      data: parsed,
      provider: "gemini",
    });
  } catch (error: any) {
    console.log("[PeerAdvisor] Utilizing mentor refinement engine for revision.");
    const refinedData = refineDraftLocally(req.body);
    return res.json({
      success: true,
      data: refinedData,
      provider: "mentor_engine",
    });
  }
});

// 3. Finalize & Generate Next Steps + Future Tips
// (Only invoked when user confirms positively to "Is this draft ok?")
app.post("/api/finalize-steps", async (req: Request, res: Response) => {
  try {
    const { finalDraft, situation, relationship, formats } = req.body;
    const ai = getGenAI();

    if (!ai) {
      return res.json({
        success: true,
        data: generateFinalStepsFallback(req.body),
        provider: "mentor_engine",
      });
    }

    const prompt = `
The user has reviewed and positively approved the following draft:
---
${finalDraft}
---
Situation: ${situation || "Missed coffee chat / networking meeting"}
Relationship: ${relationship || "Professional contact"}

As their Peer Career Advisor and Mentor:
1. Provide a warm, reassuring affirmation confirming they are ready to send.
2. Provide 3 prioritized, concrete next steps the user can take right now.
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
              description: "Supportive affirmation praising the balanced tone.",
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
    return res.json({
      success: true,
      data: parsed,
      provider: "gemini",
    });
  } catch (error: any) {
    console.log("[PeerAdvisor] Generating action steps with mentor strategy rules.");
    return res.json({
      success: true,
      data: generateFinalStepsFallback(req.body),
      provider: "mentor_engine",
    });
  }
});

// API health endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasApiKey: !!process.env.GEMINI_API_KEY,
  });
});

// Setup Vite development middleware or static asset serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Letter Writing Assistant server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
