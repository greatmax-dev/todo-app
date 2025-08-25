import { NextRequest, NextResponse } from "next/server";
import { questService } from "@/lib/dbService";
import db from "@/lib/database";
import { checkAdminAuth } from "@/lib/adminAuth";

// 모든 퀘스트 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    // 관리자 권한 체크
    const authResult = await checkAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    // 해당 사용자가 생성한 퀘스트만 조회
    const stmt = db.prepare("SELECT * FROM quests WHERE createdBy = ? ORDER BY createdAt DESC");
    const quests = stmt.all(authResult.user.id);
    return NextResponse.json(quests);
  } catch (error) {
    console.error("퀘스트 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 퀘스트 생성
export async function POST(request: NextRequest) {
  try {
    // 관리자 권한 체크
    const authResult = await checkAdminAuth(request);
    if (!authResult.isValid) {
      return NextResponse.json(
        { error: authResult.error },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, difficulty, points, category, icon } = body;

    // 입력 검증
    if (
      !title ||
      !description ||
      !difficulty ||
      !points ||
      !category ||
      !icon
    ) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return NextResponse.json(
        { error: "난이도는 easy, medium, hard 중 하나여야 합니다." },
        { status: 400 }
      );
    }

    if (typeof points !== "number" || points <= 0) {
      return NextResponse.json(
        { error: "포인트는 양수여야 합니다." },
        { status: 400 }
      );
    }

    // 새 퀘스트 ID 생성
    const id = Math.random().toString(36).substr(2, 9);

    // 퀘스트 생성 (생성자 정보 포함)
    const stmt = db.prepare(`
      INSERT INTO quests (id, title, description, difficulty, points, category, icon, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, description, difficulty, points, category, icon, authResult.user.id);

    return NextResponse.json({
      message: "퀘스트가 생성되었습니다.",
      quest: {
        id,
        title,
        description,
        difficulty,
        points,
        category,
        icon,
      },
    });
  } catch (error) {
    console.error("퀘스트 생성 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
