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
  level: number;
  experience: number;
  points: number;
  totalPoints: number;
  streak: number;
  lastLogin: string;
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
