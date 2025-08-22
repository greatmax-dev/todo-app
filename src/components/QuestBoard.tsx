"use client";

import { Quest } from "@/types";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Star, Trophy, Target } from "lucide-react";

interface QuestBoardProps {
  quests: Quest[];
  completedQuests: Quest[];
  onCompleteQuest: (quest: Quest) => void;
  onRemoveQuest: (questId: string) => void;
}

export default function QuestBoard({
  quests,
  completedQuests,
  onCompleteQuest,
  onRemoveQuest,
}: QuestBoardProps) {
  const totalPoints = quests.reduce((sum, quest) => sum + quest.points, 0);
  const completedPoints = completedQuests.reduce(
    (sum, quest) => sum + quest.points,
    0
  );
  const progress =
    quests.length > 0 ? (completedQuests.length / quests.length) * 100 : 0;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "text-green-500";
      case "medium":
        return "text-yellow-500";
      case "hard":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "쉬움";
      case "medium":
        return "보통";
      case "hard":
        return "어려움";
      default:
        return "";
    }
  };

  if (quests.length === 0 && completedQuests.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🎯</div>
        <h2 className="text-3xl font-bold text-white mb-4">
          아직 퀘스트가 없어요!
        </h2>
        <p className="text-white/80 text-lg mb-6">
          퀘스트 고르기에서 오늘 할 일을 선택해보세요
        </p>
        <div className="bg-white/20 rounded-lg p-6 inline-block">
          <p className="text-white text-lg">
            💡 퀘스트를 완료하면 포인트를 받을 수 있어요
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 진행 상황 요약 */}
      <div className="bg-white/20 rounded-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            📋 오늘의 퀘스트 보드
          </h2>
          <p className="text-white/80 text-lg">
            선택한 퀘스트를 완료하고 포인트를 모아보세요!
          </p>
        </div>

        {/* 진행률 바 */}
        <div className="mb-6">
          <div className="flex justify-between text-white mb-2">
            <span>진행률</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/30 rounded-full h-4">
            <motion.div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-4 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{quests.length}</div>
            <div className="text-white/80">선택된 퀘스트</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">
              {completedQuests.length}
            </div>
            <div className="text-white/80">완료된 퀘스트</div>
          </div>
          <div className="bg-white/20 rounded-lg p-4">
            <div className="text-2xl font-bold text-white">{totalPoints}</div>
            <div className="text-white/80">총 포인트</div>
          </div>
        </div>
      </div>

      {/* 진행 중인 퀘스트 */}
      {quests.length > 0 && (
        <div className="bg-white/20 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Target className="mr-2" />
            진행 중인 퀘스트
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quests.map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg p-4 shadow-lg"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-3xl">{quest.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {quest.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {quest.description}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${getDifficultyColor(
                      quest.difficulty
                    )}`}
                  >
                    <Star size={12} className="mr-1" />
                    {getDifficultyText(quest.difficulty)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ⭐ {quest.points} 포인트
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onRemoveQuest(quest.id)}
                      className="text-red-500 hover:text-red-700 transition-colors p-2"
                      title="퀘스트 제거"
                    >
                      <XCircle size={20} />
                    </button>
                    <button
                      onClick={() => onCompleteQuest(quest)}
                      className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                      title="퀘스트 완료"
                    >
                      <CheckCircle size={20} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 완료된 퀘스트 */}
      {completedQuests.length > 0 && (
        <div className="bg-white/20 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-4 flex items-center">
            <Trophy className="mr-2" />
            완료된 퀘스트
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedQuests.map((quest) => (
              <motion.div
                key={quest.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-green-50 border-2 border-green-200 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl">{quest.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800 line-through">
                      {quest.title}
                    </h4>
                    <p className="text-sm text-gray-600">{quest.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ✅ 완료! +{quest.points} 포인트
                  </div>
                  <span className="text-green-600 text-sm">
                    {new Date().toLocaleTimeString()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* 완료 요약 */}
          <div className="mt-6 text-center">
            <div className="bg-green-100 text-green-800 rounded-lg p-4 inline-block">
              <p className="text-lg font-semibold">
                🎉 오늘 {completedQuests.length}개의 퀘스트를 완료했어요!
              </p>
              <p className="text-sm mt-1">
                총 {completedPoints} 포인트를 획득했어요
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 힌트 */}
      <div className="text-center text-white/80">
        <p className="text-lg">
          💡 모든 퀘스트를 완료하면 보상 상점에서 포인트를 사용할 수 있어요!
        </p>
        <p className="text-sm mt-2">
          유튜브 시청, 게임 플레이 등 다양한 보상을 선택할 수 있어요
        </p>
      </div>
    </div>
  );
}
