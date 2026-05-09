import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const userId = req.cookies.get("user_id")?.value;
  const { pathname } = req.nextUrl;

  console.log("MIDDLEWARE:", pathname, "userId:", userId);

  const isPublic = pathname.startsWith("/login") || pathname.startsWith("/register");

  if (!userId && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (userId && isPublic) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};