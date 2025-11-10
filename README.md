AIyrics

AIyrics is a small Next.js (App Router) application that helps you search for songs, fetch lyrics from multiple providers, and get concise AI-generated explanations of lyrics.

The app wires a few lightweight API routes that call public lyrics APIs and a Groq/OpenAI-compatible model to explain lyrics in a chosen language.

---

## Key features

- Search for songs (suggestions) using a third-party suggest API.
- Fetch song lyrics from multiple fallback endpoints.
- Ask an LLM to analyze and explain the meaning and tone of a lyric passage.
- Small client components (audio player, copy button, etc.) for a nicer UI.

## Tech stack

- Next.js (App Router)
- React 19
- Tailwind CSS
- OpenAI / Groq client (`openai` package used in the server routes)

## Project layout (important files)

- `app/page.js` — main UI entry (App Router).
- `app/api/search/route.js` — GET /api/search?query=...  (returns suggestions)
- `app/api/lyrics/route.js` — GET /api/lyrics?title=&artist=... (returns lyrics or 404)
- `app/api/explain/route.js` — POST /api/explain  (accepts { lyrics, country })
- `app/utils/fetch.js` — helper `fetchWithTimeoutAndRetry` used by routes to call remote APIs with timeout and retries.
- `app/utils/trimAi.js` — formats AI text output into JSX paragraphs.

## Environment variables

The app expects a Groq/OpenAI API key to be available to the explain endpoint. By convention this project uses:

- `GROQ_API_KEY` — used in `app/api/explain/route.js` as `process.env.GROQ_API_KEY`.

Note: I inferred this name from the server code; if you use OpenAI's official API instead, set the appropriate key and update the server code accordingly.

## Local development

Prerequisites: Node.js 18+ (Next requires a modern Node), npm or pnpm.

1. Install deps

```powershell
npm install
```

2. Add environment variables (for example, in a `.env.local` file):

```
GROQ_API_KEY=your_api_key_here
```

3. Run the dev server

```powershell
npm run dev
```

Open http://localhost:3000.

## API endpoint reference

All endpoints are implemented as Next.js Route Handlers under `app/api`.

- GET /api/search?query={query}
  - Description: Returns song suggestions from `https://api.lyrics.ovh/suggest/{query}` (proxied). Response payload: `{ suggestions: [...] }` where each item is the provider data.
  - Example (client fetch):

```js
const res = await fetch(`/api/search?query=${encodeURIComponent(q)}`);
const { suggestions } = await res.json();
```

- GET /api/lyrics?title={title}&artist={artist}
  - Description: Tries several public lyrics endpoints (lyrics.ovh, musixmatch/youtube proxy) and returns `{ lyrics: string }` on success. If no provider returns lyrics, it responds with 404 and `{ lyrics: "Lyrics not found." }`.
  - Example:

```js
const res = await fetch(`/api/lyrics?title=${encodeURIComponent(title)}&artist=${encodeURIComponent(artist)}`);
if (res.ok) {
  const { lyrics } = await res.json();
}
```

- POST /api/explain
  - Description: Sends a prompt to an LLM to analyze the provided `lyrics` and produce a short, paragraph-form explanation in a specified language/country name.
  - Body JSON: `{ "lyrics": "...", "country": "us" }` (the `country` value is mapped to a display name using Intl.DisplayNames).
  - Response: `{ output: "...ai generated text..." }` with status 200.
  - Implementation details: Uses the `openai` package configured with `GROQ_API_KEY` and calls a Groq/OpenAI-compatible model (`openai/gpt-oss-20b` in the current code).

## Helpers and behavior

- `fetchWithTimeoutAndRetry(url, options, timeout, retries)` is used to call external APIs with a timeout and a limited number of retries. If a provider times out or fails, the lyrics endpoint tries the next configured provider.
- `formatAiTextToJsx` (in `app/utils/trimAi.js`) converts AI text with paragraphs/line-breaks into React JSX paragraphs for rendering.

## Scripts

See `package.json` for scripts. Common commands:

```powershell
npm run dev    # run development server
npm run build  # build for production
npm run start  # start production server
npm run lint   # run linter
```

## Assumptions & notes

- The `explain` endpoint currently uses `GROQ_API_KEY` and a Groq-compatible base URL; if you want to use OpenAI's official API, update `app/api/explain/route.js` to use the desired connection and env var name.
- Public lyrics APIs are used; availability and rate limits may vary. The project already uses fallback endpoints to improve resilience.

## Contribution

If you'd like to contribute:

1. Fork the repo and create a feature branch.
2. Open a PR with a clear description of changes.

Small improvements to consider: add tests around the fetch helper, add a caching layer for lyrics, or expand the UI for browsing suggestions.

## License

This repository does not include a license file. Add a license if you plan to publish or accept contributions.