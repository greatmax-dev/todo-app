import { NextResponse } from "next/server";
import { AuthResponse } from "@/types";

export async function POST() {
  try {
    return NextResponse.json<AuthResponse>({
      success: true,
      message: "로그아웃 성공!"
    });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
