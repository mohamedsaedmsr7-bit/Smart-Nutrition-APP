"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calculator, ChevronDown, ChevronUp } from 'lucide-react';

// ========== قاعدة بيانات الأطعمة الكاملة ==========
const FOOD_DATABASE = [
  { id: 1, name: "صدور دجاج مطبوخة", calories: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 2, name: "أرز أبيض مطبوخ", calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: 3, name: "بيض مسلوق", calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  { id: 4, name: "بطاطس مسلوقة", calories: 87, protein: 1.9, carbs: 20, fat: 0.1 },
  { id: 5, name: "فول مدمس", calories: 110, protein: 8, carbs: 20, fat: 0.5 },
  { id: 6, name: "عدس مطبوخ", calories: 116, protein: 9, carbs: 20, fat: 0.4 },
  { id: 7, name: "زيت زيتون", calories: 884, protein: 0, carbs: 0, fat: 100 },
  { id: 8, name: "جبنة قريش", calories: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { id: 9, name: "تونا معلبة بالماء", calories: 116, protein: 26, carbs: 0, fat: 1 },
  { id: 10, name: "شوفان", calories: 389, protein: 16.9, carbs: 66, fat: 6.9 }
];

export default function NutritionPlanner() {
  const [meals, setMeals] = useState([
    { id: 1, name: "الإفطار", items: [] as any[], isOpen: true },
    { id: 2, name: "الغداء", items: [] as any[], isOpen: true },
    { id: 3, name: "العشاء", items: [] as any[], isOpen: true },
    { id: 4, name: "سناك", items: [] as any[], isOpen: true }
  ]);

  const [totalMacros, setTotalMacros] = useState({ cal: 0, pro: 0, carb: 0, fat: 0 });

  // ========== دالة حساب الماكروز (تم حل مشكلة TypeScript هنا) ==========
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