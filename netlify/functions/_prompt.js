function safeText(value, fallback = "") {
  return String(value || fallback).trim();
}

export function buildPrompt(fields = {}) {
  const {
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
  } = fields;

  const colors = safeText(
    clubColors,
    "use the football club's dominant colors based on the club identity"
  );

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
- Use correct diacritics if they are provided.

${notes ? `Extra instructions: ${notes}` : ""}
`.trim();
}

export function buildPhotoPrompt(fields = {}) {
  return `
Transform the uploaded player photo into the established football card template.

Keep the identity from the uploaded photo, but render the player as:
- frontal medium 16-bit pixel-art portrait;
- head and shoulders;
- clean black pixel outline;
- premium sports card look;
- not realistic photo, not cartoonish, not fantasy.

Then place it inside the exact football card layout described below.

${buildPrompt(fields)}
`.trim();
}

export function jsonResponse(body, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS"
    },
    body: JSON.stringify(body)
  };
}

export function parseJsonBody(event) {
  if (!event.body) return {};
  try {
    return JSON.parse(event.body);
  } catch {
    return {};
  }
}
