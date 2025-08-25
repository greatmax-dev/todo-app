import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { TeamResponse } from "@/types";

// 팀 탈퇴
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

    // 팀 멤버인지 확인
    const memberStmt = db.prepare("SELECT * FROM team_members WHERE teamId = ? AND userId = ?");
    const member = memberStmt.get(teamId, userId) as any;

    if (!member) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "팀에 가입되어 있지 않습니다." },
        { status: 400 }
      );
    }

    // 팀장인 경우 다른 멤버가 있으면 탈퇴 불가
    if (member.role === "leader") {
      const otherMembersStmt = db.prepare("SELECT COUNT(*) as count FROM team_members WHERE teamId = ? AND userId != ?");
      const otherMembers = otherMembersStmt.get(teamId, userId) as any;

      if (otherMembers.count > 0) {
        return NextResponse.json<TeamResponse>(
          { success: false, message: "팀장은 다른 멤버가 있을 때 탈퇴할 수 없습니다. 팀을 삭제하거나 팀장을 위임해주세요." },
          { status: 400 }
        );
      }

      // 팀장이고 혼자인 경우 팀 삭제
      const deleteTeamStmt = db.prepare("DELETE FROM teams WHERE id = ?");
      deleteTeamStmt.run(teamId);
    }

    // 팀 멤버에서 제거
    const leaveMemberStmt = db.prepare("DELETE FROM team_members WHERE teamId = ? AND userId = ?");
    leaveMemberStmt.run(teamId, userId);

    return NextResponse.json<TeamResponse>({
      success: true,
      message: member.role === "leader" ? "팀이 삭제되었습니다." : "팀에서 탈퇴했습니다."
    });

  } catch (error) {
    console.error("팀 탈퇴 오류:", error);
    return NextResponse.json<TeamResponse>(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
