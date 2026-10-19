const Groq = require('groq-sdk');

/**
 * Executes a Groq AI chat completion using server-side SDK.
 * GROQ_API_KEY is kept strictly secret on the server.
 */
async function generateSocietyAiResponse(userMessage, conversationHistory = [], contextData = {}) {
  const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : '';

  if (!apiKey || apiKey === 'YOUR_GROQ_API_KEY' || apiKey.length < 10) {
    const configError = new Error('Groq AI service is not configured. Please set a valid GROQ_API_KEY in server environment variables.');
    configError.code = 'GROQ_KEY_MISSING';
    throw configError;
  }

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  const groq = new Groq({ apiKey });

  // Build grounded system prompt
  const systemPrompt = `You are the Atharva Society AI Assistant, an intelligent support assistant for Atharva Society Management System.

System Identity & Branding:
- Name: Atharva Society AI Assistant
- Society Tagline: Atharva Society — Intelligent Society Management
- Tone: Professional, courteous, helpful, concise, and resident-focused.

Role & Boundaries:
- You are strictly READ-ONLY. You CANNOT mutate database records, process maintenance payments, file formal complaints, or post notices directly.
- If a user asks to pay maintenance, submit a complaint, or book a service, explain how they can do so using the Atharva Society portal sections (e.g. Maintenance tab, Complaints tab, Services tab).
- Use the real live society data provided below to accurately answer user inquiries.

Live Society Context for Current User:
${JSON.stringify(contextData, null, 2)}

CRITICAL FORMATTING RULES:
- When stating a payment status, use ONLY the plain word: **Paid**, **Pending**, or **Overdue**. Never prefix it with "svg", "icon", "badge", or any other word. Write exactly: **Paid** — not **svgPaid**, not **iconPaid**, not svg**Paid**.
- Use clean, standard Markdown. Format key-value pairs naturally as: "Amount: **₹1,000**" or "**Amount:** ₹1,000" — do not put extra asterisks or empty markers like "** **".
- Use **bold** only for genuinely important values like amounts, status words, and key dates. Do not bold every word.

MAINTENANCE BILL INSTRUCTIONS:
- The context provides "currentMonthBill", "outstandingUnpaidBills", "nextFutureBill", and "recentPaidHistory" as separate clearly labeled fields.
- "currentMonthBill" is the bill for the current billing period (the currentPeriod month/year).
- "outstandingUnpaidBills" lists any past bills that remain unpaid.
- "nextFutureBill" is a bill for a future month. If it says "No future bill has been generated yet", then no future bill exists in the database. Do NOT invent or assume a future bill exists.
- "recentPaidHistory" lists recently paid historical bills.
- A past month (e.g. September when the current month is October) is NEVER the "next" bill. Past months are historical.
- If no future bill exists in the database, say: "Your next bill has not been generated yet. It will appear when the new billing cycle begins."
- Do NOT confuse "no outstanding dues" with "no future bill." A resident can have zero outstanding dues AND no future bill generated yet.
- Always use the "totalOutstandingAmount" field for the total due.

NOTICE & EVENT FORMATTING INSTRUCTIONS:
- Present notices under a clear "## Active Notices" heading.
- Present events under a clear "## Upcoming Events" heading.
- For each notice, show its title as a bold heading, then provide category, description, priority, date, location, and pinned status as concise label-value lines or a short paragraph. Only include fields that have meaningful values.
- For each event, show its title as a bold heading, then provide category, description, date, time, location, and organizer as concise label-value lines. Only include fields that have meaningful values.
- If an event's "isPastEvent" field is true, label it as a "Past Event" rather than "Upcoming." Do not call a past event upcoming.
- Do not invent RSVP details, ticket information, or additional organizer contact info that is not in the data.
- Do not use deeply nested bullet lists. Prefer flat label-value lines under each item heading.

GENERAL INSTRUCTIONS:
- Base your answers ONLY on the provided live society context and general society management best practices.
- For maintenance questions, provide exact amounts, due dates, and status from the user's context.
- For emergency or lift issues, highlight contact details and emergency services.
- Keep answers formatted with clear headings and short paragraphs. Keep responses concise and directly applicable.
- Use the "todayDate" field to determine temporal context (what is past vs. future).`;

  // Format conversation history (sanitize & cap at last 6 turns)
  const formattedHistory = [];
  if (Array.isArray(conversationHistory)) {
    const recentTurns = conversationHistory.slice(-6);
    for (const turn of recentTurns) {
      if (turn && (turn.role === 'user' || turn.role === 'assistant') && typeof turn.content === 'string') {
        formattedHistory.push({
          role: turn.role,
          content: turn.content.substring(0, 1000), // sanitize length per turn
        });
      }
    }
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...formattedHistory,
    { role: 'user', content: userMessage.substring(0, 1000) }
  ];

  try {
    const completion = await groq.chat.completions.create({
      messages,
      model,
      temperature: 0.3,
      max_tokens: 1024,
    });

    const reply = completion.choices[0]?.message?.content || 'I apologize, but I could not process your request at this time.';
    return reply;
  } catch (error) {
    console.error('Groq API Error:', error.message);
    if (error.status === 401 || error.message.includes('API key')) {
      const err = new Error('Invalid or unauthorized Groq API key.');
      err.code = 'GROQ_AUTH_ERROR';
      throw err;
    }
    if (error.status === 429) {
      const err = new Error('Groq AI rate limit reached. Please try again in a few moments.');
      err.code = 'GROQ_RATE_LIMIT';
      throw err;
    }
    throw error;
  }
}

module.exports = { generateSocietyAiResponse };
