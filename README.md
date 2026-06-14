# AI Football Card Generator MVP

Aceasta este o soluție simplă pentru generarea cardurilor în template-ul stabilit:

1. **Auto generate** — userul scrie numele jucătorului și echipa.
2. **Upload photo** — userul încarcă o poză și completează datele cardului.

Aplicația are frontend + backend Node/Express. Backend-ul pregătește promptul și poate apela OpenAI Images API dacă este configurat `OPENAI_API_KEY`.

## Cum rulezi local

```bash
npm install
cp .env.example .env
npm start
```

Apoi deschizi:

```text
http://localhost:3000
```

## Mod mock

Dacă nu setezi `OPENAI_API_KEY`, aplicația rulează în mod mock:
- nu generează imagine AI;
- îți arată promptul complet care ar fi trimis la API.

## Configurare AI

În `.env`:

```env
OPENAI_API_KEY=your_api_key_here
OPENAI_IMAGE_MODEL=gpt-image-1
PORT=3000
```

## Endpoint-uri

### Build prompt

```http
POST /api/build-prompt
```

### Generate card from text

```http
POST /api/generate-card
```

### Generate card from uploaded photo

```http
POST /api/generate-card-with-photo
```

## Direcția vizuală

Promptul păstrează regulile stabilite:

- card vertical;
- rating + poziție sus stânga;
- portret pixel-art frontal;
- nume mare;
- steag pixelat;
- emblemă pixelată;
- statistici jos;
- fundal colorat după culorile echipei;
- fără fundal albastru default dacă echipa nu are albastru;
- fără negru ca temă principală dacă echipa nu are negru.
