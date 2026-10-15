import { createClient } from "@supabase/supabase-js";
import { getServerEnv } from "./env.js";

export async function requireSupabaseUser(req) {
  const authorization = String(
    req.headers?.authorization || req.headers?.Authorization || "",
  );
  const tokenMatch = authorization.match(/^Bearer\s+(.+)$/i);

  if (!tokenMatch) {
    return {
      ok: false,
      status: 401,
      message: "Bạn cần đăng nhập để sử dụng chức năng này.",
    };
  }

  const supabaseUrl = getServerEnv("SUPABASE_URL", {
    aliases: ["VITE_SUPABASE_URL"],
  });
  const publishableKey = getServerEnv("SUPABASE_PUBLISHABLE_KEY", {
    aliases: [
      "VITE_SUPABASE_PUBLISHABLE_KEY",
      "SUPABASE_ANON_KEY",
      "VITE_SUPABASE_ANON_KEY",
    ],
  });

  if (!supabaseUrl || !publishableKey) {
    return {
      ok: false,
      status: 500,
      message: "Máy chủ chưa cấu hình URL và publishable key của Supabase.",
    };
  }

  try {
    const supabase = createClient(supabaseUrl, publishableKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });

    const { data, error } = await supabase.auth.getUser(tokenMatch[1].trim());
    if (error || !data?.user) {
      return {
        ok: false,
        status: 401,
        message:
          "Phiên đăng nhập không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
      };
    }

    return { ok: true, user: data.user, accessToken: tokenMatch[1].trim() };
  } catch (error) {
    // Do not return tokens, API keys, or internal SDK details to the client.
    console.error(
      "Supabase API authentication failed:",
      error?.message || error,
    );
    return {
      ok: false,
      status: 500,
      message: "Không thể xác minh phiên đăng nhập lúc này.",
    };
  }
}
