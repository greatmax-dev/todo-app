import { NextResponse } from "next/server";
import db from "@/lib/database";

export async function GET() {
  try {
    // 팀 랭킹 조회 (총 포인트 기준)
    const teamRankingStmt = db.prepare(`
      SELECT 
        t.id,
        t.name,
        t.description,
        t.leaderId,
        t.maxMembers,
        t.createdAt,
        u.name as leaderName,
        u.nickname as leaderNickname,
        COUNT(tm.userId) as memberCount,
        COALESCE(SUM(u2.totalPoints), 0) as totalPoints,
        COALESCE(AVG(u2.level), 0) as averageLevel,
        COALESCE(AVG(u2.streak), 0) as averageStreak
      FROM teams t
      LEFT JOIN users u ON t.leaderId = u.id
      LEFT JOIN team_members tm ON t.id = tm.teamId
      LEFT JOIN users u2 ON tm.userId = u2.id
      GROUP BY t.id
      HAVING memberCount > 0
      ORDER BY totalPoints DESC, averageLevel DESC, memberCount DESC
      LIMIT 50
    `);
    
    const teamRanking = teamRankingStmt.all();

    // 전체 팀 통계
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(DISTINCT t.id) as totalTeams,
        AVG(team_stats.totalPoints) as avgTotalPoints,
        MAX(team_stats.totalPoints) as maxTotalPoints,
        AVG(team_stats.memberCount) as avgMemberCount,
        AVG(team_stats.averageLevel) as avgLevel,
        MAX(team_stats.averageLevel) as maxLevel
      FROM teams t
      LEFT JOIN (
        SELECT 
          t2.id,
          COUNT(tm.userId) as memberCount,
          COALESCE(SUM(u.totalPoints), 0) as totalPoints,
          COALESCE(AVG(u.level), 0) as averageLevel
        FROM teams t2
        LEFT JOIN team_members tm ON t2.id = tm.teamId
        LEFT JOIN users u ON tm.userId = u.id
        GROUP BY t2.id
      ) team_stats ON t.id = team_stats.id
      WHERE team_stats.memberCount > 0
    `);
    
    const stats = statsStmt.get() as any;

    return NextResponse.json({
      teamRanking: teamRanking.map((team: any, index: number) => ({
        ...team,
        rank: index + 1,
        displayName: team.name,
        leaderDisplayName: team.leaderNickname || team.leaderName,
        totalPoints: team.totalPoints || 0,
        averageLevel: Math.round((team.averageLevel || 0) * 10) / 10,
        averageStreak: Math.round((team.averageStreak || 0) * 10) / 10,
        memberCount: team.memberCount || 0
      })),
      stats: {
        totalTeams: stats.totalTeams || 0,
        avgTotalPoints: Math.round(stats.avgTotalPoints || 0),
        maxTotalPoints: stats.maxTotalPoints || 0,
        avgMemberCount: Math.round((stats.avgMemberCount || 0) * 10) / 10,
        avgLevel: Math.round((stats.avgLevel || 0) * 10) / 10,
        maxLevel: Math.round((stats.maxLevel || 0) * 10) / 10
      }
    });
  } catch (error) {
    console.error("팀 랭킹 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
