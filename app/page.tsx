"use client";
"use client";

import { useState, useMemo, useCallback } from "react";

// ========== قاعدة بيانات الأكل المحدثة من الجدول ==========
const FOOD_DB = [
  // 🍚 نشويات (CARB SOURCES)
  { id: "cwr", name: "أرز أبيض مطبوخ", cat: "نشويات", cal: 130, p: 2.7, c: 28.2, f: 0.3 },
  { id: "rwr", name: "أرز أبيض (نيء)", cat: "نشويات", cal: 360, p: 6.5, c: 79, f: 0.6 },
  { id: "cbr", name: "أرز بني مطبوخ", cat: "نشويات", cal: 112, p: 2.3, c: 23.5, f: 0.8 },
  { id: "bpa", name: "مكرونة مسلوقة", cat: "نشويات", cal: 130, p: 5, c: 25, f: 1.1 },
  { id: "rpa", name: "مكرونة (نيئة)", cat: "نشويات", cal: 350, p: 13, c: 70, f: 1.5 },
  { id: "coa", name: "شوفان مطبوخ", cat: "نشويات", cal: 70, p: 2.5, c: 12, f: 1.5 },
  { id: "roa", name: "شوفان (خام/نيء)", cat: "نشويات", cal: 380, p: 13, c: 67, f: 7 },
  { id: "bpo", name: "بطاطس مسلوقة", cat: "نشويات", cal: 87, p: 1.9, c: 20, f: 0.1 },
  { id: "rpo", name: "بطاطس (نيئة)", cat: "نشويات", cal: 77, p: 2, c: 17, f: 0.1 },
  { id: "swp", name: "بطاطا حلوة مشوية", cat: "نشويات", cal: 105, p: 2, c: 24, f: 0.1 },

  // 🥗 بقوليات (LEGUMES) - تعامل كنشويات في الحسابات
  { id: "len_c", name: "عدس مطبوخ", cat: "بقوليات", cal: 116, p: 9, c: 20, f: 0.4 },
  { id: "len_d", name: "عدس (جاف)", cat: "بقوليات", cal: 350, p: 24, c: 63, f: 1 },
  { id: "chk_c", name: "حمص مسلوق", cat: "بقوليات", cal: 164, p: 8.9, c: 27, f: 2.6 },
  { id: "fav_c", name: "فول مدمس", cat: "بقوليات", cal: 110, p: 8, c: 20, f: 0.5 },
  { id: "kid_c", name: "فاصوليا حمراء مطبوخة", cat: "بقوليات", cal: 127, p: 8.7, c: 22.8, f: 0.5 },
  { id: "lup_c", name: "ترمس مسلوق", cat: "بقوليات", cal: 119, p: 15.6, c: 9.9, f: 2.9 },

  // 🍗 بروتين (PROTEIN SOURCES)
  { id: "gch", name: "صدور دجاج مشوية", cat: "بروتين", cal: 165, p: 31, c: 0, f: 3.6 },
  { id: "rch", name: "صدور دجاج (نيئة)", cat: "بروتين", cal: 120, p: 23, c: 0, f: 2.5 },
  { id: "lbf_c", name: "لحم بقري صافي مطبوخ", cat: "بروتين", cal: 250, p: 26, c: 0, f: 15 },
  { id: "liv_c", name: "كبدة مطبوخة", cat: "بروتين", cal: 175, p: 26, c: 4, f: 5 },
  { id: "tun_w", name: "تونة معلبة (ماء)", cat: "بروتين", cal: 116, p: 26, c: 0, f: 1 },

  // 🥛 ألبان وأجبان (DAIRY)
  { id: "cot", name: "جبنة قريش", cat: "ألبان وأجبان", cal: 98, p: 11, c: 3.4, f: 4.3 },
  { id: "fmk", name: "حليب كامل الدسم", cat: "ألبان وأجبان", cal: 61, p: 3.2, c: 4.8, f: 3.3 },
  { id: "yog", name: "زبادي عادي", cat: "ألبان وأجبان", cal: 60, p: 3.5, c: 4.7, f: 3.3 },
  { id: "moz_l", name: "موتزاريلّا لايت", cat: "ألبان وأجبان", cal: 160, p: 24, c: 2, f: 7 },

  // 🍎 فواكه (FRUITS)
  { id: "app", name: "تفاح", cat: "فواكه", cal: 52, p: 0.3, c: 14, f: 0.2 },
  { id: "ban", name: "موز", cat: "فواكه", cal: 96, p: 1.1, c: 23, f: 0.3 },
  { id: "org", name: "برتقال", cat: "فواكه", cal: 47, p: 0.9, c: 12, f: 0.1 },
  { id: "man", name: "مانجو", cat: "فواكه", cal: 60, p: 0.8, c: 15, f: 0.4 },

  // 🧈 دهون (FAT SOURCES)
  { id: "oli", name: "زيت زيتون", cat: "دهون", cal: 884, p: 0, c: 0, f: 100 },
  { id: "tah", name: "طحينة", cat: "دهون", cal: 595, p: 17, c: 21, f: 54 },
  { id: "alm", name: "لوز", cat: "دهون", cal: 579, p: 21, c: 22, f: 50 },
  { id: "pea", name: "سوداني", cat: "دهون", cal: 567, p: 26, c: 16, f: 49 },
  { id: "avo", name: "أفوكادو", cat: "دهون", cal: 160, p: 2, c: 9, f: 15 },
];

const CATS = ["الكل", ...new Set(FOOD_DB.map(f => f.cat))];

// ========== ثوابت ==========
const C = {
  bg:     "#0f1117",
  side:   "#0a0d13",
  card:   "#161b27",
  card2:  "#1c2333",
  border: "#242d42",
  neon:   "#00d4ff",
  green:  "#00ff9d",
  orange: "#ff8c42",
  red:    "#ff4d6d",
  purple: "#b388ff",
  text:   "#e2e8f0",
  sub:    "#64748b",
  muted:  "#334155",
};

const MACRO_COLORS = { p: C.neon, c: C.orange, f: C.purple, cal: C.green };

// ========== أدوات ==========
const calcMacros = (items) => items.reduce(
  (acc, item) => {
    const m = item.grams / 100;
    return {
      cal: acc.cal + item.food.cal * m,
      p:   acc.p   + item.food.p   * m,
      c:   acc.c   + item.food.c   * m,
      f:   acc.f   + item.food.f   * m,
    };
  },
  { cal: 0, p: 0, c: 0, f: 0 }
);

const fmt = (n) => Math.round(n * 10) / 10;

// ========== ProgressBar ==========
function MacroBar({ label, value, target, color, unit = "g" }) {
  const pct = target > 0 ? Math.min(100, (value / target) * 100) : 0;
  const over = target > 0 && value > target;
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ color: C.sub, fontSize: "0.72rem", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: "0.72rem", fontWeight: 700, color: over ? C.red : color }}>
          {fmt(value)}{unit} {target > 0 && <span style={{ color: C.muted }}>/ {target}{unit}</span>}
        </span>
      </div>
      <div style={{ height: 5, background: C.muted, borderRadius: 3, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${pct}%`,
          background: over ? C.red : color,
          borderRadius: 3, transition: "width 0.4s ease",
          boxShadow: `0 0 8px ${over ? C.red : color}88`,
        }} />
      </div>
    </div>
  );
}

// ========== MacroSummary ==========
function MacroSummary({ macros, targets, compact = false }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: compact ? 6 : 10 }}>
      {[
        { key: "cal", label: "سعرات", unit: "" },
        { key: "p",   label: "بروتين", unit: "g" },
        { key: "c",   label: "كارب",   unit: "g" },
        { key: "f",   label: "دهون",   unit: "g" },
      ].map(({ key, label, unit }) => (
        <div key={key} style={{
          background: C.card2, borderRadius: 10,
          padding: compact ? "8px 10px" : "12px 14px",
          border: `1px solid ${MACRO_COLORS[key]}22`,
          textAlign: "center",
        }}>
          <div style={{ color: MACRO_COLORS[key], fontWeight: 800, fontSize: compact ? "1rem" : "1.3rem" }}>
            {fmt(macros[key])}<span style={{ fontSize: "0.6rem", marginRight: 2 }}>{unit}</span>
          </div>
          <div style={{ color: C.sub, fontSize: "0.65rem", marginTop: 2 }}>
            {label}{targets && targets[key] > 0 && ` / ${targets[key]}`}
          </div>
          {targets && targets[key] > 0 && (
            <div style={{ marginTop: 4, height: 3, background: C.muted, borderRadius: 2, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${Math.min(100, (macros[key] / targets[key]) * 100)}%`,
                background: macros[key] > targets[key] ? C.red : MACRO_COLORS[key],
                borderRadius: 2,
              }} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ========== FoodPicker ==========
function FoodPicker({ onAdd, onClose }) {
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("الكل");
  const [grams, setGrams] = useState({});

  const filtered = useMemo(() => {
    return FOOD_DB.filter(f => {
      const matchCat = cat === "الكل" || f.cat === cat;
      const matchSearch = !search || f.name.includes(search) || f.cat.includes(search);
      return matchCat && matchSearch;
    });
  }, [search, cat]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000000bb",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: C.card, border: `1px solid ${C.border}`,
        borderRadius: 20, width: "100%", maxWidth: 600,
        maxHeight: "85vh", display: "flex", flexDirection: "column",
        boxShadow: `0 25px 60px #000000aa`,
      }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 10 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            autoFocus
            placeholder="🔍 ابحث عن أكل..."
            style={{
              flex: 1, background: C.card2, border: `1px solid ${C.border}`,
              borderRadius: 10, padding: "8px 14px", color: C.text,
              fontFamily: "inherit", fontSize: "0.88rem", outline: "none",
              direction: "rtl",
            }}
          />
          <button onClick={onClose} style={{
            background: "#ff4d6d22", border: `1px solid ${C.red}44`,
            color: C.red, borderRadius: 10, padding: "8px 14px",
            cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem",
          }}>✕</button>
        </div>

        {/* Category Filter */}
        <div style={{ padding: "10px 20px", display: "flex", gap: 6, flexWrap: "wrap", borderBottom: `1px solid ${C.border}` }}>
          {CATS.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: "4px 12px", borderRadius: 20,
              border: `1px solid ${cat === c ? C.neon : C.border}`,
              background: cat === c ? `${C.neon}18` : "transparent",
              color: cat === c ? C.neon : C.sub,
              cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
            }}>{c}</button>
          ))}
        </div>

        {/* Food List */}
        <div style={{ overflowY: "auto", flex: 1, padding: "10px 20px" }}>
          {filtered.map(food => {
            const g = grams[food.id] || "";
            const preview = g ? calcMacros([{ food, grams: parseFloat(g) || 0 }]) : null;
            return (
              <div key={food.id} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 0", borderBottom: `1px solid ${C.border}22`,
              }}>
                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ color: C.text, fontSize: "0.85rem", fontWeight: 600 }}>{food.name}</div>
                  <div style={{ color: C.sub, fontSize: "0.68rem" }}>{food.en}</div>
                  <div style={{ color: C.muted, fontSize: "0.65rem", marginTop: 1 }}>
                    {food.cal}kcal · P{food.p}g · C{food.c}g · F{food.f}g (لكل 100g)</div>
                  {preview && parseFloat(g) > 0 && (
                    <div style={{ color: C.neon, fontSize: "0.68rem", marginTop: 2 }}>
                      ← {fmt(preview.cal)}kcal · P{fmt(preview.p)}g · C{fmt(preview.c)}g · F{fmt(preview.f)}g
                    </div>
                  )}
                </div>
                {/* Grams Input */}
                <input
                  type="number"
                  min={0}
                  value={g}
                  onChange={e => setGrams(prev => ({ ...prev, [food.id]: e.target.value }))}
                  placeholder="جرام"
                  style={{
                    width: 70, background: C.card2, border: `1px solid ${C.border}`,
                    borderRadius: 8, padding: "6px 8px", color: C.text,
                    fontFamily: "inherit", fontSize: "0.82rem", outline: "none",
                    textAlign: "center",
                  }}
                />
                {/* Add Button */}
                <button
                  onClick={() => {
                    const gr = parseFloat(g);
                    if (gr > 0) {
                      onAdd(food, gr);
                      setGrams(prev => ({ ...prev, [food.id]: "" }));
                    }
                  }}
                  disabled={!g || parseFloat(g) <= 0}
                  style={{
                    background: g && parseFloat(g) > 0 ? `${C.green}22` : "transparent",
                    border: `1px solid ${g && parseFloat(g) > 0 ? C.green : C.border}`,
                    color: g && parseFloat(g) > 0 ? C.green : C.sub,
                    borderRadius: 8, padding: "6px 12px",
                    cursor: g && parseFloat(g) > 0 ? "pointer" : "not-allowed",
                    fontFamily: "inherit", fontSize: "0.8rem",
                  }}>+ إضافة</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ========== MealCard ==========
function MealCard({ meal, onAddFood, onRemoveFood, onRename, onDelete, targets, dragHandleProps, isDragging }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(meal.name);
  const macros = useMemo(() => calcMacros(meal.items), [meal.items]);

  return (
    <div style={{
      background: C.card,
      border: `1px solid ${isDragging ? C.neon + "88" : C.border}`,
      borderRadius: 16, marginBottom: 12, overflow: "hidden",
      opacity: isDragging ? 0.45 : 1,
      boxShadow: isDragging ? `0 0 24px ${C.neon}44` : "none",
      transition: "border-color 0.15s, opacity 0.15s",
    }}>
      {/* Meal Header */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 16px",
        background: `linear-gradient(135deg, ${C.card2}, ${C.card})`,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Drag Handle ⠿ */}
          <div
            {...dragHandleProps}
            title="اسحب لإعادة الترتيب"
            style={{
              cursor: "grab", padding: "4px 5px", borderRadius: 6,
              userSelect: "none", lineHeight: 1, color: C.muted,
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2,
            }}
          >
            {[0,1,2,3,4,5].map(i => (
              <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: C.muted }} />
            ))}
          </div>
          {editing ? (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onBlur={() => { onRename(name); setEditing(false); }}
              onKeyDown={e => e.key === "Enter" && (onRename(name), setEditing(false))}
              autoFocus
              style={{
                background: C.card, border: `1px solid ${C.neon}`,
                borderRadius: 6, padding: "4px 10px", color: C.text,
                fontFamily: "inherit", fontSize: "0.9rem", outline: "none",
                direction: "rtl",
              }}
            />
          ) : (
            <span
              onClick={() => setEditing(true)}
              style={{ color: C.text, fontWeight: 700, fontSize: "0.95rem", cursor: "text" }}
              title="اضغط للتعديل"
            >{meal.name}</span>
          )}
          <span style={{
            background: `${C.neon}18`, color: C.neon,
            padding: "2px 8px", borderRadius: 5, fontSize: "0.65rem", fontWeight: 700,
          }}>{fmt(macros.cal)} kcal</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onAddFood} style={{
            background: `${C.green}15`, border: `1px solid ${C.green}44`,
            color: C.green, borderRadius: 8, padding: "5px 12px",
            cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
          }}>+ أضف أكل</button>
          <button onClick={onDelete} style={{
            background: `${C.red}15`, border: `1px solid ${C.red}33`,
            color: C.red, borderRadius: 8, padding: "5px 10px",
            cursor: "pointer", fontSize: "0.75rem", fontFamily: "inherit",
          }}>🗑</button>
        </div>
      </div>

      {/* Food Items */}
      <div style={{ padding: "0 16px" }}>
        {meal.items.length === 0 ? (
          <div style={{ padding: "16px 0", textAlign: "center", color: C.muted, fontSize: "0.8rem" }}>
            لا يوجد أكل — اضغط "+ أضف أكل"
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.78rem" }}>
            <thead>
              <tr style={{ color: C.sub }}>
                {["الأكل", "جرام", "سعرات", "P", "C", "F", ""].map((h, i) => (
                  <th key={i} style={{ padding: "8px 4px", textAlign: i === 0 ? "right" : "center", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {meal.items.map((item, idx) => {
                const m = calcMacros([item]);
                return (
                  <tr key={idx} style={{ borderTop: `1px solid ${C.border}22` }}>
                    <td style={{ padding: "8px 4px", textAlign: "right" }}>
                      <div style={{ color: C.text }}>{item.food.name}</div>
                      <div style={{ color: C.muted, fontSize: "0.62rem" }}>{item.food.en}</div>
                    </td>
                    <td style={{ padding: "8px 4px", color: C.sub, textAlign: "center" }}>{item.grams}</td>
                    <td style={{ padding: "8px 4px", color: C.green, textAlign: "center", fontWeight: 700 }}>{fmt(m.cal)}</td>
                    <td style={{ padding: "8px 4px", color: C.neon,   textAlign: "center" }}>{fmt(m.p)}</td>
                    <td style={{ padding: "8px 4px", color: C.orange, textAlign: "center" }}>{fmt(m.c)}</td>
                    <td style={{ padding: "8px 4px", color: C.purple, textAlign: "center" }}>{fmt(m.f)}</td>
                    <td style={{ padding: "8px 4px", textAlign: "center" }}>
                      <button onClick={() => onRemoveFood(idx)} style={{
                        background: "transparent", border: "none",
                        color: C.muted, cursor: "pointer", fontSize: "0.8rem",
                        padding: "2px 6px", borderRadius: 4,
                      }}>✕</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: `1px solid ${C.border}` }}>
                <td colSpan={2} style={{ padding: "8px 4px", color: C.sub, fontSize: "0.7rem", textAlign: "right" }}>مجموع الوجبة</td>
                <td style={{ padding: "8px 4px", color: C.green, textAlign: "center", fontWeight: 800 }}>{fmt(macros.cal)}</td>
                <td style={{ padding: "8px 4px", color: C.neon,   textAlign: "center", fontWeight: 700 }}>{fmt(macros.p)}</td>
                <td style={{ padding: "8px 4px", color: C.orange, textAlign: "center", fontWeight: 700 }}>{fmt(macros.c)}</td>
                <td style={{ padding: "8px 4px", color: C.purple, textAlign: "center", fontWeight: 700 }}>{fmt(macros.f)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

// ========== الكومبوننت الرئيسي ==========
const newPlan = (name) => ({
  id: Date.now(),
  name,
  targets: { cal: 2000, p: 150, c: 200, f: 60 },
  meals: [
    { id: 1, name: "فطار", items: [] },
    { id: 2, name: "غداء", items: [] },
    { id: 3, name: "عشاء", items: [] },
  ],
});

export default function App() {
  const [plans, setPlans]       = useState([newPlan("نظام 1")]);
  const [activePlan, setActivePlan] = useState(0);
  const [picker, setPicker]     = useState(null);
  const [editTargets, setEditTargets] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [dragIdx, setDragIdx]   = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const plan = plans[activePlan];

  const updatePlan = useCallback((updater) => {
    setPlans(prev => prev.map((p, i) => i === activePlan ? updater(p) : p));
  }, [activePlan]);

  const totalMacros = useMemo(() =>
    calcMacros(plan.meals.flatMap(m => m.items)),
    [plan.meals]
  );

  const addMeal = () => updatePlan(p => ({
    ...p,
    meals: [...p.meals, { id: Date.now(), name: `وجبة ${p.meals.length + 1}`, items: [] }],
  }));

  const deleteMeal = (mealId) => updatePlan(p => ({
    ...p,
    meals: p.meals.filter(m => m.id !== mealId),
  }));

  const renameMeal = (mealId, name) => updatePlan(p => ({
    ...p,
    meals: p.meals.map(m => m.id === mealId ? { ...m, name } : m),
  }));

  const addFoodToMeal = (mealId, food, grams) => updatePlan(p => ({
    ...p,
    meals: p.meals.map(m => m.id === mealId
      ? { ...m, items: [...m.items, { food, grams }] }
      : m
    ),
  }));

  const removeFoodFromMeal = (mealId, idx) => updatePlan(p => ({
    ...p,
    meals: p.meals.map(m => m.id === mealId
      ? { ...m, items: m.items.filter((_, i) => i !== idx) }
      : m
    ),
  }));

  const reorderMeals = useCallback((fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    updatePlan(p => {
      const meals = [...p.meals];
      const [moved] = meals.splice(fromIdx, 1);
      meals.splice(toIdx, 0, moved);
      return { ...p, meals };
    });
  }, [updatePlan]);

  const updateTarget = (key, val) => updatePlan(p => ({
    ...p,
    targets: { ...p.targets, [key]: parseFloat(val) || 0 },
  }));

  const renamePlan = (name) => updatePlan(p => ({ ...p, name }));

  return (
    <div style={{
      minHeight: "100vh", background: C.bg,
      fontFamily: "'Tajawal', 'Cairo', sans-serif",
      direction: "rtl", color: C.text,
      display: "flex",
    }}>
      {/* ── Sidebar ── */}
      <div style={{
        width: 220, background: C.side,
        borderLeft: `1px solid ${C.border}`,
        display: "flex", flexDirection: "column",
        padding: "20px 0", flexShrink: 0,
        position: "sticky", top: 0, height: "100vh", overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "0 16px 20px", borderBottom: `1px solid ${C.border}` }}>
          <div style={{
            color: C.neon, fontWeight: 900, fontSize: "1.1rem",
            letterSpacing: "-0.02em", lineHeight: 1.2,
          }}>⚡ Nutrition<br/>Planner</div>
          <div style={{ color: C.sub, fontSize: "0.65rem", marginTop: 4 }}>مخطط التغذية الذكي</div>
        </div>

        {/* Plans */}
        <div style={{ padding: "16px 16px 8px" }}>
          <div style={{ color: C.sub, fontSize: "0.65rem", fontWeight: 700, letterSpacing: "0.1em", marginBottom: 8, textTransform: "uppercase" }}>
            الأنظمة
          </div>
          {plans.map((p, i) => (
            <button key={p.id} onClick={() => setActivePlan(i)} style={{
              width: "100%", textAlign: "right", padding: "9px 12px",
              borderRadius: 10, marginBottom: 4,
              background: i === activePlan ? `${C.neon}18` : "transparent",
              border: `1px solid ${i === activePlan ? C.neon + "55" : "transparent"}`,
              color: i === activePlan ? C.neon : C.sub,
              cursor: "pointer", fontFamily: "inherit", fontSize: "0.82rem",
              fontWeight: i === activePlan ? 700 : 400,
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{
                fontSize: "0.6rem",
                color: i === activePlan ? C.neon : C.muted,
              }}>{fmt(calcMacros(p.meals.flatMap(m => m.items)).cal)}kcal</span>
              {p.name}
            </button>
          ))}
          {showNewPlan ? (
            <div style={{ marginTop: 6 }}>
              <input
                value={newPlanName}
                onChange={e => setNewPlanName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter" && newPlanName.trim()) {
                    setPlans(prev => [...prev, newPlan(newPlanName.trim())]);
                    setActivePlan(plans.length);
                    setNewPlanName("");
                    setShowNewPlan(false);
                  }
                }}
                autoFocus
                placeholder="اسم النظام..."
                style={{
                  width: "100%", background: C.card, border: `1px solid ${C.neon}55`,
                  borderRadius: 8, padding: "7px 10px", color: C.text,
                  fontFamily: "inherit", fontSize: "0.8rem", outline: "none",
                  boxSizing: "border-box", direction: "rtl",
                }}
              />
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <button onClick={() => {
                  if (newPlanName.trim()) {
                    setPlans(prev => [...prev, newPlan(newPlanName.trim())]);
                    setActivePlan(plans.length);
                    setNewPlanName("");
                    setShowNewPlan(false);
                  }
                }} style={{
                  flex: 1, background: `${C.green}22`, border: `1px solid ${C.green}44`,
                  color: C.green, borderRadius: 6, padding: "5px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.75rem",
                }}>✓</button>
                <button onClick={() => setShowNewPlan(false)} style={{
                  flex: 1, background: `${C.red}15`, border: `1px solid ${C.red}33`,
                  color: C.red, borderRadius: 6, padding: "5px", cursor: "pointer",
                  fontFamily: "inherit", fontSize: "0.75rem",
                }}>✕</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setShowNewPlan(true)} style={{
              width: "100%", textAlign: "center", padding: "8px",
              background: "transparent", border: `1px dashed ${C.border}`,
              color: C.muted, cursor: "pointer", borderRadius: 8,
              fontFamily: "inherit", fontSize: "0.78rem", marginTop: 4,
            }}>+ نظام جديد</button>
          )}
        </div>

        {/* Delete Plan */}
        {plans.length > 1 && (
          <div style={{ padding: "8px 16px", marginTop: "auto" }}>
            <button onClick={() => {
              setPlans(prev => prev.filter((_, i) => i !== activePlan));
              setActivePlan(Math.max(0, activePlan - 1));
            }} style={{
              width: "100%", background: `${C.red}10`, border: `1px solid ${C.red}22`,
              color: C.red, borderRadius: 8, padding: "7px",
              cursor: "pointer", fontFamily: "inherit", fontSize: "0.75rem",
            }}>🗑 حذف النظام</button>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <div style={{ flex: 1, overflowY: "auto", maxHeight: "100vh" }}>
        {/* Top Bar */}
        <div style={{
          position: "sticky", top: 0, zIndex: 10,
          background: `${C.bg}ee`, backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${C.border}`,
          padding: "14px 24px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <input
              value={plan.name}
              onChange={e => renamePlan(e.target.value)}
              style={{
                background: "transparent", border: "none",
                color: C.text, fontFamily: "inherit",
                fontSize: "1.2rem", fontWeight: 800, outline: "none",
                direction: "rtl", minWidth: 120,
              }}
            />
            <span style={{
              background: `${C.green}18`, color: C.green,
              padding: "3px 10px", borderRadius: 6,
              fontSize: "0.72rem", fontWeight: 700,
            }}>{fmt(totalMacros.cal)} / {plan.targets.cal} kcal</span>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => window.print()} style={{
              background: `${C.purple}18`, border: `1px solid ${C.purple}44`,
              color: C.purple, borderRadius: 8, padding: "6px 14px",
              cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem",
            }}>🖨️ طباعة PDF</button>
            <button onClick={() => setEditTargets(!editTargets)} style={{
              background: editTargets ? `${C.neon}22` : "transparent",
              border: `1px solid ${editTargets ? C.neon : C.border}`,
              color: editTargets ? C.neon : C.sub,
              borderRadius: 8, padding: "6px 14px",
              cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem",
            }}>🎯 الأهداف</button>
            <button onClick={addMeal} style={{
              background: `${C.green}18`, border: `1px solid ${C.green}44`,
              color: C.green, borderRadius: 8, padding: "6px 14px",
              cursor: "pointer", fontFamily: "inherit", fontSize: "0.78rem",
            }}>+ وجبة جديدة</button>
          </div>
        </div>

        <div style={{ padding: "20px 24px" }}>
          {/* Targets Editor */}
          {editTargets && (
            <div style={{
              background: C.card, border: `1px solid ${C.border}`,
              borderRadius: 16, padding: "16px 20px", marginBottom: 20,
            }}>
              <div style={{ color: C.text, fontWeight: 700, marginBottom: 14, fontSize: "0.9rem" }}>
                🎯 أهداف اليوم
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
                {[
                  { key: "cal", label: "سعرات",  unit: "kcal", color: C.green },
                  { key: "p",   label: "بروتين", unit: "g",    color: C.neon },
                  { key: "c",   label: "كارب",   unit: "g",    color: C.orange },
                  { key: "f",   label: "دهون",   unit: "g",    color: C.purple },
                ].map(({ key, label, unit, color }) => (
                  <div key={key}>
                    <div style={{ color: color, fontSize: "0.7rem", fontWeight: 600, marginBottom: 5 }}>
                      {label} ({unit})
                    </div>
                    <input
                      type="number"
                      value={plan.targets[key]}
                      onChange={e => updateTarget(key, e.target.value)}
                      style={{
                        width: "100%", background: C.card2,
                        border: `1px solid ${color}33`, borderRadius: 8,
                        padding: "8px 10px", color: color,
                        fontFamily: "inherit", fontSize: "0.9rem",
                        fontWeight: 700, outline: "none", boxSizing: "border-box",
                        textAlign: "center",
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Summary */}
          <div style={{
            background: C.card, border: `1px solid ${C.border}`,
            borderRadius: 16, padding: "16px 20px", marginBottom: 20,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ color: C.text, fontWeight: 700, fontSize: "0.9rem" }}>📊 ملخص اليوم</span>
              <span style={{ color: C.sub, fontSize: "0.72rem" }}>{plan.meals.length} وجبات</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 14 }}>
              {[
                { key: "cal", label: "سعرات",  unit: "" },
                { key: "p",   label: "بروتين", unit: "g" },
                { key: "c",   label: "كارب",   unit: "g" },
                { key: "f",   label: "دهون",   unit: "g" },
              ].map(({ key, label, unit }) => {
                const val = totalMacros[key];
                const target = plan.targets[key];
                const pct = target > 0 ? Math.min(100, (val / target) * 100) : 0;
                const over = target > 0 && val > target;
                return (
                  <div key={key} style={{
                    background: C.card2, borderRadius: 12, padding: "14px",
                    border: `1px solid ${over ? C.red + "44" : MACRO_COLORS[key] + "22"}`,
                    textAlign: "center",
                  }}>
                    <div style={{ color: over ? C.red : MACRO_COLORS[key], fontWeight: 800, fontSize: "1.4rem" }}>
                      {fmt(val)}<span style={{ fontSize: "0.65rem" }}>{unit}</span>
                    </div>
                    <div style={{ color: C.sub, fontSize: "0.65rem", margin: "3px 0" }}>{label}</div>
                    {target > 0 && (
                      <>
                        <div style={{ color: C.muted, fontSize: "0.62rem" }}>/ {target}{unit}</div>
                        <div style={{ marginTop: 6, height: 4, background: C.muted, borderRadius: 2, overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${pct}%`,
                            background: over ? C.red : MACRO_COLORS[key],
                            borderRadius: 2, transition: "width 0.4s",
                          }} />
                        </div>
                        <div style={{ color: over ? C.red : C.sub, fontSize: "0.62rem", marginTop: 3 }}>
                          {Math.round(pct)}%
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
            {/* Remaining */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { key: "cal", label: "متبقي سعرات" },
                { key: "p",   label: "متبقي بروتين" },
                { key: "c",   label: "متبقي كارب" },
                { key: "f",   label: "متبقي دهون" },
              ].map(({ key, label }) => {
                const rem = plan.targets[key] - totalMacros[key];
                return (
                  <div key={key} style={{
                    background: rem < 0 ? `${C.red}08` : `${MACRO_COLORS[key]}08`,
                    border: `1px solid ${rem < 0 ? C.red : MACRO_COLORS[key]}18`,
                    borderRadius: 8, padding: "7px 10px", textAlign: "center",
                  }}>
                    <div style={{ color: rem < 0 ? C.red : MACRO_COLORS[key], fontWeight: 700, fontSize: "0.85rem" }}>
                      {rem < 0 ? "+" : ""}{fmt(Math.abs(rem))}
                    </div>
                    <div style={{ color: C.sub, fontSize: "0.6rem" }}>{rem < 0 ? "زيادة" : label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Meals */}
          {plan.meals.map((meal, idx) => (
            <div
              key={meal.id}
              draggable
              onDragStart={() => setDragIdx(idx)}
              onDragEnd={() => { setDragIdx(null); setDragOver(null); }}
              onDragOver={e => { e.preventDefault(); setDragOver(idx); }}
              onDrop={e => { e.preventDefault(); reorderMeals(dragIdx, idx); setDragIdx(null); setDragOver(null); }}
              style={{
                outline: dragOver === idx && dragIdx !== idx
                  ? `2px dashed ${C.neon}` : "none",
                borderRadius: 18,
                transition: "outline 0.1s",
              }}
            >
              <MealCard
                meal={meal}
                targets={plan.targets}
                isDragging={dragIdx === idx}
                dragHandleProps={{
                  onMouseDown: e => e.currentTarget.closest("[draggable]").setAttribute("draggable", true),
                }}
                onAddFood={() => setPicker({ mealId: meal.id })}
                onRemoveFood={(i) => removeFoodFromMeal(meal.id, i)}
                onRename={(name) => renameMeal(meal.id, name)}
                onDelete={() => deleteMeal(meal.id)}
              />
            </div>
          ))}

          {plan.meals.length === 0 && (
            <div style={{
              textAlign: "center", padding: "40px 20px",
              color: C.muted, fontSize: "0.85rem",
            }}>
              لا توجد وجبات — اضغط "+ وجبة جديدة" 🍽️
            </div>
          )}
        </div>
      </div>

      {/* ========== Print Layout ========== */}
      <div className="print-only" style={{
        position: "fixed", inset: 0, background: "white",
        zIndex: 9999, padding: "24px 28px",
        fontFamily: "'Tajawal', sans-serif", direction: "rtl",
        color: "#1a1a2e",
      }}>
        {/* Print Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-start",
          borderBottom: "3px solid #0f1117", paddingBottom: 14, marginBottom: 20,
        }}>
          <div>
            <div style={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f1117" }}>
              ⚡ {plan.name}
            </div>
            <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: 3 }}>
              Nutrition Plan — Smart Nutrition Planner
            </div>
          </div>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "0.72rem", color: "#64748b" }}>تاريخ الطباعة</div>
            <div style={{ fontSize: "0.85rem", fontWeight: 700 }}>
              {new Date().toLocaleDateString("ar-EG", { year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>
        </div>

        {/* Daily Targets Summary */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 20,
        }}>
          {[
            { key:"cal", label:"السعرات الكلية", unit:"kcal", color:"#00c853" },
            { key:"p",   label:"بروتين",         unit:"g",    color:"#00b8d4" },
            { key:"c",   label:"كربوهيدرات",     unit:"g",    color:"#ff6d00" },
            { key:"f",   label:"دهون",           unit:"g",    color:"#aa00ff" },
          ].map(({ key, label, unit, color }) => (
            <div key={key} style={{
              border: `2px solid ${color}33`, borderRadius: 10,
              padding: "10px 12px", textAlign: "center",
              background: `${color}08`,
            }}>
              <div style={{ fontSize: "1.4rem", fontWeight: 900, color }}>
                {fmt(totalMacros[key])}<span style={{ fontSize: "0.65rem" }}>{unit}</span>
              </div>
              <div style={{ fontSize: "0.68rem", color: "#64748b", marginTop: 2 }}>{label}</div>
              {plan.targets[key] > 0 && (
                <div style={{ fontSize: "0.65rem", color: "#94a3b8", marginTop: 1 }}>
                  الهدف: {plan.targets[key]}{unit}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Meals */}
        {plan.meals.map((meal, mi) => {
          const mMacros = calcMacros(meal.items);
          return (
            <div key={meal.id} style={{ marginBottom: 16, pageBreakInside: "avoid" }}>
              {/* Meal Title */}
              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#0f1117", color: "white",
                padding: "8px 14px", borderRadius: "8px 8px 0 0",
              }}>
                <span style={{ fontWeight: 800, fontSize: "0.95rem" }}>
                  {mi + 1}. {meal.name}
                </span>
                <span style={{ fontSize: "0.78rem", opacity: 0.8 }}>
                  {fmt(mMacros.cal)} kcal · P{fmt(mMacros.p)}g · C{fmt(mMacros.c)}g · F{fmt(mMacros.f)}g
                </span>
              </div>

              {/* Food Table */}
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem" }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    {["الصنف / Food Item", "الجرام", "سعرات", "بروتين", "كارب", "دهون"].map((h, i) => (
                      <th key={i} style={{
                        padding: "7px 10px", textAlign: i === 0 ? "right" : "center",
                        color: "#475569", fontWeight: 700, fontSize: "0.72rem",
                        borderBottom: "1px solid #e2e8f0",
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {meal.items.map((item, idx) => {
                    const m = calcMacros([item]);
                    return (
                      <tr key={idx} style={{ background: idx % 2 === 0 ? "white" : "#f8fafc" }}>
                        <td style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>
                          <div style={{ fontWeight: 700, color: "#1e293b" }}>{item.food.name}</div>
                          <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{item.food.en}</div>
                        </td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: "#475569", borderBottom: "1px solid #f1f5f9" }}>{item.grams}g</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#00c853", borderBottom: "1px solid #f1f5f9" }}>{fmt(m.cal)}</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: "#00b8d4", borderBottom: "1px solid #f1f5f9" }}>{fmt(m.p)}g</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: "#ff6d00", borderBottom: "1px solid #f1f5f9" }}>{fmt(m.c)}g</td>
                        <td style={{ padding: "8px 10px", textAlign: "center", color: "#aa00ff", borderBottom: "1px solid #f1f5f9" }}>{fmt(m.f)}g</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                    <td colSpan={2} style={{ padding: "8px 10px", fontWeight: 700, color: "#475569", fontSize: "0.75rem" }}>مجموع الوجبة</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 800, color: "#00c853" }}>{fmt(mMacros.cal)}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#00b8d4" }}>{fmt(mMacros.p)}g</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#ff6d00" }}>{fmt(mMacros.c)}g</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", fontWeight: 700, color: "#aa00ff" }}>{fmt(mMacros.f)}g</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          );
        })}

        {/* Footer */}
        <div style={{
          borderTop: "2px solid #e2e8f0", paddingTop: 12, marginTop: 10,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
            ⚡ Smart Nutrition Planner — القيم الغذائية تقريبية
          </div>
          <div style={{ fontSize: "0.68rem", color: "#94a3b8" }}>
            {plan.meals.length} وجبات · {fmt(totalMacros.cal)} kcal إجمالي
          </div>
        </div>
      </div>

      {/* Food Picker Modal */}
      {picker && (
        <FoodPicker
          onAdd={(food, grams) => addFoodToMeal(picker.mealId, food, grams)}
          onClose={() => setPicker(null)}
        />
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; } body { margin: 0; }
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 2px; }
        button:hover { opacity: 0.85; }

        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: #fff !important; margin: 0; }

          /* إخفاء عناصر الواجهة */
          [data-no-print], button, input { display: none !important; }

          /* الـ Sidebar */
          div[style*="width: 220px"] { display: none !important; }

          /* الـ Top Bar الثابت */
          div[style*="position: sticky"] { display: none !important; }

          /* منع فواصل الصفحة داخل الوجبات */
          .meal-card { page-break-inside: avoid; break-inside: avoid; }

          /* تصميم الطباعة */
          div[style*="max-height: 100vh"] {
            overflow: visible !important;
            max-height: none !important;
          }

          /* إخفاء الملخص اليومي الكبير واستخدام نسخة مبسطة */
          .print-hidden { display: none !important; }
          .print-only { display: block !important; }

          /* ألوان الطباعة */
          .print-container {
            padding: 24px !important;
            background: white !important;
            color: #1a1a2e !important;
            font-family: 'Tajawal', sans-serif !important;
            direction: rtl !important;
          }
        }

        .print-only { display: none; }

        @page {
          size: A4;
          margin: 15mm 12mm;
        }
      `}</style>
    </div>
  );
}

      if (meal.id === mealId) {
        const newItem = { ...FOOD_DATABASE[0], grams: 100, instanceId: Date.now() };
        return { ...meal, items: [...meal.items, newItem] };
      }
      return meal;
    }));
  };

  const updateItem = (mealId: number, instanceId: number, field: string, value: any) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return {
          ...meal,
          items: meal.items.map((item: any) => {
            if (item.instanceId === instanceId) {
              if (field === 'id') {
                const food = FOOD_DATABASE.find(f => f.id === parseInt(value));
                return { ...food, grams: item.grams, instanceId };
              }
              return { ...item, [field]: value };
            }
            return item;
          })
        };
      }
      return meal;
    }));
  };

  const removeItem = (mealId: number, instanceId: number) => {
    setMeals(meals.map(meal => {
      if (meal.id === mealId) {
        return { ...meal, items: meal.items.filter((item: any) => item.instanceId !== instanceId) };
      }
      return meal;
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      <div className="max-w-4xl mx-auto">
        
        {/* ملخص النتائج العلوي */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 sticky top-4 z-10 border border-blue-100">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Calculator className="text-blue-600" />
            مخطط التغذية الذكي
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroCard label="السعرات" value={totalMacros.cal} unit="kcal" color="bg-orange-50 text-orange-700" />
            <MacroCard label="البروتين" value={totalMacros.pro} unit="g" color="bg-red-50 text-red-700" />
            <MacroCard label="الكارب" value={totalMacros.carb} unit="g" color="bg-blue-50 text-blue-700" />
            <MacroCard label="الدهون" value={totalMacros.fat} unit="g" color="bg-yellow-50 text-yellow-700" />
          </div>
        </div>

        {/* قائمة الوجبات */}
        <div className="space-y-4">
          {meals.map(meal => (
            <div key={meal.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setMeals(meals.map(m => m.id === meal.id ? {...m, isOpen: !m.isOpen} : m))}
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-gray-700">{meal.name}</h2>
                  <span className="text-sm text-gray-400">({Math.round(calcMacros(meal.items).cal)} سعرة)</span>
                </div>
                {meal.isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
              </div>

              {meal.isOpen && (
                <div className="p-4 border-t border-gray-50 bg-white">
                  <div className="space-y-3">
                    {meal.items.map((item: any) => (
                      <div key={item.instanceId} className="flex flex-wrap md:flex-nowrap items-center gap-3 p-3 bg-gray-50 rounded-lg group">
                        <select 
                          className="flex-1 min-w-[150px] p-2 bg-white border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                          value={item.id}
                          onChange={(e) => updateItem(meal.id, item.instanceId, 'id', e.target.value)}
                        >
                          {FOOD_DATABASE.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>

                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            className="w-20 p-2 bg-white border border-gray-200 rounded-md text-sm text-center"
                            value={item.grams}
                            onChange={(e) => updateItem(meal.id, item.instanceId, 'grams', parseFloat(e.target.value) || 0)}
                          />
                          <span className="text-sm text-gray-500">جرام</span>
                        </div>

                        <button 
                          onClick={() => removeItem(meal.id, item.instanceId)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}

                    <button 
                      onClick={() => addItem(meal.id)}
                      className="w-full py-2 border-2 border-dashed border-gray-200 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                    >
                      <Plus size={18} />
                      إضافة صنف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MacroCard({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div className={`p-4 rounded-xl ${color} flex flex-col items-center justify-center transition-transform hover:scale-105`}>
      <span className="text-xs font-medium mb-1 opacity-80">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold">{Math.round(value)}</span>
        <span className="text-[10px] uppercase font-semibold">{unit}</span>
      </div>
    </div>
  );
}