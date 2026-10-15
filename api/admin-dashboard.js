import { createClient } from "@supabase/supabase-js";
import { requireSupabaseUser } from "../server/auth.js";
import { getServerEnv } from "../server/env.js";

function jsonError(res, status, error) {
  return res.status(status).json({ success: false, error });
}

function sameOriginOnly(req) {
  const origin = req.headers?.origin;
  const host = req.headers?.host;

  if (!origin) return true;

  try {
    return Boolean(host) && new URL(origin).host === host;
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return jsonError(res, 405, "Chỉ hỗ trợ phương thức GET.");
  }

  if (!sameOriginOnly(req)) {
    return jsonError(res, 403, "Nguồn gửi không được phép.");
  }

  // Xác thực phiên đăng nhập bằng Supabase Auth.
  const authResult = await requireSupabaseUser(req);

  if (!authResult.ok) {
    return jsonError(res, authResult.status, authResult.message);
  }

  // Chỉ tài khoản có app_metadata.role = "admin" mới được truy cập.

  if (authResult.user?.app_metadata?.role !== "admin") {
    return jsonError(res, 403, "Tài khoản chưa được cấp quyền quản trị viên.");
  }

  const supabaseUrl = getServerEnv("SUPABASE_URL", {
    aliases: ["VITE_SUPABASE_URL"],
  });

  const serviceRoleKey = getServerEnv("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonError(
      res,
      500,
      "Máy chủ chưa cấu hình SUPABASE_URL hoặc SUPABASE_SERVICE_ROLE_KEY.",
    );
  }

  try {
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const [
      profilesResult,
      logsResult,
      usersCountResult,
      logsCountResult,
      mealsCountResult,
    ] = await Promise.all([
      adminClient
        .from("profiles")
        .select(
          "id, name, gender, age, height, weight, medical, bmi, bmr, target_calo, water_target, created_at, updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(100),

      adminClient
        .from("daily_logs")
        .select("id, user_id, log_date, water_glasses, created_at, updated_at")
        .order("log_date", { ascending: false })
        .limit(50),

      adminClient.from("profiles").select("id", { count: "exact", head: true }),

      adminClient
        .from("daily_logs")
        .select("id", { count: "exact", head: true }),

      adminClient
        .from("meal_items")
        .select("id", { count: "exact", head: true }),
    ]);

    const queryErrors = [
      profilesResult.error,
      logsResult.error,
      usersCountResult.error,
      logsCountResult.error,
      mealsCountResult.error,
    ].filter(Boolean);

    if (queryErrors.length > 0) {
      console.error(
        "Admin dashboard query failed:",
        queryErrors.map((error) => error.message),
      );

      return jsonError(
        res,
        500,
        "Không tải được dữ liệu quản trị. Hãy kiểm tra cấu trúc bảng Supabase.",
      );
    }

    const recentLogs = logsResult.data || [];
    const logIds = recentLogs.map((log) => log.id);

    let recentMeals = [];

    if (logIds.length > 0) {
      const { data, error } = await adminClient
        .from("meal_items")
        .select(
          "id, daily_log_id, meal_type, food_name, quantity, calories, protein, carbs, fat, created_at",
        )
        .in("daily_log_id", logIds)
        .order("created_at", { ascending: false })
        .limit(150);

      if (error) {
        console.error("Admin meal query failed:", error.message);

        return jsonError(
          res,
          500,
          "Không tải được chi tiết món ăn trong nhật ký.",
        );
      }

      recentMeals = data || [];
    }

    const mealsByLogId = new Map();

    for (const meal of recentMeals) {
      const items = mealsByLogId.get(meal.daily_log_id) || [];
      items.push(meal);
      mealsByLogId.set(meal.daily_log_id, items);
    }

    const profiles = profilesResult.data || [];
    const profileById = new Map(
      profiles.map((profile) => [profile.id, profile]),
    );

    const dailyLogs = recentLogs.map((log) => ({
      ...log,
      user_name: profileById.get(log.user_id)?.name || "Chưa có hồ sơ",
      meal_items: mealsByLogId.get(log.id) || [],
    }));

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          users: usersCountResult.count || 0,
          dailyLogs: logsCountResult.count || 0,
          mealItems: mealsCountResult.count || 0,
        },
        profiles,
        dailyLogs,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error?.message || error);

    return jsonError(res, 500, "Lỗi máy chủ khi tải bảng quản trị.");
  }
}
