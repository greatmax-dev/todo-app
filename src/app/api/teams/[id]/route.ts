import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { TeamWithMembers, TeamMember } from "@/types";

// 특정 팀 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // 팀 기본 정보 조회
    const teamStmt = db.prepare(`
      SELECT 
        t.*,
        u.name as leaderName,
        u.nickname as leaderNickname
      FROM teams t
      LEFT JOIN users u ON t.leaderId = u.id
      WHERE t.id = ?
    `);
    
    const team = teamStmt.get(id) as any;

    if (!team) {
      return NextResponse.json(
        { error: "팀을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 팀 멤버 조회
    const membersStmt = db.prepare(`
      SELECT 
        tm.*,
        u.name,
        u.nickname,
        u.level,
        u.experience,
        u.points,
        u.totalPoints,
        u.streak,
        u.lastLogin
      FROM team_members tm
      LEFT JOIN users u ON tm.userId = u.id
      WHERE tm.teamId = ?
      ORDER BY tm.role DESC, tm.joinedAt ASC
    `);
    
    const members = membersStmt.all(id) as any[];

    const teamMembers: TeamMember[] = members.map(member => ({
      id: member.id,
      teamId: member.teamId,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      user: {
        id: member.userId,
        name: member.name,
        nickname: member.nickname,
        level: member.level,
        experience: member.experience,
        points: member.points,
        totalPoints: member.totalPoints,
        streak: member.streak,
        lastLogin: member.lastLogin
      }
    }));

    const totalPoints = teamMembers.reduce((sum, member) => sum + (member.user?.totalPoints || 0), 0);
    const averageLevel = teamMembers.length > 0 
      ? teamMembers.reduce((sum, member) => sum + (member.user?.level || 0), 0) / teamMembers.length 
      : 0;

    const teamWithMembers: TeamWithMembers = {
      id: team.id,
      name: team.name,
      description: team.description,
      leaderId: team.leaderId,
      maxMembers: team.maxMembers,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: teamMembers,
      memberCount: teamMembers.length,
      totalPoints,
      averageLevel: Math.round(averageLevel * 10) / 10,
      leader: {
        id: team.leaderId,
        name: team.leaderName,
        nickname: team.leaderNickname,
        level: 0,
        experience: 0,
        points: 0,
        totalPoints: 0,
        streak: 0,
        lastLogin: ""
      }
    };

    return NextResponse.json(teamWithMembers);
  } catch (error) {
    console.error("팀 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 팀 삭제 (팀장만 가능)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = request.headers.get("x-user-id");

    if (!userId) {
      return NextResponse.json(
        { error: "사용자 인증이 필요합니다." },
        { status: 401 }
      );
    }

    // 팀 존재 확인 및 팀장 권한 확인
    const teamStmt = db.prepare("SELECT * FROM teams WHERE id = ? AND leaderId = ?");
    const team = teamStmt.get(id, userId);

    if (!team) {
      return NextResponse.json(
        { error: "팀을 찾을 수 없거나 삭제 권한이 없습니다." },
        { status: 404 }
      );
    }

    // 팀 멤버 삭제
    const deleteMembersStmt = db.prepare("DELETE FROM team_members WHERE teamId = ?");
    deleteMembersStmt.run(id);

    // 팀 삭제
    const deleteTeamStmt = db.prepare("DELETE FROM teams WHERE id = ?");
    deleteTeamStmt.run(id);

    return NextResponse.json({ message: "팀이 삭제되었습니다." });
  } catch (error) {
    console.error("팀 삭제 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
