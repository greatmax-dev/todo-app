export interface Quest {
  id: string;
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
  category: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  nickname?: string;
  password?: string;
  level: number;
  experience: number;
  points: number;
  totalPoints: number;
  streak: number;
  lastLogin: string;
  isAdmin?: boolean;
}

export interface LoginRequest {
  name: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  nickname?: string;
  password?: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface RankingUser {
  id: string;
  name: string;
  nickname?: string;
  displayName: string;
  points: number;
  totalPoints: number;
  level: number;
  experience: number;
  streak: number;
  lastLogin: string;
  rank: number;
}

export interface RankingStats {
  totalUsers: number;
  avgTotalPoints: number;
  maxTotalPoints: number;
  avgLevel: number;
  maxLevel: number;
  avgStreak: number;
  maxStreak: number;
}

export interface RankingResponse {
  pointsRanking: RankingUser[];
  levelRanking: RankingUser[];
  streakRanking: RankingUser[];
  stats: RankingStats;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: number;
  teamId: string;
  userId: string;
  role: "leader" | "member";
  joinedAt: string;
  user?: User;
}

export interface TeamWithMembers extends Team {
  members: TeamMember[];
  memberCount: number;
  totalPoints: number;
  averageLevel: number;
  leader?: User;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
}

export interface JoinTeamRequest {
  teamId: string;
}

export interface TeamResponse {
  success: boolean;
  team?: TeamWithMembers;
  message?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  points: number;
  type: "youtube" | "game" | "snack" | "money";
  duration?: number; // 분 단위
  icon: string;
}
