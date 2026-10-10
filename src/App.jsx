import React, { useState, useMemo } from "react";
import * as FoodsModule from "./FoodsData";

const FALLBACK_FOODS = [
  {
    id: 1,
    name: "Phở bò tái",
    category: "Món ăn",
    calories: 350,
    protein: 22.0,
    carbs: 45.0,
    fat: 9.0,
    image: "/image54.png",
  },
  {
    id: 2,
    name: "Bún bò Huế",
    category: "Món ăn",
    calories: 485,
    protein: 28.0,
    carbs: 52.0,
    fat: 18.0,
    image: "/image52.png",
  },
  {
    id: 3,
    name: "Cơm tấm sườn",
    category: "Món ăn",
    calories: 620,
    protein: 32.0,
    carbs: 75.0,
    fat: 22.0,
    image: "/image56.png",
  },
  {
    id: 4,
    name: "Bánh mì thịt",
    category: "Món ăn",
    calories: 380,
    protein: 18.0,
    carbs: 46.0,
    fat: 14.0,
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

  // ================= 1. HỆ THỐNG GIAO DIỆN SÁNG/TỐI (CHUẨN TAILWIND) =================
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("cleanbite_theme");
      return saved ? saved === "dark" : true;
    } catch (e) {
      return true;
    }
  });

  const toggleTheme = () => {
    const newVal = !isDarkMode;
    setIsDarkMode(newVal);
    localStorage.setItem("cleanbite_theme", newVal ? "dark" : "light");
  };

  // Cấu hình màu sắc đồng bộ cho 2 chế độ Sáng/Tối
  const theme = {
    bgMain: isDarkMode ? "bg-[#09090b]" : "bg-slate-200",
    bgApp: isDarkMode ? "bg-[#121214]" : "bg-[#f4f6f8]",
    text: isDarkMode ? "text-white" : "text-slate-800",
    textMuted: isDarkMode ? "text-neutral-400" : "text-slate-500",
    card: isDarkMode
      ? "bg-[#18181b] border-neutral-800"
      : "bg-white border-slate-100 shadow-[0_2px_15px_rgba(0,0,0,0.03)]",
    cardInner: isDarkMode
      ? "bg-[#27272a]/60 border-neutral-800"
      : "bg-slate-50 border-slate-100",
    input: isDarkMode
      ? "bg-[#27272a] border-neutral-700 text-white placeholder-neutral-500"
      : "bg-white border-slate-200 text-slate-800 placeholder-slate-400",
    nav: isDarkMode
      ? "bg-[#121214]/95 border-neutral-800/80"
      : "bg-white/95 border-slate-200",
    navActive: "text-[#10b981]",
    navInactive: isDarkMode
      ? "text-neutral-500 hover:text-neutral-300"
      : "text-slate-400 hover:text-slate-600",
    divider: isDarkMode
      ? "divide-neutral-800 border-neutral-800"
      : "divide-slate-100 border-slate-100",
    circleTrack: isDarkMode ? "#27272a" : "#e2e8f0",
    overlay: isDarkMode ? "bg-black/85" : "bg-slate-900/40",
    iconBg: isDarkMode ? "bg-[#27272a]" : "bg-slate-100",
    headerBg: "bg-[#10b981]",
    borderApp: isDarkMode ? "border-neutral-800" : "border-slate-300",
  };

  // ================= 2. STATE CHỨC NĂNG =================
  const [profile, setProfile] = useState(() => {
    try {
      const saved = localStorage.getItem("cleanbite_profile");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return null;
  });

  const [showOnboarding, setShowOnboarding] = useState(
    () => !localStorage.getItem("cleanbite_profile"),
  );
  const [medicalOption, setMedicalOption] = useState(
    () => profile?.medical || "Đau dạ dày",
  );

  const [activeTab, setActiveTab] = useState("journal");
  const [isPremium, setIsPremium] = useState(() => {
    try {
      return localStorage.getItem("cleanbite_is_premium") === "true";
    } catch (e) {
      return false;
    }
  });

  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

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
    ],
    dinner: [],
    snack: [],
  });

  const [waterGlasses, setWaterGlasses] = useState(3);
  const [tempWaterTarget, setTempWaterTarget] = useState(
    profile?.waterTarget || 2000,
  );

  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [modalGrams, setModalGrams] = useState(100);
  const [modalMealType, setModalMealType] = useState("breakfast");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [customFoodForm, setCustomFoodForm] = useState({
    name: "",
    weight: 100,
    calories: 250,
    mealType: "breakfast",
  });

  const [aiCustomNote, setAiCustomNote] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [generatedAiMenu, setGeneratedAiMenu] = useState(null);
  const [aiSuccessAlert, setAiSuccessAlert] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  // ================= 3. LOGIC TÍNH TOÁN =================
  const targetCalories = profile?.targetCalo || 1235;
  const targetWater = profile?.waterTarget || 2000;

  const macroSplit = profile?.macroSplit || { carbs: 50, protein: 25, fat: 25 };
  const targetCarbs =
    Math.round((targetCalories * (macroSplit.carbs / 100)) / 4) || 0;
  const targetProtein =
    Math.round((targetCalories * (macroSplit.protein / 100)) / 4) || 0;
  const targetFat =
    Math.round((targetCalories * (macroSplit.fat / 100)) / 9) || 0;

  const consumed = useMemo(() => {
    let cal = 0,
      pro = 0,
      carb = 0,
      fat = 0;
    try {
      Object.values(meals).forEach((list) =>
        list.forEach((i) => {
          cal += i.calories;
          pro += i.protein;
          carb += i.carbs;
          fat += i.fat;
        }),
      );
    } catch (e) {}
    return {
      calories: Math.round(cal),
      protein: Math.round(pro),
      carbs: Math.round(carb),
      fat: Math.round(fat),
    };
  }, [meals]);

  const remainingCalories = Math.max(0, targetCalories - consumed.calories);
  const caloPercent = Math.min(
    100,
    Math.round((consumed.calories / targetCalories) * 100),
  );

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter((food) => {
      return (
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedCategory === "Tất cả" || food.category === selectedCategory)
      );
    });
  }, [foodDatabase, searchQuery, selectedCategory]);

  const changeDay = (offset) => {
    const n = new Date(currentDate);
    n.setDate(n.getDate() + offset);
    setCurrentDate(n);
  };
  const formatDateDisplay = (date) => {
    if (date.toDateString() === new Date().toDateString())
      return `Hôm nay, ${date.getDate()} thg ${date.getMonth() + 1}`;
    return `${date.getDate()} thg ${date.getMonth() + 1}`;
  };

  const calendarDays = useMemo(() => {
    const year = calendarViewDate.getFullYear();
    const month = calendarViewDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 0; i < (firstDayIndex + 6) % 7; i++) days.push({ day: null });
    for (let d = 1; d <= totalDays; d++) {
      const thisDate = new Date(year, month, d);
      days.push({
        day: d,
        date: thisDate,
        isSelected: thisDate.toDateString() === currentDate.toDateString(),
        isToday: thisDate.toDateString() === new Date().toDateString(),
      });
    }
    return days;
  }, [calendarViewDate, currentDate]);

  // ================= 4. HÀM XỬ LÝ =================
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
    setMeals((p) => ({
      ...p,
      [modalMealType]: [...(p[modalMealType] || []), newItem],
    }));
    setSelectedFoodForModal(null);
    setModalGrams(100);
    setActiveTab("journal");
  };

  const handleRemoveFood = (mealType, itemId) => {
    setMeals((prev) => ({
      ...prev,
      [mealType]: prev[mealType].filter((item) => item.id !== itemId),
    }));
  };

  const handleApplyAiMenu = async () => {
    setIsAiLoading(true);
    setAiSuccessAlert(false);
    setGeneratedAiMenu(null);
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const promptText = `Tạo thực đơn JSON. Mục tiêu: ${targetCalories} kcal. Bệnh lý: ${profile?.medical}. Yêu cầu: ${aiCustomNote}. Format JSON: {"breakfast":[{"name":"Món","weight":200,"calories":300,"protein":15,"carbs":35,"fat":5}],"lunch":[],"dinner":[],"snack":[]}`;

    try {
      if (!apiKey) throw new Error("Chưa cấu hình API KEY");
      const res = await fetch(
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
      if (!res.ok) throw new Error("Máy chủ bận");
      const data = await res.json();
      const parsed = JSON.parse(
        data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}",
      );
      const process = (arr) =>
        (arr || []).map((i) => ({ ...i, id: Date.now() + Math.random() }));
      setGeneratedAiMenu({
        breakfast: process(parsed?.breakfast),
        lunch: process(parsed?.lunch),
        dinner: process(parsed?.dinner),
        snack: process(parsed?.snack),
      });
    } catch (e) {
      alert("Lỗi tạo thực đơn. Hãy thử lại!");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSendReport = () => {
    if (!profile?.email)
      return alert("Vui lòng cập nhật Email trong hồ sơ để nhận báo cáo.");
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      const mealDetails = Object.entries(meals)
        .map(([key, items]) => {
          const mealName =
            key === "breakfast"
              ? "Bữa Sáng"
              : key === "lunch"
                ? "Bữa Trưa"
                : key === "dinner"
                  ? "Bữa Tối"
                  : "Bữa Phụ";
          if (!items || items.length === 0)
            return `- ${mealName}: (Chưa có dữ liệu ăn uống)`;
          const foodList = items
            .map((i) => `${i.name} (${i.weight}g)`)
            .join(", ");
          const calo = items.reduce((s, i) => s + i.calories, 0);
          return `- ${mealName} [Tổng: ${calo} kcal]: ${foodList}`;
        })
        .join("\n");

      let evaluation = "";
      if (consumed.calories > targetCalories + 200)
        evaluation = "⚠️ Cảnh báo: Lượng Calo nạp vào đang VƯỢT QUÁ mục tiêu.";
      else if (consumed.calories < targetCalories * 0.6)
        evaluation = "⚠️ Cảnh báo: Bạn đang ăn QUÁ ÍT so với mức BMR.";
      else
        evaluation =
          "✅ Tuyệt vời: Bạn đang duy trì lượng Calo và Dinh dưỡng ở mức lý tưởng!";

      const reportContent = `BÁO CÁO DINH DƯỠNG TRỌN GÓI - CLEANBITE\nNgày trích xuất: ${new Date().toLocaleDateString("vi-VN")}\n\n1. KHÁCH HÀNG\n- Họ và tên: ${profile.name}\n- Chỉ số: Cao ${profile.height}cm | Nặng ${profile.weight}kg | BMI: ${profile.bmi}\n- Bệnh lý: ${profile.medical || "Khỏe mạnh"}\n\n2. TỔNG QUAN\n- Calo: ${consumed.calories} / ${targetCalories} kcal\n- Đạm: ${consumed.protein}g | Carbs: ${consumed.carbs}g | Béo: ${consumed.fat}g\n\n3. CHI TIẾT THỰC ĐƠN\n${mealDetails}\n\n4. KẾT LUẬN TỪ HỆ THỐNG\n${evaluation}`;

      alert(
        `✅ Trích xuất báo cáo thành công!\n\nHệ thống sẽ tự động mở ứng dụng Email trên máy của bạn.`,
      );
      window.open(
        `mailto:${profile.email}?subject=${encodeURIComponent(`Báo Cáo Dinh Dưỡng CleanBite - ${profile.name}`)}&body=${encodeURIComponent(reportContent)}`,
        "_blank",
      );
    }, 2500);
  };

  const handleUpdateMacro = (carbs, protein, fat) => {
    const newProfile = { ...profile, macroSplit: { carbs, protein, fat } };
    setProfile(newProfile);
    localStorage.setItem("cleanbite_profile", JSON.stringify(newProfile));
    setShowMacroModal(false);
  };

  const handleUpdateWaterTarget = () => {
    const newProfile = { ...profile, waterTarget: tempWaterTarget };
    setProfile(newProfile);
    localStorage.setItem("cleanbite_profile", JSON.stringify(newProfile));
    setWaterGlasses(0);
    setShowWaterModal(false);
  };

  // ================= 5. GIAO DIỆN (RENDER) VỚI ĐẦY ĐỦ LIGHT/DARK MODE =================
  return (
    <div className={isDarkMode ? "dark" : ""}>
      <div
        className={`min-h-screen flex justify-center font-sans transition-colors duration-300 ${theme.bgMain} ${theme.text}`}
      >
        <div
          className={`w-full max-w-[430px] min-h-screen flex flex-col relative pb-28 shadow-2xl transition-colors duration-300 ${theme.bgApp} border-x ${theme.borderApp} overflow-hidden`}
        >
          {/* HEADER CHÍNH */}
          {activeTab !== "settings" && (
            <header
              className={`${theme.headerBg} px-5 pt-7 transition-all duration-300 shadow-md sticky top-0 z-30 ${activeTab === "journal" ? "pb-6 rounded-b-[2rem]" : "pb-4 rounded-b-[1.5rem]"}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 p-1 backdrop-blur-md flex items-center justify-center shadow-sm shrink-0">
                    <img
                      src="/logo.png"
                      alt="CleanBite Logo"
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <span className="text-white text-xl font-bold absolute -z-10">
                      C
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center font-black text-2xl tracking-tight leading-none select-none text-white drop-shadow-sm">
                      Clean<span className="text-white/90 ml-0.5">Bite</span>
                    </div>
                    <p className="text-[11px] font-medium tracking-wide text-white/80 lowercase mt-0.5">
                      small bites . brighter lives
                    </p>
                  </div>
                </div>

                {/* Nút Góc Phải */}
                {activeTab === "profile" ? (
                  <button
                    onClick={() => setActiveTab("settings")}
                    className="w-10 h-10 flex items-center justify-center bg-black/15 hover:bg-black/25 backdrop-blur-md rounded-full text-white shadow-sm transition-all active:scale-95"
                  >
                    <span className="text-xl leading-none">⚙️</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab("profile")}
                    className="max-w-[125px] truncate text-xs bg-black/15 hover:bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-full text-white font-semibold shadow-sm transition-all text-center active:scale-95"
                  >
                    {isPremium ? "👑 VIP" : `👋 ${profile?.name || "Bạn mới"}`}
                  </button>
                )}
              </div>

              {/* Lịch ở Tab Nhật Ký */}
              <div
                className={`overflow-hidden transition-all duration-300 ${activeTab === "journal" ? "max-h-20 opacity-100 mt-4" : "max-h-0 opacity-0"}`}
              >
                <div className="flex items-center justify-between bg-black/15 backdrop-blur-md rounded-2xl px-3 py-2 border border-white/10 animate-fade-in">
                  <button
                    onClick={() => changeDay(-1)}
                    className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white active:scale-90 text-sm font-bold"
                  >
                    ❮
                  </button>
                  <button
                    onClick={() => {
                      setCalendarViewDate(new Date(currentDate));
                      setShowCalendarModal(true);
                    }}
                    className="flex items-center gap-2 text-xs font-bold tracking-wide text-white hover:bg-white/10 transition-colors py-1 px-3 rounded-lg active:scale-95"
                  >
                    <span>📅</span>
                    <span>{formatDateDisplay(currentDate)}</span>
                    <span className="text-[10px]">▼</span>
                  </button>
                  <button
                    onClick={() => changeDay(1)}
                    className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white active:scale-90 text-sm font-bold"
                  >
                    ❯
                  </button>
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 px-4 pt-4 overflow-y-auto">
            {/* TAB 1: NHẬT KÝ */}
            {activeTab === "journal" && (
              <div className="space-y-4">
                <div
                  className={`border rounded-3xl p-5 transition-colors duration-300 ${theme.card}`}
                >
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
                          stroke={theme.circleTrack}
                          strokeWidth="8"
                          fill="transparent"
                          className="transition-colors duration-300"
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
                            (264 *
                              Math.min(consumed.calories, targetCalories)) /
                              targetCalories
                          }
                          strokeLinecap="round"
                          fill="transparent"
                          className="transition-all duration-700 ease-out"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center text-center">
                        <span
                          className={`text-4xl font-extrabold tracking-tight ${theme.text}`}
                        >
                          {remainingCalories}
                        </span>
                        <span
                          className={`text-xs font-medium mt-0.5 ${theme.textMuted}`}
                        >
                          kcal còn lại
                        </span>
                        <span className="text-[11px] font-bold text-[#10b981] mt-1 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                          {caloPercent}% mục tiêu
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 w-full mt-4">
                      <div
                        className={`border rounded-2xl p-3 flex items-center gap-3 transition-colors duration-300 ${theme.cardInner}`}
                      >
                        <span className="text-xl">🔥</span>
                        <div>
                          <div
                            className={`text-xs font-medium ${theme.textMuted}`}
                          >
                            Đã nạp
                          </div>
                          <div className={`text-base font-bold ${theme.text}`}>
                            {consumed.calories}{" "}
                            <span
                              className={`text-[10px] font-normal ${theme.textMuted}`}
                            >
                              kcal
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={`border rounded-2xl p-3 flex items-center gap-3 transition-colors duration-300 ${theme.cardInner}`}
                      >
                        <span className="text-xl">🎯</span>
                        <div>
                          <div
                            className={`text-xs font-medium ${theme.textMuted}`}
                          >
                            Mục tiêu
                          </div>
                          <div className={`text-base font-bold ${theme.text}`}>
                            {targetCalories}{" "}
                            <span
                              className={`text-[10px] font-normal ${theme.textMuted}`}
                            >
                              kcal
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`w-full mt-4 space-y-2.5 p-3.5 rounded-2xl border transition-colors duration-300 ${theme.cardInner}`}
                    >
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className={theme.text}>Carbs</span>
                          <span className={theme.textMuted}>
                            {consumed.carbs}/{targetCarbs}g
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full overflow-hidden ${theme.circleTrack}`}
                        >
                          <div
                            className="h-full bg-amber-400 rounded-full"
                            style={{
                              width: `${Math.min(100, (consumed.carbs / targetCarbs) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className={theme.text}>Chất đạm</span>
                          <span className={theme.textMuted}>
                            {consumed.protein}/{targetProtein}g
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full overflow-hidden ${theme.circleTrack}`}
                        >
                          <div
                            className="h-full bg-[#10b981] rounded-full"
                            style={{
                              width: `${Math.min(100, (consumed.protein / targetProtein) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-1.5">
                          <span className={theme.text}>Chất béo</span>
                          <span className={theme.textMuted}>
                            {consumed.fat}/{targetFat}g
                          </span>
                        </div>
                        <div
                          className={`w-full h-2 rounded-full overflow-hidden ${theme.circleTrack}`}
                        >
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
                <div
                  className={`border rounded-3xl p-4 transition-colors duration-300 ${theme.card}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 text-lg">💧</span>
                      <div>
                        <h3 className={`text-sm font-bold ${theme.text}`}>
                          Uống nước
                        </h3>
                        <p className={`text-xs ${theme.textMuted}`}>
                          {waterGlasses * 250}/{targetWater} ml • 250 ml mỗi ly
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setWaterGlasses(0)}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${theme.iconBg} ${theme.textMuted} hover:opacity-80`}
                    >
                      ↺ Đặt lại
                    </button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          setWaterGlasses(num === waterGlasses ? num - 1 : num)
                        }
                        className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all shrink-0 ${num <= waterGlasses ? "bg-[#10b981] text-white shadow-md shadow-[#10b981]/30" : `${theme.iconBg} ${theme.textMuted}`}`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Các Bữa ăn */}
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
                  const items = meals[mealSection.key] || [];
                  const mealTotalCalo = items.reduce(
                    (s, i) => s + i.calories,
                    0,
                  );
                  return (
                    <div
                      key={mealSection.key}
                      className={`border rounded-3xl p-4 transition-colors duration-300 ${theme.card}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div
                            className={`flex items-center gap-1.5 font-bold text-sm ${theme.text}`}
                          >
                            <span>{mealSection.icon}</span>
                            <span>{mealSection.title}</span>
                          </div>
                          <span
                            className={`text-[11px] font-medium ${theme.textMuted}`}
                          >
                            {mealSection.time}
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-[#10b981] bg-[#10b981]/10 px-2.5 py-1 rounded-full">
                          {mealTotalCalo} kcal
                        </span>
                      </div>
                      <div className="space-y-2">
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between p-2.5 rounded-2xl border transition-colors duration-300 ${theme.cardInner}`}
                          >
                            <div className="flex-1 pr-2">
                              <h4 className={`text-xs font-bold ${theme.text}`}>
                                {item.name}
                              </h4>
                              <p
                                className={`text-[10px] mt-0.5 ${theme.textMuted}`}
                              >
                                {item.weight}g • {item.protein}g đạm •{" "}
                                {item.carbs}g carbs
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-[#10b981]">
                                +{item.calories}
                              </span>
                              <button
                                onClick={() =>
                                  handleRemoveFood(mealSection.key, item.id)
                                }
                                className={`w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold ${theme.textMuted} hover:text-red-500 transition-colors`}
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
                        className={`w-full mt-3 py-2.5 border border-dashed border-[#10b981]/50 hover:bg-[#10b981]/10 text-[#10b981] text-xs font-bold rounded-2xl flex items-center justify-center gap-1.5 transition-colors`}
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
                <div
                  className={`border rounded-3xl p-4 transition-colors duration-300 ${theme.card}`}
                >
                  <h2 className={`text-lg font-bold ${theme.text}`}>
                    Danh mục thực phẩm
                  </h2>
                  <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
                    Kho 156 món ăn & gia vị chuẩn thành phần dinh dưỡng
                  </p>
                  <div className="mt-4 relative">
                    <input
                      type="text"
                      placeholder="Tìm phở, ức gà, bánh mì..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-[#10b981] transition-colors duration-300 ${theme.input}`}
                    />
                    <span
                      className={`absolute left-4 top-3 text-sm ${theme.textMuted}`}
                    >
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
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${selectedCategory === cat ? "bg-[#10b981] text-white border-[#10b981] shadow-md shadow-[#10b981]/30" : `${theme.iconBg} ${theme.textMuted}${theme.borderApp}`}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setShowCustomFoodModal(true)}
                    className="w-full mt-4 py-2.5 bg-[#10b981]/10 hover:bg-[#10b981]/20 border border-[#10b981]/30 border-dashed text-[#10b981] font-bold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>+</span> Không tìm thấy món? Tự nhập thủ công
                  </button>
                </div>

                <div className="space-y-3">
                  {filteredFoods.map((food) => {
                    const kw = encodeURIComponent(food.name);
                    let aff =
                      food.category === "Món ăn"
                        ? {
                            url: `https://shopeefood.vn/ho-chi-minh/danh-sach-dia-diem-giao-tan-noi?q=${kw}`,
                            label: "Giao ngay",
                            color:
                              "bg-orange-500 text-white shadow-md shadow-orange-500/20",
                          }
                        : {
                            url: `https://shopee.vn/search?keyword=${kw}`,
                            icon: "🛒",
                            label: "Mua ngay",
                            color:
                              "bg-[#10b981] text-white shadow-md shadow-[#10b981]/20",
                          };

                    return (
                      <div
                        key={food.id}
                        onClick={() => {
                          setSelectedFoodForModal(food);
                          setModalGrams(100);
                        }}
                        className={`border rounded-3xl p-3.5 flex items-center justify-between cursor-pointer transition-all duration-300 hover:border-[#10b981]/50 ${theme.card}`}
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className={`w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center border shrink-0 ${theme.iconBg} ${theme.divider}`}
                          >
                            <img
                              src={food.image}
                              alt={food.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
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
                            <h4
                              className={`text-[13px] font-bold ${theme.text}`}
                            >
                              {food.name}
                            </h4>
                            <p
                              className={`text-[10px] mt-1 font-medium ${theme.textMuted}`}
                            >
                              {food.protein}g đạm • {food.carbs}g carbs
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <div className="text-[15px] font-extrabold text-[#10b981]">
                              {food.calories}
                            </div>
                            <div className={`text-[9px] ${theme.textMuted}`}>
                              kcal/100g
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(aff.url, "_blank");
                            }}
                            className={`flex items-center gap-1 text-[10px] px-3 py-1.5 rounded-lg transition-transform active:scale-95 ${aff.color}`}
                          >
                            {aff.icon && (
                              <span className="text-[10px]">{aff.icon}</span>
                            )}
                            <span className="font-bold tracking-wide">
                              {aff.label}
                            </span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 3: THỰC ĐƠN AI */}
            {activeTab === "ai" && (
              <div className="space-y-4">
                <div
                  className={`border rounded-3xl p-5 relative transition-colors duration-300 ${isDarkMode ? "bg-[#1c1c1e] border-[#10b981]/20" : "bg-emerald-50 border-[#10b981]/30"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">✨</span>
                    <div>
                      <h2 className="text-base font-bold text-[#10b981]">
                        AI Lên Thực Đơn
                      </h2>
                      <p
                        className={`text-[11px] font-medium mt-0.5 ${isDarkMode ? "text-neutral-400" : "text-emerald-700"}`}
                      >
                        Chế độ:{" "}
                        <span className="font-bold">
                          {profile?.medical === "Không có"
                            ? "Cá nhân hóa tự do"
                            : profile?.medical || "Bình thường"}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-5 border rounded-2xl p-3 transition-colors duration-300 ${theme.cardInner}`}
                  >
                    <label
                      className={`block text-[11px] font-bold mb-1.5 uppercase tracking-wide ${theme.textMuted}`}
                    >
                      Bạn muốn ăn gì hôm nay?
                    </label>
                    <textarea
                      rows="2"
                      placeholder="VD: Tôi muốn ăn thịt bò, có rau xanh..."
                      value={aiCustomNote}
                      onChange={(e) => setAiCustomNote(e.target.value)}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10b981] resize-none transition-colors duration-300 ${theme.input}`}
                    />
                  </div>

                  <button
                    onClick={handleApplyAiMenu}
                    disabled={isAiLoading}
                    className={`w-full mt-4 active:scale-[0.98] disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl text-[13px] flex items-center justify-center gap-2 shadow-md shadow-[#10b981]/20 transition-all bg-[#10b981] hover:bg-emerald-600`}
                  >
                    {isAiLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang tạo thực đơn...</span>
                      </>
                    ) : (
                      <>
                        <span>✨</span>
                        <span>Tạo thực đơn ngay</span>
                      </>
                    )}
                  </button>
                </div>

                {generatedAiMenu && (
                  <div
                    className={`border rounded-3xl p-5 shadow-sm animate-fade-in transition-colors duration-300 ${theme.card}`}
                  >
                    <h3
                      className={`text-sm font-bold mb-4 flex items-center gap-2 ${theme.text}`}
                    >
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
                            className={`border rounded-2xl p-3.5 transition-colors duration-300 ${theme.cardInner}`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-[11px] font-bold text-[#10b981] uppercase tracking-wider">
                                {meal.label}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${theme.iconBg} ${theme.text}`}
                              >
                                {totalCal} kcal
                              </span>
                            </div>
                            <div className="space-y-1.5">
                              {items.map((item, idx) => (
                                <div
                                  key={idx}
                                  className={`text-xs font-medium ${theme.text}`}
                                >
                                  • <span>{item.name}</span>{" "}
                                  <span className={theme.textMuted}>
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
                      className="w-full bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-[#10b981]/25 transition-all"
                    >
                      ✓ Áp dụng thực đơn này
                    </button>
                  </div>
                )}
                {aiSuccessAlert && (
                  <div className="mt-3 bg-[#10b981]/10 border border-[#10b981]/30 text-[#10b981] text-xs text-center py-2.5 rounded-xl font-bold">
                    ✓ Đã nạp thực đơn thành công!
                  </div>
                )}

                <div
                  onClick={() => setShowExpertModal(true)}
                  className={`border rounded-3xl p-4 cursor-pointer transition-all duration-300 group hover:border-[#10b981] ${theme.card}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl border border-[#10b981]/20 bg-[#10b981]/10`}
                      >
                        🩺
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4
                            className={`text-[13px] font-bold transition-colors group-hover:text-[#10b981] ${theme.text}`}
                          >
                            Bác sĩ Dinh dưỡng 1-1
                          </h4>
                        </div>
                        <p
                          className={`text-[10px] mt-1 font-medium ${theme.textMuted}`}
                        >
                          Tư vấn lộ trình chuyên sâu
                        </p>
                      </div>
                    </div>
                    <span
                      className={`${theme.textMuted} group-hover:text-[#10b981] transition-colors`}
                    >
                      ❯
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CÁ NHÂN */}
            {activeTab === "profile" && (
              <div className="space-y-4">
                <div
                  onClick={() => setShowPremiumModal(true)}
                  className={`rounded-[1.75rem] p-5 cursor-pointer shadow-md relative overflow-hidden transition-all active:scale-[0.99] border ${isPremium ? "bg-gradient-to-r from-amber-500 via-[#10b981] to-teal-500 border-amber-400/40" : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 border-white/10 hover:opacity-95"}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 pr-2">
                      <h3 className="text-lg font-bold text-white tracking-tight">
                        {isPremium ? "Đã kích hoạt VIP 👑" : "Gói Premium"}
                      </h3>
                      <p className="text-xs text-white/90 mt-1.5 leading-relaxed font-normal">
                        {isPremium
                          ? "Trải nghiệm đầy đủ tính năng cao cấp."
                          : "Mở khóa mọi giới hạn dinh dưỡng."}
                      </p>
                    </div>
                    <div className="shrink-0 text-white flex items-center justify-center">
                      <svg
                        className="w-12 h-12 text-white drop-shadow-sm"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M2 19h20v2H2v-2zm0-14l5 4.5L12 3l5 6.5L22 5v12H2V5z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {isPremium && profile?.email && (
                  <button
                    onClick={handleSendReport}
                    disabled={isSendingEmail}
                    className="w-full mt-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 disabled:opacity-70 text-white font-bold py-3.5 rounded-2xl text-[13px] flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 transition-all active:scale-[0.98]"
                  >
                    {isSendingEmail ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Đang tạo PDF...
                      </>
                    ) : (
                      <>
                        <span className="text-base">📧</span> Xuất Báo Cáo Y
                        Khoa (PDF)
                      </>
                    )}
                  </button>
                )}

                <div
                  className={`border rounded-3xl p-5 shadow-sm transition-colors duration-300 ${theme.card}`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold ${theme.text}`}>
                      Chỉ số khối cơ thể (BMI)
                    </h3>
                    <button
                      onClick={() => setShowOnboarding(true)}
                      className="text-xs text-[#10b981] hover:underline font-bold"
                    >
                      Chỉnh sửa
                    </button>
                  </div>
                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-4xl font-extrabold text-[#10b981]">
                      {profile?.bmi || "18.6"}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${theme.iconBg} ${theme.textMuted}`}
                    >
                      {parseFloat(profile?.bmi || "18.6") < 18.5
                        ? "Hơi gầy"
                        : parseFloat(profile?.bmi || "18.6") <= 22.9
                          ? "Cân nặng tốt"
                          : "Tiền béo phì"}
                    </span>
                  </div>
                  <div
                    className={`grid grid-cols-2 gap-3 mt-5 pt-5 border-t text-center ${theme.divider}`}
                  >
                    <div
                      className={`border rounded-2xl p-3 transition-colors duration-300 ${theme.cardInner}`}
                    >
                      <div className={`text-lg font-bold ${theme.text}`}>
                        {profile?.height || 152}{" "}
                        <span
                          className={`text-[10px] font-normal ${theme.textMuted}`}
                        >
                          cm
                        </span>
                      </div>
                      <div
                        className={`text-[11px] font-medium mt-0.5 ${theme.textMuted}`}
                      >
                        Chiều cao
                      </div>
                    </div>
                    <div
                      className={`border rounded-2xl p-3 transition-colors duration-300 ${theme.cardInner}`}
                    >
                      <div className={`text-lg font-bold ${theme.text}`}>
                        {profile?.weight || 43}{" "}
                        <span
                          className={`text-[10px] font-normal ${theme.textMuted}`}
                        >
                          kg
                        </span>
                      </div>
                      <div
                        className={`text-[11px] font-medium mt-0.5 ${theme.textMuted}`}
                      >
                        Cân nặng
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`border rounded-3xl p-5 shadow-sm space-y-3.5 transition-colors duration-300 ${theme.card}`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${theme.textMuted}`}>
                      Tên của bạn
                    </span>
                    <span className={`font-bold ${theme.text}`}>
                      {profile?.name || "Chưa cập nhật"}
                    </span>
                  </div>
                  {profile?.email && (
                    <div className="flex justify-between items-center text-xs">
                      <span className={`font-medium ${theme.textMuted}`}>
                        Email báo cáo
                      </span>
                      <span className="font-bold text-[#10b981] truncate max-w-[200px]">
                        {profile.email}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${theme.textMuted}`}>
                      Độ tuổi & Giới tính
                    </span>
                    <span className={`font-bold ${theme.text}`}>
                      {profile?.age || 20} •{" "}
                      {profile?.gender === "male" ? "Nam" : "Nữ"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${theme.textMuted}`}>
                      Năng lượng (BMR)
                    </span>
                    <span className="font-bold text-[#10b981]">
                      {profile?.bmr || 1035} kcal
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`font-medium ${theme.textMuted}`}>
                      Bệnh lý
                    </span>
                    <span className="font-bold text-amber-500">
                      {profile?.medical || "Không có"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: CÀI ĐẶT (SETTINGS) THIẾT KẾ BO GÓC CHUẨN KÈM TƯƠNG TÁC THẬT */}
            {activeTab === "settings" && (
              <div className="space-y-6 pb-8 pt-2 animate-fade-in font-sans">
                <div className="flex items-center gap-4 mb-6 px-1">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors border shadow-sm ${theme.cardInner} hover:opacity-80`}
                  >
                    <span className={`text-xl font-bold pr-0.5 ${theme.text}`}>
                      ❮
                    </span>
                  </button>
                  <h2
                    className={`text-2xl font-bold tracking-wide ${theme.text}`}
                  >
                    Cài đặt
                  </h2>
                </div>

                <div className="space-y-2">
                  <h3
                    className={`text-[11px] font-bold px-2 mb-3 uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Cơ bản
                  </h3>
                  <div
                    className={`rounded-[1.5rem] overflow-hidden divide-y border shadow-sm transition-colors duration-300 ${theme.card} ${theme.divider}`}
                  >
                    <button
                      onClick={() => setShowLanguageModal(true)}
                      className={`w-full flex items-center justify-between p-4 sm:p-5 text-[13px] font-bold transition-colors ${isDarkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-slate-50"}`}
                    >
                      <span className={theme.text}>Cài đặt ngôn ngữ</span>
                      <span className={`font-serif text-lg ${theme.textMuted}`}>
                        文A
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setShowOnboarding(true);
                        setActiveTab("profile");
                      }}
                      className={`w-full flex items-center justify-between p-4 sm:p-5 text-[13px] font-bold transition-colors ${isDarkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-slate-50"}`}
                    >
                      <span className={theme.text}>Cập nhật chỉ số (BMR)</span>
                      <span className="text-[#6d28d9] text-lg">👤</span>
                    </button>
                    <button
                      onClick={() => setShowMacroModal(true)}
                      className={`w-full flex items-center justify-between p-4 sm:p-5 text-[13px] font-bold transition-colors ${isDarkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-slate-50"}`}
                    >
                      <span className={theme.text}>
                        Cập nhật macro dinh dưỡng
                      </span>
                      <span className="text-lg">📊</span>
                    </button>
                    <button
                      onClick={() => setShowWaterModal(true)}
                      className={`w-full flex items-center justify-between p-4 sm:p-5 text-[13px] font-bold transition-colors ${isDarkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-slate-50"}`}
                    >
                      <span className={theme.text}>
                        Mục tiêu uống nước hằng ngày
                      </span>
                      <span className="text-blue-400 text-lg drop-shadow-sm">
                        💧
                      </span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <h3
                    className={`text-[11px] font-bold px-2 mb-3 uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Trợ giúp
                  </h3>
                  <div
                    className={`rounded-[1.5rem] overflow-hidden divide-y border shadow-sm transition-colors duration-300 ${theme.card} ${theme.divider}`}
                  >
                    <button
                      onClick={() => setShowFeedbackModal(true)}
                      className={`w-full flex items-center justify-between p-4 sm:p-5 text-[13px] font-bold transition-colors ${isDarkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-slate-50"}`}
                    >
                      <span className={theme.text}>Gửi phản hồi</span>
                      <span className="text-pink-300 text-lg drop-shadow-sm">
                        💬
                      </span>
                    </button>
                    <button
                      onClick={() => setShowAboutModal(true)}
                      className={`w-full flex items-center justify-between p-4 sm:p-5 text-[13px] font-bold transition-colors ${isDarkMode ? "hover:bg-[#2c2c2e]" : "hover:bg-slate-50"}`}
                    >
                      <span className={theme.text}>Về chúng tôi</span>
                      <span className="text-blue-500 text-lg">ℹ️</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-2 mt-6">
                  <h3
                    className={`text-[11px] font-bold px-2 mb-3 uppercase tracking-wider ${theme.textMuted}`}
                  >
                    Tài khoản
                  </h3>
                  <div
                    className={`rounded-[1.5rem] overflow-hidden divide-y border shadow-sm transition-colors duration-300 ${theme.card} ${theme.divider}`}
                  >
                    {/* CÔNG TẮC ĐỔI MÀU SÁNG/TỐI */}
                    <div className="w-full flex items-center justify-between p-4 sm:p-5 text-[13px] font-bold">
                      <span className={theme.text}>
                        Giao diện tối (Dark mode)
                      </span>
                      <div
                        onClick={toggleTheme}
                        className={`w-12 h-7 rounded-full flex items-center px-1 cursor-pointer transition-colors duration-300 ${isDarkMode ? "bg-[#10b981] justify-end" : "bg-slate-300 justify-start"}`}
                      >
                        <div className="w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform"></div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            "Bạn có chắc chắn muốn đăng xuất và xóa toàn bộ dữ liệu?",
                          )
                        ) {
                          localStorage.clear();
                          window.location.reload();
                        }
                      }}
                      className={`w-full p-4 sm:p-5 text-left text-[13px] text-red-500 font-bold flex justify-between items-center transition-colors ${isDarkMode ? "hover:bg-red-950/20" : "hover:bg-red-50"}`}
                    >
                      <span>Đăng xuất & Xóa dữ liệu</span>
                      <span className="text-xl">⏻</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>

          {/* ================= CÁC MODAL CỦA PHẦN CÀI ĐẶT ================= */}
          {showLanguageModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-xs border rounded-[2rem] p-6 shadow-2xl ${theme.card}`}
              >
                <h3 className={`text-lg font-bold mb-4 ${theme.text}`}>
                  Ngôn ngữ ứng dụng
                </h3>
                <div className="space-y-3">
                  <div
                    className={`flex items-center justify-between p-4 border rounded-2xl border-[#10b981] bg-[#10b981]/10`}
                  >
                    <span className="font-bold text-[#10b981]">Tiếng Việt</span>
                    <span className="text-[#10b981] font-bold">✓</span>
                  </div>
                  <div
                    className={`flex items-center justify-between p-4 border rounded-2xl opacity-60 ${theme.cardInner}`}
                  >
                    <span className={`font-medium ${theme.textMuted}`}>
                      English (Coming soon)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowLanguageModal(false)}
                  className="w-full mt-6 py-3.5 bg-[#10b981] hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-transform"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {showMacroModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-sm border rounded-[2rem] p-6 shadow-2xl ${theme.card}`}
              >
                <h3 className={`text-lg font-bold mb-1 ${theme.text}`}>
                  Thiết lập Macro
                </h3>
                <p className={`text-xs mb-5 font-medium ${theme.textMuted}`}>
                  Chọn tỷ lệ Dinh dưỡng phù hợp với mục tiêu của bạn.
                </p>
                <div className="space-y-3 mb-6">
                  <button
                    onClick={() => handleUpdateMacro(50, 25, 25)}
                    className={`w-full p-4 border rounded-2xl text-left transition-colors ${macroSplit.carbs === 50 ? "border-[#10b981] bg-[#10b981]/10" : theme.cardInner}`}
                  >
                    <h4
                      className={`text-sm font-bold ${macroSplit.carbs === 50 ? "text-[#10b981]" : theme.text}`}
                    >
                      Tiêu chuẩn (Khuyên dùng)
                    </h4>
                    <p className={`text-[11px] mt-1 ${theme.textMuted}`}>
                      50% Carbs • 25% Đạm • 25% Béo
                    </p>
                  </button>
                  <button
                    onClick={() => handleUpdateMacro(40, 35, 25)}
                    className={`w-full p-4 border rounded-2xl text-left transition-colors ${macroSplit.carbs === 40 ? "border-[#10b981] bg-[#10b981]/10" : theme.cardInner}`}
                  >
                    <h4
                      className={`text-sm font-bold ${macroSplit.carbs === 40 ? "text-[#10b981]" : theme.text}`}
                    >
                      Tăng cơ giảm mỡ
                    </h4>
                    <p className={`text-[11px] mt-1 ${theme.textMuted}`}>
                      40% Carbs • 35% Đạm • 25% Béo
                    </p>
                  </button>
                  <button
                    onClick={() => handleUpdateMacro(20, 40, 40)}
                    className={`w-full p-4 border rounded-2xl text-left transition-colors ${macroSplit.carbs === 20 ? "border-[#10b981] bg-[#10b981]/10" : theme.cardInner}`}
                  >
                    <h4
                      className={`text-sm font-bold ${macroSplit.carbs === 20 ? "text-[#10b981]" : theme.text}`}
                    >
                      Low-Carb (Giảm tinh bột)
                    </h4>
                    <p className={`text-[11px] mt-1 ${theme.textMuted}`}>
                      20% Carbs • 40% Đạm • 40% Béo
                    </p>
                  </button>
                </div>
                <button
                  onClick={() => setShowMacroModal(false)}
                  className={`w-full py-3.5 font-bold rounded-xl transition-colors ${theme.iconBg} ${theme.text}`}
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          {showWaterModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-sm border rounded-[2rem] p-6 shadow-2xl text-center ${theme.card}`}
              >
                <div className="text-4xl mb-3 drop-shadow-md">💧</div>
                <h3 className={`text-lg font-bold mb-1 ${theme.text}`}>
                  Mục tiêu Nước (ml)
                </h3>
                <p className={`text-xs mb-6 font-medium ${theme.textMuted}`}>
                  Chuyên gia khuyên dùng 2000ml - 3000ml mỗi ngày.
                </p>
                <div className="mb-6">
                  <div className="text-3xl font-black text-blue-500 mb-4">
                    {tempWaterTarget} ml
                  </div>
                  <input
                    type="range"
                    min="1000"
                    max="4000"
                    step="250"
                    value={tempWaterTarget}
                    onChange={(e) => setTempWaterTarget(Number(e.target.value))}
                    className={`w-full accent-blue-500 h-2 rounded-lg outline-none ${theme.iconBg}`}
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowWaterModal(false)}
                    className={`flex-1 py-3 font-bold rounded-xl transition-colors ${theme.iconBg} ${theme.text}`}
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleUpdateWaterTarget}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-transform"
                  >
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}

          {showFeedbackModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-sm border rounded-[2rem] p-6 shadow-2xl ${theme.card}`}
              >
                <h3 className={`text-lg font-bold mb-2 ${theme.text}`}>
                  Gửi phản hồi
                </h3>
                <p className={`text-xs mb-4 font-medium ${theme.textMuted}`}>
                  Chúng mình luôn lắng nghe ý kiến của bạn để cải thiện
                  CleanBite.
                </p>
                <textarea
                  rows="4"
                  placeholder="Nhập ý kiến của bạn tại đây..."
                  className={`w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#10b981] resize-none mb-4 ${theme.input}`}
                ></textarea>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowFeedbackModal(false)}
                    className={`flex-1 py-3.5 font-bold rounded-xl transition-colors ${theme.iconBg} ${theme.text}`}
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      alert("Cảm ơn bạn! Phản hồi đã được ghi nhận.");
                      setShowFeedbackModal(false);
                    }}
                    className="flex-1 py-3.5 bg-[#10b981] hover:bg-emerald-600 text-white font-bold rounded-xl active:scale-95 transition-transform shadow-md shadow-[#10b981]/20"
                  >
                    Gửi ngay
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAboutModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-xs border rounded-[2rem] p-6 shadow-2xl text-center ${theme.card}`}
              >
                <div className="w-16 h-16 bg-[#10b981] rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-[#10b981]/30">
                  <span className="text-white text-3xl font-black">C</span>
                </div>
                <h3 className={`text-lg font-bold ${theme.text}`}>CleanBite</h3>
                <p className="text-xs font-medium mb-4 text-[#10b981]">
                  Phiên bản 2.8.0
                </p>
                <p
                  className={`text-xs leading-relaxed mb-6 ${theme.textMuted}`}
                >
                  Ứng dụng hỗ trợ theo dõi dinh dưỡng và lên thực đơn AI cá nhân
                  hóa.
                  <br />
                  <br />
                  Phát triển bởi: Sinh viên Châu & Nhóm Đồ án chuyên ngành 2024.
                </p>
                <button
                  onClick={() => setShowAboutModal(false)}
                  className={`w-full py-3.5 font-bold rounded-xl transition-colors ${theme.iconBg} ${theme.text}`}
                >
                  Tuyệt vời
                </button>
              </div>
            </div>
          )}

          {/* ================= MODAL CHUNG GIỮ NGUYÊN THEME ================= */}
          {showCalendarModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-xs border rounded-3xl p-5 shadow-2xl space-y-4 ${theme.card}`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => {
                      const prevM = new Date(calendarViewDate);
                      prevM.setMonth(prevM.getMonth() - 1);
                      setCalendarViewDate(prevM);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${theme.iconBg} ${theme.textMuted}`}
                  >
                    ❮
                  </button>
                  <span className={`text-sm font-bold ${theme.text}`}>
                    Tháng {calendarViewDate.getMonth() + 1},{" "}
                    {calendarViewDate.getFullYear()}
                  </span>
                  <button
                    onClick={() => {
                      const nextM = new Date(calendarViewDate);
                      nextM.setMonth(nextM.getMonth() + 1);
                      setCalendarViewDate(nextM);
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${theme.iconBg} ${theme.textMuted}`}
                  >
                    ❯
                  </button>
                </div>
                <div
                  className={`grid grid-cols-7 gap-1 text-center text-[11px] font-bold ${theme.textMuted}`}
                >
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
                    if (!item.day) return <div key={idx} className="h-8" />;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentDate(item.date);
                          setShowCalendarModal(false);
                        }}
                        className={`h-8 rounded-xl flex items-center justify-center font-semibold transition-all ${item.isSelected ? "bg-[#10b981] text-white font-bold shadow-md shadow-[#10b981]/40 scale-105" : item.isToday ? "border border-[#10b981] text-[#10b981] bg-[#10b981]/10" : `hover:opacity-70 ${theme.text}`}`}
                      >
                        {item.day}
                      </button>
                    );
                  })}
                </div>
                <div className={`flex gap-2 pt-2 border-t ${theme.divider}`}>
                  <button
                    onClick={() => {
                      setCurrentDate(new Date());
                      setShowCalendarModal(false);
                    }}
                    className={`flex-1 py-2 font-semibold rounded-xl text-xs transition-colors ${theme.iconBg} ${theme.text}`}
                  >
                    Hôm nay
                  </button>
                  <button
                    onClick={() => setShowCalendarModal(false)}
                    className="flex-1 py-2 bg-[#10b981] font-semibold rounded-xl text-white text-xs transition-colors shadow-md shadow-[#10b981]/20"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          )}

          {selectedFoodForModal && (
            <div
              className={`fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm animate-fade-in ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-[430px] border-t rounded-t-[2rem] p-6 shadow-2xl space-y-4 ${theme.card}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center border shrink-0 ${theme.iconBg} ${theme.divider}`}
                    >
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
                      <h3 className={`text-base font-bold ${theme.text}`}>
                        {selectedFoodForModal.name}
                      </h3>
                      <p className={`text-xs ${theme.textMuted}`}>
                        Gốc: {selectedFoodForModal.calories} kcal / 100g
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedFoodForModal(null)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${theme.iconBg} ${theme.textMuted}`}
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <label
                    className={`block text-xs font-medium mb-2 ${theme.textMuted}`}
                  >
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
                        className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${modalMealType === b.key ? "bg-[#10b981] text-white border-[#10b981] shadow-md shadow-[#10b981]/30" : `${theme.iconBg} ${theme.divider}${theme.textMuted}`}`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-xs font-medium ${theme.textMuted}`}>
                      Khối lượng thực tế:
                    </span>
                    <span
                      className={`text-sm font-bold px-3 py-1 rounded-lg border ${theme.iconBg} ${theme.divider} ${theme.text}`}
                    >
                      {modalGrams}{" "}
                      <span
                        className={`text-xs font-normal ${theme.textMuted}`}
                      >
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
                    className={`w-full accent-[#10b981] cursor-pointer h-2 rounded-lg ${theme.iconBg}`}
                  />
                </div>
                <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-3 rounded-2xl flex items-center justify-between">
                  <span className="text-xs text-[#10b981] font-medium">
                    Năng lượng nạp vào:
                  </span>
                  <span className="text-lg font-extrabold text-[#10b981]">
                    +
                    {Math.round(
                      (selectedFoodForModal.calories * modalGrams) / 100,
                    )}{" "}
                    kcal
                  </span>
                </div>
                <button
                  onClick={handleConfirmAddFood}
                  className="w-full py-3.5 bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl text-xs shadow-lg shadow-[#10b981]/25 transition-all"
                >
                  Xác nhận thêm vào Bữa ăn
                </button>
              </div>
            </div>
          )}

          {showCustomFoodModal && (
            <div
              className={`fixed inset-0 z-50 flex items-end justify-center backdrop-blur-sm animate-fade-in ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-[430px] border-t rounded-t-[2rem] p-6 shadow-2xl space-y-4 ${theme.card}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className={`text-lg font-bold ${theme.text}`}>
                    Tự nhập món ăn mới
                  </h3>
                  <button
                    onClick={() => setShowCustomFoodModal(false)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${theme.iconBg} ${theme.textMuted}`}
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label
                      className={`block text-xs font-medium mb-1 ${theme.textMuted}`}
                    >
                      Tên món ăn
                    </label>
                    <input
                      type="text"
                      placeholder="VD: Bánh tráng trộn..."
                      value={customFoodForm.name}
                      onChange={(e) =>
                        setCustomFoodForm({
                          ...customFoodForm,
                          name: e.target.value,
                        })
                      }
                      className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${theme.textMuted}`}
                      >
                        Khối lượng (g)
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
                        className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-medium mb-1 ${theme.textMuted}`}
                      >
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
                        className={`w-full border rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-medium mb-2 ${theme.textMuted}`}
                    >
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
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${customFoodForm.mealType === b.key ? "bg-[#10b981] text-white border-[#10b981]" : `${theme.iconBg} ${theme.divider}${theme.textMuted}`}`}
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
                        ...(prev[customFoodForm.mealType] || []),
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
                  className="w-full mt-4 bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-[#10b981]/25 transition-all"
                >
                  Thêm ngay
                </button>
              </div>
            </div>
          )}

          {showExpertModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-sm border rounded-3xl p-6 shadow-2xl space-y-4 ${theme.card}`}
              >
                <div className="text-center">
                  <span className="text-3xl">🩺</span>
                  <h3 className={`text-base font-extrabold mt-1 ${theme.text}`}>
                    Kết nối Bác sĩ Dinh dưỡng
                  </h3>
                  <p className={`text-xs ${theme.textMuted}`}>
                    Hỗ trợ người bệnh: {profile?.medical || "Đau dạ dày"}
                  </p>
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs space-y-1.5 border transition-colors ${theme.cardInner}`}
                >
                  <div className="font-bold text-[#10b981]">
                    BS.CKI Nguyễn Minh Tuấn
                  </div>
                  <div className={`text-[11px] font-medium ${theme.textMuted}`}>
                    Viện Nghiên cứu Dinh dưỡng TP.HCM
                  </div>
                  <div className={`text-[10px] ${theme.textMuted}`}>
                    10 năm kinh nghiệm điều trị dinh dưỡng bệnh lý tiêu hóa
                  </div>
                </div>
                <div className="text-[11px] font-medium space-y-1 bg-[#10b981]/10 p-3 rounded-xl border border-[#10b981]/20 text-[#10b981]">
                  <div>• Hình thức: Gọi Video trực tuyến 45 phút</div>
                  <div>• Kèm thực đơn cá nhân hóa 14 ngày</div>
                  <div>• Chi phí: 250.000 đ / buổi</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowExpertModal(false)}
                    className={`flex-1 py-2.5 font-bold rounded-xl transition-colors text-xs ${theme.iconBg} ${theme.text}`}
                  >
                    Đóng
                  </button>
                  <button
                    onClick={() => {
                      alert("Mô phỏng Đặt lịch thành công!");
                      setShowExpertModal(false);
                    }}
                    className="flex-1 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white font-bold rounded-xl text-xs shadow-md shadow-[#10b981]/20"
                  >
                    Đặt lịch hẹn
                  </button>
                </div>
              </div>
            </div>
          )}

          {showPremiumModal && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-sm border rounded-3xl p-6 shadow-2xl space-y-4 ${theme.card}`}
              >
                <div className="text-center">
                  <span className="text-amber-400 text-3xl drop-shadow-md">
                    👑
                  </span>
                  <h3 className={`text-lg font-extrabold mt-2 ${theme.text}`}>
                    CleanBite Premium
                  </h3>
                  <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
                    Nâng tầm phong cách sống lành mạnh
                  </p>
                </div>
                <div className="space-y-2.5 text-xs">
                  {[
                    "Tắt hoàn quảng cáo",
                    "Mở khóa AI Menu 7 ngày",
                    "Xuất báo cáo PDF",
                    "1 buổi tư vấn 1-1 với Bác sĩ",
                  ].map((t) => (
                    <div
                      key={t}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border transition-colors ${theme.cardInner}`}
                    >
                      <span className="text-[#10b981] font-bold">✓</span>
                      <span className={`font-medium ${theme.text}`}>{t}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gradient-to-r from-purple-500/10 to-emerald-500/10 border border-purple-500/20 p-3 rounded-2xl text-center">
                  <div className="text-xs font-medium text-purple-500">
                    Chỉ từ
                  </div>
                  <div className="text-xl font-black text-amber-500">
                    39.000 đ{" "}
                    <span
                      className={`text-xs font-normal opacity-70 ${theme.textMuted}`}
                    >
                      / tháng
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowPremiumModal(false)}
                    className={`flex-1 py-2.5 font-bold rounded-xl text-xs transition-colors ${theme.iconBg} ${theme.text}`}
                  >
                    Để sau
                  </button>
                  <button
                    onClick={() => {
                      setIsPremium(true);
                      localStorage.setItem("cleanbite_is_premium", "true");
                      setShowPremiumModal(false);
                      alert("Đã kích hoạt VIP Demo!");
                    }}
                    className="flex-1 py-2.5 bg-gradient-to-r from-purple-500 to-[#10b981] text-white font-bold rounded-xl text-xs shadow-lg shadow-purple-500/30"
                  >
                    Dùng thử 7 ngày
                  </button>
                </div>
              </div>
            </div>
          )}

          {showOnboarding && (
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm ${theme.overlay}`}
            >
              <div
                className={`w-full max-w-sm border rounded-3xl p-6 shadow-2xl ${theme.card}`}
              >
                <div className="text-center mb-4">
                  <span className="text-[#10b981] text-[11px] font-bold uppercase tracking-wider bg-[#10b981]/10 px-3 py-1 rounded-full border border-[#10b981]/20">
                    Chào mừng bạn
                  </span>
                  <h2 className={`text-xl font-bold mt-2 ${theme.text}`}>
                    Thiết lập hồ sơ
                  </h2>
                  <p className={`text-xs mt-1 font-medium ${theme.textMuted}`}>
                    Cá nhân hóa lượng Calo và chế độ ăn
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
                      macroSplit: profile?.macroSplit || {
                        carbs: 50,
                        protein: 25,
                        fat: 25,
                      },
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
                    <label
                      className={`block text-xs font-bold mb-1 ${theme.textMuted}`}
                    >
                      Tên của bạn
                    </label>
                    <input
                      name="userName"
                      type="text"
                      required
                      placeholder="VD: Mai Lan"
                      defaultValue={profile?.name || ""}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className={`text-xs font-bold ${theme.textMuted}`}>
                        Email nhận báo cáo
                      </label>
                      <span
                        className={`text-[10px] font-normal opacity-70 ${theme.textMuted}`}
                      >
                        Không bắt buộc
                      </span>
                    </div>
                    <input
                      name="userEmail"
                      type="email"
                      placeholder="VD: mailan@gmail.com"
                      defaultValue={profile?.email || ""}
                      className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        className={`block text-xs font-bold mb-1 ${theme.textMuted}`}
                      >
                        Giới tính
                      </label>
                      <select
                        name="gender"
                        defaultValue={profile?.gender || "female"}
                        className={`w-full border rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                      >
                        <option value="female">Nữ</option>
                        <option value="male">Nam</option>
                      </select>
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-bold mb-1 ${theme.textMuted}`}
                      >
                        Tuổi
                      </label>
                      <input
                        name="age"
                        type="number"
                        required
                        placeholder="20"
                        defaultValue={profile?.age || 20}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label
                        className={`block text-xs font-bold mb-1 ${theme.textMuted}`}
                      >
                        Chiều cao (cm)
                      </label>
                      <input
                        name="height"
                        type="number"
                        required
                        placeholder="152"
                        defaultValue={profile?.height || 152}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-xs font-bold mb-1 ${theme.textMuted}`}
                      >
                        Cân nặng (kg)
                      </label>
                      <input
                        name="weight"
                        type="number"
                        required
                        placeholder="43"
                        defaultValue={profile?.weight || 43}
                        className={`w-full border rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10b981] transition-colors ${theme.input}`}
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      className={`block text-xs font-bold mb-1 ${theme.textMuted}`}
                    >
                      Tình trạng sức khỏe / Bệnh lý
                    </label>
                    <select
                      value={medicalOption}
                      onChange={(e) => setMedicalOption(e.target.value)}
                      className={`w-full border rounded-xl px-2.5 py-2 text-xs focus:outline-none focus:border-[#10b981] transition-colors mb-2 ${theme.input}`}
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
                      <input
                        name="customMedical"
                        type="text"
                        placeholder="Nhập bệnh của bạn (VD: Mỡ máu...)"
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
                        className={`w-full border border-[#10b981]/80 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#10b981] ${theme.input}`}
                      />
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-4 bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs shadow-lg shadow-[#10b981]/25 transition-all"
                  >
                    Hoàn tất & Lưu hồ sơ
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* NÚT THÊM NHANH TAB NHẬT KÝ */}
          {activeTab === "journal" && (
            <button
              onClick={() => setActiveTab("foods")}
              className="fixed bottom-24 right-[calc(50%-180px)] md:right-[calc(50%-190px)] w-14 h-14 bg-[#10b981] rounded-full flex items-center justify-center text-white text-2xl shadow-lg shadow-[#10b981]/40 z-40 transition-transform active:scale-95 border-2 border-white/20"
            >
              +
            </button>
          )}

          {/* ================= THANH ĐIỀU HƯỚNG ĐÁY ================= */}
          {activeTab !== "settings" && (
            <nav
              className={`fixed bottom-0 w-full max-w-[430px] backdrop-blur-xl border-t px-4 py-2.5 flex items-center justify-around z-40 transition-colors duration-300 ${theme.nav}`}
            >
              {[
                { id: "journal", label: "Nhật ký", icon: "📝" },
                { id: "foods", label: "Thực phẩm", icon: "🍲" },
                { id: "ai", label: "Thực đơn AI", icon: "✨" },
                { id: "profile", label: "Cá nhân", icon: "👤" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab.id ? `${theme.navActive} scale-105 drop-shadow-sm` : theme.navInactive}`}
                >
                  <span className="text-[22px] leading-none">{tab.icon}</span>
                  <span className="text-[10px] font-bold">{tab.label}</span>
                </button>
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
