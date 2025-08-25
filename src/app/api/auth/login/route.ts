import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { LoginRequest, AuthResponse } from "@/types";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { name, password } = body;

    if (!name) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    // 사용자 조회
    const stmt = db.prepare("SELECT * FROM users WHERE name = ?");
    let user = stmt.get(name) as any;

    if (!user) {
      // 사용자가 없으면 새로 생성 (간단한 회원가입)
      const insertStmt = db.prepare(`
        INSERT INTO users (id, name, nickname, password, level, experience, points, totalPoints, streak, lastLogin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      const userId = uuidv4();
      const now = new Date().toISOString();
      
      insertStmt.run(userId, name, "", password || "", 1, 0, 0, 0, 0, now);
      
      // 새로 생성된 사용자 조회
      user = stmt.get(name) as any;
    } else {
      // 기존 사용자 로그인 시간 업데이트
      const updateStmt = db.prepare("UPDATE users SET lastLogin = ? WHERE id = ?");
      updateStmt.run(new Date().toISOString(), user.id);
    }

    // 비밀번호 확인 (비밀번호가 설정되어 있는 경우)
    if (user.password && password !== user.password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "비밀번호가 일치하지 않습니다." },
        { status: 401 }
      );
    }

    // 응답에서 비밀번호 제거
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json<AuthResponse>({
      success: true,
      user: userWithoutPassword,
      message: "로그인 성공!"
    });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
