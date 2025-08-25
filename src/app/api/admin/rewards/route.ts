import { NextRequest, NextResponse } from "next/server";
import { rewardService } from "@/lib/dbService";
import db from "@/lib/database";
import { checkAdminAuth } from "@/lib/adminAuth";

// 모든 보상 조회 (관리자용)
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

    // 해당 사용자가 생성한 보상만 조회
    const stmt = db.prepare("SELECT * FROM rewards WHERE createdBy = ? ORDER BY createdAt DESC");
    const rewards = stmt.all(authResult.user.id);
    return NextResponse.json(rewards);
  } catch (error) {
    console.error("보상 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 새 보상 생성
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
    const { title, description, points, type, duration, icon } = body;

    // 입력 검증
    if (!title || !description || !points || !type || !icon) {
      return NextResponse.json(
        { error: "모든 필수 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    if (!["youtube", "game", "snack", "money"].includes(type)) {
      return NextResponse.json(
        { error: "타입은 youtube, game, snack, money 중 하나여야 합니다." },
        { status: 400 }
      );
    }

    if (typeof points !== "number" || points <= 0) {
      return NextResponse.json(
        { error: "포인트는 양수여야 합니다." },
        { status: 400 }
      );
    }

    // duration 검증 (선택적)
    if (
      duration !== undefined &&
      (typeof duration !== "number" || duration < 0)
    ) {
      return NextResponse.json(
        { error: "지속 시간은 0 이상의 숫자여야 합니다." },
        { status: 400 }
      );
    }

    // 새 보상 ID 생성
    const id = Math.random().toString(36).substr(2, 9);

    // 보상 생성 (생성자 정보 포함)
    const stmt = db.prepare(`
      INSERT INTO rewards (id, title, description, points, type, duration, icon, createdBy)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(id, title, description, points, type, duration || 0, icon, authResult.user.id);

    return NextResponse.json({
      message: "보상이 생성되었습니다.",
      reward: {
        id,
        title,
        description,
        points,
        type,
        duration: duration || 0,
        icon,
      },
    });
  } catch (error) {
    console.error("보상 생성 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
