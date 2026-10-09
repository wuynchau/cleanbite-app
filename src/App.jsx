import React, { useState, useMemo } from "react";
import * as FoodsModule from "./FoodsData";

// Danh mục thực phẩm mặc định dự phòng
const FALLBACK_FOODS = [
  {
    id: 1,
    name: "Phở bò tái",
    category: "Món ăn",
    calories: 95,
    protein: 8.0,
    carbs: 9.0,
    fat: 3.0,
    image: "/image54.png",
  },
  {
    id: 2,
    name: "Bún bò Huế",
    category: "Món ăn",
    calories: 158,
    protein: 8.0,
    carbs: 18.0,
    fat: 6.0,
    image: "/image52.png",
  },
  {
    id: 3,
    name: "Cơm tấm sườn",
    category: "Món ăn",
    calories: 296,
    protein: 12.0,
    carbs: 35.0,
    fat: 12.0,
    image: "/image56.png",
  },
  {
    id: 4,
    name: "Bánh mì thịt",
    category: "Món ăn",
    calories: 291,
    protein: 12.0,
    carbs: 36.0,
    fat: 11.0,
    image: "/image69.png",
  },
  {
    id: 5,
    name: "Ức gà",
    category: "Đạm",
    calories: 107,
    protein: 22.5,
    carbs: 0.0,
    fat: 1.9,
    image: "/image128.png",
  },
  {
    id: 6,
    name: "Gạo lứt",
    category: "Tinh bột",
    calories: 363,
    protein: 7.5,
    carbs: 77.2,
    fat: 2.7,
    image: "/image103.png",
  },
  {
    id: 7,
    name: "Bông cải xanh",
    category: "Rau củ",
    calories: 41,
    protein: 2.8,
    carbs: 6.6,
    fat: 0.4,
    image: "/image1.png",
  },
  {
    id: 8,
    name: "Chuối",
    category: "Trái cây",
    calories: 98,
    protein: 1.1,
    carbs: 22.8,
    fat: 0.3,
    image: "/image22.png",
  },
  {
    id: 9,
    name: "Nước mắm",
    category: "Gia vị",
    calories: 0,
    protein: 0.0,
    carbs: 0.0,
    fat: 0.0,
    image: "/image80.png",
  },
];

export default function App() {
  const foodDatabase = useMemo(() => {
    return (
      FoodsModule.VIETNAMESE_FOODS ||
      FoodsModule.FOODS_DATA ||
      FoodsModule.default ||
      FALLBACK_FOODS
    );
  }, []);

  // 1. Hồ sơ cá nhân (Onboarding)
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem("cleanbite_profile");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("cleanbite_profile"),
  );

  const [medicalOption, setMedicalOption] = useState(() => {
    const saved = localStorage.getItem("cleanbite_profile");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        const defaults = [
          "Không có",
          "Đau dạ dày",
          "Tiểu đường",
          "Huyết áp",
          "Gout",
        ];
        if (p?.medical && !defaults.includes(p.medical)) return "Khác";
        return p?.medical || "Đau dạ dày";
      } catch (e) {}
    }
    return "Đau dạ dày";
  });

  const [activeTab, setActiveTab] = useState("journal");

  // Trạng thái gói trả phí & Popup
  const [isPremium, setIsPremium] = useState(() => {
    return localStorage.getItem("cleanbite_is_premium") === "true";
  });
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 2. Lịch và Ngày tương tác
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  // 3. Quản lý bữa ăn & Nước uống
  const [meals, setMeals] = useState({
    breakfast: [
      {
        id: 101,
        name: "Yến mạch",
        weight: 60,
        calories: 237,
        protein: 10,
        carbs: 40,
        fat: 4,
      },
      {
        id: 102,
        name: "Trứng gà",
        weight: 55,
        calories: 79,
        protein: 7,
        carbs: 0,
        fat: 5,
      },
    ],
    lunch: [
      {
        id: 103,
        name: "Gạo lứt",
        weight: 150,
        calories: 180,
        protein: 4,
        carbs: 38,
        fat: 1,
      },
      {
        id: 104,
        name: "Ức gà",
        weight: 120,
        calories: 128,
        protein: 27,
        carbs: 0,
        fat: 2,
      },
      {
        id: 105,
        name: "Bông cải xanh",
        weight: 100,
        calories: 41,
        protein: 3,
        carbs: 7,
        fat: 0,
      },
    ],
    dinner: [],
    snack: [],
  });

  const [waterGlasses, setWaterGlasses] = useState(3);

  // 4. Modal chọn gram
  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [modalGrams, setModalGrams] = useState(100);
  const [modalMealType, setModalMealType] = useState("breakfast");

  // 5. TÌM KIẾM & THÊM MÓN THỦ CÔNG
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [customFoodForm, setCustomFoodForm] = useState({
    name: "",
    weight: 100,
    calories: 250,
    mealType: "breakfast",
  });

  // 6. Tab Thực đơn AI
  const [aiCustomNote, setAiCustomNote] = useState("");
  const [aiSuccessAlert, setAiSuccessAlert] = useState(false);
  const [generatedAiMenu, setGeneratedAiMenu] = useState(null);

  // Tính toán chỉ số dinh dưỡng
  const targetCalories = profile ? profile.targetCalo : 1235;
  const targetWater = profile ? profile.waterTarget : 2000;
  const targetCarbs = Math.round((targetCalories * 0.5) / 4);
  const targetProtein = Math.round((targetCalories * 0.25) / 4);
  const targetFat = Math.round((targetCalories * 0.25) / 9);

  const consumed = useMemo(() => {
    let cal = 0,
      pro = 0,
      carb = 0,
      fat = 0;
    Object.values(meals).forEach((mealList) => {
      mealList.forEach((item) => {
        cal += item.calories;
        pro += item.protein;
        carb += item.carbs;
        fat += item.fat;
      });
    });
    return {
      calories: Math.round(cal),
      protein: Math.round(pro),
      carbs: Math.round(carb),
      fat: Math.round(fat),
    };
  }, [meals]);

  const remainingCalories = Math.max(0, targetCalories - consumed.calories);

  const handleRemoveFood = (mealType, itemId) => {
    setMeals((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((item) => item.id !== itemId),
    }));
  };

  const handleConfirmAddFood = () => {
    if (!selectedFoodForModal) return;
    const ratio = modalGrams / 100;
    const newItem = {
      id: Date.now(),
      name: selectedFoodForModal.name,
      weight: modalGrams,
      calories: Math.round(selectedFoodForModal.calories * ratio),
      protein: Math.round(selectedFoodForModal.protein * ratio),
      carbs: Math.round(selectedFoodForModal.carbs * ratio),
      fat: Math.round(selectedFoodForModal.fat * ratio),
    };
    setMeals((prev) => ({
      ...prev,
      [modalMealType]: [...prev[modalMealType], newItem],
    }));
    setSelectedFoodForModal(null);
    setModalGrams(100);
    setActiveTab("journal");
  };

  // Gọi Google Gemini API 100% Thật
  const handleApplyAiMenu = async () => {
    setIsAiLoading(true);
    setAiSuccessAlert(false);
    setGeneratedAiMenu(null);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    const promptText = `
Bạn là chuyên gia dinh dưỡng. Dựa vào thông tin sau:
- Giới tính: ${profile?.gender === "male" ? "Nam" : "Nữ"}
- Cân nặng: ${profile?.weight || 50}kg, Chiều cao: ${profile?.height || 160}cm
- Tình trạng sức khỏe: ${profile?.medical || "Khỏe mạnh"}
- Yêu cầu BẮT BUỘC (PHẢI CÓ các món/nguyên liệu này trong thực đơn): "${aiCustomNote || "Tự do sáng tạo món ăn Việt Nam"}"
- Tổng Calo mục tiêu 1 ngày: ${targetCalories} kcal

NHIỆM VỤ: Trả về JSON thực đơn. BẮT BUỘC chỉ xuất chuỗi JSON đúng cấu trúc bên dưới, không dùng markdown, không giải thích:
{
  "breakfast": [{"name": "Tên món", "weight": 200, "calories": 300, "protein": 15, "carbs": 35, "fat": 5}],
  "lunch": [{"name": "Tên món", "weight": 200, "calories": 400, "protein": 25, "carbs": 50, "fat": 10}],
  "dinner": [{"name": "Tên món", "weight": 200, "calories": 300, "protein": 20, "carbs": 35, "fat": 7}],
  "snack": [{"name": "Tên món", "weight": 100, "calories": 100, "protein": 4, "carbs": 15, "fat": 2}]
}
    `.trim();

    try {
      if (!apiKey)
        throw new Error("Chưa cấu hình VITE_GEMINI_API_KEY trong file .env");

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            generationConfig: {
              temperature: 0.7,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(
          errData.error?.message || "Máy chủ AI đang bận hoặc quá tải",
        );
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) throw new Error("AI trả về phản hồi rỗng");

      const generatedMeals = JSON.parse(rawText);

      const processMeals = (mealArray) =>
        (mealArray || []).map((item) => ({
          ...item,
          id: Date.now() + Math.random(),
        }));

      setGeneratedAiMenu({
        breakfast: processMeals(generatedMeals.breakfast),
        lunch: processMeals(generatedMeals.lunch),
        dinner: processMeals(generatedMeals.dinner),
        snack: processMeals(generatedMeals.snack),
      });
    } catch (err) {
      console.warn("Lỗi API:", err);
      alert(
        `Không thể tạo thực đơn lúc này:\n\n${err.message}\n\nVui lòng thử lại!`,
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((food) => {
      const matchQuery = food.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchCat =
        selectedCategory === "Tất cả" || food.category === selectedCategory;
      return matchQuery && matchCat;
    });
  }, [foodDatabase, searchQuery, selectedCategory]);

  const formatDateDisplay = (date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    return isToday
      ? `Hôm nay, ${day} thg ${month}`
      : `Ngày ${day} thg ${month}`;
  };

  const changeDay = (offset) => {
    const next = new Date(currentDate);
    next.setDate(next.getDate() + offset);
    setCurrentDate(next);
  };

  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const startOffset = (firstDayIndex + 6) % 7;
    const days = [];
    for (let i = 0; i < startOffset; i++) {
      days.push({ day: null });
    }
    for (let d = 1; d <= totalDays; d++) {
      const thisDate = new Date(year, month, d);
      const isSelected = thisDate.toDateString() === currentDate.toDateString();
      const isToday = thisDate.toDateString() === new Date().toDateString();
      days.push({ day: d, date: thisDate, isSelected, isToday });
    }
    return days;
  }, [calendarViewDate, currentDate]);

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex justify-center selection:bg-emerald-500 selection:text-white font-sans">
      <div className="w-full max-w-[430px] min-h-screen bg-[#121214] border-x border-neutral-800 flex flex-col relative pb-28 shadow-2xl">
        {/* ================= HEADER BRANDING ================= */}
        <header className="bg-gradient-to-b from-[#0f5132] via-[#146c43] to-[#10b981] px-5 pt-7 pb-6 rounded-b-[2rem] shadow-lg sticky top-0 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-white/15 p-1 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm shrink-0">
                <img
                  src="/logo.png"
                  alt="CleanBite Logo"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                    e.currentTarget.nextSibling.style.display = "block";
                  }}
                />
                <div
                  style={{ display: "none" }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <span className="text-xl">🥗</span>
                </div>
              </div>
              <div>
                <div className="flex items-center font-black text-2xl tracking-tight leading-none select-none">
                  <span className="text-white drop-shadow-sm">Clean</span>
                  <span className="text-[#4ade80] ml-0.5 drop-shadow-sm flex items-center">
                    <span>B</span>
                    <span className="relative inline-flex items-center justify-center">
                      <svg
                        className="w-2.5 h-2.5 text-[#4ade80] absolute -top-1.5 left-[1px] transform rotate-[35deg]"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.5 3.5c-4.5 0-11 3.5-14 9.5-1.5 3-1 6 1.5 7.5 3.5 2 8-1 11-6 2.5-4 2.5-9 1.5-11z" />
                      </svg>
                      <span>ı</span>
                    </span>
                    <span>te</span>
                  </span>
                </div>
                <p className="text-[11px] font-medium tracking-wide text-emerald-100/90 lowercase mt-0.5">
                  small bites . brighter lives
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab("profile")}
              className="max-w-[125px] truncate text-xs bg-black/25 hover:bg-black/35 backdrop-blur-md px-3 py-1.5 rounded-full text-emerald-100 font-semibold border border-white/15 shadow-sm transition-all text-center active:scale-95"
            >
              {isPremium ? "👑 VIP" : `👋 ${profile?.name || "Bạn mới"}`}
            </button>
          </div>
          <div className="flex items-center justify-between bg-black/25 backdrop-blur-md rounded-2xl mt-4 px-3 py-2 border border-white/10">
            <button
              onClick={() => changeDay(-1)}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white active:scale-90 text-sm font-bold"
            >
              ❮
            </button>
            <button
              onClick={() => {
                setCalendarViewDate(new Date(currentDate));
                setShowCalendarModal(true);
              }}
              className="flex items-center gap-2 text-xs font-bold tracking-wide text-white hover:text-emerald-200 transition-colors py-1 px-3 rounded-lg hover:bg-white/10 active:scale-95"
            >
              <span>📅</span>
              <span>{formatDateDisplay(currentDate)}</span>
              <span className="text-[10px] text-emerald-200">▼</span>
            </button>
            <button
              onClick={() => changeDay(1)}
              className="w-8 h-8 flex items-center justify-center text-white/80 hover:text-white active:scale-90 text-sm font-bold"
            >
              ❯
            </button>
          </div>
        </header>

        {/* ================= 4 TABS GIAO DIỆN ================= */}
        <main className="flex-1 px-4 pt-4 overflow-y-auto">
          {/* TAB 1: NHẬT KÝ */}
          {activeTab === "journal" && (
            <div className="space-y-4">
              <div className="bg-[#18181b] border border-neutral-800 rounded-3xl p-5 shadow-lg">
                <div className="flex flex-col items-center">
                  <div className="relative w-44 h-44 flex items-center justify-center">
                    <svg
                      className="w-full h-full transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#27272a"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeDasharray={264}
                        strokeDashoffset={
                          264 -
                          (264 * Math.min(consumed.calories, targetCalories)) /
                            targetCalories
                        }
                        strokeLinecap="round"
                        fill="transparent"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center text-center">
                      <span className="text-4xl font-extrabold tracking-tight text-white">
                        {remainingCalories}
                      </span>
                      <span className="text-xs text-neutral-400 font-medium mt-0.5">
                        kcal còn lại
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-400 mt-1 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-800/40">
                        {Math.round((consumed.calories / targetCalories) * 100)}
                        % mục tiêu
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 w-full mt-4">
                    <div className="bg-[#27272a]/60 border border-neutral-800 rounded-2xl p-3 flex items-center gap-3">
                      <span className="text-xl">🔥</span>
                      <div>
                        <div className="text-xs text-neutral-400 font-medium">
                          Đã nạp
                        </div>
                        <div className="text-base font-bold text-white">
                          {consumed.calories}{" "}
                          <span className="text-xs font-normal text-neutral-400">
                            kcal
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#27272a]/60 border border-neutral-800 rounded-2xl p-3 flex items-center gap-3">
                      <span className="text-xl">🎯</span>
                      <div>
                        <div className="text-xs text-neutral-400 font-medium">
                          Mục tiêu
                        </div>
                        <div className="text-base font-bold text-white">
                          {targetCalories}{" "}
                          <span className="text-xs font-normal text-neutral-400">
                            kcal
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="w-full mt-4 space-y-2.5 bg-[#27272a]/30 p-3.5 rounded-2xl border border-neutral-800/80">
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-neutral-300">Carbs</span>
                        <span className="text-neutral-400">
                          {consumed.carbs}/{targetCarbs}g
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (consumed.carbs / targetCarbs) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-neutral-300">Chất đạm</span>
                        <span className="text-neutral-400">
                          {consumed.protein}/{targetProtein}g
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (consumed.protein / targetProtein) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-medium mb-1">
                        <span className="text-neutral-300">Chất béo</span>
                        <span className="text-neutral-400">
                          {consumed.fat}/{targetFat}g
                        </span>
                      </div>
                      <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(100, (consumed.fat / targetFat) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Nước uống */}
              <div className="bg-[#18181b] border border-neutral-800 rounded-3xl p-4 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400 text-lg">💧</span>
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        Uống nước
                      </h3>
                      <p className="text-xs text-neutral-400">
                        {waterGlasses * 250}/{targetWater} ml • 250 ml mỗi ly
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setWaterGlasses(0)}
                    className="text-xs text-neutral-400 hover:text-white bg-[#27272a] px-2.5 py-1 rounded-lg transition-colors"
                  >
                    ↺ Đặt lại
                  </button>
                </div>
                <div className="grid grid-cols-8 gap-1.5">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <button
                      key={num}
                      onClick={() =>
                        setWaterGlasses(num === waterGlasses ? num - 1 : num)
                      }
                      className={`h-11 rounded-xl flex items-center justify-center font-bold text-xs transition-all ${
                        num <= waterGlasses
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "bg-[#27272a] text-neutral-500 hover:bg-[#323238]"
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Bữa ăn */}
              {[
                {
                  key: "breakfast",
                  title: "Bữa Sáng",
                  time: "06:00 - 09:00",
                  icon: "🥣",
                },
                {
                  key: "lunch",
                  title: "Bữa Trưa",
                  time: "11:00 - 13:00",
                  icon: "🍲",
                },
                {
                  key: "dinner",
                  title: "Bữa Tối",
                  time: "18:00 - 20:00",
                  icon: "🥗",
                },
                {
                  key: "snack",
                  title: "Bữa Phụ",
                  time: "15:00 - 16:00",
                  icon: "🍎",
                },
              ].map((mealSection) => {
                const items = meals[mealSection.key];
                const mealTotalCalo = items.reduce((s, i) => s + i.calories, 0);
                return (
                  <div
                    key={mealSection.key}
                    className="bg-[#18181b] border border-neutral-800 rounded-3xl p-4 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <div>
                        <div className="flex items-center gap-1.5 font-bold text-sm text-white">
                          <span>{mealSection.icon}</span>
                          <span>{mealSection.title}</span>
                        </div>
                        <span className="text-[11px] text-neutral-500 font-medium">
                          {mealSection.time}
                        </span>
                      </div>
                      <span className="text-xs font-bold bg-emerald-950/60 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-800/40">
                        {mealTotalCalo} kcal
                      </span>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between bg-[#27272a]/50 p-2.5 rounded-2xl border border-neutral-800"
                        >
                          <div className="flex-1 pr-2">
                            <h4 className="text-xs font-semibold text-neutral-100">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-neutral-400">
                              {item.weight}g • {item.protein}g đạm •{" "}
                              {item.carbs}g carbs
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-400">
                              +{item.calories}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoveFood(mealSection.key, item.id)
                              }
                              className="w-5 h-5 flex items-center justify-center text-neutral-500 hover:text-red-400 rounded-full text-sm font-bold"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => {
                        setModalMealType(mealSection.key);
                        setActiveTab("foods");
                      }}
                      className="w-full mt-3 py-2 border border-dashed border-neutral-700 hover:border-emerald-500 text-neutral-400 hover:text-emerald-400 text-xs font-semibold rounded-2xl flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>+</span> Thêm món vào {mealSection.title}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: THỰC PHẨM */}
          {activeTab === "foods" && (
            <div className="space-y-4">
              <div className="bg-[#18181b] border border-neutral-800 rounded-3xl p-4">
                <h2 className="text-lg font-bold text-white">
                  Danh mục thực phẩm
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Kho 156 món ăn & gia vị chuẩn thành phần dinh dưỡng
                </p>
                <div className="mt-3 relative">
                  <input
                    type="text"
                    placeholder="Tìm phở, ức gà, bánh mì, bún bò, rau, gia vị..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#27272a] border border-neutral-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                  <span className="absolute left-3.5 top-2.5 text-neutral-400 text-sm">
                    🔍
                  </span>
                </div>

                <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-none">
                  {[
                    "Tất cả",
                    "Món ăn",
                    "Đạm",
                    "Tinh bột",
                    "Rau củ",
                    "Trái cây",
                    "Gia vị",
                  ].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                          : "bg-[#27272a] text-neutral-400 hover:text-white"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowCustomFoodModal(true)}
                  className="w-full mt-4 py-2.5 bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/40 border-dashed text-emerald-400 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>+</span> Không tìm thấy món? Tự nhập thủ công
                </button>
              </div>

              <div className="space-y-2.5">
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    onClick={() => {
                      setSelectedFoodForModal(food);
                      setModalGrams(100);
                    }}
                    className="bg-[#18181b] hover:bg-[#202024] active:scale-[0.99] border border-neutral-800 rounded-2xl p-3 flex items-center justify-between cursor-pointer transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-[#27272a] overflow-hidden flex items-center justify-center border border-neutral-800 shrink-0">
                        <img
                          src={food.image}
                          alt={food.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                            e.currentTarget.nextSibling.style.display = "flex";
                          }}
                        />
                        <div
                          style={{ display: "none" }}
                          className="w-full h-full items-center justify-center text-xl"
                        >
                          {food.category === "Món ăn"
                            ? "🍲"
                            : food.category === "Đạm"
                              ? "🍗"
                              : food.category === "Tinh bột"
                                ? "🍚"
                                : food.category === "Rau củ"
                                  ? "🥦"
                                  : food.category === "Trái cây"
                                    ? "🍎"
                                    : "🧂"}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-neutral-100">
                          {food.name}
                        </h4>
                        <p className="text-[11px] text-neutral-400 mt-0.5">
                          {food.protein}g đạm • {food.carbs}g carbs • {food.fat}
                          g béo / 100g
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-emerald-400">
                        {food.calories}
                      </div>
                      <div className="text-[10px] text-neutral-500">
                        kcal/100g
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: THỰC ĐƠN AI */}
          {activeTab === "ai" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-950/80 via-[#18181b] to-[#18181b] border border-emerald-900/40 rounded-3xl p-5 shadow-lg relative">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      AI Lên Thực Đơn
                    </h2>
                    <p className="text-xs text-neutral-400">
                      Chế độ:{" "}
                      <span className="text-emerald-400 font-semibold">
                        {profile?.medical === "Không có"
                          ? "Cá nhân hóa tự do"
                          : profile?.medical || "Bình thường"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-[#27272a]/60 border border-neutral-800 rounded-2xl p-3">
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Bạn muốn ăn gì hôm nay?
                  </label>
                  <textarea
                    rows="2"
                    placeholder="VD: Tôi muốn 3 bữa đều có thịt bò, có sữa, trứng..."
                    value={aiCustomNote}
                    onChange={(e) => setAiCustomNote(e.target.value)}
                    className="w-full bg-[#18181b] border border-emerald-500/50 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 resize-none"
                  />
                </div>

                <button
                  onClick={handleApplyAiMenu}
                  disabled={isAiLoading}
                  className="w-full mt-4 bg-[#27272a] hover:bg-[#323238] border border-emerald-500/50 active:scale-[0.98] disabled:opacity-60 text-emerald-400 font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 transition-all"
                >
                  {isAiLoading ? (
                    <>
                      <span className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></span>
                      <span>AI đang thiết kế thực đơn...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡</span>
                      <span>AI lên thực đơn</span>
                    </>
                  )}
                </button>
              </div>

              {/* BẢN NHÁP (PREVIEW) */}
              {generatedAiMenu && (
                <div className="bg-[#18181b] border border-emerald-800/60 rounded-3xl p-5 shadow-lg animate-fade-in">
                  <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-lg">🍱</span> Thực đơn AI gợi ý cho
                    bạn:
                  </h3>

                  <div className="space-y-3 mb-5">
                    {[
                      { key: "breakfast", label: "Sáng" },
                      { key: "lunch", label: "Trưa" },
                      { key: "dinner", label: "Tối" },
                      { key: "snack", label: "Phụ" },
                    ].map((meal) => {
                      const items = generatedAiMenu[meal.key] || [];
                      if (items.length === 0) return null;
                      const totalCal = items.reduce(
                        (s, i) => s + i.calories,
                        0,
                      );

                      return (
                        <div
                          key={meal.key}
                          className="bg-[#27272a]/50 border border-neutral-800 rounded-xl p-3"
                        >
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                              {meal.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-bold bg-neutral-800 px-2 py-0.5 rounded-md">
                              {totalCal} kcal
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {items.map((item, idx) => (
                              <div
                                key={idx}
                                className="text-xs text-neutral-200"
                              >
                                •{" "}
                                <span className="font-semibold">
                                  {item.name}
                                </span>{" "}
                                <span className="text-neutral-500">
                                  ({item.weight}g)
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => {
                      setMeals(generatedAiMenu);
                      setGeneratedAiMenu(null);
                      setAiSuccessAlert(true);
                      setTimeout(() => {
                        setAiSuccessAlert(false);
                        setActiveTab("journal");
                      }, 1200);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    ✓ Chốt thực đơn này vào Nhật ký
                  </button>
                </div>
              )}

              {aiSuccessAlert && (
                <div className="mt-3 bg-emerald-900/60 border border-emerald-500 text-emerald-200 text-xs text-center py-2 rounded-xl">
                  ✓ Đã nạp thực đơn thành công!
                </div>
              )}

              {/* MÔ HÌNH 4: KHỐI TƯ VẤN CHUYÊN GIA 1-1 */}
              <div
                onClick={() => setShowExpertModal(true)}
                className="bg-[#18181b] border border-emerald-800/40 hover:border-emerald-500/60 rounded-3xl p-4 cursor-pointer transition-all shadow-md group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-950 flex items-center justify-center text-xl border border-emerald-800/50">
                      🩺
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                          Tư vấn 1-1 với Bác sĩ Dinh dưỡng
                        </h4>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.5 rounded font-bold">
                          Mới
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Lộ trình trị liệu ăn uống cá nhân hóa cho bệnh lý
                      </p>
                    </div>
                  </div>
                  <span className="text-neutral-500 group-hover:text-white transition-colors">
                    ❯
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CÁ NHÂN */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              {/* MÔ HÌNH 1: THẺ GÓI PREMIUM */}
              <div
                onClick={() => setShowPremiumModal(true)}
                className={`rounded-[1.75rem] p-5 cursor-pointer shadow-xl relative overflow-hidden transition-all active:scale-[0.99] border ${
                  isPremium
                    ? "bg-gradient-to-r from-amber-600 via-emerald-600 to-teal-700 border-amber-400/40"
                    : "bg-gradient-to-r from-[#4f46e5] via-[#7c3aed] to-[#c026d3] border-white/10 hover:opacity-95"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 pr-2">
                    <h3 className="text-lg font-bold text-white tracking-tight">
                      {isPremium ? "Đã kích hoạt VIP 👑" : "Gói Premium"}
                    </h3>
                    <p className="text-xs text-white/90 mt-1.5 leading-relaxed font-normal">
                      {isPremium
                        ? "Bạn đang trải nghiệm bản không quảng cáo & đầy đủ tính năng cao cấp."
                        : "Trải nghiệm không quảng cáo và sử dụng đầy đủ các tính năng nâng cao."}
                    </p>
                  </div>
                  <div className="shrink-0 text-white flex items-center justify-center">
                    <svg
                      className="w-12 h-12 text-white drop-shadow"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M2 19h20v2H2v-2zm0-14l5 4.5L12 3l5 6.5L22 5v12H2V5z" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* THẺ BMI */}
              <div className="bg-[#18181b] border border-neutral-800 rounded-3xl p-5 shadow-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-neutral-300">
                    Chỉ số khối cơ thể (BMI)
                  </h3>
                  <button
                    onClick={() => setShowOnboarding(true)}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    Chỉnh sửa
                  </button>
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-emerald-400">
                    {profile?.bmi || "18.6"}
                  </span>
                  <span className="text-xs font-bold text-neutral-300 bg-neutral-800 px-3 py-1 rounded-full">
                    {parseFloat(profile?.bmi || "18.6") < 18.5
                      ? "Hơi gầy"
                      : parseFloat(profile?.bmi || "18.6") <= 22.9
                        ? "Cân nặng tốt (Chuẩn Châu Á)"
                        : "Tiền béo phì"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-neutral-800 text-center">
                  <div className="bg-[#27272a]/50 p-2.5 rounded-2xl">
                    <div className="text-base font-bold text-white">
                      {profile?.height || 152} cm
                    </div>
                    <div className="text-xs text-neutral-400">Chiều cao</div>
                  </div>
                  <div className="bg-[#27272a]/50 p-2.5 rounded-2xl">
                    <div className="text-base font-bold text-white">
                      {profile?.weight || 43} kg
                    </div>
                    <div className="text-xs text-neutral-400">Cân nặng</div>
                  </div>
                </div>
              </div>

              {/* THÔNG TIN HỒ SƠ */}
              <div className="bg-[#18181b] border border-neutral-800 rounded-3xl p-4 shadow-lg space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Tên của bạn</span>
                  <span className="font-bold text-white">
                    {profile?.name || "Chưa cập nhật"}
                  </span>
                </div>
                {profile?.email && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-neutral-400">Email nhận báo cáo</span>
                    <span className="font-bold text-emerald-400 truncate max-w-[200px]">
                      {profile.email}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Độ tuổi & Giới tính</span>
                  <span className="font-bold text-white">
                    {profile?.age || 20} tuổi •{" "}
                    {profile?.gender === "male" ? "Nam" : "Nữ"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">
                    BMR (Năng lượng chuyển hóa)
                  </span>
                  <span className="font-bold text-emerald-400">
                    {profile?.bmr || 1035} kcal
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-400">Bệnh lý theo dõi</span>
                  <span className="font-bold text-amber-400">
                    {profile?.medical || "Không có"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (
                    confirm(
                      "Bạn có muốn xóa dữ liệu đã lưu để nhập lại từ đầu?",
                    )
                  ) {
                    localStorage.removeItem("cleanbite_profile");
                    localStorage.removeItem("cleanbite_is_premium");
                    setProfile(null);
                    setIsPremium(false);
                    setShowOnboarding(true);
                  }
                }}
                className="w-full py-3 bg-red-950/40 border border-red-800/40 text-red-400 hover:bg-red-900/30 rounded-2xl text-xs font-semibold transition-colors"
              >
                Thiết lập lại hồ sơ từ đầu
              </button>
            </div>
          )}
        </main>

        {/* ================= MÔ HÌNH 2: BANNER QUẢNG CÁO TỰ NHIÊN (NATIVE AD) ================= */}
        {!isPremium && (
          <div className="fixed bottom-16 w-full max-w-[430px] px-3 z-30">
            <div className="bg-[#18181b]/95 backdrop-blur-md border border-neutral-700/80 rounded-2xl p-2.5 flex items-center justify-between shadow-2xl">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-base shrink-0">
                  🥗
                </div>
                <div className="pr-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] bg-neutral-800 text-neutral-400 px-1 py-0.2 rounded font-bold">
                      QC
                    </span>
                    <h5 className="text-xs font-bold text-white truncate max-w-[190px]">
                      Bếp Eat Clean Healthy Meal
                    </h5>
                  </div>
                  <p className="text-[10px] text-neutral-400 truncate max-w-[210px]">
                    Giảm 25% cho thành viên CleanBite • ★ 4.9
                  </p>
                </div>
              </div>
              <button
                onClick={() =>
                  alert(
                    "Mô phỏng Doanh thu Quảng cáo (Google Ads / Brand Sponsorship):\nNgười dùng bấm xem đối tác, CleanBite ghi nhận doanh thu theo lượt tương tác (CPC).",
                  )
                }
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shrink-0 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
              >
                Xem
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL LỊCH POPUP ================= */}
        {showCalendarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="w-full max-w-xs bg-[#18181b] border border-neutral-700 rounded-3xl p-5 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    const prevM = new Date(calendarViewDate);
                    prevM.setMonth(prevM.getMonth() - 1);
                    setCalendarViewDate(prevM);
                  }}
                  className="w-8 h-8 rounded-full bg-[#27272a] hover:bg-neutral-700 flex items-center justify-center text-xs font-bold"
                >
                  ❮
                </button>
                <span className="text-sm font-bold text-white">
                  Tháng {calendarViewDate.getMonth() + 1},{" "}
                  {calendarViewDate.getFullYear()}
                </span>
                <button
                  onClick={() => {
                    const nextM = new Date(calendarViewDate);
                    nextM.setMonth(nextM.getMonth() + 1);
                    setCalendarViewDate(nextM);
                  }}
                  className="w-8 h-8 rounded-full bg-[#27272a] hover:bg-neutral-700 flex items-center justify-center text-xs font-bold"
                >
                  ❯
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-neutral-400">
                <span>T2</span>
                <span>T3</span>
                <span>T4</span>
                <span>T5</span>
                <span>T6</span>
                <span>T7</span>
                <span>CN</span>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {calendarDays.map((item, idx) => {
                  if (!item.day) {
                    return <div key={idx} className="h-8" />;
                  }
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentDate(item.date);
                        setShowCalendarModal(false);
                      }}
                      className={`h-8 rounded-xl flex items-center justify-center font-semibold transition-all ${
                        item.isSelected
                          ? "bg-emerald-500 text-white font-bold shadow-md shadow-emerald-500/40 scale-105"
                          : item.isToday
                            ? "border border-emerald-500 text-emerald-400 bg-emerald-950/30"
                            : "hover:bg-[#27272a] text-neutral-200"
                      }`}
                    >
                      {item.day}
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-2 pt-2 border-t border-neutral-800">
                <button
                  onClick={() => {
                    setCurrentDate(new Date());
                    setShowCalendarModal(false);
                  }}
                  className="flex-1 py-2 bg-[#27272a] hover:bg-neutral-700 text-xs font-semibold rounded-xl text-neutral-200 transition-colors"
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setShowCalendarModal(false)}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL CHỌN GRAM TỪ DANH SÁCH MÓN ================= */}
        {selectedFoodForModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-[430px] bg-[#18181b] border-t border-neutral-800 rounded-t-[2rem] p-6 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#27272a] overflow-hidden flex items-center justify-center border border-neutral-800 shrink-0">
                    <img
                      src={selectedFoodForModal.image}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-neutral-100">
                      {selectedFoodForModal.name}
                    </h3>
                    <p className="text-xs text-neutral-400">
                      Gốc: {selectedFoodForModal.calories} kcal / 100g
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFoodForModal(null)}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 mb-2">
                  Thêm vào bữa ăn:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { key: "breakfast", label: "Sáng" },
                    { key: "lunch", label: "Trưa" },
                    { key: "dinner", label: "Tối" },
                    { key: "snack", label: "Phụ" },
                  ].map((b) => (
                    <button
                      key={b.key}
                      onClick={() => setModalMealType(b.key)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all ${
                        modalMealType === b.key
                          ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                          : "bg-[#27272a] text-neutral-400 hover:text-white"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-neutral-400">
                    Khối lượng thực tế:
                  </span>
                  <span className="text-sm font-bold text-white bg-neutral-800 px-3 py-1 rounded-lg border border-neutral-700">
                    {modalGrams}{" "}
                    <span className="text-xs text-neutral-400 font-normal">
                      gram
                    </span>
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="500"
                  step="5"
                  value={modalGrams}
                  onChange={(e) => setModalGrams(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                />
              </div>
              <div className="bg-emerald-950/40 border border-emerald-800/40 p-3 rounded-2xl flex items-center justify-between">
                <span className="text-xs text-emerald-300 font-medium">
                  Năng lượng nạp vào:
                </span>
                <span className="text-lg font-extrabold text-emerald-400">
                  +
                  {Math.round(
                    (selectedFoodForModal.calories * modalGrams) / 100,
                  )}{" "}
                  kcal
                </span>
              </div>
              <button
                onClick={handleConfirmAddFood}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all"
              >
                Xác nhận thêm vào Bữa ăn
              </button>
              <button
                onClick={() =>
                  alert(
                    `Mô phỏng Tiếp thị liên kết (Affiliate Marketing):\n• Món: ${selectedFoodForModal.name}\n• Điều hướng sang GrabFood / ShopeeFood với mã giới thiệu CleanBite.\n• CleanBite nhận hoa hồng 8% - 10% trên đơn đặt thành công.`,
                  )
                }
                className="w-full py-2.5 bg-[#27272a] hover:bg-[#323238] border border-neutral-700 text-neutral-300 font-semibold rounded-2xl text-[11px] flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>🛵</span> Không tiện nấu? Đặt món này qua ShopeeFood /
                GrabFood
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL THÊM MÓN THỦ CÔNG MỚI ================= */}
        {showCustomFoodModal && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/85 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-[430px] bg-[#18181b] border-t border-neutral-800 rounded-t-[2rem] p-6 text-white shadow-2xl space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white">
                  Tự nhập món ăn mới
                </h3>
                <button
                  onClick={() => setShowCustomFoodModal(false)}
                  className="w-8 h-8 rounded-full bg-neutral-800 text-neutral-400 hover:text-white flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Tên món ăn
                  </label>
                  <input
                    type="text"
                    placeholder="VD: Bánh tráng trộn, Trà sữa chocomint..."
                    value={customFoodForm.name}
                    onChange={(e) =>
                      setCustomFoodForm({
                        ...customFoodForm,
                        name: e.target.value,
                      })
                    }
                    className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Khối lượng (gram)
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      value={customFoodForm.weight}
                      onChange={(e) =>
                        setCustomFoodForm({
                          ...customFoodForm,
                          weight: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Ước tính Calo
                    </label>
                    <input
                      type="number"
                      placeholder="250"
                      value={customFoodForm.calories}
                      onChange={(e) =>
                        setCustomFoodForm({
                          ...customFoodForm,
                          calories: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2.5 text-xs text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-2">
                    Thêm vào bữa ăn:
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { key: "breakfast", label: "Sáng" },
                      { key: "lunch", label: "Trưa" },
                      { key: "dinner", label: "Tối" },
                      { key: "snack", label: "Phụ" },
                    ].map((b) => (
                      <button
                        key={b.key}
                        onClick={() =>
                          setCustomFoodForm({
                            ...customFoodForm,
                            mealType: b.key,
                          })
                        }
                        className={`py-2 rounded-xl text-xs font-bold transition-all ${customFoodForm.mealType === b.key ? "bg-emerald-500 text-white" : "bg-[#27272a] text-neutral-400"}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!customFoodForm.name)
                    return alert("Vui lòng nhập tên món!");
                  const newItem = {
                    id: Date.now(),
                    name: customFoodForm.name,
                    weight: customFoodForm.weight,
                    calories: customFoodForm.calories,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                  };
                  setMeals((prev) => ({
                    ...prev,
                    [customFoodForm.mealType]: [
                      ...prev[customFoodForm.mealType],
                      newItem,
                    ],
                  }));
                  setShowCustomFoodModal(false);
                  setCustomFoodForm({
                    name: "",
                    weight: 100,
                    calories: 250,
                    mealType: "breakfast",
                  });
                  setActiveTab("journal");
                }}
                className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-emerald-500/25 transition-all"
              >
                Thêm ngay vào Nhật ký
              </button>
            </div>
          </div>
        )}

        {/* ================= MODAL THÔNG TIN GÓI PREMIUM ================= */}
        {showPremiumModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-[#18181b] border border-purple-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-4">
              <div className="text-center">
                <span className="text-amber-300 text-2xl">👑</span>
                <h3 className="text-lg font-extrabold text-white mt-1">
                  CleanBite Premium
                </h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Nâng tầm phong cách sống lành mạnh
                </p>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex items-center gap-2 bg-[#27272a]/70 p-2.5 rounded-xl border border-neutral-700">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Tắt hoàn toàn toàn bộ quảng cáo</span>
                </div>
                <div className="flex items-center gap-2 bg-[#27272a]/70 p-2.5 rounded-xl border border-neutral-700">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Mở khóa AI Menu 7 ngày & Lịch đi chợ tuần</span>
                </div>
                <div className="flex items-center gap-2 bg-[#27272a]/70 p-2.5 rounded-xl border border-neutral-700">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Xuất báo cáo dinh dưỡng PDF gửi chuyên gia</span>
                </div>
                <div className="flex items-center gap-2 bg-[#27272a]/70 p-2.5 rounded-xl border border-neutral-700">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>Tặng 1 buổi tư vấn 1-1 với Bác sĩ Dinh dưỡng</span>
                </div>
              </div>
              <div className="bg-purple-950/40 border border-purple-700/50 p-3 rounded-2xl text-center">
                <div className="text-xs text-purple-300 font-medium">
                  Chỉ từ
                </div>
                <div className="text-xl font-black text-amber-300">
                  39.000 đ{" "}
                  <span className="text-xs text-white/70 font-normal">
                    / tháng
                  </span>
                </div>
                <div className="text-[10px] text-neutral-400">
                  Hoặc 299.000 đ / năm (Tiết kiệm 35%)
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="flex-1 py-2.5 bg-[#27272a] hover:bg-neutral-700 text-xs font-semibold rounded-xl text-neutral-300"
                >
                  Để sau
                </button>
                <button
                  onClick={() => {
                    setIsPremium(true);
                    localStorage.setItem("cleanbite_is_premium", "true");
                    setShowPremiumModal(false);
                    alert(
                      "Chúc mừng! Bạn đã kích hoạt thành công Gói Premium (Mô phỏng).\nBanner quảng cáo đã được ẩn hoàn toàn!",
                    );
                  }}
                  className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-emerald-600 text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-600/30"
                >
                  Dùng thử 7 ngày
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL TƯ VẤN CHUYÊN GIA 1-1 ================= */}
        {showExpertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-[#18181b] border border-emerald-800 rounded-3xl p-6 text-white shadow-2xl space-y-4">
              <div className="text-center">
                <span className="text-3xl">🩺</span>
                <h3 className="text-base font-extrabold text-white mt-1">
                  Kết nối Bác sĩ Dinh dưỡng
                </h3>
                <p className="text-xs text-neutral-400">
                  Hỗ trợ người bệnh: {profile?.medical || "Đau dạ dày"}
                </p>
              </div>
              <div className="bg-[#27272a] p-3 rounded-2xl text-xs space-y-1.5 border border-neutral-700">
                <div className="font-bold text-emerald-400">
                  BS.CKI Nguyễn Minh Tuấn
                </div>
                <div className="text-[11px] text-neutral-300">
                  Viện Nghiên cứu Dinh dưỡng TP.HCM
                </div>
                <div className="text-[10px] text-neutral-400">
                  10 năm kinh nghiệm điều trị dinh dưỡng bệnh lý tiêu hóa
                </div>
              </div>
              <div className="text-[11px] text-neutral-300 space-y-1 bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50">
                <div>• Hình thức: Gọi Video trực tuyến 45 phút</div>
                <div>• Kèm thực đơn cá nhân hóa 14 ngày</div>
                <div>• Chi phí: 250.000 đ / buổi</div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowExpertModal(false)}
                  className="flex-1 py-2.5 bg-[#27272a] text-xs font-semibold rounded-xl text-neutral-300"
                >
                  Đóng
                </button>
                <button
                  onClick={() => {
                    alert(
                      "Mô phỏng Dịch vụ Chuyên gia B2B2C:\n• Yêu cầu tư vấn đã được gửi đi.\n• CleanBite giữ vai trò nền tảng trung gian kết nối và thu phí chiết khấu 15%.",
                    );
                    setShowExpertModal(false);
                  }}
                  className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-500/20"
                >
                  Đặt lịch hẹn
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= ONBOARDING MODAL ================= */}
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
            <div className="w-full max-w-sm bg-[#18181b] border border-neutral-800 rounded-3xl p-6 text-white shadow-2xl">
              <div className="text-center mb-4">
                <span className="text-emerald-400 text-[11px] font-bold uppercase tracking-wider bg-emerald-950/70 px-3 py-1 rounded-full border border-emerald-800/50">
                  Chào mừng bạn
                </span>
                <h2 className="text-xl font-bold mt-2">
                  Thiết lập hồ sơ CleanBite
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Cá nhân hóa lượng Calo và chế độ ăn uống cho riêng bạn
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.target;

                  const name = form.userName?.value?.trim() || "Bạn mới";
                  const email = form.userEmail?.value?.trim() || "";
                  const gender = form.gender?.value || "female";
                  const age = parseInt(form.age?.value) || 20;
                  const height = parseFloat(form.height?.value) || 160;
                  const weight = parseFloat(form.weight?.value) || 50;

                  const customMed = form.customMedical
                    ? form.customMedical.value.trim()
                    : "";
                  const medical =
                    medicalOption === "Khác" && customMed
                      ? customMed
                      : medicalOption;

                  const bmiVal = (
                    weight /
                    ((height / 100) * (height / 100))
                  ).toFixed(1);
                  let bmrVal = 10 * weight + 6.25 * height - 5 * age;
                  bmrVal =
                    gender === "male"
                      ? Math.round(bmrVal + 5)
                      : Math.round(bmrVal - 161);

                  const newProf = {
                    name,
                    email,
                    gender,
                    age,
                    height,
                    weight,
                    medical,
                    bmi: bmiVal,
                    bmr: bmrVal,
                    targetCalo: bmrVal + 200,
                    waterTarget: Math.round(weight * 35),
                  };

                  localStorage.setItem(
                    "cleanbite_profile",
                    JSON.stringify(newProf),
                  );
                  setProfile(newProf);
                  setShowOnboarding(false);
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Tên của bạn
                  </label>
                  <input
                    name="userName"
                    type="text"
                    required
                    placeholder="VD: Mai Lan"
                    defaultValue={profile?.name || ""}
                    className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-neutral-400">
                      Email nhận thực đơn
                    </label>
                    <span className="text-[10px] text-neutral-500 font-normal">
                      Không bắt buộc
                    </span>
                  </div>
                  <input
                    name="userEmail"
                    type="email"
                    placeholder="VD: mailan@gmail.com"
                    defaultValue={profile?.email || ""}
                    className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Giới tính
                    </label>
                    <select
                      name="gender"
                      defaultValue={profile?.gender || "female"}
                      className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="female">Nữ</option>
                      <option value="male">Nam</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Tuổi
                    </label>
                    <input
                      name="age"
                      type="number"
                      required
                      placeholder="20"
                      defaultValue={profile?.age || 20}
                      className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Chiều cao (cm)
                    </label>
                    <input
                      name="height"
                      type="number"
                      required
                      placeholder="152"
                      defaultValue={profile?.height || 152}
                      className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-neutral-400 mb-1">
                      Cân nặng (kg)
                    </label>
                    <input
                      name="weight"
                      type="number"
                      required
                      placeholder="43"
                      defaultValue={profile?.weight || 43}
                      className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 mb-1">
                    Tình trạng sức khỏe / Bệnh lý
                  </label>
                  <select
                    value={medicalOption}
                    onChange={(e) => setMedicalOption(e.target.value)}
                    className="w-full bg-[#27272a] border border-neutral-700 rounded-xl px-2.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Không có">
                      Khỏe mạnh (Không có bệnh lý)
                    </option>
                    <option value="Đau dạ dày">
                      Đau dạ dày / Trào ngược dạ dày
                    </option>
                    <option value="Tiểu đường">
                      Tiểu đường / Kháng Insulin
                    </option>
                    <option value="Huyết áp">Huyết áp cao / Tim mạch</option>
                    <option value="Gout">Gout / Axit uric cao</option>
                    <option value="Khác">Bệnh lý khác (Tự nhập...)</option>
                  </select>

                  {medicalOption === "Khác" && (
                    <div className="mt-2">
                      <input
                        name="customMedical"
                        type="text"
                        placeholder="Nhập bệnh của bạn (VD: Gan nhiễm mỡ, mỡ máu, suy giáp...)"
                        defaultValue={
                          profile?.medical &&
                          ![
                            "Không có",
                            "Đau dạ dày",
                            "Tiểu đường",
                            "Huyết áp",
                            "Gout",
                          ].includes(profile.medical)
                            ? profile.medical
                            : ""
                        }
                        className="w-full bg-[#27272a] border border-emerald-500/80 rounded-xl px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/25 transition-all"
                >
                  Hoàn tất & Khám phá ứng dụng
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ================= THANH ĐIỀU HƯỚNG ĐÁY ================= */}
        <nav className="fixed bottom-0 w-full max-w-[430px] bg-[#121214]/95 backdrop-blur-md border-t border-neutral-800/80 px-4 py-2.5 flex items-center justify-around z-40">
          {[
            { id: "journal", label: "Nhật ký", icon: "📝" },
            { id: "foods", label: "Thực phẩm", icon: "🍲" },
            { id: "ai", label: "Thực đơn AI", icon: "✨" },
            { id: "profile", label: "Cá nhân", icon: "👤" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 transition-all ${
                activeTab === tab.id
                  ? "text-emerald-400 scale-105"
                  : "text-neutral-500 hover:text-neutral-300"
              }`}
            >
              <span className="text-lg leading-none">{tab.icon}</span>
              <span className="text-[11px] font-semibold">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
