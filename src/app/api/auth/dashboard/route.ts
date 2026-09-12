import { NextRequest, NextResponse } from "next/server"
import { timingSafeEqual } from "crypto"

const matches = (provided: string, expected: string) => {
  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  return providedBuffer.length === expectedBuffer.length && timingSafeEqual(providedBuffer, expectedBuffer)
}

export async function POST(request: NextRequest) {
  const expected = process.env.APP_PASSWORD
  const payload = await request.json().catch(() => null)
  const provided = typeof payload?.password === "string" ? payload.password : ""
  if (!expected || !matches(provided, expected)) return NextResponse.json({ error: "Invalid password" }, { status: 401 })

  const response = NextResponse.json({ authenticated: true })
  response.cookies.set("dashboard_session", "authenticated", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" })
  return response
}

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url))
  response.cookies.delete("dashboard_session")
  return response
}
