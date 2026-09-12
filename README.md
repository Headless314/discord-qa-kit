# Discord QA Kit

A small Next.js app for authorized Discord QA and server onboarding. It prepares a test profile, checks a temporary inbox, and provides browser-local account workspaces.

## Features

- Generate a test display name, username, password, and temporary email
- Copy individual fields or the full profile bundle
- Open an authorized Discord server invite
- Create Project 1-style Account Workspaces after you manually finish an account
- Track profile, invite, inbox, and manual CAPTCHA checkpoints
- Connect the currently authorized Discord account through official Discord OAuth2

Workspace data stays in the browser's local storage and passwords are never saved in a workspace. OAuth stores only a short-lived identity snapshot in an HttpOnly cookie; the app never asks for or stores a Discord password.

## Discord OAuth setup

1. Create an application in the Discord Developer Portal.
2. Add this redirect URL: `http://localhost:3000/api/auth/discord/callback` for local development.
3. Copy `.env.example` to `.env.local`.
4. Set `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, and `DISCORD_REDIRECT_URI`.
5. Run the app and use **Connect Discord** inside a workspace.

For production, use your deployed HTTPS callback URL and keep the client secret in your deployment's secret manager.

## Safety boundary

This app does not create Discord accounts, submit registration forms, automate mass signups, solve CAPTCHA, bypass verification, collect passwords, or use Discord session tokens. Use it only with Discord servers, accounts, and test environments you own or are authorized to test.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
