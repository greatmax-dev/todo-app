import { NextRequest, NextResponse } from "next/server";
import { questService, userService } from "@/lib/dbService";

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

    // 퀘스트 완료 처리
    try {
      questService.completeQuest(params.id, questId);
      console.log(`퀘스트 완료 성공: userId=${params.id}, questId=${questId}`);
    } catch (questError) {
      console.error("퀘스트 완료 실패:", questError);
      throw questError;
    }

    // 사용자 포인트 및 경험치 업데이트
    const newPoints = user.points + quest.points;
    const newExperience = user.experience + quest.points;
    const newLevel = Math.floor(newExperience / 100) + 1;

    try {
      userService.updateUser({
        id: params.id,
        points: newPoints,
        totalPoints: user.totalPoints + quest.points,
        experience: newExperience,
        level: newLevel,
      });
      console.log(
        `사용자 업데이트 성공: userId=${params.id}, newPoints=${newPoints}`
      );
    } catch (userError) {
      console.error("사용자 업데이트 실패:", userError);
      throw userError;
    }

    return NextResponse.json({
      message: "퀘스트가 완료되었습니다.",
      quest: quest,
      user: {
        points: newPoints,
        totalPoints: user.totalPoints + quest.points,
        experience: newExperience,
        level: newLevel,
      },
    });
  } catch (error) {
    console.error("퀘스트 완료 오류:", error);

    // 데이터베이스 오류인 경우 더 자세한 정보 제공
    if (error instanceof Error) {
      if (error.message.includes("UNIQUE constraint failed")) {
        return NextResponse.json(
          { error: "퀘스트가 이미 완료되었습니다." },
          { status: 400 }
        );
      } else if (error.message.includes("FOREIGN KEY constraint failed")) {
        return NextResponse.json(
          { error: "유효하지 않은 퀘스트 ID입니다." },
          { status: 400 }
        );
      } else if (error.message.includes("database is locked")) {
        return NextResponse.json(
          { error: "데이터베이스가 잠겨있습니다. 잠시 후 다시 시도해주세요." },
          { status: 503 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}
