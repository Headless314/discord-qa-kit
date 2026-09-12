import { NextRequest, NextResponse } from "next/server"

export function middleware(request: NextRequest) {
  if (!process.env.APP_PASSWORD) return NextResponse.next()

  const pathname = request.nextUrl.pathname
  if (pathname === "/login" || pathname.startsWith("/api/auth/dashboard") || pathname.startsWith("/_next") || pathname === "/favicon.ico") {
    return NextResponse.next()
  }

  if (request.cookies.get("dashboard_session")?.value === "authenticated") return NextResponse.next()

  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = "/login"
  loginUrl.searchParams.set("from", pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
