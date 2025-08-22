"use client";

import { useState, useEffect } from "react";
import { Reward } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Gift,
  Clock,
  Youtube,
  Gamepad2,
  Cookie,
} from "lucide-react";

interface RewardShopProps {
  userPoints: number;
  onSpendPoints: (amount: number, rewardIds: string) => void;
}

export default function RewardShop({
  userPoints,
  onSpendPoints,
}: RewardShopProps) {
  const [selectedRewards, setSelectedRewards] = useState<Reward[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [availableRewards, setAvailableRewards] = useState<Reward[]>([]);

  // 데이터베이스에서 보상 로드
  useEffect(() => {
    const loadRewards = async () => {
      try {
        const response = await fetch("/api/rewards");
        if (response.ok) {
          const rewards = await response.json();
          setAvailableRewards(rewards);
        }
      } catch (error) {
        console.error("보상 로드 오류:", error);
      }
    };

    loadRewards();
  }, []);

  const addToCart = (reward: Reward) => {
    if (userPoints >= reward.points) {
      setSelectedRewards((prev) => [...prev, reward]);
    }
  };

  const removeFromCart = (rewardId: string) => {
    setSelectedRewards((prev) => prev.filter((r) => r.id !== rewardId));
  };

  const getTotalPoints = () => {
    return selectedRewards.reduce((sum, reward) => sum + reward.points, 0);
  };

  const canPurchase = () => {
    return userPoints >= getTotalPoints() && selectedRewards.length > 0;
  };

  const purchaseRewards = () => {
    if (canPurchase()) {
      // 선택된 보상들의 ID를 전달
      const rewardIds = selectedRewards.map((reward) => reward.id).join(",");
      onSpendPoints(getTotalPoints(), rewardIds);
      setSelectedRewards([]);
      setShowCart(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "youtube":
        return <Youtube className="w-5 h-5" />;
      case "game":
        return <Gamepad2 className="w-5 h-5" />;
      case "snack":
        return <Cookie className="w-5 h-5" />;
      case "money":
        return <Gift className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
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

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🏪 보상 상점</h2>
        <p className="text-white/80 text-lg mb-4">
          모은 포인트로 원하는 보상을 교환해보세요!
        </p>

        {/* 포인트 정보 */}
        <div className="bg-white/20 rounded-lg p-6 inline-block">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                ⭐ {userPoints}
              </div>
              <div className="text-white/80 text-sm">보유 포인트</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                🛒 {selectedRewards.length}
              </div>
              <div className="text-white/80 text-sm">선택된 보상</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                💰 {getTotalPoints()}
              </div>
              <div className="text-white/80 text-sm">필요 포인트</div>
            </div>
          </div>
        </div>
      </div>

      {/* 장바구니 버튼 */}
      <div className="text-center">
        <button
          onClick={() => setShowCart(!showCart)}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center mx-auto"
        >
          <ShoppingCart className="mr-2" />
          장바구니 보기 ({selectedRewards.length})
        </button>
      </div>

      {/* 장바구니 */}
      <AnimatePresence>
        {showCart && selectedRewards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white/20 rounded-lg p-6"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              🛒 선택된 보상
            </h3>
            <div className="space-y-3 mb-4">
              {selectedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="bg-white rounded-lg p-3 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{reward.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800">
                        {reward.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm font-semibold">
                      ⭐ {reward.points} 포인트
                    </span>
                    <button
                      onClick={() => removeFromCart(reward.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between bg-white rounded-lg p-4">
              <div className="text-lg font-semibold text-gray-800">
                총 필요 포인트: ⭐ {getTotalPoints()}
              </div>
              <button
                onClick={purchaseRewards}
                disabled={!canPurchase()}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  canPurchase()
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {canPurchase() ? "보상 교환하기" : "포인트 부족"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 보상 목록 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableRewards.map((reward) => {
          const canAfford = userPoints >= reward.points;
          const isInCart = selectedRewards.some((r) => r.id === reward.id);

          return (
            <motion.div
              key={reward.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative bg-white rounded-xl p-6 shadow-lg transition-all ${
                isInCart ? "ring-2 ring-purple-500 bg-purple-50" : ""
              }`}
            >
              {/* 타입 배지 */}
              <div className="absolute top-3 right-3">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(
                    reward.type
                  )}`}
                >
                  {getTypeIcon(reward.type)}
                </span>
              </div>

              {/* 보상 내용 */}
              <div className="text-center mb-4">
                <span className="text-4xl mb-3 block">{reward.icon}</span>
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  {reward.title}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  {reward.description}
                </p>

                {reward.duration && (
                  <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mb-3 inline-block">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {reward.duration}분
                  </div>
                )}

                <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-semibold">
                  ⭐ {reward.points} 포인트
                </div>
              </div>

              {/* 액션 버튼 */}
              {isInCart ? (
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-2 rounded-lg cursor-not-allowed"
                >
                  장바구니에 추가됨
                </button>
              ) : (
                <button
                  onClick={() => addToCart(reward)}
                  disabled={!canAfford}
                  className={`w-full py-2 rounded-lg transition-all ${
                    canAfford
                      ? "bg-purple-600 text-white hover:bg-purple-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {canAfford ? "장바구니에 추가" : "포인트 부족"}
                </button>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* 힌트 */}
      <div className="text-center text-white/80">
        <p className="text-lg">💡 보상을 교환하면 즉시 사용할 수 있어요!</p>
        <p className="text-sm mt-2">
          부모님과 함께 보상 사용 시간을 정하고 즐거운 시간을 보내세요
        </p>
      </div>
    </div>
  );
}
