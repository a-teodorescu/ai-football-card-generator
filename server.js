import "dotenv/config";
import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const upload = multer({ dest: path.join(__dirname, "uploads") });

app.use(express.json({ limit: "2mb" }));
app.use(express.static(path.join(__dirname, "public")));

const client = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

const PORT = process.env.PORT || 3000;

function safeText(value, fallback = "") {
  return String(value || fallback).trim();
}

function buildPrompt({
  playerName,
  clubName,
  nationality,
  position,
  rating,
  pace,
  shooting,
  passing,
  dribbling,
  defending,
  physical,
  clubColors,
  extraNotes
}) {
  const colors = safeText(clubColors, "use the football club's dominant colors based on the club identity");
  const notes = safeText(extraNotes, "");

  return `
Create a vertical football player card in modern pixel-art style.

Use this exact card layout:
- vertical trading card, rounded pixel border;
- rating and position in the top-left corner;
- large frontal head-and-shoulders pixel-art portrait;
- player name in a large bold pixel font on the middle/lower band;
- national flag on the lower-left, heavily pixelated;
- club name centered under the player name;
- club crest/logo on the lower-right, heavily pixelated;
- six stats at the bottom: PAC, SHO, PAS, DRI, DEF, PHY;
- clean sports/gaming design, not fantasy, not retro fantasy.

Visual style:
- medium 16-bit pixel-art portrait, similar to a modern football game card;
- player facing forward, looking directly at viewer;
- black pixel outline;
- visible pixels, but premium and clean;
- no 3/4 side profile;
- no realistic photo look;
- no default blue background unless the club colors include blue.

Team color rule:
- The card background must use the dominant club colors: ${colors}.
- Do not use black as the main background unless it is part of the club identity.
- Black may be used only for contrast, shadows, and separators.

Player data:
- Player name: ${safeText(playerName, "Unknown Player")}
- Club: ${safeText(clubName, "Unknown Club")}
- Nationality: ${safeText(nationality, "infer from player if known")}
- Position: ${safeText(position, "RW")}
- Rating: ${safeText(rating, "82")}
- PAC ${safeText(pace, "84")}
- SHO ${safeText(shooting, "77")}
- PAS ${safeText(passing, "82")}
- DRI ${safeText(dribbling, "86")}
- DEF ${safeText(defending, "46")}
- PHY ${safeText(physical, "65")}

Text on card must be clean and legible:
- Use the player name exactly.
- Use the club name exactly.
- Use correct Romanian diacritics if they are provided.

${notes ? `Extra instructions: ${notes}` : ""}
`.trim();
}

function buildPhotoPrompt(fields) {
  return `
Transform the uploaded player photo into the established football card template.

Keep the identity from the uploaded photo, but render the player as:
- frontal medium 16-bit pixel-art portrait;
- head and shoulders;
- clean black pixel outline;
- premium sports card look;
- not realistic photo, not cartoonish, not fantasy.

Then place it inside this exact football card layout:
- rating and position top-left;
- large player portrait;
- player name in bold pixel font;
- national flag heavily pixelated;
- club name;
- club crest heavily pixelated;
- six stats at the bottom.

Use these player/card details:
${buildPrompt(fields)}
`.trim();
}

async function generateImage(prompt) {
  if (!client) {
    return {
      mock: true,
      prompt,
      message: "OPENAI_API_KEY lipsește. UI-ul a generat promptul, dar imaginea AI nu a fost generată."
    };
  }

  const result = await client.images.generate({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    prompt,
    size: "1024x1536"
  });

  const image = result.data?.[0];
  return {
    mock: false,
    imageBase64: image?.b64_json || null,
    revisedPrompt: image?.revised_prompt || null
  };
}

async function editImageWithPhoto(prompt, filePath) {
  if (!client) {
    return {
      mock: true,
      prompt,
      message: "OPENAI_API_KEY lipsește. UI-ul a generat promptul pentru poza încărcată, dar imaginea AI nu a fost generată."
    };
  }

  const result = await client.images.edit({
    model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
    image: fs.createReadStream(filePath),
    prompt,
    size: "1024x1536"
  });

  const image = result.data?.[0];
  return {
    mock: false,
    imageBase64: image?.b64_json || null,
    revisedPrompt: image?.revised_prompt || null
  };
}

app.post("/api/build-prompt", (req, res) => {
  const prompt = buildPrompt(req.body || {});
  res.json({ prompt });
});

app.post("/api/generate-card", async (req, res) => {
  try {
    const prompt = buildPrompt(req.body || {});
    const output = await generateImage(prompt);
    res.json(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Card generation failed",
      details: error.message
    });
  }
});

app.post("/api/generate-card-with-photo", upload.single("photo"), async (req, res) => {
  let filePath = req.file?.path;

  try {
    const fields = req.body || {};
    const prompt = buildPhotoPrompt(fields);

    if (!filePath) {
      return res.status(400).json({ error: "No photo uploaded" });
    }

    const output = await editImageWithPhoto(prompt, filePath);
    res.json(output);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Photo card generation failed",
      details: error.message
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
});

app.listen(PORT, () => {
  console.log(`AI Football Card Generator running on http://localhost:${PORT}`);
  if (!process.env.OPENAI_API_KEY) {
    console.log("OPENAI_API_KEY is not set. App will run in prompt/mock mode.");
  }
});
