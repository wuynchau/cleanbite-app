const MAX_PDF_BYTES = 3 * 1024 * 1024;
const MAX_BASE64_LENGTH = 4_000_000;

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function cleanFileName(value) {
  const base = String(value || "CleanBite_BaoCao.pdf")
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 120);
  return base.toLowerCase().endsWith(".pdf") ? base : "CleanBite_BaoCao.pdf";
}

async function getAuthenticatedUser(req, supabaseUrl, anonKey) {
  const header = req.headers.authorization || req.headers.Authorization || "";
  const token = header.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) throw new Error("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
  return response.json();
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, error: "Phương thức không được hỗ trợ." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const resendKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!supabaseUrl || !anonKey) {
    return json(res, 500, { success: false, error: "Thiếu SUPABASE_URL (hoặc VITE_SUPABASE_URL) và SUPABASE_PUBLISHABLE_KEY/SUPABASE_ANON_KEY trong biến môi trường Vercel." });
  }
  if (!resendKey || !fromEmail) {
    return json(res, 500, { success: false, error: "Thiếu RESEND_API_KEY hoặc RESEND_FROM_EMAIL trong biến môi trường Vercel." });
  }

  try {
    const user = await getAuthenticatedUser(req, supabaseUrl, anonKey);
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const to = String(body.to || "").trim().toLowerCase();
    const accountEmail = String(user?.email || "").trim().toLowerCase();

    if (!accountEmail) {
      return json(res, 400, { success: false, error: "Tài khoản chưa có email xác thực." });
    }
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return json(res, 400, { success: false, error: "Địa chỉ email nhận báo cáo không hợp lệ." });
    }
    if (to !== accountEmail) {
      return json(res, 403, { success: false, error: "Email nhận báo cáo phải trùng với email của tài khoản đang đăng nhập." });
    }

    const pdfBase64 = String(body.pdfBase64 || "").replace(/^data:application\/pdf;base64,/i, "");
    if (!pdfBase64 || pdfBase64.length > MAX_BASE64_LENGTH || !/^[A-Za-z0-9+/]+={0,2}$/.test(pdfBase64)) {
      return json(res, 413, { success: false, error: "Tệp PDF không hợp lệ hoặc quá lớn. Vui lòng thử lại." });
    }

    const pdfBuffer = Buffer.from(pdfBase64, "base64");
    if (pdfBuffer.length < 100 || pdfBuffer.length > MAX_PDF_BYTES || pdfBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
      return json(res, 413, { success: false, error: "Tệp PDF bị lỗi hoặc vượt quá giới hạn 3 MB." });
    }

    const fileName = cleanFileName(body.fileName);
    const name = String(body.name || "bạn").trim().slice(0, 100) || "bạn";
    const emailHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937">
        <h2 style="color:#047857;margin-bottom:8px">CleanBite – Báo cáo dinh dưỡng</h2>
        <p>Xin chào ${escapeHtml(name)},</p>
        <p>Báo cáo dinh dưỡng của bạn được đính kèm trong email này dưới dạng PDF.</p>
        <p>Hãy tiếp tục ghi nhận bữa ăn và lượng nước uống hằng ngày để theo dõi thói quen dinh dưỡng.</p>
        <p style="color:#6b7280;font-size:12px">Thông tin trong báo cáo chỉ mang tính tham khảo, không thay thế chẩn đoán hoặc tư vấn y tế chuyên môn.</p>
        <p>Trân trọng,<br><strong>CleanBite</strong></p>
      </div>`;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [accountEmail],
        subject: "Báo cáo dinh dưỡng CleanBite của bạn",
        html: emailHtml,
        attachments: [{
          filename: fileName,
          content: pdfBase64,
          content_type: "application/pdf",
        }],
      }),
    });

    const resendResult = await resendResponse.json().catch(() => ({}));
    if (!resendResponse.ok) {
      console.error("Resend API error:", resendResponse.status, resendResult);
      return json(res, 502, {
        success: false,
        error: resendResult?.message || resendResult?.name || "Resend chưa gửi được email. Hãy kiểm tra email người gửi và trạng thái domain trong Resend.",
      });
    }

    // Không lưu tệp PDF hoặc lịch sử gửi email vào Supabase.
    return json(res, 200, { success: true, emailId: resendResult.id || null });
  } catch (error) {
    const message = error?.message || "Đã có lỗi khi gửi báo cáo.";
    const status = /phiên đăng nhập|đăng nhập/i.test(message) ? 401 : 500;
    console.error("send-report error:", message);
    return json(res, status, { success: false, error: message });
  }
}
