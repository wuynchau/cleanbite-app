import React, { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Auth() {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setMessage("");
    setError("");

    try {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) throw new Error("Vui lòng nhập email.");
      if (mode !== "reset" && password.length < 6) {
        throw new Error("Mật khẩu cần có ít nhất 6 ký tự.");
      }

      if (mode === "signin") {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
        });
        if (authError) throw authError;
      } else if (mode === "signup") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: { data: { name: name.trim() } },
        });
        if (authError) throw authError;
        if (!data.session) {
          setMessage("Tài khoản đã được tạo. Hãy kiểm tra email để xác nhận trước khi đăng nhập.");
        }
      } else {
        const { error: authError } = await supabase.auth.resetPasswordForEmail(
          normalizedEmail,
          { redirectTo: window.location.origin },
        );
        if (authError) throw authError;
        setMessage("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu sẽ được gửi đến hộp thư của bạn.");
      }
    } catch (err) {
      setError(err?.message || "Không thể xác thực tài khoản. Vui lòng thử lại.");
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setMessage("");
    setError("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#09090b] text-white px-4 py-10">
      <section className="w-full max-w-sm rounded-3xl border border-neutral-800 bg-[#18181b] p-6 shadow-xl">
        <div className="text-3xl font-extrabold tracking-tight text-[#10b981]">CleanBite</div>
        <p className="mt-1 text-sm text-neutral-400">small bites · brighter lives</p>
        <h1 className="mt-7 text-xl font-bold">
          {mode === "signin" ? "Đăng nhập" : mode === "signup" ? "Tạo tài khoản" : "Quên mật khẩu"}
        </h1>
        <p className="mt-2 text-sm text-neutral-400">
          {mode === "signin"
            ? "Đăng nhập để tiếp tục theo dõi dinh dưỡng."
            : mode === "signup"
              ? "Tạo tài khoản để lưu hồ sơ và nhật ký của bạn."
              : "Nhập email để nhận hướng dẫn đặt lại mật khẩu."}
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit}>
          {mode === "signup" && (
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-300">Tên của bạn</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-neutral-700 bg-[#27272a] px-3 py-3 outline-none focus:border-[#10b981]"
                placeholder="Tên hiển thị"
                required
              />
            </label>
          )}
          <label className="block text-sm">
            <span className="mb-1 block text-neutral-300">Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-neutral-700 bg-[#27272a] px-3 py-3 outline-none focus:border-[#10b981]"
              placeholder="ban@email.com"
              required
            />
          </label>
          {mode !== "reset" && (
            <label className="block text-sm">
              <span className="mb-1 block text-neutral-300">Mật khẩu</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                minLength={6}
                className="w-full rounded-xl border border-neutral-700 bg-[#27272a] px-3 py-3 outline-none focus:border-[#10b981]"
                placeholder="Ít nhất 6 ký tự"
                required
              />
            </label>
          )}
          {error && <p role="alert" className="rounded-xl bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
          {message && <p role="status" className="rounded-xl bg-emerald-500/10 p-3 text-sm text-emerald-300">{message}</p>}
          <button
            disabled={busy}
            className="w-full rounded-xl bg-[#10b981] px-4 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
          >
            {busy ? "Đang xử lý..." : mode === "signin" ? "Đăng nhập" : mode === "signup" ? "Tạo tài khoản" : "Gửi hướng dẫn"}
          </button>
        </form>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          {mode === "signin" ? (
            <>
              <button type="button" onClick={() => switchMode("signup")} className="text-[#10b981] hover:underline">Tạo tài khoản</button>
              <button type="button" onClick={() => switchMode("reset")} className="text-neutral-400 hover:text-white">Quên mật khẩu?</button>
            </>
          ) : (
            <button type="button" onClick={() => switchMode("signin")} className="text-[#10b981] hover:underline">Quay lại đăng nhập</button>
          )}
        </div>
      </section>
    </main>
  );
}
