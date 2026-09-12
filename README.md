# Discord Account Studio

A Discord-inspired dashboard for authorized QA and server onboarding. It prepares test profiles, checks a temporary inbox, connects an authorized Discord identity through OAuth2, and keeps browser-local account workspaces.

## Railway variables

Set these in Railway Variables:

- `PORT=8080`
- `APP_PASSWORD` — password for the dashboard login screen
- `DISCORD_CLIENT_ID`
- `DISCORD_CLIENT_SECRET`
- `DISCORD_REDIRECT_URI=https://discord-qa-kit-hii.up.railway.app/api/auth/discord/callback`
- `DISCORD_ALERT_WEBHOOK_URL`

The app binds to `0.0.0.0` and honors Railway's `PORT` value, defaulting to `8080`. Keep `APP_PASSWORD`, OAuth secrets, and the webhook URL in Railway Variables. Never commit their values to GitHub.

## Features

- Password-protected dashboard
- Generate a test display name, username, password, and temporary email
- Copy individual fields or the full profile bundle
- Open an authorized Discord server invite
- Create and switch between Project 1-style Account Workspaces
- Track profile, invite, inbox, manual CAPTCHA, and free-trial checkpoints
- Send a Discord webhook notification when a workspace is marked as having a free trial
- Connect the currently authorized Discord account through official Discord OAuth2

The dashboard password is only read from `APP_PASSWORD` on the server. Discord passwords and session tokens are never collected or stored.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
