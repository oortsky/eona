import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (pathname === "/verify") {
    const status = searchParams.get("status");
    const secret = searchParams.get("secret");
    const userId = searchParams.get("userId");
    const verificationToken = request.cookies.get("verification_token");

    if (!verificationToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (status) {
      return NextResponse.next();
    }

    if (secret && userId) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
  }
  
  if (pathname === "/result") {
    const status = searchParams.get("status");
    const capsuleId = searchParams.get("id");

    if (status === "success") {
      if (!capsuleId) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    }

    if (status) {
      return NextResponse.next();
    }

    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/verify", "/result"]
};
