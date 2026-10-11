"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus, Trash2, Copy, Printer, Sun, Moon, ChevronDown, ChevronUp,
  GripVertical, Users, Calculator, UtensilsCrossed, BarChart2,
  TrendingUp, TrendingDown, Minus, Save, History, ArrowLeft,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) { return twMerge(clsx(inputs)); }

// ─── FOOD DATABASE ────────────────────────────────────────────────────────────
interface FoodEntry {
  id: number; name: string; category: string; state: string;
  carbs: number; protein: number; fat: number; calories: number;
}

const FOOD_DATABASE: FoodEntry[] = [
  // ── PROTEINS ──────────────────────────────────────────────────────────────
  { id: 101, name: "Chicken Breast - صدر دجاج", category: "Protein", state: "per 100g", carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 102, name: "Chicken Thigh - فخذ دجاج", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 10.9, calories: 209 },
  { id: 103, name: "Ground Beef (lean) - لحم مفروم", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 7, calories: 172 },
  { id: 104, name: "Beef Steak - ستيك لحم", category: "Protein", state: "per 100g", carbs: 0, protein: 27, fat: 8, calories: 180 },
  { id: 105, name: "Lamb - لحم ضاني", category: "Protein", state: "per 100g", carbs: 0, protein: 25, fat: 14, calories: 218 },
  { id: 106, name: "Tuna (canned in water) - تونة", category: "Protein", state: "per 100g", carbs: 0, protein: 25, fat: 1, calories: 116 },
  { id: 107, name: "Salmon - سلمون", category: "Protein", state: "per 100g", carbs: 0, protein: 20, fat: 13, calories: 208 },
  { id: 108, name: "Tilapia - بلطي", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 2.7, calories: 128 },
  { id: 109, name: "Shrimp - جمبري", category: "Protein", state: "per 100g", carbs: 0.9, protein: 24, fat: 0.3, calories: 99 },
  { id: 110, name: "Turkey Breast - ديك رومي", category: "Protein", state: "per 100g", carbs: 0, protein: 29, fat: 1, calories: 135 },
  { id: 111, name: "Sardines - سردين", category: "Protein", state: "per 100g", carbs: 0, protein: 21, fat: 11, calories: 185 },
  // ── EGGS ─────────────────────────────────────────────────────────────────
  { id: 120, name: "Whole Egg - بيضة كاملة", category: "Eggs", state: "per 100g", carbs: 1.1, protein: 13, fat: 10, calories: 143 },
  { id: 121, name: "Egg White - بياض البيض", category: "Eggs", state: "per 100g", carbs: 0.7, protein: 11, fat: 0.2, calories: 52 },
  { id: 122, name: "Egg Yolk - صفار البيض", category: "Eggs", state: "per 100g", carbs: 3.6, protein: 16, fat: 27, calories: 322 },
  { id: 123, name: "Boiled Egg (1 large) - بيضة مسلوقة", category: "Eggs", state: "per piece (50g)", carbs: 0.6, protein: 6.3, fat: 5, calories: 72 },
  { id: 124, name: "Fried Egg (1 large) - بيضة مقلية", category: "Eggs", state: "per piece (46g)", carbs: 0.4, protein: 6.3, fat: 7, calories: 90 },
  { id: 125, name: "Scrambled Egg (1 large) - بيض مخفوق", category: "Eggs", state: "per piece (61g)", carbs: 1.4, protein: 6.8, fat: 7.5, calories: 102 },
  { id: 126, name: "Egg White only (1 large) - بياض بيضة", category: "Eggs", state: "per piece (33g)", carbs: 0.2, protein: 3.6, fat: 0.1, calories: 17 },
  // ── DAIRY ────────────────────────────────────────────────────────────────
  { id: 201, name: "Low-Fat Yogurt - زبادي قليل الدسم", category: "Dairy", state: "per 100g", carbs: 7, protein: 5, fat: 1.5, calories: 61 },
  { id: 202, name: "Full-Fat Yogurt - زبادي كامل الدسم", category: "Dairy", state: "per 100g", carbs: 4.7, protein: 3.5, fat: 3.3, calories: 61 },
  { id: 203, name: "Cottage Cheese - جبن قريش", category: "Dairy", state: "per 100g", carbs: 3.4, protein: 11, fat: 4, calories: 98 },
  { id: 204, name: "Feta Cheese - جبن فيتا", category: "Dairy", state: "per 100g", carbs: 4, protein: 14, fat: 21, calories: 264 },
  { id: 205, name: "Cheddar Cheese - جبن شيدر", category: "Dairy", state: "per 100g", carbs: 1.3, protein: 25, fat: 33, calories: 402 },
  { id: 206, name: "Mozzarella - موزاريلا", category: "Dairy", state: "per 100g", carbs: 2.2, protein: 22, fat: 17, calories: 254 },
  { id: 207, name: "Cream Cheese - كريم تشيز", category: "Dairy", state: "per 100g", carbs: 4.1, protein: 6.2, fat: 34, calories: 350 },
  { id: 208, name: "Butter - زبدة", category: "Dairy", state: "per 100g", carbs: 0.1, protein: 0.9, fat: 80, calories: 717 },
  { id: 209, name: "Labneh - لبنة", category: "Dairy", state: "per 100g", carbs: 4, protein: 7, fat: 5, calories: 89 },
  { id: 210, name: "Whipping Cream - كريمة خفق", category: "Dairy", state: "per 100g", carbs: 3.6, protein: 2.5, fat: 36, calories: 340 },
  { id: 211, name: "Greek Yogurt (low-fat) - زبادي يوناني", category: "Dairy", state: "per 100g", carbs: 4, protein: 10, fat: 0.7, calories: 59 },
  { id: 212, name: "Greek Yogurt (full-fat) - زبادي يوناني كامل", category: "Dairy", state: "per 100g", carbs: 3.6, protein: 9, fat: 5, calories: 97 },
  { id: 213, name: "Rayeb Yogurt - رايب", category: "Dairy", state: "per 100g", carbs: 5, protein: 3.5, fat: 3, calories: 60 },
  // ── MILK ──────────────────────────────────────────────────────────────────
  { id: 412, name: "Whole Milk - حليب كامل الدسم", category: "Milk", state: "per 1L", carbs: 47, protein: 32, fat: 36, calories: 610 },
  { id: 413, name: "Skim Milk - حليب خالي الدسم", category: "Milk", state: "per 1L", carbs: 50, protein: 35, fat: 2, calories: 360 },
  { id: 414, name: "Semi-Skim Milk - حليب نصف دسم", category: "Milk", state: "per 1L", carbs: 48, protein: 33, fat: 18, calories: 470 },
  { id: 415, name: "Almarai Protein Milk - حليب ألمراي بروتين", category: "Milk", state: "per 1L", carbs: 50, protein: 50, fat: 2, calories: 420 },
  { id: 416, name: "Oat Milk - حليب الشوفان", category: "Milk", state: "per 1L", carbs: 70, protein: 10, fat: 15, calories: 450 },
  { id: 417, name: "Almond Milk (unsweetened) - حليب اللوز", category: "Milk", state: "per 1L", carbs: 12, protein: 4, fat: 15, calories: 200 },
  // ── CARBS ─────────────────────────────────────────────────────────────────
  { id: 301, name: "White Rice - أرز أبيض", category: "Carbs", state: "per 100g cooked", carbs: 28, protein: 2.7, fat: 0.3, calories: 130 },
  { id: 302, name: "Brown Rice - أرز بني", category: "Carbs", state: "per 100g cooked", carbs: 23, protein: 2.6, fat: 0.9, calories: 112 },
  { id: 303, name: "Oats - شوفان", category: "Carbs", state: "per 100g dry", carbs: 66, protein: 17, fat: 7, calories: 389 },
  { id: 304, name: "Whole Wheat Bread - خبز قمح كامل", category: "Carbs", state: "per 100g", carbs: 43, protein: 9, fat: 3.4, calories: 247 },
  { id: 305, name: "White Bread - خبز أبيض", category: "Carbs", state: "per 100g", carbs: 49, protein: 9, fat: 3.2, calories: 265 },
  { id: 306, name: "Pasta - مكرونة", category: "Carbs", state: "per 100g cooked", carbs: 25, protein: 5, fat: 0.9, calories: 131 },
  { id: 307, name: "Whole Wheat Pasta - مكرونة قمح كامل", category: "Carbs", state: "per 100g cooked", carbs: 23, protein: 5.5, fat: 0.8, calories: 124 },
  { id: 308, name: "Sweet Potato - بطاطا حلوة", category: "Carbs", state: "per 100g", carbs: 20, protein: 1.6, fat: 0.1, calories: 86 },
  { id: 309, name: "White Potato - بطاطس", category: "Carbs", state: "per 100g", carbs: 17, protein: 2, fat: 0.1, calories: 77 },
  { id: 310, name: "Bread (Baladi) - خبز بلدي", category: "Carbs", state: "per 100g", carbs: 52, protein: 8, fat: 1.5, calories: 253 },
  { id: 311, name: "Quinoa - كينوا", category: "Carbs", state: "per 100g cooked", carbs: 22, protein: 4, fat: 1.9, calories: 120 },
  { id: 312, name: "Lentils (cooked) - عدس", category: "Carbs", state: "per 100g", carbs: 20, protein: 9, fat: 0.4, calories: 116 },
  { id: 313, name: "Chickpeas (cooked) - حمص", category: "Carbs", state: "per 100g", carbs: 27, protein: 9, fat: 2.6, calories: 164 },
  { id: 314, name: "Fava Beans (Ful) - فول مدمس", category: "Carbs", state: "per 100g", carbs: 26, protein: 8, fat: 0.5, calories: 110 },
  { id: 315, name: "Corn - ذرة", category: "Carbs", state: "per 100g", carbs: 19, protein: 3.2, fat: 1.2, calories: 96 },
  // ── VEGETABLES ────────────────────────────────────────────────────────────
  { id: 501, name: "Broccoli - بروكلي", category: "Vegetables", state: "per 100g", carbs: 7, protein: 2.8, fat: 0.4, calories: 34 },
  { id: 502, name: "Spinach - سبانخ", category: "Vegetables", state: "per 100g", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23 },
  { id: 503, name: "Cucumber - خيار", category: "Vegetables", state: "per 100g", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 16 },
  { id: 504, name: "Tomato - طماطم", category: "Vegetables", state: "per 100g", carbs: 3.9, protein: 0.9, fat: 0.2, calories: 18 },
  { id: 505, name: "Lettuce - خس", category: "Vegetables", state: "per 100g", carbs: 2.9, protein: 1.4, fat: 0.2, calories: 15 },
  { id: 506, name: "Bell Pepper - فلفل رومي", category: "Vegetables", state: "per 100g", carbs: 6, protein: 1, fat: 0.3, calories: 31 },
  { id: 507, name: "Cauliflower - قرنبيط", category: "Vegetables", state: "per 100g", carbs: 5, protein: 1.9, fat: 0.3, calories: 25 },
  { id: 508, name: "Green Beans - فاصوليا خضراء", category: "Vegetables", state: "per 100g", carbs: 7, protein: 1.8, fat: 0.1, calories: 31 },
  { id: 509, name: "Zucchini - كوسة", category: "Vegetables", state: "per 100g", carbs: 3.1, protein: 1.2, fat: 0.3, calories: 17 },
  { id: 510, name: "Eggplant - باذنجان", category: "Vegetables", state: "per 100g", carbs: 5.9, protein: 1, fat: 0.2, calories: 25 },
  { id: 511, name: "Carrots - جزر", category: "Vegetables", state: "per 100g", carbs: 10, protein: 0.9, fat: 0.2, calories: 41 },
  { id: 512, name: "Onion - بصل", category: "Vegetables", state: "per 100g", carbs: 9.3, protein: 1.1, fat: 0.1, calories: 40 },
  { id: 513, name: "Garlic - ثوم", category: "Vegetables", state: "per 100g", carbs: 33, protein: 6.4, fat: 0.5, calories: 149 },
  { id: 514, name: "Mushrooms - فطر", category: "Vegetables", state: "per 100g", carbs: 3.3, protein: 3.1, fat: 0.3, calories: 22 },
  { id: 515, name: "Peas - بازلاء", category: "Vegetables", state: "per 100g", carbs: 14, protein: 5.4, fat: 0.4, calories: 81 },
  { id: 516, name: "Molokhia - ملوخية", category: "Vegetables", state: "per 100g", carbs: 7, protein: 4.5, fat: 0.7, calories: 43 },
  { id: 517, name: "Arugula (Rocket) - جرجير", category: "Vegetables", state: "per 100g", carbs: 3.7, protein: 2.6, fat: 0.7, calories: 25 },
  { id: 518, name: "Parsley - بقدونس", category: "Vegetables", state: "per 100g", carbs: 6.3, protein: 3, fat: 0.8, calories: 36 },
  // ── FATS ──────────────────────────────────────────────────────────────────
  { id: 601, name: "Olive Oil - زيت زيتون", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 602, name: "Coconut Oil - زيت جوز الهند", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 892 },
  { id: 603, name: "Avocado - أفوكادو", category: "Fats", state: "per 100g", carbs: 9, protein: 2, fat: 15, calories: 160 },
  { id: 604, name: "Almonds - لوز", category: "Fats", state: "per 100g", carbs: 22, protein: 21, fat: 50, calories: 579 },
  { id: 605, name: "Walnuts - جوز", category: "Fats", state: "per 100g", carbs: 14, protein: 15, fat: 65, calories: 654 },
  { id: 606, name: "Cashews - كاجو", category: "Fats", state: "per 100g", carbs: 30, protein: 18, fat: 44, calories: 553 },
  { id: 607, name: "Peanut Butter - زبدة الفول السوداني", category: "Fats", state: "per 100g", carbs: 20, protein: 25, fat: 50, calories: 588 },
  { id: 608, name: "Peanuts - فول سوداني", category: "Fats", state: "per 100g", carbs: 16, protein: 26, fat: 49, calories: 567 },
  { id: 609, name: "Sunflower Seeds - بذور عباد الشمس", category: "Fats", state: "per 100g", carbs: 20, protein: 21, fat: 51, calories: 584 },
  { id: 610, name: "Tahini - طحينة", category: "Fats", state: "per 100g", carbs: 21, protein: 17, fat: 54, calories: 595 },
  { id: 611, name: "Flaxseeds - بذور الكتان", category: "Fats", state: "per 100g", carbs: 29, protein: 18, fat: 42, calories: 534 },
  { id: 612, name: "Chia Seeds - بذور الشيا", category: "Fats", state: "per 100g", carbs: 42, protein: 17, fat: 31, calories: 486 },
  // ── FRUITS ────────────────────────────────────────────────────────────────
  { id: 701, name: "Banana - موز", category: "Fruits", state: "per 100g", carbs: 23, protein: 1.1, fat: 0.3, calories: 89 },
  { id: 702, name: "Apple - تفاح", category: "Fruits", state: "per 100g", carbs: 14, protein: 0.3, fat: 0.2, calories: 52 },
  { id: 703, name: "Orange - برتقال", category: "Fruits", state: "per 100g", carbs: 12, protein: 0.9, fat: 0.1, calories: 47 },
  { id: 704, name: "Mango - مانجو", category: "Fruits", state: "per 100g", carbs: 15, protein: 0.8, fat: 0.4, calories: 60 },
  { id: 705, name: "Strawberry - فراولة", category: "Fruits", state: "per 100g", carbs: 8, protein: 0.7, fat: 0.3, calories: 32 },
  { id: 706, name: "Watermelon - بطيخ", category: "Fruits", state: "per 100g", carbs: 8, protein: 0.6, fat: 0.2, calories: 30 },
  { id: 707, name: "Grapes - عنب", category: "Fruits", state: "per 100g", carbs: 18, protein: 0.7, fat: 0.2, calories: 69 },
  { id: 708, name: "Dates - تمر", category: "Fruits", state: "per 100g", carbs: 75, protein: 1.8, fat: 0.2, calories: 282 },
  { id: 709, name: "Figs - تين", category: "Fruits", state: "per 100g", carbs: 19, protein: 0.7, fat: 0.3, calories: 74 },
  { id: 710, name: "Pomegranate - رمان", category: "Fruits", state: "per 100g", carbs: 19, protein: 1.7, fat: 1.2, calories: 83 },
  { id: 711, name: "Lemon - ليمون", category: "Fruits", state: "per 100g", carbs: 9, protein: 1.1, fat: 0.3, calories: 29 },
  { id: 712, name: "Pineapple - أناناس", category: "Fruits", state: "per 100g", carbs: 13, protein: 0.5, fat: 0.1, calories: 50 },
  { id: 713, name: "Peach - خوخ", category: "Fruits", state: "per 100g", carbs: 10, protein: 0.9, fat: 0.3, calories: 39 },
  { id: 714, name: "Pear - كمثرى", category: "Fruits", state: "per 100g", carbs: 15, protein: 0.4, fat: 0.1, calories: 57 },
  // ── SUPPLEMENTS ───────────────────────────────────────────────────────────
  { id: 901, name: "Whey Protein - بروتين مصل اللبن", category: "Supplements", state: "per 30g scoop", carbs: 3, protein: 24, fat: 1.5, calories: 120 },
  { id: 902, name: "Casein Protein - بروتين كازين", category: "Supplements", state: "per 30g scoop", carbs: 4, protein: 24, fat: 1, calories: 120 },
  { id: 903, name: "Plant Protein - بروتين نباتي", category: "Supplements", state: "per 30g scoop", carbs: 5, protein: 20, fat: 2, calories: 118 },
  { id: 904, name: "Mass Gainer - مكسب كتلة", category: "Supplements", state: "per 100g", carbs: 75, protein: 14, fat: 2, calories: 378 },
  { id: 905, name: "BCAA - أحماض أمينية", category: "Supplements", state: "per 10g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 906, name: "Creatine - كرياتين", category: "Supplements", state: "per 5g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 907, name: "Pre-Workout - ما قبل التمرين", category: "Supplements", state: "per serving", carbs: 5, protein: 0, fat: 0, calories: 20 },
  { id: 908, name: "Omega-3 - أوميغا 3", category: "Supplements", state: "per 2 capsules", carbs: 0, protein: 0, fat: 2, calories: 18 },
  { id: 920, name: "Peak Man Multivitamin - بيك مان", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 921, name: "Centrum Multivitamin - سنتروم", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 922, name: "Vitastress - فيتاستريس", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 923, name: "L-Citrulline 5000mg - سيترولين", category: "Supplements", state: "per 5g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 924, name: "L-Carnitine Liquid 1500mg - كارنيتين سائل", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 925, name: "L-Carnitine 500mg tablet - كارنيتين أقراص", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 926, name: "Vitamin D3 - فيتامين د3", category: "Supplements", state: "per capsule", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 927, name: "Zinc - زنك", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 928, name: "Magnesium - مغنيسيوم", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 929, name: "Iron - حديد", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 930, name: "Vitamin C 1000mg - فيتامين ج", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 931, name: "B-Complex - فيتامين ب مركب", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 932, name: "Melatonin 5mg - ميلاتونين", category: "Supplements", state: "per tablet", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 933, name: "Collagen - كولاجين", category: "Supplements", state: "per 10g scoop", carbs: 0, protein: 9, fat: 0, calories: 36 },
  // ── BEVERAGES ─────────────────────────────────────────────────────────────
  { id: 951, name: "Black Tea - شاي أسود", category: "Beverages", state: "per cup (240ml)", carbs: 0.7, protein: 0, fat: 0, calories: 2 },
  { id: 952, name: "Green Tea - شاي أخضر", category: "Beverages", state: "per cup (240ml)", carbs: 0.5, protein: 0, fat: 0, calories: 2 },
  { id: 953, name: "Herbal Tea - شاي أعشاب", category: "Beverages", state: "per cup (240ml)", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 954, name: "Arabic Coffee - قهوة عربية", category: "Beverages", state: "per cup (100ml)", carbs: 0, protein: 0, fat: 0, calories: 2 },
  { id: 955, name: "Espresso - إسبريسو", category: "Beverages", state: "per shot (30ml)", carbs: 0.5, protein: 0.2, fat: 0, calories: 3 },
  { id: 956, name: "Filter Coffee - قهوة فلتر", category: "Beverages", state: "per cup (240ml)", carbs: 0, protein: 0.3, fat: 0, calories: 2 },
  { id: 957, name: "Nescafé Instant - نسكافيه", category: "Beverages", state: "per teaspoon (1.8g)", carbs: 0.9, protein: 0.3, fat: 0, calories: 4 },
  // ── SWEETENERS ────────────────────────────────────────────────────────────
  { id: 961, name: "Stevia - ستيفيا", category: "Sweeteners", state: "per packet (1g)", carbs: 1, protein: 0, fat: 0, calories: 0 },
  { id: 962, name: "Diet Sugar / Splenda - سكر دايت", category: "Sweeteners", state: "per packet (1g)", carbs: 1, protein: 0, fat: 0, calories: 0 },
  { id: 963, name: "Erythritol - إيريثريتول", category: "Sweeteners", state: "per 100g", carbs: 100, protein: 0, fat: 0, calories: 20 },
  { id: 964, name: "White Sugar - سكر أبيض", category: "Sweeteners", state: "per 100g", carbs: 100, protein: 0, fat: 0, calories: 387 },
];

// ─── INTERFACES ────────────────────────────────────────────────────────────────
interface FoodItem {
  id: number; name: string; category: string; state: string;
  carbs: number; protein: number; fat: number; calories: number;
  grams: number; instId: string;
}
interface Meal { id: string; name: string; notes: string; items: FoodItem[]; }
interface TargetMacros { calories: number; protein: number; carbs: number; fat: number; }
interface Template { id: number; name: string; meals: Meal[]; targetMacros: TargetMacros; createdAt: string; }
interface BodyMeasurements {
  weight: number; height: number; bodyFat: number;
  arms: number; thighs: number; waist: number;
  hip: number; highHip: number; neck: number;
}
interface ClientCheckIn { id: number; date: string; measurements: BodyMeasurements; notes: string; }
interface DietPlanSnapshot { id: number; date: string; label: string; meals: Meal[]; targetMacros: TargetMacros; notes: string; }
interface Client {
  id: number; name: string; goal: string; phone: string; coach: string; createdAt: string;
  checkIns: ClientCheckIn[]; dietPlans: DietPlanSnapshot[];
}

const EMPTY_MEASUREMENTS: BodyMeasurements = { weight: 0, height: 0, bodyFat: 0, arms: 0, thighs: 0, waist: 0, hip: 0, highHip: 0, neck: 0 };

function displayName(fullName: string, lang: "ar" | "en" | "both"): string {
  const parts = fullName.split(" - ");
  if (parts.length === 2) {
    if (lang === "en") return parts[0];
    if (lang === "ar") return parts[1];
  }
  return fullName;
}

function normalizeAr(s: string) {
  return s.replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();
}

function calcMacros(item: FoodItem) {
  const r = item.grams / 100;
  return {
    carbs: +(item.carbs * r).toFixed(1),
    protein: +(item.protein * r).toFixed(1),
    fat: +(item.fat * r).toFixed(1),
    calories: +(item.calories * r).toFixed(0),
  };
}

function mealTotals(meal: Meal) {
  return meal.items.reduce((acc, item) => {
    const m = calcMacros(item);
    return { carbs: acc.carbs + m.carbs, protein: acc.protein + m.protein, fat: acc.fat + m.fat, calories: acc.calories + m.calories };
  }, { carbs: 0, protein: 0, fat: 0, calories: 0 });
}

function grandTotals(meals: Meal[]) {
  return meals.reduce((acc, meal) => {
    const t = mealTotals(meal);
    return { carbs: acc.carbs + t.carbs, protein: acc.protein + t.protein, fat: acc.fat + t.fat, calories: acc.calories + t.calories };
  }, { carbs: 0, protein: 0, fat: 0, calories: 0 });
}

const CATEGORIES = Array.from(new Set(FOOD_DATABASE.map(f => f.category)));

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}

function TrendArrow({ metric, current, previous, goal }: { metric: string; current: number; previous: number; goal: string }) {
  if (!previous || !current) return <span className="text-gray-400">—</span>;
  const diff = current - previous;
  if (diff === 0) return <span className="text-yellow-500 font-bold">= {current}</span>;
  const isGoodIncrease = ["arms", "neck"].includes(metric);
  const isNeutral = metric === "height";
  const upGood = metric === "weight" ? goal === "gain" : isGoodIncrease;
  const isGood = diff > 0 ? upGood : !upGood;
  if (isNeutral) return <span className="text-blue-400">{current}</span>;
  return (
    <span className={cn("font-bold flex items-center gap-1", isGood ? "text-green-500" : "text-red-500")}>
      {diff > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
      {current} ({diff > 0 ? "+" : ""}{diff.toFixed(1)})
    </span>
  );
}

function MacroPieChart({ carbs, protein, fat }: { carbs: number; protein: number; fat: number }) {
  const total = carbs + protein + fat;
  if (total === 0) return null;
  const pC = (carbs / total) * 100, pP = (protein / total) * 100;
  const cx = 50, cy = 50, r = 40;
  function slice(pct: number, startPct: number, color: string) {
    const a1 = (startPct / 100) * 2 * Math.PI - Math.PI / 2;
    const a2 = ((startPct + pct) / 100) * 2 * Math.PI - Math.PI / 2;
    const large = pct > 50 ? 1 : 0;
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    const x2 = cx + r * Math.cos(a2), y2 = cy + r * Math.sin(a2);
    return <path key={color} d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`} fill={color} />;
  }
  return (
    <svg viewBox="0 0 100 100" className="w-16 h-16">
      {slice(pC, 0, "#f59e0b")}{slice(pP, pC, "#3b82f6")}{slice(100 - pC - pP, pC + pP, "#ef4444")}
    </svg>
  );
}

function ProgressLineChart({ checkIns, metric, label, goal }: { checkIns: ClientCheckIn[]; metric: keyof BodyMeasurements; label: string; goal: string }) {
  if (checkIns.length < 2) return <p className="text-xs text-gray-400 text-center py-4">Need 2+ check-ins for chart</p>;
  const pts = checkIns.map(c => c.measurements[metric]).filter(v => v > 0);
  if (pts.length < 2) return null;
  const labels = checkIns.filter(c => c.measurements[metric] > 0).map(c => c.date.slice(5));
  const min = Math.min(...pts) * 0.98, max = Math.max(...pts) * 1.02;
  const W = 300, H = 100;
  const toX = (i: number) => (i / (pts.length - 1)) * (W - 20) + 10;
  const toY = (v: number) => H - ((v - min) / (max - min)) * (H - 20) - 10;
  const d = pts.map((v, i) => `${i === 0 ? "M" : "L"}${toX(i)},${toY(v)}`).join(" ");
  return (
    <div className="w-full">
      <p className="text-xs font-semibold text-center mb-1">{label}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-24 bg-gray-50 dark:bg-gray-800 rounded">
        <polyline points={pts.map((v, i) => `${toX(i)},${toY(v)}`).join(" ")} fill="none" stroke="#3b82f6" strokeWidth="2" />
        {pts.map((v, i) => (
          <g key={i}>
            <circle cx={toX(i)} cy={toY(v)} r="3" fill="#3b82f6" />
            <text x={toX(i)} y={H - 2} fontSize="8" textAnchor="middle" fill="#6b7280">{labels[i]}</text>
            <text x={toX(i)} y={toY(v) - 5} fontSize="8" textAnchor="middle" fill="#374151">{v}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}

// ─── SORTABLE FOOD ITEM ─────────────────────────────────────────────────────────
function SortableFoodItem({ item, onRemove, onGramsChange, lang }: {
  item: FoodItem; onRemove: () => void; onGramsChange: (g: number) => void; lang: "ar" | "en" | "both";
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.instId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const m = calcMacros(item);
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm">
      <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 touch-none">
        <GripVertical size={16} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate text-xs">{displayName(item.name, lang)}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{item.state}</div>
        <div className="text-xs text-gray-500 flex gap-2 mt-0.5">
          <span className="text-yellow-600">{m.carbs}g C</span>
          <span className="text-blue-600">{m.protein}g P</span>
          <span className="text-red-600">{m.fat}g F</span>
          <span className="font-semibold">{m.calories} kcal</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <input
          type="number" min="0" step="1"
          value={item.grams}
          onChange={e => onGramsChange(+e.target.value)}
          className="w-16 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 px-1 py-0.5 text-xs"
        />
        <span className="text-xs text-gray-500">g</span>
      </div>
      <button onClick={onRemove} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
    </div>
  );
}

// ─── MEAL CARD ─────────────────────────────────────────────────────────────────
function MealCard({ meal, onUpdate, onDelete, lang }: {
  meal: Meal; onUpdate: (m: Meal) => void; onDelete: () => void; lang: "ar" | "en" | "both";
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const totals = mealTotals(meal);

  const filtered = FOOD_DATABASE.filter(f => {
    const q = normalizeAr(search);
    const matchQ = !q || normalizeAr(f.name).includes(q);
    const matchC = selectedCat === "All" || f.category === selectedCat;
    return matchQ && matchC;
  });

  function addItem(food: FoodEntry) {
    const newItem: FoodItem = { ...food, grams: 100, instId: `${food.id}-${Date.now()}-${Math.random()}` };
    onUpdate({ ...meal, items: [...meal.items, newItem] });
  }
  function removeItem(instId: string) {
    onUpdate({ ...meal, items: meal.items.filter(i => i.instId !== instId) });
  }
  function updateGrams(instId: string, grams: number) {
    onUpdate({ ...meal, items: meal.items.map(i => i.instId === instId ? { ...i, grams } : i) });
  }
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = meal.items.findIndex(i => i.instId === active.id);
      const newIdx = meal.items.findIndex(i => i.instId === over.id);
      onUpdate({ ...meal, items: arrayMove(meal.items, oldIdx, newIdx) });
    }
  }

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 overflow-hidden print:border-gray-300">
      {/* header */}
      <div className="flex items-center gap-2 p-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 print:bg-white">
        <GripVertical size={16} className="text-gray-400 cursor-grab" />
        <input
          value={meal.name}
          onChange={e => onUpdate({ ...meal, name: e.target.value })}
          className="flex-1 font-semibold bg-transparent border-none outline-none text-sm"
          placeholder="Meal name..."
        />
        <div className="flex gap-1 text-xs text-gray-500 print:hidden">
          <span className="text-yellow-600">{totals.carbs.toFixed(0)}C</span>
          <span className="text-blue-600">{totals.protein.toFixed(0)}P</span>
          <span className="text-red-600">{totals.fat.toFixed(0)}F</span>
          <span className="font-semibold">{totals.calories.toFixed(0)}</span>
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 print:hidden">{collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}</button>
        <button onClick={onDelete} className="text-red-400 hover:text-red-600 print:hidden"><Trash2 size={16} /></button>
      </div>

      {!collapsed && (
        <div className="p-3 space-y-2">
          {/* notes */}
          <textarea
            value={meal.notes}
            onChange={e => onUpdate({ ...meal, notes: e.target.value })}
            rows={2}
            placeholder="Notes / instructions..."
            className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 resize-none print:border-none print:p-0 print:bg-transparent print:whitespace-pre-wrap print:overflow-visible"
          />
          {/* items */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={meal.items.map(i => i.instId)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {meal.items.map(item => (
                  <SortableFoodItem key={item.instId} item={item} lang={lang}
                    onRemove={() => removeItem(item.instId)}
                    onGramsChange={g => updateGrams(item.instId, g)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          {/* add food */}
          <div className="print:hidden space-y-1">
            <div className="flex gap-1">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search food..." className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-800" />
              <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-1 py-1 bg-white dark:bg-gray-800">
                <option value="All">All</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {search && (
              <div className="max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.slice(0, 15).map(f => (
                  <button key={f.id} onClick={() => addItem(f)} className="w-full text-left px-2 py-1 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/30 flex justify-between">
                    <span>{displayName(f.name, lang)}</span>
                    <span className="text-gray-400">{f.state}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MealPlanner() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<"planner" | "calculator" | "clients">("planner");
  const [lang, setLang] = useState<"ar" | "en" | "both">("both");
  const [printLang, setPrintLang] = useState<"ar" | "en" | "both">("both");
  const [copyLang, setCopyLang] = useState<"ar" | "en" | "both">("both");
  const [meals, setMeals] = useState<Meal[]>([{ id: "m1", name: "Meal 1 - وجبة 1", notes: "", items: [] }]);
  const [targetMacros, setTargetMacros] = useState<TargetMacros>({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const [planNotes, setPlanNotes] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientView, setClientView] = useState<"list" | "detail" | "checkin" | "dietplan">("list");
  const [newClient, setNewClient] = useState({ name: "", goal: "cut", phone: "", coach: "" });
  const [newCheckIn, setNewCheckIn] = useState<{ date: string; measurements: BodyMeasurements; notes: string }>({ date: new Date().toISOString().slice(0, 10), measurements: { ...EMPTY_MEASUREMENTS }, notes: "" });
  const [newPlanLabel, setNewPlanLabel] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  // Calculator state
  const [calcData, setCalcData] = useState({ age: 25, weight: 70, height: 170, gender: "male", activity: "1.55", goal: "maintain" });
  const [calcResult, setCalcResult] = useState<{ bmr: number; tdee: number; target: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const saved = localStorage.getItem("pro_planner_v2");
    if (saved) { try { const d = JSON.parse(saved); setMeals(d.meals || []); setTargetMacros(d.targetMacros || {}); setPlanNotes(d.planNotes || ""); } catch {} }
    const savedTpl = localStorage.getItem("pro_templates_v2");
    if (savedTpl) { try { setTemplates(JSON.parse(savedTpl)); } catch {} }
    const savedClients = localStorage.getItem("pro_clients_v2");
    if (savedClients) { try { setClients(JSON.parse(savedClients)); } catch {} }
    const savedDark = localStorage.getItem("pro_dark");
    if (savedDark === "1") { setDark(true); document.documentElement.classList.add("dark"); }
  }, []);

  useEffect(() => {
    localStorage.setItem("pro_planner_v2", JSON.stringify({ meals, targetMacros, planNotes }));
  }, [meals, targetMacros, planNotes]);

  useEffect(() => {
    localStorage.setItem("pro_templates_v2", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem("pro_clients_v2", JSON.stringify(clients));
  }, [clients]);

  function toggleDark() {
    document.documentElement.classList.toggle("dark");
    const nd = !dark; setDark(nd);
    localStorage.setItem("pro_dark", nd ? "1" : "0");
  }

  function handleMealDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oi = meals.findIndex(m => m.id === active.id);
      const ni = meals.findIndex(m => m.id === over.id);
      setMeals(arrayMove(meals, oi, ni));
    }
  }

  function addMeal() {
    setMeals(prev => [...prev, { id: `m${Date.now()}`, name: `Meal ${prev.length + 1}`, notes: "", items: [] }]);
  }

  function updateMeal(id: string, updated: Meal) {
    setMeals(prev => prev.map(m => m.id === id ? updated : m));
  }

  function deleteMeal(id: string) {
    setMeals(prev => prev.filter(m => m.id !== id));
  }

  function saveTemplate() {
    if (!templateName.trim()) return;
    const tpl: Template = { id: Date.now(), name: templateName, meals: JSON.parse(JSON.stringify(meals)), targetMacros, createdAt: new Date().toISOString() };
    setTemplates(prev => [tpl, ...prev]);
    setTemplateName("");
  }

  function loadTemplate(tpl: Template) {
    const newMeals = JSON.parse(JSON.stringify(tpl.meals));
    newMeals.forEach((m: Meal) => {
      m.id = `m${Date.now()}-${Math.random()}`;
      m.items = m.items.map((i: FoodItem) => ({ ...i, instId: `${i.id}-${Date.now()}-${Math.random()}` }));
    });
    setMeals(newMeals); setTargetMacros(tpl.targetMacros);
  }

  function buildPlanText(l: "ar" | "en" | "both") {
    const totals = grandTotals(meals);
    let txt = "";
    txt += `${l === "ar" ? "خطة التغذية" : l === "en" ? "Nutrition Plan" : "Nutrition Plan - خطة التغذية"}\n`;
    txt += `${"─".repeat(40)}\n`;
    txt += `${l === "ar" ? "الهدف" : "Target"}: ${targetMacros.calories} kcal | P: ${targetMacros.protein}g | C: ${targetMacros.carbs}g | F: ${targetMacros.fat}g\n\n`;
    meals.forEach((meal, i) => {
      txt += `${i + 1}. ${displayName(meal.name, l)}\n`;
      meal.items.forEach(item => {
        const m = calcMacros(item);
        txt += `   • ${displayName(item.name, l)} — ${item.grams}g → ${m.calories} kcal (P:${m.protein}g C:${m.carbs}g F:${m.fat}g)\n`;
      });
      if (meal.notes) txt += `   📝 ${meal.notes}\n`;
      const t = mealTotals(meal);
      txt += `   ${l === "ar" ? "المجموع" : "Total"}: ${t.calories.toFixed(0)} kcal\n\n`;
    });
    txt += `${"─".repeat(40)}\n${l === "ar" ? "المجموع الكلي" : "Grand Total"}: ${totals.calories.toFixed(0)} kcal | P:${totals.protein.toFixed(1)}g C:${totals.carbs.toFixed(1)}g F:${totals.fat.toFixed(1)}g\n`;
    if (planNotes) txt += `\n${l === "ar" ? "ملاحظات" : "Notes"}:\n${planNotes}\n`;
    return txt;
  }

  function copyPlan() { navigator.clipboard?.writeText(buildPlanText(copyLang)); }
  function printPlan() { window.print(); }

  function calcBMR() {
    const { age, weight, height, gender, activity, goal } = calcData;
    const bmr = gender === "male"
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    const tdee = bmr * parseFloat(activity);
    const target = goal === "cut" ? tdee - 500 : goal === "gain" ? tdee + 300 : tdee;
    setCalcResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target) });
  }

  function applyCalcToMacros() {
    if (!calcResult) return;
    const cal = calcResult.target;
    setTargetMacros({ calories: cal, protein: Math.round(calcData.weight * 2), carbs: Math.round((cal * 0.4) / 4), fat: Math.round((cal * 0.25) / 9) });
  }

  const totals = grandTotals(meals);
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  // Client helpers
  function addClient() {
    if (!newClient.name.trim()) return;
    const c: Client = { id: Date.now(), ...newClient, createdAt: new Date().toISOString(), checkIns: [], dietPlans: [] };
    setClients(prev => [...prev, c]);
    setNewClient({ name: "", goal: "cut", phone: "", coach: "" });
  }

  function deleteClient(id: number) {
    setClients(prev => prev.filter(c => c.id !== id));
    if (selectedClientId === id) { setSelectedClientId(null); setClientView("list"); }
  }

  function addCheckIn() {
    if (!selectedClient) return;
    const ci: ClientCheckIn = { id: Date.now(), date: newCheckIn.date, measurements: { ...newCheckIn.measurements }, notes: newCheckIn.notes };
    const updated = { ...selectedClient, checkIns: [...selectedClient.checkIns, ci].sort((a, b) => a.date.localeCompare(b.date)) };
    setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c));
    setNewCheckIn({ date: new Date().toISOString().slice(0, 10), measurements: { ...EMPTY_MEASUREMENTS }, notes: "" });
    setClientView("detail");
  }

  function savePlanForClient() {
    if (!selectedClient || !newPlanLabel.trim()) return;
    const snap: DietPlanSnapshot = { id: Date.now(), date: new Date().toISOString().slice(0, 10), label: newPlanLabel, meals: JSON.parse(JSON.stringify(meals)), targetMacros, notes: planNotes };
    const updated = { ...selectedClient, dietPlans: [snap, ...selectedClient.dietPlans] };
    setClients(prev => prev.map(c => c.id === selectedClient.id ? updated : c));
    setNewPlanLabel("");
    alert("Plan saved for " + selectedClient.name);
  }

  function loadClientPlan(snap: DietPlanSnapshot) {
    const newMeals = JSON.parse(JSON.stringify(snap.meals));
    newMeals.forEach((m: Meal) => {
      m.id = `m${Date.now()}-${Math.random()}`;
      m.items = m.items.map((i: FoodItem) => ({ ...i, instId: `${i.id}-${Date.now()}-${Math.random()}` }));
    });
    setMeals(newMeals); setTargetMacros(snap.targetMacros); setPlanNotes(snap.notes);
    setTab("planner");
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl w-80 space-y-4">
          <h1 className="text-2xl font-bold text-center">🏋️ Fit Station</h1>
          <p className="text-center text-gray-500 text-sm">Pro Diet Planner</p>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { if (password === "admin123") setAuthenticated(true); else setAuthError("Wrong password"); } }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none" />
          {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}
          <button onClick={() => { if (password === "admin123") setAuthenticated(true); else setAuthError("Wrong password"); }}
            className="w-full bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700">
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className={cn("min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 font-sans transition-colors")}>
      {/* Print styles */}
      <style>{`
        @media print {
          .print\\:hidden { display: none !important; }
          .print\\:block { display: block !important; }
          textarea { white-space: pre-wrap !important; overflow: visible !important; max-height: none !important; height: auto !important; border: none !important; padding: 0 !important; }
          body { background: white !important; color: black !important; }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">🏋️</span>
          <span className="font-bold text-lg">Fit Station Pro</span>
        </div>
        <div className="flex gap-1">
          {([["planner", <UtensilsCrossed size={16} />, "Planner"], ["calculator", <Calculator size={16} />, "Calc"], ["clients", <Users size={16} />, "Clients"]] as const).map(([t, icon, label]) => (
            <button key={t} onClick={() => setTab(t as typeof tab)}
              className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", tab === t ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700")}>
              {icon}{label}
            </button>
          ))}
          <button onClick={toggleDark} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-4">
        {/* ── PLANNER TAB ── */}
        {tab === "planner" && (
          <div className="space-y-4">
            {/* target macros */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3 print:shadow-none">
              <div className="flex items-center justify-between print:hidden">
                <h2 className="font-bold text-base">Target Macros - الماكرو المستهدف</h2>
                <MacroPieChart carbs={targetMacros.carbs} protein={targetMacros.protein} fat={targetMacros.fat} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 print:hidden">
                {(["calories", "protein", "carbs", "fat"] as const).map(k => (
                  <div key={k}>
                    <label className="text-xs text-gray-500 capitalize">{k}</label>
                    <input type="number" value={targetMacros[k]} onChange={e => setTargetMacros(prev => ({ ...prev, [k]: +e.target.value }))}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800" />
                  </div>
                ))}
              </div>
              {/* progress bars */}
              <div className="space-y-1">
                <div><div className="flex justify-between text-xs mb-0.5"><span>Calories</span><span>{totals.calories.toFixed(0)} / {targetMacros.calories}</span></div><ProgressBar value={totals.calories} max={targetMacros.calories} color="bg-purple-500" /></div>
                <div><div className="flex justify-between text-xs mb-0.5"><span>Protein</span><span>{totals.protein.toFixed(1)}g / {targetMacros.protein}g</span></div><ProgressBar value={totals.protein} max={targetMacros.protein} color="bg-blue-500" /></div>
                <div><div className="flex justify-between text-xs mb-0.5"><span>Carbs</span><span>{totals.carbs.toFixed(1)}g / {targetMacros.carbs}g</span></div><ProgressBar value={totals.carbs} max={targetMacros.carbs} color="bg-yellow-500" /></div>
                <div><div className="flex justify-between text-xs mb-0.5"><span>Fat</span><span>{totals.fat.toFixed(1)}g / {targetMacros.fat}g</span></div><ProgressBar value={totals.fat} max={targetMacros.fat} color="bg-red-500" /></div>
              </div>
            </div>

            {/* meals */}
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMealDragEnd}>
              <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {meals.map(meal => (
                    <SortableMealWrapper key={meal.id} mealId={meal.id}>
                      <MealCard meal={meal} lang={lang} onUpdate={u => updateMeal(meal.id, u)} onDelete={() => deleteMeal(meal.id)} />
                    </SortableMealWrapper>
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            <button onClick={addMeal} className="w-full border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2 print:hidden">
              <Plus size={16} /> Add Meal - إضافة وجبة
            </button>

            {/* plan notes */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
              <label className="text-xs font-semibold text-gray-500 uppercase">Plan Notes - ملاحظات الخطة</label>
              <textarea value={planNotes} onChange={e => setPlanNotes(e.target.value)} rows={3}
                placeholder="General notes, instructions..."
                className="w-full mt-1 border border-gray-200 dark:border-gray-700 rounded-xl p-2 text-sm bg-white dark:bg-gray-800 resize-none print:whitespace-pre-wrap print:overflow-visible print:border-none print:p-0 print:bg-transparent" />
            </div>

            {/* actions */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3 print:hidden">
              {/* language selectors */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-500">Copy Language</label>
                  <select value={copyLang} onChange={e => setCopyLang(e.target.value as typeof copyLang)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1">
                    <option value="both">Both / الاثنان</option>
                    <option value="en">English Only</option>
                    <option value="ar">Arabic Only - عربي فقط</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Print Language</label>
                  <select value={printLang} onChange={e => setPrintLang(e.target.value as typeof printLang)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1">
                    <option value="both">Both / الاثنان</option>
                    <option value="en">English Only</option>
                    <option value="ar">Arabic Only - عربي فقط</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={copyPlan} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700"><Copy size={14} /> Copy Plan</button>
                <button onClick={printPlan} className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-xl text-sm hover:bg-gray-700"><Printer size={14} /> Print / PDF</button>
              </div>
              {/* water tracker */}
              <div>
                <label className="text-xs font-semibold text-gray-500">Water - الماء 💧 ({waterGlasses * 250}ml)</label>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setWaterGlasses(Math.max(0, waterGlasses - 1))} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">-</button>
                  <div className="flex gap-1 flex-wrap">{Array.from({ length: 12 }).map((_, i) => (<div key={i} onClick={() => setWaterGlasses(i + 1)} className={cn("w-5 h-7 rounded cursor-pointer border border-gray-300 dark:border-gray-600", i < waterGlasses ? "bg-blue-400" : "bg-gray-100 dark:bg-gray-800")} />))}</div>
                  <button onClick={() => setWaterGlasses(Math.min(12, waterGlasses + 1))} className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-sm">+</button>
                </div>
              </div>
              {/* save template */}
              <div className="flex gap-2">
                <input value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name..." className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-1.5 text-sm bg-white dark:bg-gray-800" />
                <button onClick={saveTemplate} className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-sm hover:bg-blue-700"><Save size={14} /> Save</button>
              </div>
              {/* templates */}
              {templates.length > 0 && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500">Saved Templates</label>
                  {templates.map(tpl => (
                    <div key={tpl.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <button onClick={() => loadTemplate(tpl)} className="text-sm text-blue-600 hover:underline flex-1 text-right">{tpl.name}</button>
                      <button onClick={() => setTemplates(prev => prev.filter(t => t.id !== tpl.id))} className="text-red-400 hover:text-red-600 ml-2"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
              {/* save to client */}
              {clients.length > 0 && (
                <div className="flex gap-2">
                  <select value={selectedClientId || ""} onChange={e => setSelectedClientId(+e.target.value || null)} className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-1.5 text-sm bg-white dark:bg-gray-800">
                    <option value="">Select client...</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input value={newPlanLabel} onChange={e => setNewPlanLabel(e.target.value)} placeholder="Plan label..." className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-1.5 text-sm bg-white dark:bg-gray-800" />
                  <button onClick={savePlanForClient} className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-xl text-sm hover:bg-purple-700"><Save size={14} /> Save to Client</button>
                </div>
              )}
            </div>
          </div>
        )}
        {/* ── CALCULATOR TAB ── */}
        {tab === "calculator" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
            <h2 className="font-bold text-base">BMR / TDEE Calculator - حاسبة السعرات</h2>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-gray-500">Age - العمر</label><input type="number" value={calcData.age} onChange={e => setCalcData(p => ({ ...p, age: +e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
              <div><label className="text-xs text-gray-500">Weight (kg) - الوزن</label><input type="number" value={calcData.weight} onChange={e => setCalcData(p => ({ ...p, weight: +e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
              <div><label className="text-xs text-gray-500">Height (cm) - الطول</label><input type="number" value={calcData.height} onChange={e => setCalcData(p => ({ ...p, height: +e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
              <div><label className="text-xs text-gray-500">Gender - الجنس</label>
                <select value={calcData.gender} onChange={e => setCalcData(p => ({ ...p, gender: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1">
                  <option value="male">Male - ذكر</option>
                  <option value="female">Female - أنثى</option>
                </select>
              </div>
              <div className="col-span-2"><label className="text-xs text-gray-500">Activity Level - مستوى النشاط</label>
                <select value={calcData.activity} onChange={e => setCalcData(p => ({ ...p, activity: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1">
                  <option value="1.2">Sedentary - خامل</option>
                  <option value="1.375">Light (1-3d/w) - خفيف</option>
                  <option value="1.55">Moderate (3-5d/w) - متوسط</option>
                  <option value="1.725">Active (6-7d/w) - نشيط</option>
                  <option value="1.9">Very Active - نشيط جداً</option>
                </select>
              </div>
              <div className="col-span-2"><label className="text-xs text-gray-500">Goal - الهدف</label>
                <select value={calcData.goal} onChange={e => setCalcData(p => ({ ...p, goal: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1">
                  <option value="cut">Cut (-500 kcal)</option>
                  <option value="maintain">Maintain</option>
                  <option value="gain">Gain (+300 kcal)</option>
                </select>
              </div>
            </div>
            <button onClick={calcBMR} className="w-full bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700">Calculate</button>
            {calcResult && (
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>BMR</span><span className="font-bold">{calcResult.bmr} kcal</span></div>
                <div className="flex justify-between"><span>TDEE</span><span className="font-bold">{calcResult.tdee} kcal</span></div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300"><span>Target ({calcData.goal})</span><span className="font-bold">{calcResult.target} kcal</span></div>
                <button onClick={applyCalcToMacros} className="w-full mt-2 bg-blue-600 text-white rounded-xl py-1.5 text-xs hover:bg-blue-700">Apply to Planner</button>
              </div>
            )}
          </div>
        )}

        {/* ── CLIENTS TAB ── */}
        {tab === "clients" && (
          <div className="space-y-4">
            {clientView === "list" && (
              <>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
                  <h2 className="font-bold text-base">Clients - العملاء</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={newClient.name} onChange={e => setNewClient(p => ({ ...p, name: e.target.value }))} placeholder="Name - الاسم" className="col-span-2 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800" />
                    <input value={newClient.phone} onChange={e => setNewClient(p => ({ ...p, phone: e.target.value }))} placeholder="Phone - الهاتف" className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800" />
                    <input value={newClient.coach} onChange={e => setNewClient(p => ({ ...p, coach: e.target.value }))} placeholder="Coach - المدرب" className="border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800" />
                    <select value={newClient.goal} onChange={e => setNewClient(p => ({ ...p, goal: e.target.value }))} className="col-span-2 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800">
                      <option value="cut">Cut - تنشيف</option>
                      <option value="maintain">Maintain - محافظة</option>
                      <option value="gain">Gain - تضخيم</option>
                    </select>
                    <button onClick={addClient} className="col-span-2 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700 flex items-center justify-center gap-1"><Plus size={14} /> Add Client</button>
                  </div>
                </div>
                <div className="space-y-2">
                  {clients.length === 0 && <p className="text-center text-gray-400 py-8">No clients yet</p>}
                  {clients.map(c => (
                    <div key={c.id} className="bg-white dark:bg-gray-900 rounded-xl p-3 shadow-sm flex items-center justify-between">
                      <button onClick={() => { setSelectedClientId(c.id); setClientView("detail"); }} className="flex-1 text-right">
                        <div className="font-semibold text-sm">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.goal} · {c.phone} · {c.checkIns.length} check-ins · {c.dietPlans.length} plans</div>
                      </button>
                      <button onClick={() => deleteClient(c.id)} className="text-red-400 hover:text-red-600 ml-2"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {clientView === "detail" && selectedClient && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setClientView("list")} className="p-1 text-gray-500 hover:text-gray-700"><ArrowLeft size={18} /></button>
                  <h2 className="font-bold text-base">{selectedClient.name}</h2>
                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">{selectedClient.goal}</span>
                </div>

                {/* check-in history */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Check-In History</h3>
                    <button onClick={() => setClientView("checkin")} className="flex items-center gap-1 text-xs bg-green-600 text-white px-3 py-1.5 rounded-xl hover:bg-green-700"><Plus size={12} /> New Check-In</button>
                  </div>
                  {selectedClient.checkIns.length === 0 && <p className="text-xs text-gray-400">No check-ins yet</p>}
                  {selectedClient.checkIns.length > 0 && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800">
                            {["Date", "Weight", "Fat%", "Arms", "Waist", "Hip", "Hi-Hip", "Thighs", "Neck"].map(h => (
                              <th key={h} className="px-2 py-1 text-right font-semibold border-b border-gray-200 dark:border-gray-700">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {selectedClient.checkIns.map((ci, idx) => {
                            const prev = idx > 0 ? selectedClient.checkIns[idx - 1] : null;
                            return (
                              <tr key={ci.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="px-2 py-1">{ci.date}</td>
                                {(["weight", "bodyFat", "arms", "waist", "hip", "highHip", "thighs", "neck"] as const).map(m => (
                                  <td key={m} className="px-2 py-1">
                                    <TrendArrow metric={m} current={ci.measurements[m]} previous={prev?.measurements[m] || 0} goal={selectedClient.goal} />
                                  </td>
                                ))}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* progress charts */}
                {selectedClient.checkIns.length >= 2 && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-1"><BarChart2 size={14} /> Progress Charts</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(["weight", "waist", "arms", "bodyFat", "hip", "thighs"] as const).map(m => (
                        <ProgressLineChart key={m} checkIns={selectedClient.checkIns} metric={m} label={m.charAt(0).toUpperCase() + m.slice(1)} goal={selectedClient.goal} />
                      ))}
                    </div>
                  </div>
                )}

                {/* diet plan history */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Diet Plan History</h3>
                    <button onClick={() => setClientView("dietplan")} className="flex items-center gap-1 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-xl hover:bg-purple-700"><Save size={12} /> Save Current Plan</button>
                  </div>
                  {selectedClient.dietPlans.length === 0 && <p className="text-xs text-gray-400">No saved plans yet</p>}
                  {selectedClient.dietPlans.map(snap => (
                    <div key={snap.id} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <div>
                        <div className="text-sm font-medium">{snap.label}</div>
                        <div className="text-xs text-gray-400">{snap.date} · {snap.targetMacros.calories} kcal</div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => loadClientPlan(snap)} className="text-xs text-blue-600 hover:underline px-2">Load</button>
                        <button onClick={() => {
                          const upd = { ...selectedClient, dietPlans: selectedClient.dietPlans.filter(p => p.id !== snap.id) };
                          setClients(prev => prev.map(c => c.id === selectedClient.id ? upd : c));
                        }} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {clientView === "checkin" && selectedClient && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setClientView("detail")} className="p-1 text-gray-500 hover:text-gray-700"><ArrowLeft size={18} /></button>
                  <h2 className="font-bold text-base">New Check-In — {selectedClient.name}</h2>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
                  <div><label className="text-xs text-gray-500">Date</label>
                    <input type="date" value={newCheckIn.date} onChange={e => setNewCheckIn(p => ({ ...p, date: e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {(["weight", "height", "bodyFat", "arms", "thighs", "waist", "hip", "highHip", "neck"] as const).map(m => (
                      <div key={m}>
                        <label className="text-xs text-gray-500 capitalize">{m} {["weight", "height", "arms", "thighs", "waist", "hip", "highHip", "neck"].includes(m) ? (m === "height" ? "(cm)" : "(cm/kg)") : "(%)"}</label>
                        <input type="number" step="0.1" value={newCheckIn.measurements[m] || ""} onChange={e => setNewCheckIn(p => ({ ...p, measurements: { ...p.measurements, [m]: +e.target.value } }))}
                          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
                      </div>
                    ))}
                  </div>
                  <div><label className="text-xs text-gray-500">Notes</label>
                    <textarea value={newCheckIn.notes} onChange={e => setNewCheckIn(p => ({ ...p, notes: e.target.value }))} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-2 text-sm bg-white dark:bg-gray-800 mt-1 resize-none" /></div>
                  <button onClick={addCheckIn} className="w-full bg-green-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-green-700">Save Check-In</button>
                </div>
              </div>
            )}

            {clientView === "dietplan" && selectedClient && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <button onClick={() => setClientView("detail")} className="p-1 text-gray-500 hover:text-gray-700"><ArrowLeft size={18} /></button>
                  <h2 className="font-bold text-base">Save Current Plan for {selectedClient.name}</h2>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
                  <p className="text-sm text-gray-500">This will snapshot the current planner content for this client.</p>
                  <input value={newPlanLabel} onChange={e => setNewPlanLabel(e.target.value)} placeholder="Plan label (e.g. Week 1 Cut)" className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-sm bg-white dark:bg-gray-800" />
                  <div className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <div>Meals: {meals.length} · Target: {targetMacros.calories} kcal</div>
                    <div>P:{targetMacros.protein}g C:{targetMacros.carbs}g F:{targetMacros.fat}g</div>
                  </div>
                  <button onClick={() => { savePlanForClient(); setClientView("detail"); }} className="w-full bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700">Save Plan</button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// ─── SORTABLE MEAL WRAPPER ──────────────────────────────────────────────────────
function SortableMealWrapper({ mealId, children }: { mealId: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mealId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children}
    </div>
  );
}
