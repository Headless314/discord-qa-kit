import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  const webhookUrl = process.env.DISCORD_ALERT_WEBHOOK_URL
  if (!webhookUrl) return NextResponse.json({ error: "DISCORD_ALERT_WEBHOOK_URL is not configured" }, { status: 500 })

  const payload = await request.json().catch(() => null)
  const workspaceName = typeof payload?.workspaceName === "string" ? payload.workspaceName.slice(0, 100) : "Unnamed workspace"
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "Discord Account Studio", content: "🔔 Free trial available in **" + workspaceName + "**.", allowed_mentions: { parse: [] } }),
  })

  if (!response.ok) return NextResponse.json({ error: "Discord webhook rejected the notification" }, { status: 502 })
  return NextResponse.json({ sent: true })
}
