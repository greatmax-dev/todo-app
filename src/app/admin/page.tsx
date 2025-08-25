"use client";

import React, { useState, useEffect } from "react";
import AdminQuestManager from "@/components/AdminQuestManager";
import AdminRewardManager from "@/components/AdminRewardManager";
import { Settings, Users, Trophy, BarChart3, Gift, Lock, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminPage() {
  const { user: authUser, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "quests" | "users" | "rewards" | "stats"
  >("quests");

  // 로딩 중일 때
  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">로딩 중...</p>
        </div>
      </main>
    );
  }

  // 로그인하지 않았거나 관리자가 아닐 때
  if (!authUser || !authUser.isAdmin) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full mx-4 text-center">
          <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">접근 권한이 없습니다</h1>
          <p className="text-white/80 mb-6">
            {!authUser 
              ? "관리자 페이지에 접근하려면 로그인이 필요합니다."
              : "관리자 권한이 필요합니다. 관리자에게 문의하세요."
            }
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              메인 페이지로 돌아가기
            </Link>
            {!authUser && (
              <p className="text-white/60 text-sm">
                관리자 계정: admin / admin123
              </p>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* 헤더 */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-2xl font-bold text-white">
                  관리자 대시보드
                </h1>
                <p className="text-white/60 text-sm">퀘스트 게임 시스템 관리</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 px-3 py-2 rounded-lg">
                <span className="text-white text-sm">
                  🔒 {authUser.nickname || authUser.name} (관리자)
                </span>
              </div>
              <Link
                href="/"
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                사용자 페이지로
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* 네비게이션 탭 */}
      <nav className="bg-black/10 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-1">
            {[
              {
                id: "quests",
                label: "퀘스트 관리",
                icon: <Trophy className="w-5 h-5" />,
              },
              {
                id: "users",
                label: "사용자 관리",
                icon: <Users className="w-5 h-5" />,
              },
              {
                id: "rewards",
                label: "보상 관리",
                icon: <Gift className="w-5 h-5" />,
              },
              {
                id: "stats",
                label: "통계",
                icon: <BarChart3 className="w-5 h-5" />,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "quests" | "users" | "rewards" | "stats"
                  )
                }
                className={`flex items-center space-x-2 py-3 px-4 rounded-t-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-white/10 text-white font-semibold border-b-2 border-purple-400"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "quests" && <AdminQuestManager />}

        {activeTab === "users" && (
          <div className="text-center py-16">
            <Users className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              사용자 관리
            </h3>
            <p className="text-white/60">
              사용자 관리 기능은 곧 추가될 예정입니다.
            </p>
          </div>
        )}

        {activeTab === "rewards" && <AdminRewardManager />}

        {activeTab === "stats" && (
          <div className="text-center py-16">
            <BarChart3 className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">통계</h3>
            <p className="text-white/60">통계 기능은 곧 추가될 예정입니다.</p>
          </div>
        )}
      </div>
    </main>
  );
}
