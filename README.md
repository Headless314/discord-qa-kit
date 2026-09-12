# Discord Account Studio

A Discord-inspired dashboard for authorized QA and server onboarding. It prepares test profiles, checks a temporary inbox, connects an authorized Discord identity through OAuth2, and keeps browser-local account workspaces.

## Features

- Generate a test display name, username, password, and temporary email
- Copy individual fields or the full profile bundle
- Open an authorized Discord server invite
- Create Project 1-style Account Workspaces after you manually finish an account
- Switch between configured workspaces
- Track profile, invite, inbox, manual CAPTCHA, and free-trial checkpoints
- Send a Discord webhook notification when a workspace is marked as having a free trial
- Connect the currently authorized Discord account through official Discord OAuth2

Workspace data stays in the browser's local storage and passwords are never saved in a workspace. OAuth stores only a short-lived identity snapshot in an HttpOnly cookie; the app never asks for or stores a Discord password.

## Railway deployment

This repository includes `railway.json`. The app binds to `0.0.0.0` and uses Railway's `PORT` variable, defaulting to port `8080` when it is not set.

Set these variables in the Railway service: 

- `PORT=8080` (Railway may override this with its assigned port)
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI=https://discord-controller-h.up.railway.app/api/auth/discord/callback`
- `DISCORD_ALERT_WEBHOOK_URL`

Add `https://discord-controller-h.up.railway.app/api/auth/discord/callback` as an OAuth redirect URL in the Discord Developer Portal. Configure the `discord-controller-h.up.railway.app` domain on the Railway service.

Keep all secrets in Railway Variables. Never commit their values to GitHub.

## Discord webhook setup

Create an incoming webhook in the Discord channel where alerts should appear, then set `DISCORD_ALERT_WEBHOOK_URL`. Mark **Free trial available** in a workspace to send an alert.

## Safety boundary

This app does not create Discord accounts, submit registration forms, automate mass signups, solve CAPTCHA, bypass verification, collect passwords, or use Discord session tokens. Use it only with Discord servers, accounts, and test environments you own or are authorized to test.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
