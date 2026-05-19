"use client";

import { useState } from "react";
import { Sparkles, WandSparkles } from "lucide-react";

const fieldAliases: Record<string, string[]> = {
  title: ["title", "book_title", "name"],
  author: ["author", "authors", "writer"],
  category: ["category", "genre"],
  condition: ["condition", "book_condition"],
  language: ["language"],
  sellerName: ["sellerName", "seller_name", "seller", "sellerName"],
  price: ["price", "amount", "selling_price"],
  stock: ["stock", "quantity", "qty", "available_stock"],
  isbn: ["isbn", "isbn10", "isbn13"],
  publishedYear: ["publishedYear", "published_year", "year", "publication_year"],
  imageUrl: ["imageUrl", "image_url", "cover", "cover_url", "thumbnail", "thumbnail_url"],
  description: ["description", "summary", "details", "synopsis"],
};

const conditionMap: Record<string, string> = {
  new: "new",
  "like new": "like_new",
  like_new: "like_new",
  good: "good",
  fair: "fair",
  acceptable: "acceptable",
  used: "good",
};

function readJsonValue(data: Record<string, unknown>, aliases: string[]) {
  for (const alias of aliases) {
    const value = data[alias];
    if (Array.isArray(value)) return value.filter(Boolean).join(", ");
    if (typeof value === "string" || typeof value === "number") return String(value);
    if (typeof value === "boolean") return value ? "true" : "false";
  }

  return "";
}

function setField(form: HTMLFormElement, name: string, value: string) {
  if (!value) return;

  const field = form.elements.namedItem(name);
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement)) {
    return;
  }

  field.value = name === "condition" ? conditionMap[value.toLowerCase()] ?? value : value;
  field.dispatchEvent(new Event("input", { bubbles: true }));
  field.dispatchEvent(new Event("change", { bubbles: true }));
}

export function BookJsonAutofill() {
  const [jsonText, setJsonText] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  function fillBookFieldsFromText(form: HTMLFormElement, text: string) {
    if (!form) return;

    try {
      const parsed = JSON.parse(text) as Record<string, unknown>;
      const data = Array.isArray(parsed) ? parsed[0] : parsed;

      if (!data || typeof data !== "object") {
        setMessage("Paste one book JSON object.");
        return;
      }

      for (const [fieldName, aliases] of Object.entries(fieldAliases)) {
        setField(form, fieldName, readJsonValue(data as Record<string, unknown>, aliases));
      }

      const featured = (data as Record<string, unknown>).featured;
      const featuredField = form.elements.namedItem("featured");
      if (featuredField instanceof HTMLInputElement && typeof featured === "boolean") {
        featuredField.checked = featured;
      }

      setMessage("Book details filled.");
    } catch {
      setMessage("Invalid JSON. Check commas and quotes.");
    }
  }

  function fillBookFields(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.closest("form");
    if (!form) return;
    fillBookFieldsFromText(form, jsonText);
  }

  async function generateBookJson(event: React.MouseEvent<HTMLButtonElement>) {
    const form = event.currentTarget.closest("form");
    if (!form) return;

    setIsGenerating(true);
    setMessage("Generating book JSON...");

    try {
      const response = await fetch("/api/book-json", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      });
      const data = (await response.json()) as { book?: unknown; error?: string };

      if (!response.ok || !data.book) {
        setMessage(data.error ?? "AI generation failed.");
        return;
      }

      const nextJson = JSON.stringify(data.book, null, 2);
      setJsonText(nextJson);
      fillBookFieldsFromText(form, nextJson);
    } catch {
      setMessage("Could not reach the AI helper.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="json-autofill wide">
      <div className="ai-book-row">
        <input
          className="field"
          value={aiPrompt}
          onChange={(event) => setAiPrompt(event.target.value)}
          placeholder='Ask AI, for example "Think and Grow Rich by Napoleon Hill"'
        />
        <button className="button-primary" type="button" onClick={generateBookJson} disabled={isGenerating}>
          <Sparkles size={16} />
          {isGenerating ? "Generating..." : "Generate with AI"}
        </button>
      </div>
      <textarea
        className="field textarea"
        value={jsonText}
        onChange={(event) => setJsonText(event.target.value)}
        placeholder='Paste AI book JSON here, for example {"title":"Atomic Habits","author":"James Clear","price":2500}'
      />
      <div className="json-actions">
        <button className="button-secondary" type="button" onClick={fillBookFields}>
          <WandSparkles size={16} />
          Fill from JSON
        </button>
        {message && <p className="subtle">{message}</p>}
      </div>
    </div>
  );
}
