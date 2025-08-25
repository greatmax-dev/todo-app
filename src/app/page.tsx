"use client";

import { useState, useEffect } from "react";
import { LogOut, Settings } from "lucide-react";

import QuestSelector from "@/components/QuestSelector";
import QuestBoard from "@/components/QuestBoard";
import RewardShop from "@/components/RewardShop";
import RewardHistory from "@/components/RewardHistory";
import CharacterProfile from "@/components/CharacterProfile";
import LoginForm from "@/components/LoginForm";
import Ranking from "@/components/Ranking";
import Teams from "@/components/Teams";
import { useAuth } from "@/contexts/AuthContext";
import { Quest } from "@/types";

export default function Home() {
  const { user: authUser, login, logout, isLoading } = useAuth();

  const [selectedQuests, setSelectedQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<
    "quests" | "board" | "shop" | "history" | "profile" | "ranking" | "teams"
  >("quests");

  // 사용자 퀘스트 데이터 로드
  useEffect(() => {
    if (!authUser?.id) return;
    const loadUserQuests = async () => {
      try {
        // 선택된 퀘스트 로드
        const selectedResponse = await fetch(
          `/api/user/${authUser.id}/quests?status=selected`
        );
        if (selectedResponse.ok) {
          const selectedData = await selectedResponse.json();
          setSelectedQuests(selectedData);
        }

        // 완료된 퀘스트 로드
        const completedResponse = await fetch(
          `/api/user/${authUser.id}/quests?status=completed`
        );
        if (completedResponse.ok) {
          const completedData = await completedResponse.json();
          setCompletedQuests(completedData);
        }
      } catch (error) {
        console.error("퀘스트 데이터 로드 오류:", error);
      }
    };

    loadUserQuests();
  }, [authUser?.id]);

  // 일일 출석 보너스 체크
  useEffect(() => {
    if (!authUser?.id) return;
    
    const today = new Date().toDateString();
    if (authUser.lastLogin !== today) {
      const updateAttendance = async () => {
        try {
          const newPoints = authUser.points + 5;
          const newTotalPoints = authUser.totalPoints + 5;
          const newStreak =
            authUser.lastLogin ===
            new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString()
              ? authUser.streak + 1
              : 1;

          const response = await fetch(`/api/user/${authUser.id}`, {
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
            const updatedUser = { ...authUser, points: newPoints, totalPoints: newTotalPoints, lastLogin: today, streak: newStreak };
            login(updatedUser);
          }
        } catch (error) {
          console.error("출석 보너스 업데이트 오류:", error);
        }
      };

      updateAttendance();
    }
  }, [authUser, login]);

  // 로딩 중이거나 로그인하지 않은 경우 처리
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <LoginForm onLogin={login} />;
  }

  const completeQuest = async (quest: Quest) => {
    if (!authUser?.id) return;
    
    try {
      const response = await fetch(`/api/user/${authUser.id}/quests/complete`, {
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
        const userResponse = await fetch(`/api/user/${authUser.id}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          login(userData);
        }
      }
    } catch (error) {
      console.error("퀘스트 완료 오류:", error);
    }
  };

  const addQuest = async (quest: Quest) => {
    if (!authUser?.id) return;
    
    try {
      const response = await fetch(`/api/user/${authUser.id}/quests`, {
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
    if (!authUser?.id) return;
    
    try {
      const response = await fetch(
        `/api/user/${authUser.id}/quests?questId=${questId}`,
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
    if (!authUser?.id) return;
    
    try {
      if (rewardId) {
        // 보상 교환 시: 보상 사용 API 호출
        const response = await fetch(`/api/user/${authUser.id}/rewards`, {
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
          const userResponse = await fetch(`/api/user/${authUser.id}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            login(userData);
          }
        }
      } else {
        // 일반 포인트 차감 시: 사용자 API 직접 호출
        const response = await fetch(`/api/user/${authUser.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            points: authUser.points - amount,
          }),
        });

        if (response.ok) {
          const updatedUser = { ...authUser, points: authUser.points - amount };
          login(updatedUser);
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
            <h1 className="text-3xl font-bold text-white">{authUser.nickname || authUser.name}의 일일 관리</h1>
            <div className="flex items-center space-x-4 text-white">
              <div className="bg-white/20 px-3 py-2 rounded-lg">
                <span className="text-sm">⭐ {authUser.points} 포인트</span>
              </div>
              <div className="bg-white/20 px-3 py-2 rounded-lg">
                <span className="text-sm">🔥 {authUser.streak}일 연속</span>
              </div>
              {authUser.isAdmin && (
                <a
                  href="/admin"
                  className="bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  title="관리자 페이지"
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">관리자</span>
                </a>
              )}
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 px-3 py-2 rounded-lg transition-colors flex items-center space-x-2"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">로그아웃</span>
              </button>
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
              { id: "history", label: "교환 내역", icon: "📋" },
              { id: "teams", label: "팀", icon: "👥" },
              { id: "ranking", label: "랭킹", icon: "🏆" },
              { id: "profile", label: "내 캐릭터", icon: "👤" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as
                      | "quests"
                      | "board"
                      | "shop"
                      | "history"
                      | "profile"
                      | "ranking"
                      | "teams"
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
          <RewardShop userPoints={authUser.points} onSpendPoints={spendPoints} />
        )}

        {activeTab === "history" && <RewardHistory userId={authUser.id} />}

        {activeTab === "teams" && <Teams />}

        {activeTab === "ranking" && <Ranking />}

        {activeTab === "profile" && <CharacterProfile user={authUser} />}
      </div>
    </main>
  );
}
