import { NextRequest, NextResponse } from "next/server";
import { questService, userService } from "@/lib/dbService";
import db from "@/lib/database";

// 퀘스트 완료
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { questId } = body;

    // 사용자 정보 가져오기
    const user = userService.getUser(params.id);
    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 모든 퀘스트에서 해당 퀘스트 정보 찾기
    const allQuests = questService.getAllQuests();
    const quest = allQuests.find((q) => q.id === questId);

    if (!quest) {
      return NextResponse.json(
        { error: "퀘스트를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 트랜잭션으로 퀘스트 완료와 사용자 업데이트를 함께 처리
    const transaction = db.transaction(() => {
      // 퀘스트 완료 처리
      questService.completeQuest(params.id, questId);

      // 사용자 포인트 및 경험치 업데이트
      const newPoints = user.points + quest.points;
      const newExperience = user.experience + quest.points;
      const newLevel = Math.floor(newExperience / 100) + 1;

      userService.updateUser({
        id: params.id,
        points: newPoints,
        totalPoints: user.totalPoints + quest.points,
        experience: newExperience,
        level: newLevel,
      });
    });

    // 트랜잭션 실행
    transaction();

    return NextResponse.json({
      message: "퀘스트가 완료되었습니다.",
      quest: quest,
      user: {
        points: user.points + quest.points,
        totalPoints: user.totalPoints + quest.points,
        experience: user.experience + quest.points,
        level: Math.floor((user.experience + quest.points) / 100) + 1,
      },
    });
  } catch (error) {
    console.error("퀘스트 완료 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
