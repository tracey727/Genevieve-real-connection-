# GENEVIEVE Real Connection Trial™ V1

A privacy-first trial app for building friendship, noticing reciprocity, exploring whether a friendship may be becoming something deeper, and expanding real-world life experiences without social-media mechanics.

## What this version does

- Daily connection step based on what you want that day
- Private people tracker: familiar face → conversation → acquaintance → contact → activity → friendship → possibly deeper
- Private reflection after an interaction
- Green / yellow / red connection check
- 6-stage friendship-to-romance micro-progression
- Friendship Fit profile based on relating style rather than labels
- Life Expansion list with "can do now" and "one day" categories
- Local browser storage only — no account, server or database
- JSON backup / restore
- Installable web app support
- Responsive phone layout

## Important boundary

This is a non-clinical prototype. It does not diagnose, provide therapy, determine whether another person is safe, or replace professional or emergency support. Its prompts are designed to support reflection and consent-based, low-pressure social progression.

## Easiest Vercel deployment

### Option A — upload to GitHub first

1. Create a new GitHub repository, for example `genevieve-real-connection-trial`.
2. Upload all files in this folder to the top level of that repository.
3. Open Vercel and choose **Add New → Project**.
4. Import the GitHub repository.
5. Vercel should identify it as a static project. Do not add a framework preset.
6. Click **Deploy**.

### Option B — Vercel CLI

If you already use the Vercel CLI, run `vercel` from this folder and follow the prompts.

## Files

- `index.html` — app screens
- `styles.css` — responsive styling
- `app.js` — all trial logic and local storage
- `manifest.webmanifest` — installable web-app metadata
- `service-worker.js` — basic offline caching
- `vercel.json` — privacy/security headers

## Data model

All user-created data is stored in `localStorage` under:

`genevieve-real-connection-v1`

No database is used in V1. That is deliberate for the personal trial. A later multi-user version should move identity, matching, reporting, consent, moderation and messaging to a proper backend with authenticated accounts and strict separation between matching data and any psychological/clinical data.


## V1.1 visual connection toggle
The Today screen now includes the approved two-women connection toggle. Friendship opens the People pathway; Deeper connection opens the Mutual Step pathway. The image asset is stored at `assets/connection-toggle.png`.
