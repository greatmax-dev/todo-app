import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/database";
import { CreateTeamRequest, TeamResponse, TeamWithMembers } from "@/types";
import { v4 as uuidv4 } from "uuid";

// 팀 목록 조회
export async function GET() {
  try {
    const teamsStmt = db.prepare(`
      SELECT 
        t.*,
        u.name as leaderName,
        u.nickname as leaderNickname,
        COUNT(tm.userId) as memberCount,
        COALESCE(SUM(u2.totalPoints), 0) as totalPoints,
        COALESCE(AVG(u2.level), 0) as averageLevel
      FROM teams t
      LEFT JOIN users u ON t.leaderId = u.id
      LEFT JOIN team_members tm ON t.id = tm.teamId
      LEFT JOIN users u2 ON tm.userId = u2.id
      GROUP BY t.id
      ORDER BY totalPoints DESC, memberCount DESC
    `);

    const teams = teamsStmt.all() as any[];

    const teamsWithMembers: TeamWithMembers[] = teams.map(team => ({
      id: team.id,
      name: team.name,
      description: team.description,
      leaderId: team.leaderId,
      maxMembers: team.maxMembers,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: [],
      memberCount: team.memberCount || 0,
      totalPoints: team.totalPoints || 0,
      averageLevel: Math.round((team.averageLevel || 0) * 10) / 10,
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
    }));

    return NextResponse.json(teamsWithMembers);
  } catch (error) {
    console.error("팀 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 팀 생성
export async function POST(request: NextRequest) {
  try {
    const body: CreateTeamRequest = await request.json();
    const { name, description } = body;

    // 헤더에서 사용자 ID 가져오기 (실제로는 인증 토큰에서 추출)
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "사용자 인증이 필요합니다." },
        { status: 401 }
      );
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "팀 이름을 입력해주세요." },
        { status: 400 }
      );
    }

    if (name.length > 20) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "팀 이름은 20자 이하로 입력해주세요." },
        { status: 400 }
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

    // 팀 이름 중복 확인
    const existingTeamStmt = db.prepare("SELECT id FROM teams WHERE name = ?");
    const existingTeam = existingTeamStmt.get(name);
    
    if (existingTeam) {
      return NextResponse.json<TeamResponse>(
        { success: false, message: "이미 존재하는 팀 이름입니다." },
        { status: 409 }
      );
    }

    const teamId = uuidv4();
    const now = new Date().toISOString();

    // 팀 생성
    const createTeamStmt = db.prepare(`
      INSERT INTO teams (id, name, description, leaderId, maxMembers, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    createTeamStmt.run(teamId, name, description || "", userId, 4, now, now);

    // 팀장을 팀 멤버로 추가
    const addMemberStmt = db.prepare(`
      INSERT INTO team_members (teamId, userId, role, joinedAt)
      VALUES (?, ?, ?, ?)
    `);
    
    addMemberStmt.run(teamId, userId, "leader", now);

    // 생성된 팀 정보 조회
    const teamStmt = db.prepare(`
      SELECT 
        t.*,
        u.name as leaderName,
        u.nickname as leaderNickname,
        u.totalPoints as leaderTotalPoints,
        u.level as leaderLevel
      FROM teams t
      LEFT JOIN users u ON t.leaderId = u.id
      WHERE t.id = ?
    `);
    
    const team = teamStmt.get(teamId) as any;

    const teamWithMembers: TeamWithMembers = {
      id: team.id,
      name: team.name,
      description: team.description,
      leaderId: team.leaderId,
      maxMembers: team.maxMembers,
      createdAt: team.createdAt,
      updatedAt: team.updatedAt,
      members: [{
        id: 0,
        teamId: team.id,
        userId: team.leaderId,
        role: "leader" as const,
        joinedAt: now,
        user: {
          id: team.leaderId,
          name: team.leaderName,
          nickname: team.leaderNickname,
          level: team.leaderLevel,
          experience: 0,
          points: 0,
          totalPoints: team.leaderTotalPoints,
          streak: 0,
          lastLogin: ""
        }
      }],
      memberCount: 1,
      totalPoints: team.leaderTotalPoints || 0,
      averageLevel: team.leaderLevel || 1,
      leader: {
        id: team.leaderId,
        name: team.leaderName,
        nickname: team.leaderNickname,
        level: team.leaderLevel,
        experience: 0,
        points: 0,
        totalPoints: team.leaderTotalPoints,
        streak: 0,
        lastLogin: ""
      }
    };

    return NextResponse.json<TeamResponse>({
      success: true,
      team: teamWithMembers,
      message: "팀이 생성되었습니다!"
    });

  } catch (error) {
    console.error("팀 생성 오류:", error);
    return NextResponse.json<TeamResponse>(
      { success: false, message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
