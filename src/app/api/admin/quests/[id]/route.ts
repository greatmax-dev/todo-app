import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";

// 퀘스트 수정
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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

    // 퀘스트 존재 확인
    const checkStmt = db.prepare("SELECT id FROM quests WHERE id = ?");
    const existingQuest = checkStmt.get(params.id);

    if (!existingQuest) {
      return NextResponse.json(
        { error: "퀘스트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 퀘스트 업데이트
    const updateStmt = db.prepare(`
      UPDATE quests 
      SET title = ?, description = ?, difficulty = ?, points = ?, category = ?, icon = ?
      WHERE id = ?
    `);

    updateStmt.run(
      title,
      description,
      difficulty,
      points,
      category,
      icon,
      params.id
    );

    return NextResponse.json({
      message: "퀘스트가 수정되었습니다.",
      quest: {
        id: params.id,
        title,
        description,
        difficulty,
        points,
        category,
        icon,
      },
    });
  } catch (error) {
    console.error("퀘스트 수정 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 퀘스트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 퀘스트 존재 확인
    const checkStmt = db.prepare("SELECT id FROM quests WHERE id = ?");
    const existingQuest = checkStmt.get(params.id);

    if (!existingQuest) {
      return NextResponse.json(
        { error: "퀘스트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 관련된 user_quests 레코드도 삭제
    const deleteUserQuestsStmt = db.prepare(
      "DELETE FROM user_quests WHERE questId = ?"
    );
    deleteUserQuestsStmt.run(params.id);

    // 퀘스트 삭제
    const deleteQuestStmt = db.prepare("DELETE FROM quests WHERE id = ?");
    deleteQuestStmt.run(params.id);

    return NextResponse.json({
      message: "퀘스트가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("퀘스트 삭제 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
