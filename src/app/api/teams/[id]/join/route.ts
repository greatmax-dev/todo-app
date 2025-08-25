import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { TeamResponse } from "@/types";

// 팀 가입
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "사용자 인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 팀 존재 확인
    const teamStmt = db.prepare("SELECT * FROM teams WHERE id = ?");
    const team = teamStmt.get(teamId);

    if (!team) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "팀을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 사용자가 이미 팀에 가입되어 있는지 확인
    const existingMemberStmt = db.prepare("SELECT teamId FROM team_members WHERE userId = ?");
    const existingMember = existingMemberStmt.get(userId);
    
    if (existingMember) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "이미 팀에 가입되어 있습니다." },
        { status: 400 }
      );
    }

    // 팀 멤버 수 확인
    const memberCountStmt = db.prepare("SELECT COUNT(*) as count FROM team_members WHERE teamId = ?");
    const memberCount = memberCountStmt.get(teamId) as any;

    if (memberCount.count >= (team as any).maxMembers) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "팀이 가득 찼습니다." },
        { status: 400 }
      );
    }

    // 팀 가입
    const joinTeamStmt = db.prepare(`
      INSERT INTO team_members (teamId, userId, role, joinedAt)
      VALUES (?, ?, ?, ?)
    `);
    
    joinTeamStmt.run(teamId, userId, "member", new Date().toISOString());

    return NextResponse.json<TeamResponse>({
      success: true,
      message: "팀에 가입되었습니다!"
    });

  } catch (error) {
    console.error("팀 가입 오류:", error);
    return NextResponse.json<TeamResponse>(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
