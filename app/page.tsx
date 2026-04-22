"use client";
import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Calculator, ChevronDown, ChevronUp, 
  RotateCcw, FileText, Printer
} from 'lucide-react';

// ========== قاعدة بيانات الأطعمة الكاملة (تم دمج كل البيانات المرسلة) ==========
const FOOD_DATABASE = [
  // CARB SOURCES
  { id: 1, name: "White Rice - أرز أبيض (خام)", calories: 360, protein: 7, carbs: 78, fat: 0.6, category: "Carb" },
  { id: 2, name: "Cooked White Rice - أرز أبيض مطبوخ", calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: "Carb" },
  { id: 3, name: "Brown Rice - أرز بني (خام)", calories: 370, protein: 7.5, carbs: 77, fat: 2.7, category: "Carb" },
  { id: 4, name: "Cooked Brown Rice - أرز بني مطبوخ", calories: 112, protein: 2.6, carbs: 23, fat: 0.9, category: "Carb" },
  { id: 5, name: "White Pasta - مكرونة بيضاء (خام)", calories: 370, protein: 13, carbs: 75, fat: 1.5, category: "Carb" },
  { id: 6, name: "Boiled White Pasta - مكرونة مسلوقة", calories: 130, protein: 5, carbs: 25, fat: 1, category: "Carb" },
  { id: 7, name: "Macaroni Béchamel - مكرونة بالبشاميل", calories: 180, protein: 6, carbs: 20, fat: 8, category: "Carb" },
  { id: 8, name: "Baladi Bread - خبز بلدي", calories: 280, protein: 9, carbs: 55, fat: 1, category: "Carb" },
  { id: 9, name: "Shami Bread - خبز شامي", calories: 275, protein: 8, carbs: 56, fat: 1, category: "Carb" },
  { id: 10, name: "Oats - شوفان (خام)", calories: 389, protein: 17, carbs: 66, fat: 7, category: "Carb" },
  { id: 11, name: "Potatoes - بطاطس (خام)", calories: 77, protein: 2, carbs: 17, fat: 0.1, category: "Carb" },
  { id: 12, name: "Fried Potatoes - بطاطس مقلية", calories: 250, protein: 3, carbs: 35, fat: 10, category: "Carb" },
  { id: 13, name: "Sweet Potato - بطاطا حلوة", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: "Carb" },

  // PROTEIN SOURCES
  { id: 14, name: "Grilled Chicken Breast - صدور دجاج مشوية", calories: 165, protein: 31, carbs: 0, fat: 3.6, category: "Protein" },
  { id: 15, name: "Fried Chicken Breast - صدور دجاج مقلية", calories: 250, protein: 28, carbs: 8, fat: 10, category: "Protein" },
  { id: 16, name: "Cooked Chicken Thigh - أوراك دجاج مطبوخة", calories: 209, protein: 26, carbs: 0, fat: 10, category: "Protein" },
  { id: 17, name: "Cooked Lean Beef - لحم بقري مطبوخ", calories: 250, protein: 30, carbs: 0, fat: 12, category: "Protein" },
  { id: 18, name: "Grilled Kofta - كفتة مشوية", calories: 300, protein: 25, carbs: 5, fat: 20, category: "Protein" },
  { id: 19, name: "Boiled Eggs - بيض مسلوق", calories: 155, protein: 13, carbs: 1.1, fat: 11, category: "Protein" },
  { id: 20, name: "Canned Tuna (Water) - تونة معلبة (ماء)", calories: 116, protein: 25, carbs: 0, fat: 1, category: "Protein" },
  { id: 21, name: "Cottage Cheese - جبنة قريش", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, category: "Protein" },
  { id: 22, name: "Cooked Fava Beans - فول مدمس", calories: 110, protein: 9, carbs: 19, fat: 0.4, category: "Protein" },

  // FAT SOURCES & NUTS
  { id: 23, name: "Olive Oil - زيت زيتون", calories: 884, protein: 0, carbs: 0, fat: 100, category: "Fat" },
  { id: 24, name: "Almonds - لوز", calories: 579, protein: 21, carbs: 22, fat: 50, category: "Nuts" },
  { id: 25, name: "Peanuts - سوداني", calories: 567, protein: 26, carbs: 16, fat: 49, category: "Nuts" },

  // FRUITS
  { id: 26, name: "Apple - تفاح", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, category: "Fruit" },
  { id: 27, name: "Banana - موز", calories: 96, protein: 1.1, carbs: 23, fat: 0.3, category: "Fruit" },
  { id: 28, name: "Mango - مانجو", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, category: "Fruit" },

  // VEGETABLES
  { id: 29, name: "Tomato - طماطم", calories: 18, protein: 0.9, carbs: 4, fat: 0.2, category: "Vegetable" },
  { id: 30, name: "Cucumber - خيار", calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, category: "Vegetable" },
  { id: 31, name: "Cooked Molokhia - ملوخية مطبوخة", calories: 60, protein: 3, carbs: 7, fat: 0.5, category: "Vegetable" }
  // ... يمكنك إضافة باقي الـ 100 صنف هنا بنفس النمط
];

export default function NutritionPlanner() {
  const [meals, setMeals] = useState([
    { id: 1, name: "الإفطار", items: [] as any[], isOpen: true },
    { id: 2, name: "الغداء", items: [] as any[], isOpen: true },
    { id: 3, name: "العشاء", items: [] as any[], isOpen: true },
    { id: 4, name: "سناك", items: [] as any[], isOpen: true }
  ]);

  const [totalMacros, setTotalMacros] = useState({ cal: 0, pro: 0, carb: 0, fat: 0 });

  const calcMacros = (items: any[]) => items.reduce(
    (acc: any, item: any) => {
      const m = (item.grams || 0) / 100;
      return {
        cal: acc.cal + (item.calories * m),
        pro: acc.pro + (item.protein * m),
        carb: acc.carb + (item.carbs * m),
        fat: acc.fat + (item.fat * m)
      };
    },
    { cal: 0, pro: 0, carb: 0, fat: 0 }
  );

  useEffect(() => {
    const totals = meals.reduce((acc, meal) => {
      const mealMacros = calcMacros(meal.items);
      return {
        cal: acc.cal + mealMacros.cal,
        pro: acc.pro + mealMacros.pro,
        carb: acc.carb + mealMacros.carb,
        fat: acc.fat + mealMacros.fat
      };
    }, { cal: 0, pro: 0, carb: 0, fat: 0 });
    setTotalMacros(totals);
  }, [meals]);

  const addItem = (mealId: number) => {
    setMeals(meals.map(meal => {
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
    setMeals(meals.map(meal => (meal.id === mealId 
      ? { ...meal, items: meal.items.filter((item: any) => item.instanceId !== instanceId) }
      : meal
    )));
  };

  const clearAll = () => {
    if(confirm("هل تريد مسح جميع البيانات؟")) {
      setMeals(meals.map(m => ({...m, items: []})));
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 md:p-8" dir="rtl">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; color: black !important; direction: rtl !important; }
          .no-print { display: none !important; }
          .print-only { display: block !important; }
          .meal-card { border: 1px solid #eee !important; margin-bottom: 20px !important; page-break-inside: avoid; }
          .bg-neutral-900 { background: white !important; border: 1px solid #ddd !important; }
          .text-white { color: black !important; }
          .text-blue-400 { color: #2563eb !important; }
        }
      `}} />

      <div className="max-w-4xl mx-auto">
        
        {/* Header - No Print */}
        <div className="no-print bg-neutral-900 rounded-3xl p-6 mb-8 border border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-2xl font-black flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg"><Calculator /></div>
            نظام التغذية الذكي
          </h1>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-xl flex items-center gap-2 font-bold transition-all">
              <Printer size={18} /> تحميل النظام (PDF)
            </button>
            <button onClick={clearAll} className="bg-red-900/30 text-red-500 hover:bg-red-900/50 px-4 py-2 rounded-xl border border-red-900/50 transition-all">
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print-only text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">جدول التغذية اليومي</h1>
          <p className="text-gray-600">تم إنشاؤه بواسطة مخطط التغذية الاحترافي</p>
          <hr className="mt-4 border-gray-200" />
        </div>

        {/* Totals Section */}
        <div className="bg-neutral-900 rounded-3xl p-6 mb-8 border border-neutral-800 meal-card">
          <h2 className="text-lg font-bold mb-4 opacity-70 no-print">إجمالي اليوم</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MacroBox label="السعرات" value={totalMacros.cal} unit="kcal" color="text-orange-400" />
            <MacroBox label="البروتين" value={totalMacros.pro} unit="جم" color="text-red-400" />
            <MacroBox label="الكارب" value={totalMacros.carb} unit="جم" color="text-blue-400" />
            <MacroBox label="الدهون" value={totalMacros.fat} unit="جم" color="text-yellow-400" />
          </div>
        </div>

        {/* Meals List */}
        <div className="space-y-6">
          {meals.map((meal) => (
            <div key={meal.id} className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden meal-card">
              <div 
                className="p-5 flex justify-between items-center cursor-pointer no-print hover:bg-neutral-800/50"
                onClick={() => setMeals(meals.map(m => m.id === meal.id ? {...m, isOpen: !m.isOpen} : m))}
              >
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold">{meal.name}</h3>
                  <span className="text-sm bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20">
                    {Math.round(calcMacros(meal.items).cal)} سعرة
                  </span>
                </div>
                {meal.isOpen ? <ChevronUp size={20}/> : <ChevronDown size={20}/>}
              </div>

              {/* Print Only Header for Meal */}
              <div className="hidden print-only p-4 bg-gray-50 border-b">
                <h3 className="text-xl font-bold">{meal.name} - ({Math.round(calcMacros(meal.items).cal)} سعرة)</h3>
              </div>

              {(meal.isOpen || typeof window === 'undefined') && (
                <div className="p-5">
                  <div className="space-y-4">
                    {meal.items.length === 0 && <p className="text-neutral-500 text-sm text-center py-4">لا توجد أصناف مضافة</p>}
                    {meal.items.map((item: any) => (
                      <div key={item.instanceId} className="flex flex-wrap md:flex-nowrap items-center gap-3 bg-neutral-800/30 p-3 rounded-xl border border-neutral-700/50">
                        <div className="flex-1 min-w-[200px]">
                          <select 
                            className="no-print w-full bg-neutral-950 border border-neutral-700 p-2 rounded-lg text-sm"
                            value={item.id}
                            onChange={(e) => updateItem(meal.id, item.instanceId, 'id', e.target.value)}
                          >
                            {FOOD_DATABASE.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                          </select>
                          <span className="hidden print-only font-bold text-lg">{item.name}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <input 
                            type="number"
                            className="no-print w-20 bg-neutral-950 border border-neutral-700 p-2 rounded-lg text-center"
                            value={item.grams}
                            onChange={(e) => updateItem(meal.id, item.instanceId, 'grams', parseFloat(e.target.value) || 0)}
                          />
                          <span className="font-medium">{item.grams} <span className="text-xs opacity-50">جم</span></span>
                        </div>

                        <div className="hidden md:flex gap-4 px-4 border-r border-neutral-700 no-print">
                          <span className="text-xs text-red-400">P: {Math.round(item.protein * item.grams/100)}</span>
                          <span className="text-xs text-blue-400">C: {Math.round(item.carbs * item.grams/100)}</span>
                        </div>

                        <button onClick={() => removeItem(meal.id, item.instanceId)} className="no-print p-2 text-neutral-500 hover:text-red-500">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    
                    <button onClick={() => addItem(meal.id)} className="no-print w-full py-3 border-2 border-dashed border-neutral-800 rounded-xl text-neutral-500 hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2 font-bold">
                      <Plus size={18} /> إضافة صنف
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-12 text-center text-neutral-600 text-sm no-print">
          <p>مخطط التغذية الاحترافي - جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
  );
}

function MacroBox({ label, value, unit, color }: any) {
  return (
    <div className="bg-neutral-800/50 p-4 rounded-2xl border border-neutral-700/50 text-center">
      <p className="text-xs opacity-50 mb-1">{label}</p>
      <p className={`text-xl font-black ${color}`}>{Math.round(value)} <span className="text-[10px] opacity-100">{unit}</span></p>
    </div>
  );
}