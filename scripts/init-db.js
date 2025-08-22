const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// 데이터베이스 파일 경로
const dbPath = path.join(process.cwd(), "data", "questgame.db");

// data 디렉토리가 없으면 생성
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

console.log("데이터베이스 초기화 중...");
console.log(`데이터베이스 경로: ${dbPath}`);

// 데이터베이스 연결
const db = new Database(dbPath);

// 테이블 생성
const initDatabase = () => {
  console.log("테이블 생성 중...");

  // 사용자 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      level INTEGER DEFAULT 1,
      experience INTEGER DEFAULT 0,
      points INTEGER DEFAULT 0,
      totalPoints INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      lastLogin TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 퀘스트 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS quests (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      points INTEGER NOT NULL,
      category TEXT NOT NULL,
      icon TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 사용자 퀘스트 테이블 (선택된 퀘스트)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_quests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      questId TEXT NOT NULL,
      status TEXT DEFAULT 'selected', -- 'selected', 'completed'
      completedAt TEXT,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (questId) REFERENCES quests (id)
    )
  `);

  // 보상 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS rewards (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      points INTEGER NOT NULL,
      type TEXT NOT NULL,
      duration INTEGER,
      icon TEXT NOT NULL,
      createdAt TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 사용자 보상 사용 기록 테이블
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_rewards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      rewardId TEXT NOT NULL,
      usedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users (id),
      FOREIGN KEY (rewardId) REFERENCES rewards (id)
    )
  `);

  console.log("테이블 생성 완료");
};

// 기본 데이터 삽입
const insertDefaultData = () => {
  console.log("기본 데이터 삽입 중...");

  // 기본 퀘스트 데이터 삽입
  const insertDefaultQuests = db.prepare(`
    INSERT OR IGNORE INTO quests (id, title, description, difficulty, points, category, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultQuests = [
    ["1", "책상 정리", "책상을 정리", "easy", 10, "청소", "🧹"],
    ["2", "베토 숙제(단어암기)", "단어 암기", "medium", 20, "학습", "📚"],
    ["3", "베토 숙제(직독직해)", "직독직해 숙제", "medium", 20, "학습", "📚"],
    ["4", "책 읽기", "책을 30페이지 이상 읽어요", "easy", 10, "학습", "📖"],
    [
      "5",
      "스스로 수학공부",
      "스스로 선행을 해 보아요",
      "medium",
      20,
      "학습",
      "📚",
    ],
    ["6", "한우리 숙제", "한우리 숙제", "medium", 20, "학습", "📚"],
    ["7", "국어 비문학 독해", "국어 비문학", "medium", 20, "학습", "📚"],
    ["8", "운동하기", "친구와 탁구, 농구, 축구", "easy", 10, "건강", "💪"],
    [
      "9",
      "가족 돕기",
      "동생이랑 놀아주기, 청소하기, 설거지 하기, 식사 준비",
      "medium",
      10,
      "가족",
      "👨‍👩‍👧‍👦",
    ],
    [
      "10",
      "새로운 기술/지식 배우기",
      "새로운 기술/지식 배우기",
      "hard",
      30,
      "학습",
      "🚀",
    ],
  ];

  defaultQuests.forEach((quest) => {
    insertDefaultQuests.run(quest);
  });

  // 기본 보상 데이터 삽입
  const insertDefaultRewards = db.prepare(`
    INSERT OR IGNORE INTO rewards (id, title, description, points, type, duration, icon)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const defaultRewards = [
    [
      "1",
      "유튜브 10분",
      "유튜브를 10분 동안 시청할 수 있어요",
      20,
      "youtube",
      10,
      "📺",
    ],
    [
      "2",
      "유튜브 20분",
      "유튜브를 20분 동안 시청할 수 있어요",
      35,
      "youtube",
      20,
      "📺",
    ],
    [
      "3",
      "게임 15분",
      "게임을 15분 동안 플레이할 수 있어요",
      30,
      "game",
      15,
      "🎮",
    ],
    [
      "4",
      "게임 30분",
      "게임을 30분 동안 플레이할 수 있어요",
      55,
      "game",
      30,
      "🎮",
    ],
    [
      "5",
      "게임 60분",
      "게임을 60분 동안 플레이할 수 있어요",
      40,
      "game",
      60,
      "🎮",
    ],
    ["6", "용돈 1000원 교환권", "용돈 1000원", 1000, "money", 0, "💰"],
    ["7", "특별 뽀나스(현질)", "현질 5000원", 60, "money", 0, "💰"],
  ];

  defaultRewards.forEach((reward) => {
    insertDefaultRewards.run(reward);
  });

  // 기본 사용자 생성
  const insertDefaultUser = db.prepare(`
    INSERT OR IGNORE INTO users (id, name, level, experience, points, totalPoints, streak, lastLogin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDefaultUser.run("1", "수호", 1, 0, 0, 0, 0, new Date().toISOString());

  console.log("기본 데이터 삽입 완료");
};

// 메인 실행
try {
  initDatabase();
  insertDefaultData();
  console.log("데이터베이스 초기화 완료! 🎉");
} catch (error) {
  console.error("데이터베이스 초기화 오류:", error);
} finally {
  db.close();
}
