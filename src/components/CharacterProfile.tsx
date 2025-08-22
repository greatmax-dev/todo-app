"use client";

import { User } from "@/types";
import { motion } from "framer-motion";
import { Award, Target } from "lucide-react";

interface CharacterProfileProps {
  user: User;
}

export default function CharacterProfile({ user }: CharacterProfileProps) {
  const experienceToNextLevel = 100 - (user.experience % 100);
  const progressToNextLevel = (user.experience % 100) / 100;

  const getLevelTitle = (level: number) => {
    if (level <= 5) return "초보 모험가";
    if (level <= 10) return "견습 모험가";
    if (level <= 15) return "숙련 모험가";
    if (level <= 20) return "전문 모험가";
    if (level <= 25) return "마스터 모험가";
    return "전설의 모험가";
  };

  const getLevelColor = (level: number) => {
    if (level <= 5) return "text-green-500";
    if (level <= 10) return "text-blue-500";
    if (level <= 15) return "text-purple-500";
    if (level <= 20) return "text-yellow-500";
    if (level <= 25) return "text-red-500";
    return "text-indigo-500";
  };

  const getAchievements = () => {
    const achievements = [];

    if (user.streak >= 3)
      achievements.push({
        title: "3일 연속 달성",
        icon: "🔥",
        color: "text-orange-500",
      });
    if (user.streak >= 7)
      achievements.push({
        title: "1주일 연속 달성",
        icon: "🔥",
        color: "text-red-500",
      });
    if (user.totalPoints >= 100)
      achievements.push({
        title: "100포인트 달성",
        icon: "⭐",
        color: "text-yellow-500",
      });
    if (user.totalPoints >= 500)
      achievements.push({
        title: "500포인트 달성",
        icon: "⭐",
        color: "text-yellow-500",
      });
    if (user.level >= 5)
      achievements.push({
        title: "레벨 5 달성",
        icon: "🎯",
        color: "text-green-500",
      });
    if (user.level >= 10)
      achievements.push({
        title: "레벨 10 달성",
        icon: "🎯",
        color: "text-blue-500",
      });

    return achievements;
  };

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          👤 내 캐릭터 프로필
        </h2>
        <p className="text-white/80 text-lg">
          나의 성장 과정과 업적을 확인해보세요!
        </p>
      </div>

      {/* 캐릭터 카드 */}
      <div className="bg-white/20 rounded-lg p-8">
        <div className="text-center mb-8">
          <div className="text-8xl mb-4">🧙‍♂️</div>
          <h3 className="text-2xl font-bold text-white mb-2">{user.name}</h3>
          <p className={`text-lg font-semibold ${getLevelColor(user.level)}`}>
            {getLevelTitle(user.level)}
          </p>
        </div>

        {/* 레벨 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {user.level}
            </div>
            <div className="text-white/80">현재 레벨</div>
          </div>
          <div className="bg-white/20 rounded-lg p-6 text-center">
            <div className="text-4xl font-bold text-white mb-2">
              {user.experience}
            </div>
            <div className="text-white/80">총 경험치</div>
          </div>
        </div>

        {/* 레벨업 진행률 */}
        <div className="mb-8">
          <div className="flex justify-between text-white mb-2">
            <span>다음 레벨까지</span>
            <span>{experienceToNextLevel} 경험치 필요</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4">
            <motion.div
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressToNextLevel * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* 통계 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/20 rounded-lg p-6 text-center"
        >
          <div className="text-3xl mb-2">⭐</div>
          <div className="text-2xl font-bold text-white">{user.points}</div>
          <div className="text-white/80 text-sm">보유 포인트</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/20 rounded-lg p-6 text-center"
        >
          <div className="text-3xl mb-2">🔥</div>
          <div className="text-2xl font-bold text-white">{user.streak}</div>
          <div className="text-white/80 text-sm">연속 달성일</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/20 rounded-lg p-6 text-center"
        >
          <div className="text-3xl mb-2">📊</div>
          <div className="text-2xl font-bold text-white">
            {user.totalPoints}
          </div>
          <div className="text-white/80 text-sm">총 획득 포인트</div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-white/20 rounded-lg p-6 text-center"
        >
          <div className="text-3xl mb-2">🎯</div>
          <div className="text-2xl font-bold text-white">
            {Math.floor(user.experience / 100)}
          </div>
          <div className="text-white/80 text-sm">완료한 레벨</div>
        </motion.div>
      </div>

      {/* 업적 */}
      <div className="bg-white/20 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
          <Award className="mr-2" />
          나의 업적
        </h3>

        {getAchievements().length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAchievements().map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg p-4 text-center"
              >
                <div className={`text-3xl mb-2 ${achievement.color}`}>
                  {achievement.icon}
                </div>
                <div className="font-semibold text-gray-800">
                  {achievement.title}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center text-white/80">
            <p className="text-lg">아직 업적이 없어요!</p>
            <p className="text-sm mt-2">
              퀘스트를 완료하고 연속으로 달성해보세요
            </p>
          </div>
        )}
      </div>

      {/* 다음 목표 */}
      <div className="bg-white/20 rounded-lg p-6">
        <h3 className="text-2xl font-bold text-white mb-6 text-center flex items-center justify-center">
          <Target className="mr-2" />
          다음 목표
        </h3>

        <div className="space-y-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <div className="font-semibold text-gray-800">
                    레벨 {user.level + 1} 달성
                  </div>
                  <div className="text-sm text-gray-600">
                    {experienceToNextLevel} 경험치 더 필요
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">진행률</div>
                <div className="text-lg font-bold text-purple-600">
                  {Math.round(progressToNextLevel * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">🔥</span>
                <div>
                  <div className="font-semibold text-gray-800">
                    연속 달성 기록 갱신
                  </div>
                  <div className="text-sm text-gray-600">
                    현재 {user.streak}일 연속
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">다음 목표</div>
                <div className="text-lg font-bold text-orange-600">
                  {user.streak + 1}일
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 힌트 */}
      <div className="text-center text-white/80">
        <p className="text-lg">
          💡 매일 퀘스트를 완료하면 레벨업과 업적을 달성할 수 있어요!
        </p>
        <p className="text-sm mt-2">
          연속으로 달성하면 추가 보너스도 받을 수 있어요
        </p>
      </div>
    </div>
  );
}
