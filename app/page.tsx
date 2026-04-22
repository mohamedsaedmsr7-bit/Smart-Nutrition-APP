"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Trash2, Calculator, Search, Printer, ArrowUp, ArrowDown, X
} from 'lucide-react';

// ========== FULL FOOD DATABASE (150 Items) ==========
const FOOD_DATABASE = [
  // 🍚 CARB SOURCES
  { id: 1, name: "White Rice - أرز أبيض", state: "Raw", type: "نشويات", carbs: 78, protein: 7, fat: 0.6, calories: 360 },
  { id: 2, name: "Cooked White Rice - أرز أبيض مطبوخ", state: "Cooked", type: "نشويات", carbs: 28, protein: 2.7, fat: 0.3, calories: 130 },
  { id: 3, name: "Brown Rice - أرز بني", state: "Raw", type: "نشويات", carbs: 77, protein: 7.5, fat: 2.7, calories: 370 },
  { id: 4, name: "Cooked Brown Rice - أرز بني مطبوخ", state: "Cooked", type: "نشويات", carbs: 23, protein: 2.6, fat: 0.9, calories: 112 },
  { id: 5, name: "White Pasta - مكرونة بيضاء", state: "Raw", type: "نشويات", carbs: 75, protein: 13, fat: 1.5, calories: 370 },
  { id: 6, name: "Boiled White Pasta - مكرونة مسلوقة", state: "Cooked", type: "نشويات", carbs: 25, protein: 5, fat: 1, calories: 130 },
  { id: 7, name: "Macaroni Béchamel - مكرونة بالبشاميل", state: "Cooked", type: "نشويات", carbs: 20, protein: 6, fat: 8, calories: 180 },
  { id: 8, name: "Baladi Bread - خبز بلدي", state: "Ready", type: "نشويات", carbs: 55, protein: 9, fat: 1, calories: 280 },
  { id: 9, name: "Shami Bread - خبز شامي", state: "Ready", type: "نشويات", carbs: 56, protein: 8, fat: 1, calories: 275 },
  { id: 10, name: "White Toast - توست أبيض", state: "Ready", type: "نشويات", carbs: 49, protein: 8, fat: 4, calories: 265 },
  { id: 11, name: "Brown Toast - توست بني", state: "Ready", type: "نشويات", carbs: 43, protein: 9, fat: 4, calories: 250 },
  { id: 12, name: "Oats - شوفان", state: "Raw", type: "نشويات", carbs: 66, protein: 17, fat: 7, calories: 389 },
  { id: 13, name: "Cooked Oats - شوفان مطبوخ", state: "Cooked", type: "نشويات", carbs: 12, protein: 2.5, fat: 1.5, calories: 70 },
  { id: 14, name: "Corn - ذرة", state: "Raw", type: "نشويات", carbs: 19, protein: 3.4, fat: 1.2, calories: 96 },
  { id: 15, name: "Boiled Corn - ذرة مسلوقة", state: "Boiled", type: "نشويات", carbs: 21, protein: 3.4, fat: 1.5, calories: 96 },
  { id: 16, name: "Potatoes - بطاطس", state: "Raw", type: "نشويات", carbs: 17, protein: 2, fat: 0.1, calories: 77 },
  { id: 17, name: "Boiled Potatoes - بطاطس مسلوقة", state: "Boiled", type: "نشويات", carbs: 20, protein: 2, fat: 0.1, calories: 87 },
  { id: 18, name: "Fried Potatoes - بطاطس مقلية", state: "Fried", type: "نشويات", carbs: 35, protein: 3, fat: 10, calories: 250 },
  { id: 19, name: "Sweet Potato - بطاطا حلوة", state: "Raw", type: "نشويات", carbs: 20, protein: 1.6, fat: 0.1, calories: 86 },
  { id: 20, name: "Baked Sweet Potato - بطاطا مشوية", state: "Baked", type: "نشويات", carbs: 24, protein: 2, fat: 0.1, calories: 105 },
  { id: 21, name: "خبز شوفان - Oats Bread", state: "Baked", type: "نشويات", carbs: 42, protein: 9.5, fat: 4.5, calories: 240 },

  // 🍗 PROTEIN SOURCES
  { id: 22, name: "Raw Chicken Breast - صدور دجاج نية", state: "Raw", type: "بروتين", carbs: 0, protein: 23, fat: 1, calories: 120 },
  { id: 23, name: "Grilled Chicken Breast - صدور دجاج مشوية", state: "Grilled", type: "بروتين", carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 24, name: "Fried Chicken Breast - صدور دجاج مقلية", state: "Fried", type: "بروتين", carbs: 8, protein: 28, fat: 10, calories: 250 },
  { id: 25, name: "Raw Chicken Thigh - أوراك دجاج نية", state: "Raw", type: "بروتين", carbs: 0, protein: 19, fat: 9, calories: 180 },
  { id: 26, name: "Cooked Chicken Thigh - أوراك دجاج مطبوخة", state: "Cooked", type: "بروتين", carbs: 0, protein: 26, fat: 10, calories: 209 },
  { id: 27, name: "Chicken Liver - كبدة دجاج", state: "Cooked", type: "بروتين", carbs: 0, protein: 24, fat: 6, calories: 165 },
  { id: 28, name: "Raw Chicken Liver - كبدة نية", state: "Raw", type: "بروتين", carbs: 2, protein: 18, fat: 5, calories: 120 },
  { id: 29, name: "Raw Lean Beef - لحم بقري صافي ني", state: "Raw", type: "بروتين", carbs: 0, protein: 26, fat: 10, calories: 200 },
  { id: 30, name: "Cooked Lean Beef - لحم بقري مطبوخ", state: "Cooked", type: "بروتين", carbs: 0, protein: 30, fat: 12, calories: 250 },
  { id: 31, name: "Cooked Fatty Beef - لحم بقري سمين", state: "Cooked", type: "بروتين", carbs: 0, protein: 25, fat: 20, calories: 300 },
  { id: 32, name: "Grilled Kofta - كفتة مشوية", state: "Grilled", type: "بروتين", carbs: 5, protein: 25, fat: 20, calories: 300 },
  { id: 33, name: "Cooked Liver - كبدة مطبوخة", state: "Cooked", type: "بروتين", carbs: 5, protein: 26, fat: 5, calories: 175 },
  { id: 34, name: "Cooked Kidney - كلاوي مطبوخة", state: "Cooked", type: "بروتين", carbs: 4, protein: 24, fat: 6, calories: 160 },
  { id: 35, name: "Whole Eggs (Gm) - بيض كامل", state: "Raw", type: "بروتين", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 36, name: "Boiled Eggs - بيض مسلوق", state: "Boiled", type: "بروتين", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 37, name: "Egg White - بياض بيض", state: "Raw", type: "بروتين", carbs: 0, protein: 11, fat: 0.5, calories: 52 },
  { id: 38, name: "1 Whole Egg - بيضة كاملة", state: "1 Egg", type: "بروتين", carbs: 0.3, protein: 6, fat: 5, calories: 65 },
  { id: 39, name: "Canned Tuna (Water) - تونة (ماء)", state: "Canned", type: "بروتين", carbs: 0, protein: 25, fat: 1, calories: 116 },
  { id: 40, name: "Canned Tuna (Oil) - تونة (زيت)", state: "Canned", type: "بروتين", carbs: 0, protein: 25, fat: 10, calories: 200 },
  { id: 41, name: "Canned Sardines - سردين معلب", state: "Canned", type: "بروتين", carbs: 0, protein: 25, fat: 11, calories: 208 },
  { id: 42, name: "Full Fat Milk - حليب كامل الدسم", state: "Liquid", type: "بروتين", carbs: 5, protein: 3.3, fat: 3.5, calories: 61 },
  { id: 43, name: "Low Fat Milk - حليب قليل الدسم", state: "Liquid", type: "بروتين", carbs: 5, protein: 3.4, fat: 1, calories: 42 },
  { id: 44, name: "Regular Yogurt - زبادي عادي", state: "Regular", type: "بروتين", carbs: 4, protein: 3.5, fat: 3, calories: 60 },
  { id: 45, name: "Plain Greek Yogurt - زبادي يوناني", state: "Plain", type: "بروتين", carbs: 4, protein: 10, fat: 5, calories: 97 },
  { id: 46, name: "Feta Cheese - جبنة فيتا", state: "Regular", type: "بروتين", carbs: 4, protein: 14, fat: 21, calories: 264 },
  { id: 47, name: "Roumy Cheese - جبنة رومي", state: "Regular", type: "بروتين", carbs: 2, protein: 25, fat: 32, calories: 350 },
  { id: 48, name: "Cottage Cheese - جبنة قريش", state: "Low Fat", type: "بروتين", carbs: 3, protein: 11, fat: 4, calories: 98 },

  // 🧈 FAT SOURCES
  { id: 49, name: "Olive Oil - زيت زيتون", state: "Raw", type: "دهون", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 50, name: "Sunflower Oil - زيت عباد شمس", state: "Raw", type: "دهون", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 51, name: "Corn Oil - زيت ذرة", state: "Raw", type: "دهون", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 52, name: "Butter - زبدة", state: "Raw", type: "دهون", carbs: 0, protein: 1, fat: 81, calories: 717 },
  { id: 53, name: "Ghee (Samna) - سمن بلدي", state: "Raw", type: "دهون", carbs: 0, protein: 0, fat: 100, calories: 900 },
  { id: 54, name: "Margarine - سمن صناعي", state: "Raw", type: "دهون", carbs: 0, protein: 0, fat: 80, calories: 717 },
  { id: 55, name: "Mayonnaise - مايونيز", state: "Ready", type: "دهون", carbs: 1, protein: 1, fat: 75, calories: 680 },
  { id: 56, name: "Tahini - طحينة", state: "Raw", type: "دهون", carbs: 21, protein: 17, fat: 54, calories: 595 },

  // 🥜 NUTS & SEEDS
  { id: 57, name: "Almonds - لوز", state: "Raw", type: "مكسرات", carbs: 22, protein: 21, fat: 50, calories: 579 },
  { id: 58, name: "Peanuts - سوداني", state: "Raw", type: "مكسرات", carbs: 16, protein: 26, fat: 49, calories: 567 },
  { id: 59, name: "Cashews - كاجو", state: "Raw", type: "مكسرات", carbs: 30, protein: 18, fat: 44, calories: 553 },
  { id: 60, name: "Walnuts - عين جمل", state: "Raw", type: "مكسرات", carbs: 14, protein: 15, fat: 65, calories: 654 },
  { id: 61, name: "Hazelnuts - بندق", state: "Raw", type: "مكسرات", carbs: 17, protein: 15, fat: 61, calories: 628 },
  { id: 62, name: "Pistachios - فستق", state: "Raw", type: "مكسرات", carbs: 28, protein: 20, fat: 45, calories: 562 },
  { id: 63, name: "Sunflower Seeds - لب عباد شمس", state: "Raw", type: "مكسرات", carbs: 20, protein: 21, fat: 51, calories: 584 },
  { id: 64, name: "Pumpkin Seeds - لب قرع", state: "Raw", type: "مكسرات", carbs: 15, protein: 30, fat: 49, calories: 559 },
  { id: 65, name: "Sesame Seeds - سمسم", state: "Raw", type: "مكسرات", carbs: 23, protein: 18, fat: 50, calories: 573 },
  { id: 66, name: "Chia Seeds - بذور شيا", state: "Raw", type: "مكسرات", carbs: 42, protein: 17, fat: 31, calories: 486 },
  { id: 67, name: "Flax Seeds - بذور كتان", state: "Raw", type: "مكسرات", carbs: 29, protein: 18, fat: 42, calories: 534 },

  // 🍎 FRUITS
  { id: 68, name: "Apple - تفاح", state: "Raw", type: "فاكهة", carbs: 14, protein: 0.3, fat: 0.2, calories: 52 },
  { id: 69, name: "Banana - موز", state: "Raw", type: "فاكهة", carbs: 23, protein: 1.1, fat: 0.3, calories: 96 },
  { id: 70, name: "Orange - برتقال", state: "Raw", type: "فاكهة", carbs: 12, protein: 0.9, fat: 0.1, calories: 47 },
  { id: 71, name: "Mandarin - يوسفي", state: "Raw", type: "فاكهة", carbs: 13, protein: 0.8, fat: 0.2, calories: 53 },
  { id: 72, name: "Grapes - عنب", state: "Raw", type: "فاكهة", carbs: 18, protein: 0.7, fat: 0.2, calories: 69 },
  { id: 73, name: "Mango - مانجو", state: "Raw", type: "فاكهة", carbs: 15, protein: 0.8, fat: 0.4, calories: 60 },
  { id: 74, name: "Guava - جوافة", state: "Raw", type: "فاكهة", carbs: 14, protein: 2.6, fat: 1, calories: 68 },
  { id: 75, name: "Watermelon - بطيخ", state: "Raw", type: "فاكهة", carbs: 8, protein: 0.6, fat: 0.2, calories: 30 },
  { id: 76, name: "Melon (Cantaloupe) - كانتلوب", state: "Raw", type: "فاكهة", carbs: 8, protein: 0.8, fat: 0.2, calories: 34 },
  { id: 77, name: "Strawberries - فراولة", state: "Raw", type: "فاكهة", carbs: 8, protein: 0.7, fat: 0.3, calories: 32 },
  { id: 78, name: "Pomegranate - رمان", state: "Raw", type: "فاكهة", carbs: 19, protein: 1.7, fat: 1.2, calories: 83 },
  { id: 79, name: "Peach - خوخ", state: "Raw", type: "فاكهة", carbs: 10, protein: 0.9, fat: 0.3, calories: 39 },
  { id: 80, name: "Pear - كمثرى", state: "Raw", type: "فاكهة", carbs: 15, protein: 0.4, fat: 0.1, calories: 57 },
  { id: 81, name: "Apricot - مشمش", state: "Raw", type: "فاكهة", carbs: 11, protein: 1.4, fat: 0.4, calories: 48 },
  { id: 82, name: "Plum - برقوق", state: "Raw", type: "فاكهة", carbs: 11, protein: 0.7, fat: 0.3, calories: 46 },
  { id: 83, name: "Kiwi - كيوي", state: "Raw", type: "فاكهة", carbs: 15, protein: 1.1, fat: 0.5, calories: 61 },
  { id: 84, name: "Pineapple - أناناس", state: "Raw", type: "فاكهة", carbs: 13, protein: 0.5, fat: 0.1, calories: 50 },
  { id: 85, name: "Dates - بلح / تمر", state: "Raw", type: "فاكهة", carbs: 75, protein: 2, fat: 0.2, calories: 280 },
  { id: 86, name: "Avocado - أفوكادو", state: "Raw", type: "فاكهة", carbs: 9, protein: 2, fat: 15, calories: 160 },
  
  // 🍹 JUICE
  { id: 87, name: "Orange Juice - عصير برتقال", state: "Fresh", type: "عصائر", carbs: 10, protein: 0.7, fat: 0.2, calories: 45 },
  { id: 88, name: "Mango Juice - عصير مانجو", state: "Fresh", type: "عصائر", carbs: 14, protein: 0.4, fat: 0.1, calories: 60 },
  { id: 89, name: "Apple Juice - عصير تفاح", state: "Fresh", type: "عصائر", carbs: 11, protein: 0.1, fat: 0.1, calories: 46 },

  // 🥗 VEGETABLES & SALADS
  { id: 90, name: "Lettuce - خس", state: "Raw", type: "خضار", carbs: 3, protein: 1.4, fat: 0.2, calories: 15 },
  { id: 91, name: "Arugula - جرجير", state: "Raw", type: "خضار", carbs: 3.7, protein: 2.6, fat: 0.7, calories: 25 },
  { id: 92, name: "Spinach - سبانخ نية", state: "Raw", type: "خضار", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23 },
  { id: 93, name: "Cooked Spinach - سبانخ مطبوخة", state: "Cooked", type: "خضار", carbs: 4, protein: 3, fat: 0.4, calories: 25 },
  { id: 94, name: "Tomato - طماطم", state: "Raw", type: "خضار", carbs: 4, protein: 0.9, fat: 0.2, calories: 18 },
  { id: 95, name: "Cucumber - خيار", state: "Raw", type: "خضار", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 16 },
  { id: 96, name: "Bell Pepper - فلفل ألوان", state: "Raw", type: "خضار", carbs: 6, protein: 1, fat: 0.3, calories: 31 },
  { id: 97, name: "Raw Zucchini - كوسة نية", state: "Raw", type: "خضار", carbs: 3, protein: 1.2, fat: 0.3, calories: 17 },
  { id: 98, name: "Cooked Zucchini - كوسة مطبوخة", state: "Cooked", type: "خضار", carbs: 3.5, protein: 1.2, fat: 0.3, calories: 20 },
  { id: 99, name: "Cooked Molokhia - ملوخية مطبوخة", state: "Cooked", type: "خضار", carbs: 7, protein: 3, fat: 0.5, calories: 60 },
  { id: 100, name: "Parsley - بقدونس", state: "Raw", type: "خضار", carbs: 6, protein: 3, fat: 0.8, calories: 36 },
  { id: 101, name: "Coriander - كزبرة", state: "Raw", type: "خضار", carbs: 4, protein: 2, fat: 0.5, calories: 23 },
  { id: 102, name: "Dill - شبت", state: "Raw", type: "خضار", carbs: 7, protein: 3.5, fat: 1.1, calories: 43 },
  { id: 103, name: "Mint - نعناع", state: "Raw", type: "خضار", carbs: 8, protein: 3.8, fat: 0.9, calories: 44 },
  { id: 104, name: "Green Onion - بصل أخضر", state: "Raw", type: "خضار", carbs: 7, protein: 1.8, fat: 0.2, calories: 32 },
  { id: 105, name: "Raw Cabbage - كرنب نيء", state: "Raw", type: "خضار", carbs: 6, protein: 1.3, fat: 0.1, calories: 25 },
  { id: 106, name: "Raw Red Cabbage - كرنب أحمر نيء", state: "Raw", type: "خضار", carbs: 7, protein: 1.4, fat: 0.2, calories: 31 },
  { id: 107, name: "Cooked Cabbage - كرنب مطبوخ", state: "Cooked", type: "خضار", carbs: 6, protein: 1.3, fat: 0.1, calories: 25 },
  { id: 108, name: "Onion - بصل", state: "Raw", type: "خضار", carbs: 9, protein: 1.1, fat: 0.1, calories: 40 },
  { id: 109, name: "Carrot - جزر", state: "Raw", type: "خضار", carbs: 10, protein: 0.9, fat: 0.2, calories: 41 },
  { id: 110, name: "Beetroot - بنجر", state: "Raw", type: "خضار", carbs: 10, protein: 1.6, fat: 0.2, calories: 43 },
  { id: 111, name: "Radish - فجل", state: "Raw", type: "خضار", carbs: 3.4, protein: 0.7, fat: 0.1, calories: 16 },
  { id: 112, name: "Lemon - ليمون", state: "Raw", type: "خضار", carbs: 9, protein: 1.1, fat: 0.3, calories: 29 },
  { id: 113, name: "Raw Eggplant - باذنجان نيء", state: "Raw", type: "خضار", carbs: 6, protein: 1, fat: 0.2, calories: 25 },
  { id: 114, name: "Fried Eggplant - باذنجان مقلي", state: "Fried", type: "خضار", carbs: 9, protein: 1, fat: 9, calories: 120 },
  { id: 115, name: "Grilled Eggplant - باذنجان مشوي", state: "Grilled", type: "خضار", carbs: 6, protein: 1, fat: 0.2, calories: 35 },
  { id: 116, name: "Raw Okra - بامية نية", state: "Raw", type: "خضار", carbs: 7, protein: 2, fat: 0.1, calories: 33 },
  { id: 117, name: "Cooked Okra - بامية مطبوخة", state: "Cooked", type: "خضار", carbs: 7, protein: 2, fat: 0.2, calories: 35 },
  { id: 118, name: "Raw Green Beans - فاصوليا خضراء", state: "Raw", type: "خضار", carbs: 7, protein: 2, fat: 0.1, calories: 31 },
  { id: 119, name: "Cooked Green Beans - فاصوليا مطبوخة", state: "Cooked", type: "خضار", carbs: 7, protein: 2, fat: 0.1, calories: 35 },
  { id: 120, name: "Cooked Peas - بسلة مطبوخة", state: "Cooked", type: "خضار", carbs: 14, protein: 5, fat: 0.4, calories: 81 },
  { id: 121, name: "Raw Cauliflower - قرنبيط نيء", state: "Raw", type: "خضار", carbs: 5, protein: 2, fat: 0.3, calories: 25 },
  { id: 122, name: "Cooked Cauliflower - قرنبيط مطبوخ", state: "Cooked", type: "خضار", carbs: 5, protein: 2, fat: 0.3, calories: 23 },
  { id: 123, name: "Raw Broccoli - بروكلي نيء", state: "Raw", type: "خضار", carbs: 7, protein: 2.8, fat: 0.4, calories: 34 },
  { id: 124, name: "Cooked Broccoli - بروكلي مطبوخ", state: "Cooked", type: "خضار", carbs: 7, protein: 2.4, fat: 0.4, calories: 35 },
  { id: 125, name: "Raw Mushrooms - مشروم نيء", state: "Raw", type: "خضار", carbs: 3, protein: 3.1, fat: 0.3, calories: 22 },
  { id: 126, name: "Cooked Mushrooms - مشروم مطبوخ", state: "Cooked", type: "خضار", carbs: 3, protein: 3, fat: 0.3, calories: 28 },
  { id: 127, name: "Raw Garlic - ثوم نيء", state: "Raw", type: "خضار", carbs: 33, protein: 6.4, fat: 0.5, calories: 149 },
  { id: 128, name: "Cooked Garlic - ثوم مطبوخ", state: "Cooked", type: "خضار", carbs: 30, protein: 6, fat: 0.5, calories: 140 },
  { id: 129, name: "Cooked Onion - بصل مطبوخ", state: "Cooked", type: "خضار", carbs: 10, protein: 1.2, fat: 0.1, calories: 44 },
  { id: 130, name: "Raw Leek - كرات", state: "Raw", type: "خضار", carbs: 14, protein: 1.5, fat: 0.3, calories: 61 },
  { id: 131, name: "Raw Turnip - لفت نيء", state: "Raw", type: "خضار", carbs: 6, protein: 0.9, fat: 0.1, calories: 28 },
  { id: 132, name: "Cooked Turnip - لفت مطبوخ", state: "Cooked", type: "خضار", carbs: 7, protein: 1, fat: 0.2, calories: 30 },
  { id: 133, name: "Cooked Artichoke - خرشوف مطبوخ", state: "Cooked", type: "خضار", carbs: 11, protein: 3.3, fat: 0.2, calories: 53 },
  { id: 134, name: "Ready Lentil Soup - شوربة عدس", state: "Ready", type: "خضار", carbs: 14, protein: 5, fat: 2, calories: 90 },
  { id: 135, name: "Green Salad - سلطة خضراء", state: "Ready", type: "خضار", carbs: 4, protein: 1, fat: 0.2, calories: 20 },
  { id: 136, name: "Green Salad + Lemon - سلطة بالليمون", state: "Ready", type: "خضار", carbs: 4, protein: 1, fat: 0.2, calories: 22 },
  { id: 137, name: "Green Salad + Olive Oil - سلطة بزيت زيتون", state: "Ready", type: "خضار", carbs: 4, protein: 1, fat: 10, calories: 110 },
  { id: 138, name: "Pickles (Torshi) - مخلل (طرشي)", state: "Ready", type: "خضار", carbs: 2, protein: 0.5, fat: 0.2, calories: 12 },

  // 🫘 LEGUMES
  { id: 139, name: "Cooked Lentils - عدس مطبوخ", state: "Cooked", type: "بقوليات", carbs: 20, protein: 9, fat: 0.4, calories: 116 },
  { id: 140, name: "Cooked Chickpeas - حمص مطبوخ", state: "Cooked", type: "بقوليات", carbs: 27, protein: 9, fat: 2.6, calories: 164 },
  { id: 141, name: "Fava Beans / Foul - فول مدمس", state: "Cooked", type: "بقوليات", carbs: 18, protein: 8, fat: 0.5, calories: 110 },
  { id: 142, name: "Cooked Kidney Beans - فاصوليا حمراء", state: "Cooked", type: "بقوليات", carbs: 23, protein: 9, fat: 0.5, calories: 127 },
  { id: 143, name: "Cooked White Beans - فاصوليا بيضاء", state: "Cooked", type: "بقوليات", carbs: 25, protein: 9, fat: 0.5, calories: 139 },
  { id: 144, name: "Cooked Black-eyed Peas - لوبيا", state: "Cooked", type: "بقوليات", carbs: 21, protein: 8, fat: 0.5, calories: 116 },
  { id: 145, name: "Green Peas - بسلة خضراء", state: "Cooked", type: "بقوليات", carbs: 14, protein: 5, fat: 0.4, calories: 81 },
  { id: 146, name: "Lupin Beans - ترمس", state: "Ready", type: "بقوليات", carbs: 10, protein: 16, fat: 4.9, calories: 119 },
  { id: 147, name: "Raw Lentils - عدس خام", state: "Raw", type: "بقوليات", carbs: 60, protein: 25, fat: 1.1, calories: 353 },
  { id: 148, name: "Raw Chickpeas - حمص خام", state: "Raw", type: "بقوليات", carbs: 61, protein: 19, fat: 6, calories: 364 },

  // ☕ HOT DRINKS
  { id: 149, name: "Tea - شاى", state: "Ready", type: "مشروبات", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 150, name: "Coffee - قهوة", state: "Ready", type: "مشروبات", carbs: 0, protein: 0, fat: 0, calories: 0 }
];

export default function NutritionPlanner() {
  const [meals, setMeals] = useState([
    { id: 1, name: "الإفطار", items: [] as any[], isOpen: true },
    { id: 2, name: "الغداء", items: [] as any[], isOpen: true },
    { id: 3, name: "العشاء", items: [] as any[], isOpen: true }
  ]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<number | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("الكل");
  const foodTypes = ["الكل", "نشويات", "بروتين", "دهون", "مكسرات", "فاكهة", "خضار", "بقوليات", "عصائر", "مشروبات"];

  const filteredDatabase = useMemo(() => {
    return FOOD_DATABASE.filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = activeFilter === "الكل" || food.type === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, activeFilter]);

  const calculateTotals = () => {
    return meals.reduce((acc, meal) => {
      const mealTotals = meal.items.reduce((mAcc, item) => {
        const ratio = (item.grams || 0) / 100;
        return {
          cal: mAcc.cal + (item.calories * ratio),
          pro: mAcc.pro + (item.protein * ratio),
          carb: mAcc.carb + (item.carbs * ratio),
          fat: mAcc.fat + (item.fat * ratio)
        };
      }, { cal: 0, pro: 0, carb: 0, fat: 0 });
      return {
        cal: acc.cal + mealTotals.cal, pro: acc.pro + mealTotals.pro,
        carb: acc.carb + mealTotals.carb, fat: acc.fat + mealTotals.fat
      };
    }, { cal: 0, pro: 0, carb: 0, fat: 0 });
  };

  const totals = calculateTotals();

  // --- Meal Controls ---
  const addNewMeal = () => setMeals([...meals, { id: Date.now(), name: "وجبة جديدة", items: [], isOpen: true }]);
  const deleteMeal = (id: number) => setMeals(meals.filter(m => m.id !== id));
  const renameMeal = (id: number, name: string) => setMeals(meals.map(m => m.id === id ? { ...m, name } : m));
  
  const moveMeal = (idx: number, dir: 'up' | 'down') => {
    const newMeals = [...meals];
    const target = dir === 'up' ? idx - 1 : idx + 1;
    if (target >= 0 && target < newMeals.length) {
      [newMeals[idx], newMeals[target]] = [newMeals[target], newMeals[idx]];
      setMeals(newMeals);
    }
  };

  // --- Item Controls ---
  const openAddModal = (mealId: number) => {
    setActiveMealId(mealId);
    setIsModalOpen(true);
    setSearchTerm(""); // Reset search when opening
  };

  const addItemToActiveMeal = (food: any) => {
    if (activeMealId !== null) {
      setMeals(meals.map(m => m.id === activeMealId ? { 
        ...m, items: [...m.items, { ...food, grams: 100, instanceId: Date.now() }] 
      } : m));
      setIsModalOpen(false); // Close modal after adding
    }
  };

  const updateGrams = (mealId: number, instId: number, grams: number) => {
    setMeals(meals.map(m => m.id === mealId ? {
      ...m, items: m.items.map((it: any) => it.instanceId === instId ? { ...it, grams } : it)
    } : m));
  };

  const removeItem = (mealId: number, instId: number) => {
    setMeals(meals.map(m => m.id === mealId ? { ...m, items: m.items.filter((it: any) => it.instanceId !== instId) } : m));
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8 font-sans" dir="rtl">
      {/* Hide things when printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print { .no-print { display: none !important; } body { background: white; color: black; } }
      `}} />

      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 no-print shadow-2xl">
          <h1 className="text-2xl font-black text-blue-500 flex items-center gap-3">
            <Calculator size={32} /> برو نيوتريشن
          </h1>
          <div className="flex gap-2">
            <button onClick={addNewMeal} className="bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all">
              <Plus size={20} /> إضافة وجبة
            </button>
            <button onClick={() => window.print()} className="bg-neutral-800 hover:bg-neutral-700 px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 border border-neutral-700">
              <Printer size={18} /> PDF
            </button>
          </div>
        </div>

        {/* Totals Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <MacroCard label="السعرات" value={totals.cal} color="text-orange-500" unit="kcal" />
          <MacroCard label="البروتين" value={totals.pro} color="text-red-500" unit="جم" />
          <MacroCard label="الكارب" value={totals.carb} color="text-blue-500" unit="جم" />
          <MacroCard label="الدهون" value={totals.fat} color="text-yellow-500" unit="جم" />
        </div>

        {/* Meals List */}
        <div className="space-y-8">
          {meals.map((meal, idx) => (
            <div key={meal.id} className="bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden shadow-lg">
              
              {/* Meal Header (Rename & Reorder) */}
              <div className="p-5 flex items-center justify-between bg-neutral-800/40 border-b border-neutral-800">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col no-print text-neutral-500">
                    <button onClick={() => moveMeal(idx, 'up')} className="hover:text-blue-400 p-1"><ArrowUp size={16}/></button>
                    <button onClick={() => moveMeal(idx, 'down')} className="hover:text-blue-400 p-1"><ArrowDown size={16}/></button>
                  </div>
                  {/* Click to Rename Meal */}
                  <input 
                    className="bg-transparent text-xl font-black outline-none focus:text-blue-400 w-48 border-b-2 border-transparent focus:border-blue-500 transition-colors" 
                    value={meal.name} 
                    onChange={(e) => renameMeal(meal.id, e.target.value)} 
                    placeholder="اسم الوجبة"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold bg-black/40 px-4 py-1.5 rounded-full border border-neutral-800">
                    {Math.round(meal.items.reduce((acc, it) => acc + (it.calories * it.grams/100), 0))} kcal
                  </span>
                  <button onClick={() => deleteMeal(meal.id)} className="text-neutral-600 hover:text-red-500 transition-colors no-print p-2">
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>

              {/* Meal Items */}
              <div className="p-6">
                <div className="space-y-3 mb-6">
                  {meal.items.length === 0 && <p className="text-neutral-500 text-sm text-center py-4">لا توجد أصناف، اضغط لإضافة طعام</p>}
                  
                  {meal.items.map((item: any) => (
                    <div key={item.instanceId} className="flex items-center justify-between bg-black/40 p-3 rounded-2xl border border-neutral-800/50">
                      <div className="flex-1">
                        <p className="font-bold text-sm">{item.name}</p>
                        <p className="text-[10px] text-neutral-500 uppercase">{item.type} | {item.state}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          className="w-16 bg-neutral-800 border border-neutral-700 rounded-lg p-2 text-center text-sm font-black outline-none focus:border-blue-500 no-print" 
                          value={item.grams} 
                          onChange={(e) => updateGrams(meal.id, item.instanceId, parseFloat(e.target.value) || 0)} 
                        />
                        <span className="text-xs font-bold w-12">{item.grams}جم</span>
                        <button onClick={() => removeItem(meal.id, item.instanceId)} className="text-neutral-600 hover:text-red-500 no-print transition-colors"><X size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Open Modal Button */}
                <button 
                  onClick={() => openAddModal(meal.id)} 
                  className="w-full no-print py-4 rounded-xl border-2 border-dashed border-neutral-700 hover:border-blue-500 text-neutral-500 hover:text-blue-400 font-bold flex items-center justify-center gap-2 transition-all hover:bg-blue-900/10"
                >
                  <Plus size={20} /> إضافة صنف لـ {meal.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* ========== POPUP MODAL (SEPARATE WINDOW) ========== */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-center items-center p-4 no-print">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-neutral-800 flex justify-between items-center bg-neutral-950/50">
                <h2 className="text-xl font-black">إضافة طعام جديد</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-neutral-500 hover:text-red-500 bg-neutral-800 hover:bg-red-900/30 p-2 rounded-full transition-all">
                  <X size={20} />
                </button>
              </div>

              {/* Modal Search & Filters */}
              <div className="p-6 border-b border-neutral-800 bg-neutral-900">
                <div className="relative mb-4">
                  <Search className="absolute right-4 top-3.5 text-neutral-500" size={20} />
                  <input 
                    type="text" 
                    placeholder={`ابحث في ${FOOD_DATABASE.length} صنف...`} 
                    className="w-full bg-black border border-neutral-700 rounded-xl py-3 pr-12 outline-none focus:border-blue-500 transition-all text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {foodTypes.map(t => (
                    <button 
                      key={t} onClick={() => setActiveFilter(t)}
                      className={`px-4 py-1.5 rounded-full text-xs font-black border transition-all ${activeFilter === t ? 'bg-blue-600 border-blue-600 text-white' : 'bg-neutral-800 border-neutral-700 text-neutral-400 hover:text-white'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Modal Food List (Scrollable) */}
              <div className="overflow-y-auto p-4 custom-scrollbar bg-black/20" style={{ maxHeight: '50vh' }}>
                <div className="grid grid-cols-1 gap-2">
                  {filteredDatabase.map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => addItemToActiveMeal(f)} 
                      className="flex justify-between items-center p-4 bg-neutral-800/40 border border-neutral-800/80 rounded-2xl hover:bg-blue-600/20 hover:border-blue-500/50 text-right group transition-all"
                    >
                      <div className="flex flex-col items-start">
                         <span className="text-sm font-bold group-hover:text-blue-400">{f.name}</span>
                         <span className="text-xs text-neutral-500 mt-1">{f.calories} kcal / 100g | {f.type}</span>
                      </div>
                      <div className="bg-neutral-900 p-2 rounded-full group-hover:bg-blue-600 transition-colors">
                        <Plus size={18} className="text-neutral-400 group-hover:text-white" />
                      </div>
                    </button>
                  ))}
                  {filteredDatabase.length === 0 && (
                    <div className="text-center text-neutral-500 py-10 font-medium">لا توجد نتائج مطابقة لبحثك</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function MacroCard({ label, value, color, unit }: any) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-3xl text-center shadow-inner">
      <p className="text-[10px] font-black uppercase text-neutral-500 mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{Math.round(value)} <span className="text-xs opacity-60">{unit}</span></p>
    </div>
  );
}