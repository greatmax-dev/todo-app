import { NextRequest, NextResponse } from 'next/server';
import { questService } from '@/lib/dbService';

// 모든 퀘스트 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    
    let quests;
    if (category && category !== '전체') {
      quests = questService.getQuestsByCategory(category);
    } else {
      quests = questService.getAllQuests();
    }
    
    return NextResponse.json(quests);
  } catch (error) {
    console.error('퀘스트 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
