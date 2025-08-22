import { NextResponse } from 'next/server';
import { rewardService } from '@/lib/dbService';

// 모든 보상 조회
export async function GET() {
  try {
    const rewards = rewardService.getAllRewards();
    return NextResponse.json(rewards);
  } catch (error) {
    console.error('보상 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
