# AI Football Card Generator — Netlify Fixed Root Version

Aceasta este versiunea corectată ca să evite 404 pe Netlify.

## Ce s-a schimbat

- `index.html`, `styles.css`, `app.js` sunt direct în root.
- `netlify.toml` are `publish = "."`.
- Redirect-ul `/* -> /index.html` este inclus.
- Netlify Functions rămân în `netlify/functions`.

## Deploy recomandat

1. Dezarhivează proiectul.
2. Pune conținutul folderului pe GitHub.
3. În Netlify: Add new site -> Import an existing project.
4. Build command: `npm run build`
5. Publish directory: `.`
6. Functions directory: `netlify/functions`
7. Environment Variables:
   - `OPENAI_API_KEY`
   - opțional `OPENAI_IMAGE_MODEL=gpt-image-1`
8. Deploy.

## Verificare rapidă

După deploy, deschide URL-ul principal al site-ului, de forma:

`https://numele-siteului.netlify.app/`

Nu deschide linkuri interne de deploy sau path-uri inexistente.
