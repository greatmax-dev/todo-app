import { NextRequest } from "next/server";
import db from "@/lib/database";

export interface AdminAuthResult {
  isValid: boolean;
  user?: any;
  error?: string;
}

/**
 * 요청에서 사용자 ID를 추출하고 관리자 권한을 확인합니다.
 * Authorization 헤더에서 사용자 ID를 가져옵니다.
 */
export async function checkAdminAuth(request: NextRequest): Promise<AdminAuthResult> {
  try {
    // Authorization 헤더에서 사용자 ID 추출
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return {
        isValid: false,
        error: "Authorization 헤더가 필요합니다."
      };
    }

    // "Bearer userId" 형태에서 userId 추출
    const userId = authHeader.replace("Bearer ", "");
    if (!userId) {
      return {
        isValid: false,
        error: "유효하지 않은 Authorization 헤더입니다."
      };
    }

    // 사용자 조회
    const stmt = db.prepare("SELECT * FROM users WHERE id = ?");
    const user = stmt.get(userId) as any;

    if (!user) {
      return {
        isValid: false,
        error: "사용자를 찾을 수 없습니다."
      };
    }

    // 관리자 권한 확인
    if (!user.isAdmin) {
      return {
        isValid: false,
        error: "관리자 권한이 필요합니다."
      };
    }

    return {
      isValid: true,
      user
    };

  } catch (error) {
    console.error("Admin auth check error:", error);
    return {
      isValid: false,
      error: "인증 확인 중 오류가 발생했습니다."
    };
  }
}

/**
 * 간단한 관리자 권한 체크 (사용자 ID만으로)
 */
export function isUserAdmin(userId: string): boolean {
  try {
    const stmt = db.prepare("SELECT isAdmin FROM users WHERE id = ?");
    const result = stmt.get(userId) as any;
    return result?.isAdmin === 1;
  } catch (error) {
    console.error("Admin check error:", error);
    return false;
  }
}
