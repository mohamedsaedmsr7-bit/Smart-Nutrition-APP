"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Calculator, Search, Printer, ArrowUp, ArrowDown, X, Check, Save, Copy, User, Phone, Globe
} from 'lucide-react';

// ========== DATABASE: FOOD DATA + EGYPTIAN ADDITIONS ==========
const FOOD_DATABASE = [
  // مصادر الكربوهيدرات من الملف + إضافات مصرية
  { id: 1, name: "White Rice - أرز أبيض", type: "نشويات", carbs: 78, protein: 7, fat: 0.6, calories: 360 },
  { id: 2, name: "Cooked White Rice - أرز أبيض مطبوخ", type: "نشويات", carbs: 28, protein: 2.7, fat: 0.3, calories: 130 },
  { id: 3, name: "Brown Rice - أرز بني", type: "نشويات", carbs: 77, protein: 7.5, fat: 2.7, calories: 370 },
  { id: 4, name: "White Pasta - مكرونة بيضاء", type: "نشويات", carbs: 75, protein: 13, fat: 1.5, calories: 370 },
  { id: 5, name: "Boiled Pasta - مكرونة مسلوقة", type: "نشويات", carbs: 25, protein: 5, fat: 1, calories: 130 },
  { id: 6, name: "Egyptian Baladi Bread - عيش بلدي", type: "نشويات", carbs: 50, protein: 9, fat: 1.2, calories: 250 },
  { id: 7, name: "Oats - شوفان", type: "نشويات", carbs: 66, protein: 14, fat: 7, calories: 380 },
  { id: 8, name: "Sweet Potato - بطاطا حلوة", type: "نشويات", carbs: 20, protein: 1.6, fat: 0.1, calories: 86 },
  { id: 9, name: "Potato - بطاطس", type: "نشويات", carbs: 17, protein: 2, fat: 0.1, calories: 77 },
  
  // البروتين
  { id: 20, name: "Chicken Breast - صدور دجاج", type: "بروتين", carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 21, name: "Lean Beef - لحم بقري أحمر", type: "بروتين", carbs: 0, protein: 26, fat: 10, calories: 200 },
  { id: 22, name: "Tilapia Fish - سمك بلطي", type: "بروتين", carbs: 0, protein: 20, fat: 1.7, calories: 96 },
  { id: 23, name: "Tuna (Canned in Water) - تونة مصفاة", type: "بروتين", carbs: 0, protein: 25, fat: 1, calories: 116 },
  { id: 24, name: "Whole Egg - بيضة كاملة", type: "بروتين", carbs: 0.6, protein: 6, fat: 5, calories: 78 },
  { id: 25, name: "Egg Whites - بياض بيض", type: "بروتين", carbs: 0.7, protein: 11, fat: 0.2, calories: 52 },
  { id: 26, name: "Quark/Plow Cheese - جبنة قريش", type: "بروتين", carbs: 3, protein: 11, fat: 4, calories: 98 },

  // البقوليات والدهون (إضافات مصرية)
  { id: 40, name: "Fava Beans - فول مدمس", type: "بقوليات", carbs: 20, protein: 8, fat: 0.5, calories: 110 },
  { id: 41, name: "Lentils - عدس مطبوخ", type: "بقوليات", carbs: 20, protein: 9, fat: 0.4, calories: 116 },
  { id: 42, name: "Olive Oil - زيت زيتون", type: "دهون", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 43, name: "Peanut Butter - زبدة فول سوداني", type: "دهون", carbs: 20, protein: 25, fat: 50, calories: 588 },
  { id: 44, name: "Mixed Nuts - مكسرات مشكلة", type: "دهون", carbs: 20, protein: 15, fat: 50, calories: 600 },
  
  // خضروات وفاكهة
  { id: 60, name: "Cucumber - خيار", type: "خضار", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 15 },
  { id: 61, name: "Tomato - طماطم", type: "خضار", carbs: 3.9, protein: 0.9, fat: 0.2, calories: 18 },
  { id: 62, name: "Spinach - سبانخ", type: "خضار", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23 },
];

export default function NutritionPlanner() {
  const [meals, setMeals] = useState([
    { id: 1, name: "الوجبة الأولى", items: [] as any[] },
    { id: 2, name: "الوجبة الثانية", items: [] as any[] }
  ]);
  
  // بيانات العميل والمدرب
  const [clientData, setClientData] = useState({ name: '', weight: '', goal: '', date: new Date().toISOString().split('T')[0] });
  const [language, setLanguage] = useState<'ar' | 'en' | 'both'>('both');
  const [templates, setTemplates] = useState<any[]>([]);
  
  // التحكم في الـ Modal والبحث
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<number | null>(null);
  const [selectedFoods, setSelectedFoods] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // تحصيل القوالب من LocalStorage عند البدء
  useEffect(() => {
    const saved = localStorage.getItem('nutrition_templates');
    if (saved) setTemplates(JSON.parse(saved));
  }, []);

  const filteredDatabase = useMemo(() => {
    return FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);

  // دالة تنسيق الاسم حسب اللغة المختارة
  const formatFoodName = (fullName: string) => {
    const parts = fullName.split(' - ');
    if (language === 'ar') return parts[1] || parts[0];
    if (language === 'en') return parts[0];
    return fullName;
  };

  // الماكروز الكلية
  const totals = useMemo(() => {
    return meals.reduce((acc, m) => {
      m.items.forEach(it => {
        const r = it.grams / 100;
        acc.cal += it.calories * r; acc.pro += it.protein * r;
        acc.carb += it.carbs * r; acc.fat += it.fat * r;
      });
      return acc;
    }, { cal: 0, pro: 0, carb: 0, fat: 0 });
  }, [meals]);

  // --- Functions ---
  const toggleFoodSelection = (id: number) => {
    const next = new Set(selectedFoods);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedFoods(next);
  };

  const addSelectedToMeal = () => {
    if (activeMealId === null) return;
    const newItems = FOOD_DATABASE.filter(f => selectedFoods.has(f.id)).map(f => ({ ...f, grams: 100, instId: Math.random() }));
    setMeals(meals.map(m => m.id === activeMealId ? { ...m, items: [...m.items, ...newItems] } : m));
    setIsModalOpen(false);
    setSelectedFoods(new Set());
  };

  const saveAsTemplate = () => {
    const name = prompt("أدخل اسماً لهذا القالب (مثلاً: تضخيم 2500 سعرة):");
    if (!name) return;
    const newTemplates = [...templates, { name, meals, id: Date.now() }];
    setTemplates(newTemplates);
    localStorage.setItem('nutrition_templates', JSON.stringify(newTemplates));
    alert("تم حفظ القالب بنجاح!");
  };

  const loadTemplate = (temp: any) => {
    if (confirm(`هل تريد تحميل قالب "${temp.name}"؟ سيؤدي ذلك لمسح التعديلات الحالية.`)) {
      setMeals(temp.meals);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-10 font-sans print:bg-white print:text-black" dir="rtl">
      
      {/* 📄 PRINT HEADER: يظهر فقط في الـ PDF */}
      <div className="hidden print:block border-b-4 border-blue-600 pb-6 mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-black text-blue-600 mb-1">نظام غذائي احترافي</h1>
            <p className="text-gray-500 font-bold">Nutrition & Training Plan</p>
          </div>
          <div className="text-left border-r-4 border-blue-600 pr-4">
            <h2 className="text-xl font-black">C/Mohamed Saed</h2>
            <p className="flex items-center justify-end gap-2 text-sm mt-1">
              01022816320 <Phone size={14} />
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-8 bg-gray-50 p-4 rounded-xl border border-gray-200">
          <div><span className="text-gray-400 text-xs block">اسم العميل</span> <p className="font-bold">{clientData.name || '---'}</p></div>
          <div><span className="text-gray-400 text-xs block">الهدف</span> <p className="font-bold">{clientData.goal || '---'}</p></div>
          <div><span className="text-gray-400 text-xs block">التاريخ</span> <p className="font-bold">{clientData.date}</p></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto">
        
        {/* 🛠 CONTROL PANEL: يختفي في الطباعة */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10 print:hidden">
          <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <h3 className="flex items-center gap-2 mb-4 font-bold text-blue-400"><User size={20}/> بيانات العميل والإعدادات</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input placeholder="اسم العميل" className="bg-black border border-neutral-700 p-3 rounded-xl outline-none focus:border-blue-500" value={clientData.name} onChange={e => setClientData({...clientData, name: e.target.value})}/>
              <input placeholder="الهدف (تنشيف / تضخيم)" className="bg-black border border-neutral-700 p-3 rounded-xl outline-none focus:border-blue-500" value={clientData.goal} onChange={e => setClientData({...clientData, goal: e.target.value})}/>
              
              <div className="flex bg-black border border-neutral-700 rounded-xl overflow-hidden">
                <button onClick={() => setLanguage('ar')} className={`flex-1 p-2 text-xs font-bold ${language === 'ar' ? 'bg-blue-600' : ''}`}>عربي</button>
                <button onClick={() => setLanguage('en')} className={`flex-1 p-2 text-xs font-bold ${language === 'en' ? 'bg-blue-600' : ''}`}>EN</button>
                <button onClick={() => setLanguage('both')} className={`flex-1 p-2 text-xs font-bold ${language === 'both' ? 'bg-blue-600' : ''}`}>عربي/EN</button>
              </div>
              
              <button onClick={() => window.print()} className="bg-white text-black font-black rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 hover:text-white transition-all">
                <Printer size={20}/> استخراج PDF الاحترافي
              </button>
            </div>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl">
            <h3 className="flex items-center gap-2 mb-4 font-bold text-yellow-500"><Save size={20}/> القوالب الجاهزة</h3>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {templates.map(t => (
                <button key={t.id} onClick={() => loadTemplate(t)} className="w-full text-right p-2 text-sm bg-black/50 border border-neutral-800 rounded-lg hover:border-yellow-500 transition-all flex justify-between">
                  {t.name} <Copy size={14} className="text-neutral-500"/>
                </button>
              ))}
            </div>
            <button onClick={saveAsTemplate} className="w-full mt-4 border border-dashed border-neutral-600 p-2 rounded-xl text-xs font-bold hover:bg-neutral-800 transition-all">
              حفظ النظام الحالي كقالب +
            </button>
          </div>
        </div>

        {/* 📊 TOTALS SUMMARY */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 print:grid-cols-4 print:gap-2">
          <MacroBox label="السعرات" value={totals.cal} unit="kcal" color="text-orange-500" />
          <MacroBox label="البروتين" value={totals.pro} unit="جم" color="text-red-500" />
          <MacroBox label="الكربوهيدرات" value={totals.carb} unit="جم" color="text-blue-500" />
          <MacroBox label="الدهون" value={totals.fat} unit="جم" color="text-yellow-500" />
        </div>

        {/* 🥗 MEALS LIST */}
        <div className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden print:bg-white print:border-gray-200 print:rounded-xl print:shadow-none print:break-inside-avoid">
              <div className="p-4 bg-neutral-800/50 flex justify-between items-center print:bg-blue-50 print:border-b print:border-blue-100">
                <input className="bg-transparent font-black text-xl outline-none print:text-blue-800" value={meal.name} onChange={e => setMeals(meals.map(m => m.id === meal.id ? {...m, name: e.target.value} : m))}/>
                <div className="flex items-center gap-4">
                  <span className="text-xs bg-black/50 px-3 py-1 rounded-full border border-neutral-700 print:bg-blue-600 print:text-white print:border-none">
                    {Math.round(meal.items.reduce((acc, i) => acc + (i.calories * i.grams/100), 0))} kcal
                  </span>
                  <button onClick={() => setMeals(meals.filter(m => m.id !== meal.id))} className="text-neutral-600 hover:text-red-500 print:hidden"><Trash2 size={18}/></button>
                </div>
              </div>
              
              <div className="p-4">
                <table className="w-full text-right border-collapse">
                  <thead className="text-xs text-neutral-500 border-b border-neutral-800 print:text-gray-400">
                    <tr>
                      <th className="pb-2">الصنف</th>
                      <th className="pb-2 text-center">الكمية</th>
                      <th className="pb-2 text-center print:hidden">البروتين</th>
                      <th className="pb-2 text-center print:hidden">السعرات</th>
                      <th className="pb-2 text-center print:hidden"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800/50 print:divide-gray-100">
                    {meal.items.map((it: any) => (
                      <tr key={it.instId} className="group">
                        <td className="py-3 font-medium">
                          <div className="text-sm print:text-base print:font-bold">{formatFoodName(it.name)}</div>
                          <div className="text-[10px] text-neutral-500 print:hidden">{it.type}</div>
                        </td>
                        <td className="py-3 text-center">
                          <input type="number" className="w-16 bg-black border border-neutral-800 rounded p-1 text-center print:hidden" value={it.grams} onChange={e => setMeals(meals.map(m => m.id === meal.id ? {...m, items: m.items.map((i:any) => i.instId === it.instId ? {...i, grams: parseFloat(e.target.value)||0} : i)} : m))}/>
                          <span className="hidden print:inline font-mono font-bold text-blue-600">{it.grams}g</span>
                        </td>
                        <td className="py-3 text-center text-xs print:hidden">{Math.round(it.protein * it.grams/100)}g</td>
                        <td className="py-3 text-center text-xs font-bold print:hidden">{Math.round(it.calories * it.grams/100)}</td>
                        <td className="py-3 text-center print:hidden">
                          <button onClick={() => setMeals(meals.map(m => m.id === meal.id ? {...m, items: m.items.filter((i:any) => i.instId !== it.instId)} : m))} className="text-neutral-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><X size={14}/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button onClick={() => {setActiveMealId(meal.id); setIsModalOpen(true);}} className="w-full mt-4 py-2 border border-dashed border-neutral-700 text-neutral-500 text-xs rounded-xl hover:bg-blue-600/10 hover:text-blue-400 transition-all print:hidden">
                   + إضافة أصناف للوجبة
                </button>
              </div>
            </div>
          ))}
          
          <button onClick={() => setMeals([...meals, {id: Date.now(), name: "وجبة جديدة", items: []}])} className="w-full py-4 bg-neutral-900 border-2 border-dashed border-neutral-800 rounded-3xl text-neutral-400 font-bold hover:bg-neutral-800 transition-all print:hidden">
            + إضافة وجبة جديدة لليوم
          </button>
        </div>

        {/* 📋 PRINT FOOTER: يظهر فقط في الـ PDF */}
        <div className="hidden print:block mt-12 pt-8 border-t-2 border-gray-100">
          <div className="bg-blue-600 text-white p-6 rounded-2xl flex justify-between items-center">
            <div>
              <p className="text-xs opacity-80">للمتابعة والاستفسارات</p>
              <h3 className="text-xl font-black">C/Mohamed Saed</h3>
            </div>
            <div className="text-right">
              <p className="font-mono text-xl">01022816320</p>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-4 italic">هذا النظام صمم خصيصاً بناءً على احتياجاتك الفسيولوجية، يرجى الالتزام بالكميات المحددة.</p>
        </div>

      </div>

      {/* 🔍 MULTI-ADD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex justify-center items-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h2 className="text-xl font-black">قائمة الطعام ({selectedFoods.size} محدد)</h2>
              <button onClick={() => setIsModalOpen(false)} className="bg-neutral-800 p-2 rounded-full hover:text-red-500"><X size={20}/></button>
            </div>
            
            <div className="p-4 bg-black/50">
              <div className="relative">
                <Search className="absolute right-4 top-3 text-neutral-500" size={20}/>
                <input autoFocus className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl py-3 pr-12 outline-none focus:border-blue-500" placeholder="ابحث عن أرز، دجاج، فول..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {filteredDatabase.map(f => (
                <div key={f.id} onClick={() => toggleFoodSelection(f.id)} className={`flex justify-between items-center p-4 rounded-2xl cursor-pointer border transition-all ${selectedFoods.has(f.id) ? 'bg-blue-600 border-blue-400 shadow-lg shadow-blue-900/20' : 'bg-black/40 border-neutral-800 hover:border-neutral-600'}`}>
                  <div>
                    <p className="font-bold">{f.name}</p>
                    <p className="text-[10px] opacity-60">{f.calories} kcal | P: {f.protein}g | C: {f.carbs}g</p>
                  </div>
                  {selectedFoods.has(f.id) ? <Check size={20}/> : <Plus size={20} className="text-neutral-600"/>}
                </div>
              ))}
            </div>

            {selectedFoods.size > 0 && (
              <div className="p-6 border-t border-neutral-800 bg-neutral-950">
                <button onClick={addSelectedToMeal} className="w-full bg-blue-600 py-4 rounded-2xl font-black text-lg hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20">
                  إضافة {selectedFoods.size} أصناف للوجبة الآن
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function MacroBox({ label, value, unit, color }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-3xl text-center print:bg-white print:border-gray-200 print:rounded-xl print:p-2">
      <p className="text-[10px] font-black text-neutral-500 mb-1 uppercase print:text-gray-400">{label}</p>
      <p className={`text-xl font-black ${color} print:text-black print:text-lg`}>
        {Math.round(value)} <span className="text-[10px] opacity-50 print:opacity-100">{unit}</span>
      </p>
    </div>
  );
}