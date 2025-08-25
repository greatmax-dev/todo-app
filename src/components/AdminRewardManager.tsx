import React, { useState, useEffect } from "react";
import { Reward } from "@/types";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  Youtube,
  Gamepad2,
  Cookie,
  Gift,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminRewardManager: React.FC = () => {
  const { user: authUser } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingReward, setEditingReward] = useState<Reward | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    points: 10,
    type: "youtube" as "youtube" | "game" | "snack" | "money",
    duration: 0,
    icon: "📺",
  });

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/rewards", {
        headers: {
          "Authorization": `Bearer ${authUser?.id}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setRewards(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "보상을 불러올 수 없습니다.");
      }
    } catch (error) {
      setError(error + "보상 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReward = async () => {
    try {
      const response = await fetch("/api/admin/rewards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authUser?.id}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchRewards();
        setShowCreateForm(false);
        resetForm();
        alert("보상이 생성되었습니다!");
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.error}`);
      }
    } catch (error) {
      alert(error + "보상 생성 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateReward = async (reward: Reward) => {
    try {
      const response = await fetch(`/api/admin/rewards/${reward.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: reward.title,
          description: reward.description,
          points: reward.points,
          type: reward.type,
          duration: reward.duration,
          icon: reward.icon,
        }),
      });

      if (response.ok) {
        await fetchRewards();
        setEditingReward(null);
        alert("보상이 수정되었습니다!");
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.error}`);
      }
    } catch (error) {
      alert(error + "보상 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteReward = async (rewardId: string) => {
    if (!confirm("정말로 이 보상을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchRewards();
        alert("보상이 삭제되었습니다!");
      } else {
        const errorData = await response.json();
        console.log(`오류: ${errorData.error}`);
      }
    } catch (error) {
      console.log(error + "보상 삭제 중 오류가 발생했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      points: 10,
      type: "youtube",
      duration: 0,
      icon: "📺",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="w-5 h-5 text-red-500" />;
      case "game":
        return <Gamepad2 className="w-5 h-5 text-blue-500" />;
      case "snack":
        return <Cookie className="w-5 h-5 text-orange-500" />;
      case "money":
        return <Gift className="w-5 h-5 text-green-500" />;
      default:
        return <Gift className="w-5 h-5 text-purple-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "youtube":
        return "bg-red-100 text-red-800";
      case "game":
        return "bg-blue-100 text-blue-800";
      case "snack":
        return "bg-orange-100 text-orange-800";
      case "money":
        return "bg-green-100 text-green-800";
      default:
        return "bg-purple-100 text-purple-800";
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case "youtube":
        return "유튜브";
      case "game":
        return "게임";
      case "snack":
        return "간식";
      case "money":
        return "용돈";
      default:
        return "기타";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-white">보상을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">⚠️</div>
        <p className="text-white mb-4">{error}</p>
        <button
          onClick={fetchRewards}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🎁 보상 관리</h2>
          <p className="text-white/80">
            보상을 생성, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />새 보상 생성
        </button>
      </div>

      {/* 보상 생성 폼 */}
      {showCreateForm && (
        <div className="bg-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            새 보상 생성
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                제목
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                placeholder="보상 제목"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                타입
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as
                      | "youtube"
                      | "game"
                      | "snack"
                      | "money",
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="youtube">유튜브</option>
                <option value="game">게임</option>
                <option value="snack">간식</option>
                <option value="money">용돈</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-white text-sm font-medium mb-2">
                설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                placeholder="보상 설명"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                포인트
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    points: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="1"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                지속 시간 (분)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration: parseInt(e.target.value) || 0,
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                min="0"
                placeholder="0 (시간 제한 없음)"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                아이콘
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="📺"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleCreateReward}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              생성
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                resetForm();
              }}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
            >
              <X className="w-4 h-4 mr-2" />
              취소
            </button>
          </div>
        </div>
      )}

      {/* 보상 목록 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          🎁 전체 보상 ({rewards.length}개)
        </h3>
        {rewards.map((reward) => (
          <div key={reward.id} className="bg-white/20 rounded-lg p-4">
            {editingReward?.id === reward.id ? (
              // 편집 모드
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={editingReward.title}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      타입
                    </label>
                    <select
                      value={editingReward.type}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          type: e.target.value as
                            | "youtube"
                            | "game"
                            | "snack"
                            | "money",
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="youtube">유튜브</option>
                      <option value="game">게임</option>
                      <option value="snack">간식</option>
                      <option value="money">용돈</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      설명
                    </label>
                    <textarea
                      value={editingReward.description}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      포인트
                    </label>
                    <input
                      type="number"
                      value={editingReward.points}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      지속 시간 (분)
                    </label>
                    <input
                      type="number"
                      value={editingReward.duration || 0}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          duration: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      min="0"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      아이콘
                    </label>
                    <input
                      type="text"
                      value={editingReward.icon}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          icon: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateReward(editingReward)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </button>
                  <button
                    onClick={() => setEditingReward(null)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    취소
                  </button>
                </div>
              </div>
            ) : (
              // 보기 모드
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{reward.icon}</div>
                  <div>
                    <div className="text-white font-semibold">
                      {reward.title}
                    </div>
                    <div className="text-white/60 text-sm">
                      {reward.description}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                          reward.type
                        )}`}
                      >
                        {getTypeIcon(reward.type)}
                        <span className="ml-1">{getTypeText(reward.type)}</span>
                      </span>
                      <span className="text-white/60 text-xs">
                        {reward.points} 포인트
                      </span>
                      {reward.duration && reward.duration > 0 && (
                        <span className="text-white/60 text-xs flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {reward.duration}분
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingReward(reward)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteReward(reward.id)}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">🎁</div>
          <p className="text-white mb-2">등록된 보상이 없습니다.</p>
          <p className="text-white/60 text-sm">새 보상을 생성해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default AdminRewardManager;
