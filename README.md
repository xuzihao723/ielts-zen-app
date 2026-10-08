<a id="readme-top"></a>

<div align="center">

# IELTS Zen · 雅思禅

**Plan your week. Focus on today. Keep learning.**

A calm IELTS study companion with a weekly planner, learning notes, a focus timer and a sketchpad.

**English** · [简体中文](README.zh-CN.md)

[![Checks](https://github.com/xuzihao723/ielts-zen-app/actions/workflows/check.yml/badge.svg)](https://github.com/xuzihao723/ielts-zen-app/actions/workflows/check.yml)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-6366F1.svg)](LICENSE)

[View hosted app](https://xuzihao723.github.io/ielts-zen-app/) · [Report a bug](https://github.com/xuzihao723/ielts-zen-app/issues/new) · [Request a feature](https://github.com/xuzihao723/ielts-zen-app/issues/new)

</div>

> The hosted app reflects the version deployed on `main`. Pull request changes appear after merging and deployment. The app interface is primarily Chinese; the documentation is bilingual.

<details>
<summary>Contents</summary>

- [About](#about)
- [Features](#features)
- [Quick start](#quick-start)
- [Configuration](#configuration)
- [Usage](#usage)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [Checks](#checks)
- [Limitations and roadmap](#limitations-and-roadmap)
- [Contributing](#contributing)
- [License and contact](#license-and-contact)

</details>

## About

IELTS Zen brings study tasks, notes and focus tools into a compact, mobile-friendly workspace. Its seven-day plan covers vocabulary, listening, reading, writing, speaking and review. Start without credentials: learning progress is stored in your browser. Firebase storage and an AI tutor are optional additions.

This is a study organizer, not an official IELTS service or an automated band-score assessment tool.

![IELTS Zen dashboard](docs/images/dashboard.jpg)

<details>
<summary>See the weekly planner</summary>

![Weekly planner with task notes and daily reflections](docs/images/planner.jpg)

</details>

## Features

| Tool | What you can do |
| --- | --- |
| Dashboard | Track weekly completion, recorded study streak and your own exam date. |
| Weekly planner | Cycle tasks through pending → completed → skipped → pending. |
| Notes and reflection | Save learning difficulties, daily moods and additional study notes. |
| Focus timer | Start, pause and reset 25-minute focus or 5-minute break sessions. Deadline-based timing catches up after background-tab throttling. |
| Ambient sound | Select rain, café or white noise when external audio is reachable. |
| Sketchpad | Draw with mouse or touch, clear the canvas and download a PNG. Drawings survive tab and theme changes during the current page session. |
| Local persistence | Keep progress, theme and exam date across reloads; export current progress and local weekly archives as JSON. |
| Optional Firebase | Store progress under a browser's anonymous user ID and archive previous weeks atomically in Firestore. |
| Optional AI tutor | Request Chinese vocabulary examples, writing ideas or study advice through your own server endpoint. |

## Quick start

### Prerequisites

- Git and a modern browser supporting JavaScript modules and import maps.
- Python 3 for static hosting, or Node.js 22+ for the optional server and checks.
- Internet access for library CDNs. Local mode needs no cloud credentials but is not fully offline.

### Static app

```sh
git clone https://github.com/xuzihao723/ielts-zen-app.git
cd ielts-zen-app
python -m http.server 8080 --bind 127.0.0.1
```

Open [http://127.0.0.1:8080](http://127.0.0.1:8080). No npm installation, Firebase setup or API key is needed for the study tools. Serve over HTTP rather than opening `index.html` with `file://`.

### Optional Node server

```sh
npm start
```

It serves the same address using Node's built-in modules. npm dependencies are only needed for development checks.

## Configuration

Public settings live in [config.js](config.js):

```js
window.IELTS_ZEN_CONFIG = {
  firebase: null,
  aiEndpoint: '',
};
```

Leave the defaults to use local mode. Reload after changing configuration. Never place Gemini credentials in browser files.

### Optional Firebase storage

1. Create your own project in the [Firebase console](https://console.firebase.google.com/), register a web app and copy its web configuration.
2. Enable [Anonymous authentication](https://firebase.google.com/docs/auth/web/anonymous-auth) and create a Firestore database.
3. Publish [firestore.rules](firestore.rules) in the Firestore Rules tab. Access must require `request.auth.uid == userId`; allowing every signed-in user to access all user documents is insufficient.
4. Replace `firebase: null` with your web configuration. Add your hosting domain to Authentication's authorized domains if required by your setup.

```js
firebase: {
  apiKey: 'YOUR_FIREBASE_WEB_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT',
  appId: 'YOUR_FIREBASE_APP_ID',
},
```

Firebase web configuration identifies a public client project; authentication and rules protect the database. See [Firebase's API key guidance](https://firebase.google.com/docs/projects/api-keys).

**Anonymous login does not provide cross-device identity.** Another browser/device gets a different user ID. Clearing site data may lose access to an anonymous account. Export a backup first; account linking is on the roadmap.

Progress is saved locally first. On connection, the newer `updatedAt` document wins as a whole; field-by-field collaborative merging is not supported. Failed writes keep local data; reload to retry reconciliation. Weekly archival happens when the app observes a new local Monday, rather than through a scheduled background job.

### Optional AI tutor for local use

1. Copy [.env.example](.env.example) to `.env` and set your own `GEMINI_API_KEY`. The ignored file is read only by the Node server.
2. Choose an available model using `GEMINI_MODEL`; the default is `gemini-2.5-flash`. Check [model availability](https://ai.google.dev/gemini-api/docs/models) for your account.
3. Set `aiEndpoint: '/api/advice'` in `config.js`, then run `npm start`.

The browser sends `{ "note": "…", "taskType": "词汇" }` and expects `{ "text": "…" }`. Failures return `{ "error": "…" }` with a non-2xx status. Notes are sent to your endpoint and Google only when you click the AI button. The proxy limits note length and valid requests to five per minute, times out after 30 seconds and never returns the key to the browser.

The included server binds to `127.0.0.1` for personal local use. A public AI service needs a separately authenticated HTTPS backend, quotas, abuse controls and appropriate CORS. GitHub Pages cannot run Node or hold secrets. Splitting a key or injecting it into a frontend build does not protect it. Follow [Google's key security guidance](https://ai.google.dev/gemini-api/docs/api-key).

## Usage

1. Set your exam date on the dashboard. Unset dates show `—`; past dates show zero days remaining.
2. Click a task box in the planner to change its status. Only completed tasks count toward progress.
3. Add a difficulty note and save. A configured AI tutor can offer suggestions before saving.
4. Expand a daily reflection panel to select a mood and write extra notes. Extra notes save locally as you type and sync on blur.
5. Choose focus or break mode and start the timer. Sessions stop at zero; switching modes resets the timer. Breaks do not start automatically.
6. Export a sketch as PNG before closing the page. Use **导出备份** in the status bar to download a JSON learning backup.

## Deployment

Publish `index.html`, `config.js` and `zen-core.js` together for static hosting.

For [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site), push reviewed changes and choose **Settings → Pages → Deploy from a branch → main → /(root)**. Default settings enable local mode. Firebase requires your own project and rules; AI requires a separately hosted backend URL. `/api/advice` alone cannot work on Pages.

JSX compilation and Tailwind styling currently run in the browser through CDNs. A bundled production build is on the roadmap.

## Architecture

| File | Responsibility |
| --- | --- |
| [index.html](index.html) | React 18 UI, Tailwind, import map and optional Firebase integration. |
| [zen-core.js](zen-core.js) | Local calendar dates, weekly rollover, streaks and deadline calculations. |
| [config.js](config.js) | Public cloud and AI endpoint configuration. |
| [server.mjs](server.mjs) | Optional local static server and server-side Gemini proxy. |
| [firestore.rules](firestore.rules) | Per-user database authorization. |
| [tests/core.test.mjs](tests/core.test.mjs) / [tests/server.test.mjs](tests/server.test.mjs) | Calendar, archive, timer and proxy regression tests. |

Cloud paths: `users/{uid}/learningData/progress` and `users/{uid}/archives/{weekId}`. Local keys: `ielts-zen-progress-v1`, `ielts-zen-archives`, `ielts-zen-dark`, `ielts-zen-exam`.

## Checks

```sh
npm ci
npm run check
npm test
```

Checks compile embedded JSX, validate local README links and reject legacy browser key configuration. Tests cover calendar boundaries, archival, streaks, countdowns, background timing, static file restrictions, proxy validation, provider failures and request limits. CI runs tests in Shanghai and New York time zones.

Also verify typing without losing focus, reload persistence, task cycling, timer pause/reset, sketch retention, theme switching and mobile layout for UI changes. Live Firebase/Gemini calls require your own services; tests use a fake provider and do not validate external credentials.

## Limitations and roadmap

- Browser data is tied to the site's origin. Backup export is available; import and archive browsing in the UI are not yet implemented.
- Sketches are session-only and are not cloud-synced. The recorded streak updates on task completion; it is not an activity history calendar.
- External CDN/audio availability and storage permissions affect functionality.
- [ ] Link anonymous accounts to permanent sign-in for cross-device access.
- [ ] Add archive viewing and backup import.
- [ ] Add an English app interface and editable study plans.
- [ ] Introduce a bundled production build and broader automated UI coverage.

## Contributing

Use [Issues](https://github.com/xuzihao723/ielts-zen-app/issues) for reproducible bugs or focused proposals. Fork, create a feature branch, run the checks and open a pull request with a description and UI screenshots where relevant. Keep both README languages consistent; exclude credentials and personal notes.

See [SECURITY.md](SECURITY.md) for private vulnerability reporting.

## License and contact

Distributed under the [MIT License](LICENSE). Maintained by [xuzihao723](https://github.com/xuzihao723).

[Back to top ↑](#readme-top)
