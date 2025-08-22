import db from "./database";
import { User, Quest, Reward } from "@/types";

// 사용자 관련 서비스
export const userService = {
  // 사용자 조회
  getUser: (id: string): User | null => {
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = stmt.get(id) as
      | {
          id: string;
          name: string;
          level: number;
          experience: number;
          points: number;
          totalPoints: number;
          streak: number;
          lastLogin: string;
        }
      | undefined;

    if (!user) return null;

    return {
      id: user.id,
      name: user.name,
      level: user.level,
      experience: user.experience,
      points: user.points,
      totalPoints: user.totalPoints,
      streak: user.streak,
      lastLogin: user.lastLogin,
    };
  },

  // 사용자 업데이트
  updateUser: (user: Partial<User> & { id: string }): void => {
    const fields = Object.keys(user).filter((key) => key !== "id");
    const values = fields
      .map((field) => user[field as keyof typeof user])
      .filter((value) => value !== undefined);

    if (fields.length === 0) return;

    const setClause = fields.map((field) => `${field} = ?`).join(", ");
    const sql = `UPDATE users SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

    const stmt = db.prepare(sql);
    stmt.run(...values, user.id);
  },

  // 사용자 생성
  createUser: (user: Omit<User, "id">): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const stmt = db.prepare(`
      INSERT INTO users (id, name, level, experience, points, totalPoints, streak, lastLogin)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      user.name,
      user.level,
      user.experience,
      user.points,
      user.totalPoints,
      user.streak,
      user.lastLogin
    );

    return id;
  },
};

// 퀘스트 관련 서비스
export const questService = {
  // 모든 퀘스트 조회
  getAllQuests: (): Quest[] => {
    const stmt = db.prepare("SELECT * FROM quests ORDER BY category, title");
    const quests = stmt.all() as {
      id: string;
      title: string;
      description: string;
      difficulty: string;
      points: number;
      category: string;
      icon: string;
    }[];

    return quests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      // difficulty 필드를 Quest 타입에 맞게 변환
      difficulty: quest.difficulty as "easy" | "medium" | "hard",
      points: quest.points,
      category: quest.category,
      icon: quest.icon,
    }));
  },

  // 카테고리별 퀘스트 조회
  getQuestsByCategory: (category: string): Quest[] => {
    const stmt = db.prepare(
      "SELECT * FROM quests WHERE category = ? ORDER BY title"
    );
    const quests = stmt.all(category) as {
      id: string;
      title: string;
      description: string;
      difficulty: string;
      points: number;
      category: string;
      icon: string;
    }[];

    return quests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      // difficulty 필드를 Quest 타입에 맞게 변환
      difficulty: quest.difficulty as "easy" | "medium" | "hard",
      points: quest.points,
      category: quest.category,
      icon: quest.icon,
    }));
  },

  // 사용자 퀘스트 조회
  getUserQuests: (
    userId: string,
    status?: "selected" | "completed"
  ): Quest[] => {
    let sql = `
      SELECT q.*, uq.status, uq.completedAt
      FROM quests q
      JOIN user_quests uq ON q.id = uq.questId
      WHERE uq.userId = ?
    `;

    if (status) {
      sql += " AND uq.status = ?";
    }

    sql += " ORDER BY uq.createdAt DESC";

    const stmt = db.prepare(sql);

    type QuestWithStatus = {
      id: string;
      title: string;
      description: string;
      difficulty: string;
      points: number;
      category: string;
      icon: string;
      status: string;
      completedAt: string;
    };

    const quests = status
      ? (stmt.all(userId, status) as QuestWithStatus[])
      : (stmt.all(userId) as QuestWithStatus[]);

    return quests.map((quest) => ({
      id: quest.id,
      title: quest.title,
      description: quest.description,
      difficulty: quest.difficulty as "easy" | "medium" | "hard",
      points: quest.points,
      category: quest.category,
      icon: quest.icon,
    }));
  },

  // 퀘스트 선택
  selectQuest: (userId: string, questId: string): void => {
    const stmt = db.prepare(`
      INSERT INTO user_quests (userId, questId, status)
      VALUES (?, ?, 'selected')
    `);
    stmt.run(userId, questId);
  },

  // 퀘스트 제거
  removeQuest: (userId: string, questId: string): void => {
    const stmt = db.prepare(`
      DELETE FROM user_quests 
      WHERE userId = ? AND questId = ? AND status = 'selected'
    `);
    stmt.run(userId, questId);
  },

  // 퀘스트 완료
  completeQuest: (userId: string, questId: string): void => {
    try {
      // 매번 새로운 완료 기록 생성 (중복 허용)
      const insertStmt = db.prepare(`
        INSERT INTO user_quests (userId, questId, status, completedAt)
        VALUES (?, ?, 'completed', ?)
      `);
      insertStmt.run(userId, questId, new Date().toISOString());
    } catch (error) {
      console.error(
        `퀘스트 완료 실패 - userId: ${userId}, questId: ${questId}`,
        error
      );
      throw error; // 상위로 오류 전파
    }
  },
};

// 보상 관련 서비스
export const rewardService = {
  // 모든 보상 조회
  getAllRewards: (): Reward[] => {
    const stmt = db.prepare("SELECT * FROM rewards ORDER BY points");
    const rewards = stmt.all() as {
      id: string;
      title: string;
      description: string;
      points: number;
      type: string;
      duration: number;
      icon: string;
    }[];

    return rewards.map((reward) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      type: reward.type as "youtube" | "game" | "snack" | "money",
      duration: reward.duration,
      icon: reward.icon,
    }));
  },

  // 보상 사용 기록
  useReward: (userId: string, rewardId: string): void => {
    const stmt = db.prepare(`
      INSERT INTO user_rewards (userId, rewardId)
      VALUES (?, ?)
    `);
    stmt.run(userId, rewardId);
  },

  // 사용자 보상 사용 기록 조회
  getUserRewards: (userId: string): Reward[] => {
    const stmt = db.prepare(`
      SELECT r.*, ur.usedAt
      FROM rewards r
      JOIN user_rewards ur ON r.id = ur.rewardId
      WHERE ur.userId = ?
      ORDER BY ur.usedAt DESC
    `);

    const rewards = stmt.all(userId) as {
      id: string;
      title: string;
      description: string;
      points: number;
      type: string;
      duration: number;
      icon: string;
      usedAt: string;
    }[];

    return rewards.map((reward) => ({
      id: reward.id,
      title: reward.title,
      description: reward.description,
      points: reward.points,
      type: reward.type as "youtube" | "game" | "snack" | "money",
      duration: reward.duration,
      icon: reward.icon,
    }));
  },
};

// 통계 관련 서비스
export const statsService = {
  // 사용자 통계 조회
  getUserStats: (userId: string) => {
    // 선택된 퀘스트 수
    const selectedStmt = db.prepare(`
      SELECT COUNT(*) as count FROM user_quests 
      WHERE userId = ? AND status = 'selected'
    `);
    const selectedCount = selectedStmt.get(userId) as
      | { count: number }
      | undefined;

    // 완료된 퀘스트 수
    const completedStmt = db.prepare(`
      SELECT COUNT(*) as count FROM user_quests 
      WHERE userId = ? AND status = 'completed'
    `);
    const completedCount = completedStmt.get(userId) as
      | { count: number }
      | undefined;

    // 총 획득 포인트
    const totalPointsStmt = db.prepare(`
      SELECT COALESCE(SUM(q.points), 0) as total FROM user_quests uq
      JOIN quests q ON uq.questId = q.id
      WHERE uq.userId = ? AND uq.status = 'completed'
    `);
    const totalPoints = totalPointsStmt.get(userId) as
      | { total: number }
      | undefined;

    return {
      selectedQuests: selectedCount?.count ?? 0,
      completedQuests: completedCount?.count ?? 0,
      totalPoints: totalPoints?.total ?? 0,
    };
  },
};
