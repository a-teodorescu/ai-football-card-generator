import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { buildPhotoPrompt, jsonResponse, parseJsonBody } from "./_prompt.js";

function parseDataUrl(dataUrl) {
  const match = /^data:(.+);base64,(.+)$/.exec(dataUrl || "");
  if (!match) throw new Error("Invalid image data URL");

  return {
    mime: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
}

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") return jsonResponse({});
  if (event.httpMethod !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const body = parseJsonBody(event);
  const { imageDataUrl, ...fields } = body;
  const prompt = buildPhotoPrompt(fields);

  if (!imageDataUrl) {
    return jsonResponse({ error: "Missing uploaded image" }, 400);
  }

  if (!process.env.OPENAI_API_KEY) {
    return jsonResponse({
      mock: true,
      prompt,
      message: "OPENAI_API_KEY nu este setat în Netlify Environment Variables. Promptul pentru poza încărcată este generat, dar imaginea AI nu a fost creată."
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const { mime, buffer } = parseDataUrl(imageDataUrl);
    const extension = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";

    const imageFile = await toFile(buffer, `uploaded-player.${extension}`, { type: mime });

    const result = await client.images.edit({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      image: imageFile,
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
      error: "Photo card generation failed",
      details: error.message
    }, 500);
  }
}
