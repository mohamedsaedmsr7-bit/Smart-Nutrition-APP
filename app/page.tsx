"use client";
import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, Trash2, Search, Printer, X, Copy, User, 
  Settings, Sun, Moon, Layout, GripVertical, Lock, Save, ExternalLink, ClipboardCheck
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ========== Interfaces (Strict Typing for Vercel) ==========
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
  instId: string; // Unique instance ID for DND
}

interface Meal {
  id: string;
  name: string;
  items: FoodItem[];
}

interface TargetMacros {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ClientData {
  name: string;
  goal: string;
}

interface NutritionTemplate {
  id: string;
  templateName: string;
  meals: Meal[];
  targetMacros: TargetMacros;
  timestamp: number;
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
  { id: 107, name: "Macaroni Béchamel - مكرونة بالبشاميل", category: "Carb", state: "Cooked", carbs: 20.0, protein: 6.0, fat: 8.0, calories: 230.0 },
  { id: 108, name: "Baladi Bread - خبز بلدي", category: "Carb", state: "Ready", carbs: 55.0, protein: 9.0, fat: 1.0, calories: 280.0 },
  { id: 109, name: "Shami Bread - خبز شامي", category: "Carb", state: "Ready", carbs: 56.0, protein: 8.0, fat: 1.0, calories: 275.0 },
  { id: 110, name: "White Toast - توست أبيض", category: "Carb", state: "Ready", carbs: 49.0, protein: 8.0, fat: 4.0, calories: 265.0 },
  { id: 111, name: "Brown Toast - توست بني", category: "Carb", state: "Ready", carbs: 43.0, protein: 9.0, fat: 4.0, calories: 250.0 },
  { id: 112, name: "Oats - شوفان", category: "Carb", state: "Raw", carbs: 66.0, protein: 17.0, fat: 7.0, calories: 389.0 },
  { id: 113, name: "Cooked Oats - شوفان مطبوخ", category: "Carb", state: "Cooked", carbs: 12.0, protein: 2.5, fat: 1.5, calories: 70.0 },
  { id: 114, name: "Potatoes - بطاطس", category: "Carb", state: "Raw", carbs: 17.0, protein: 2.0, fat: 0.1, calories: 77.0 },
  { id: 115, name: "Boiled Potatoes - بطاطس مسلوقة", category: "Carb", state: "Boiled", carbs: 20.0, protein: 2.0, fat: 0.1, calories: 87.0 },
  { id: 116, name: "Sweet Potato - بطاطا حلوة", category: "Carb", state: "Raw", carbs: 20.0, protein: 1.6, fat: 0.1, calories: 86.0 },
  { id: 117, name: "Baked Sweet Potato - بطاطا حلوة مشوية", category: "Carb", state: "Baked", carbs: 24.0, protein: 2.0, fat: 0.1, calories: 105.0 },
  { id: 118, name: "Bulgur Cooked - برغل مطبوخ", category: "Carb", state: "Cooked", carbs: 19, protein: 3, fat: 0.25, calories: 85 },
  { id: 119, name: "Bulgur - برغل", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat: 1.3, calories: 342 },
  { id: 120, name: "Freekeh Cooked - فريك مطبوخ", category: "Carb", state: "Cooked", carbs: 19, protein: 6, fat: 0.5, calories: 150 },
  { id: 121, name: "Freekeh - فريك", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat: 1.5, calories: 340 },
  { id: 125, name: "Popcorn Kernels (Raw) - ذرة فشار (نيء/خام)", category: "Carb", state: "Raw", carbs: 74.0, protein: 11.0, fat: 4.5, calories: 365.0 },

  // --- PROTEIN SOURCES ---
  { id: 201, name: "Grilled Chicken Breast - صدور دجاج مشوية", category: "Protein", state: "Grilled", carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 202, name: "Raw Chicken Breast - صدور دجاج نية", category: "Protein", state: "Raw", carbs: 0, protein: 23, fat: 1, calories: 120 },
  { id: 203, name: "Lean Minced Beef - لحمة مفرومة بدون دهن", category: "Protein", state: "Raw", carbs: 0, protein: 24, fat: 2, calories: 120 },
  { id: 204, name: "Minced Beef (5% Fat) - لحمة مفرومة 5% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 21.5, fat: 5, calories: 137 },
  { id: 205, name: "Minced Beef (10% Fat) - لحمة مفرومة 10% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 20, fat: 10, calories: 176 },
  { id: 206, name: "Beef Burger (10% Fat) - برجر بقري 10% دهون", category: "Protein", state: "Raw", carbs: 1, protein: 19, fat: 10, calories: 180 },
  { id: 207, name: "Grilled Lean Minced - مفروم بدون دهن مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 30, fat: 3, calories: 160 },
  { id: 208, name: "Grilled Minced (5% Fat) - مفروم 5% دهون مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 28, fat: 7, calories: 185 },
  { id: 209, name: "Grilled Minced (10% Fat) - مفروم 10% دهون مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26, fat: 13, calories: 230 },
  { id: 210, name: "Grilled Beef Burger (10% Fat) - برجر مشوي 10% دهون", category: "Protein", state: "Grilled", carbs: 1.5, protein: 24, fat: 12, calories: 225 },
  { id: 211, name: "Whole Eggs (Gm) - بيض كامل (جم)", category: "Protein", state: "Raw", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 212, name: "Boiled Eggs - بيض مسلوق", category: "Protein", state: "Boiled", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 213, name: "Egg White - بياض بيض", category: "Protein", state: "Raw", carbs: 0, protein: 11, fat: 0.5, calories: 52 },
  { id: 214, name: "Canned Tuna (Water) - تونة معلبة (ماء)", category: "Protein", state: "Canned", carbs: 0, protein: 25, fat: 1, calories: 116 },
  { id: 217, name: "Large Egg (1 Piece) - بيضة كبيرة (واحدة)", category: "Protein", state: "Raw/Boiled", carbs: 0.6, protein: 6.3, fat: 5.0, calories: 72 },
  { id: 218, name: "Egg White (1 Piece) - بياض بيضة (واحدة)", category: "Protein", state: "Raw", carbs: 0.2, protein: 3.6, fat: 0.1, calories: 17 },
  { id: 260, name: "Grilled Tilapia - سمك بلطي مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26.0, fat: 3.0, calories: 130.0 },
  { id: 261, name: "Grilled Mackerel - سمك ماكريل مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 19.0, fat: 14.0, calories: 205.0 },
  { id: 262, name: "Grilled Mullet - سمك بوري مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 20.0, fat: 9.0, calories: 170.0 },
  { id: 263, name: "Grilled Fish Fillet - فيليه سمك مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 21.0, fat: 1.5, calories: 105.0 },
 
  { id: 250, name: "Raw Beef (Lean) - لحم بقري أحمر نئ", category: "Protein", state: "Raw", carbs: 0, protein: 22, fat: 5, calories: 133 },
  { id: 251, name: "Grilled Beef (Lean) - لحم بقري مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 28, fat: 7, calories: 175 },
  { id: 252, name: "Boiled Beef - لحم بقري مسلوق", category: "Protein", state: "Boiled", carbs: 0, protein: 26, fat: 8, calories: 176 },
  { id: 253, name: "Raw Lamb - لحم ضأن نئ", category: "Protein", state: "Raw", carbs: 0, protein: 17, fat: 20, calories: 250 },
  { id: 254, name: "Grilled Kofta - كفتة مشوية", category: "Protein", state: "Grilled", carbs: 2, protein: 18, fat: 18, calories: 240 },

  // --- FAT SOURCES ---
  { id: 301, name: "Olive Oil - زيت زيتون", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 302, name: "Butter - زبدة", category: "Fat", state: "Raw", carbs: 0, protein: 1, fat: 81, calories: 717 },
  { id: 303, name: "Tahini - طحينة", category: "Fat", state: "Raw", carbs: 21, protein: 17, fat: 54, calories: 595 },
  { id: 304, name: "Almonds - لوز", category: "Fat/Nut", state: "Raw", carbs: 22, protein: 21, fat: 50, calories: 579 },
  { id: 305, name: "Peanuts - سوداني", category: "Fat/Nut", state: "Raw", carbs: 16, protein: 26, fat: 49, calories: 567 },
  { id: 306, name: "Avocado - أفوكادو", category: "Fruit/Fat", state: "Raw", carbs: 9, protein: 2, fat: 15, calories: 160 }, 
  { id: 317, name: "Ghee (Ghi) - سمنة بلدي", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100.0, calories: 900.0 },
 
  // --- NUTS & SEEDS (المكسرات والبذور) ---
  { id: 307, name: "Walnuts - عين جمل", category: "Fat/Nut", state: "Raw", carbs: 14.0, protein: 15.0, fat: 65.0, calories: 654.0 },
  { id: 308, name: "Cashews - كاجو", category: "Fat/Nut", state: "Raw", carbs: 30.0, protein: 18.0, fat: 44.0, calories: 553.0 },
  { id: 309, name: "Pistachios - فستق", category: "Fat/Nut", state: "Raw", carbs: 27.0, protein: 20.0, fat: 45.0, calories: 562.0 },
  { id: 310, name: "Hazelnuts - بندق", category: "Fat/Nut", state: "Raw", carbs: 17.0, protein: 15.0, fat: 61.0, calories: 628.0 },
  { id: 311, name: "Pecans - بيكان", category: "Fat/Nut", state: "Raw", carbs: 14.0, protein: 9.0, fat: 72.0, calories: 691.0 },
  { id: 312, name: "Brazil Nuts - جوز برازيلي", category: "Fat/Nut", state: "Raw", carbs: 12.0, protein: 14.0, fat: 66.0, calories: 656.0 },
  { id: 313, name: "Macadamia - ماكاديميا", category: "Fat/Nut", state: "Raw", carbs: 14.0, protein: 8.0, fat: 76.0, calories: 718.0 },
  { id: 314, name: "Pumpkin Seeds - لب قرع (خشب)", category: "Fat/Nut", state: "Raw", carbs: 10.0, protein: 30.0, fat: 49.0, calories: 559.0 },
  { id: 315, name: "Sunflower Seeds - لب عباد شمس (سوري)", category: "Fat/Nut", state: "Raw", carbs: 20.0, protein: 21.0, fat: 51.0, calories: 584.0 },
  { id: 316, name: "Watermelon Seeds - لب سوبر (أسمر)", category: "Fat/Nut", state: "Raw", carbs: 15.0, protein: 28.0, fat: 47.0, calories: 557.0 },

  // --- VEGETABLES ---
  { id: 601, name: "Green Salad - سلطة خضراء", category: "Vegetable", state: "Ready", carbs: 4, protein: 1, fat: 0.2, calories: 20 },
  { id: 602, name: "Tomato - طماطم", category: "Vegetable", state: "Raw", carbs: 4, protein: 0.9, fat: 0.2, calories: 18 },
  { id: 603, name: "Cucumber - خيار", category: "Vegetable", state: "Raw", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 16 },
  { id: 610, name: "Molokhia - ملوخية مطبوخة", category: "Vegetable", state: "Cooked", carbs: 6.0, protein: 3.0, fat: 2.0, calories: 55.0 },
  
  // --- COOKED VEGETABLES (خضار مطبوخ بالصلصة) ---
  { id: 611, name: "Cooked Green Beans - فاصوليا خضراء (مطبوخة)", category: "Vegetable", state: "Cooked", carbs: 9.0, protein: 2.0, fat: 2.5, calories: 65.0 },
  { id: 612, name: "Cooked Peas & Carrots - بسلة بالجزر (مطبوخة)", category: "Vegetable", state: "Cooked", carbs: 14.0, protein: 4.0, fat: 2.5, calories: 95.0 },
  { id: 613, name: "Cooked Zucchini - كوسة مطبوخة", category: "Vegetable", state: "Cooked", carbs: 5.0, protein: 1.5, fat: 2.0, calories: 45.0 },
  { id: 614, name: "Cooked Okra - بامية مطبوخة", category: "Vegetable", state: "Cooked", carbs: 8.5, protein: 2.0, fat: 2.5, calories: 65.0 },

  // --- SAUCES (الصلصات) ---
  { id: 701, name: "Tomato Sauce (Homemade) - صلصة طماطم (منزلية)", category: "Vegetable", state: "Cooked", carbs: 4.5, protein: 1.5, fat: 0.2, calories: 25 },
  { id: 702, name: "Tomato Paste - معجون طماطم (صلصة معلبة)", category: "Vegetable", state: "Ready", carbs: 18, protein: 4.3, fat: 0.5, calories: 82 },

  // --- LEGUMES (البقوليات) ---
  { id: 501, name: "Dry Fava Beans - فول تدميس (نيء)", category: "Legumes", state: "Raw", carbs: 58, protein: 26, fat: 1.5, calories: 340 },
  { id: 502, name: "Cooked Fava Beans - فول مدمس (مسلوق سادة)", category: "Legumes", state: "Cooked", carbs: 18, protein: 8, fat: 0.5, calories: 110 },
  { id: 503, name: "Dry Lentils - عدس (نيء)", category: "Legumes", state: "Raw", carbs: 60, protein: 24, fat: 1, calories: 350 },
  { id: 504, name: "Cooked Lentils - عدس مطبوخ / مسلوق", category: "Legumes", state: "Cooked", carbs: 20, protein: 9, fat: 0.4, calories: 116 },
  { id: 505, name: "Dry Chickpeas - حمص شام (نيء)", category: "Legumes", state: "Raw", carbs: 61, protein: 19, fat: 6, calories: 364 },
  { id: 506, name: "Cooked Chickpeas - حمص شام مسلوق", category: "Legumes", state: "Cooked", carbs: 27, protein: 8.9, fat: 2.6, calories: 164 },
  { id: 507, name: "Dry White Beans - فاصوليا بيضاء (نيء)", category: "Legumes", state: "Raw", carbs: 60, protein: 22, fat: 1.2, calories: 337 },
  { id: 508, name: "Cooked White Beans - فاصوليا بيضاء مسلوقة", category: "Legumes", state: "Cooked", carbs: 25, protein: 9.7, fat: 0.5, calories: 139 },
  { id: 509, name: "Dry Black-eyed Peas - لوبيا (نيء)", category: "Legumes", state: "Raw", carbs: 60, protein: 23, fat: 1.3, calories: 336 },
  { id: 510, name: "Cooked Black-eyed Peas - لوبيا مسلوقة", category: "Legumes", state: "Cooked", carbs: 21, protein: 8, fat: 0.5, calories: 116 },
  { id: 511, name: "Dry Lupini Beans - ترمس (نيء)", category: "Legumes", state: "Raw", carbs: 40, protein: 36, fat: 9, calories: 371 },
  { id: 512, name: "Cooked Lupini Beans - ترمس مسلوق", category: "Legumes", state: "Cooked", carbs: 10, protein: 16, fat: 4.8, calories: 119 },
  { id: 513, name: "Dry Split Peas - بسلة ناشفة (نيء)", category: "Legumes", state: "Raw", carbs: 60, protein: 24, fat: 1.2, calories: 341 },
  { id: 514, name: "Cooked Green Peas - بسلة خضراء مسلوقة", category: "Legumes", state: "Cooked", carbs: 14.5, protein: 5.4, fat: 0.4, calories: 81 },
  { id: 515, name: "Fresh Green Fava Beans - فول أخضر (حيراتي)", category: "Legumes", state: "Raw", carbs: 18, protein: 8, fat: 0.7, calories: 88 },
  { id: 518, name: "Dry Red Kidney Beans - فاصوليا حمراء (نيء)", category: "Legumes", state: "Raw", carbs: 60, protein: 24, fat: 0.8, calories: 333 },
  { id: 519, name: "Cooked Red Kidney Beans - فاصوليا حمراء مسلوقة", category: "Legumes", state: "Cooked", carbs: 22.8, protein: 8.7, fat: 0.5, calories: 127 },
  { id: 520, name: "Baked Falafel - طعمية مشوية (قلاية هوائية)", category: "Legumes", state: "Cooked", carbs: 22.0, protein: 13.0, fat: 4.5, calories: 180.0 },

  // --- CHEESE & DAIRY (الأجبان والألبان) ---
  { id: 401, name: "Full Fat Mozzarella - موتزاريلّا كامل الدسم", category: "Dairy", state: "Ready", carbs: 2.2, protein: 22, fat: 22, calories: 280 },
  { id: 402, name: "Light Mozzarella - موتزاريلّا لايت", category: "Dairy", state: "Ready", carbs: 2.5, protein: 24, fat: 8, calories: 160 },
  { id: 403, name: "Old Roumy Cheese - جبنة رومي قديم", category: "Dairy", state: "Ready", carbs: 1.5, protein: 25, fat: 28, calories: 350 },
  { id: 404, name: "Medium Roumy Cheese - جبنة رومي وسط", category: "Dairy", state: "Ready", carbs: 2, protein: 23, fat: 25, calories: 330 },
  { id: 405, name: "Cottage Cheese - جبنة قريش", category: "Dairy", state: "Ready", carbs: 3.4, protein: 11, fat: 4.3, calories: 98 },
  { id: 406, name: "Feta Low Salt - فيتا خفيفة الملح", category: "Dairy", state: "Ready", carbs: 4, protein: 14, fat: 21, calories: 260 },
  { id: 407, name: "Feta Light - فيتا لايت", category: "Dairy", state: "Ready", carbs: 5, protein: 15, fat: 10, calories: 170 },
  { id: 408, name: "Creamy Cheese (Jar) - جبنة كريمي (كاسات)", category: "Dairy", state: "Ready", carbs: 4, protein: 7, fat: 30, calories: 315 },
  { id: 409, name: "Light Creamy Cheese - جبنة كريمي لايت", category: "Dairy", state: "Ready", carbs: 6, protein: 9, fat: 15, calories: 195 },
  { id: 410, name: "Halloumi - حلوم (خليجي)", category: "Dairy", state: "Ready", carbs: 2, protein: 21, fat: 26, calories: 320 },
  { id: 411, name: "Labneh - لبنة (خليجي)", category: "Dairy", state: "Ready", carbs: 4, protein: 6, fat: 12, calories: 150 },
  { id: 412, name: "Full Cream Milk - لبن كامل الدسم (كوب 200مل)", category: "Dairy", state: "Liquid", carbs: 9.6, protein: 6.4, fat: 6.5, calories: 120 },
  { id: 413, name: "Half-Skimmed Milk - لبن نصف دسم (كوب 200مل)", category: "Dairy", state: "Liquid", carbs: 9.8, protein: 6.6, fat: 3.0, calories: 95 },
  { id: 414, name: "Skimmed Milk - لبن خالي الدسم (كوب 200مل)", category: "Dairy", state: "Liquid", carbs: 10, protein: 6.8, fat: 0.4, calories: 70 },
  
  // --- ADDITIONAL FRUITS (فواكه إضافية - مصر والخليج) ---
  { id: 318, name: "Prickly Pear - تين شوكي", category: "Fruit", state: "Raw", carbs: 9.6, protein: 0.7, fat: 0.5, calories: 41 },
  { id: 319, name: "Peach - خوخ", category: "Fruit", state: "Raw", carbs: 9.5, protein: 0.9, fat: 0.3, calories: 39 },
  { id: 320, name: "Apricot - مشمش", category: "Fruit", state: "Raw", carbs: 11, protein: 1.4, fat: 0.4, calories: 48 },
  { id: 321, name: "Plum - برقوق", category: "Fruit", state: "Raw", carbs: 11.4, protein: 0.7, fat: 0.3, calories: 46 },
  { id: 322, name: "Pear - كمثرى", category: "Fruit", state: "Raw", carbs: 15, protein: 0.4, fat: 0.1, calories: 57 },
  { id: 323, name: "Persimmon - كاكا", category: "Fruit", state: "Raw", carbs: 18.6, protein: 0.6, fat: 0.2, calories: 70 },
  { id: 324, name: "Cantaloupe - كانتلوب / شمام", category: "Fruit", state: "Raw", carbs: 8, protein: 0.8, fat: 0.2, calories: 34 },
  { id: 325, name: "Sweet Melon - شمام أصفر (خربز)", category: "Fruit", state: "Raw", carbs: 9, protein: 0.5, fat: 0.1, calories: 36 },
  { id: 326, name: "Kiwi - كيوي", category: "Fruit", state: "Raw", carbs: 15, protein: 1.1, fat: 0.5, calories: 61 },
  { id: 327, name: "Pineapple - أناناس", category: "Fruit", state: "Raw", carbs: 13, protein: 0.5, fat: 0.1, calories: 50 },
  { id: 328, name: "Papaya - بابايا", category: "Fruit", state: "Raw", carbs: 11, protein: 0.5, fat: 0.3, calories: 43 },
  { id: 329, name: "Dragon Fruit - دراجون فروت (فاكهة التنين)", category: "Fruit", state: "Raw", carbs: 13, protein: 1.2, fat: 1.5, calories: 60 },
  { id: 330, name: "Blueberries - توت أزرق", category: "Fruit", state: "Raw", carbs: 14.5, protein: 0.7, fat: 0.3, calories: 57 },
  { id: 331, name: "Raspberries - توت أحمر", category: "Fruit", state: "Raw", carbs: 12, protein: 1.2, fat: 0.7, calories: 52 },
  { id: 332, name: "Sukkari Dates (Dry) - تمر سكري (مكبوس)", category: "Fruit", state: "Raw", carbs: 75, protein: 2.5, fat: 0.5, calories: 290 },
  { id: 333, name: "Ajwa Dates - تمر عجوة", category: "Fruit", state: "Raw", carbs: 68, protein: 2.2, fat: 0.4, calories: 275 },
  { id: 334, name: "Coconut (Meat) - جوز هند (ثمرة)", category: "Fruit", state: "Raw", carbs: 15, protein: 3.3, fat: 33, calories: 354 },
  { id: 335, name: "Cherry - كرز", category: "Fruit", state: "Raw", carbs: 16, protein: 1.1, fat: 0.2, calories: 50 },
  { id: 336, name: "Pomelo - بوملي", category: "Fruit", state: "Raw", carbs: 9.6, protein: 0.8, fat: 0, calories: 38 },

  // --- ADDITIONAL FRUITS & VARIANTS (فواكه إضافية وأنواع الموز) ---
  { id: 337, name: "Imported Banana - موز مستورد (كافيندش)", category: "Fruit", state: "Raw", carbs: 23, protein: 1.1, fat: 0.3, calories: 89 },
  { id: 338, name: "Egyptian Banana - موز بلدي صغير", category: "Fruit", state: "Raw", carbs: 21, protein: 1.2, fat: 0.2, calories: 85 },
  { id: 339, name: "Avocado - أفوكادو", category: "Fruit", state: "Raw", carbs: 8.5, protein: 2, fat: 14.7, calories: 160 },
  { id: 340, name: "Mandarin / Clementine - يوسفي", category: "Fruit", state: "Raw", carbs: 13.3, protein: 0.8, fat: 0.3, calories: 53 },
  { id: 341, name: "Grapefruit - جريب فروت", category: "Fruit", state: "Raw", carbs: 11, protein: 0.8, fat: 0.1, calories: 42 },
  { id: 342, name: "Custard Apple - قشطة", category: "Fruit", state: "Raw", carbs: 23.6, protein: 2.1, fat: 0.3, calories: 94 },
  { id: 343, name: "Mulberry (Local) - توت بلدي / شامي", category: "Fruit", state: "Raw", carbs: 9.8, protein: 1.4, fat: 0.4, calories: 43 },
  { id: 344, name: "Blackberry - توت أسود (عليق)", category: "Fruit", state: "Raw", carbs: 9.6, protein: 1.4, fat: 0.5, calories: 43 },
  { id: 345, name: "Passion Fruit - باشن فروت", category: "Fruit", state: "Raw", carbs: 23.4, protein: 2.2, fat: 0.7, calories: 97 },
  { id: 346, name: "Lychee - ليتشي", category: "Fruit", state: "Raw", carbs: 16.5, protein: 0.8, fat: 0.4, calories: 66 },
  { id: 347, name: "Nectarine - نكتارين", category: "Fruit", state: "Raw", carbs: 10.5, protein: 1.1, fat: 0.3, calories: 44 },
  { id: 348, name: "Quince - سفرجل", category: "Fruit", state: "Raw", carbs: 15.3, protein: 0.4, fat: 0.1, calories: 57 },
  { id: 349, name: "Starfruit - فاكهة النجمة (كارامبولا)", category: "Fruit", state: "Raw", carbs: 6.7, protein: 1, fat: 0.3, calories: 31 },
  { id: 350, name: "Kumquat - كمكوات (موالح صغيرة)", category: "Fruit", state: "Raw", carbs: 15.9, protein: 1.9, fat: 0.9, calories: 71 },
  { id: 351, name: "Fresh Lemon - ليمون طازج", category: "Fruit", state: "Raw", carbs: 9, protein: 1.1, fat: 0.3, calories: 29 },
  { id: 352, name: "Lime - ليمون بنزهير / أخضر", category: "Fruit", state: "Raw", carbs: 10.5, protein: 0.7, fat: 0.2, calories: 30 },

  // --- ORANGES VARIANTS (أنواع البرتقال) ---
  { id: 353, name: "Navel Orange - برتقال أبو سرة", category: "Fruit", state: "Raw", carbs: 12.5, protein: 0.9, fat: 0.1, calories: 52 },
  { id: 354, name: "Valencia Orange (Summer) - برتقال صيفي", category: "Fruit", state: "Raw", carbs: 11, protein: 0.8, fat: 0.2, calories: 46 },
  { id: 355, name: "Baladi Orange - برتقال بلدي", category: "Fruit", state: "Raw", carbs: 10.5, protein: 0.7, fat: 0.2, calories: 44 },
  { id: 356, name: "Blood Orange - برتقال بدمه", category: "Fruit", state: "Raw", carbs: 12, protein: 1, fat: 0.1, calories: 50 },
  { id: 357, name: "Bitter Orange (Naranj) - نارنج", category: "Fruit", state: "Raw", carbs: 9, protein: 0.6, fat: 0.1, calories: 37 },
  { id: 358, name: "Fresh Orange Juice - عصير برتقال فريش (بدون سكر)", category: "Fruit", state: "Liquid", carbs: 10, protein: 0.7, fat: 0.2, calories: 45 },

  // --- LIGHT SAUCES (الصوصات اللايت) ---
  { id: 703, name: "Light Mayonnaise - مايونيز لايت", category: "Fat", state: "Ready", carbs: 6.0, protein: 1.0, fat: 28.0, calories: 280.0 },
  { id: 704, name: "Zero Treat/Sugar Sauce - صوص زيرو (مثل الكاتشب)", category: "Carb", state: "Ready", carbs: 2.0, protein: 0.1, fat: 0.1, calories: 15.0 },
  { id: 705, name: "Light Ketchup - كاتشب لايت", category: "Carb", state: "Ready", carbs: 15.0, protein: 1.0, fat: 0.1, calories: 65.0 },
  
  // --- SUPPLEMENTS (المكملات الغذائية) ---
  { id: 901, name: "Whey Protein (1 Scoop) - واي بروتين (سكوب)", category: "Protein", state: "Powder", carbs: 3.0, protein: 24.0, fat: 1.5, calories: 120.0 },
  { id: 902, name: "Isolate Protein (1 Scoop) - أيزوليت بروتين (سكوب)", category: "Protein", state: "Powder", carbs: 1.0, protein: 25.0, fat: 0.5, calories: 110.0 },
  { id: 903, name: "Casein Protein (1 Scoop) - كازين بروتين (سكوب)", category: "Protein", state: "Powder", carbs: 3.0, protein: 24.0, fat: 1.0, calories: 120.0 },
  { id: 904, name: "Creatine Monohydrate (5g) - كرياتين مونوهيدرات", category: "Protein", state: "Powder", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 905, name: "BCAA / Amino (1 Scoop) - بي سي أيه أيه", category: "Protein", state: "Powder", carbs: 1.0, protein: 5.0, fat: 0, calories: 25.0 },
  { id: 906, name: "Mass Gainer (100g) - ماس جينر (بودر)", category: "Carb", state: "Powder", carbs: 75.0, protein: 15.0, fat: 2.0, calories: 370.0 },
  { id: 907, name: "Pre-Workout (1 Scoop) - بري ورك أوت", category: "Carb", state: "Powder", carbs: 2.0, protein: 0, fat: 0, calories: 10.0 },
  { id: 908, name: "Beta-Alanine - بيتا ألانين", category: "Supplements", state: "Powder", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 909, name: "L-Citrulline Malate - سيترولين ماليت", category: "Supplements", state: "Powder", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 910, name: "L-Arginine - أرجينين", category: "Supplements", state: "Powder", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 911, name: "Multivitamins (1 Tablet) - مالتي فيتامين", category: "Supplements", state: "Ready", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 912, name: "Omega-3 (1 Capsule) - أوميجا 3", category: "Supplements", state: "Ready", carbs: 0, protein: 0, fat: 0.9, calories: 9.0 },
];

export default function SmartNutritionApp() {
  // --- States ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [meals, setMeals] = useState<Meal[]>([
    { id: 'meal-1', name: "الوجبة الأولى", items: [] }
  ]);
  const [clientData, setClientData] = useState<ClientData>({ name: '', goal: '' });
  const [targetMacros, setTargetMacros] = useState<TargetMacros>({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
  const [templates, setTemplates] = useState<NutritionTemplate[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);

  // --- Sensors for DND ---
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  // --- Effects ---
  useEffect(() => {
    const savedTemplates = localStorage.getItem('smart_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    
    const savedWork = localStorage.getItem('current_work');
    if (savedWork) {
      const parsed = JSON.parse(savedWork);
      setMeals(parsed.meals);
      setTargetMacros(parsed.targetMacros);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('current_work', JSON.stringify({ meals, targetMacros }));
  }, [meals, targetMacros]);

  // --- Functions ---
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") setIsAuthenticated(true);
  };

  const saveAsTemplate = () => {
    const name = prompt("أدخل اسم القالب:");
    if (!name) return;
    const newTemplate: NutritionTemplate = {
      id: `temp-${Date.now()}`,
      templateName: name,
      meals,
      targetMacros,
      timestamp: Date.now()
    };
    const updated = [...templates, newTemplate];
    setTemplates(updated);
    localStorage.setItem('smart_templates', JSON.stringify(updated));
  };

  const loadTemplate = (temp: NutritionTemplate) => {
    setMeals(temp.meals);
    setTargetMacros(temp.targetMacros);
  };

  const copyPlanToClipboard = () => {
    const text = meals.map(m => {
      const items = m.items.map(i => `• ${i.name}: ${i.grams}g`).join('\n');
      return `[${m.name}]\n${items}`;
    }).join('\n\n');
    navigator.clipboard.writeText(text);
    alert("تم نسخ النظام بنجاح!");
  };

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMeals((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans" dir="rtl">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-10 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-600/20">
              <Lock className="text-white" size={30} />
            </div>
            <h1 className="text-2xl font-black text-white">Smart Nutrition PRO</h1>
            <p className="text-neutral-500 text-sm mt-2">يرجى تسجيل الدخول للمتابعة</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" placeholder="كلمة المرور"
              className="w-full p-4 bg-black border border-neutral-800 rounded-2xl outline-none text-white text-center focus:border-blue-600 transition-all"
              value={password} onChange={(e) => setPassword(e.target.value)} 
            />
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl shadow-lg transition-all">دخول النظام</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-all duration-300 font-sans pb-20", theme === 'dark' ? "bg-[#080808] text-white" : "bg-gray-50 text-gray-900")} dir="rtl">
      
      {/* --- Navbar --- */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-neutral-800/50 bg-black/50 px-6 py-4 mb-8">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><Layout size={20} className="text-white"/></div>
            <h1 className="text-lg font-black tracking-tight">Smart Nutrition <span className="text-blue-500">PRO</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={saveAsTemplate} className="flex items-center gap-2 px-4 py-2 bg-emerald-600/10 text-emerald-500 border border-emerald-600/20 rounded-xl text-xs font-black hover:bg-emerald-600 hover:text-white transition-all">
              <Save size={14}/> حفظ كقالب
            </button>
            <button onClick={copyPlanToClipboard} className="p-2.5 bg-neutral-800 rounded-xl hover:bg-neutral-700 transition-all text-neutral-400 hover:text-white">
              <ClipboardCheck size={20}/>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- Sidebar --- */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Templates Section */}
            {templates.length > 0 && (
              <div className="p-6 bg-neutral-900/40 border border-neutral-800/50 rounded-[2rem]">
                <h3 className="flex items-center gap-2 mb-4 text-xs font-black uppercase text-neutral-500 tracking-widest"><ExternalLink size={14}/> القوالب المحفوظة</h3>
                <div className="space-y-2">
                  {templates.map(t => (
                    <button key={t.id} onClick={() => loadTemplate(t)} className="w-full flex justify-between items-center p-4 bg-black/40 border border-neutral-800 rounded-2xl hover:border-blue-600/50 group transition-all">
                      <span className="text-sm font-bold">{t.templateName}</span>
                      <span className="text-[10px] text-neutral-600 group-hover:text-blue-500">تحميل</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Target Macros */}
            <div className="p-6 bg-neutral-900/40 border border-neutral-800/50 rounded-[2rem]">
              <h3 className="flex items-center gap-2 mb-6 text-xs font-black uppercase text-neutral-500 tracking-widest"><Settings size={14}/> الأهداف اليومية</h3>
              <div className="grid grid-cols-2 gap-3">
                <MacroInput label="السعرات" value={targetMacros.calories} onChange={(v) => setTargetMacros({...targetMacros, calories: v})} color="orange" />
                <MacroInput label="البروتين" value={targetMacros.protein} onChange={(v) => setTargetMacros({...targetMacros, protein: v})} color="red" />
                <MacroInput label="الكارب" value={targetMacros.carbs} onChange={(v) => setTargetMacros({...targetMacros, carbs: v})} color="blue" />
                <MacroInput label="الدهون" value={targetMacros.fat} onChange={(v) => setTargetMacros({...targetMacros, fat: v})} color="yellow" />
              </div>
            </div>
          </aside>

          {/* --- Main Content --- */}
          <main className="lg:col-span-8 space-y-6">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
              <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                {meals.map((meal) => (
                  <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    onUpdate={(updated) => setMeals(meals.map(m => m.id === meal.id ? updated : m))}
                    onDelete={() => setMeals(meals.filter(m => m.id !== meal.id))}
                    onAddItems={() => { setActiveMealId(meal.id); setIsModalOpen(true); }}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            <button 
              onClick={() => setMeals([...meals, { id: `meal-${Date.now()}`, name: `وجبة ${meals.length + 1}`, items: [] }])}
              className="w-full py-10 border-2 border-dashed border-neutral-800 rounded-[2.5rem] text-neutral-600 hover:border-blue-600 hover:text-blue-500 transition-all flex flex-col items-center gap-2"
            >
              <Plus size={30}/>
              <span className="font-black text-sm">إضافة وجبة جديدة</span>
            </button>
          </main>
        </div>
      </div>

      {/* --- Food Picker Modal --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-[3rem] p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black">اختر الأصناف</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-neutral-800 rounded-full"><X/></button>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {FOOD_DATABASE.map(food => (
                <button 
                  key={food.id}
                  onClick={() => {
                    if (!activeMealId) return;
                    const newItem: FoodItem = { ...food, grams: 100, instId: `${food.id}-${Date.now()}` };
                    setMeals(meals.map(m => m.id === activeMealId ? { ...m, items: [...m.items, newItem] } : m));
                    setIsModalOpen(false);
                  }}
                  className="flex justify-between items-center p-5 bg-black/40 border border-neutral-800 rounded-2xl hover:border-blue-600 transition-all text-right"
                >
                  <div>
                    <p className="font-bold text-sm">{food.name}</p>
                    <p className="text-[10px] text-neutral-500">{food.category} • {food.calories} kcal/100g</p>
                  </div>
                  <Plus size={18} className="text-blue-500"/>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== Components (Strictly Typed) ==========

function MealCard({ meal, onUpdate, onDelete, onAddItems }: { meal: Meal, onUpdate: (m: Meal) => void, onDelete: () => void, onAddItems: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: meal.id });
  
  const totals = meal.items.reduce((acc, it) => {
    const r = it.grams / 100;
    return {
      cal: acc.cal + it.calories * r,
      pro: acc.pro + it.protein * r,
      carb: acc.carb + it.carbs * r,
      fat: acc.fat + it.fat * r,
    };
  }, { cal: 0, pro: 0, carb: 0, fat: 0 });

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="bg-neutral-900/40 border border-neutral-800 rounded-[2.5rem] overflow-hidden">
      <div className="p-6 border-b border-neutral-800/50 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <button {...attributes} {...listeners} className="text-neutral-700 hover:text-neutral-500"><GripVertical size={20}/></button>
          <input 
            className="bg-transparent font-black text-xl outline-none focus:text-blue-500 transition-all" 
            value={meal.name} onChange={(e) => onUpdate({...meal, name: e.target.value})} 
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden md:flex gap-2">
             <MacroBadge value={totals.cal} label="Kcal" color="orange" />
             <MacroBadge value={totals.pro} label="P" color="red" />
             <MacroBadge value={totals.carb} label="C" color="blue" />
             <MacroBadge value={totals.fat} label="F" color="yellow" />
          </div>
          <button onClick={onDelete} className="p-2 text-neutral-600 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
        </div>
      </div>

      <div className="p-6 space-y-3">
        {meal.items.map(item => (
          <div key={item.instId} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-neutral-800/50">
            <span className="font-bold text-sm text-neutral-300">{item.name}</span>
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                 <input 
                   type="number" className="w-16 bg-neutral-800 border-none rounded-lg p-1.5 text-center text-xs font-black"
                   value={item.grams} onChange={(e) => onUpdate({
                     ...meal, 
                     items: meal.items.map(i => i.instId === item.instId ? {...i, grams: Number(e.target.value)} : i)
                   })}
                 />
                 <span className="text-[10px] font-bold text-neutral-600">جم</span>
               </div>
               <button onClick={() => onUpdate({...meal, items: meal.items.filter(i => i.instId !== item.instId)})} className="text-neutral-700 hover:text-red-500"><X size={14}/></button>
            </div>
          </div>
        ))}
        <button onClick={onAddItems} className="w-full py-4 rounded-2xl bg-blue-600/5 border border-blue-600/10 text-blue-500 font-black text-xs hover:bg-blue-600 hover:text-white transition-all">
          + إضافة صنف للوجبة
        </button>
      </div>
    </div>
  );
}

function MacroInput({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) {
  const colors: Record<string, string> = {
    orange: "text-orange-500 bg-orange-500/5 border-orange-500/10 focus-within:border-orange-500",
    red: "text-red-500 bg-red-500/5 border-red-500/10 focus-within:border-red-500",
    blue: "text-blue-500 bg-blue-500/5 border-blue-500/10 focus-within:border-blue-500",
    yellow: "text-yellow-500 bg-yellow-500/5 border-yellow-500/10 focus-within:border-yellow-500",
  };
  return (
    <div className={cn("p-4 rounded-2xl border transition-all", colors[color])}>
      <label className="text-[9px] font-black uppercase opacity-60 block mb-1">{label}</label>
      <input 
        type="number" className="bg-transparent w-full outline-none font-black text-lg"
        value={value} onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function MacroBadge({ value, label, color }: { value: number, label: string, color: string }) {
  const colors: Record<string, string> = {
    orange: "bg-orange-500/10 text-orange-500",
    red: "bg-red-500/10 text-red-500",
    blue: "bg-blue-500/10 text-blue-500",
    yellow: "bg-yellow-500/10 text-yellow-500",
  };
  return (
    <div className={cn("px-3 py-1.5 rounded-full text-[10px] font-black border border-white/5", colors[color])}>
      {Math.round(value)} <span className="opacity-50 text-[8px]">{label}</span>
    </div>
  );
}