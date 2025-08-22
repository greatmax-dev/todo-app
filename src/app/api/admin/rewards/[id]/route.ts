import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";

// 보상 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // 보상 존재 확인
    const checkStmt = db.prepare("SELECT id FROM rewards WHERE id = ?");
    const existingReward = checkStmt.get(params.id);

    if (!existingReward) {
      return NextResponse.json(
        { error: "보상을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 보상 업데이트
    const updateStmt = db.prepare(`
      UPDATE rewards 
      SET title = ?, description = ?, points = ?, type = ?, duration = ?, icon = ?
      WHERE id = ?
    `);

    updateStmt.run(
      title,
      description,
      points,
      type,
      duration || 0,
      icon,
      params.id
    );

    return NextResponse.json({
      message: "보상이 수정되었습니다.",
      reward: {
        id: params.id,
        title,
        description,
        points,
        type,
        duration: duration || 0,
        icon,
      },
    });
  } catch (error) {
    console.error("보상 수정 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 보상 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 보상 존재 확인
    const checkStmt = db.prepare("SELECT id FROM rewards WHERE id = ?");
    const existingReward = checkStmt.get(params.id);

    if (!existingReward) {
      return NextResponse.json(
        { error: "보상을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관련된 user_rewards 레코드도 삭제
    const deleteUserRewardsStmt = db.prepare(
      "DELETE FROM user_rewards WHERE rewardId = ?"
    );
    deleteUserRewardsStmt.run(params.id);

    // 보상 삭제
    const deleteRewardStmt = db.prepare("DELETE FROM rewards WHERE id = ?");
    deleteRewardStmt.run(params.id);

    return NextResponse.json({
      message: "보상이 삭제되었습니다.",
    });
  } catch (error) {
    console.error("보상 삭제 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
