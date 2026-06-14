import { buildPrompt, jsonResponse, parseJsonBody } from "./_prompt.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return jsonResponse({});
  if (event.httpMethod !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const body = parseJsonBody(event);
  return jsonResponse({ prompt: buildPrompt(body) });
}
