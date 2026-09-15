// Pure TypeScript fallback generation engine for Peer Career Advisor
// Safe for both client-side browser and server-side runtimes

export interface AdvisorContextParams {
  recipientName?: string;
  senderName?: string;
  relationship?: string;
  situation?: string;
  formats?: string[];
  timeline?: string;
  location?: string;
  reason?: string;
  userFeeling?: string;
  emotionalState?: string;
  tonePreference?: string;
  additionalContext?: string;
}

export function generateRealisticFallbackDraft(params: AdvisorContextParams) {
  const {
    recipientName = "",
    senderName = "",
    relationship = "mentor",
    situation = "missed_coffee_chat",
    formats = ["email"],
    reason = "",
    userFeeling = "",
    emotionalState = "moderately_nervous",
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

export function refineDraftLocally(params: any) {
  const {
    previousDraft = "",
    feedback = "",
    previousSubject = "Apologies for missing our coffee chat / Rescheduling",
    recipientName = "",
    senderName = "",
  } = params || {};

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

  // 4. Time proposals
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

export function generateFinalStepsFallback(params: any) {
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
