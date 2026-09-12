# Discord QA Kit

A small Next.js app for preparing test profile data and checking a temporary inbox while doing authorized Discord QA or server onboarding.

## Features

- Generate a test display name, username, password, and temporary email
- Copy individual fields or the full profile bundle
- Open an authorized Discord server invite
- Create browser-local Account Workspaces after you manually finish an account
- Track profile, invite, inbox, and manual CAPTCHA checkpoints

Workspace data stays in the browser's local storage and passwords are never saved in a workspace.

## Safety boundary

This app does not create Discord accounts, submit registration forms, automate mass signups, solve CAPTCHA, or bypass verification. Use it only with Discord servers, accounts, and test environments you own or are authorized to test.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.
