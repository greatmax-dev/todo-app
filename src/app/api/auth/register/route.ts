import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { RegisterRequest, AuthResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, nickname, password } = body;

    if (!name) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    // 기존 사용자 확인
    const checkStmt = db.prepare("SELECT id FROM users WHERE name = ?");
    const existingUser = checkStmt.get(name);

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "이미 존재하는 사용자입니다." },
        { status: 409 }
      );
    }

    // 새 사용자 생성
    const insertStmt = db.prepare(`
      INSERT INTO users (id, name, nickname, password, level, experience, points, totalPoints, streak, lastLogin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const userId = uuidv4();
    const now = new Date().toISOString();
    
    insertStmt.run(userId, name, nickname || "", password || "", 1, 0, 0, 0, 0, now);

    // 생성된 사용자 조회
    const selectStmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = selectStmt.get(userId) as any;

    // 응답에서 비밀번호 제거
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json<AuthResponse>({
      success: true,
      user: userWithoutPassword,
      message: "회원가입 성공!"
    });

  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
