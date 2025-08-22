import { NextRequest, NextResponse } from 'next/server';
import { questService } from '@/lib/dbService';

// 사용자 퀘스트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as 'selected' | 'completed' | undefined;
    
    const quests = questService.getUserQuests(params.id, status);
    return NextResponse.json(quests);
  } catch (error) {
    console.error('사용자 퀘스트 조회 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 퀘스트 선택
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { questId } = body;
    
    questService.selectQuest(params.id, questId);
    
    return NextResponse.json({ message: '퀘스트가 선택되었습니다.' });
  } catch (error) {
    console.error('퀘스트 선택 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

// 퀘스트 제거
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const questId = searchParams.get('questId');
    
    if (!questId) {
      return NextResponse.json({ error: '퀘스트 ID가 필요합니다.' }, { status: 400 });
    }
    
    questService.removeQuest(params.id, questId);
    
    return NextResponse.json({ message: '퀘스트가 제거되었습니다.' });
  } catch (error) {
    console.error('퀘스트 제거 오류:', error);
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
