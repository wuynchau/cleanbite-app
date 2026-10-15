import React, { useState, useMemo, useEffect } from "react";
import * as FoodsModule from "./FoodsData";
import html2pdf from "html2pdf.js";
import { supabase } from "./src/supabaseClient";
import Auth from "./src/Auth";

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
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [profileLoadError, setProfileLoadError] = useState("");
  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (error) {
        console.error("Lỗi kiểm tra phiên đăng nhập:", error);
      }

      setSession(data?.session ?? null);
      setAuthLoading(false);
    };

    loadSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!isMounted) return;

      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      if (!session?.user?.id) {
        setProfileLoaded(false);
        return;
      }

      setProfileLoaded(false);
      setProfileLoadError("");

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (error) throw error;
        if (cancelled) return;

        if (data) {
          const loadedProfile = {
            name: data.name || session.user.user_metadata?.name || "",
            email: session.user.email || "",
            gender: data.gender || "female",
            age: data.age ?? 20,
            height: Number(data.height) || 160,
            weight: Number(data.weight) || 50,
            medical:
              typeof data.medical === "string" ? data.medical : "Đau dạ dày",
            bmi: data.bmi ?? "",
            bmr: data.bmr ?? 0,
            targetCalo: data.target_calo ?? 1235,
            waterTarget: data.water_target ?? 2000,
            macroSplit: data.macro_split || {
              carbs: 50,
              protein: 25,
              fat: 25,
            },
          };

          setProfile(loadedProfile);
          setMedicalOption(loadedProfile.medical);
          setTempWaterTarget(loadedProfile.waterTarget);

          localStorage.setItem(
            "cleanbite_profile",
            JSON.stringify(loadedProfile),
          );

          setShowOnboarding(false);
        } else {
          // Tài khoản mới chưa có hồ sơ trong database.
          const freshProfile = {
            name: session.user.user_metadata?.name || "",
            email: session.user.email || "",
            gender: "female",
            age: 20,
            height: 160,
            weight: 50,
            medical: "Đau dạ dày",
            macroSplit: {
              carbs: 50,
              protein: 25,
              fat: 25,
            },
          };

          localStorage.removeItem("cleanbite_profile");
          setProfile(freshProfile);
          setMedicalOption("Đau dạ dày");
          setTempWaterTarget(2000);
          setShowOnboarding(true);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Lỗi tải hồ sơ Supabase:", error);
        setProfileLoadError(error.message || "Không tải được hồ sơ.");
      } finally {
        if (!cancelled) setProfileLoaded(true);
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

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
    headerBg: "bg-gradient-to-b from-[#0f5132] via-[#146c43] to-[#10b981]",
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

  // Declare admin state before effects that reference it in dependency arrays.
  const [adminData, setAdminData] = useState(null);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState("");
  const [adminReloadKey, setAdminReloadKey] = useState(0);
  const isAdmin = session?.user?.app_metadata?.role === "admin";
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
  const [macroSaving, setMacroSaving] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(new Date());

  const [meals, setMeals] = useState({
    breakfast: [],
    lunch: [],
    dinner: [],
    snack: [],
  });

  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterSaving, setWaterSaving] = useState(false);
  const [waterTargetSaving, setWaterTargetSaving] = useState(false);
  const [dailyLogId, setDailyLogId] = useState(null);
  const [journalLoading, setJournalLoading] = useState(false);
  const [journalError, setJournalError] = useState("");

  useEffect(() => {
    const userId = session?.user?.id;

    if (!userId) {
      setDailyLogId(null);
      setJournalLoading(false);
      return;
    }

    let cancelled = false;

    const loadJournal = async () => {
      setJournalLoading(true);
      setJournalError("");

      const dateKey = [
        currentDate.getFullYear(),
        String(currentDate.getMonth() + 1).padStart(2, "0"),
        String(currentDate.getDate()).padStart(2, "0"),
      ].join("-");

      setMeals({
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      });
      setWaterGlasses(0);
      setDailyLogId(null);

      try {
        // 1. Tìm hoặc tạo nhật ký cho ngày đang chọn.
        const { data: log, error: logError } = await supabase
          .from("daily_logs")
          .upsert(
            {
              user_id: userId,
              log_date: dateKey,
            },
            { onConflict: "user_id,log_date" },
          )
          .select("id, water_glasses")
          .single();

        if (logError) throw logError;
        if (cancelled) return;

        setDailyLogId(log.id);
        setWaterGlasses(Number(log.water_glasses) || 0);

        // 2. Lấy các món thuộc nhật ký này.
        const { data: rows, error: mealError } = await supabase
          .from("meal_items")
          .select(
            "id, meal_type, food_name, quantity, calories, protein, carbs, fat",
          )
          .eq("daily_log_id", log.id)
          .order("created_at", { ascending: true });

        if (mealError) throw mealError;
        if (cancelled) return;

        // 3. Chuyển dữ liệu database về cấu trúc giao diện hiện tại.
        const groupedMeals = {
          breakfast: [],
          lunch: [],
          dinner: [],
          snack: [],
        };

        (rows || []).forEach((item) => {
          if (!groupedMeals[item.meal_type]) return;

          groupedMeals[item.meal_type].push({
            id: item.id,
            name: item.food_name,
            weight: Number(item.quantity) || 0,
            calories: Number(item.calories) || 0,
            protein: Number(item.protein) || 0,
            carbs: Number(item.carbs) || 0,
            fat: Number(item.fat) || 0,
          });
        });

        setMeals(groupedMeals);
      } catch (error) {
        if (cancelled) return;

        console.error("Lỗi tải nhật ký:", error);
        setJournalError(error.message || "Không tải được nhật ký ăn uống.");
      } finally {
        if (!cancelled) setJournalLoading(false);
      }
    };

    loadJournal();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, currentDate]);

  useEffect(() => {
    if (activeTab !== "admin") return undefined;
    let cancelled = false;

    const loadAdminDashboard = async () => {
      if (!isAdmin) {
        setAdminData(null);
        setAdminError("Tài khoản này chưa được cấp vai trò quản trị viên.");
        return;
      }

      setAdminLoading(true);
      setAdminError("");
      try {
        const { data: sessionData, error: sessionError } =
          await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        const token = sessionData?.session?.access_token;
        if (!token)
          throw new Error("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.");

        const response = await fetch("/api/admin-dashboard", {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result?.success !== true) {
          throw new Error(result?.error || "Không tải được bảng quản trị.");
        }
        if (!cancelled) setAdminData(result.data);
      } catch (error) {
        if (cancelled) return;
        console.error("Lỗi tải admin dashboard:", error);
        setAdminError(error.message || "Không tải được dữ liệu quản trị.");
      } finally {
        if (!cancelled) setAdminLoading(false);
      }
    };

    loadAdminDashboard();
    return () => {
      cancelled = true;
    };
  }, [activeTab, isAdmin, session?.user?.id, adminReloadKey]);

  const [tempWaterTarget, setTempWaterTarget] = useState(
    profile?.waterTarget || 2000,
  );

  const [selectedFoodForModal, setSelectedFoodForModal] = useState(null);
  const [modalGrams, setModalGrams] = useState(100);
  const [modalMealType, setModalMealType] = useState("breakfast");
  const [isAddingFood, setIsAddingFood] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [showCustomFoodModal, setShowCustomFoodModal] = useState(false);
  const [customFoodForm, setCustomFoodForm] = useState({
    name: "",
    weight: 100,
    calories: 250,
    mealType: "breakfast",
  });
  const [isSavingCustomFood, setIsSavingCustomFood] = useState(false);

  const [aiCustomNote, setAiCustomNote] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSavingAiMenu, setIsSavingAiMenu] = useState(false);
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

  const isFutureLocalDate = (date) => {
    const candidate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return candidate > today;
  };

  const changeDay = (offset) => {
    const nextDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + offset,
    );
    if (isFutureLocalDate(nextDate)) return;
    setCurrentDate(nextDate);
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
        isFuture: isFutureLocalDate(thisDate),
      });
    }
    return days;
  }, [calendarViewDate, currentDate]);

  // ================= 4. HÀM XỬ LÝ =================

  const handleConfirmAddFood = async () => {
    if (!selectedFoodForModal || isAddingFood) return;

    if (!dailyLogId || journalLoading) {
      alert("Nhật ký đang tải. Bạn vui lòng thử lại sau.");
      return;
    }

    setIsAddingFood(true);
    const ratio = modalGrams / 100;
    const foodToSave = {
      daily_log_id: dailyLogId,
      meal_type: modalMealType,
      food_name: selectedFoodForModal.name,
      quantity: modalGrams,
      calories: Math.round(selectedFoodForModal.calories * ratio),
      protein: Math.round(selectedFoodForModal.protein * ratio),
      carbs: Math.round(selectedFoodForModal.carbs * ratio),
      fat: Math.round(selectedFoodForModal.fat * ratio),
    };

    try {
      const { data, error } = await supabase
        .from("meal_items")
        .insert(foodToSave)
        .select(
          "id, meal_type, food_name, quantity, calories, protein, carbs, fat",
        )
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error("Không nhận được bản ghi vừa lưu.");

      const newItem = {
        id: data.id,
        name: data.food_name,
        weight: Number(data.quantity) || 0,
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
      };

      setMeals((prev) => ({
        ...prev,
        [data.meal_type]: [...(prev[data.meal_type] || []), newItem],
      }));

      setSelectedFoodForModal(null);
      setModalGrams(100);
      setActiveTab("journal");
    } catch (error) {
      console.error("Lỗi lưu món ăn:", error);
      alert(`Không lưu được món ăn: ${error.message || "Vui lòng thử lại."}`);
    } finally {
      setIsAddingFood(false);
    }
  };

  const handleRemoveFood = async (mealType, itemId) => {
    if (!itemId) return;

    if (!dailyLogId) {
      alert("Nhật ký chưa tải xong. Vui lòng thử lại.");
      return;
    }

    const itemIdString = String(itemId);

    // ID do Supabase tạo thường là UUID.
    const isDatabaseId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        itemIdString,
      );

    // Nếu món đã lưu trong Supabase, xóa ở database trước.
    if (isDatabaseId) {
      const { data: deletedRows, error } = await supabase
        .from("meal_items")
        .delete()
        .eq("id", itemIdString)
        .eq("daily_log_id", dailyLogId)
        .select("id");

      if (error) {
        console.error("Lỗi xóa món ăn:", error);
        alert(`Không thể xóa món ăn: ${error.message || "Vui lòng thử lại."}`);
        return;
      }
      if (!deletedRows?.length) {
        alert(
          "Không tìm thấy món ăn trong nhật ký này hoặc bạn không có quyền xóa.",
        );
        return;
      }
    } else {
      // Xử lý dữ liệu mẫu cũ chưa có ID từ database.
      console.warn("Món ăn chưa có ID Supabase:", itemIdString);
    }

    // Chỉ cập nhật giao diện sau khi xóa thành công
    // hoặc xác định đây là dữ liệu mẫu chưa lưu.
    setMeals((prev) => ({
      ...prev,
      [mealType]: (prev[mealType] || []).filter(
        (item) => String(item.id) !== itemIdString,
      ),
    }));
  };

  // Lưu món ăn do người dùng tự nhập vào Supabase trước khi cập nhật giao diện.
  const handleAddCustomFood = async () => {
    if (isSavingCustomFood) return;

    const foodName = String(customFoodForm.name || "").trim();
    const quantity = Number(customFoodForm.weight);
    const calories = Number(customFoodForm.calories);
    const allowedMealTypes = ["breakfast", "lunch", "dinner", "snack"];

    if (!foodName) {
      alert("Vui lòng nhập tên món ăn!");
      return;
    }

    if (!dailyLogId || journalLoading) {
      alert("Nhật ký chưa tải xong. Vui lòng thử lại sau.");
      return;
    }

    if (!Number.isFinite(quantity) || quantity <= 0) {
      alert("Khối lượng món ăn phải lớn hơn 0 gram.");
      return;
    }

    if (!Number.isFinite(calories) || calories < 0) {
      alert("Lượng calo phải là số không âm.");
      return;
    }

    if (!allowedMealTypes.includes(customFoodForm.mealType)) {
      alert("Vui lòng chọn bữa ăn hợp lệ.");
      return;
    }

    setIsSavingCustomFood(true);

    try {
      const { data, error } = await supabase
        .from("meal_items")
        .insert({
          daily_log_id: dailyLogId,
          meal_type: customFoodForm.mealType,
          food_name: foodName,
          quantity,
          calories,
          // Biểu mẫu hiện chưa có trường nhập các chất này.
          protein: 0,
          carbs: 0,
          fat: 0,
        })
        .select(
          "id, meal_type, food_name, quantity, calories, protein, carbs, fat",
        )
        .single();

      if (error) throw error;
      if (!data) throw new Error("Không nhận được dữ liệu món ăn vừa lưu.");

      const savedItem = {
        id: data.id,
        name: data.food_name,
        weight: Number(data.quantity) || 0,
        calories: Number(data.calories) || 0,
        protein: Number(data.protein) || 0,
        carbs: Number(data.carbs) || 0,
        fat: Number(data.fat) || 0,
      };

      // Dùng loại bữa trả về từ database để giữ giao diện và dữ liệu đồng bộ.
      setMeals((prev) => ({
        ...prev,
        [data.meal_type]: [...(prev[data.meal_type] || []), savedItem],
      }));

      setShowCustomFoodModal(false);
      setCustomFoodForm({
        name: "",
        weight: 100,
        calories: 250,
        mealType: "breakfast",
      });
      setActiveTab("journal");
    } catch (error) {
      console.error("Lỗi lưu món ăn tự nhập:", error);
      alert(`Không thể lưu món ăn: ${error.message || "Vui lòng thử lại."}`);
    } finally {
      setIsSavingCustomFood(false);
    }
  };

  // Gọi Gemini trực tiếp từ frontend và hiển thị kết quả ở màn hình Thực đơn AI.
  const handleApplyAiMenu = async () => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setAiSuccessAlert(false);
    setGeneratedAiMenu(null);

    try {
      const apiKey = String(import.meta.env.VITE_GEMINI_API_KEY || "").trim();
      if (!apiKey) {
        throw new Error(
          "Thiếu VITE_GEMINI_API_KEY. Hãy thêm biến này vào .env.local khi chạy thử hoặc Environment Variables trên Vercel.",
        );
      }

      // Gemini 3.5 Flash hiện đã được thay thế tự động bằng 3.6 Flash.
      const model = String(
        import.meta.env.VITE_GEMINI_MODEL || "gemini-3.8-flash",
      ).trim();

      const foodOptions = (Array.isArray(foodDatabase) ? foodDatabase : [])
        .slice(0, 120)
        .map((food) => ({
          name: String(food.name || ""),
          category: String(food.category || ""),
          calories: Number(food.calories) || 0,
          protein: Number(food.protein) || 0,
          carbs: Number(food.carbs) || 0,
          fat: Number(food.fat) || 0,
        }));

      const promptText = [
        "Bạn là trợ lý gợi ý thực đơn dinh dưỡng bằng tiếng Việt.",
        "Tạo thực đơn cho một ngày gồm bữa sáng, bữa trưa, bữa tối và bữa phụ.",
        "Mục tiêu năng lượng: " + targetCalories + " kcal/ngày.",
        "Mục tiêu protein: " +
          targetProtein +
          " g; carbohydrate: " +
          targetCarbs +
          " g; chất béo: " +
          targetFat +
          " g.",
        "Hồ sơ người dùng: " +
          JSON.stringify({
            age: Number(profile?.age) || 20,
            gender: String(profile?.gender || "Chưa cung cấp"),
            height: Number(profile?.height) || 0,
            weight: Number(profile?.weight) || 0,
            medical: String(profile?.medical || "Chưa cung cấp"),
            bmi: profile?.bmi || "",
            bmr: Number(profile?.bmr) || 0,
            goal: String(profile?.goal || "maintain"),
            activityLevel: Number(profile?.activityLevel) || 1.2,
            foodRestrictions: String(profile?.foodRestrictions || ""),
          }),
        "Yêu cầu bổ sung của người dùng: " + String(aiCustomNote || "Không có"),
        "Ưu tiên các món trong danh sách thực phẩm tham khảo. Dinh dưỡng của từng món phải ứng với khối lượng được đề xuất.",
        "Không đưa ra chẩn đoán hay lời khuyên điều trị. Nếu có bệnh lý hoặc yêu cầu kiêng ăn, hãy thận trọng và nêu gợi ý phù hợp.",
        "Danh sách thực phẩm tham khảo: " + JSON.stringify(foodOptions),
        "Chỉ trả về JSON hợp lệ, không có Markdown hoặc lời giải thích bên ngoài JSON.",
        'Cấu trúc: {"breakfast":[{"name":"Tên món","weight":150,"calories":250,"protein":12,"carbs":30,"fat":8}],"lunch":[],"dinner":[],"snack":[]}.',
        "Mỗi món phải có name là chuỗi và weight, calories, protein, carbs, fat là số không âm.",
      ].join("\n");

      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" +
          encodeURIComponent(model) +
          ":generateContent?key=" +
          encodeURIComponent(apiKey),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: promptText }] }],
            generationConfig: {
              maxOutputTokens: 8192,
              responseMimeType: "application/json",
            },
          }),
        },
      );

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(
          data?.error?.message ||
            "Gemini API trả về HTTP " +
              response.status +
              ". Hãy kiểm tra API key, model và hạn mức sử dụng.",
        );
      }

      if (data?.promptFeedback?.blockReason) {
        throw new Error(
          "Gemini đã chặn yêu cầu: " + data.promptFeedback.blockReason,
        );
      }

      const rawText = data?.candidates?.[0]?.content?.parts
        ?.map((part) => part?.text || "")
        .join("")
        .trim();

      if (!rawText) {
        const reason = data?.candidates?.[0]?.finishReason;
        throw new Error(
          "Gemini không trả nội dung thực đơn" +
            (reason ? " (" + reason + ")" : "") +
            ". Vui lòng thử lại.",
        );
      }

      const fenceStart = new RegExp(
        "^" + String.fromCharCode(96).repeat(3) + "(?:json)?\\s*",
        "i",
      );
      const fenceEnd = new RegExp(
        "\\s*" + String.fromCharCode(96).repeat(3) + "$",
      );
      const cleanedText = rawText
        .replace(fenceStart, "")
        .replace(fenceEnd, "")
        .trim();

      let parsed;
      try {
        parsed = JSON.parse(cleanedText);
      } catch {
        throw new Error(
          "Gemini trả về dữ liệu không đúng định dạng JSON. Vui lòng thử lại.",
        );
      }

      const processItems = (items, mealIndex) => {
        if (!Array.isArray(items)) return [];
        return items
          .filter((item) => String(item?.name || "").trim())
          .map((item, itemIndex) => ({
            id: String(Date.now()) + "-" + mealIndex + "-" + itemIndex,
            name: String(item.name).trim(),
            weight: Math.max(0, Number(item.weight) || 0),
            calories: Math.max(0, Number(item.calories) || 0),
            protein: Math.max(0, Number(item.protein) || 0),
            carbs: Math.max(0, Number(item.carbs) || 0),
            fat: Math.max(0, Number(item.fat) || 0),
          }));
      };

      const nextMenu = {
        breakfast: processItems(parsed?.breakfast, 0),
        lunch: processItems(parsed?.lunch, 1),
        dinner: processItems(parsed?.dinner, 2),
        snack: processItems(parsed?.snack, 3),
      };

      if (!Object.values(nextMenu).some((items) => items.length > 0)) {
        throw new Error(
          "Gemini chưa tạo được món ăn hợp lệ. Vui lòng thử lại.",
        );
      }

      // Giữ kết quả ở state để giao diện hiển thị; người dùng có thể xem trước rồi áp dụng.
      setGeneratedAiMenu(nextMenu);
      setAiSuccessAlert(true);
    } catch (error) {
      console.error("Lỗi tạo thực đơn Gemini:", error);
      alert(
        "Không tạo được thực đơn AI.\n\n" +
          (error?.message || "Vui lòng thử lại."),
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  // Lưu thực đơn AI vào Supabase và thay nhật ký hiện tại sau khi lưu thành công.
  const handleSaveGeneratedAiMenu = async () => {
    if (isSavingAiMenu) return;

    if (!dailyLogId || journalLoading) {
      alert("Nhật ký chưa tải xong. Vui lòng đợi một chút rồi thử lại.");
      return;
    }

    if (!generatedAiMenu) {
      alert("Chưa có thực đơn AI để áp dụng.");
      return;
    }

    const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
    const rowsToSave = mealTypes.flatMap((mealType) => {
      const items = Array.isArray(generatedAiMenu[mealType])
        ? generatedAiMenu[mealType]
        : [];

      return items
        .map((item) => {
          const foodName = String(item?.name || "").trim();
          const quantity = Number(item?.weight);
          const calories = Number(item?.calories);
          const protein = Number(item?.protein);
          const carbs = Number(item?.carbs);
          const fat = Number(item?.fat);

          if (!foodName) return null;

          return {
            daily_log_id: dailyLogId,
            meal_type: mealType,
            food_name: foodName,
            quantity:
              Number.isFinite(quantity) && quantity > 0 ? quantity : 100,
            calories: Number.isFinite(calories) ? Math.max(0, calories) : 0,
            protein: Number.isFinite(protein) ? Math.max(0, protein) : 0,
            carbs: Number.isFinite(carbs) ? Math.max(0, carbs) : 0,
            fat: Number.isFinite(fat) ? Math.max(0, fat) : 0,
          };
        })
        .filter(Boolean);
    });

    if (rowsToSave.length === 0) {
      alert("Thực đơn AI chưa có món ăn hợp lệ để lưu.");
      return;
    }

    setIsSavingAiMenu(true);
    let insertedIds = [];
    let replacementComplete = false;

    try {
      // Đọc danh sách cũ trước khi chèn để có thể xác nhận số bản ghi thực sự bị xóa.
      const { data: oldRows, error: oldRowsError } = await supabase
        .from("meal_items")
        .select("id")
        .eq("daily_log_id", dailyLogId);

      if (oldRowsError) throw oldRowsError;
      const oldIds = (oldRows || []).map((row) => row.id);

      // Lưu các món mới trước để không xóa nhật ký cũ nếu insert thất bại.
      const { data: savedRows, error: insertError } = await supabase
        .from("meal_items")
        .insert(rowsToSave)
        .select(
          "id, meal_type, food_name, quantity, calories, protein, carbs, fat",
        );

      insertedIds = (savedRows || []).map((item) => item.id);
      if (insertError) throw insertError;
      if (!savedRows || savedRows.length !== rowsToSave.length) {
        throw new Error("Chưa lưu được đầy đủ các món trong thực đơn AI.");
      }

      if (oldIds.length > 0) {
        const { data: deletedRows, error: deleteError } = await supabase
          .from("meal_items")
          .delete()
          .eq("daily_log_id", dailyLogId)
          .in("id", oldIds)
          .select("id");

        if (deleteError) throw deleteError;
        if (!deletedRows || deletedRows.length !== oldIds.length) {
          throw new Error(
            "Không xóa được đầy đủ nhật ký cũ. Hãy kiểm tra quyền RLS trước khi áp dụng lại thực đơn.",
          );
        }
      }

      replacementComplete = true;
      const groupedMeals = {
        breakfast: [],
        lunch: [],
        dinner: [],
        snack: [],
      };

      savedRows.forEach((item) => {
        if (!groupedMeals[item.meal_type]) return;
        groupedMeals[item.meal_type].push({
          id: item.id,
          name: item.food_name,
          weight: Number(item.quantity) || 0,
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
        });
      });

      setMeals(groupedMeals);
      setGeneratedAiMenu(null);
      setAiSuccessAlert(true);
      setTimeout(() => {
        setAiSuccessAlert(false);
        setActiveTab("journal");
      }, 1200);
    } catch (error) {
      // Nếu thay thế chưa hoàn tất, thử dọn các món mới để tránh bị cộng trùng.
      if (insertedIds.length > 0 && !replacementComplete) {
        const { error: rollbackError } = await supabase
          .from("meal_items")
          .delete()
          .eq("daily_log_id", dailyLogId)
          .in("id", insertedIds);
        if (rollbackError) {
          console.error("Không thể hoàn tác món AI vừa lưu:", rollbackError);
        }
      }
      console.error("Lỗi lưu thực đơn AI:", error);
      alert(
        `Không thể lưu thực đơn AI: ${error.message || "Vui lòng thử lại."}`,
      );
    } finally {
      setIsSavingAiMenu(false);
    }
  };

  const handleSendReport = async () => {
    const recipientEmail = String(
      session?.user?.email || profile?.email || "",
    ).trim();
    if (!recipientEmail) {
      alert("Bạn chưa có email trong hồ sơ. Vui lòng cập nhật email trước.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipientEmail)) {
      alert("Địa chỉ email chưa hợp lệ. Vui lòng kiểm tra lại hồ sơ.");
      return;
    }

    setIsSendingEmail(true);
    let reportElement = null;

    try {
      const escapeHtml = (value) =>
        String(value ?? "").replace(/[&<>"']/g, (char) => {
          const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;",
          };
          return entities[char];
        });
      const number = (value) => (Number(value) || 0).toLocaleString("vi-VN");
      const today = new Date();
      const reportDate = currentDate;
      const dateKey = `${reportDate.getFullYear()}-${String(reportDate.getMonth() + 1).padStart(2, "0")}-${String(reportDate.getDate()).padStart(2, "0")}`;
      const fileName = `CleanBite_BaoCao_${dateKey}.pdf`;
      const gender = profile?.gender === "male" ? "Nam" : "Nữ";

      const mealTypes = [
        ["breakfast", "Bữa sáng"],
        ["lunch", "Bữa trưa"],
        ["dinner", "Bữa tối"],
        ["snack", "Bữa phụ"],
      ];

      const mealSections = mealTypes
        .map(([key, label]) => {
          const items = Array.isArray(meals?.[key]) ? meals[key] : [];
          const rows = items.length
            ? items
                .map(
                  (item) => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td style="text-align:right">${number(item.weight)} g</td>
                    <td style="text-align:right">${number(item.calories)} kcal</td>
                    <td style="text-align:right">${number(item.protein)} g</td>
                    <td style="text-align:right">${number(item.carbs)} g</td>
                    <td style="text-align:right">${number(item.fat)} g</td>
                  </tr>`,
                )
                .join("")
            : `<tr><td colspan="6" style="color:#6b7280">Chưa ghi nhận món ăn</td></tr>`;
          const total = items.reduce(
            (sum, item) => sum + (Number(item.calories) || 0),
            0,
          );

          return `
          <section style="margin-top:22px;page-break-inside:avoid">
            <h3 style="color:#047857;font-size:15px;margin:0 0 8px">${label} · ${number(total)} kcal</h3>
            <table style="width:100%;border-collapse:collapse;font-size:10px">
              <thead><tr style="background:#ecfdf5">
                <th style="text-align:left">Món ăn</th><th>Khối lượng</th><th>Calo</th><th>Đạm</th><th>Carbs</th><th>Béo</th>
              </tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </section>`;
        })
        .join("");

      const macros = [
        ["Chất đạm", consumed.protein, targetProtein],
        ["Carbohydrate", consumed.carbs, targetCarbs],
        ["Chất béo", consumed.fat, targetFat],
      ];
      const macroRows = macros
        .map(
          ([label, actual, target]) => `
        <tr>
          <td>${label}</td><td style="text-align:right">${number(actual)} g</td>
          <td style="text-align:right">${number(target)} g</td>
        </tr>`,
        )
        .join("");

      const caloriesDifference = targetCalories - consumed.calories;
      const caloriesSummary =
        caloriesDifference >= 0
          ? `Còn ${number(caloriesDifference)} kcal so với mục tiêu ngày.`
          : `Đã vượt mục tiêu calo ngày ${number(Math.abs(caloriesDifference))} kcal.`;
      reportElement = document.createElement("div");

      reportElement.style.cssText = `
  display: block;
  position: absolute;
  left: 0;
  top: 0;
  width: 794px;
  min-height: 1123px;
  margin: 0;
  padding: 34px;
  background: #ffffff;
  color: #1f2937;
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 1.5;
  box-sizing: border-box;
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  z-index: 99999;
`;
      reportElement.innerHTML = `
        <div style="border-bottom:3px solid #10b981;padding-bottom:16px">
          <div style="font-size:25px;font-weight:800;color:#047857">CleanBite</div>
          <div style="font-size:12px;color:#6b7280">small bites · brighter lives</div>
          <h1 style="font-size:21px;margin:18px 0 4px;color:#111827">BÁO CÁO DINH DƯỠNG</h1>
          <div style="color:#6b7280">Ngày xuất báo cáo: ${today.toLocaleDateString("vi-VN")}</div>
        </div>

        <section style="margin-top:18px">
          <h2 style="font-size:15px;color:#047857">1. Thông tin cá nhân</h2>
          <table style="width:100%;border-collapse:collapse">
            <tbody>
              <tr><td style="padding:5px 0">Họ và tên</td><td style="padding:5px 0;font-weight:700">${escapeHtml(profile?.name || "Chưa cập nhật")}</td></tr>
              <tr><td style="padding:5px 0">Tuổi / Giới tính</td><td style="padding:5px 0">${number(profile?.age)} / ${gender}</td></tr>
              <tr><td style="padding:5px 0">Chiều cao / Cân nặng</td><td style="padding:5px 0">${number(profile?.height)} cm / ${number(profile?.weight)} kg</td></tr>
              <tr><td style="padding:5px 0">BMI</td><td style="padding:5px 0">${escapeHtml(profile?.bmi ?? "Chưa có dữ liệu")}</td></tr>
              <tr><td style="padding:5px 0">Tình trạng sức khỏe đã khai báo</td><td style="padding:5px 0">${escapeHtml(profile?.medical || "Chưa khai báo")}</td></tr>
            </tbody>
          </table>
        </section>

        <section style="margin-top:18px">
          <h2 style="font-size:15px;color:#047857">2. Tổng quan trong ứng dụng</h2>
          <table style="width:100%;border-collapse:separate;border-spacing:8px 0">
            <tbody><tr>
              <td style="width:50%;padding:12px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px">
                <div style="color:#047857">Calo đã nạp</div><div style="font-size:20px;font-weight:800">${number(consumed.calories)} kcal</div>
              </td>
              <td style="width:50%;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px">
                <div style="color:#6b7280">Mục tiêu calo</div><div style="font-size:20px;font-weight:800">${number(targetCalories)} kcal</div>
              </td>
            </tr></tbody>
          </table>
          <p style="margin-top:8px">${caloriesSummary}</p>
          <h3 style="font-size:13px;color:#047857;margin:14px 0 6px">Các chất dinh dưỡng</h3>
          <table style="width:100%;border-collapse:collapse;font-size:11px">
            <thead><tr style="background:#f3f4f6"><th style="text-align:left">Chỉ số</th><th>Đã nạp</th><th>Mục tiêu</th></tr></thead>
            <tbody>${macroRows}</tbody>
          </table>
          <p style="margin-top:12px">Nước đã ghi nhận: <strong>${number((Number(waterGlasses) || 0) * 250)} ml</strong> / ${number(targetWater)} ml</p>
        </section>

        <section style="margin-top:22px">
          <h2 style="font-size:15px;color:#047857">3. Chi tiết nhật ký bữa ăn</h2>
          ${mealSections}
        </section>

        <div style="border-top:1px solid #d1d5db;margin-top:28px;padding-top:12px;font-size:10px;color:#6b7280">
          Báo cáo được tạo từ thông tin người dùng nhập vào CleanBite tại thời điểm xuất báo cáo. Các giá trị dinh dưỡng mang tính tham khảo và không thay thế chẩn đoán hoặc tư vấn y tế chuyên môn.
        </div>`;

      document.body.appendChild(reportElement);

      // Chờ trình duyệt render nội dung báo cáo
      await new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      );

      // Tạo PDF theo luồng cũ
      const pdfDataUri = await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: fileName,
          image: {
            type: "jpeg",
            quality: 0.96,
          },
          html2canvas: {
            scale: 2,
            useCORS: true,
            logging: false,
          },
          jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
          },
          pagebreak: {
            mode: ["css", "legacy"],
          },
        })
        .from(reportElement)
        .outputPdf("datauristring");

      const pdfBase64 = String(pdfDataUri).split(",").pop();

      if (!pdfBase64 || pdfBase64.length < 100) {
        throw new Error("Không tạo được dữ liệu PDF. Vui lòng thử lại.");
      }

      const {
        data: { session: activeSession },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;
      if (!activeSession?.access_token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const response = await fetch("/api/send-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${activeSession.access_token}`,
        },
        body: JSON.stringify({
          to: recipientEmail,
          name: profile?.name || profile?.fullName || "bạn",
          pdfBase64,
          fileName,
          reportData: {
            reportDate: dateKey,
            profile: {
              name: profile?.name || "",
              age: Number(profile?.age) || 0,
              gender: String(profile?.gender || ""),
              height: Number(profile?.height) || 0,
              weight: Number(profile?.weight) || 0,
              bmi: String(profile?.bmi || ""),
              medical: String(profile?.medical || "").slice(0, 300),
              targetCalories: Number(targetCalories) || 0,
              targetWater: Number(targetWater) || 0,
              macroSplit: profile?.macroSplit || {},
            },
            totals: {
              calories: Number(consumed.calories) || 0,
              protein: Number(consumed.protein) || 0,
              carbs: Number(consumed.carbs) || 0,
              fat: Number(consumed.fat) || 0,
              waterMl: (Number(waterGlasses) || 0) * 250,
            },
            meals: Object.fromEntries(
              ["breakfast", "lunch", "dinner", "snack"].map((mealType) => [
                mealType,
                (Array.isArray(meals?.[mealType]) ? meals[mealType] : [])
                  .slice(0, 80)
                  .map((item) => ({
                    name: String(item.name || "").slice(0, 100),
                    weight: Number(item.weight) || 0,
                    calories: Number(item.calories) || 0,
                    protein: Number(item.protein) || 0,
                    carbs: Number(item.carbs) || 0,
                    fat: Number(item.fat) || 0,
                  })),
              ]),
            ),
          },
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || result?.success !== true) {
        throw new Error(result?.error || "Gửi báo cáo không thành công.");
      }

      alert(
        `Resend đã tiếp nhận yêu cầu gửi báo cáo PDF đến ${recipientEmail}.`,
      );
    } catch (error) {
      console.error("Send CleanBite report error:", error);
      alert(
        `Không thể gửi báo cáo lúc này.\n\n${error.message || "Vui lòng thử lại."}`,
      );
    } finally {
      if (reportElement?.parentNode)
        reportElement.parentNode.removeChild(reportElement);
      setIsSendingEmail(false);
    }
  };

  // Lưu tỷ lệ đa lượng dinh dưỡng vào Supabase để đồng bộ giữa các thiết bị.
  const handleUpdateMacro = async (carbs, protein, fat) => {
    if (macroSaving) return;

    if (!session?.user?.id) {
      alert("Bạn cần đăng nhập để lưu tỷ lệ dinh dưỡng.");
      return;
    }

    const nextMacroSplit = {
      carbs: Number(carbs),
      protein: Number(protein),
      fat: Number(fat),
    };
    const total =
      nextMacroSplit.carbs + nextMacroSplit.protein + nextMacroSplit.fat;

    if (total !== 100) {
      alert("Tổng tỷ lệ Carbs, Đạm và Béo phải bằng 100%.");
      return;
    }

    setMacroSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ macro_split: nextMacroSplit })
        .eq("id", session.user.id)
        .select("id")
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error("Không tìm thấy hồ sơ của tài khoản này.");

      const newProfile = { ...profile, macroSplit: nextMacroSplit };
      setProfile(newProfile);
      localStorage.setItem("cleanbite_profile", JSON.stringify(newProfile));
      setShowMacroModal(false);
    } catch (error) {
      console.error("Lỗi lưu tỷ lệ dinh dưỡng:", error);
      alert(
        `Không thể lưu tỷ lệ dinh dưỡng: ${error.message || "Vui lòng thử lại."}`,
      );
    } finally {
      setMacroSaving(false);
    }
  };

  // Đăng xuất tài khoản mà không xóa nhật ký/hồ sơ đã lưu trên Supabase.
  const handleLogout = async () => {
    if (isSigningOut) return;

    const confirmed = window.confirm(
      "Bạn có chắc chắn muốn đăng xuất? Hồ sơ và nhật ký đã lưu trên tài khoản sẽ được giữ nguyên.",
    );
    if (!confirmed) return;

    setIsSigningOut(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Xóa dữ liệu đệm cục bộ có thể thuộc tài khoản vừa đăng xuất,
      // nhưng giữ cài đặt giao diện như chế độ sáng/tối.
      localStorage.removeItem("cleanbite_profile");
      localStorage.removeItem("cleanbite_is_premium");
      setProfile(null);
      setIsPremium(false);
      setProfileLoadError("");
    } catch (error) {
      console.error("Lỗi đăng xuất CleanBite:", error);
      alert(`Không thể đăng xuất: ${error.message || "Vui lòng thử lại."}`);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Lưu số ly nước đã uống vào nhật ký của đúng tài khoản và ngày hiện tại.
  const handleUpdateWaterGlasses = async (nextValue) => {
    if (waterSaving) return;

    if (!session?.user?.id || !dailyLogId || journalLoading) {
      alert("Nhật ký chưa tải xong. Vui lòng thử lại sau.");
      return;
    }

    const nextWater = Math.max(
      0,
      Math.min(8, Math.floor(Number(nextValue) || 0)),
    );
    setWaterSaving(true);

    try {
      const { data, error } = await supabase
        .from("daily_logs")
        .update({ water_glasses: nextWater })
        .eq("id", dailyLogId)
        .eq("user_id", session.user.id)
        .select("id, water_glasses")
        .single();

      if (error) throw error;

      setWaterGlasses(Number(data.water_glasses) || 0);
    } catch (error) {
      console.error("Lỗi lưu lượng nước:", error);
      alert(
        `Không thể lưu lượng nước: ${error.message || "Vui lòng thử lại."}`,
      );
    } finally {
      setWaterSaving(false);
    }
  };

  // Lưu mục tiêu nước vào hồ sơ Supabase. Đổi mục tiêu không xóa lượng nước đã ghi nhận.
  const handleUpdateWaterTarget = async () => {
    if (waterTargetSaving) return;

    const nextWaterTarget = Number(tempWaterTarget);
    if (
      !Number.isFinite(nextWaterTarget) ||
      nextWaterTarget < 1000 ||
      nextWaterTarget > 4000
    ) {
      alert("Mục tiêu nước phải nằm trong khoảng 1.000–4.000 ml.");
      return;
    }

    if (!session?.user?.id) {
      alert("Bạn cần đăng nhập để lưu mục tiêu nước.");
      return;
    }

    setWaterTargetSaving(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .update({ water_target: nextWaterTarget })
        .eq("id", session.user.id)
        .select("id")
        .single();

      if (error) throw error;
      if (!data?.id) throw new Error("Không tìm thấy hồ sơ của tài khoản này.");

      const newProfile = { ...profile, waterTarget: nextWaterTarget };
      setProfile(newProfile);
      localStorage.setItem("cleanbite_profile", JSON.stringify(newProfile));
      setTempWaterTarget(nextWaterTarget);
      setShowWaterModal(false);
    } catch (error) {
      console.error("Lỗi lưu mục tiêu nước:", error);
      alert(
        `Không thể lưu mục tiêu nước: ${error.message || "Vui lòng thử lại."}`,
      );
    } finally {
      setWaterTargetSaving(false);
    }
  };

  // ================= 5. GIAO DIỆN (RENDER) VỚI ĐẦY ĐỦ LIGHT/DARK MODE =================

  if (authLoading || (session && !profileLoaded)) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex items-center justify-center">
        Đang tải dữ liệu CleanBite...
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }
  if (profileLoadError) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-6 text-center gap-4">
        <p>Không tải được hồ sơ: {profileLoadError}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-[#10b981] px-4 py-2 rounded-xl font-bold"
        >
          Thử lại
        </button>
      </div>
    );
  }

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
                      Clean
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
                    {` ${profile?.name || session?.user?.user_metadata?.name || "Bạn mới"}${isPremium ? " 👑" : ""}`}
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
                    disabled={
                      currentDate.toDateString() === new Date().toDateString()
                    }
                    className="w-8 h-8 flex items-center justify-center text-white/90 hover:text-white active:scale-90 text-sm font-bold disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    ❯
                  </button>
                </div>
              </div>
            </header>
          )}

          <main className="flex-1 px-4 pt-4 overflow-y-auto">
            {activeTab === "journal" && journalLoading && (
              <p className="text-center text-xs text-emerald-500 py-2">
                Đang tải nhật ký...
              </p>
            )}

            {activeTab === "journal" && journalError && (
              <div
                role="alert"
                className="text-sm text-red-400 bg-red-500/10 rounded-xl p-3 mb-3"
              >
                Không tải được nhật ký: {journalError}
              </div>
            )}
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
                        {waterSaving && (
                          <p className="text-[10px] text-blue-400 mt-1">
                            Đang lưu lượng nước...
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleUpdateWaterGlasses(0)}
                      disabled={waterSaving || journalLoading || !dailyLogId}
                      className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-colors ${theme.iconBg} ${theme.textMuted} hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      ↺ Đặt lại
                    </button>
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <button
                        key={num}
                        onClick={() =>
                          handleUpdateWaterGlasses(
                            num === waterGlasses ? num - 1 : num,
                          )
                        }
                        disabled={waterSaving || journalLoading || !dailyLogId}
                        className={`min-w-[40px] h-10 rounded-xl flex items-center justify-center font-bold text-xs transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${num <= waterGlasses ? "bg-[#10b981] text-white shadow-md shadow-[#10b981]/30" : `${theme.iconBg} ${theme.textMuted}`}`}
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
                    let aff;

                    // Món ăn đã chế biến: tìm trên ShopeeFood.
                    if (food.category === "Món ăn") {
                      aff = {
                        url: `https://shopeefood.vn/ho-chi-minh/danh-sach-dia-diem-giao-tan-noi?q=${kw}`,
                        label: "Giao ngay",
                        color:
                          "bg-orange-500 text-white shadow-md shadow-orange-500/20",
                      };
                      // Thực phẩm đóng gói, tinh bột và gia vị: tìm trên Shopee.
                    } else if (
                      food.category === "Tinh bột" ||
                      food.category === "Gia vị"
                    ) {
                      aff = {
                        url: `https://shopee.vn/search?keyword=${kw}`,
                        icon: "🛒",
                        label: "Mua ngay",
                        color:
                          "bg-[#10b981] text-white shadow-md shadow-[#10b981]/20",
                      };
                      // Đạm tươi, rau củ và trái cây: tìm trên Bách Hóa Xanh.
                    } else {
                      aff = {
                        url: `https://www.bachhoaxanh.com/tim-kiem?key=${kw}`,
                        icon: "🛒",
                        label: "Mua ngay",
                        color:
                          "bg-[#10b981] text-white shadow-md shadow-[#10b981]/20",
                      };
                    }

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
                      onClick={handleSaveGeneratedAiMenu}
                      disabled={isSavingAiMenu || journalLoading}
                      className="w-full bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-sm shadow-md shadow-[#10b981]/25 transition-all"
                    >
                      {isSavingAiMenu
                        ? "Đang lưu thực đơn..."
                        : "✓ Áp dụng thực đơn này"}
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
                {isAdmin && (
                  <button
                    onClick={() => setActiveTab("admin")}
                    className={`w-full border rounded-3xl p-4 text-left flex items-center justify-between gap-3 ${theme.card} hover:border-violet-500 transition-colors`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🛡️</span>
                      <div>
                        <div className={`text-sm font-bold ${theme.text}`}>
                          Bảng quản trị CleanBite
                        </div>
                        <div className={`text-xs mt-1 ${theme.textMuted}`}>
                          Thống kê và dữ liệu gần đây của hệ thống
                        </div>
                      </div>
                    </div>
                    <span className="text-violet-500">❯</span>
                  </button>
                )}
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
                        <span className="text-base">📧</span> Gửi báo cáo PDF
                        qua email
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

            {/* TAB QUẢN TRỊ VIÊN */}
            {activeTab === "admin" && (
              <div className="space-y-4 pb-8">
                {/* Tiêu đề và nút quay lại */}
                <div className="flex items-center justify-between gap-3">
                  <button
                    onClick={() => setActiveTab("profile")}
                    className={`border rounded-xl px-3 py-2 text-sm ${theme.card}`}
                  >
                    ← Quay lại
                  </button>

                  <h2 className="text-lg font-bold">🛡️ Quản trị CleanBite</h2>

                  <button
                    onClick={() => setAdminReloadKey((value) => value + 1)}
                    disabled={adminLoading}
                    className="bg-emerald-500 text-white rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-50"
                  >
                    {adminLoading ? "..." : "↻"}
                  </button>
                </div>

                {!isAdmin && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                    Tài khoản chưa được cấp quyền quản trị viên.
                  </div>
                )}

                {isAdmin && adminLoading && (
                  <div
                    className={`rounded-2xl border p-5 text-center ${theme.card}`}
                  >
                    <div className="animate-pulse">
                      Đang tải dữ liệu quản trị...
                    </div>
                  </div>
                )}

                {isAdmin && adminError && (
                  <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                    <p className="text-sm text-red-400">{adminError}</p>
                    <button
                      onClick={() => setAdminReloadKey((value) => value + 1)}
                      className="mt-3 rounded-xl bg-red-500 px-4 py-2 text-sm font-bold text-white"
                    >
                      Thử tải lại
                    </button>
                  </div>
                )}

                {isAdmin && !adminLoading && !adminError && adminData && (
                  <>
                    {/* Thống kê tổng quan */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        {
                          label: "Hồ sơ",
                          value: adminData.stats?.users ?? 0,
                          icon: "👥",
                        },
                        {
                          label: "Nhật ký",
                          value: adminData.stats?.dailyLogs ?? 0,
                          icon: "📅",
                        },
                        {
                          label: "Món ăn",
                          value: adminData.stats?.mealItems ?? 0,
                          icon: "🍱",
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className={`rounded-2xl border p-3 ${theme.card}`}
                        >
                          <div className="text-xl">{item.icon}</div>
                          <div className="mt-2 text-2xl font-black text-emerald-500">
                            {item.value}
                          </div>
                          <div className={`text-xs ${theme.textMuted}`}>
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Danh sách hồ sơ */}
                    <section className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold">👤 Người dùng</h3>
                        <span className={`text-xs ${theme.textMuted}`}>
                          Tối đa 100 hồ sơ gần đây
                        </span>
                      </div>

                      {(adminData.profiles || []).length === 0 ? (
                        <div
                          className={`rounded-2xl border p-4 text-sm ${theme.card}`}
                        >
                          Chưa có hồ sơ người dùng.
                        </div>
                      ) : (
                        (adminData.profiles || []).map((user) => (
                          <div
                            key={user.id}
                            className={`rounded-2xl border p-4 space-y-3 ${theme.card}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="font-bold break-words">
                                  {user.name || "Chưa cập nhật tên"}
                                </div>
                                <div
                                  className={`mt-1 text-[10px] break-all ${theme.textMuted}`}
                                >
                                  ID: {user.id}
                                </div>
                              </div>
                              <span className="shrink-0 rounded-lg bg-emerald-500/10 px-2 py-1 text-xs text-emerald-500">
                                {user.gender === "male"
                                  ? "Nam"
                                  : user.gender === "female"
                                    ? "Nữ"
                                    : "Chưa rõ"}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <div
                                className={`rounded-xl p-3 ${theme.cardInner}`}
                              >
                                <div className={`text-xs ${theme.textMuted}`}>
                                  Tuổi
                                </div>
                                <div className="mt-1 font-bold">
                                  {user.age ?? "—"}
                                </div>
                              </div>
                              <div
                                className={`rounded-xl p-3 ${theme.cardInner}`}
                              >
                                <div className={`text-xs ${theme.textMuted}`}>
                                  Chiều cao / cân nặng
                                </div>
                                <div className="mt-1 font-bold">
                                  {user.height ?? "—"} cm / {user.weight ?? "—"}{" "}
                                  kg
                                </div>
                              </div>
                              <div
                                className={`rounded-xl p-3 ${theme.cardInner}`}
                              >
                                <div className={`text-xs ${theme.textMuted}`}>
                                  BMI
                                </div>
                                <div className="mt-1 font-bold">
                                  {user.bmi ?? "—"}
                                </div>
                              </div>
                              <div
                                className={`rounded-xl p-3 ${theme.cardInner}`}
                              >
                                <div className={`text-xs ${theme.textMuted}`}>
                                  Mục tiêu calo
                                </div>
                                <div className="mt-1 font-bold">
                                  {user.target_calo ?? "—"} kcal
                                </div>
                              </div>
                            </div>

                            {user.medical && (
                              <div className="text-xs">
                                <span className={theme.textMuted}>
                                  Tình trạng sức khỏe:{" "}
                                </span>
                                {user.medical}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </section>

                    {/* Nhật ký ăn uống gần đây */}
                    <section className="space-y-3">
                      <h3 className="font-bold">📋 Nhật ký ăn uống gần đây</h3>

                      {(adminData.dailyLogs || []).length === 0 ? (
                        <div
                          className={`rounded-2xl border p-4 text-sm ${theme.card}`}
                        >
                          Chưa có nhật ký ăn uống.
                        </div>
                      ) : (
                        (adminData.dailyLogs || []).map((log) => (
                          <div
                            key={log.id}
                            className={`rounded-2xl border p-4 ${theme.card}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="font-bold text-sm">
                                  {log.user_name || "Người dùng"}
                                </div>
                                <div
                                  className={`mt-1 text-xs ${theme.textMuted}`}
                                >
                                  {log.log_date
                                    ? new Date(
                                        `${log.log_date}T00:00:00`,
                                      ).toLocaleDateString("vi-VN")
                                    : "Chưa có ngày"}
                                </div>
                              </div>
                              <div className="text-right text-xs">
                                <div className="text-sky-500">
                                  💧 {Number(log.water_glasses) || 0} ly
                                </div>
                                <div className={`mt-1 ${theme.textMuted}`}>
                                  {(log.meal_items || []).length} món
                                </div>
                              </div>
                            </div>

                            {(log.meal_items || []).length > 0 && (
                              <div
                                className={`mt-3 pt-3 border-t space-y-2 ${theme.divider}`}
                              >
                                {log.meal_items.map((meal) => (
                                  <div
                                    key={meal.id}
                                    className="flex items-start justify-between gap-3 text-xs"
                                  >
                                    <div className="min-w-0">
                                      <div className="font-semibold break-words">
                                        {meal.food_name}
                                      </div>
                                      <div className={theme.textMuted}>
                                        {meal.meal_type} · {meal.quantity} g
                                      </div>
                                    </div>
                                    <div className="shrink-0 font-bold text-emerald-500">
                                      {meal.calories} kcal
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </section>
                  </>
                )}
              </div>
            )}

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
                      onClick={handleLogout}
                      disabled={isSigningOut}
                      className={`w-full p-4 sm:p-5 text-left text-[13px] text-red-500 font-bold flex justify-between items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isDarkMode ? "hover:bg-red-950/20" : "hover:bg-red-50"}`}
                    >
                      <span>
                        {isSigningOut ? "Đang đăng xuất..." : "Đăng xuất"}
                      </span>
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
                    disabled={macroSaving}
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
                    disabled={macroSaving}
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
                    disabled={macroSaving}
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
                    disabled={waterTargetSaving}
                    className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {waterTargetSaving ? "Đang lưu..." : "Lưu"}
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
                      const prevM = new Date(
                        calendarViewDate.getFullYear(),
                        calendarViewDate.getMonth() - 1,
                        1,
                      );
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
                      const nextM = new Date(
                        calendarViewDate.getFullYear(),
                        calendarViewDate.getMonth() + 1,
                        1,
                      );
                      const today = new Date();
                      const currentMonth = new Date(
                        today.getFullYear(),
                        today.getMonth(),
                        1,
                      );
                      if (nextM <= currentMonth) setCalendarViewDate(nextM);
                    }}
                    disabled={
                      calendarViewDate.getFullYear() ===
                        new Date().getFullYear() &&
                      calendarViewDate.getMonth() >= new Date().getMonth()
                    }
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${theme.iconBg} ${theme.textMuted} disabled:opacity-30 disabled:cursor-not-allowed`}
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
                        disabled={item.isFuture}
                        onClick={() => {
                          if (item.isFuture) return;
                          setCurrentDate(item.date);
                          setShowCalendarModal(false);
                        }}
                        className={`h-8 rounded-xl flex items-center justify-center font-semibold transition-all ${item.isFuture ? "opacity-25 cursor-not-allowed" : item.isSelected ? "bg-[#10b981] text-white font-bold shadow-md shadow-[#10b981]/40 scale-105" : item.isToday ? "border border-[#10b981] text-[#10b981] bg-[#10b981]/10" : `hover:opacity-70 ${theme.text}`}`}
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
                  disabled={isAddingFood || journalLoading}
                  className="w-full py-3.5 bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] text-white font-bold rounded-2xl text-xs shadow-lg shadow-[#10b981]/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isAddingFood
                    ? "Đang lưu món ăn..."
                    : "Xác nhận thêm vào Bữa ăn"}
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
                  onClick={handleAddCustomFood}
                  disabled={isSavingCustomFood || journalLoading}
                  className="w-full mt-4 bg-[#10b981] hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl text-xs shadow-lg shadow-[#10b981]/25 transition-all"
                >
                  {isSavingCustomFood ? "Đang lưu..." : "Thêm ngay"}
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
                  onSubmit={async (e) => {
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

                    try {
                      if (!session?.user?.id) {
                        throw new Error("Bạn chưa đăng nhập.");
                      }

                      const { error } = await supabase.from("profiles").upsert(
                        {
                          id: session.user.id,
                          name: newProf.name,
                          gender: newProf.gender,
                          age: newProf.age,
                          height: newProf.height,
                          weight: newProf.weight,
                          medical: newProf.medical,
                          bmi: Number(newProf.bmi),
                          bmr: newProf.bmr,
                          target_calo: newProf.targetCalo,
                          water_target: newProf.waterTarget,
                          macro_split: newProf.macroSplit,
                        },
                        { onConflict: "id" },
                      );

                      if (error) throw error;

                      localStorage.setItem(
                        "cleanbite_profile",
                        JSON.stringify(newProf),
                      );

                      setProfile(newProf);
                      setShowOnboarding(false);
                    } catch (error) {
                      console.error("Lỗi lưu hồ sơ:", error);
                      alert(
                        `Chưa lưu được hồ sơ lên Supabase: ${error.message}`,
                      );
                    }
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
                      defaultValue={
                        session?.user?.user_metadata?.name ||
                        profile?.name ||
                        ""
                      }
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
                      defaultValue={
                        session?.user?.email || profile?.email || ""
                      }
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
