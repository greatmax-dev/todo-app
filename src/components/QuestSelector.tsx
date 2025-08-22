"use client";

import { useState, useEffect } from "react";
import { Quest } from "@/types";
import { motion } from "framer-motion";
import { X, Plus, Star } from "lucide-react";

interface QuestSelectorProps {
  onAddQuest: (quest: Quest) => void;
  selectedQuests: Quest[];
  onRemoveQuest: (questId: string) => void;
}

export default function QuestSelector({
  onAddQuest,
  selectedQuests,
  onRemoveQuest,
}: QuestSelectorProps) {
  const [availableQuests, setAvailableQuests] = useState<Quest[]>([]);

  // 데이터베이스에서 퀘스트 로드
  useEffect(() => {
    const loadQuests = async () => {
      try {
        const response = await fetch("/api/quests");
        if (response.ok) {
          const quests = await response.json();
          setAvailableQuests(quests);
        }
      } catch (error) {
        console.error("퀘스트 로드 오류:", error);
      }
    };

    loadQuests();
  }, []);

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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          🎯 오늘의 퀘스트를 고르세요!
        </h2>
      </div>

      {/* 선택된 퀘스트 미리보기 */}
      {selectedQuests.length > 0 && (
        <div className="bg-white/20 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-white mb-4">
            선택된 퀘스트 ({selectedQuests.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedQuests.map((quest, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{quest.icon}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-800">
                      {quest.title}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {quest.category}
                      </span>
                      <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                        ⭐ {quest.points} 포인트
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {quest.description}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onRemoveQuest(quest.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={20} />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 사용 가능한 퀘스트 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableQuests.map((quest) => {
          const isSelected = selectedQuests.some((q) => q.id === quest.id);

          return (
            <motion.div
              key={quest.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative bg-white rounded-xl p-6 shadow-lg transition-all ${
                isSelected ? "ring-2 ring-purple-500 bg-purple-50" : ""
              }`}
            >
              {/* 난이도 배지 */}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 ${getDifficultyColor(
                    quest.difficulty
                  )}`}
                >
                  <Star size={12} className="mr-1" />
                  {getDifficultyText(quest.difficulty)}
                </span>
              </div>

              {/* 퀘스트 내용 */}
              <div className="mb-4">
                {/* 헤더: 아이콘, 제목, 난이도 */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className="text-3xl">{quest.icon}</span>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-bold text-gray-800">
                      {quest.title}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                        {quest.category}
                      </span>
                      <span className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs font-semibold">
                        ⭐ {quest.points} 포인트
                      </span>
                    </div>
                  </div>
                </div>

                {/* 설명 */}
                <p className="text-gray-600 text-sm text-left">
                  {quest.description}
                </p>
              </div>

              {/* 액션 버튼 */}
              {isSelected ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed"
                >
                  이미 선택됨
                </button>
              ) : (
                <button
                  onClick={() => onAddQuest(quest)}
                  className={`w-full py-2 rounded-lg transition-all ${"bg-purple-600 text-white hover:bg-purple-700"}`}
                >
                  <span className="flex items-center justify-center">
                    <Plus size={16} className="mr-2" />
                    퀘스트 추가
                  </span>
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
