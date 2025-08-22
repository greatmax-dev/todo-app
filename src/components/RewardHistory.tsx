import React, { useState, useEffect } from "react";
import { Reward } from "@/types";
import { Clock, Calendar, TrendingDown, Gift } from "lucide-react";

interface RewardHistoryProps {
  userId: string;
}

interface RewardHistoryData {
  rewards: Reward[];
  user: {
    id: string;
    name: string;
    points: number;
    totalPoints: number;
  } | null;
  summary: {
    totalRewardsUsed: number;
    totalPointsSpent: number;
  };
}

const RewardHistory: React.FC<RewardHistoryProps> = ({ userId }) => {
  const [historyData, setHistoryData] = useState<RewardHistoryData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRewardHistory();
  }, [userId]);

  const fetchRewardHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/user/${userId}/rewards`);

      if (response.ok) {
        const data = await response.json();
        setHistoryData(data);
      } else {
        setError("교환 내역을 불러올 수 없습니다.");
      }
    } catch (error) {
      setError("교환 내역 조회 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return "📺";
      case "game":
        return "🎮";
      case "snack":
        return "🍪";
      case "money":
        return "💰";
      default:
        return "🎁";
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-white">교환 내역을 불러오는 중...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-400 mb-4">⚠️</div>
        <p className="text-white mb-4">{error}</p>
        <button
          onClick={fetchRewardHistory}
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!historyData || historyData.rewards.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 mb-4">🎁</div>
        <p className="text-white mb-2">아직 교환한 보상이 없습니다.</p>
        <p className="text-white/60 text-sm">
          포인트를 모아서 보상을 교환해보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          📋 교환 완료 내역
        </h2>
        <p className="text-white/80">지금까지 교환한 보상들의 기록입니다.</p>
      </div>

      {/* 요약 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {historyData.summary.totalRewardsUsed}
          </div>
          <div className="text-white/80 text-sm">총 교환 횟수</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {historyData.summary.totalPointsSpent}
          </div>
          <div className="text-white/80 text-sm">총 사용 포인트</div>
        </div>
        <div className="bg-white/20 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {historyData.user?.points || 0}
          </div>
          <div className="text-white/80 text-sm">현재 보유 포인트</div>
        </div>
      </div>

      {/* 교환 내역 목록 */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">🎯 상세 내역</h3>
        {historyData.rewards.map((reward, index) => (
          <div
            key={index}
            className="bg-white/20 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{getTypeIcon(reward.type)}</div>
              <div>
                <div className="text-white font-semibold">{reward.title}</div>
                <div className="text-white/60 text-sm">
                  {reward.description}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(
                      reward.type
                    )}`}
                  >
                    {reward.type}
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
            <div className="text-right">
              <div className="text-white font-semibold">
                -{reward.points} 포인트
              </div>
              <div className="text-white/60 text-xs">
                {formatDate(new Date().toISOString())}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 새로고침 버튼 */}
      <div className="text-center">
        <button
          onClick={fetchRewardHistory}
          className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
        >
          새로고침
        </button>
      </div>
    </div>
  );
};

export default RewardHistory;
