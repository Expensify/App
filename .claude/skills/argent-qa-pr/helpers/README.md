# Helpers — autonomous mobile login & evidence publishing

## `fetch-magic-code.mjs`
Fetches the latest **Expensify login code** from a Gmail inbox over IMAP and prints
**only** the 6-digit code to stdout. Used by the skill's Step-0 preflight so mobile login
is autonomous (no human reads the email). Idea/credit: `adamgrzybowski/expensify-auto-login`
(we reuse its Gmail-reading half; the device driving is ours, via Argent).

Uses **`imap` + `mailparser`** — the code lives in a **quoted-printable HTML email body**
that needs real MIME decoding (a raw zero-dep parse couldn't extract it reliably).

> ⚠️ The current Expensify email is **subject "Your Expensify security code"** (sender
> `concierge@expensify.com`) with the **code in the body** — *not* the old
> `Expensify magic code: NNNNNN` subject. The helper searches broadly (unseen, from
> *expensify*) and pulls the 6-digit code out of the decoded body, so it's robust to the
> subject wording.

### One-time setup
1. **Install deps** (once):
   ```bash
   cd .claude/skills/argent-qa-pr/helpers && npm install
   ```
2. On the **test Gmail account**, enable **2-Step Verification**
   (https://myaccount.google.com/security) — required for an App Password.
3. Create a **16-char App Password**: https://myaccount.google.com/apppasswords
   (IMAP is always on in modern Gmail — no toggle to flip.)
4. Give the helper **your own** credentials (each user has their own test account). It
   resolves them in order: **process env vars → `.env` → macOS Keychain**.
   - **Local, no prompts (recommended):** copy the template and fill it in —
     ```bash
     cd .claude/skills/argent-qa-pr/helpers
     cp .env.example .env      # then edit .env: GMAIL_USER + GMAIL_APP_PASSWORD
     ```
     `.env` is **gitignored** (your real creds never get committed); `.env.example` is the
     committed template.
   - **Headless / CI:** export `GMAIL_USER` + `GMAIL_APP_PASSWORD` from a CI secret.
   - **Secure local (but prompts):** macOS Keychain —
     `security add-generic-password -s "expensify-auto-login" -a "<gmail>" -w "<app-pw>"`.

### Usage
```bash
node fetch-magic-code.mjs --timeout 90
# Credentials resolved from env → .env → Keychain (above). Override with --user / --from / --timeout.
# → prints the 6-digit code on stdout; exit 0 ok / 1 timeout / 2 bad config / 3 IMAP error.
```

Then type the printed code into the sim's code field (via Argent) → logged in.

### Notes
- **Each user supplies their own test account** in their gitignored `helpers/.env` — nothing
  is shared or hardcoded. The `+tag` trick (`you+acct1@gmail.com`) lets one inbox back many
  Expensify accounts; the helper strips the tag for the IMAP login.
- Works for **production/staging** codes (real emailed codes). Not needed for the dev VM
  (which uses `000000`, no email).
- **Never commit** real creds or `node_modules/` (both gitignored); only `.env.example` is
  committed.
- Verified end-to-end on iOS: sim email → helper fetched the real code → typed it → Home.

## `publish-evidence.sh`
Pushes a PR's QA evidence (screenshots, GIFs, MP4s) to the **evidence repo** and prints the
**base raw URL** the report comment embeds from (Phase 5). GitHub renders comment images/GIFs only
from public URLs — local paths don't render, base64 is stripped, and the native drag-drop upload is
browser-cookie-only (not automatable) — so evidence must live somewhere with a public URL.

### Usage
```bash
BASE=$(bash publish-evidence.sh <pr-number> ai-qa-poc/PR-<n>/screens ai-qa-poc/PR-<n>/videos)
# → https://raw.githubusercontent.com/<owner>/<repo>/main/PR-<n>
# embed screenshots/GIFs inline: ![caption]($BASE/<file>.png)  /  ![caption]($BASE/<file>.gif)
# link MP4s (NOT inline-playable in a comment): [MP4]($BASE/<file>.mp4)
```
Accepts **one or more dirs**. Clones the repo to `EVIDENCE_CACHE` (default `/tmp/qa-evidence`,
reused), copies `*.png *.jpg *.gif *.mp4` from each (flattened into `PR-<n>/`, **skipping
`*-raw.*`** so raw captures stay local), commits, pushes, and prints the URL.

### Config (resolved: process env > `helpers/.env` > built-in default)
| Var | Default | Meaning |
| --- | --- | --- |
| `EVIDENCE_REPO` | _(none — required)_ | `owner/name` of YOUR public repo hosting screenshots |
| `EVIDENCE_BRANCH` | `main` | branch the images live on |
| `EVIDENCE_CACHE` | `/tmp/qa-evidence` | local working clone path |

- Put non-secret overrides in `helpers/.env`; in **CI** set them as env vars / secrets instead
  (process env always wins), so retargeting to e.g. an org repo needs no file edit.
- **Auth:** the active `gh`/git identity needs **`contents:write`** on `EVIDENCE_REPO`. Locally
  that's your `gh` login; in CI use a **fine-grained PAT** or a **GitHub App installation token**
  scoped to just that repo (no broad `gist`/account scopes needed).
- **One-time:** the repo must exist and be **public** (so `raw.githubusercontent.com` serves the
  images) with at least one commit on `EVIDENCE_BRANCH`. Create with
  `gh repo create <owner>/qa-evidence --public` and push a README.

## `clip-to-evidence.sh`
Turns a raw screen recording into a **looping GIF** (embeds inline + auto-plays in a comment) plus a
**compressed MP4** (linked for full quality). GitHub does NOT inline-play a raw/blob MP4 URL in a
comment — a GIF is the only automatable inline-motion format.

### Usage
```bash
bash clip-to-evidence.sh <raw-video> <out-basename> [gif-start-sec] [gif-dur-sec] [gif-width]
# e.g. clip-to-evidence.sh ai-qa-poc/PR-<n>/videos/android-main-raw.mp4 \
#        ai-qa-poc/PR-<n>/videos/android-main 3.6 3.0 320
# → writes android-main.mp4 (compressed) + android-main.gif (trimmed to the action window)
```
Trim the GIF to the moment that matters (start/dur) so it loops tightly. Needs `ffmpeg`.

### Recording the raw video first (start AFTER the app is at the ready state)
- **Android:** `adb shell screenrecord --bit-rate 8000000 /sdcard/c.mp4 &` → run the flow →
  `adb shell pkill -INT screenrecord` → `adb pull /sdcard/c.mp4 <raw>`.
  ⚠️ `screenrecord` is **slow to init on a loaded emulator — wait ~4s after starting it before the
  first tap**, or the start gets clipped (re-take if so). 180s max per file.
- **iOS:** `xcrun simctl io <udid> recordVideo --codec h264 <raw> &` → run the flow →
  `kill -INT %1` (SIGINT finalizes the .mp4).
