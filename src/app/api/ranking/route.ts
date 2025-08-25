import { NextResponse } from "next/server";
import db from "@/lib/database";

export async function GET() {
  try {
    // 포인트 랭킹 조회 (총 포인트 기준)
    const pointsRankingStmt = db.prepare(`
      SELECT 
        id, 
        name, 
        nickname,
        points, 
        totalPoints, 
        level, 
        experience,
        streak,
        lastLogin
      FROM users 
      ORDER BY totalPoints DESC, points DESC, level DESC
      LIMIT 50
    `);
    
    const pointsRanking = pointsRankingStmt.all();

    // 레벨 랭킹 조회
    const levelRankingStmt = db.prepare(`
      SELECT 
        id, 
        name, 
        nickname,
        points, 
        totalPoints, 
        level, 
        experience,
        streak,
        lastLogin
      FROM users 
      ORDER BY level DESC, experience DESC, totalPoints DESC
      LIMIT 50
    `);
    
    const levelRanking = levelRankingStmt.all();

    // 연속 출석 랭킹 조회
    const streakRankingStmt = db.prepare(`
      SELECT 
        id, 
        name, 
        nickname,
        points, 
        totalPoints, 
        level, 
        experience,
        streak,
        lastLogin
      FROM users 
      ORDER BY streak DESC, totalPoints DESC, level DESC
      LIMIT 50
    `);
    
    const streakRanking = streakRankingStmt.all();

    // 전체 통계
    const statsStmt = db.prepare(`
      SELECT 
        COUNT(*) as totalUsers,
        AVG(totalPoints) as avgTotalPoints,
        MAX(totalPoints) as maxTotalPoints,
        AVG(level) as avgLevel,
        MAX(level) as maxLevel,
        AVG(streak) as avgStreak,
        MAX(streak) as maxStreak
      FROM users
    `);
    
    const stats = statsStmt.get();

    return NextResponse.json({
      pointsRanking: pointsRanking.map((user, index) => ({
        ...user,
        rank: index + 1,
        displayName: user.nickname || user.name,
      })),
      levelRanking: levelRanking.map((user, index) => ({
        ...user,
        rank: index + 1,
        displayName: user.nickname || user.name,
      })),
      streakRanking: streakRanking.map((user, index) => ({
        ...user,
        rank: index + 1,
        displayName: user.nickname || user.name,
      })),
      stats: {
        totalUsers: stats.totalUsers,
        avgTotalPoints: Math.round(stats.avgTotalPoints || 0),
        maxTotalPoints: stats.maxTotalPoints || 0,
        avgLevel: Math.round((stats.avgLevel || 0) * 10) / 10,
        maxLevel: stats.maxLevel || 1,
        avgStreak: Math.round((stats.avgStreak || 0) * 10) / 10,
        maxStreak: stats.maxStreak || 0,
      }
    });
  } catch (error) {
    console.error("랭킹 조회 오류:", error);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
