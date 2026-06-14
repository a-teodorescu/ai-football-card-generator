import OpenAI from "openai";
import { buildPrompt, jsonResponse, parseJsonBody } from "./_prompt.js";

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return jsonResponse({});
  if (event.httpMethod !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const body = parseJsonBody(event);
  const prompt = buildPrompt(body);

  if (!process.env.OPENAI_API_KEY) {
    return jsonResponse({
      mock: true,
      prompt,
      message: "OPENAI_API_KEY nu este setat în Netlify Environment Variables. Promptul este generat, dar imaginea AI nu a fost creată."
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const result = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt,
      size: "1024x1536"
    });

    const image = result.data && result.data[0];

    return jsonResponse({
      mock: false,
      imageBase64: image && image.b64_json ? image.b64_json : null,
      revisedPrompt: image && image.revised_prompt ? image.revised_prompt : null
    });
  } catch (error) {
    console.error(error);
    return jsonResponse({
      error: "Card generation failed",
      details: error.message
    }, 500);
  }
}
