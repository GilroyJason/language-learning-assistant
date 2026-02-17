# Language Learning Assistant

Local‑first podcast dictation for German and English.  
Fetch audio with gPodder, generate subtitles with Whisper, split into sentence‑level practice sets, and study in a Spotify‑style UI.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![Platform](https://img.shields.io/badge/Platform-Windows-1f6feb)
![Mode](https://img.shields.io/badge/Mode-Local--only-111111)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)

---

## Table of Contents
- Overview
- Key Links
- Highlights
- Features
- Architecture
- Requirements
- Quick Start
- Workflow (Subscribe → Download → Practice)
- Language Isolation & Source Mapping
- Known Issues & Workarounds
- Faster ASR Options
- Scripts
- Repo Layout
- Docs
- Data & Privacy
- Repository Notes
- Agent Support
- License
- Open Source & Takedown

---

## Overview
This project turns podcasts into sentence‑level dictation exercises. It is **local‑only** and runs entirely on your machine.

## Key Links
| Topic | Location |
| --- | --- |
| Quick Start | `docs/guides/QUICKSTART.md` |
| User Guide | `docs/guides/USER_GUIDE.md` |
| Integration | `docs/guides/INTEGRATION-GUIDE.md` |
| Architecture & Reports | `docs/reports/` |

## Highlights
- Podcast → subtitle → sentence practice pipeline
- German + English modes with strict data isolation
- Sentence‑level audio playback and answer reveal shortcuts
- Favorites‑based review mode

## Features
- Practice set selector by source and language
- Sentence builder (listen → type → verify)
- Favorites‑based review
- Local storage and privacy‑first design

## Architecture
```
[gPodder RSS] → [Audio Download] → [Whisper Subtitles]
                        ↓
               [Sentence Practice Sets]
                        ↓
             [Start Learning / Review]
```

## Requirements
- Node.js 18+
- Python 3.10+ (Whisper)
- gPodder (Windows)
- FFmpeg (Windows)

## Quick Start
1. Install dependencies
   - `npm install`
2. Start backend
   - `npm run server`
3. Start frontend
   - `npm run dev`
4. Open
   - `http://localhost:3000`

## Workflow (Subscribe → Download → Practice)
1. Subscribe RSS (per language) in gPodder
   - Use the app “订阅RSS” button
2. Update practice sets
   - Use “更新题库” in Tools
3. Start Learning
   - Choose a source → practice

## Language Isolation & Source Mapping
Language is controlled by `practice-sets/.language-map.json`.

Example:
```json
{
  "default": "de",
  "Langsam Gesprochene Nachrichten _ Audios _ DW Deutsch lernen": "de",
  "logo!-Nachrichten (AUDIO)": "de",
  "Easy English": "en"
}
```

If a new podcast folder is found but not mapped, generation will stop and prompt you to categorize it:
- Home → Tools → 管理音源 → set language → 保存设置

## Known Issues & Workarounds
### Initial subscription downloads too many episodes
When a new RSS feed is added, gPodder may mark a batch of historical episodes as “new”, so the first update can download **many** files. On CPU‑based Whisper this makes subtitle generation very slow.

**Workarounds**
1. Manually download only the single episode you want, then run “更新题库”.
2. Keep `limit.episodes = 1` in gPodder settings, avoid bulk downloads.
3. Consider a faster ASR backend (see below).

## Faster ASR Options
If Whisper on CPU is too slow, consider swapping the backend (not integrated by default):
- **[faster‑whisper](https://github.com/SYSTRAN/faster-whisper)** (CTranslate2; faster + lower memory; supports quantization)
- **[whisper.cpp](https://github.com/ggml-org/whisper.cpp)** (C/C++; quantized models; efficient on CPU)

## Scripts
Invoked by the frontend Tools card:
- `auto-daily-de.bat` (German update)
- `auto-daily-en.bat` (English update)
- `subscribe-german.bat`
- `subscribe-english.bat`

## Repo Layout
```
.
├── src/                 # Frontend (React)
├── public/              # Static assets
├── scripts/             # Helper scripts (optional)
├── server.mjs           # Backend API
├── generate-subtitles.py
├── auto-daily-*.bat      # Update scripts
├── subscribe-*.bat       # RSS subscription scripts
└── docs/                 # Guides and reports
```

## Docs
Project docs have been grouped under `docs/` to keep the root clean.

Guides:
- `docs/guides/QUICKSTART.md`
- `docs/guides/USER_GUIDE.md`
- `docs/guides/INTEGRATION-GUIDE.md`
- `docs/guides/DOWNLOAD-GUIDE.md`

Reports and notes:
- `docs/reports/PROJECT_SUMMARY.md`
- `docs/reports/CHANGELOG.md`
- `docs/notes/AUTO-SYSTEM.md`

## Data & Privacy
- Local‑only by design (no cloud storage)
- Practice sets stored in `practice-sets/`
- User state in `practice-sets/.state.json`

## Repository Notes
### Why GitHub shows fewer folders
The repository intentionally excludes generated and local data:
- `practice-sets/`
- `downloads/` and gPodder downloads
- `node_modules/`, `dist/`

These are regenerated locally and **not required** for running the project.

## Agent Support
This repo includes `AGENTS.md` with strict safe‑edit rules for AI agents.
If you use an AI assistant:
1. Read `AGENTS.md` first.
2. Keep changes inside `src/` or known scripts unless asked.
3. Avoid deleting user data or `practice-sets/`.

## License
MIT (see `LICENSE`).

## Open Source & Takedown
This project is open‑source for learning and personal use.
If any content is believed to be infringing, open an issue or contact the maintainer for prompt removal.
