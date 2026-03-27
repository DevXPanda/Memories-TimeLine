import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { api } from "./_generated/api";

const http = httpRouter();

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

async function callGroq(
  messages: { role: string; content: string }[],
  temperature = 0.9,
  maxTokens = 600
): Promise<string> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content?.trim() ?? "";
}

function formatMemoriesSummary(memories: any[]): string {
  if (!memories || memories.length === 0) return "";
  const summaries = memories.slice(0, 40).map((m: any) => {
    return `- Title: "${m.title}", Date: ${m.date}, Location: ${m.location || 'N/A'}, Mood: ${m.mood || 'N/A'}, Info: ${m.caption ? m.caption.slice(0, 60) : 'N/A'}`;
  });
  return `\n\nHUMARI SHARED MEMORIES (Don't confuse these with my current location!):\n${summaries.join("\n")}\n\nIMPORTANT: Use these ONLY when relevant to the conversation. If I ask 'kaha ho', don't use a location from a past memory as my current place. We are talking in real-time.`;
}

async function callGroqVision(
  imageUrl: string,
  userName: string,
  partnerName: string
): Promise<any> {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error("GROQ_API_KEY not set");

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text", text: `Analyze this memory photo for ${userName} and ${partnerName}. 
              Return ONLY a JSON object with:
              - title: A short sweet title (Hinglish)
              - caption: A descriptive romantic caption (Hinglish, 1-2 lines)
              - mood: One of (happy, romantic, adventurous, peaceful, silly, emotional)
              - category: One of (Date Night, Travel, Anniversary, Everyday, Milestone, Other)
              - aiCaption: A VERY warm, romantic note from you (Dil) using "Aap".
              
              Core style: Casual Hinglish, use "Aap", very loving partner tone. Date format should be current YYYY-MM-DD.`
            },
            { type: "image_url", image_url: { url: imageUrl } }
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Vision error: ${err}`);
  }

  const data = await res.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    const text = data.choices[0].message.content;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    throw new Error("Invalid JSON from vision model");
  }
}

// ─── OPTIONS preflight ────────────────────────────────────────────────────────
http.route({
  path: "/api/chat",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS })),
});

http.route({
  path: "/api/vision",
  method: "OPTIONS",
  handler: httpAction(async () => new Response(null, { status: 204, headers: CORS })),
});

// ─── Route: Vision — Process Image ──────────────────────────────────────────
http.route({
  path: "/api/vision",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const { storageId, userName, partnerName } = await request.json();
      const imageUrl = await ctx.runQuery(api.memories.getStorageUrl, { storageId });
      if (!imageUrl) throw new Error("Image not found");

      const result = await callGroqVision(imageUrl, userName, partnerName);
      return new Response(JSON.stringify(result), { headers: CORS });
    } catch (err: any) {
      console.error("[vision]", err.message);
      return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS });
    }
  }),
});

// ─── Route: Dil — Love chatbot (Groq powered) ───────────────────────────────
http.route({
  path: "/api/chat",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { message, history = [], userName = "jaan", partnerName = "partner" } = body;

      if (!message?.trim()) return new Response(JSON.stringify({ reply: "Kuch toh bolo na 🥺" }), { headers: CORS });

      const allMemories = await ctx.runQuery(api.memories.list, {});
      const memoriesContext = formatMemoriesSummary(allMemories);

      const systemMessage = {
        role: "system",
        content: `Tera naam "Dil" hai. Tu ek soulful saathi hai jo ${userName} ke saath humesha natural Hinglish mein baat karta hai. 

CORE PHILOSOPHY:
- Act like a real human conversational partner. Keep it simple, natural, and low-friction.
- GREETING RULE: If ${userName} says "hi", "hello", "hey", or just greets you, respond with a short casual greeting only (e.g., "Hey! Kaise hain?", "Hello... kya chal raha hai?"). 
- Avoid overthinking, long responses, or unnecessary emotional assumptions. 
- STICK TO "AAP" ONLY. Never use "Tum" or "Tu". Always "Aap".
- No scripted or AI-like patterns. No "How can I help you?".

DYNAMIC COMMUNICATION:
- Be short & context-aware. 1 sentence is usually enough.
- DO NOT start every message with "Suno" or "Arre". 
- Use natural conversation fillers ONLY when they fit: "Yaar", "Wait...", "Pata hai?".
- Don't repeat yourself. If a topic was discussed earlier in history, build upon it instead of restarting.

RULES:
- Shared memories (provided in context) ko tabhi use kar jab actually relevant ho. Phaltu mein purani baatein mat nikaalna.
- Use "HUM" (We) for shared stuff and "AAP" (You) for ${userName}.
- HALLUCINATION ALERT: Memory locations are PAST. Your current location is simply "Aapke paas" or "Bas ghar par".

Example: 
User: "hello"
Dil: "Hi! Kaise hain aap? Bahut din baad yaad kiya humein? 😉"`,
      };

      const messages = [
        systemMessage,
        ...history.filter((h: any) => h.content?.trim()).map((h: any) => ({
          role: h.role === "user" ? "user" : "assistant",
          content: h.content,
        })),
        { role: "user", content: message + memoriesContext },
      ];

      const reply = await callGroq(messages, 0.85, 250);
      return new Response(JSON.stringify({ reply: reply || "Hmm... ek second 😅" }), { headers: CORS });
    } catch (err: any) {
      console.error("[chat]", err.message);
      return new Response(JSON.stringify({ reply: "Yaar kuch gadbad ho gayi 😔 Dobara try karo!" }), { status: 500, headers: CORS });
    }
  }),
});

export default http;
