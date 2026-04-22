"use client";
import { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Search, Printer, ArrowUp, ArrowDown, X, Check, Save, Copy, User, 
  Settings, ChevronDown, ChevronUp, Sun, Moon, Info, Layout, GripVertical
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
  // --- CARB SOURCES (مصادر الكربوهيدرات) ---
  { id: 101, name: "White Rice - أرز أبيض", category: "Carb", state: "Raw", carbs: 78.0, protein: 7.0, fat: 0.6, calories: 360.0 },
  { id: 102, name: "Cooked White Rice - أرز أبيض مطبوخ", category: "Carb", state: "Cooked", carbs: 28.0, protein: 2.7, fat: 0.3, calories: 130.0 },
  { id: 103, name: "Brown Rice - أرز بني", category: "Carb", state: "Raw", carbs: 77.0, protein: 7.5, fat: 2.7, calories: 370.0 },
  { id: 104, name: "Cooked Brown Rice - أرز بني مطبوخ", category: "Carb", state: "Cooked", carbs: 23.0, protein: 2.6, fat: 0.9, calories: 112.0 },
  { id: 105, name: "White Pasta - مكرونة بيضاء", category: "Carb", state: "Raw", carbs: 75.0, protein: 13.0, fat: 1.5, calories: 370.0 },
  { id: 106, name: "Boiled White Pasta - مكرونة مسلوقة", category: "Carb", state: "Cooked", carbs: 25.0, protein: 5.0, fat: 1.0, calories: 130.0 },
  { id: 107, name: "Macaroni Béchamel - مكرونة بالبشاميل", category: "Carb", state: "Cooked", carbs: 20.0, protein: 6.0, fat: 8.0, calories: 180.0 },
  { id: 108, name: "Baladi Bread - خبز بلدي", category: "Carb", state: "Ready", carbs: 55.0, protein: 9.0, fat: 1.0, calories: 280.0 },
  { id: 109, name: "Shami Bread - خبز شامي", category: "Carb", state: "Ready", carbs: 56.0, protein: 8.0, fat: 1.0, calories: 275.0 },
  { id: 110, name: "White Toast - توست أبيض", category: "Carb", state: "Ready", carbs: 49.0, protein: 8.0, fat: 4.0, calories: 265.0 },
  { id: 111, name: "Brown Toast - توست بني", category: "Carb", state: "Ready", carbs: 43.0, protein: 9.0, fat: 4.0, calories: 250.0 },
  { id: 112, name: "Oats - شوفان", category: "Carb", state: "Raw", carbs: 66.0, protein: 17.0, fat: 7.0, calories: 389.0 },
  { id: 113, name: "Cooked Oats - شوفان مطبوخ", category: "Carb", state: "Cooked", carbs: 12.0, protein: 2.5, fat: 1.5, calories: 70.0 },
  { id: 114, name: "Corn - ذرة", category: "Carb", state: "Raw", carbs: 19.0, protein: 3.4, fat: 1.2, calories: 96.0 },
  { id: 115, name: "Boiled Corn - ذرة مسلوقة", category: "Carb", state: "Boiled", carbs: 21.0, protein: 3.4, fat: 1.5, calories: 96.0 },
  { id: 116, name: "Potatoes - بطاطس", category: "Carb", state: "Raw", carbs: 17.0, protein: 2.0, fat: 0.1, calories: 77.0 },
  { id: 117, name: "Boiled Potatoes - بطاطس مسلوقة", category: "Carb", state: "Boiled", carbs: 20.0, protein: 2.0, fat: 0.1, calories: 87.0 },
  { id: 118, name: "Fried Potatoes - بطاطس مقلية", category: "Carb", state: "Fried", carbs: 35.0, protein: 3.0, fat: 10.0, calories: 250.0 },
  { id: 119, name: "Sweet Potato - بطاطا حلوة", category: "Carb", state: "Raw", carbs: 20.0, protein: 1.6, fat: 0.1, calories: 86.0 },
  { id: 120, name: "Baked Sweet Potato - بطاطا حلوة مشوية", category: "Carb", state: "Baked", carbs: 24.0, protein: 2.0, fat: 0.1, calories: 105.0 },
  { id: 121, name: "Oats Bread - خبز شوفان", category: "Carb", state: "Baked", carbs: 42.0, protein: 9.5, fat: 4.5, calories: 240.0 },
  { id: 122, name: "burglar cooked  - مطبوخ برغل", category: "Carb", state: "cooked", carbs: 19, protein: 3, fat: 0.25, calories: 85 },
  { id: 123, name: "burglar - برغل", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat:1.3, calories: 342 },
  { id: 124, name: "Freekeh cooked  - فريك مطبوخ ", category: "Carb", state: "cooked", carbs: 19, protein: 6, fat: 0.5, calories: 150 },
  { id: 125, name: "Freekeh - فريك", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat:1.5, calories: 340 },

  // --- PROTEIN SOURCES (مصادر البروتين) ---
  { id: 201, name: "Raw Chicken Breast - صدور دجاج نية", category: "Protein", state: "Raw", carbs: 0, protein: 23, fat: 1, calories: 120 },
  { id: 202, name: "Grilled Chicken Breast - صدور دجاج مشوية", category: "Protein", state: "Grilled", carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 203, name: "Fried Chicken Breast - صدور دجاج مقلية", category: "Protein", state: "Fried", carbs: 8, protein: 28, fat: 10, calories: 250 },
  { id: 204, name: "Raw Chicken Thigh - أوراك دجاج نية", category: "Protein", state: "Raw", carbs: 0, protein: 19, fat: 9, calories: 180 },
  { id: 205, name: "Cooked Chicken Thigh - أوراك دجاج مطبوخة", category: "Protein", state: "Cooked", carbs: 0, protein: 26, fat: 10, calories: 209 },
  { id: 206, name: "Chicken Liver - كبده دجاج", category: "Protein", state: "Cooked", carbs: 0, protein: 24, fat: 6, calories: 165 },
  { id: 207, name: "Raw Chicken Liver - كبده دجاج نية", category: "Protein", state: "Raw", carbs: 2, protein: 18, fat: 5, calories: 120 },
  { id: 208, name: "Raw Lean Beef - لحم بقري صافي ني", category: "Protein", state: "Raw", carbs: 0, protein: 26, fat: 10, calories: 200 },
  { id: 209, name: "Cooked Lean Beef - لحم بقري صافي مطبوخ", category: "Protein", state: "Cooked", carbs: 0, protein: 30, fat: 12, calories: 250 },
  { id: 210, name: "Cooked Fatty Beef - لحم بقري سمين مطبوخ", category: "Protein", state: "Cooked", carbs: 0, protein: 25, fat: 20, calories: 300 },
  { id: 211, name: "Grilled Kofta - كفتة مشوية", category: "Protein", state: "Grilled", carbs: 5, protein: 25, fat: 20, calories: 300 },
  { id: 212, name: "Cooked Liver - كبده مطبوخة", category: "Protein", state: "Cooked", carbs: 5, protein: 26, fat: 5, calories: 175 },
  { id: 213, name: "Cooked Kidney - كلاوي مطبوخة", category: "Protein", state: "Cooked", carbs: 4, protein: 24, fat: 6, calories: 160 },
  { id: 214, name: "Whole Eggs (Gm) - بيض كامل (جم)", category: "Protein", state: "Raw", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 215, name: "Boiled Eggs - بيض مسلوق", category: "Protein", state: "Boiled", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 216, name: "Egg White - بياض بيض", category: "Protein", state: "Raw", carbs: 0, protein: 11, fat: 0.5, calories: 52 },
  { id: 217, name: "1 Whole Egg - بيضة كاملة واحدة", category: "Protein", state: "1 Egg", carbs: 0.3, protein: 8, fat: 6, calories: 75 },
  { id: 218, name: "Canned Tuna (Water) - تونة معلبة (ماء)", category: "Protein", state: "Canned", carbs: 0, protein: 25, fat: 1, calories: 116 },
  { id: 219, name: "Canned Tuna (Oil) - تونة معلبة (زيت)", category: "Protein", state: "Canned", carbs: 0, protein: 25, fat: 10, calories: 200 },
  { id: 220, name: "Canned Sardines - سردين معلب", category: "Protein", state: "Canned", carbs: 0, protein: 25, fat: 11, calories: 208 },
  { id: 221, name: "Full Fat Milk - حليب كامل الدسم", category: "Protein", state: "Liquid", carbs: 5, protein: 3.3, fat: 3.5, calories: 61 },
  { id: 222, name: "Low Fat Milk - حليب قليل الدسم", category: "Protein", state: "Liquid", carbs: 5, protein: 3.4, fat: 1, calories: 42 },
  { id: 223, name: "Regular Yogurt - زبادي عادي", category: "Protein", state: "Regular", carbs: 4, protein: 3.5, fat: 3, calories: 60 },
  { id: 224, name: "Plain Greek Yogurt - زبادي يوناني سادة", category: "Protein", state: "Plain", carbs: 4, protein: 10, fat: 5, calories: 97 },
  { id: 225, name: "Feta Cheese - جبنة فيتا", category: "Protein", state: "Regular", carbs: 4, protein: 14, fat: 21, calories: 264 },
  { id: 226, name: "Roumy Cheese - جبنة رومي", category: "Protein", state: "Regular", carbs: 2, protein: 25, fat: 32, calories: 350 },
  { id: 227, name: "Cottage Cheese - جبنة قريش", category: "Protein", state: "Low Fat", carbs: 3, protein: 11, fat: 4, calories: 98 },
  { id: 228, name: "Cooked Fava Beans - فول مدمس", category: "Protein/Legume", state: "Cooked", carbs: 19, protein: 9, fat: 0.4, calories: 110 },
  { id: 229, name: "Raw Lentils - عدس ني", category: "Protein/Legume", state: "Raw", carbs: 60, protein: 25, fat: 1.3, calories: 353 },
  { id: 230, name: "Cooked Lentils - عدس مطبوخ", category: "Protein/Legume", state: "Cooked", carbs: 20, protein: 9, fat: 0.4, calories: 116 },
  { id: 231, name: "Cooked Chickpeas - حمص مطبوخ", category: "Protein/Legume", state: "Cooked", carbs: 27, protein: 9, fat: 3, calories: 164 },

  // --- FAT SOURCES (مصادر الدهون) ---
  { id: 301, name: "Olive Oil - زيت زيتون", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 302, name: "Sunflower Oil - زيت عباد شمس", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 303, name: "Corn Oil - زيت ذرة", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 304, name: "Butter - زبدة", category: "Fat", state: "Raw", carbs: 0, protein: 1, fat: 81, calories: 717 },
  { id: 305, name: "Ghee (Samna Baladi) - سمن بلدي", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 900 },
  { id: 306, name: "Margarine - سمن صناعي", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 80, calories: 717 },
  { id: 307, name: "Mayonnaise - مايونيز", category: "Fat", state: "Ready", carbs: 1, protein: 1, fat: 75, calories: 680 },
  { id: 308, name: "Tahini - طحينة", category: "Fat", state: "Raw", carbs: 21, protein: 17, fat: 54, calories: 595 },

  // --- NUTS & SEEDS (مكسرات وبذور) ---
  { id: 401, name: "Almonds - لوز", category: "Fat/Nut", state: "Raw", carbs: 22, protein: 21, fat: 50, calories: 579 },
  { id: 402, name: "Peanuts - سوداني", category: "Fat/Nut", state: "Raw", carbs: 16, protein: 26, fat: 49, calories: 567 },
  { id: 403, name: "Cashews - كاجو", category: "Fat/Nut", state: "Raw", carbs: 30, protein: 18, fat: 44, calories: 553 },
  { id: 404, name: "Walnuts - عين جمل", category: "Fat/Nut", state: "Raw", carbs: 14, protein: 15, fat: 65, calories: 654 },
  { id: 405, name: "Hazelnuts - بندق", category: "Fat/Nut", state: "Raw", carbs: 17, protein: 15, fat: 61, calories: 628 },
  { id: 406, name: "Pistachios - فستق", category: "Fat/Nut", state: "Raw", carbs: 28, protein: 20, fat: 45, calories: 562 },
  { id: 407, name: "Sunflower Seeds - لب عباد شمس", category: "Fat/Seed", state: "Raw", carbs: 20, protein: 21, fat: 51, calories: 584 },
  { id: 408, name: "Pumpkin Seeds - لب قرع", category: "Fat/Seed", state: "Raw", carbs: 15, protein: 30, fat: 49, calories: 559 },
  { id: 409, name: "Sesame Seeds - سمسم", category: "Fat/Seed", state: "Raw", carbs: 23, protein: 18, fat: 50, calories: 573 },
  { id: 410, name: "Chia Seeds - بذور شيا", category: "Fat/Seed", state: "Raw", carbs: 42, protein: 17, fat: 31, calories: 486 },
  { id: 411, name: "Flax Seeds - بذور كتان", category: "Fat/Seed", state: "Raw", carbs: 29, protein: 18, fat: 42, calories: 534 },

  // --- FRUITS (فواكه) ---
  { id: 501, name: "Apple - تفاح", category: "Fruit", state: "Raw", carbs: 14, protein: 0.3, fat: 0.2, calories: 52 },
  { id: 502, name: "Banana - موز", category: "Fruit", state: "Raw", carbs: 23, protein: 1.1, fat: 0.3, calories: 96 },
  { id: 503, name: "Orange - برتقال", category: "Fruit", state: "Raw", carbs: 12, protein: 0.9, fat: 0.1, calories: 47 },
  { id: 504, name: "Mandarin - يوسفي", category: "Fruit", state: "Raw", carbs: 13, protein: 0.8, fat: 0.2, calories: 53 },
  { id: 505, name: "Grapes - عنب", category: "Fruit", state: "Raw", carbs: 18, protein: 0.7, fat: 0.2, calories: 69 },
  { id: 506, name: "Mango - مانجو", category: "Fruit", state: "Raw", carbs: 15, protein: 0.8, fat: 0.4, calories: 60 },
  { id: 507, name: "Guava - جوافة", category: "Fruit", state: "Raw", carbs: 14, protein: 2.6, fat: 1, calories: 68 },
  { id: 508, name: "Watermelon - بطيخ", category: "Fruit", state: "Raw", carbs: 8, protein: 0.6, fat: 0.2, calories: 30 },
  { id: 509, name: "Melon (Cantaloupe) - كانتلوب", category: "Fruit", state: "Raw", carbs: 8, protein: 0.8, fat: 0.2, calories: 34 },
  { id: 510, name: "Strawberries - فراولة", category: "Fruit", state: "Raw", carbs: 8, protein: 0.7, fat: 0.3, calories: 32 },
  { id: 511, name: "Pomegranate - رمان", category: "Fruit", state: "Raw", carbs: 19, protein: 1.7, fat: 1.2, calories: 83 },
  { id: 512, name: "Peach - خوخ", category: "Fruit", state: "Raw", carbs: 10, protein: 0.9, fat: 0.3, calories: 39 },
  { id: 513, name: "Pear - كمثرى", category: "Fruit", state: "Raw", carbs: 15, protein: 0.4, fat: 0.1, calories: 57 },
  { id: 514, name: "Apricot - مشمش", category: "Fruit", state: "Raw", carbs: 11, protein: 1.4, fat: 0.4, calories: 48 },
  { id: 515, name: "Plum - برقوق", category: "Fruit", state: "Raw", carbs: 11, protein: 0.7, fat: 0.3, calories: 46 },
  { id: 516, name: "Kiwi - كيوي", category: "Fruit", state: "Raw", carbs: 15, protein: 1.1, fat: 0.5, calories: 61 },
  { id: 517, name: "Pineapple - أناناس", category: "Fruit", state: "Raw", carbs: 13, protein: 0.5, fat: 0.1, calories: 50 },
  { id: 518, name: "Dates - بلح / تمر", category: "Fruit", state: "Raw", carbs: 75, protein: 2, fat: 0.2, calories: 280 },
  { id: 519, name: "Avocado - أفوكادو", category: "Fruit", state: "Raw", carbs: 9, protein: 2, fat: 15, calories: 160 },

  // --- VEGETABLES & SALADS (خضروات وسلطات) ---
  { id: 601, name: "Lettuce - خس", category: "Vegetable", state: "Raw", carbs: 3, protein: 1.4, fat: 0.2, calories: 15 },
  { id: 602, name: "Arugula - جرجير", category: "Vegetable", state: "Raw", carbs: 3.7, protein: 2.6, fat: 0.7, calories: 25 },
  { id: 603, name: "Spinach - سبانخ", category: "Vegetable", state: "Raw", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23 },
  { id: 604, name: "Tomato - طماطم", category: "Vegetable", state: "Raw", carbs: 4, protein: 0.9, fat: 0.2, calories: 18 },
  { id: 605, name: "Cucumber - خيار", category: "Vegetable", state: "Raw", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 16 },
  { id: 606, name: "Bell Pepper - فلفل ألوان", category: "Vegetable", state: "Raw", carbs: 6, protein: 1, fat: 0.3, calories: 31 },
  { id: 607, name: "Zucchini - كوسة", category: "Vegetable", state: "Raw", carbs: 3, protein: 1.2, fat: 0.3, calories: 17 },
  { id: 608, name: "Cooked Zucchini - كوسة مطبوخة", category: "Vegetable", state: "Cooked", carbs: 3.5, protein: 1.2, fat: 0.3, calories: 20 },
  { id: 609, name: "Raw Eggplant - باذنجان ني", category: "Vegetable", state: "Raw", carbs: 6, protein: 1, fat: 0.2, calories: 25 },
  { id: 610, name: "Fried Eggplant - باذنجان مقلي", category: "Vegetable", state: "Fried", carbs: 9, protein: 1, fat: 9, calories: 120 },
  { id: 611, name: "Grilled Eggplant - باذنجان مشوي", category: "Vegetable", state: "Grilled", carbs: 6, protein: 1, fat: 0.2, calories: 35 },
  { id: 612, name: "Raw Okra - بامية نية", category: "Vegetable", state: "Raw", carbs: 7, protein: 2, fat: 0.1, calories: 33 },
  { id: 613, name: "Cooked Okra - بامية مطبوخة", category: "Vegetable", state: "Cooked", carbs: 7, protein: 2, fat: 0.2, calories: 35 },
  { id: 614, name: "Cooked Molokhia - ملوخية مطبوخة", category: "Vegetable", state: "Cooked", carbs: 7, protein: 3, fat: 0.5, calories: 60 },
  { id: 615, name: "Raw Green Beans - فاصوليا خضراء نية", category: "Vegetable", state: "Raw", carbs: 7, protein: 2, fat: 0.1, calories: 31 },
  { id: 616, name: "Cooked Green Beans - فاصوليا خضراء مطبوخة", category: "Vegetable", state: "Cooked", carbs: 7, protein: 2, fat: 0.1, calories: 35 },
  { id: 617, name: "Cooked Peas - بسلة مطبوخة", category: "Vegetable", state: "Cooked", carbs: 14, protein: 5, fat: 0.4, calories: 81 },
  { id: 618, name: "Raw Cauliflower - قرنبيط ني", category: "Vegetable", state: "Raw", carbs: 5, protein: 2, fat: 0.3, calories: 25 },
  { id: 619, name: "Cooked Cauliflower - قرنبيط مطبوخ", category: "Vegetable", state: "Cooked", carbs: 5, protein: 2, fat: 0.3, calories: 23 },
  { id: 620, name: "Raw Broccoli - بروكلي ني", category: "Vegetable", state: "Raw", carbs: 7, protein: 2.8, fat: 0.4, calories: 34 },
  { id: 621, name: "Cooked Broccoli - بروكلي مطبوخ", category: "Vegetable", state: "Cooked", carbs: 7, protein: 2.4, fat: 0.4, calories: 35 },
  { id: 622, name: "Cooked Cabbage - كرنب مطبوخ", category: "Vegetable", state: "Cooked", carbs: 6, protein: 1.3, fat: 0.1, calories: 25 },
  { id: 623, name: "Raw Mushrooms - مشروم ني", category: "Vegetable", state: "Raw", carbs: 3, protein: 3.1, fat: 0.3, calories: 22 },
  { id: 624, name: "Cooked Mushrooms - مشروم مطبوخ", category: "Vegetable", state: "Cooked", carbs: 3, protein: 3, fat: 0.3, calories: 28 },
  { id: 625, name: "Parsley - بقدونس", category: "Vegetable", state: "Raw", carbs: 6, protein: 3, fat: 0.8, calories: 36 },
  { id: 626, name: "Coriander - كزبره", category: "Vegetable", state: "Raw", carbs: 4, protein: 2, fat: 0.5, calories: 23 },
  { id: 627, name: "Dill - شبت", category: "Vegetable", state: "Raw", carbs: 7, protein: 3.5, fat: 1.1, calories: 43 },
  { id: 628, name: "Mint - نعناع", category: "Vegetable", state: "Raw", carbs: 8, protein: 3.8, fat: 0.9, calories: 44 },
  { id: 629, name: "Green Onion - بصل أخضر", category: "Vegetable", state: "Raw", carbs: 7, protein: 1.8, fat: 0.2, calories: 32 },
  { id: 630, name: "Onion - بصل", category: "Vegetable", state: "Raw", carbs: 9, protein: 1.1, fat: 0.1, calories: 40 },
  { id: 631, name: "Carrot - جزر", category: "Vegetable", state: "Raw", carbs: 10, protein: 0.9, fat: 0.2, calories: 41 },
  { id: 632, name: "Beetroot - بنجر", category: "Vegetable", state: "Raw", carbs: 10, protein: 1.6, fat: 0.2, calories: 43 },
  { id: 633, name: "Radish - فجل", category: "Vegetable", state: "Raw", carbs: 3.4, protein: 0.7, fat: 0.1, calories: 16 },
  { id: 634, name: "Lemon - ليمون", category: "Vegetable", state: "Raw", carbs: 9, protein: 1.1, fat: 0.3, calories: 29 },
  { id: 635, name: "Green Salad - سلطة خضراء", category: "Vegetable", state: "Ready", carbs: 4, protein: 1, fat: 0.2, calories: 20 },
  { id: 636, name: "Pickles (Torshi) - مخلل طرشي", category: "Vegetable", state: "Ready", carbs: 2, protein: 0.5, fat: 0.2, calories: 12 },

  // --- LEGUMES (بقوليات) ---
  { id: 701, name: "Cooked Kidney Beans - فاصوليا حمراء", category: "Legume", state: "Cooked", carbs: 23, protein: 9, fat: 0.5, calories: 127 },
  { id: 702, name: "Cooked White Beans - فاصوليا بيضاء", category: "Legume", state: "Cooked", carbs: 25, protein: 9, fat: 0.5, calories: 139 },
  { id: 703, name: "Cooked Black-eyed Peas - لوبيا", category: "Legume", state: "Cooked", carbs: 21, protein: 8, fat: 0.5, calories: 116 },
  { id: 704, name: "Lupin Beans - ترمس", category: "Legume", state: "Ready", carbs: 10, protein: 16, fat: 4.9, calories: 119 },

  // --- DRINKS & JUICE (مشروبات وعصائر) ---
  { id: 801, name: "Orange Juice - عصير برتقال", category: "Juice", state: "Fresh", carbs: 10, protein: 0.7, fat: 0.2, calories: 45 },
  { id: 802, name: "Mango Juice - عصير مانجو", category: "Juice", state: "Fresh", carbs: 14, protein: 0.4, fat: 0.1, calories: 60 },
  { id: 803, name: "Apple Juice - عصير تفاح", category: "Juice", state: "Fresh", carbs: 11, protein: 0.1, fat: 0.1, calories: 46 },
  { id: 804, name: "Tea - شاي", category: "Hot Drink", state: "Ready", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 805, name: "Coffee - قهوة", category: "Hot Drink", state: "Ready", carbs: 0, protein: 0, fat: 0, calories: 0 },

  // --- SUPPLEMENTS (مكملات) ---
  { id: 901, name: "Multivitamins - مالتي فيتامين", category: "Supplement", state: "Capsule", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 902, name: "Omega-3 - أوميجا 3", category: "Supplement", state: "Capsule", carbs: 0, protein: 0, fat: 1, calories: 9 },
  { id: 903, name: "Creatine - كرياتين", category: "Supplement", state: "Powder", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 904, name: "Whey Protein - واي بروتين", category: "Supplement", state: "Powder", carbs: 3, protein: 24, fat: 1.5, calories: 120 },

  // --- EGYPTIAN FAVORITES (أكلات مصرية شعبية) ---
  { id: 1001, name: "Koshary - كشري مصري", category: "Meal", state: "Cooked", carbs: 60, protein: 12, fat: 10, calories: 380 },
  { id: 1002, name: "Hawawshi - حواوشي", category: "Meal", state: "Baked", carbs: 30, protein: 15, fat: 20, calories: 350 },
  { id: 1003, name: "Falafel - طعمية", category: "Meal", state: "Fried", carbs: 20, protein: 8, fat: 15, calories: 250 },
  { id: 1004, name: "Stuffed Vine Leaves - ورق عنب", category: "Meal", state: "Cooked", carbs: 25, protein: 3, fat: 8, calories: 180 },
// --- BEEF & MINCED MEAT (اللحوم والمفروم) ---
  { id: 203, name: "Lean Minced Beef (No Fat) - لحمة مفرومة بدون دهن", category: "Protein", state: "Raw", carbs: 0, protein: 24, fat: 2, calories: 120 },
  { id: 204, name: "Minced Beef (5% Fat) - لحمة مفرومة 5% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 21.5, fat: 5, calories: 137 },
  { id: 205, name: "Minced Beef (10% Fat) - لحمة مفرومة 10% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 20, fat: 10, calories: 176 },
  { id: 206, name: "Beef Burger (10% Fat) - برجر بقري 10% دهون", category: "Protein", state: "Raw", carbs: 1, protein: 19, fat: 10, calories: 180 },

  // --- COOKED VERSIONS (الأصناف بعد الطهي) ---
  { id: 207, name: "Grilled Lean Minced - مفروم بدون دهن مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 30, fat: 3, calories: 160 },
  { id: 208, name: "Grilled Minced (5% Fat) - مفروم 5% دهون مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 28, fat: 7, calories: 185 },
  { id: 209, name: "Grilled Minced (10% Fat) - مفروم 10% دهون مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26, fat: 13, calories: 230 },
  { id: 210, name: "Grilled Beef Burger (10% Fat) - برجر مشوي 10% دهون", category: "Protein", state: "Grilled", carbs: 1.5, protein: 24, fat: 12, calories: 225 },
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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [meals, setMeals] = useState<Meal[]>([
    { id: 'meal-1', name: "الوجبة الأولى", notes: "", items: [] },
    { id: 'meal-2', name: "الوجبة الثانية", notes: "", items: [] }
  ]);
  const [clientData, setClientData] = useState({ 
    name: '', goal: '', coach: 'C/ Mohamed Saed', phone: '01022816320', date: new Date().toISOString().split('T')[0] 
  });
  const [targetMacros, setTargetMacros] = useState<TargetMacros>({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedFoods, setSelectedFoods] = useState<Set<number>>(new Set());
  const [templates, setTemplates] = useState<any[]>([]);

  // Sensors for DnD
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const savedTemplates = localStorage.getItem('pro_nutrition_templates');
    if (savedTemplates) setTemplates(JSON.parse(savedTemplates));
    const savedTheme = localStorage.getItem('pro_theme');
    if (savedTheme) setTheme(savedTheme as 'dark' | 'light');
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('pro_theme', theme);
  }, [theme]);

  // Fuzzy Search Implementation
  const normalizeArabic = (str: string) => {
    return str
      .replace(/[أإآا]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/ى/g, "ي")
      .toLowerCase();
  };

  const filteredFoods = useMemo(() => {
    let list = FOOD_DATABASE;
    if (selectedCategory !== "All") {
      list = list.filter(f => f.category.includes(selectedCategory));
    }
    if (searchTerm) {
      const normalizedSearch = normalizeArabic(searchTerm);
      list = list.filter(f => normalizeArabic(f.name).includes(normalizedSearch));
    }
    return list;
  }, [searchTerm, selectedCategory]);

  const categories = ["All", "Carb", "Protein", "Fat", "Fruit", "Vegetable", "Legume", "Meal", "Supplement"];

  // Calculations
  const calculateTotals = () => {
    return meals.reduce((acc, meal) => {
      meal.items.forEach(it => {
        const ratio = it.grams / 100;
        acc.calories += it.calories * ratio;
        acc.protein += it.protein * ratio;
        acc.carbs += it.carbs * ratio;
        acc.fat += it.fat * ratio;
      });
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });
  };

  const totals = calculateTotals();

  // --- Handlers ---
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setMeals((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addMeal = () => {
    const newId = `meal-${Date.now()}`;
    setMeals([...meals, { id: newId, name: `وجبة ${meals.length + 1}`, notes: "", items: [] }]);
  };

  const duplicateMeal = (meal: Meal) => {
    const newMeal = { 
      ...meal, 
      id: `meal-dup-${Date.now()}`, 
      name: `${meal.name} (نسخة)`,
      items: meal.items.map(it => ({ ...it, instId: `${it.id}-${Math.random()}` }))
    };
    setMeals([...meals, newMeal]);
  };

  const removeMeal = (id: string) => {
    setMeals(meals.filter(m => m.id !== id));
  };

  const toggleFoodSelection = (id: number) => {
    const next = new Set(selectedFoods);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedFoods(next);
  };

  const addSelectedToMeal = () => {
    if (!activeMealId) return;
    const newItems = FOOD_DATABASE.filter(f => selectedFoods.has(f.id)).map(f => ({
      ...f,
      grams: 100,
      instId: `${f.id}-${Math.random()}`
    }));
    setMeals(meals.map(m => m.id === activeMealId ? { ...m, items: [...m.items, ...newItems] } : m));
    setIsModalOpen(false);
    setSelectedFoods(new Set());
    setSearchTerm("");
  };

  const moveItem = (mealId: string, itemInstId: string, direction: 'up' | 'down') => {
    setMeals(meals.map(m => {
      if (m.id !== mealId) return m;
      const index = m.items.findIndex(it => it.instId === itemInstId);
      const newItems = [...m.items];
      if (direction === 'up' && index > 0) {
        [newItems[index], newItems[index-1]] = [newItems[index-1], newItems[index]];
      } else if (direction === 'down' && index < newItems.length - 1) {
        [newItems[index], newItems[index+1]] = [newItems[index+1], newItems[index]];
      }
      return { ...m, items: newItems };
    }));
  };

  const saveTemplate = () => {
    const name = prompt("اسم القالب:");
    if (!name) return;
    const newTemp = { id: Date.now(), name, meals, targetMacros };
    const updated = [...templates, newTemp];
    setTemplates(updated);
    localStorage.setItem('pro_nutrition_templates', JSON.stringify(updated));
  };

  const loadTemplate = (temp: any) => {
    if (confirm("تحميل القالب؟ سيتم مسح البيانات الحالية.")) {
      setMeals(temp.meals);
      setTargetMacros(temp.targetMacros);
    }
  };

  return (
    <div className={cn(
      "min-h-screen transition-colors duration-300 font-sans pb-20",
      theme === 'dark' ? "bg-[#080808] text-white" : "bg-gray-50 text-gray-900"
    )} dir="rtl">
      
      {/* 🖨 PRINT HEADER (Hidden in UI) */}
      <div className="hidden print:block bg-white text-black p-8 border-b-8 border-blue-600">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-5xl font-black text-blue-700 tracking-tight">نظام غذائي متطور</h1>
            <p className="text-lg text-gray-500 font-bold mt-2">Personalized Nutrition Strategy</p>
          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black uppercase">{clientData.coach}</h2>
            <p className="text-blue-600 font-mono text-lg">{clientData.phone}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-6 bg-gray-50 p-6 rounded-3xl border-2 border-gray-100">
          <InfoBox label="العميل" value={clientData.name || '---'} />
          <InfoBox label="الهدف" value={clientData.goal || '---'} />
          <InfoBox label="التاريخ" value={clientData.date} />
          <InfoBox label="الإجمالي" value={`${Math.round(totals.calories)} سعرة`} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 print:p-0">
        
        {/* 🛠 TOP BAR (Hidden in Print) */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Layout className="text-white" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-black">برو نيوتريشن <span className="text-blue-500 text-sm font-medium">PRO</span></h1>
              <p className="text-[10px] opacity-50 uppercase tracking-widest font-bold">Nutrition Engineering v2.0</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-neutral-900/50 dark:bg-neutral-900/50 p-1.5 rounded-2xl border border-neutral-800 backdrop-blur-md">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2.5 rounded-xl hover:bg-neutral-800 transition-all">
              {theme === 'dark' ? <Sun size={20} className="text-yellow-400"/> : <Moon size={20} className="text-blue-400"/>}
            </button>
            <div className="w-px h-6 bg-neutral-800 mx-1" />
            <button onClick={saveTemplate} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold transition-all">
              <Save size={16}/> حفظ كقالب
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/20">
              <Printer size={16}/> استخراج PDF
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 📊 LEFT COLUMN: SETTINGS & STATS */}
          <aside className="lg:col-span-4 space-y-6 print:hidden">
            
            {/* CLIENT DATA */}
            <div className={cn("p-6 rounded-[2rem] border transition-all", theme === 'dark' ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-gray-200 shadow-sm")}>
              <h3 className="flex items-center gap-2 mb-6 font-bold text-blue-500"><User size={18}/> بيانات العميل</h3>
              <div className="space-y-4">
                <InputGroup label="اسم العميل" value={clientData.name} onChange={v => setClientData({...clientData, name: v})} placeholder="مثال: محمد علي"/>
                <InputGroup label="الهدف" value={clientData.goal} onChange={v => setClientData({...clientData, goal: v})} placeholder="تضخيم عضلي / تنشيف"/>
              </div>
            </div>

            {/* TARGET MACROS */}
            <div className={cn("p-6 rounded-[2rem] border transition-all", theme === 'dark' ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-gray-200 shadow-sm")}>
              <h3 className="flex items-center gap-2 mb-6 font-bold text-orange-500"><Settings size={18}/> الماكروز المستهدفة</h3>
              <div className="grid grid-cols-2 gap-4">
                <MacroInput label="السعرات" value={targetMacros.calories} onChange={v => setTargetMacros({...targetMacros, calories: v})} color="bg-orange-500/10 text-orange-500"/>
                <MacroInput label="البروتين" value={targetMacros.protein} onChange={v => setTargetMacros({...targetMacros, protein: v})} color="bg-red-500/10 text-red-500"/>
                <MacroInput label="الكارب" value={targetMacros.carbs} onChange={v => setTargetMacros({...targetMacros, carbs: v})} color="bg-blue-500/10 text-blue-500"/>
                <MacroInput label="الدهون" value={targetMacros.fat} onChange={v => setTargetMacros({...targetMacros, fat: v})} color="bg-yellow-500/10 text-yellow-500"/>
              </div>
            </div>

            {/* PROGRESS BARS */}
            <div className={cn("p-6 rounded-[2rem] border transition-all", theme === 'dark' ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-gray-200 shadow-sm")}>
              <h3 className="flex items-center gap-2 mb-6 font-bold text-emerald-500"><Info size={18}/> حالة الإنجاز</h3>
              <div className="space-y-6">
                <ProgressBar label="السعرات" current={totals.calories} target={targetMacros.calories} unit="kcal" color="bg-orange-500" />
                <ProgressBar label="البروتين" current={totals.protein} target={targetMacros.protein} unit="g" color="bg-red-500" />
                <ProgressBar label="الكارب" current={totals.carbs} target={targetMacros.carbs} unit="g" color="bg-blue-500" />
                <ProgressBar label="الدهون" current={totals.fat} target={targetMacros.fat} unit="g" color="bg-yellow-500" />
              </div>
            </div>

            {/* TEMPLATES */}
            {templates.length > 0 && (
              <div className={cn("p-6 rounded-[2rem] border transition-all", theme === 'dark' ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-gray-200 shadow-sm")}>
                <h3 className="flex items-center gap-2 mb-4 font-bold text-purple-500"><Copy size={18}/> القوالب المحفوظة</h3>
                <div className="space-y-2">
                  {templates.map(t => (
                    <div key={t.id} className="flex gap-2">
                      <button onClick={() => loadTemplate(t)} className="flex-1 text-right p-3 bg-neutral-800/50 rounded-xl hover:bg-neutral-800 text-xs font-bold border border-neutral-700/50 transition-all truncate">
                        {t.name}
                      </button>
                      <button onClick={() => {
                        const next = templates.filter(x => x.id !== t.id);
                        setTemplates(next);
                        localStorage.setItem('pro_nutrition_templates', JSON.stringify(next));
                      }} className="p-3 text-neutral-500 hover:text-red-500">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* 🍱 RIGHT COLUMN: MEALS LIST */}
          <main className="lg:col-span-8 space-y-8">
            
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                {meals.map((meal) => (
                  <MealCard 
                    key={meal.id} 
                    meal={meal} 
                    theme={theme}
                    onAddItems={() => { setActiveMealId(meal.id); setIsModalOpen(true); }}
                    onRemove={() => removeMeal(meal.id)}
                    onDuplicate={() => duplicateMeal(meal)}
                    onUpdateMeal={(updated) => setMeals(meals.map(m => m.id === meal.id ? updated : m))}
                    moveItem={(itemInstId, dir) => moveItem(meal.id, itemInstId, dir)}
                  />
                ))}
              </SortableContext>
            </DndContext>

            <button 
              onClick={addMeal}
              className={cn(
                "w-full py-8 border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center gap-2 transition-all print:hidden",
                theme === 'dark' ? "border-neutral-800 hover:border-blue-600/50 hover:bg-blue-600/5 text-neutral-500 hover:text-blue-400" : "border-gray-200 hover:border-blue-400 hover:bg-blue-50 text-gray-400 hover:text-blue-500 shadow-sm"
              )}
            >
              <div className="p-3 bg-current/10 rounded-2xl">
                <Plus size={32} />
              </div>
              <span className="font-black text-lg">إضافة وجبة جديدة لليوم</span>
            </button>

            {/* 📋 PRINT FOOTER */}
            <div className="hidden print:block mt-16 pt-10 border-t-4 border-gray-100">
              <div className="flex justify-between items-start gap-10">
                <div className="flex-1">
                  <h4 className="text-xl font-black mb-2 text-blue-700">ملاحظات هامة:</h4>
                  <ul className="text-sm text-gray-600 space-y-2 leading-relaxed font-medium">
                    <li>• يرجى شرب 3-4 لتر ماء يومياً كحد أدنى.</li>
                    <li>• الأوزان المذكورة هي للصافي (وزن الميزان) بعد الطبخ إلا إذا ذكر غير ذلك.</li>
                    <li>• النوم الجيد (7-8 ساعات) جزء لا يتجزأ من نجاح البرنامج.</li>
                    <li>• يرجى الالتزام بالكميات المحددة لضمان الوصول للهدف المطلوب.</li>
                  </ul>
                </div>
                <div className="w-1/3 text-center bg-blue-600 text-white p-6 rounded-3xl">
                  <p className="text-xs font-bold opacity-80 mb-2 uppercase tracking-widest">Connect with Coach</p>
                  <p className="text-2xl font-black mb-1">{clientData.coach}</p>
                  <p className="text-lg font-mono">{clientData.phone}</p>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* 🔍 SEARCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={cn(
            "w-full max-w-3xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border",
            theme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200"
          )}>
            <div className="p-8 pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">قائمة الأطعمة الذكية</h2>
                <p className="text-xs opacity-50 font-bold mt-1">اختر الأصناف المراد إضافتها ({selectedFoods.size})</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-neutral-800/50 rounded-2xl hover:text-red-500 transition-all">
                <X size={24}/>
              </button>
            </div>

            <div className="p-8 pt-4 space-y-4">
              <div className="relative">
                <Search className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-500" size={20}/>
                <input 
                  autoFocus
                  className={cn(
                    "w-full py-4 pr-14 pl-6 rounded-2xl outline-none border transition-all font-bold",
                    theme === 'dark' ? "bg-black border-neutral-700 focus:border-blue-600" : "bg-gray-50 border-gray-200 focus:border-blue-500"
                  )}
                  placeholder="ابحث عن: دجاج، أرز، شوفان..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={cn(
                      "px-5 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-all border",
                      selectedCategory === cat 
                        ? "bg-blue-600 border-blue-500 text-white" 
                        : theme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-400" : "bg-gray-100 border-gray-200 text-gray-500"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-3 custom-scrollbar">
              {filteredFoods.map(f => {
                const isSelected = selectedFoods.has(f.id);
                return (
                  <div 
                    key={f.id}
                    onClick={() => toggleFoodSelection(f.id)}
                    className={cn(
                      "flex justify-between items-center p-5 rounded-[1.5rem] cursor-pointer border transition-all",
                      isSelected 
                        ? "bg-blue-600/10 border-blue-500/50 ring-2 ring-blue-500/20" 
                        : theme === 'dark' ? "bg-neutral-800/30 border-neutral-800 hover:border-neutral-700" : "bg-gray-50 border-gray-100 hover:border-blue-200"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs", isSelected ? "bg-blue-600 text-white" : "bg-neutral-800 text-neutral-500")}>
                        {isSelected ? <Check size={20}/> : f.category[0]}
                      </div>
                      <div>
                        <p className="font-black text-sm">{f.name}</p>
                        <div className="flex gap-3 mt-1 text-[10px] font-bold opacity-60">
                          <span className="text-orange-500">{f.calories} kcal</span>
                          <span className="text-red-500">P: {f.protein}g</span>
                          <span className="text-blue-500">C: {f.carbs}g</span>
                          <span className="text-yellow-500">F: {f.fat}g</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-black opacity-30 uppercase">{f.state}</div>
                  </div>
                );
              })}
              {filteredFoods.length === 0 && (
                <div className="text-center py-20 opacity-30">
                  <Search size={48} className="mx-auto mb-4"/>
                  <p className="font-bold">لم يتم العثور على نتائج للبحث</p>
                </div>
              )}
            </div>

            {selectedFoods.size > 0 && (
              <div className="p-8 border-t border-neutral-800/50 bg-neutral-900/50 backdrop-blur-md">
                <button 
                  onClick={addSelectedToMeal}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-blue-600/30 flex items-center justify-center gap-3"
                >
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

// --- Sub-components ---

function MealCard({ meal, theme, onAddItems, onRemove, onDuplicate, onUpdateMeal, moveItem }: { 
  meal: Meal, 
  theme: 'dark' | 'light', 
  onAddItems: () => void, 
  onRemove: () => void, 
  onDuplicate: () => void, 
  onUpdateMeal: (m: Meal) => void, 
  moveItem: (instId: string, dir: 'up' | 'down') => void 
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: meal.id });
  const [isCollapsed, setIsCollapsed] = useState(false);

  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  const mealTotals = meal.items.reduce((acc: any, it: any) => {
    const r = it.grams / 100;
    acc.cal += it.calories * r;
    acc.pro += it.protein * r;
    acc.carb += it.carbs * r;
    acc.fat += it.fat * r;
    return acc;
  }, { cal: 0, pro: 0, carb: 0, fat: 0 });

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className={cn(
        "rounded-[2.5rem] border transition-all overflow-hidden print:border-gray-200 print:rounded-2xl print:shadow-none print:mb-6 print:break-inside-avoid",
        theme === 'dark' ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-gray-100 shadow-sm",
        isDragging && "opacity-50 ring-2 ring-blue-600"
      )}
    >
      <div className={cn(
        "px-6 py-4 flex items-center justify-between border-b transition-all print:bg-gray-50",
        theme === 'dark' ? "bg-neutral-800/30 border-neutral-800" : "bg-gray-50/50 border-gray-100"
      )}>
        <div className="flex items-center gap-4 flex-1">
          <button {...attributes} {...listeners} className="p-2 text-neutral-600 hover:text-blue-500 cursor-grab active:cursor-grabbing print:hidden">
            <GripVertical size={20}/>
          </button>
          <input 
            className="bg-transparent font-black text-lg outline-none focus:text-blue-500 transition-colors w-full"
            value={meal.name}
            onChange={e => onUpdateMeal({ ...meal, name: e.target.value })}
          />
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5 mr-4 print:hidden">
             <div className="text-[9px] font-black bg-orange-500/10 text-orange-500 px-2.5 py-1.5 rounded-full border border-orange-500/20">{Math.round(mealTotals.cal)} kcal</div>
             <div className="text-[9px] font-black bg-red-500/10 text-red-500 px-2.5 py-1.5 rounded-full border border-red-500/20">{Math.round(mealTotals.pro)}g P</div>
             <div className="text-[9px] font-black bg-blue-500/10 text-blue-500 px-2.5 py-1.5 rounded-full border border-blue-500/20">{Math.round(mealTotals.carb)}g C</div>
             <div className="text-[9px] font-black bg-yellow-500/10 text-yellow-500 px-2.5 py-1.5 rounded-full border border-yellow-500/20">{Math.round(mealTotals.fat)}g F</div>
          </div>
          <div className="hidden print:flex gap-3 text-xs font-black text-blue-700">
            <span>{Math.round(mealTotals.cal)} kcal</span>
            <span className="opacity-60">P: {Math.round(mealTotals.pro)}g</span>
            <span className="opacity-60">C: {Math.round(mealTotals.carb)}g</span>
            <span className="opacity-60">F: {Math.round(mealTotals.fat)}g</span>
          </div>
          
          <button onClick={onDuplicate} title="تكرار الوجبة" className="p-2 text-neutral-500 hover:text-emerald-500 print:hidden transition-all">
            <Copy size={18}/>
          </button>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-2 text-neutral-500 hover:text-blue-500 print:hidden transition-all">
            {isCollapsed ? <ChevronDown size={20}/> : <ChevronUp size={20}/>}
          </button>
          <button onClick={onRemove} className="p-2 text-neutral-500 hover:text-red-500 print:hidden transition-all">
            <Trash2 size={18}/>
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-6">
          {meal.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-separate border-spacing-y-2">
                <thead>
                  <tr className="text-[10px] uppercase font-black text-neutral-500">
                    <th className="pb-2 pr-2">الصنف</th>
                    <th className="pb-2 text-center">الكمية (جم)</th>
                    <th className="pb-2 text-center">البروتين</th>
                    <th className="pb-2 text-center">الكارب</th>
                    <th className="pb-2 text-center">الدهون</th>
                    <th className="pb-2 text-center">السعرات</th>
                    <th className="pb-2 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  {meal.items.map((it: any) => (
                    <tr key={it.instId} className={cn(
                      "group transition-all rounded-2xl",
                      theme === 'dark' ? "bg-black/20 hover:bg-black/40" : "bg-gray-50/50 hover:bg-blue-50/30"
                    )}>
                      <td className="py-4 pr-4 rounded-r-2xl">
                        <div className="font-bold text-sm">{it.name}</div>
                        <div className="text-[10px] opacity-40 font-bold">{it.category} • {it.state}</div>
                      </td>
                      <td className="py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <input 
                             type="number" 
                             className={cn(
                               "w-16 p-2 rounded-xl text-center font-black text-xs border print:hidden",
                               theme === 'dark' ? "bg-black border-neutral-800" : "bg-white border-gray-200"
                             )}
                             value={it.grams}
                             onChange={e => onUpdateMeal({
                               ...meal,
                               items: meal.items.map((i: any) => i.instId === it.instId ? { ...i, grams: parseFloat(e.target.value) || 0 } : i)
                             })}
                           />
                           <span className="hidden print:inline font-black text-sm">{it.grams} جم</span>
                        </div>
                      </td>
                      <td className="py-4 text-center text-xs font-bold text-red-500/80">{Math.round(it.protein * it.grams/100)}g</td>
                      <td className="py-4 text-center text-xs font-bold text-blue-500/80">{Math.round(it.carbs * it.grams/100)}g</td>
                      <td className="py-4 text-center text-xs font-bold text-yellow-500/80">{Math.round(it.fat * it.grams/100)}g</td>
                      <td className="py-4 text-center text-sm font-black text-blue-500">{Math.round(it.calories * it.grams/100)}</td>
                      <td className="py-4 text-center rounded-l-2xl print:hidden">
                        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button onClick={() => moveItem(it.instId, 'up')} className="p-1 text-neutral-600 hover:text-blue-500"><ArrowUp size={14}/></button>
                          <button onClick={() => moveItem(it.instId, 'down')} className="p-1 text-neutral-600 hover:text-blue-500"><ArrowDown size={14}/></button>
                          <button 
                            onClick={() => onUpdateMeal({ ...meal, items: meal.items.filter((i: any) => i.instId !== it.instId) })}
                            className="p-1 text-neutral-600 hover:text-red-500 ml-2"
                          >
                            <X size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-neutral-800/50 rounded-3xl opacity-30 print:hidden">
               <Plus size={32} className="mx-auto mb-2 opacity-50"/>
               <p className="font-bold text-sm">الوجبة فارغة، أضف بعض الأصناف</p>
            </div>
          )}

          <div className="mt-6 flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <p className="text-[10px] font-black text-neutral-500 mb-2 uppercase mr-2 tracking-widest">ملاحظات وتعليمات الوجبة</p>
              <textarea 
                placeholder="مثلاً: خذ المكملات مع هذه الوجبة، اشرب كوبين ماء..."
                className={cn(
                  "w-full p-4 rounded-2xl text-xs font-bold outline-none border transition-all resize-none h-20 print:border-none print:p-0 print:h-auto print:italic",
                  theme === 'dark' ? "bg-black/40 border-neutral-800 focus:border-blue-600" : "bg-gray-50 border-gray-100 focus:border-blue-500"
                )}
                value={meal.notes}
                onChange={e => onUpdateMeal({ ...meal, notes: e.target.value })}
              />
            </div>
            <button 
              onClick={onAddItems}
              className="flex items-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 whitespace-nowrap print:hidden"
            >
              <Plus size={18}/> إضافة صنف
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div>
      <label className="text-[10px] font-black opacity-40 uppercase mr-2 tracking-widest">{label}</label>
      <input 
        className="w-full bg-black/40 border border-neutral-800 p-3.5 mt-1 rounded-2xl outline-none focus:border-blue-600 transition-all font-bold text-sm"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

function MacroInput({ label, value, onChange, color }: { label: string, value: number, onChange: (v: number) => void, color: string }) {
  return (
    <div className={cn("p-4 rounded-2xl border border-neutral-800", color)}>
      <label className="text-[10px] font-black uppercase block mb-1 opacity-70">{label}</label>
      <input 
        type="number"
        className="bg-transparent w-full font-black text-lg outline-none"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
      />
    </div>
  );
}

function ProgressBar({ label, current, target, unit, color }: any) {
  const percentage = Math.min((current / target) * 100, 110);
  const isOver = current > target * 1.05;
  const isNear = current > target * 0.9 && !isOver;

  return (
    <div>
      <div className="flex justify-between items-end mb-2">
        <span className="text-xs font-black uppercase opacity-60">{label}</span>
        <span className="text-sm font-black">
          {Math.round(current)} <span className="text-[10px] opacity-40">{unit}</span>
          <span className="mx-1 opacity-20">/</span>
          <span className="opacity-40">{target}</span>
        </span>
      </div>
      <div className="h-2.5 bg-neutral-800 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-500 rounded-full",
            isOver ? "bg-red-500" : isNear ? "bg-emerald-500" : color
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function InfoBox({ label, value }: any) {
  return (
    <div className="border-r-2 border-gray-100 pr-4 last:border-none">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
      <p className="text-lg font-black text-gray-800 mt-1">{value}</p>
    </div>
  );
}
