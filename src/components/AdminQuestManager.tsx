import React, { useState, useEffect } from "react";
import { Quest } from "@/types";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const AdminQuestManager: React.FC = () => {
  const { user: authUser } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuest, setEditingQuest] = useState<Quest | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    difficulty: "easy" as "easy" | "medium" | "hard",
    points: 10,
    category: "",
    icon: "🎯",
  });

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/quests", {
        headers: {
          "Authorization": `Bearer ${authUser?.id}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setQuests(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "퀘스트를 불러올 수 없습니다.");
      }
    } catch (error) {
      setError(error + "퀘스트 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateQuest = async () => {
    try {
      const response = await fetch("/api/admin/quests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${authUser?.id}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchQuests();
        setShowCreateForm(false);
        resetForm();
        alert("퀘스트가 생성되었습니다!");
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.error}`);
      }
    } catch (error) {
      alert(error + "퀘스트 생성 중 오류가 발생했습니다.");
    }
  };

  const handleUpdateQuest = async (quest: Quest) => {
    try {
      const response = await fetch(`/api/admin/quests/${quest.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quest.title,
          description: quest.description,
          difficulty: quest.difficulty,
          points: quest.points,
          category: quest.category,
          icon: quest.icon,
        }),
      });

      if (response.ok) {
        await fetchQuests();
        setEditingQuest(null);
        alert("퀘스트가 수정되었습니다!");
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.error}`);
      }
    } catch (error) {
      alert(error + "퀘스트 수정 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteQuest = async (questId: string) => {
    if (!confirm("정말로 이 퀘스트를 삭제하시겠습니까?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/quests/${questId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchQuests();
        alert("퀘스트가 삭제되었습니다!");
      } else {
        const errorData = await response.json();
        alert(`오류: ${errorData.error}`);
      }
    } catch (error) {
      alert(error + "퀘스트 삭제 중 오류가 발생했습니다.");
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      difficulty: "easy",
      points: 10,
      category: "",
      icon: "🎯",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-white">퀘스트를 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">⚠️</div>
        <p className="text-white mb-4">{error}</p>
        <button
          onClick={fetchQuests}
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
          <h2 className="text-2xl font-bold text-white mb-2">🛠️ 퀘스트 관리</h2>
          <p className="text-white/80">
            퀘스트를 생성, 수정, 삭제할 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />새 퀘스트 생성
        </button>
      </div>

      {/* 퀘스트 생성 폼 */}
      {showCreateForm && (
        <div className="bg-white/20 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            새 퀘스트 생성
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
                placeholder="퀘스트 제목"
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                카테고리
              </label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50"
                placeholder="예: 학습, 건강, 청소"
              />
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
                placeholder="퀘스트 설명"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                난이도
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty: e.target.value as "easy" | "medium" | "hard",
                  })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="easy">쉬움</option>
                <option value="medium">보통</option>
                <option value="hard">어려움</option>
              </select>
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
                아이콘
              </label>
              <input
                type="text"
                value={formData.icon}
                onChange={(e) =>
                  setFormData({ ...formData, icon: e.target.value })
                }
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="🎯"
              />
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <button
              onClick={handleCreateQuest}
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

      {/* 퀘스트 목록 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">
          📋 전체 퀘스트 ({quests.length}개)
        </h3>
        {quests.map((quest) => (
          <div key={quest.id} className="bg-white/20 rounded-lg p-4">
            {editingQuest?.id === quest.id ? (
              // 편집 모드
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      제목
                    </label>
                    <input
                      type="text"
                      value={editingQuest.title}
                      onChange={(e) =>
                        setEditingQuest({
                          ...editingQuest,
                          title: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      카테고리
                    </label>
                    <input
                      type="text"
                      value={editingQuest.category}
                      onChange={(e) =>
                        setEditingQuest({
                          ...editingQuest,
                          category: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm font-medium mb-2">
                      설명
                    </label>
                    <textarea
                      value={editingQuest.description}
                      onChange={(e) =>
                        setEditingQuest({
                          ...editingQuest,
                          description: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      rows={2}
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      난이도
                    </label>
                    <select
                      value={editingQuest.difficulty}
                      onChange={(e) =>
                        setEditingQuest({
                          ...editingQuest,
                          difficulty: e.target.value as
                            | "easy"
                            | "medium"
                            | "hard",
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="easy">쉬움</option>
                      <option value="medium">보통</option>
                      <option value="hard">어려움</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      포인트
                    </label>
                    <input
                      type="number"
                      value={editingQuest.points}
                      onChange={(e) =>
                        setEditingQuest({
                          ...editingQuest,
                          points: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      아이콘
                    </label>
                    <input
                      type="text"
                      value={editingQuest.icon}
                      onChange={(e) =>
                        setEditingQuest({
                          ...editingQuest,
                          icon: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleUpdateQuest(editingQuest)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    저장
                  </button>
                  <button
                    onClick={() => setEditingQuest(null)}
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
                  <div className="text-2xl">{quest.icon}</div>
                  <div>
                    <div className="text-white font-semibold">
                      {quest.title}
                    </div>
                    <div className="text-white/60 text-sm">
                      {quest.description}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`inline-block px-2 py-1 rounded text-xs font-medium ${getDifficultyColor(
                          quest.difficulty
                        )}`}
                      >
                        {quest.difficulty}
                      </span>
                      <span className="text-white/60 text-xs">
                        {quest.category}
                      </span>
                      <span className="text-white/60 text-xs">
                        {quest.points} 포인트
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingQuest(quest)}
                    className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuest(quest.id)}
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

      {quests.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">📝</div>
          <p className="text-white mb-2">등록된 퀘스트가 없습니다.</p>
          <p className="text-white/60 text-sm">새 퀘스트를 생성해보세요!</p>
        </div>
      )}
    </div>
  );
};

export default AdminQuestManager;
