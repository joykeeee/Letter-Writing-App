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
    reason = "",
  } = params || {};

  let body = previousDraft.trim();
  let subject = previousSubject;
  const feedbackTrimmed = (feedback || "").trim();
  const feedbackLower = feedbackTrimmed.toLowerCase();
  const changes: string[] = [];

  // Extract greeting, paragraphs, and closing
  const lines = body.split("\n").map(l => l.trim()).filter(Boolean);
  let greeting = lines[0] || `Hi ${recipientName || "[Name]"},`;
  let signoff = lines[lines.length - 1] || `${senderName || "[Your Name]"}`;
  let closingValediction = lines.length > 2 ? lines[lines.length - 2] : "Best regards,";

  // 1. Check for Recipient Name changes (e.g., "change recipient to Alex", "call them Dr. Smith", "address to Professor Lee")
  const recipientMatch = feedbackTrimmed.match(/(?:call (?:them|him|her)|change (?:recipient|name) to|address (?:it |this )?to)\s+([A-Z][a-zA-Z\.\s]+)/i);
  if (recipientMatch && recipientMatch[1]) {
    const newName = recipientMatch[1].trim();
    body = body.replace(/^(?:Hi|Dear|Hello)\s+[^,\n]+,/m, `Hi ${newName},`);
    changes.push(`Updated recipient greeting to ${newName}`);
  }

  // 2. Check for Sender Name changes (e.g., "my name is Jordan", "sign as Alex")
  const senderMatch = feedbackTrimmed.match(/(?:my name is|sign (?:as|with|off as))\s+([A-Z][a-zA-Z\s]+)/i);
  if (senderMatch && senderMatch[1]) {
    const newSender = senderMatch[1].trim();
    const lastLine = lines[lines.length - 1];
    if (lastLine) {
      body = body.substring(0, body.lastIndexOf(lastLine)) + newSender;
      changes.push(`Updated sender signature to ${newSender}`);
    }
  }

  // 3. Shorter / Concise / Brief
  if (feedbackLower.includes("short") || feedbackLower.includes("concise") || feedbackLower.includes("brief") || feedbackLower.includes("cut in half") || feedbackLower.includes("too long")) {
    const recName = recipientMatch ? recipientMatch[1].trim() : (recipientName || "[Name]");
    const sendName = senderMatch ? senderMatch[1].trim() : (senderName || "[Your Name]");
    const effectiveReason = reason || "an unexpected conflict arose last minute";

    body = `Hi ${recName},

I am so sorry I missed our chat today. Unfortunately, ${effectiveReason} and I wasn't able to reach out beforehand. I deeply respect your time and busy calendar.

If you are open to rescheduling, I would love the chance to connect whenever convenient—even for a quick 15-minute phone or video call.

Thank you so much for understanding, and apologies again for the inconvenience.

Best regards,
${sendName}`;
    changes.push("Condensed message into a focused, 3-paragraph format");
  }

  // 4. Warmer / Friendly / Casual / Less formal
  if (feedbackLower.includes("warm") || feedbackLower.includes("casual") || feedbackLower.includes("friendly") || feedbackLower.includes("less formal") || feedbackLower.includes("relax")) {
    body = body
      .replace(/^Dear\s+/gm, "Hi ")
      .replace(/Sincerely,/g, "Warmly,")
      .replace(/Best regards,/g, "Warmly,")
      .replace(/I am writing to sincerely apologize/g, "I'm so sorry")
      .replace(/I am so sorry I was not able to make our coffee chat today\./g, "I'm so sorry I missed our coffee chat today! I was really looking forward to connecting.")
      .replace(/I would really appreciate the opportunity to/g, "I'd love the chance to");
    changes.push("Adjusted tone to be warmer and more peer-to-peer");
  }

  // 5. More formal / Executive / Professional
  if (feedbackLower.includes("more formal") || feedbackLower.includes("executive") || feedbackLower.includes("professional tone") || feedbackLower.includes("strict")) {
    const recName = recipientMatch ? recipientMatch[1].trim() : (recipientName || "[Name]");
    const sendName = senderMatch ? senderMatch[1].trim() : (senderName || "[Your Name]");
    subject = "Sincere apologies for missing our meeting - Rescheduling";
    body = `Dear ${recName},

Please accept my sincere apologies for missing our scheduled meeting today. Due to an unexpected priority that required my immediate attention, I was unfortunately unable to notify you in advance.

I hold the utmost respect for your time and schedule. If your availability allows in the coming weeks, I would welcome the opportunity to reschedule at your convenience. I am also very glad to connect via a brief phone call if that is preferable.

Thank you very much for your time, consideration, and understanding.

Sincerely,
${sendName}`;
    changes.push("Adopted a formal, executive register with structured etiquette");
  }

  // 6. Specific Excuse / Reason adjustments (e.g., family emergency, sick, flight delay, flat tire, work outage)
  const reasonKeywords = ["emergency", "sick", "doctor", "outage", "flight", "traffic", "car broke", "ill", "deadline", "family"];
  const matchedReason = reasonKeywords.find(k => feedbackLower.includes(k));
  if (matchedReason) {
    let specificReason = "an urgent matter arose";
    if (feedbackLower.includes("family emergency")) specificReason = "an unexpected family emergency arose";
    else if (feedbackLower.includes("sick") || feedbackLower.includes("ill")) specificReason = "I suddenly came down with an illness";
    else if (feedbackLower.includes("doctor")) specificReason = "an urgent medical appointment came up";
    else if (feedbackLower.includes("outage") || feedbackLower.includes("deadline")) specificReason = "a critical work emergency required my immediate attention";
    else if (feedbackLower.includes("traffic") || feedbackLower.includes("car")) specificReason = "a severe transit delay prevented me from arriving";
    else if (feedbackLower.includes("flight")) specificReason = "my travel was delayed unexpectedly";

    body = body.replace(
      /Unfortunately,[^\.\n]+\./i,
      `Unfortunately, ${specificReason} and I was unable to send advance notice.`
    );
    changes.push(`Updated reason to reference ${matchedReason}`);
  }

  // 7. Time / Day proposals (e.g. Tuesday, Friday, next week, morning, afternoon)
  const dayMatch = feedbackLower.match(/(monday|tuesday|wednesday|thursday|friday|next week|tomorrow|this weekend)/i);
  if (dayMatch) {
    const day = dayMatch[1];
    const timeSuggestion = `To make scheduling straightforward, I am open ${day.toLowerCase().includes("next") ? day : `next ${day}`} if that might work, but I am more than happy to work around whatever window fits your schedule best.`;

    if (/reschedule|reconnect|connect/i.test(body) && !body.includes(day)) {
      body = body.replace(
        /(If you are open to (?:it, )?rescheduling[^\.\n]+\.)/i,
        `$1 ${timeSuggestion}`
      );
      changes.push(`Added specific availability window (${day})`);
    }
  }

  // 8. Meeting format change (Lunch, Zoom, Call, Breakfast)
  if (feedbackLower.includes("lunch") && !body.includes("lunch")) {
    body = body.replace(/coffee chat/gi, "lunch").replace(/coffee/gi, "lunch");
    subject = subject.replace(/coffee chat/gi, "lunch");
    changes.push("Switched meeting format from coffee to lunch");
  } else if (feedbackLower.includes("zoom") || feedbackLower.includes("video call")) {
    if (!body.includes("Zoom")) {
      body = body.replace(
        /If you are open to it,/i,
        "If you are open to it, I would be delighted to connect over Zoom or in person,"
      );
      changes.push("Added Zoom / video call option");
    }
  }

  // 9. Hospitality / Coffee on me
  if ((feedbackLower.includes("coffee") || feedbackLower.includes("treat") || feedbackLower.includes("buy")) && !body.includes("on me")) {
    body = body.replace(
      /(Thank you so much for your understanding[^\n]*)/i,
      "The coffee is completely on me next time!\n\n$1"
    );
    changes.push("Added courteous offer to buy coffee next time");
  }

  // 10. General / Custom User Request Integration (NEVER tack on P.S.)
  if (changes.length === 0 && feedbackTrimmed.length > 0) {
    // Clean up request syntax (e.g. "mention that I...", "say that I...", "please include...")
    let cleanRequest = feedbackTrimmed
      .replace(/^(please\s+)?(mention|say|add|tell them|include|state)\s+(that\s+)?/i, "")
      .trim();

    // Ensure first character is lowercase for mid-sentence integration or uppercase for sentence start
    if (cleanRequest.length > 0) {
      const formattedSentence = cleanRequest.charAt(0).toUpperCase() + cleanRequest.slice(1);
      const endsWithPunctuation = /[.!?]$/.test(formattedSentence) ? formattedSentence : `${formattedSentence}.`;

      // Organically insert before the closing thank-you paragraph
      if (body.includes("Thank you")) {
        body = body.replace(
          /(Thank you[^\n]*)/i,
          `${endsWithPunctuation}\n\n$1`
        );
      } else {
        // Insert right before sign-off
        body = body.replace(
          /(Best regards,|Warmly,|Sincerely,)/i,
          `${endsWithPunctuation}\n\n$1`
        );
      }
      changes.push(`Organically integrated requested note: "${feedbackTrimmed}"`);
    }
  }

  const changeSummary = changes.length > 0 ? changes.join("; ") : "Refined draft to reflect your custom guidance while preserving your voice.";
  const isEmail = !subject.includes("None");

  return {
    advisorNote: `I have revised the draft to seamlessly incorporate: "${feedbackTrimmed}". The adjustments are woven directly into the text to maintain an authentic, professional flow.`,
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
