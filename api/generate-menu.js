const MEALS = ["breakfast", "lunch", "dinner", "snack"];
const DEFAULT_MODEL = "gemini-3.8-flash";
const MAX_FOODS = 160;

function json(res, status, payload) {
  return res.status(status).json(payload);
}

function cleanText(value, max = 500) {
  return String(value ?? "").trim().slice(0, max);
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

function mealSchema() {
  const numeric = { type: "NUMBER" };
  return {
    type: "ARRAY",
    items: {
      type: "OBJECT",
      properties: {
        name: { type: "STRING" },
        weight: numeric,
        calories: numeric,
        protein: numeric,
        carbs: numeric,
        fat: numeric,
      },
      required: ["name", "weight", "calories", "protein", "carbs", "fat"],
    },
  };
}

function parseJson(text) {
  const trimmed = String(text || "").trim().replace(/^\`\`\`(?:json)?\s*/i, "").replace(/\s*\`\`\`$/, "");
  return JSON.parse(trimmed);
}

function normalizeMealItems(items) {
  if (!Array.isArray(items)) return [];
  return items.slice(0, 12).map((item) => ({
    name: cleanText(item?.name, 100),
    weight: Math.max(1, Math.min(2000, Number(item?.weight) || 100)),
    calories: Math.max(0, Math.min(5000, Number(item?.calories) || 0)),
    protein: Math.max(0, Math.min(500, Number(item?.protein) || 0)),
    carbs: Math.max(0, Math.min(1000, Number(item?.carbs) || 0)),
    fat: Math.max(0, Math.min(500, Number(item?.fat) || 0)),
  })).filter((item) => item.name);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { success: false, error: "Phương thức không được hỗ trợ." });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;
  const model = cleanText(process.env.GEMINI_MODEL || DEFAULT_MODEL, 80);

  if (!supabaseUrl || !anonKey) {
    return json(res, 500, { success: false, error: "Thiếu SUPABASE_URL hoặc SUPABASE_ANON_KEY trong biến môi trường Vercel." });
  }
  if (!geminiKey) {
    return json(res, 500, { success: false, error: "Thiếu GEMINI_API_KEY trong biến môi trường Vercel." });
  }

  try {
    const user = await getAuthenticatedUser(req, supabaseUrl, anonKey);
    if (!user?.id) return json(res, 401, { success: false, error: "Bạn cần đăng nhập để tạo thực đơn." });

    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const targetCalories = Math.round(Number(body.targetCalories) || 0);
    if (targetCalories < 700 || targetCalories > 6000) {
      return json(res, 400, { success: false, error: "Mục tiêu calo không hợp lệ." });
    }

    const profile = body.profile && typeof body.profile === "object" ? body.profile : {};
    const targetMacros = body.targetMacros && typeof body.targetMacros === "object" ? body.targetMacros : {};
    const foods = Array.isArray(body.foods) ? body.foods.slice(0, MAX_FOODS).map((food) => ({
      name: cleanText(food?.name, 100),
      category: cleanText(food?.category, 60),
      calories: Math.max(0, Number(food?.calories) || 0),
      protein: Math.max(0, Number(food?.protein) || 0),
      carbs: Math.max(0, Number(food?.carbs) || 0),
      fat: Math.max(0, Number(food?.fat) || 0),
    })).filter((food) => food.name) : [];

    const prompt = [
      "Bạn là trợ lý gợi ý thực đơn dinh dưỡng bằng tiếng Việt. Đây là gợi ý tham khảo, không chẩn đoán hoặc điều trị bệnh.",
      "Trả về JSON theo schema, không thêm markdown hay giải thích ngoài JSON.",
      "Tạo 4 danh sách: breakfast, lunch, dinner, snack. Mỗi món gồm name, weight (gram), calories (kcal của đúng lượng ghi), protein, carbs, fat (gram của đúng lượng ghi).",
      "Ưu tiên sử dụng món trong danh sách món ăn có sẵn. Có thể đổi tên rất ít khi cần; không tạo món ăn không phù hợp với bệnh lý hoặc yêu cầu kiêng.",
      "Calo các bữa nên tương đối gần mục tiêu ngày; phân bổ thực tế, không cho khẩu phần cực đoan. Nếu hồ sơ khai báo bệnh lý, hãy đưa ra gợi ý thận trọng và không thay thế tư vấn y tế.",
      `Mục tiêu calo/ngày: ${targetCalories} kcal.`,
      `Mục tiêu đa lượng/ngày (gram): ${JSON.stringify({ carbs: Number(targetMacros.carbs) || 0, protein: Number(targetMacros.protein) || 0, fat: Number(targetMacros.fat) || 0 })}`,
      `Hồ sơ người dùng: ${JSON.stringify({ age: profile.age, gender: profile.gender, height: profile.height, weight: profile.weight, medical: profile.medical, bmi: profile.bmi, bmr: profile.bmr, tdee: profile.tdee, goal: profile.goal, activityLevel: profile.activityLevel, foodRestrictions: profile.foodRestrictions })}`,
      `Yêu cầu bổ sung: ${cleanText(body.userRequirements, 800) || "Không có"}`,
      `Danh sách món ăn có sẵn (dinh dưỡng tham khảo mỗi 100g): ${JSON.stringify(foods)}`,
    ].join("\n\n");

    const schema = {
      type: "OBJECT",
      properties: {
        breakfast: mealSchema(),
        lunch: mealSchema(),
        dinner: mealSchema(),
        snack: mealSchema(),
      },
      required: MEALS,
    };

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(geminiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 8192,
            responseMimeType: "application/json",
            responseSchema: schema,
          },
        }),
      },
    );

    const geminiData = await geminiResponse.json().catch(() => ({}));
    if (!geminiResponse.ok) {
      const message = geminiData?.error?.message || "Dịch vụ Gemini chưa phản hồi thành công.";
      console.error("Gemini API error:", geminiResponse.status, message);
      return json(res, 502, { success: false, error: `Không tạo được thực đơn: ${message}` });
    }

    const textContent = geminiData?.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("")
      .trim();

    if (!textContent) {
      return json(res, 502, { success: false, error: "Gemini không trả về thực đơn. Vui lòng thử lại." });
    }

    let parsed;
    try {
      parsed = parseJson(textContent);
    } catch {
      console.error("Gemini returned invalid JSON.");
      return json(res, 502, { success: false, error: "Phản hồi AI không đúng định dạng. Vui lòng bấm tạo lại." });
    }

    const mealPlan = Object.fromEntries(MEALS.map((meal) => [meal, normalizeMealItems(parsed?.[meal])]));
    const totalItems = MEALS.reduce((sum, meal) => sum + mealPlan[meal].length, 0);
    if (totalItems === 0) {
      return json(res, 502, { success: false, error: "AI chưa tạo được món ăn hợp lệ. Vui lòng thử lại." });
    }

    // Không ghi lịch sử AI vào Supabase.
    return json(res, 200, { success: true, mealPlan });
  } catch (error) {
    const message = error?.message || "Đã có lỗi khi tạo thực đơn.";
    const status = /phiên đăng nhập|đăng nhập/i.test(message) ? 401 : 500;
    console.error("generate-menu error:", message);
    return json(res, status, { success: false, error: message });
  }
}
