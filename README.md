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

## Discord OAuth setup

1. Create an application in the Discord Developer Portal.
2. Add this redirect URL: `http://localhost:3000/api/auth/discord/callback` for local development.
3. Copy `.env.example` to `.env.local`.
4. Set `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_REDIRECT_URI`.
5. Run the app and use **Connect Discord** inside a workspace.

## Discord webhook setup

1. Create an incoming webhook in the Discord channel where alerts should appear.
2. Set `DISCORD_ALERT_WEBHOOK_URL` in `.env.local` or your deployment secret manager.
3. Mark **Free trial available** in a workspace.
4. The server posts the workspace name to the configured channel.

Keep the webhook URL server-side. Never put it in client-side code or commit the real value to GitHub.

## Safety boundary

This app does not create Discord accounts, submit registration forms, automate mass signups, solve CAPTCHA, bypass verification, collect passwords, or use Discord session tokens. Use it only with Discord servers, accounts, and test environments you own or are authorized to test.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
