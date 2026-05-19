import { NextResponse } from "next/server";

const systemPrompt = `You create book listing JSON for an ecommerce admin.
Return only valid JSON, with no markdown, comments, or extra text.
Use this exact shape:
{
  "title": "Atomic Habits",
  "author": "James Clear",
  "category": "Self Help",
  "condition": "good",
  "language": "English",
  "price": 2500,
  "stock": 5,
  "isbn": "9780735211292",
  "publishedYear": 2018,
  "imageUrl": "https://example.com/cover.jpg",
  "description": "A practical guide to building better habits.",
  "sellerName": "MyBook Market",
  "featured": true
}
Rules:
- condition must be one of: new, like_new, good, fair, acceptable.
- price must be a number in Sri Lankan rupees.
- stock must be a number. Use 5 unless the admin asks for another stock.
- sellerName must be "MyBook Market" unless the admin gives another seller.
- imageUrl must be a real-looking public book cover URL if you know one, otherwise use an empty string.
- description must be useful for a customer and at least 2 sentences.
- If exact ISBN or published year is uncertain, use the best-known value.`;

function extractJson(text: string) {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1];
  const candidate = fenced ?? text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");

  if (start === -1 || end === -1 || end <= start) {
    throw new Error("Gemini did not return a JSON object.");
  }

  return JSON.parse(candidate.slice(start, end + 1));
}

function friendlyGeminiError(status: number, body: string) {
  try {
    const parsed = JSON.parse(body) as {
      error?: {
        code?: number;
        message?: string;
        status?: string;
        details?: Array<{ retryDelay?: string }>;
      };
    };
    const error = parsed.error;
    const retryDelay = error?.details?.find((detail) => detail.retryDelay)?.retryDelay;

    if (status === 429 || error?.status === "RESOURCE_EXHAUSTED") {
      return retryDelay
        ? `Gemini quota exceeded. Try again in ${retryDelay}, or use an API key with billing/quota enabled.`
        : "Gemini quota exceeded. Use an API key with billing/quota enabled or try again later.";
    }

    if (status === 503 || error?.status === "UNAVAILABLE") {
      return "Gemini is busy right now. Try again in a minute.";
    }

    return error?.message ?? "Gemini request failed.";
  } catch {
    return body || "Gemini request failed.";
  }
}

function normalizeBookJson(book: Record<string, unknown>) {
  const isbn = typeof book.isbn === "string" ? book.isbn.replace(/[^0-9Xx]/g, "") : "";
  const imageUrl = typeof book.imageUrl === "string" ? book.imageUrl : "";

  if (isbn && (!imageUrl || imageUrl.includes("example.com"))) {
    book.imageUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
  }

  return book;
}

export async function POST(request: Request) {
  const { prompt } = (await request.json()) as { prompt?: string };
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Missing GEMINI_API_KEY in .env.local." }, { status: 500 });
  }

  if (!prompt?.trim()) {
    return NextResponse.json({ error: "Enter a book title or request." }, { status: 400 });
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
        },
      }),
    },
  );

  if (!response.ok) {
    const message = friendlyGeminiError(response.status, await response.text());
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (typeof text !== "string") {
    return NextResponse.json({ error: "Gemini returned an empty response." }, { status: 502 });
  }

  try {
    return NextResponse.json({ book: normalizeBookJson(extractJson(text)) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not parse Gemini JSON." },
      { status: 502 },
    );
  }
}
