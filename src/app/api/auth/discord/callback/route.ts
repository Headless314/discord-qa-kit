import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code")
  const state = request.nextUrl.searchParams.get("state")
  const storedState = request.cookies.get("discord_oauth_state")?.value
  const clientId = process.env.DISCORD_CLIENT_ID
  const clientSecret = process.env.DISCORD_CLIENT_SECRET
  const redirectUri = process.env.DISCORD_REDIRECT_URI || new URL("/api/auth/discord/callback", request.url).toString()

  if (!code || !state || !storedState || state !== storedState) return NextResponse.json({ error: "Invalid Discord OAuth state" }, { status: 400 })
  if (!clientId || !clientSecret) return NextResponse.json({ error: "Discord OAuth is not configured" }, { status: 500 })

  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "authorization_code", code, redirect_uri: redirectUri }),
  })
  if (!tokenResponse.ok) return NextResponse.json({ error: "Discord authorization failed" }, { status: 502 })

  const token = await tokenResponse.json()
  const userResponse = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: "Bearer " + token.access_token } })
  if (!userResponse.ok) return NextResponse.json({ error: "Discord identity lookup failed" }, { status: 502 })

  const user = await userResponse.json()
  const response = NextResponse.redirect(new URL("/", request.url))
  response.cookies.set("discord_user", JSON.stringify({ id: user.id, username: user.username, global_name: user.global_name }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" })
  response.cookies.delete("discord_oauth_state")
  return response
}
