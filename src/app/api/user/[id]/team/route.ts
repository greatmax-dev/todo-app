import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { TeamWithMembers, TeamMember } from "@/types";

// 사용자의 팀 정보 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    // 사용자가 속한 팀 조회
    const userTeamStmt = db.prepare(`
      SELECT 
        t.*,
        tm.role,
        tm.joinedAt,
        u.name as leaderName,
        u.nickname as leaderNickname
      FROM team_members tm
      JOIN teams t ON tm.teamId = t.id
      LEFT JOIN users u ON t.leaderId = u.id
      WHERE tm.userId = ?
    `);
    
    const userTeam = userTeamStmt.get(userId) as any;

    if (!userTeam) {
      return NextResponse.json(null);
    }

    // 팀 멤버들 조회
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
    
    const members = membersStmt.all(userTeam.id) as any[];

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
      id: userTeam.id,
      name: userTeam.name,
      description: userTeam.description,
      leaderId: userTeam.leaderId,
      maxMembers: userTeam.maxMembers,
      createdAt: userTeam.createdAt,
      updatedAt: userTeam.updatedAt,
      members: teamMembers,
      memberCount: teamMembers.length,
      totalPoints,
      averageLevel: Math.round(averageLevel * 10) / 10,
      leader: {
        id: userTeam.leaderId,
        name: userTeam.leaderName,
        nickname: userTeam.leaderNickname,
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
    console.error("사용자 팀 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
