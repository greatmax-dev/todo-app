"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Plus, 
  Crown, 
  UserPlus, 
  UserMinus, 
  Trash2, 
  Trophy,
  Target,
  TrendingUp,
  Flame
} from "lucide-react";
import { TeamWithMembers, CreateTeamRequest, TeamResponse } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

export default function Teams() {
  const { user: authUser } = useAuth();
  const [myTeam, setMyTeam] = useState<TeamWithMembers | null>(null);
  const [allTeams, setAllTeams] = useState<TeamWithMembers[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [createFormData, setCreateFormData] = useState({
    name: "",
    description: ""
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, [authUser?.id]);

  const loadData = async () => {
    if (!authUser?.id) return;
    
    try {
      setLoading(true);
      
      // 내 팀 정보 조회
      const myTeamResponse = await fetch(`/api/user/${authUser.id}/team`);
      if (myTeamResponse.ok) {
        const myTeamData = await myTeamResponse.json();
        setMyTeam(myTeamData);
      }

      // 전체 팀 목록 조회
      const allTeamsResponse = await fetch("/api/teams");
      if (allTeamsResponse.ok) {
        const allTeamsData = await allTeamsResponse.json();
        setAllTeams(allTeamsData);
      }
    } catch (error) {
      console.error("팀 데이터 로드 오류:", error);
      setMessage("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser?.id) return;

    if (!createFormData.name.trim()) {
      setMessage("팀 이름을 입력해주세요.");
      return;
    }

    try {
      setActionLoading(true);
      setMessage("");

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": authUser.id
        },
        body: JSON.stringify(createFormData)
      });

      const data: TeamResponse = await response.json();

      if (data.success) {
        setMessage(data.message || "팀이 생성되었습니다!");
        setShowCreateForm(false);
        setCreateFormData({ name: "", description: "" });
        await loadData();
      } else {
        setMessage(data.message || "팀 생성에 실패했습니다.");
      }
    } catch (error) {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!authUser?.id) return;

    try {
      setActionLoading(true);
      setMessage("");

      const response = await fetch(`/api/teams/${teamId}/join`, {
        method: "POST",
        headers: {
          "x-user-id": authUser.id
        }
      });

      const data: TeamResponse = await response.json();

      if (data.success) {
        setMessage(data.message || "팀에 가입했습니다!");
        await loadData();
      } else {
        setMessage(data.message || "팀 가입에 실패했습니다.");
      }
    } catch (error) {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveTeam = async () => {
    if (!authUser?.id || !myTeam) return;

    if (!confirm("정말로 팀에서 탈퇴하시겠습니까?")) return;

    try {
      setActionLoading(true);
      setMessage("");

      const response = await fetch(`/api/teams/${myTeam.id}/leave`, {
        method: "POST",
        headers: {
          "x-user-id": authUser.id
        }
      });

      const data: TeamResponse = await response.json();

      if (data.success) {
        setMessage(data.message || "팀에서 탈퇴했습니다.");
        await loadData();
      } else {
        setMessage(data.message || "팀 탈퇴에 실패했습니다.");
      }
    } catch (error) {
      setMessage("네트워크 오류가 발생했습니다.");
    } finally {
      setActionLoading(false);
    }
  };

  const isTeamLeader = (team: TeamWithMembers) => {
    return authUser?.id === team.leaderId;
  };

  const canJoinTeam = (team: TeamWithMembers) => {
    return !myTeam && team.memberCount < team.maxMembers && !team.members.some(m => m.userId === authUser?.id);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">팀 정보 로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 메시지 표시 */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg ${
            message.includes("성공") || message.includes("생성") || message.includes("가입") || message.includes("탈퇴")
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message}
        </motion.div>
      )}

      {/* 내 팀 정보 */}
      {myTeam ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{myTeam.name}</h2>
                <p className="text-blue-100">{myTeam.description || "팀 설명이 없습니다."}</p>
              </div>
            </div>
            <button
              onClick={handleLeaveTeam}
              disabled={actionLoading}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
            >
              <UserMinus className="w-4 h-4" />
              <span>탈퇴</span>
            </button>
          </div>

          {/* 팀 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Trophy className="w-6 h-6 mx-auto mb-2 text-yellow-300" />
              <p className="text-sm text-blue-100">총 포인트</p>
              <p className="text-xl font-bold">{myTeam.totalPoints.toLocaleString()}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-green-300" />
              <p className="text-sm text-blue-100">평균 레벨</p>
              <p className="text-xl font-bold">{myTeam.averageLevel}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 mx-auto mb-2 text-blue-300" />
              <p className="text-sm text-blue-100">멤버 수</p>
              <p className="text-xl font-bold">{myTeam.memberCount}/{myTeam.maxMembers}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <Target className="w-6 h-6 mx-auto mb-2 text-purple-300" />
              <p className="text-sm text-blue-100">평균 포인트</p>
              <p className="text-xl font-bold">{Math.round(myTeam.totalPoints / myTeam.memberCount).toLocaleString()}</p>
            </div>
          </div>

          {/* 팀 멤버 목록 */}
          <div>
            <h3 className="text-lg font-semibold mb-4">팀 멤버</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {myTeam.members.map((member) => (
                <div
                  key={member.userId}
                  className="bg-white/10 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    {member.role === "leader" && (
                      <Crown className="w-5 h-5 text-yellow-300" />
                    )}
                    <div>
                      <p className="font-medium">
                        {member.user?.nickname || member.user?.name}
                        {member.userId === authUser?.id && " (나)"}
                      </p>
                      <p className="text-sm text-blue-100">
                        레벨 {member.user?.level} • {member.user?.totalPoints.toLocaleString()} 포인트
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-100">{member.user?.streak}일 연속</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      ) : (
        /* 팀 생성 또는 가입 */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="text-center mb-6">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">팀에 가입하세요!</h2>
            <p className="text-gray-600">팀을 만들거나 기존 팀에 가입하여 함께 성장해보세요.</p>
          </div>

          {!showCreateForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 mx-auto transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>새 팀 만들기</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 이름 *
                </label>
                <input
                  type="text"
                  value={createFormData.name}
                  onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="팀 이름을 입력하세요"
                  maxLength={20}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  팀 설명 (선택사항)
                </label>
                <textarea
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({ ...createFormData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="팀에 대한 간단한 설명을 입력하세요"
                  rows={3}
                  maxLength={100}
                />
              </div>
              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {actionLoading ? "생성 중..." : "팀 생성"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateFormData({ name: "", description: "" });
                  }}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {/* 전체 팀 목록 */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">모든 팀</h2>
        
        {allTeams.length === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">아직 생성된 팀이 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allTeams.map((team, index) => (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800">{team.name}</h3>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{team.memberCount}/{team.maxMembers}</span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {team.description || "팀 설명이 없습니다."}
                </p>
                
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                  <div className="text-center bg-gray-50 rounded p-2">
                    <p className="text-gray-500">총 포인트</p>
                    <p className="font-semibold">{team.totalPoints.toLocaleString()}</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded p-2">
                    <p className="text-gray-500">평균 레벨</p>
                    <p className="font-semibold">{team.averageLevel}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Crown className="w-4 h-4 text-yellow-500" />
                    <span>{team.leader?.nickname || team.leader?.name}</span>
                  </div>
                  
                  {canJoinTeam(team) && (
                    <button
                      onClick={() => handleJoinTeam(team.id)}
                      disabled={actionLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1 transition-colors disabled:opacity-50"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>가입</span>
                    </button>
                  )}
                  
                  {team.memberCount >= team.maxMembers && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      가득참
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
