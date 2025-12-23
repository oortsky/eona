import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    
    const cookieStore = await cookies();
    cookieStore.set("verification_token", `${Date.now()}-${email}`, {
      path: "/",
      maxAge: 3600,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to set token" },
      { status: 500 }
    );
  }
}