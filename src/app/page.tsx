"use client";

import { useState, useEffect } from "react";

import QuestSelector from "@/components/QuestSelector";
import QuestBoard from "@/components/QuestBoard";
import RewardShop from "@/components/RewardShop";
import CharacterProfile from "@/components/CharacterProfile";
import { Quest, User } from "@/types";

export default function Home() {
  const [user, setUser] = useState<User>({
    id: "1",
    name: "수호",
    level: 1,
    experience: 0,
    points: 0,
    totalPoints: 0,
    streak: 0,
    lastLogin: new Date().toDateString(),
  });

  const [selectedQuests, setSelectedQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<
    "quests" | "board" | "shop" | "profile"
  >("quests");

  // 데이터베이스에서 사용자 정보 로드
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const response = await fetch(`/api/user/${user.id}`);
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("사용자 데이터 로드 오류:", error);
      }
    };

    loadUserData();
  }, [user.id]);

  // 사용자 퀘스트 데이터 로드
  useEffect(() => {
    const loadUserQuests = async () => {
      try {
        // 선택된 퀘스트 로드
        const selectedResponse = await fetch(
          `/api/user/${user.id}/quests?status=selected`
        );
        if (selectedResponse.ok) {
          const selectedData = await selectedResponse.json();
          setSelectedQuests(selectedData);
        }

        // 완료된 퀘스트 로드
        const completedResponse = await fetch(
          `/api/user/${user.id}/quests?status=completed`
        );
        if (completedResponse.ok) {
          const completedData = await completedResponse.json();
          setCompletedQuests(completedData);
        }
      } catch (error) {
        console.error("퀘스트 데이터 로드 오류:", error);
      }
    };

    if (user.id) {
      loadUserQuests();
    }
  }, [user.id]);

  // 일일 출석 보너스 체크
  useEffect(() => {
    const today = new Date().toDateString();
    if (user.lastLogin !== today) {
      const updateAttendance = async () => {
        try {
          const newPoints = user.points + 5;
          const newTotalPoints = user.totalPoints + 5;
          const newStreak =
            user.lastLogin ===
            new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
              ? user.streak + 1
              : 1;

          const response = await fetch(`/api/user/${user.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              points: newPoints,
              totalPoints: newTotalPoints,
              lastLogin: today,
              streak: newStreak,
            }),
          });

          if (response.ok) {
            setUser((prev) => ({
              ...prev,
              points: newPoints,
              totalPoints: newTotalPoints,
              lastLogin: today,
              streak: newStreak,
            }));
          }
        } catch (error) {
          console.error("출석 보너스 업데이트 오류:", error);
        }
      };

      updateAttendance();
    }
  }, [user.lastLogin, user.id, user.points, user.totalPoints, user.streak]);

  const completeQuest = async (quest: Quest) => {
    try {
      const response = await fetch(`/api/user/${user.id}/quests/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questId: quest.id }),
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        setCompletedQuests((prev) => [...prev, quest]);
        setSelectedQuests((prev) => prev.filter((q) => q.id !== quest.id));

        // 사용자 정보 새로고침
        const userResponse = await fetch(`/api/user/${user.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          setUser(userData);
        }
      }
    } catch (error) {
      console.error("퀘스트 완료 오류:", error);
    }
  };

  const addQuest = async (quest: Quest) => {
    try {
      const response = await fetch(`/api/user/${user.id}/quests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ questId: quest.id }),
      });

      if (response.ok) {
        setSelectedQuests((prev) => [...prev, quest]);
      }
    } catch (error) {
      console.error("퀘스트 추가 오류:", error);
    }
  };

  const removeQuest = async (questId: string) => {
    try {
      const response = await fetch(
        `/api/user/${user.id}/quests?questId=${questId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setSelectedQuests((prev) => prev.filter((q) => q.id !== questId));
      }
    } catch (error) {
      console.error("퀘스트 제거 오류:", error);
    }
  };

  const spendPoints = async (amount: number, rewardId?: string) => {
    try {
      if (rewardId) {
        // 보상 교환 시: 보상 사용 API 호출
        const response = await fetch(`/api/user/${user.id}/rewards`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rewardId: rewardId,
            points: amount,
          }),
        });

        if (response.ok) {
          // 보상 교환 성공 시 사용자 정보 새로고침
          const userResponse = await fetch(`/api/user/${user.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUser(userData);
          }
        }
      } else {
        // 일반 포인트 차감 시: 사용자 API 직접 호출
        const response = await fetch(`/api/user/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            points: user.points - amount,
          }),
        });

        if (response.ok) {
          setUser((prev) => ({
            ...prev,
            points: prev.points - amount,
          }));
        }
      }
    } catch (error) {
      console.error("포인트 차감 오류:", error);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-400">
      {/* 헤더 */}
      <header className="bg-white/20 backdrop-blur-md border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-white">🎮 수호의 퀘스트</h1>
            <div className="flex items-center space-x-4 text-white">
              <div className="bg-white/20 px-3 py-2 rounded-lg">
                <span className="text-sm">⭐ {user.points} 포인트</span>
              </div>
              <div className="bg-white/20 px-3 py-2 rounded-lg">
                <span className="text-sm">🔥 {user.streak}일 연속</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 탭 */}
      <nav className="bg-white/20 backdrop-blur-md border-b border-white/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              { id: "quests", label: "퀘스트 고르기", icon: "🎯" },
              { id: "board", label: "퀘스트 보드", icon: "📋" },
              { id: "shop", label: "보상 상점", icon: "🏪" },
              { id: "profile", label: "내 캐릭터", icon: "👤" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "quests" | "board" | "shop" | "profile"
                  )
                }
                className={`flex-1 py-3 px-4 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-purple-600 font-semibold"
                    : "text-white hover:bg-white/20"
                }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {activeTab === "quests" && (
          <QuestSelector
            onAddQuest={addQuest}
            selectedQuests={selectedQuests}
            onRemoveQuest={removeQuest}
          />
        )}

        {activeTab === "board" && (
          <QuestBoard
            quests={selectedQuests}
            completedQuests={completedQuests}
            onCompleteQuest={completeQuest}
            onRemoveQuest={removeQuest}
          />
        )}

        {activeTab === "shop" && (
          <RewardShop userPoints={user.points} onSpendPoints={spendPoints} />
        )}

        {activeTab === "profile" && <CharacterProfile user={user} />}
      </div>
    </main>
  );
}
