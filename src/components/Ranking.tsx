"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Award, TrendingUp, Users, Target, Flame } from "lucide-react";
import { RankingResponse, RankingUser } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Ranking() {
  const { user: authUser } = useAuth();
  const [rankingData, setRankingData] = useState<RankingResponse | null>(null);
  const [teamRankingData, setTeamRankingData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"points" | "level" | "streak" | "teams">("points");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        // 개인 랭킹 데이터
        const response = await fetch("/api/ranking");
        if (response.ok) {
          const data = await response.json();
          setRankingData(data);
        }

        // 팀 랭킹 데이터
        const teamResponse = await fetch("/api/teams/ranking");
        if (teamResponse.ok) {
          const teamData = await teamResponse.json();
          setTeamRankingData(teamData);
        }
      } catch (error) {
        console.error("랭킹 데이터 로드 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getRankBgColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-100 to-yellow-50 border-yellow-200";
      case 2:
        return "bg-gradient-to-r from-gray-100 to-gray-50 border-gray-200";
      case 3:
        return "bg-gradient-to-r from-amber-100 to-amber-50 border-amber-200";
      default:
        return "bg-white border-gray-200";
    }
  };

  const getCurrentUserRank = (ranking: RankingUser[]) => {
    if (!authUser) return null;
    return ranking.find(user => user.id === authUser.id);
  };

  const renderRankingList = (ranking: RankingUser[], type: "points" | "level" | "streak") => {
    const currentUserRank = getCurrentUserRank(ranking);
    
    return (
      <div className="space-y-3">
        {/* 현재 사용자 순위 (상위 10위 밖인 경우) */}
        {currentUserRank && currentUserRank.rank > 10 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl border-2 border-blue-300 bg-gradient-to-r from-blue-100 to-blue-50`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getRankIcon(currentUserRank.rank)}
                <div>
                  <p className="font-semibold text-blue-800">{currentUserRank.displayName} (나)</p>
                  <p className="text-sm text-blue-600">
                    {type === "points" && `${currentUserRank.totalPoints.toLocaleString()} 총 포인트`}
                    {type === "level" && `레벨 ${currentUserRank.level} (${currentUserRank.experience} EXP)`}
                    {type === "streak" && `${currentUserRank.streak}일 연속`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-600">현재 순위</p>
                <p className="text-lg font-bold text-blue-800">#{currentUserRank.rank}</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 상위 랭킹 */}
        {ranking.slice(0, 10).map((user, index) => {
          const isCurrentUser = authUser?.id === user.id;
          
          return (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-xl border ${getRankBgColor(user.rank)} ${
                isCurrentUser ? "ring-2 ring-blue-400" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {getRankIcon(user.rank)}
                  <div>
                    <p className={`font-semibold ${isCurrentUser ? "text-blue-800" : "text-gray-800"}`}>
                      {user.displayName} {isCurrentUser && "(나)"}
                    </p>
                    <p className="text-sm text-gray-600">
                      레벨 {user.level} • {user.streak}일 연속
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    {type === "points" && `${user.totalPoints.toLocaleString()}`}
                    {type === "level" && `Lv.${user.level}`}
                    {type === "streak" && `${user.streak}일`}
                  </p>
                  <p className="text-sm text-gray-500">
                    {type === "points" && "총 포인트"}
                    {type === "level" && `${user.experience} EXP`}
                    {type === "streak" && "연속 출석"}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderTeamRanking = () => {
    if (!teamRankingData?.teamRanking) return null;

    return (
      <div className="space-y-3">
        {teamRankingData.teamRanking.slice(0, 10).map((team: any, index: number) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getRankBgColor(team.rank)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {getRankIcon(team.rank)}
                <div>
                  <p className="font-semibold text-gray-800">{team.displayName}</p>
                  <p className="text-sm text-gray-600">
                    팀장: {team.leaderDisplayName} • {team.memberCount}명
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">
                  {team.totalPoints.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  평균 Lv.{team.averageLevel}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">랭킹 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rankingData) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <p className="text-gray-600">랭킹 데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">총 사용자</p>
              <p className="text-2xl font-bold">{rankingData.stats.totalUsers}</p>
            </div>
            <Users className="w-8 h-8 text-blue-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">최고 포인트</p>
              <p className="text-2xl font-bold">{rankingData.stats.maxTotalPoints.toLocaleString()}</p>
            </div>
            <Target className="w-8 h-8 text-green-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">최고 레벨</p>
              <p className="text-2xl font-bold">{rankingData.stats.maxLevel}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-200" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">최고 연속</p>
              <p className="text-2xl font-bold">{rankingData.stats.maxStreak}일</p>
            </div>
            <Flame className="w-8 h-8 text-orange-200" />
          </div>
        </motion.div>
      </div>

      {/* 팀 통계 카드 (팀 탭일 때만 표시) */}
      {activeTab === "teams" && teamRankingData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-6 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-100">총 팀 수</p>
                <p className="text-2xl font-bold">{teamRankingData.stats.totalTeams}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-6 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100">최고 팀 포인트</p>
                <p className="text-2xl font-bold">{teamRankingData.stats.maxTotalPoints.toLocaleString()}</p>
              </div>
              <Trophy className="w-8 h-8 text-emerald-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-violet-500 to-violet-600 text-white p-6 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-violet-100">평균 멤버 수</p>
                <p className="text-2xl font-bold">{teamRankingData.stats.avgMemberCount}</p>
              </div>
              <Users className="w-8 h-8 text-violet-200" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-6 rounded-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-rose-100">최고 평균 레벨</p>
                <p className="text-2xl font-bold">{teamRankingData.stats.maxLevel}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-rose-200" />
            </div>
          </motion.div>
        </div>
      )}

      {/* 랭킹 탭 */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: "points", label: "포인트 랭킹", icon: Trophy },
              { id: "level", label: "레벨 랭킹", icon: TrendingUp },
              { id: "streak", label: "연속 출석", icon: Flame },
              { id: "teams", label: "팀 랭킹", icon: Users },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "points" | "level" | "streak" | "teams")}
                className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 transition-all ${
                  activeTab === tab.id
                    ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "points" && renderRankingList(rankingData.pointsRanking, "points")}
          {activeTab === "level" && renderRankingList(rankingData.levelRanking, "level")}
          {activeTab === "streak" && renderRankingList(rankingData.streakRanking, "streak")}
          {activeTab === "teams" && renderTeamRanking()}
        </div>
      </div>
    </div>
  );
}
