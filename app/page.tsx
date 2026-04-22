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
  { id: 92, name: "Spinach - سبانخ نية", state: "Raw", type: "خضار", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23