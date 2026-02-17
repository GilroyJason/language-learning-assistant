# Language Learning Assistant

Local-first podcast dictation tool for German and English.  
It fetches audio via gPodder, generates subtitles with Whisper, splits into sentence practice sets, and delivers a Spotify‑style UI for study and review.

**Status:** Active • **Platform:** Windows (primary) • **Mode:** Local-only • **License:** MIT

---

## Highlights
- Podcast-based dictation with sentence-level audio playback
- Auto pipeline: gPodder → Whisper → practice sets
- Language isolation (DE/EN) with manual source mapping
- Favorites-based review mode
- Local storage only, no cloud

## Features
- Podcast-based dictation practice with sentence segmentation
- Practice set selector by source and language
- Favorites-based review mode
- Local-only workflow (no cloud)
- German and English modes (data isolated)

## Requirements
- Node.js 18+
- Python 3.10+ (Whisper)
- gPodder (Windows)
- FFmpeg (Windows)

## Quick Start
1. Install dependencies:
   - `npm install`
2. Start backend:
   - `npm run server`
3. Start frontend:
   - `npm run dev`
4. Open:
   - `http://localhost:3000`

## Workflow (Subscribe → Download → Practice)
1. Subscribe RSS in gPodder (per language).
   - Use the app “订阅RSS” button in Tools.
2. Update practice sets.
   - Use “更新题库” in Tools.
3. Practice:
   - Start Learning → choose source → practice.

## Language Isolation
Language is determined by `practice-sets/.language-map.json`.
Example:
```json
{
  "default": "de",
  "Langsam Gesprochene Nachrichten _ Audios _ DW Deutsch lernen": "de",
  "logo!-Nachrichten (AUDIO)": "de",
  "Easy English": "en"
}
```

If a new podcast is added and not in the map, generation fails until you manually categorize it in the UI:
- Home -> Tools -> 管理音源 -> set language -> 保存设置

## Local Data and Privacy
- Local-only by design. No cloud storage.
- Practice sets are generated on your machine.
- User state stored in `practice-sets/.state.json`.

## Agent Support (for Codex/AI Assistants)
This repo includes `AGENTS.md` with strict rules for safe edits.  
If you are using an AI agent:
1. Read `AGENTS.md` first.
2. Do not modify `vite.config.js`, `tailwind.config.js`, or `.env` unless explicitly requested.
3. Keep changes inside `src/` or the known scripts.
4. Avoid deleting user data or `practice-sets/`.
5. Prefer local, non-destructive operations.

## Scripts
These are invoked by the frontend Tools card:
- `auto-daily-de.bat` (German update)
- `auto-daily-en.bat` (English update)
- `subscribe-german.bat`
- `subscribe-english.bat`

## Data Storage
- Practice sets: `practice-sets/`
- User state: `practice-sets/.state.json`
- Language map: `practice-sets/.language-map.json`

## .gitignore Notes (Why GitHub has fewer folders)
The repository excludes local data to keep it clean and portable:
- `practice-sets/` (generated content)
- `downloads/` and gPodder downloads
- `node_modules/`, `dist/`

These are regenerated locally and **not required** for running the project.

## Troubleshooting
- gPodder database locked:
  - Close gPodder and retry update.
- Unknown sources in list:
  - Use Home -> 管理音源 -> map unknown source to a real gPodder source.

## Open Source and Takedown
This project is open-source for learning and personal use.  
If any content is believed to be infringing, please open an issue or contact the maintainer for prompt removal.

## Notes
- This project is local-only by design.
- Practice sets are generated from downloaded audio and stored locally.
