import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE = "noh_session";

async function isValid(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  try {
    await jwtVerify(token, new TextEncoder().encode(secret));
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const valid = await isValid(req.cookies.get(SESSION_COOKIE)?.value);

  // Halaman login: kalau sudah login, lempar ke dashboard.
  if (pathname === "/admin/login") {
    if (valid) {
      return NextResponse.redirect(new URL("/admin/products", req.url));
    }
    return NextResponse.next();
  }

  // Selain login, semua /admin butuh sesi valid.
  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
