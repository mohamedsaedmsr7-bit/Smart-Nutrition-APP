import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Printer, X, Check, User, 
  Sun, Moon, Info, Layout, GripVertical, Lock
} from 'lucide-react';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========== FOOD DATABASE ==========
const FOOD_DATABASE = [
  // --- CARB SOURCES ---
  { id: 101, name: "White Rice - أرز أبيض", category: "Carb", state: "Raw", carbs: 78.0, protein: 7.0, fat: 0.6, calories: 360.0 },
  { id: 102, name: "Cooked White Rice - أرز أبيض مطبوخ", category: "Carb", state: "Cooked", carbs: 28.0, protein: 2.7, fat: 0.3, calories: 130.0 },
  { id: 103, name: "Brown Rice - أرز بني", category: "Carb", state: "Raw", carbs: 77.0, protein: 7.5, fat: 2.7, calories: 370.0 },
  { id: 104, name: "Cooked Brown Rice - أرز بني مطبوخ", category: "Carb", state: "Cooked", carbs: 23.0, protein: 2.6, fat: 0.9, calories: 112.0 },
  { id: 105, name: "White Pasta - مكرونة بيضاء", category: "Carb", state: "Raw", carbs: 75.0, protein: 13.0, fat: 1.5, calories: 370.0 },
  { id: 106, name: "Boiled White Pasta - مكرونة مسلوقة", category: "Carb", state: "Cooked", carbs: 25.0, protein: 5.0, fat: 1.0, calories: 130.0 },
  { id: 108, name: "Baladi Bread - خبز بلدي", category: "Carb", state: "Ready", carbs: 55.0, protein: 9.0, fat: 1.0, calories: 280.0 },
  { id: 109, name: "Shami Bread - خبز شامي", category: "Carb", state: "Ready", carbs: 56.0, protein: 8.0, fat: 1.0, calories: 275.0 },
  { id: 112, name: "Oats - شوفان", category: "Carb", state: "Raw", carbs: 66.0, protein: 17.0, fat: 7.0, calories: 389.0 },
  { id: 116, name: "Potatoes - بطاطس", category: "Carb", state: "Raw", carbs: 17.0, protein: 2.0, fat: 0.1, calories: 77.0 },
  { id: 117, name: "Boiled Potatoes - بطاطس مسلوقة", category: "Carb", state: "Boiled", carbs: 20.0, protein: 2.0, fat: 0.1, calories: 87.0 },
  { id: 119, name: "Sweet Potato - بطاطا حلوة", category: "Carb", state: "Raw", carbs: 20.0, protein: 1.6, fat: 0.1, calories: 86.0 },
  { id: 120, name: "Baked Sweet Potato - بطاطا حلوة مشوية", category: "Carb", state: "Baked", carbs: 24.0, protein: 2.0, fat: 0.1, calories: 105.0 },
  { id: 122, name: "Bulgur cooked - برغل مطبوخ", category: "Carb", state: "Cooked", carbs: 19, protein: 3, fat: 0.25, calories: 85 },
  { id: 123, name: "Bulgur - برغل", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat: 1.3, calories: 342 },
  { id: 124, name: "Freekeh cooked - فريك مطبوخ", category: "Carb", state: "Cooked", carbs: 19, protein: 6, fat: 0.5, calories: 150 },
  { id: 125, name: "Freekeh - فريك", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat: 1.5, calories: 340 },
  { id: 126, name: "Burgur - برغل", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat: 1.3, calories: 342 },
  { id: 127, name: "Burgur Cooked - برغل مطبوخ", category: "Carb", state: "Cooked", carbs: 19, protein: 3, fat: 0.25, calories: 85 },
  { id: 128, name: "Basmati Rice - أرز بسمتي", category: "Carb", state: "Raw", carbs: 77, protein: 8.5, fat: 0.5, calories: 350 },
  { id: 129, name: "Basmati Rice Cooked - أرز بسمتي مطبوخ", category: "Carb", state: "Cooked", carbs: 25, protein: 3, fat: 0.2, calories: 120 },

  // --- PROTEIN SOURCES ---
  { id: 201, name: "Raw Chicken Breast - صدور دجاج نية", category: "Protein", state: "Raw", carbs: 0, protein: 23, fat: 1, calories: 120 },
  { id: 202, name: "Grilled Chicken Breast - صدور دجاج مشوية", category: "Protein", state: "Grilled", carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 208, name: "Raw Lean Beef - لحم بقري صافي ني", category: "Protein", state: "Raw", carbs: 0, protein: 26, fat: 10, calories: 200 },
  { id: 209, name: "Cooked Lean Beef - لحم بقري صافي مطبوخ", category: "Protein", state: "Cooked", carbs: 0, protein: 30, fat: 12, calories: 250 },
  { id: 211, name: "Grilled Kofta - كفتة مشوية", category: "Protein", state: "Grilled", carbs: 5, protein: 25, fat: 20, calories: 300 },
  { id: 215, name: "Boiled Eggs - بيض مسلوق", category: "Protein", state: "Boiled", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 217, name: "1 Whole Egg - بيضة كاملة واحدة", category: "Protein", state: "1 Egg", carbs: 0.3, protein: 8, fat: 6, calories: 75 },
  { id: 218, name: "Canned Tuna (Water) - تونة معلبة (ماء)", category: "Protein", state: "Canned", carbs: 0, protein: 25, fat: 1, calories: 116 },
  { id: 227, name: "Cottage Cheese - جبنة قريش", category: "Protein", state: "Low Fat", carbs: 3, protein: 11, fat: 4, calories: 98 },
  { id: 228, name: "Cooked Fava Beans - فول مدمس", category: "Protein/Legume", state: "Cooked", carbs: 19, protein: 9, fat: 0.4, calories: 110 },
  
  // --- MINCED MEAT & BURGERS (Requested) ---
  { id: 232, name: "Lean Minced Beef - لحمة مفرومة صافي", category: "Protein", state: "Raw", carbs: 0, protein: 24, fat: 2, calories: 120 },
  { id: 233, name: "Minced Beef (5% Fat) - لحمة مفرومة 5% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 22, fat: 5, calories: 137 },
  { id: 234, name: "Minced Beef (10% Fat) - لحمة مفرومة 10% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 20, fat: 10, calories: 176 },
  { id: 235, name: "Beef Burger (10% Fat) - برجر بقري 10% دهون", category: "Protein", state: "Raw", carbs: 1, protein: 19, fat: 10, calories: 180 },
  { id: 236, name: "Grilled Lean Minced - مفروم صافي مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 30, fat: 3, calories: 160 },
  { id: 237, name: "Grilled Minced (5% Fat) - مفروم 5% دهون مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 28, fat: 7, calories: 185 },
  { id: 238, name: "Grilled Beef Burger - برجر مشوي", category: "Protein", state: "Grilled", carbs: 1.5, protein: 24, fat: 12, calories: 225 },

  // --- FAT SOURCES ---
  { id: 301, name: "Olive Oil - زيت زيتون", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 305, name: "Ghee (Samna Baladi) - سمن بلدي", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 900 },
  { id: 401, name: "Almonds - لوز", category: "Fat/Nut", state: "Raw", carbs: 22, protein: 21, fat: 50, calories: 579 },
  { id: 402, name: "Peanuts - سوداني", category: "Fat/Nut", state: "Raw", carbs: 16, protein: 26, fat: 49, calories: 567 },
  
  // --- FRUITS & VEGGIES ---
  { id: 501, name: "Apple - تفاح", category: "Fruit", state: "Raw", carbs: 14, protein: 0.3, fat: 0.2, calories: 52 },
  { id: 502, name: "Banana - موز", category: "Fruit", state: "Raw", carbs: 23, protein: 1.1, fat: 0.3, calories: 96 },
  { id: 635, name: "Green Salad - سلطة خضراء", category: "Vegetable", state: "Ready", carbs: 4, protein: 1, fat: 0.2, calories: 20 },
];

// --- Types ---
interface FoodItem {
  id: number;
  name: string;
  category: string;
  state: string;
  carbs: number;
  protein: number;
  fat: number;
  calories: number;
  grams: number;
  instId: string;
}

interface Meal {
  id: string;
  name: string;
  notes: string;
  items: FoodItem[];
}

interface TargetMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionPro() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [meals, setMeals] = useState<Meal[]>([
    { id: 'meal-1', name: "الوجبة الأولى", notes: "", items: [] },
    { id: 'meal-2', name: "الوجبة الثانية", notes: "", items: [] }
  ]);
  const [clientData, setClientData] = useState({ 
    name: '', goal: '', coach: 'C/ Mohamed Saed', phone: '01022816320', date: new Date().toISOString().split('T')[0],
    systemNotes: "يرجى الالتزام بالكميات المحددة.\nشرب 3-4 لتر ماء يومياً.\nالنوم لمدة 7-8 ساعات."
  });
  const [targetMacros, setTargetMacros] = useState<TargetMacros>({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFoods, setSelectedFoods] = useState<Set<number>>(new Set());

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") {
      setIsLoggedIn(true);
    } else {
      alert("كلمة مرور خاطئة!");
    }
  };

  const filteredFoods = useMemo(() => {
    let list = FOOD_DATABASE;
    if (selectedCategory !== "All") list = list.filter(f => f.category.includes(selectedCategory));
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter(f => f.name.toLowerCase().includes(q) || f.name.includes(searchTerm));
    }
    return list;
  }, [searchTerm, selectedCategory]);

  const toggleFoodSelection = (id: number) => {
    const next = new Set(selectedFoods);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedFoods(next);
  };

  const addSelectedFoods = () => {
    if (!activeMealId) return;
    const itemsToAdd = FOOD_DATABASE.filter(f => selectedFoods.has(f.id)).map(f => ({
      ...f,
      grams: 100,
      instId: `${f.id}-${Math.random()}`
    }));
    setMeals(meals.map(m => m.id === activeMealId ? { ...m, items: [...m.items, ...itemsToAdd] } : m));
    setIsModalOpen(false);
    setSelectedFoods(new Set());
  };

  const totals = meals.reduce((acc, meal) => {
    meal.items.forEach(it => {
      const r = it.grams / 100;
      acc.calories += it.calories * r;
      acc.protein += it.protein * r;
      acc.carbs += it.carbs * r;
      acc.fat += it.fat * r;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4" dir="rtl">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] shadow-2xl text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-600/30">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-white mb-2">تسجيل الدخول</h2>
          <p className="text-neutral-500 text-sm mb-8 font-bold">ادخل كلمة المرور للوصول للنظام</p>
          <input 
            type="password" 
            className="w-full bg-black border border-neutral-800 p-4 rounded-2xl text-center text-white mb-4 outline-none focus:border-blue-600 transition-all font-bold tracking-[0.5em]"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
          />
          <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all active:scale-95 shadow-xl shadow-blue-600/20">دخول</button>
        </form>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen pb-20 transition-colors", theme === 'dark' ? "bg-black text-white" : "bg-gray-50 text-black")} dir="rtl">
      {/* PRINT HEADER */}
      <div className="hidden print:block p-8 border-b-8 border-blue-600 bg-white text-black">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-5xl font-black text-blue-600">نظام غذائي متطور</h1>
            <p className="text-xl font-bold text-gray-400 mt-2">Personalized Strategy</p>
          </div>
          <div className="text-left font-black">
            <p className="text-2xl">{clientData.coach}</p>
            <p className="text-blue-600 font-mono">{clientData.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 mb-8">
          <div><span className="text-[10px] text-gray-400 font-black uppercase">العميل</span><p className="text-lg font-black">{clientData.name || '---'}</p></div>
          <div><span className="text-[10px] text-gray-400 font-black uppercase">الهدف</span><p className="text-lg font-black">{clientData.goal || '---'}</p></div>
          <div><span className="text-[10px] text-gray-400 font-black uppercase">التاريخ</span><p className="text-lg font-black">{clientData.date}</p></div>
          <div><span className="text-[10px] text-gray-400 font-black uppercase">الإجمالي</span><p className="text-lg font-black text-blue-600">{Math.round(totals.calories)} سعرة</p></div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 print:p-0">
        <header className="flex justify-between items-center mb-8 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg"><Layout size={20} className="text-white"/></div>
            <h1 className="text-xl font-black uppercase tracking-tighter">برو نيوتريشن</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-blue-400"/>}
            </button>
            <button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-black flex items-center gap-2 shadow-lg shadow-blue-600/20">
              <Printer size={18}/> استخراج PDF
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6 print:hidden">
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-[2rem] space-y-4">
              <h3 className="font-black text-blue-500 flex items-center gap-2 mb-4"><User size={18}/> بيانات العميل</h3>
              <InputGroup label="اسم العميل" value={clientData.name} onChange={v => setClientData({...clientData, name: v})} />
              <InputGroup label="الهدف" value={clientData.goal} onChange={v => setClientData({...clientData, goal: v})} />
              <div>
                <label className="text-[10px] font-black opacity-40 uppercase mr-1">ملاحظات النظام العامة</label>
                <textarea 
                  className="w-full bg-black border border-neutral-800 p-4 mt-1 rounded-2xl font-bold text-xs h-32 resize-none focus:border-blue-600 transition-all"
                  value={clientData.systemNotes}
                  onChange={e => setClientData({...clientData, systemNotes: e.target.value})}
                  placeholder="اكتب التعليمات العامة هنا..."
                />
              </div>
            </div>

            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-[2rem]">
              <h3 className="font-black text-emerald-500 flex items-center gap-2 mb-6"><Info size={18}/> حالة الماكروز</h3>
              <div className="space-y-6">
                <ProgressBar label="السعرات" current={totals.calories} target={targetMacros.calories} unit="kcal" color="bg-orange-500" />
                <ProgressBar label="البروتين" current={totals.protein} target={targetMacros.protein} unit="g" color="bg-red-500" />
                <ProgressBar label="الكارب" current={totals.carbs} target={targetMacros.carbs} unit="g" color="bg-blue-500" />
                <ProgressBar label="الدهون" current={totals.fat} target={targetMacros.fat} unit="g" color="bg-yellow-500" />
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-8">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => {
              const {active, over} = e;
              if (over && active.id !== over.id) {
                const oldIndex = meals.findIndex(m => m.id === active.id);
                const newIndex = meals.findIndex(m => m.id === over.id);
                setMeals(arrayMove(meals, oldIndex, newIndex));
              }
            }}>
              <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                {meals.map(meal => (
                  <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    onUpdate={updated => setMeals(meals.map(m => m.id === meal.id ? updated : m))}
                    onAddItems={() => { setActiveMealId(meal.id); setIsModalOpen(true); }}
                    onRemove={() => setMeals(meals.filter(m => m.id !== meal.id))}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <button onClick={() => setMeals([...meals, { id: `meal-${Date.now()}`, name: `وجبة ${meals.length+1}`, items: [], notes: "" }])} className="w-full py-8 border-2 border-dashed border-neutral-800 rounded-[2.5rem] flex items-center justify-center gap-2 hover:bg-blue-600/5 transition-all group print:hidden">
              <div className="p-2 bg-neutral-800 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-all"><Plus size={24}/></div>
              <span className="font-black">إضافة وجبة جديدة</span>
            </button>

            {/* PRINT FOOTER - MOLA7AZAT */}
            <div className="hidden print:block mt-20 pt-10 border-t-4 border-gray-100">
              <h4 className="text-2xl font-black text-blue-600 mb-6">ملاحظات النظام والتعليمات:</h4>
              <div className="bg-gray-50 p-8 rounded-[2.5rem] border-2 border-gray-100 text-lg font-bold leading-relaxed whitespace-pre-line text-gray-800 shadow-sm">
                {clientData.systemNotes}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* SEARCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-3xl max-h-[85vh] bg-neutral-900 border border-neutral-800 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
            <div className="p-8 flex justify-between items-center border-b border-neutral-800">
              <div>
                <h2 className="text-2xl font-black">قائمة الطعام الذكية</h2>
                <p className="text-xs text-neutral-500 font-bold mt-1">اختر الأصناف المراد إضافتها ({selectedFoods.size})</p>
              </div>
              <button onClick={() => { setIsModalOpen(false); setSelectedFoods(new Set()); }} className="p-3 hover:bg-neutral-800 rounded-2xl transition-all">
                <X size={24}/>
              </button>
            </div>
            <div className="p-8 pb-4 space-y-4">
              <div className="relative">
                <Search size={20} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" />
                <input className="w-full bg-black border border-neutral-800 p-4 pr-12 rounded-2xl font-bold outline-none focus:border-blue-600" placeholder="ابحث عن الصنف..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {["All", "Carb", "Protein", "Fat", "Fruit", "Vegetable"].map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-5 py-2 rounded-xl text-xs font-black whitespace-nowrap border transition-all", selectedCategory === cat ? "bg-blue-600 border-blue-600" : "bg-neutral-800 border-neutral-700")}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-8 pb-4 space-y-3">
              {filteredFoods.map(f => {
                const isSelected = selectedFoods.has(f.id);
                return (
                  <div 
                    key={f.id} 
                    onClick={() => toggleFoodSelection(f.id)} 
                    className={cn(
                      "flex justify-between items-center p-5 border rounded-2xl cursor-pointer transition-all",
                      isSelected ? "bg-blue-600/10 border-blue-600" : "bg-neutral-800/50 border-neutral-800 hover:border-neutral-700"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-6 h-6 rounded-lg flex items-center justify-center border", isSelected ? "bg-blue-600 border-blue-600" : "border-neutral-700")}>
                        {isSelected && <Check size={14} className="text-white font-bold" />}
                      </div>
                      <div>
                        <p className="font-black">{f.name}</p>
                        <p className="text-[10px] text-neutral-500 font-bold uppercase">{f.category} • {f.state}</p>
                      </div>
                    </div>
                    <div className="flex gap-3 text-[10px] font-black">
                      <span className="text-orange-500">{f.calories} kcal</span>
                      <span className="text-red-500">P:{f.protein}g</span>
                      <span className="text-blue-500">C:{f.carbs}g</span>
                      <span className="text-yellow-500">F:{f.fat}g</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {selectedFoods.size > 0 && (
              <div className="p-8 border-t border-neutral-800 bg-neutral-900">
                <button 
                  onClick={addSelectedFoods}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3"
                >
                  إضافة {selectedFoods.size} أصناف للوجبة
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MealCard({ meal, onUpdate, onAddItems, onRemove }: { meal: Meal, onUpdate: (m: Meal) => void, onAddItems: () => void, onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: meal.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const mTotals = meal.items.reduce((acc, it) => {
    const r = it.grams / 100;
    acc.cal += it.calories * r;
    acc.pro += it.protein * r;
    acc.carb += it.carbs * r;
    acc.fat += it.fat * r;
    return acc;
  }, { cal: 0, pro: 0, carb: 0, fat: 0 });

  return (
    <div ref={setNodeRef} style={style} className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] overflow-hidden print:border-gray-200 print:bg-white print:text-black print:rounded-[3rem] print:mb-16 print:break-inside-avoid">
      <div className="p-6 bg-neutral-800/30 border-b border-neutral-800 flex justify-between items-center print:bg-gray-50 print:border-gray-100">
        <div className="flex items-center gap-4 flex-1">
          <button {...attributes} {...listeners} className="p-2 text-neutral-600 print:hidden cursor-grab"><GripVertical size={18}/></button>
          <input className="bg-transparent text-2xl font-black outline-none focus:text-blue-600 w-full print:hidden" value={meal.name} onChange={e => onUpdate({ ...meal, name: e.target.value })} />
          <h2 className="hidden print:block text-5xl font-black text-[#0000FF] py-3 leading-tight tracking-tight">{meal.name}</h2>
        </div>
        <div className="flex gap-2 mr-4">
          <div className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-full print:text-lg print:bg-transparent print:text-blue-600 print:px-0">{Math.round(mTotals.cal)} kcal</div>
          <div className="hidden print:flex gap-4 text-sm font-black text-gray-400 border-r pr-4 mr-2 border-gray-200">
            <span>P: {Math.round(mTotals.pro)}g</span>
            <span>C: {Math.round(mTotals.carb)}g</span>
            <span>F: {Math.round(mTotals.fat)}g</span>
          </div>
          <div className="flex gap-1 print:hidden">
            <div className="text-[9px] font-black bg-red-500/10 text-red-500 px-2.5 py-1 rounded-lg">P: {Math.round(mTotals.pro)}g</div>
            <div className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-2.5 py-1 rounded-lg">C: {Math.round(mTotals.carb)}g</div>
            <div className="text-[9px] font-black bg-yellow-500/10 text-yellow-500 px-2.5 py-1 rounded-lg">F: {Math.round(mTotals.fat)}g</div>
          </div>
          <button onClick={onRemove} className="p-2 text-neutral-600 hover:text-red-500 print:hidden"><Trash2 size={18}/></button>
        </div>
      </div>
      
      <div className="p-6">
        {meal.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-separate border-spacing-y-2">
              <thead>
                <tr className="text-[10px] uppercase font-black text-neutral-500">
                  <th className="pb-2 pr-4">الصنف</th>
                  <th className="pb-2 text-center">الكمية (جم)</th>
                  <th className="pb-2 text-center">بروتين</th>
                  <th className="pb-2 text-center">كارب</th>
                  <th className="pb-2 text-center">دهون</th>
                  <th className="pb-2 text-center">سعرات</th>
                  <th className="pb-2 print:hidden"></th>
                </tr>
              </thead>
              <tbody className="space-y-1">
                {meal.items.map(it => (
                  <tr key={it.instId} className="bg-black/20 hover:bg-neutral-800 transition-all rounded-2xl print:bg-gray-50/50">
                    <td className="py-4 pr-4 rounded-r-2xl">
                      <p className="font-bold text-sm">{it.name}</p>
                      <p className="text-[10px] opacity-40 font-bold uppercase">{it.category} • {it.state}</p>
                    </td>
                    <td className="py-4 text-center">
                      <input type="number" className="w-16 bg-black border border-neutral-800 p-2 rounded-xl text-center text-xs font-black print:hidden" value={it.grams} onChange={e => onUpdate({ ...meal, items: meal.items.map(i => i.instId === it.instId ? { ...i, grams: parseFloat(e.target.value) || 0 } : i) })} />
                      <span className="hidden print:inline font-black text-sm">{it.grams} جم</span>
                    </td>
                    <td className="py-4 text-center text-xs font-bold text-red-500">{Math.round(it.protein * it.grams/100)}g</td>
                    <td className="py-4 text-center text-xs font-bold text-blue-500">{Math.round(it.carbs * it.grams/100)}g</td>
                    <td className="py-4 text-center text-xs font-bold text-yellow-500">{Math.round(it.fat * it.grams/100)}g</td>
                    <td className="py-4 text-center text-sm font-black text-blue-600">{Math.round(it.calories * it.grams/100)}</td>
                    <td className="py-4 text-center rounded-l-2xl print:hidden">
                      <button onClick={() => onUpdate({ ...meal, items: meal.items.filter(i => i.instId !== it.instId) })} className="text-neutral-600 hover:text-red-500"><X size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 opacity-30 print:hidden"><p className="text-sm font-bold">أضف أصناف لهذه الوجبة</p></div>
        )}
        
        <div className="mt-6 flex gap-4 items-end">
          <div className="flex-1">
            <p className="text-[10px] font-black text-neutral-500 mb-2 uppercase mr-1">ملاحظات الوجبة</p>
            <textarea className="w-full bg-black/40 border border-neutral-800 p-4 rounded-2xl text-xs font-bold h-16 resize-none focus:border-blue-600 transition-all print:border-none print:p-0 print:h-auto print:italic" placeholder="مثال: تناول الفيتامينات مع هذه الوجبة..." value={meal.notes} onChange={e => onUpdate({ ...meal, notes: e.target.value })} />
          </div>
          <button onClick={onAddItems} className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl print:hidden"><Plus size={20}/></button>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-black opacity-40 uppercase mr-1">{label}</label>
      <input className="w-full bg-black border border-neutral-800 p-4 mt-1 rounded-2xl font-bold text-sm outline-none focus:border-blue-600 transition-all" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function ProgressBar({ label, current, target, unit, color }: any) {
  const percentage = Math.min((current / target) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-black uppercase opacity-60">{label}</span>
        <span className="text-sm font-black">{Math.round(current)} <span className="opacity-40 text-[10px]">{unit} / {target}</span></span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div className={cn("h-full transition-all duration-500", color)} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
