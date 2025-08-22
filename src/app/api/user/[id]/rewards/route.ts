import { NextRequest, NextResponse } from "next/server";
import { rewardService, userService } from "@/lib/dbService";

// 사용자 보상 사용 기록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rewards = rewardService.getUserRewards(params.id);

    // 사용자 정보도 함께 반환
    const user = userService.getUser(params.id);

    return NextResponse.json({
      rewards: rewards,
      user: user
        ? {
            id: user.id,
            name: user.name,
            points: user.points,
            totalPoints: user.totalPoints,
          }
        : null,
      summary: {
        totalRewardsUsed: rewards.length,
        totalPointsSpent: rewards.reduce(
          (sum, reward) => sum + reward.points,
          0
        ),
      },
    });
  } catch (error) {
    console.error("사용자 보상 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 보상 사용
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { rewardId, points } = body;

    // 사용자 정보 가져오기
    const user = userService.getUser(params.id);
    if (!user) {
      return NextResponse.json(
        { error: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 포인트 확인
    if (user.points < points) {
      return NextResponse.json(
        { error: "포인트가 부족합니다." },
        { status: 400 }
      );
    }

    // rewardId가 쉼표로 구분된 여러 ID인 경우 처리
    const rewardIds = rewardId.split(",").map((id: string) => id.trim());

    // 각 보상에 대해 사용 기록 추가
    rewardIds.forEach((id: string) => {
      rewardService.useReward(params.id, id);
    });

    // 사용자 포인트 차감
    userService.updateUser({
      id: params.id,
      points: user.points - points,
    });

    return NextResponse.json({
      message: "보상이 사용되었습니다.",
      user: {
        points: user.points - points,
      },
      usedRewards: rewardIds,
    });
  } catch (error) {
    console.error("보상 사용 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
