import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const value = request.cookies.get("discord_user")?.value
  if (!value) return NextResponse.json({ connected: false })
  try { return NextResponse.json({ connected: true, user: JSON.parse(value) }) } catch { return NextResponse.json({ connected: false }) }
}
