"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Trash2, Search, Printer, ArrowUp, ArrowDown, X, Check, Save, Copy, User,
  Settings, ChevronDown, ChevronUp, Sun, Moon, Info, Layout, GripVertical, Lock,
  BookOpen, Flame, Zap, Droplets, Calculator, Users, Globe, PieChart, Edit2, ChevronRight
} from 'lucide-react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)); }

// =====================================================================
// FOOD DATABASE — Comprehensive Gulf & Egypt Edition
// =====================================================================
const FOOD_DATABASE = [
  // --- CARBS ---
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
  { id: 119, name: "Bulgur Raw - برغل نيء", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat: 1.3, calories: 342 },
  { id: 120, name: "Freekeh Cooked - فريك مطبوخ", category: "Carb", state: "Cooked", carbs: 19, protein: 6, fat: 0.5, calories: 150 },
  { id: 121, name: "Freekeh Raw - فريك نيء", category: "Carb", state: "Raw", carbs: 76, protein: 12, fat: 1.5, calories: 340 },
  { id: 125, name: "Popcorn Kernels - ذرة فشار خام", category: "Carb", state: "Raw", carbs: 74.0, protein: 11.0, fat: 4.5, calories: 365.0 },
  { id: 126, name: "Kabsa Rice Cooked - أرز كبسة مطبوخ", category: "Carb", state: "Cooked", carbs: 30.0, protein: 3.5, fat: 2.5, calories: 155.0 },
  { id: 127, name: "Saleeg Rice Cooked - أرز سليق مطبوخ", category: "Carb", state: "Cooked", carbs: 26.0, protein: 4.0, fat: 4.0, calories: 158.0 },
  { id: 128, name: "Muhammar Rice Cooked - أرز محمر مطبوخ", category: "Carb", state: "Cooked", carbs: 35.0, protein: 2.5, fat: 1.5, calories: 162.0 },
  { id: 129, name: "Samoli Bread - خبز الصمولي", category: "Carb", state: "Ready", carbs: 52.0, protein: 9.0, fat: 3.0, calories: 275.0 },
  { id: 130, name: "Khobz Arabi Gulf - خبز عربي خليجي", category: "Carb", state: "Ready", carbs: 55.0, protein: 8.5, fat: 1.2, calories: 272.0 },
  { id: 131, name: "Lachuch Yemeni Bread - لحوح يمني", category: "Carb", state: "Ready", carbs: 38.0, protein: 6.0, fat: 1.5, calories: 190.0 },
  { id: 132, name: "Corn on the Cob - ذرة على الكوز", category: "Carb", state: "Cooked", carbs: 19.0, protein: 3.3, fat: 1.4, calories: 96.0 },
  { id: 133, name: "Vermicelli Raw - شعرية نيئة", category: "Carb", state: "Raw", carbs: 74.0, protein: 12.0, fat: 1.5, calories: 357.0 },
  { id: 134, name: "Cooked Vermicelli - شعرية مطبوخة", category: "Carb", state: "Cooked", carbs: 25.0, protein: 4.5, fat: 0.8, calories: 125.0 },
  { id: 135, name: "Quinoa Raw - كينوا نيئة", category: "Carb", state: "Raw", carbs: 64.0, protein: 14.0, fat: 6.0, calories: 368.0 },
  { id: 136, name: "Quinoa Cooked - كينوا مطبوخة", category: "Carb", state: "Cooked", carbs: 21.3, protein: 4.4, fat: 1.9, calories: 120.0 },
  { id: 137, name: "Whole Wheat Pasta Raw - مكرونة قمح كامل", category: "Carb", state: "Raw", carbs: 71.0, protein: 14.0, fat: 2.5, calories: 352.0 },
  { id: 138, name: "Whole Wheat Pasta Cooked - مكرونة قمح كامل مسلوقة", category: "Carb", state: "Cooked", carbs: 27.0, protein: 5.5, fat: 0.9, calories: 124.0 },
  { id: 139, name: "Rice Cake Plain - كيك أرز سادة", category: "Carb", state: "Ready", carbs: 79.0, protein: 8.0, fat: 1.1, calories: 387.0 },
  { id: 140, name: "Harees Cooked - هريس مطبوخ", category: "Carb", state: "Cooked", carbs: 22.0, protein: 8.0, fat: 4.0, calories: 155.0 },
  { id: 141, name: "Jareesh Cooked - جريش مطبوخ", category: "Carb", state: "Cooked", carbs: 24.0, protein: 6.0, fat: 3.5, calories: 148.0 },
  { id: 142, name: "Balaleet - بلاليط", category: "Carb", state: "Cooked", carbs: 38.0, protein: 6.0, fat: 8.0, calories: 245.0 },
  { id: 143, name: "Fateer Meshaltet - فطير مشلتت", category: "Carb", state: "Cooked", carbs: 38.0, protein: 7.0, fat: 14.0, calories: 305.0 },

  // --- PROTEINS ---
  { id: 201, name: "Grilled Chicken Breast - صدور دجاج مشوية", category: "Protein", state: "Grilled", carbs: 0, protein: 31, fat: 3.6, calories: 165 },
  { id: 202, name: "Raw Chicken Breast - صدور دجاج نيئة", category: "Protein", state: "Raw", carbs: 0, protein: 23, fat: 1, calories: 120 },
  { id: 203, name: "Lean Minced Beef - مفروم بدون دهن", category: "Protein", state: "Raw", carbs: 0, protein: 24, fat: 2, calories: 120 },
  { id: 204, name: "Minced Beef 5% Fat - مفروم 5% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 21.5, fat: 5, calories: 137 },
  { id: 205, name: "Minced Beef 10% Fat - مفروم 10% دهون", category: "Protein", state: "Raw", carbs: 0, protein: 20, fat: 10, calories: 176 },
  { id: 207, name: "Grilled Lean Minced - مفروم بدون دهن مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 30, fat: 3, calories: 160 },
  { id: 208, name: "Grilled Minced 5% - مفروم 5% مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 28, fat: 7, calories: 185 },
  { id: 209, name: "Grilled Minced 10% - مفروم 10% مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26, fat: 13, calories: 230 },
  { id: 211, name: "Whole Eggs per 100g - بيض كامل", category: "Protein", state: "Raw", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 212, name: "Boiled Eggs - بيض مسلوق", category: "Protein", state: "Boiled", carbs: 1, protein: 13, fat: 11, calories: 155 },
  { id: 213, name: "Egg White 100g - بياض بيض", category: "Protein", state: "Raw", carbs: 0, protein: 11, fat: 0.5, calories: 52 },
  { id: 214, name: "Canned Tuna in Water - تونة في ماء", category: "Protein", state: "Canned", carbs: 0, protein: 25, fat: 1, calories: 116 },
  { id: 215, name: "Canned Tuna in Oil - تونة في زيت", category: "Protein", state: "Canned", carbs: 0, protein: 22, fat: 9, calories: 180 },
  { id: 217, name: "Large Egg 1 piece - بيضة كبيرة", category: "Protein", state: "Raw", carbs: 0.6, protein: 6.3, fat: 5.0, calories: 72 },
  { id: 218, name: "Egg White 1 piece - بياض بيضة", category: "Protein", state: "Raw", carbs: 0.2, protein: 3.6, fat: 0.1, calories: 17 },
  { id: 250, name: "Raw Beef Lean - لحم بقري نيء", category: "Protein", state: "Raw", carbs: 0, protein: 22, fat: 5, calories: 133 },
  { id: 251, name: "Grilled Beef Lean - لحم بقري مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 28, fat: 7, calories: 175 },
  { id: 252, name: "Boiled Beef - لحم بقري مسلوق", category: "Protein", state: "Boiled", carbs: 0, protein: 26, fat: 8, calories: 176 },
  { id: 253, name: "Raw Lamb - لحم ضأن نيء", category: "Protein", state: "Raw", carbs: 0, protein: 17, fat: 20, calories: 250 },
  { id: 254, name: "Grilled Kofta - كفتة مشوية", category: "Protein", state: "Grilled", carbs: 2, protein: 18, fat: 18, calories: 240 },
  { id: 260, name: "Grilled Tilapia - بلطي مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26.0, fat: 3.0, calories: 130.0 },
  { id: 261, name: "Grilled Mackerel - ماكريل مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 19.0, fat: 14.0, calories: 205.0 },
  { id: 262, name: "Grilled Mullet - بوري مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 20.0, fat: 9.0, calories: 170.0 },
  { id: 263, name: "Grilled Fish Fillet - فيليه سمك", category: "Protein", state: "Grilled", carbs: 0, protein: 21.0, fat: 1.5, calories: 105.0 },
  { id: 264, name: "Grilled Hamour - هامور مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 24.0, fat: 2.5, calories: 122.0 },
  { id: 265, name: "Grilled Zubaidi Pomfret - زبيدي مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 22.0, fat: 3.5, calories: 120.0 },
  { id: 266, name: "Grilled Safi Rabbitfish - صافي مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 21.0, fat: 2.0, calories: 105.0 },
  { id: 267, name: "Grilled Camel Meat - لحم إبل مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26.0, fat: 5.0, calories: 155.0 },
  { id: 268, name: "Raw Camel Meat - لحم إبل نيء", category: "Protein", state: "Raw", carbs: 0, protein: 20.0, fat: 4.5, calories: 125.0 },
  { id: 269, name: "Grilled Shrimp - جمبري مشوي", category: "Protein", state: "Grilled", carbs: 0.9, protein: 24.0, fat: 1.7, calories: 119.0 },
  { id: 270, name: "Grilled Chicken Thigh - فخذ دجاج مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26.0, fat: 9.0, calories: 190.0 },
  { id: 271, name: "Roasted Whole Chicken - دجاجة مشوية", category: "Protein", state: "Grilled", carbs: 0, protein: 25.0, fat: 9.5, calories: 195.0 },
  { id: 272, name: "Grilled Sardines - سردين مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 21.0, fat: 11.0, calories: 185.0 },
  { id: 273, name: "Turkey Breast Grilled - صدر ديك رومي", category: "Protein", state: "Grilled", carbs: 0, protein: 29.0, fat: 1.0, calories: 135.0 },
  { id: 274, name: "Grilled Seabass - قاروص مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 23.0, fat: 2.0, calories: 112.0 },
  { id: 275, name: "Grilled Red Snapper - هامور أحمر مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 22.0, fat: 1.5, calories: 105.0 },
  { id: 276, name: "Cooked Crab - كابوريا مطبوخة", category: "Protein", state: "Cooked", carbs: 0, protein: 18.0, fat: 1.5, calories: 87.0 },
  { id: 277, name: "Grilled Calf Liver - كبدة عجل مشوية", category: "Protein", state: "Grilled", carbs: 3.9, protein: 29.0, fat: 5.3, calories: 175.0 },
  { id: 278, name: "Grilled Chicken Liver - كبدة دجاج مشوية", category: "Protein", state: "Grilled", carbs: 1.0, protein: 24.5, fat: 4.8, calories: 145.0 },
  { id: 279, name: "Grilled Quail - سمان مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 25.0, fat: 4.5, calories: 140.0 },
  { id: 280, name: "Grilled Pigeon Hamam - حمام مشوي", category: "Protein", state: "Grilled", carbs: 0, protein: 26.0, fat: 7.5, calories: 175.0 },
  { id: 281, name: "Cooked Rabbit - أرانب مطبوخة", category: "Protein", state: "Cooked", carbs: 0, protein: 29.0, fat: 3.5, calories: 147.0 },
  { id: 282, name: "Smoked Turkey Slices - ديك رومي مدخن", category: "Protein", state: "Ready", carbs: 1.5, protein: 17.0, fat: 2.0, calories: 90.0 },
  { id: 283, name: "Grilled Beef Liver - كبدة بقري مشوية", category: "Protein", state: "Grilled", carbs: 4.0, protein: 27.0, fat: 5.0, calories: 170.0 },

  // --- FATS ---
  { id: 301, name: "Olive Oil - زيت زيتون", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100, calories: 884 },
  { id: 302, name: "Butter - زبدة", category: "Fat", state: "Raw", carbs: 0, protein: 1, fat: 81, calories: 717 },
  { id: 303, name: "Tahini - طحينة", category: "Fat", state: "Raw", carbs: 21, protein: 17, fat: 54, calories: 595 },
  { id: 304, name: "Almonds - لوز", category: "Fat", state: "Raw", carbs: 22, protein: 21, fat: 50, calories: 579 },
  { id: 305, name: "Peanuts - سوداني", category: "Fat", state: "Raw", carbs: 16, protein: 26, fat: 49, calories: 567 },
  { id: 306, name: "Avocado - أفوكادو", category: "Fat", state: "Raw", carbs: 9, protein: 2, fat: 15, calories: 160 },
  { id: 307, name: "Walnuts - عين جمل", category: "Fat", state: "Raw", carbs: 14.0, protein: 15.0, fat: 65.0, calories: 654.0 },
  { id: 308, name: "Cashews - كاجو", category: "Fat", state: "Raw", carbs: 30.0, protein: 18.0, fat: 44.0, calories: 553.0 },
  { id: 309, name: "Pistachios - فستق", category: "Fat", state: "Raw", carbs: 27.0, protein: 20.0, fat: 45.0, calories: 562.0 },
  { id: 310, name: "Hazelnuts - بندق", category: "Fat", state: "Raw", carbs: 17.0, protein: 15.0, fat: 61.0, calories: 628.0 },
  { id: 311, name: "Pecans - بيكان", category: "Fat", state: "Raw", carbs: 14.0, protein: 9.0, fat: 72.0, calories: 691.0 },
  { id: 312, name: "Pumpkin Seeds - لب قرع", category: "Fat", state: "Raw", carbs: 10.0, protein: 30.0, fat: 49.0, calories: 559.0 },
  { id: 313, name: "Sunflower Seeds - لب عباد شمس", category: "Fat", state: "Raw", carbs: 20.0, protein: 21.0, fat: 51.0, calories: 584.0 },
  { id: 314, name: "Watermelon Seeds - لب بطيخ", category: "Fat", state: "Raw", carbs: 15.0, protein: 28.0, fat: 47.0, calories: 557.0 },
  { id: 315, name: "Ghee Samna - سمنة بلدي", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100.0, calories: 900.0 },
  { id: 316, name: "Coconut Oil - زيت جوز الهند", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100.0, calories: 892.0 },
  { id: 317, name: "Peanut Butter - زبدة فول سوداني", category: "Fat", state: "Raw", carbs: 20.0, protein: 25.0, fat: 50.0, calories: 588.0 },
  { id: 318, name: "Almond Butter - زبدة لوز", category: "Fat", state: "Raw", carbs: 19.0, protein: 21.0, fat: 55.0, calories: 614.0 },
  { id: 319, name: "Sesame Oil - زيت سمسم", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100.0, calories: 884.0 },
  { id: 320, name: "Corn Oil - زيت ذرة", category: "Fat", state: "Raw", carbs: 0, protein: 0, fat: 100.0, calories: 884.0 },

  // --- VEGETABLES ---
  { id: 601, name: "Green Salad - سلطة خضراء", category: "Vegetable", state: "Ready", carbs: 4, protein: 1, fat: 0.2, calories: 20 },
  { id: 602, name: "Tomato - طماطم", category: "Vegetable", state: "Raw", carbs: 4, protein: 0.9, fat: 0.2, calories: 18 },
  { id: 603, name: "Cucumber - خيار", category: "Vegetable", state: "Raw", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 16 },
  { id: 604, name: "Raw Carrot - جزر نيء", category: "Vegetable", state: "Raw", carbs: 9.6, protein: 0.9, fat: 0.2, calories: 41.0 },
  { id: 605, name: "Broccoli - بروكلي", category: "Vegetable", state: "Raw", carbs: 6.6, protein: 2.8, fat: 0.4, calories: 34.0 },
  { id: 606, name: "Spinach - سبانخ", category: "Vegetable", state: "Raw", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23.0 },
  { id: 607, name: "Eggplant Raw - باذنجان نيء", category: "Vegetable", state: "Raw", carbs: 5.8, protein: 1.0, fat: 0.2, calories: 25.0 },
  { id: 608, name: "Bell Pepper - فلفل ملون", category: "Vegetable", state: "Raw", carbs: 6.0, protein: 1.0, fat: 0.3, calories: 31.0 },
  { id: 609, name: "Onion - بصل", category: "Vegetable", state: "Raw", carbs: 9.3, protein: 1.1, fat: 0.1, calories: 40.0 },
  { id: 610, name: "Molokhia Cooked - ملوخية مطبوخة", category: "Vegetable", state: "Cooked", carbs: 6.0, protein: 3.0, fat: 2.0, calories: 55.0 },
  { id: 611, name: "Cooked Green Beans - فاصوليا خضراء مطبوخة", category: "Vegetable", state: "Cooked", carbs: 9.0, protein: 2.0, fat: 2.5, calories: 65.0 },
  { id: 612, name: "Cooked Peas Carrots - بسلة وجزر مطبوخة", category: "Vegetable", state: "Cooked", carbs: 14.0, protein: 4.0, fat: 2.5, calories: 95.0 },
  { id: 613, name: "Cooked Zucchini - كوسة مطبوخة", category: "Vegetable", state: "Cooked", carbs: 5.0, protein: 1.5, fat: 2.0, calories: 45.0 },
  { id: 614, name: "Cooked Okra - بامية مطبوخة", category: "Vegetable", state: "Cooked", carbs: 8.5, protein: 2.0, fat: 2.5, calories: 65.0 },
  { id: 615, name: "Raw Cabbage - كرنب نيء", category: "Vegetable", state: "Raw", carbs: 5.8, protein: 1.3, fat: 0.1, calories: 25.0 },
  { id: 616, name: "Garlic - ثوم", category: "Vegetable", state: "Raw", carbs: 33.0, protein: 6.4, fat: 0.5, calories: 149.0 },
  { id: 617, name: "Chard Silq - سلق", category: "Vegetable", state: "Raw", carbs: 3.7, protein: 1.8, fat: 0.2, calories: 19.0 },
  { id: 618, name: "Zucchini Raw - كوسة نيئة", category: "Vegetable", state: "Raw", carbs: 3.1, protein: 1.2, fat: 0.3, calories: 17.0 },
  { id: 619, name: "Leek - كراث", category: "Vegetable", state: "Raw", carbs: 14.2, protein: 1.5, fat: 0.3, calories: 61.0 },
  { id: 620, name: "Artichoke - خرشوف", category: "Vegetable", state: "Raw", carbs: 11.0, protein: 3.3, fat: 0.2, calories: 53.0 },
  { id: 621, name: "Purslane Bakleh - بقلة", category: "Vegetable", state: "Raw", carbs: 3.4, protein: 1.7, fat: 0.4, calories: 20.0 },
  { id: 622, name: "Cooked Stuffed Grape Leaves - ورق عنب محشي", category: "Vegetable", state: "Cooked", carbs: 17.0, protein: 3.0, fat: 4.5, calories: 120.0 },
  { id: 623, name: "Cooked Stuffed Zucchini - كوسة محشية", category: "Vegetable", state: "Cooked", carbs: 10.0, protein: 5.0, fat: 5.0, calories: 105.0 },
  { id: 624, name: "Mushroom - فطر", category: "Vegetable", state: "Raw", carbs: 3.3, protein: 3.1, fat: 0.3, calories: 22.0 },

  // --- SAUCES ---
  { id: 701, name: "Tomato Sauce Homemade - صلصة طماطم", category: "Sauce", state: "Cooked", carbs: 4.5, protein: 1.5, fat: 0.2, calories: 25 },
  { id: 702, name: "Tomato Paste - معجون طماطم", category: "Sauce", state: "Ready", carbs: 18, protein: 4.3, fat: 0.5, calories: 82 },
  { id: 703, name: "Light Mayonnaise - مايونيز لايت", category: "Sauce", state: "Ready", carbs: 6.0, protein: 1.0, fat: 28.0, calories: 280.0 },
  { id: 704, name: "Full Mayonnaise - مايونيز عادي", category: "Sauce", state: "Ready", carbs: 0.6, protein: 0.7, fat: 75.0, calories: 680.0 },
  { id: 705, name: "Zero Sugar Sauce - صوص زيرو", category: "Sauce", state: "Ready", carbs: 2.0, protein: 0.1, fat: 0.1, calories: 15.0 },
  { id: 706, name: "Light Ketchup - كاتشب لايت", category: "Sauce", state: "Ready", carbs: 15.0, protein: 1.0, fat: 0.1, calories: 65.0 },
  { id: 707, name: "Hummus - حمص بطحينة", category: "Sauce", state: "Ready", carbs: 14.0, protein: 7.9, fat: 6.0, calories: 166.0 },
  { id: 708, name: "Baba Ganoush - بابا غنوج", category: "Sauce", state: "Ready", carbs: 8.6, protein: 2.0, fat: 1.7, calories: 54.0 },
  { id: 709, name: "Harissa Sauce - صلصة هريسة", category: "Sauce", state: "Ready", carbs: 8.0, protein: 2.5, fat: 3.0, calories: 67.0 },
  { id: 710, name: "Yogurt Sauce - صلصة زبادي", category: "Sauce", state: "Ready", carbs: 6.0, protein: 5.0, fat: 2.0, calories: 62.0 },
  { id: 711, name: "Ful Mudammas with Oil - فول بالزيت", category: "Sauce", state: "Cooked", carbs: 16.0, protein: 7.0, fat: 5.0, calories: 133.0 },
  { id: 712, name: "Shatta Chili Paste - شطة", category: "Sauce", state: "Ready", carbs: 8.0, protein: 1.5, fat: 1.0, calories: 48.0 },
  { id: 713, name: "Dukkah - دقة", category: "Sauce", state: "Ready", carbs: 15.0, protein: 10.0, fat: 20.0, calories: 280.0 },

  // --- LEGUMES ---
  { id: 501, name: "Dry Fava Beans - فول نيء", category: "Legumes", state: "Raw", carbs: 58, protein: 26, fat: 1.5, calories: 340 },
  { id: 502, name: "Cooked Fava Beans - فول مدمس", category: "Legumes", state: "Cooked", carbs: 18, protein: 8, fat: 0.5, calories: 110 },
  { id: 503, name: "Dry Lentils - عدس نيء", category: "Legumes", state: "Raw", carbs: 60, protein: 24, fat: 1, calories: 350 },
  { id: 504, name: "Cooked Lentils - عدس مطبوخ", category: "Legumes", state: "Cooked", carbs: 20, protein: 9, fat: 0.4, calories: 116 },
  { id: 505, name: "Dry Chickpeas - حمص نيء", category: "Legumes", state: "Raw", carbs: 61, protein: 19, fat: 6, calories: 364 },
  { id: 506, name: "Cooked Chickpeas - حمص مسلوق", category: "Legumes", state: "Cooked", carbs: 27, protein: 8.9, fat: 2.6, calories: 164 },
  { id: 507, name: "Dry White Beans - فاصوليا بيضاء نيئة", category: "Legumes", state: "Raw", carbs: 60, protein: 22, fat: 1.2, calories: 337 },
  { id: 508, name: "Cooked White Beans - فاصوليا بيضاء", category: "Legumes", state: "Cooked", carbs: 25, protein: 9.7, fat: 0.5, calories: 139 },
  { id: 509, name: "Dry Black-eyed Peas - لوبيا نيئة", category: "Legumes", state: "Raw", carbs: 60, protein: 23, fat: 1.3, calories: 336 },
  { id: 510, name: "Cooked Black-eyed Peas - لوبيا", category: "Legumes", state: "Cooked", carbs: 21, protein: 8, fat: 0.5, calories: 116 },
  { id: 511, name: "Lupini Beans Cooked - ترمس", category: "Legumes", state: "Cooked", carbs: 10, protein: 16, fat: 4.8, calories: 119 },
  { id: 512, name: "Cooked Green Peas - بسلة مسلوقة", category: "Legumes", state: "Cooked", carbs: 14.5, protein: 5.4, fat: 0.4, calories: 81 },
  { id: 513, name: "Fresh Green Fava - فول أخضر", category: "Legumes", state: "Raw", carbs: 18, protein: 8, fat: 0.7, calories: 88 },
  { id: 514, name: "Red Kidney Beans Cooked - فاصوليا حمراء", category: "Legumes", state: "Cooked", carbs: 22.8, protein: 8.7, fat: 0.5, calories: 127 },
  { id: 515, name: "Baked Falafel - طعمية بالفرن", category: "Legumes", state: "Cooked", carbs: 22.0, protein: 13.0, fat: 4.5, calories: 180.0 },
  { id: 516, name: "Fried Falafel - طعمية مقلية", category: "Legumes", state: "Cooked", carbs: 22.0, protein: 10.0, fat: 10.0, calories: 220.0 },

  // --- DAIRY ---
  { id: 401, name: "Full Fat Mozzarella - موتزاريلا", category: "Dairy", state: "Ready", carbs: 2.2, protein: 22, fat: 22, calories: 280 },
  { id: 402, name: "Light Mozzarella - موتزاريلا لايت", category: "Dairy", state: "Ready", carbs: 2.5, protein: 24, fat: 8, calories: 160 },
  { id: 403, name: "Old Roumy Cheese - رومي قديم", category: "Dairy", state: "Ready", carbs: 1.5, protein: 25, fat: 28, calories: 350 },
  { id: 404, name: "Medium Roumy Cheese - رومي وسط", category: "Dairy", state: "Ready", carbs: 2, protein: 23, fat: 25, calories: 330 },
  { id: 405, name: "Cottage Cheese Qareesh - جبنة قريش", category: "Dairy", state: "Ready", carbs: 3.4, protein: 11, fat: 4.3, calories: 98 },
  { id: 406, name: "Feta Low Salt - فيتا خفيفة ملح", category: "Dairy", state: "Ready", carbs: 4, protein: 14, fat: 21, calories: 260 },
  { id: 407, name: "Feta Light - فيتا لايت", category: "Dairy", state: "Ready", carbs: 5, protein: 15, fat: 10, calories: 170 },
  { id: 408, name: "Creamy Cheese Jar - جبنة كريمي", category: "Dairy", state: "Ready", carbs: 4, protein: 7, fat: 30, calories: 315 },
  { id: 409, name: "Light Creamy Cheese - كريمي لايت", category: "Dairy", state: "Ready", carbs: 6, protein: 9, fat: 15, calories: 195 },
  { id: 410, name: "Halloumi - حلوم", category: "Dairy", state: "Ready", carbs: 2, protein: 21, fat: 26, calories: 320 },
  { id: 411, name: "Labneh - لبنة", category: "Dairy", state: "Ready", carbs: 4, protein: 6, fat: 12, calories: 150 },
  { id: 412, name: "Full Cream Milk 200ml - لبن كامل", category: "Dairy", state: "Liquid", carbs: 9.6, protein: 6.4, fat: 6.5, calories: 120 },
  { id: 413, name: "Half-Skimmed Milk 200ml - لبن نصف دسم", category: "Dairy", state: "Liquid", carbs: 9.8, protein: 6.6, fat: 3.0, calories: 95 },
  { id: 414, name: "Skimmed Milk 200ml - لبن خالي دسم", category: "Dairy", state: "Liquid", carbs: 10, protein: 6.8, fat: 0.4, calories: 70 },
  { id: 415, name: "Greek Yogurt 0% Fat - زبادي يوناني خالي دسم", category: "Dairy", state: "Ready", carbs: 3.6, protein: 10.0, fat: 0.4, calories: 59.0 },
  { id: 416, name: "Greek Yogurt Full - زبادي يوناني كامل", category: "Dairy", state: "Ready", carbs: 3.9, protein: 9.0, fat: 5.0, calories: 97.0 },
  { id: 417, name: "Plain Yogurt - زبادي عادي", category: "Dairy", state: "Ready", carbs: 4.7, protein: 3.5, fat: 3.3, calories: 61.0 },
  { id: 418, name: "Ayran Laban Drink - لبن شراب", category: "Dairy", state: "Liquid", carbs: 4.8, protein: 3.5, fat: 1.5, calories: 47.0 },
  { id: 419, name: "Keshk - كشك", category: "Dairy", state: "Ready", carbs: 52.0, protein: 15.0, fat: 5.0, calories: 313.0 },
  { id: 420, name: "Eshta Clotted Cream - قشطة بلدي", category: "Dairy", state: "Ready", carbs: 3.0, protein: 2.5, fat: 23.0, calories: 230.0 },

  // --- FRUITS ---
  { id: 801, name: "Apple - تفاح", category: "Fruit", state: "Raw", carbs: 14.0, protein: 0.3, fat: 0.2, calories: 52.0 },
  { id: 802, name: "Banana Imported - موز مستورد", category: "Fruit", state: "Raw", carbs: 23, protein: 1.1, fat: 0.3, calories: 89 },
  { id: 803, name: "Banana Egyptian - موز بلدي", category: "Fruit", state: "Raw", carbs: 21, protein: 1.2, fat: 0.2, calories: 85 },
  { id: 804, name: "Watermelon - بطيخ أحمر", category: "Fruit", state: "Raw", carbs: 7.6, protein: 0.6, fat: 0.2, calories: 30.0 },
  { id: 805, name: "Grapes - عنب", category: "Fruit", state: "Raw", carbs: 18.0, protein: 0.7, fat: 0.2, calories: 67.0 },
  { id: 806, name: "Mango - مانجو", category: "Fruit", state: "Raw", carbs: 15.0, protein: 0.8, fat: 0.4, calories: 60.0 },
  { id: 807, name: "Strawberry - فراولة", category: "Fruit", state: "Raw", carbs: 7.7, protein: 0.7, fat: 0.3, calories: 32.0 },
  { id: 808, name: "Pomegranate - رمان", category: "Fruit", state: "Raw", carbs: 18.7, protein: 1.7, fat: 1.2, calories: 83.0 },
  { id: 809, name: "Guava - جوافة", category: "Fruit", state: "Raw", carbs: 14.3, protein: 2.6, fat: 1.0, calories: 68.0 },
  { id: 810, name: "Fig Fresh - تين طازج", category: "Fruit", state: "Raw", carbs: 19.2, protein: 0.8, fat: 0.3, calories: 74.0 },
  { id: 811, name: "Dried Fig - تين مجفف", category: "Fruit", state: "Raw", carbs: 63.9, protein: 3.3, fat: 0.9, calories: 249.0 },
  { id: 812, name: "Navel Orange - برتقال أبو سرة", category: "Fruit", state: "Raw", carbs: 12.5, protein: 0.9, fat: 0.1, calories: 52 },
  { id: 813, name: "Mandarin Yossefi - يوسفي", category: "Fruit", state: "Raw", carbs: 13.3, protein: 0.8, fat: 0.3, calories: 53 },
  { id: 814, name: "Grapefruit - جريب فروت", category: "Fruit", state: "Raw", carbs: 11, protein: 0.8, fat: 0.1, calories: 42 },
  { id: 815, name: "Peach - خوخ", category: "Fruit", state: "Raw", carbs: 9.5, protein: 0.9, fat: 0.3, calories: 39 },
  { id: 816, name: "Apricot - مشمش", category: "Fruit", state: "Raw", carbs: 11, protein: 1.4, fat: 0.4, calories: 48 },
  { id: 817, name: "Plum - برقوق", category: "Fruit", state: "Raw", carbs: 11.4, protein: 0.7, fat: 0.3, calories: 46 },
  { id: 818, name: "Pear - كمثرى", category: "Fruit", state: "Raw", carbs: 15, protein: 0.4, fat: 0.1, calories: 57 },
  { id: 819, name: "Cantaloupe Shamam - شمام", category: "Fruit", state: "Raw", carbs: 8, protein: 0.8, fat: 0.2, calories: 34 },
  { id: 820, name: "Kiwi - كيوي", category: "Fruit", state: "Raw", carbs: 15, protein: 1.1, fat: 0.5, calories: 61 },
  { id: 821, name: "Pineapple - أناناس", category: "Fruit", state: "Raw", carbs: 13, protein: 0.5, fat: 0.1, calories: 50 },
  { id: 822, name: "Papaya - بابايا", category: "Fruit", state: "Raw", carbs: 11, protein: 0.5, fat: 0.3, calories: 43 },
  { id: 823, name: "Sukkari Dates - تمر سكري", category: "Fruit", state: "Raw", carbs: 75, protein: 2.5, fat: 0.5, calories: 290 },
  { id: 824, name: "Ajwa Dates - تمر عجوة", category: "Fruit", state: "Raw", carbs: 68, protein: 2.2, fat: 0.4, calories: 275 },
  { id: 825, name: "Medjool Dates - تمر مجدول", category: "Fruit", state: "Raw", carbs: 75.0, protein: 1.8, fat: 0.1, calories: 277.0 },
  { id: 826, name: "Prickly Pear - تين شوكي", category: "Fruit", state: "Raw", carbs: 9.6, protein: 0.7, fat: 0.5, calories: 41 },
  { id: 827, name: "Custard Apple Qeshta - قشطة فاكهة", category: "Fruit", state: "Raw", carbs: 23.6, protein: 2.1, fat: 0.3, calories: 94 },
  { id: 828, name: "Pomelo - بوملي", category: "Fruit", state: "Raw", carbs: 9.6, protein: 0.8, fat: 0, calories: 38 },
  { id: 829, name: "Cherry - كرز", category: "Fruit", state: "Raw", carbs: 16, protein: 1.1, fat: 0.2, calories: 50 },
  { id: 830, name: "Mulberry - توت بلدي", category: "Fruit", state: "Raw", carbs: 9.8, protein: 1.4, fat: 0.4, calories: 43 },
  { id: 831, name: "Lychee - ليتشي", category: "Fruit", state: "Raw", carbs: 16.5, protein: 0.8, fat: 0.4, calories: 66 },
  { id: 832, name: "Fresh Orange Juice - عصير برتقال فريش", category: "Fruit", state: "Liquid", carbs: 10, protein: 0.7, fat: 0.2, calories: 45 },
  { id: 833, name: "Avocado - أفوكادو", category: "Fruit", state: "Raw", carbs: 8.5, protein: 2, fat: 14.7, calories: 160 },
  { id: 834, name: "Coconut Meat - جوز هند", category: "Fruit", state: "Raw", carbs: 15, protein: 3.3, fat: 33, calories: 354 },

  // --- SUPPLEMENTS ---
  { id: 901, name: "Whey Protein 1 Scoop - واي بروتين", category: "Supplement", state: "Powder", carbs: 3.0, protein: 24.0, fat: 1.5, calories: 120.0 },
  { id: 902, name: "Isolate Protein 1 Scoop - أيزوليت", category: "Supplement", state: "Powder", carbs: 1.0, protein: 25.0, fat: 0.5, calories: 110.0 },
  { id: 903, name: "Casein Protein 1 Scoop - كازين", category: "Supplement", state: "Powder", carbs: 3.0, protein: 24.0, fat: 1.0, calories: 120.0 },
  { id: 904, name: "Creatine 5g - كرياتين", category: "Supplement", state: "Powder", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 905, name: "BCAA 1 Scoop - بي سي أيه", category: "Supplement", state: "Powder", carbs: 1.0, protein: 5.0, fat: 0, calories: 25.0 },
  { id: 906, name: "Mass Gainer 100g - ماس جينر", category: "Supplement", state: "Powder", carbs: 75.0, protein: 15.0, fat: 2.0, calories: 370.0 },
  { id: 907, name: "Pre-Workout 1 Scoop - بري ورك", category: "Supplement", state: "Powder", carbs: 2.0, protein: 0, fat: 0, calories: 10.0 },
  { id: 908, name: "Omega-3 1 Capsule - أوميجا 3", category: "Supplement", state: "Ready", carbs: 0, protein: 0, fat: 0.9, calories: 9.0 },
];
// =====================================================================
// TYPES
// =====================================================================
interface FoodItem {
  id: number; name: string; category: string; state: string;
  carbs: number; protein: number; fat: number; calories: number;
  grams: number; instId: string;
}
interface Meal { id: string; name: string; notes: string; items: FoodItem[]; }
interface TargetMacros { calories: number; protein: number; carbs: number; fat: number; }
interface Template { id: number; name: string; meals: Meal[]; targetMacros: TargetMacros; createdAt: string; }
interface ClientRecord {
  id: number; name: string; goal: string; phone: string; coach: string;
  date: string; meals: Meal[]; targetMacros: TargetMacros; notes: string; savedAt: string;
}
interface CustomFood {
  id: number; name: string; category: string; state: string;
  carbs: number; protein: number; fat: number; calories: number;
}

// =====================================================================
// MAIN COMPONENT
// =====================================================================
export default function NutritionPro() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [printLang, setPrintLang] = useState<'ar' | 'en'>('ar');
  const [activeTab, setActiveTab] = useState<'planner' | 'calculator' | 'clients'>('planner');
  const [systemNotes, setSystemNotes] = useState("");
  const [meals, setMeals] = useState<Meal[]>([
    { id: 'meal-1', name: "الوجبة الأولى", notes: "", items: [] },
    { id: 'meal-2', name: "الوجبة الثانية", notes: "", items: [] }
  ]);
  const [clientData, setClientData] = useState({
    name: '', goal: '', coach: 'C/ Mohamed Saed', phone: '01022816320',
    date: new Date().toISOString().split('T')[0]
  });
  const [targetMacros, setTargetMacros] = useState<TargetMacros>({ calories: 2000, protein: 150, carbs: 200, fat: 60 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFoods, setSelectedFoods] = useState<Set<number>>(new Set());
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateNameInput, setTemplateNameInput] = useState("");
  const [templateView, setTemplateView] = useState<'list' | 'save'>('list');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterTarget, setWaterTarget] = useState(8);
  const [clientHistory, setClientHistory] = useState<ClientRecord[]>([]);
  const [isClientHistoryOpen, setIsClientHistoryOpen] = useState(false);
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([]);
  const [isCustomFoodOpen, setIsCustomFoodOpen] = useState(false);
  const [newFood, setNewFood] = useState({ name: '', category: 'Protein', carbs: 0, protein: 0, fat: 0, calories: 0 });
  // BMR state
  const [bmr, setBmr] = useState({ age: 25, weight: 75, height: 175, gender: 'male' as 'male' | 'female', activity: 1.55 });
  const [bmrResult, setBmrResult] = useState<{ bmr: number; tdee: number } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    try {
      const s = (k: string) => localStorage.getItem(k);
      if (s('pro_nutrition_templates')) setTemplates(JSON.parse(s('pro_nutrition_templates')!));
      if (s('pro_theme')) setTheme(s('pro_theme') as 'dark' | 'light');
      if (s('pro_system_notes')) setSystemNotes(s('pro_system_notes')!);
      if (s('pro_water')) setWaterGlasses(Number(s('pro_water')));
      if (s('pro_water_target')) setWaterTarget(Number(s('pro_water_target')));
      if (s('pro_client_history')) setClientHistory(JSON.parse(s('pro_client_history')!));
      if (s('pro_custom_foods')) setCustomFoods(JSON.parse(s('pro_custom_foods')!));
      if (s('pro_print_lang')) setPrintLang(s('pro_print_lang') as 'ar' | 'en');
    } catch {}
  }, []);

  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('pro_theme', theme); }, [theme]);
  useEffect(() => { localStorage.setItem('pro_system_notes', systemNotes); }, [systemNotes]);
  useEffect(() => { localStorage.setItem('pro_water', String(waterGlasses)); }, [waterGlasses]);
  useEffect(() => { localStorage.setItem('pro_water_target', String(waterTarget)); }, [waterTarget]);
  useEffect(() => { localStorage.setItem('pro_print_lang', printLang); }, [printLang]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "admin123") { setIsAuthenticated(true); setLoginError(false); }
    else setLoginError(true);
  };

  const normalizeArabic = (s: string) =>
    s.replace(/[أإآا]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase();

  const allFoods = useMemo(() => [
    ...FOOD_DATABASE,
    ...customFoods.map(f => ({ ...f, state: 'Custom', instId: '' }))
  ], [customFoods]);

  const categories = ["All", "Carb", "Protein", "Fat", "Fruit", "Vegetable", "Legumes", "Dairy", "Sauce", "Supplement"];

  const filteredFoods = useMemo(() => {
    let list = allFoods as any[];
    if (selectedCategory !== "All") list = list.filter(f => f.category.includes(selectedCategory));
    if (searchTerm) {
      const q = normalizeArabic(searchTerm);
      list = list.filter(f => normalizeArabic(f.name).includes(q));
    }
    return list;
  }, [searchTerm, selectedCategory, allFoods]);

  const calculateTotals = (mealsList = meals) => mealsList.reduce((acc, meal) => {
    meal.items.forEach(it => {
      const r = it.grams / 100;
      acc.calories += it.calories * r; acc.protein += it.protein * r;
      acc.carbs += it.carbs * r; acc.fat += it.fat * r;
    });
    return acc;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 } as TargetMacros);

  const totals = calculateTotals();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setMeals(items => {
        const oi = items.findIndex(i => i.id === active.id);
        const ni = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oi, ni);
      });
    }
  };

  const addMeal = () => setMeals([...meals, { id: `meal-${Date.now()}`, name: `وجبة ${meals.length + 1}`, notes: "", items: [] }]);
  const duplicateMeal = (meal: Meal) => setMeals([...meals, { ...meal, id: `meal-dup-${Date.now()}`, name: `${meal.name} (نسخة)`, items: meal.items.map(it => ({ ...it, instId: `${it.id}-${Math.random()}` })) }]);
  const removeMeal = (id: string) => setMeals(meals.filter(m => m.id !== id));
  const toggleFoodSelection = (id: number) => { const n = new Set(selectedFoods); n.has(id) ? n.delete(id) : n.add(id); setSelectedFoods(n); };

  const addSelectedToMeal = () => {
    if (!activeMealId) return;
    const newItems = allFoods.filter(f => selectedFoods.has(f.id)).map(f => ({ ...f, grams: 100, instId: `${f.id}-${Math.random()}` }));
    setMeals(meals.map(m => m.id === activeMealId ? { ...m, items: [...m.items, ...newItems] } : m));
    setIsModalOpen(false); setSelectedFoods(new Set()); setSearchTerm("");
  };

  const removeItemFromMeal = (mealId: string, instId: string) =>
    setMeals(meals.map(m => m.id === mealId ? { ...m, items: m.items.filter(it => it.instId !== instId) } : m));

  const moveItem = (mealId: string, itemInstId: string, direction: 'up' | 'down') =>
    setMeals(meals.map(m => {
      if (m.id !== mealId) return m;
      const idx = m.items.findIndex(it => it.instId === itemInstId);
      const ni = [...m.items];
      if (direction === 'up' && idx > 0) [ni[idx], ni[idx - 1]] = [ni[idx - 1], ni[idx]];
      else if (direction === 'down' && idx < ni.length - 1) [ni[idx], ni[idx + 1]] = [ni[idx + 1], ni[idx]];
      return { ...m, items: ni };
    }));

  // Templates
  const saveTemplate = () => {
    if (!templateNameInput.trim()) return;
    const t: Template = { id: Date.now(), name: templateNameInput.trim(), meals, targetMacros, createdAt: new Date().toLocaleDateString('ar-EG') };
    const u = [...templates, t];
    setTemplates(u); localStorage.setItem('pro_nutrition_templates', JSON.stringify(u));
    setTemplateNameInput(""); setTemplateView('list');
  };
  const loadTemplate = (t: Template) => { setMeals(t.meals); setTargetMacros(t.targetMacros); setIsTemplateModalOpen(false); };
  const deleteTemplate = (id: number) => { const n = templates.filter(x => x.id !== id); setTemplates(n); localStorage.setItem('pro_nutrition_templates', JSON.stringify(n)); setDeleteConfirm(null); };

  // Client History
  const saveClientToHistory = () => {
    if (!clientData.name.trim()) return;
    const rec: ClientRecord = { id: Date.now(), ...clientData, meals, targetMacros, notes: systemNotes, savedAt: new Date().toLocaleDateString('ar-EG') };
    const u = [rec, ...clientHistory];
    setClientHistory(u); localStorage.setItem('pro_client_history', JSON.stringify(u));
  };
  const loadClient = (rec: ClientRecord) => { setClientData({ name: rec.name, goal: rec.goal, coach: rec.coach, phone: rec.phone, date: rec.date }); setMeals(rec.meals); setTargetMacros(rec.targetMacros); setSystemNotes(rec.notes); setIsClientHistoryOpen(false); setActiveTab('planner'); };
  const deleteClient = (id: number) => { const n = clientHistory.filter(c => c.id !== id); setClientHistory(n); localStorage.setItem('pro_client_history', JSON.stringify(n)); };

  // Custom foods
  const addCustomFood = () => {
    if (!newFood.name.trim()) return;
    const f: CustomFood = { id: Date.now(), ...newFood, state: 'Custom' };
    const u = [...customFoods, f];
    setCustomFoods(u); localStorage.setItem('pro_custom_foods', JSON.stringify(u));
    setNewFood({ name: '', category: 'Protein', carbs: 0, protein: 0, fat: 0, calories: 0 });
  };
  const deleteCustomFood = (id: number) => { const n = customFoods.filter(f => f.id !== id); setCustomFoods(n); localStorage.setItem('pro_custom_foods', JSON.stringify(n)); };

  // BMR/TDEE
  const calculateBMR = () => {
    const { age, weight, height, gender, activity } = bmr;
    const b = gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
    setBmrResult({ bmr: Math.round(b), tdee: Math.round(b * activity) });
  };
  const applyTDEE = () => {
    if (!bmrResult) return;
    const tdee = bmrResult.tdee;
    setTargetMacros({ calories: tdee, protein: Math.round(bmr.weight * 2.2), carbs: Math.round((tdee * 0.4) / 4), fat: Math.round((tdee * 0.25) / 9) });
    setActiveTab('planner');
  };

  // Copy Plan to WhatsApp
  const copyToWhatsApp = () => {
    const summary = meals.map(meal => {
      const itemsText = meal.items.map(it =>
        `🔸 ${it.name.split(' - ')[0]}: ${it.grams}${it.state === "Liquid" ? "ml" : "g"}`
      ).join('\n');
      return `*🍽️ ${meal.name}*\n${itemsText}${meal.notes ? `\n📝 _ملاحظة: ${meal.notes}_` : ''}`;
    }).join('\n\n');

    const totalsText = `*📊 إجمالي الماكروز لليوم:*\n🔥 السعرات: ${Math.round(totals.calories)} kcal\n💪 البروتين: ${Math.round(totals.protein)}g\n🍞 الكارب: ${Math.round(totals.carbs)}g\n🥑 الدهون: ${Math.round(totals.fat)}g\n💧 هدف الماء: ${waterTarget} أكواب`;

    const clientInfo = `🌟 *نظامك الغذائي المخصص - PRO Nutrition* 🌟\n\n👤 العميل: ${clientData.name || 'غير محدد'}\n🎯 الهدف: ${clientData.goal || 'غير محدد'}\n📅 التاريخ: ${clientData.date}\n\n`;

    const systemNotesText = systemNotes ? `\n\n*💡 تعليمات هامة:*\n${systemNotes}` : '';

    const footerText = `\n\n💪 مع تحيات: ${clientData.coach}\n📞 للتواصل: ${clientData.phone}`;

    const fullText = `${clientInfo}${summary}\n\n${totalsText}${systemNotesText}${footerText}`;

    navigator.clipboard.writeText(fullText).then(() => {
      alert("✅ تم نسخ النظام بالكامل بنجاح! يمكنك الآن لصقه في الواتساب.");
    }).catch(err => {
      alert("❌ حدث خطأ أثناء النسخ.");
    });
  };

  // Pie chart data
  const pieData = useMemo(() => {
    const total = totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;
    if (total === 0) return null;
    return {
      protein: Math.round((totals.protein * 4 / total) * 100),
      carbs: Math.round((totals.carbs * 4 / total) * 100),
      fat: Math.round((totals.fat * 9 / total) * 100),
    };
  }, [totals]);

  const d = (k: string) => theme === 'dark' ? k : '';
  const card = cn("rounded-[2rem] border transition-all", theme === 'dark' ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-gray-200 shadow-sm");

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans" dir="rtl">
        <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 mb-4"><Lock className="text-white" size={32}/></div>
            <h1 className="text-2xl font-black text-white">تسجيل الدخول</h1>
            <p className="text-neutral-500 text-sm mt-2">يرجى إدخال كلمة المرور للوصول للنظام</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="كلمة المرور" className={cn("w-full p-4 bg-black border rounded-2xl outline-none focus:border-blue-600 transition-all text-white text-center font-bold", loginError ? "border-red-600" : "border-neutral-800")} value={password} onChange={e => setPassword(e.target.value)} autoFocus/>
            {loginError && <p className="text-red-500 text-xs text-center font-bold">كلمة المرور غير صحيحة!</p>}
            <button className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all">دخول النظام</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen transition-colors duration-300 font-sans pb-20", theme === 'dark' ? "bg-[#080808] text-white" : "bg-gray-50 text-gray-900")} dir="rtl">

      {/* ── PRINT HEADER ── */}
      <div className="hidden print:block bg-white text-black p-8 border-b-8 border-blue-600" dir={printLang === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-black text-blue-700">{printLang === 'ar' ? 'نظام غذائي متطور' : 'Personalized Nutrition Plan'}</h1>
            <p className="text-base text-gray-500 font-bold mt-1">{printLang === 'ar' ? 'Nutrition Engineering v3' : 'برو نيوتريشن v3'}</p>
          </div>
          <div className={printLang === 'ar' ? 'text-left' : 'text-right'}>
            <h2 className="text-xl font-black uppercase">{clientData.coach}</h2>
            <p className="text-blue-600 font-mono">{clientData.phone}</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 bg-gray-50 p-5 rounded-3xl border-2 border-gray-100">
          {[
            [printLang === 'ar' ? 'العميل' : 'Client', clientData.name || '---'],
            [printLang === 'ar' ? 'الهدف' : 'Goal', clientData.goal || '---'],
            [printLang === 'ar' ? 'التاريخ' : 'Date', clientData.date],
            [printLang === 'ar' ? 'الإجمالي' : 'Total', `${Math.round(totals.calories)} kcal`]
          ].map(([l, v]) => (
            <div key={l} className="border-r-2 border-gray-100 pr-4 last:border-none">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{l}</span>
              <p className="text-lg font-black text-gray-800 mt-1">{v}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 print:p-0">
        {/* ── HEADER ── */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Layout className="text-white" size={24}/>
            </div>
            <div>
              <h1 className="text-2xl font-black">برو نيوتريشن <span className="text-blue-500 text-sm font-medium">PRO</span></h1>
              <p className="text-[10px] opacity-50 uppercase tracking-widest font-bold">Nutrition Engineering v3.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className={cn("p-2.5 rounded-xl transition-all border", theme === 'dark' ? "bg-neutral-900 border-neutral-800 hover:bg-neutral-800" : "bg-white border-gray-200 hover:bg-gray-100")}>
              {theme === 'dark' ? <Sun size={18} className="text-yellow-400"/> : <Moon size={18} className="text-blue-400"/>}
            </button>
            <button onClick={() => { setPrintLang(printLang === 'ar' ? 'en' : 'ar'); }} className={cn("flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border", theme === 'dark' ? "bg-neutral-900 border-neutral-800 hover:bg-neutral-800" : "bg-white border-gray-200 hover:bg-gray-100")}>
              <Globe size={15}/> {printLang === 'ar' ? 'طباعة EN' : 'طباعة AR'}
            </button>
            <button onClick={() => { setIsTemplateModalOpen(true); setTemplateView('list'); }} className={cn("flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all border", theme === 'dark' ? "bg-neutral-900 border-neutral-800 hover:bg-neutral-800" : "bg-white border-gray-200 hover:bg-gray-100")}>
              <BookOpen size={15}/> القوالب {templates.length > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{templates.length}</span>}
            </button>
            <button onClick={copyToWhatsApp} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/20">
              <Copy size={15}/> نسخ النظام بالكامل
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all shadow-lg shadow-blue-600/20">
              <Printer size={15}/> استخراج PDF
            </button>
          </div>
        </header>

        {/* ── TABS ── */}
        <div className={cn("flex gap-1 p-1.5 rounded-2xl mb-6 print:hidden w-fit", theme === 'dark' ? "bg-neutral-900 border border-neutral-800" : "bg-gray-100")}>
          {([['planner', <Layout size={15}/>, 'المخطط'], ['calculator', <Calculator size={15}/>, 'حاسبة BMR'], ['clients', <Users size={15}/>, `العملاء (${clientHistory.length})`]] as [string, any, string][]).map(([t, icon, label]) => (
            <button key={t} onClick={() => setActiveTab(t as any)} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all", activeTab === t ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" : theme === 'dark' ? "text-neutral-400 hover:text-white" : "text-gray-500 hover:text-gray-800")}>
              {icon} {label}
            </button>
          ))}
        </div>

        {/* ══════════════════════════════════ TAB: BMR CALCULATOR ══════════════════════════════════ */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={cn("p-6 rounded-[2rem] border", card)}>
              <h3 className="flex items-center gap-2 mb-6 font-bold text-blue-500"><Calculator size={18}/> حاسبة BMR / TDEE — Mifflin-St Jeor</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-1">الجنس</label>
                    <div className="flex gap-2">
                      {(['male', 'female'] as const).map(g => (
                        <button key={g} onClick={() => setBmr({ ...bmr, gender: g })} className={cn("flex-1 py-2.5 rounded-xl text-xs font-black border transition-all", bmr.gender === g ? "bg-blue-600 text-white border-blue-600" : theme === 'dark' ? "bg-neutral-800 border-neutral-700 text-neutral-400" : "bg-gray-100 border-gray-200 text-gray-500")}>
                          {g === 'male' ? '🧔 ذكر' : '👩 أنثى'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <CalcInput label="العمر (سنة)" value={bmr.age} onChange={v => setBmr({ ...bmr, age: v })} theme={theme}/>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <CalcInput label="الوزن (كجم)" value={bmr.weight} onChange={v => setBmr({ ...bmr, weight: v })} theme={theme}/>
                  <CalcInput label="الطول (سم)" value={bmr.height} onChange={v => setBmr({ ...bmr, height: v })} theme={theme}/>
                </div>
                <div>
                  <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-2">مستوى النشاط</label>
                  <div className="space-y-2">
                    {[
                      [1.2, 'مستقر — Sedentary (لا رياضة)'],
                      [1.375, 'خفيف — Light (1-3 أيام/أسبوع)'],
                      [1.55, 'معتدل — Moderate (3-5 أيام)'],
                      [1.725, 'نشيط — Active (6-7 أيام)'],
                      [1.9, 'مكثف — Very Active (يومياً مرتين)'],
                    ].map(([val, label]) => (
                      <button key={val} onClick={() => setBmr({ ...bmr, activity: val as number })} className={cn("w-full text-right px-4 py-2.5 rounded-xl text-xs font-bold border transition-all", bmr.activity === val ? "bg-blue-600/10 border-blue-500 text-blue-400" : theme === 'dark' ? "bg-neutral-800/40 border-neutral-700 text-neutral-400 hover:border-neutral-500" : "bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-400")}>
                        {label as string}
                      </button>
                    ))}
                  </div>
                </div>
                <button onClick={calculateBMR} className="w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-2xl font-black transition-all shadow-lg shadow-blue-600/20">
                  احسب الآن
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {bmrResult ? (
                <>
                  <div className={cn("p-6 rounded-[2rem] border", card)}>
                    <h4 className="font-black text-emerald-500 mb-5 flex items-center gap-2"><Zap size={18}/> النتائج</h4>
                    <div className="space-y-4">
                      <div className={cn("p-5 rounded-2xl border text-center", theme === 'dark' ? "bg-blue-600/10 border-blue-500/30" : "bg-blue-50 border-blue-200")}>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">معدل الأيض الأساسي BMR</p>
                        <p className="text-4xl font-black text-blue-500">{bmrResult.bmr}</p>
                        <p className="text-xs opacity-50 font-bold">سعرة حرارية / يوم</p>
                      </div>
                      <div className={cn("p-5 rounded-2xl border text-center", theme === 'dark' ? "bg-orange-600/10 border-orange-500/30" : "bg-orange-50 border-orange-200")}>
                        <p className="text-[10px] font-black opacity-60 uppercase tracking-widest mb-1">إجمالي الطاقة اليومية TDEE</p>
                        <p className="text-4xl font-black text-orange-500">{bmrResult.tdee}</p>
                        <p className="text-xs opacity-50 font-bold">سعرة حرارية / يوم</p>
                      </div>
                      <div className={cn("grid grid-cols-3 gap-3 p-4 rounded-2xl border", theme === 'dark' ? "bg-neutral-800/40 border-neutral-700" : "bg-gray-50 border-gray-200")}>
                        {[
                          ['تنشيف', Math.round(bmrResult.tdee * 0.8), 'text-red-400'],
                          ['ثبات', bmrResult.tdee, 'text-blue-400'],
                          ['تضخيم', Math.round(bmrResult.tdee * 1.15), 'text-emerald-400'],
                        ].map(([label, val, color]) => (
                          <div key={label as string} className="text-center">
                            <p className="text-[10px] font-black opacity-50 mb-1">{label as string}</p>
                            <p className={cn("text-lg font-black", color as string)}>{val as number}</p>
                            <p className="text-[9px] opacity-40 font-bold">kcal</p>
                          </div>
                        ))}
                      </div>
                      <button onClick={applyTDEE} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2">
                        <Check size={18}/> تطبيق على المخطط
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className={cn("p-8 rounded-[2rem] border flex flex-col items-center justify-center text-center h-80", card)}>
                  <Calculator size={48} className="opacity-20 mb-4"/>
                  <p className="font-bold opacity-40">أدخل البيانات واضغط احسب</p>
                  <p className="text-xs opacity-30 mt-1">سيتم حساب BMR و TDEE تلقائياً</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════ TAB: CLIENTS ══════════════════════════════════ */}
        {activeTab === 'clients' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-lg flex items-center gap-2"><Users size={20} className="text-blue-500"/> سجل العملاء</h3>
              <button onClick={saveClientToHistory} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm transition-all">
                <Save size={16}/> حفظ العميل الحالي
              </button>
            </div>
            {clientHistory.length === 0 ? (
              <div className={cn("p-12 rounded-[2rem] border text-center", card)}>
                <Users size={48} className="mx-auto opacity-20 mb-4"/>
                <p className="font-bold opacity-40">لا يوجد عملاء محفوظين بعد</p>
                <p className="text-xs opacity-30 mt-1">افتح تبويب المخطط، أدخل بيانات العميل ثم ارجع هنا للحفظ</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {clientHistory.map(rec => (
                  <div key={rec.id} className={cn("p-5 rounded-[2rem] border transition-all", card)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black text-base">{rec.name || 'بدون اسم'}</p>
                        <p className="text-xs opacity-50 font-bold mt-0.5">{rec.goal || '—'} · {rec.savedAt}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => loadClient(rec)} className="px-4 py-2 bg-blue-600/10 text-blue-500 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all">تحميل</button>
                        <button onClick={() => deleteClient(rec.id)} className="p-2 text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full", theme === 'dark' ? "bg-orange-500/10 text-orange-400" : "bg-orange-50 text-orange-600")}>{Math.round(rec.targetMacros.calories)} kcal</span>
                      <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full", theme === 'dark' ? "bg-blue-500/10 text-blue-400" : "bg-blue-50 text-blue-600")}>{rec.meals.length} وجبات</span>
                      <span className={cn("text-[10px] font-black px-2.5 py-1 rounded-full", theme === 'dark' ? "bg-neutral-800 text-neutral-400" : "bg-gray-100 text-gray-500")}>{rec.phone}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════ TAB: PLANNER ══════════════════════════════════ */}
        {activeTab === 'planner' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── SIDEBAR ── */}
            <aside className="lg:col-span-4 space-y-5 print:hidden">
              {/* Client info */}
              <div className={cn("p-5 rounded-[2rem] border", card)}>
                <h3 className="flex items-center gap-2 mb-5 font-bold text-blue-500"><User size={16}/> بيانات العميل</h3>
                <div className="space-y-3">
                  <IGroup theme={theme} label="اسم العميل" value={clientData.name} onChange={v => setClientData({ ...clientData, name: v })} placeholder="محمد علي"/>
                  <IGroup theme={theme} label="الهدف" value={clientData.goal} onChange={v => setClientData({ ...clientData, goal: v })} placeholder="تضخيم / تنشيف"/>
                </div>
              </div>

              {/* System notes */}
              <div className={cn("p-5 rounded-[2rem] border", card)}>
                <h3 className="flex items-center gap-2 mb-4 font-bold text-emerald-500"><Info size={16}/> ملاحظات النظام</h3>
                <textarea className={cn("w-full p-4 border rounded-2xl text-xs font-bold outline-none focus:border-blue-600 transition-all h-32 resize-none", theme === 'dark' ? "bg-black/40 border-neutral-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900")} placeholder="تعليمات تظهر في الطباعة..." value={systemNotes} onChange={e => setSystemNotes(e.target.value)}/>
              </div>

              {/* Target macros */}
              <div className={cn("p-5 rounded-[2rem] border", card)}>
                <h3 className="flex items-center gap-2 mb-5 font-bold text-orange-500"><Settings size={16}/> الماكروز المستهدفة</h3>
                <div className="grid grid-cols-2 gap-3">
                  <MacroInput label="السعرات" value={targetMacros.calories} onChange={v => setTargetMacros({ ...targetMacros, calories: v })} color={cn("border", theme === 'dark' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-600")}/>
                  <MacroInput label="البروتين" value={targetMacros.protein} onChange={v => setTargetMacros({ ...targetMacros, protein: v })} color={cn("border", theme === 'dark' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600")}/>
                  <MacroInput label="الكارب" value={targetMacros.carbs} onChange={v => setTargetMacros({ ...targetMacros, carbs: v })} color={cn("border", theme === 'dark' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600")}/>
                  <MacroInput label="الدهون" value={targetMacros.fat} onChange={v => setTargetMacros({ ...targetMacros, fat: v })} color={cn("border", theme === 'dark' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-yellow-50 border-yellow-200 text-yellow-600")}/>
                </div>
              </div>

              {/* Progress */}
              <div className={cn("p-5 rounded-[2rem] border", card)}>
                <h3 className="flex items-center gap-2 mb-5 font-bold text-emerald-500"><Zap size={16}/> حالة الإنجاز</h3>
                <div className="space-y-4">
                  <ProgressBar theme={theme} label="السعرات" current={totals.calories} target={targetMacros.calories} unit="kcal" color="bg-orange-500"/>
                  <ProgressBar theme={theme} label="البروتين" current={totals.protein} target={targetMacros.protein} unit="g" color="bg-red-500"/>
                  <ProgressBar theme={theme} label="الكارب" current={totals.carbs} target={targetMacros.carbs} unit="g" color="bg-blue-500"/>
                  <ProgressBar theme={theme} label="الدهون" current={totals.fat} target={targetMacros.fat} unit="g" color="bg-yellow-500"/>
                </div>
              </div>

              {/* Macro Pie */}
              {pieData && (
                <div className={cn("p-5 rounded-[2rem] border", card)}>
                  <h3 className="flex items-center gap-2 mb-4 font-bold text-purple-500"><PieChart size={16}/> توزيع الماكروز</h3>
                  <MacroPie data={pieData} theme={theme}/>
                </div>
              )}

              {/* Water Tracker */}
              <div className={cn("p-5 rounded-[2rem] border", card)}>
                <h3 className="flex items-center gap-2 mb-4 font-bold text-cyan-500"><Droplets size={16}/> تتبع الماء</h3>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-black">{waterGlasses} / {waterTarget} أكواب</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] opacity-50 font-bold">الهدف</span>
                    <input type="number" min="1" max="20" className={cn("w-12 p-1.5 rounded-lg text-center font-black text-xs border outline-none", theme === 'dark' ? "bg-black border-neutral-700 text-white" : "bg-gray-100 border-gray-300")} value={waterTarget} onChange={e => setWaterTarget(Number(e.target.value) || 8)}/>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {Array.from({ length: waterTarget }).map((_, i) => (
                    <button key={i} onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)} className={cn("h-8 rounded-lg transition-all border text-sm", i < waterGlasses ? "bg-cyan-500 border-cyan-400 text-white" : theme === 'dark' ? "bg-neutral-800 border-neutral-700" : "bg-gray-100 border-gray-200")}>
                      {i < waterGlasses ? '💧' : ''}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setWaterGlasses(Math.min(waterGlasses + 1, waterTarget))} className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-black transition-all">+ كوب</button>
                  <button onClick={() => setWaterGlasses(0)} className={cn("px-4 py-2 rounded-xl text-xs font-bold transition-all border", theme === 'dark' ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700" : "bg-gray-100 border-gray-200 hover:bg-gray-200")}>إعادة</button>
                </div>
              </div>

              {/* Custom Foods */}
              <div className={cn("p-5 rounded-[2rem] border", card)}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-bold text-amber-500"><Plus size={16}/> أطعمة مخصصة</h3>
                  <button onClick={() => setIsCustomFoodOpen(!isCustomFoodOpen)} className={cn("p-1.5 rounded-xl transition-all", isCustomFoodOpen ? "bg-amber-500/20 text-amber-500" : theme === 'dark' ? "bg-neutral-800 text-neutral-400" : "bg-gray-100 text-gray-500")}>
                    {isCustomFoodOpen ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                  </button>
                </div>
                {isCustomFoodOpen && (
                  <div className="space-y-3">
                    <input className={cn("w-full p-3 border rounded-xl text-xs font-bold outline-none", theme === 'dark' ? "bg-black/40 border-neutral-800 text-white" : "bg-gray-50 border-gray-200")} placeholder="اسم الطعام بالعربي والإنجليزي" value={newFood.name} onChange={e => setNewFood({ ...newFood, name: e.target.value })}/>
                    <select className={cn("w-full p-3 border rounded-xl text-xs font-bold outline-none", theme === 'dark' ? "bg-black/40 border-neutral-800 text-white" : "bg-gray-50 border-gray-200")} value={newFood.category} onChange={e => setNewFood({ ...newFood, category: e.target.value })}>
                      {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                      {([['protein', 'بروتين (g)'], ['carbs', 'كارب (g)'], ['fat', 'دهون (g)'], ['calories', 'سعرات']] as [keyof typeof newFood, string][]).map(([k, label]) => (
                        <div key={k}>
                          <label className="text-[9px] opacity-40 font-black block mb-1">{label}</label>
                          <input type="number" min="0" className={cn("w-full p-2 border rounded-lg text-xs font-bold outline-none text-center", theme === 'dark' ? "bg-black/40 border-neutral-800 text-white" : "bg-gray-50 border-gray-200")} value={newFood[k] as number} onChange={e => setNewFood({ ...newFood, [k]: parseFloat(e.target.value) || 0 })}/>
                        </div>
                      ))}
                    </div>
                    <button onClick={addCustomFood} className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-black transition-all">إضافة للقاعدة</button>
                    {customFoods.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-neutral-800/50">
                        {customFoods.map(f => (
                          <div key={f.id} className={cn("flex items-center justify-between p-2.5 rounded-xl", theme === 'dark' ? "bg-neutral-800/40" : "bg-gray-50")}>
                            <div><p className="text-xs font-bold truncate max-w-[150px]">{f.name}</p><p className="text-[9px] opacity-40">{f.calories} kcal</p></div>
                            <button onClick={() => deleteCustomFood(f.id)} className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={13}/></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </aside>

            {/* ── MAIN ── */}
            <main className="lg:col-span-8 space-y-5">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                  {meals.map(meal => (
                    <MealCard key={meal.id} meal={meal} theme={theme}
                      onAddItems={() => { setActiveMealId(meal.id); setIsModalOpen(true); }}
                      onRemove={() => removeMeal(meal.id)}
                      onDuplicate={() => duplicateMeal(meal)}
                      onUpdateMeal={updated => setMeals(meals.map(m => m.id === updated.id ? updated : m))}
                      moveItem={(instId, dir) => moveItem(meal.id, instId, dir)}
                      onRemoveItem={instId => removeItemFromMeal(meal.id, instId)}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              <button onClick={addMeal} className={cn("w-full py-5 rounded-[2rem] border-2 border-dashed font-black text-sm transition-all flex items-center justify-center gap-2 print:hidden", theme === 'dark' ? "border-neutral-700 text-neutral-500 hover:border-blue-600 hover:text-blue-500" : "border-gray-200 text-gray-400 hover:border-blue-400 hover:text-blue-500")}>
                <Plus size={20}/> إضافة وجبة جديدة
              </button>

              {/* Daily Total */}
              <div className={cn("p-5 rounded-[2rem] border print:border-2 print:border-blue-600", card)}>
                <h3 className="font-black text-base mb-4 flex items-center gap-2"><Flame size={18} className="text-orange-500"/> الإجمالي اليومي</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <TotalBadge label="السعرات" value={Math.round(totals.calories)} unit="kcal" color="orange" theme={theme}/>
                  <TotalBadge label="البروتين" value={Math.round(totals.protein)} unit="g" color="red" theme={theme}/>
                  <TotalBadge label="الكارب" value={Math.round(totals.carbs)} unit="g" color="blue" theme={theme}/>
                  <TotalBadge label="الدهون" value={Math.round(totals.fat)} unit="g" color="yellow" theme={theme}/>
                </div>
              </div>

              {/* Print footer */}
              {systemNotes && <div className="hidden print:block mt-6 p-5 border-2 border-dashed border-gray-300 rounded-3xl"><p className="text-xs font-black text-gray-500 uppercase mb-2">ملاحظات</p><p className="text-sm text-gray-700 font-bold whitespace-pre-wrap">{systemNotes}</p></div>}
              <div className="hidden print:block text-center mt-6"><p className="text-xl font-black text-blue-700">{clientData.coach}</p><p className="text-base font-mono text-blue-500">{clientData.phone}</p></div>
            </main>
          </div>
        )}
      </div>

      {/* ══════════════════════════ FOOD MODAL ══════════════════════════ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={cn("w-full max-w-3xl max-h-[85vh] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border", theme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200")}>
            <div className="p-7 pb-4 flex justify-between items-center">
              <div><h2 className="text-xl font-black">قائمة الأطعمة</h2><p className="text-xs opacity-50 font-bold mt-0.5">{selectedFoods.size} محدد</p></div>
              <button onClick={() => { setIsModalOpen(false); setSelectedFoods(new Set()); }} className="p-3 rounded-2xl hover:text-red-500 transition-colors"><X size={22}/></button>
            </div>
            <div className="px-7 pb-3 space-y-3">
              <div className="relative">
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" size={18}/>
                <input autoFocus className={cn("w-full py-3.5 pr-12 pl-5 rounded-2xl outline-none border font-bold text-sm", theme === 'dark' ? "bg-black border-neutral-700 text-white" : "bg-gray-50 border-gray-200")} placeholder="ابحث: دجاج، هامور، أرز، تمر..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}/>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={cn("px-3.5 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-all border", selectedCategory === cat ? "bg-blue-600 text-white border-blue-600" : theme === 'dark' ? "bg-neutral-800 text-neutral-400 border-neutral-700" : "bg-gray-100 text-gray-500 border-gray-200")}>
                    {cat === 'All' ? 'الكل' : cat === 'Supplement' ? 'مكملات' : cat === 'Sauce' ? 'صلصات' : cat}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-7 pb-4 space-y-1.5">
              {filteredFoods.map(f => {
                const sel = selectedFoods.has(f.id);
                return (
                  <div key={`${f.id}-${f.name}`} onClick={() => toggleFoodSelection(f.id)} className={cn("flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all", sel ? "bg-blue-600/10 border-blue-500/50" : theme === 'dark' ? "bg-neutral-800/30 border-neutral-800 hover:border-neutral-600" : "bg-gray-50 border-gray-100 hover:border-gray-300")}>
                    <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0", sel ? "bg-blue-600 text-white" : theme === 'dark' ? "bg-neutral-800 text-neutral-500" : "bg-gray-200 text-gray-500")}>
                      {sel ? <Check size={16}/> : f.category[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-black text-sm truncate">{f.name}</p>
                      <div className="flex gap-2.5 mt-0.5 text-[10px] font-bold">
                        <span className="text-orange-500">{f.calories} kcal</span>
                        <span className="text-red-500">P:{f.protein}g</span>
                        <span className="text-blue-500">C:{f.carbs}g</span>
                        <span className="text-yellow-500">F:{f.fat}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filteredFoods.length === 0 && <div className="text-center py-10 opacity-30"><Search size={36} className="mx-auto mb-2"/><p className="font-bold text-sm">لا توجد نتائج</p></div>}
            </div>
            {selectedFoods.size > 0 && (
              <div className="p-5 border-t border-neutral-800/50">
                <button onClick={addSelectedToMeal} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-base shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all">
                  إضافة {selectedFoods.size} {selectedFoods.size === 1 ? 'صنف' : 'أصناف'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════ TEMPLATES MODAL ══════════════════════════ */}
      {isTemplateModalOpen && (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className={cn("w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border", theme === 'dark' ? "bg-neutral-900 border-neutral-800" : "bg-white border-gray-200")}>
            <div className="p-7 pb-4 flex justify-between items-center border-b border-neutral-800/30">
              <div><h2 className="text-xl font-black">القوالب</h2><p className="text-xs opacity-50 font-bold mt-0.5">احفظ وحمّل خطط التغذية</p></div>
              <button onClick={() => setIsTemplateModalOpen(false)} className="p-3 rounded-2xl hover:text-red-500 transition-colors"><X size={22}/></button>
            </div>
            <div className="flex gap-1.5 p-4 px-7">
              {(['list', 'save'] as const).map(v => (
                <button key={v} onClick={() => setTemplateView(v)} className={cn("flex-1 py-2 rounded-xl text-xs font-black transition-all", templateView === v ? "bg-blue-600 text-white" : theme === 'dark' ? "bg-neutral-800 text-neutral-400" : "bg-gray-100 text-gray-500")}>
                  {v === 'list' ? `المحفوظة (${templates.length})` : 'حفظ الحالي'}
                </button>
              ))}
            </div>
            <div className="px-7 pb-7">
              {templateView === 'save' ? (
                <div className="space-y-3">
                  <input autoFocus className={cn("w-full p-4 border rounded-2xl outline-none focus:border-blue-600 font-bold text-sm transition-all", theme === 'dark' ? "bg-black border-neutral-700 text-white" : "bg-gray-50 border-gray-200")} placeholder="اسم القالب..." value={templateNameInput} onChange={e => setTemplateNameInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveTemplate()}/>
                  <button onClick={saveTemplate} disabled={!templateNameInput.trim()} className="w-full bg-blue-600 disabled:opacity-40 text-white py-4 rounded-2xl font-black hover:bg-blue-500 transition-all flex items-center justify-center gap-2"><Save size={16}/> حفظ</button>
                </div>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {templates.length === 0 ? (
                    <div className="text-center py-10 opacity-40"><BookOpen size={36} className="mx-auto mb-2"/><p className="font-bold text-sm">لا توجد قوالب بعد</p></div>
                  ) : templates.map(t => (
                    <div key={t.id} className={cn("flex items-center gap-3 p-4 rounded-2xl border", theme === 'dark' ? "bg-neutral-800/40 border-neutral-700/50" : "bg-gray-50 border-gray-200")}>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-sm truncate">{t.name}</p>
                        <p className="text-[10px] opacity-40 font-bold">{t.meals.length} وجبات · {t.createdAt}</p>
                      </div>
                      <button onClick={() => loadTemplate(t)} className="px-3 py-1.5 bg-blue-600/10 text-blue-500 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all">تحميل</button>
                      {deleteConfirm === String(t.id) ? (
                        <div className="flex gap-1">
                          <button onClick={() => deleteTemplate(t.id)} className="px-2.5 py-1.5 bg-red-600 text-white rounded-xl text-xs font-black">✓</button>
                          <button onClick={() => setDeleteConfirm(null)} className="px-2.5 py-1.5 bg-neutral-700 text-white rounded-xl text-xs font-black">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(String(t.id))} className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// MEAL CARD
// =====================================================================
function MealCard({ meal, theme, onAddItems, onRemove, onDuplicate, onUpdateMeal, moveItem, onRemoveItem }: {
  meal: Meal; theme: 'dark' | 'light'; onAddItems: () => void; onRemove: () => void;
  onDuplicate: () => void; onUpdateMeal: (u: Meal) => void;
  moveItem: (id: string, dir: 'up' | 'down') => void; onRemoveItem: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: meal.id });
  const [isCollapsed, setIsCollapsed] = useState(false);
  const style = { transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 10 : 1 };

  const t = meal.items.reduce((acc, it) => {
    const r = it.grams / 100;
    return { cal: acc.cal + it.calories * r, pro: acc.pro + it.protein * r, carb: acc.carb + it.carbs * r, fat: acc.fat + it.fat * r };
  }, { cal: 0, pro: 0, carb: 0, fat: 0 });

  return (
    <div ref={setNodeRef} style={style} className={cn("rounded-[2.5rem] border transition-all overflow-hidden print:border-none print:mb-10 print:break-inside-avoid", theme === 'dark' ? "bg-neutral-900/40 border-neutral-800" : "bg-white border-gray-100 shadow-sm", isDragging && "opacity-50 ring-2 ring-blue-600")}>
      <div className={cn("px-5 py-3.5 flex items-center gap-3 border-b", theme === 'dark' ? "bg-neutral-800/30 border-neutral-800" : "bg-gray-50/50 border-gray-100")}>
        <button {...attributes} {...listeners} className="p-1.5 text-neutral-600 hover:text-blue-500 print:hidden shrink-0"><GripVertical size={18}/></button>
        <input className="bg-transparent font-black text-lg outline-none focus:text-blue-500 transition-colors flex-1 min-w-0 print:text-blue-600 print:font-black" value={meal.name} onChange={e => onUpdateMeal({ ...meal, name: e.target.value })}/>
        <div className="hidden md:flex gap-1.5 print:hidden">
          {[['bg-orange-500/10 text-orange-400', `${Math.round(t.cal)} kcal`], ['bg-red-500/10 text-red-400', `${Math.round(t.pro)}g P`], ['bg-blue-500/10 text-blue-400', `${Math.round(t.carb)}g C`], ['bg-yellow-500/10 text-yellow-400', `${Math.round(t.fat)}g F`]].map(([cls, val]) => (
            <span key={val as string} className={cn("text-[10px] font-black px-2.5 py-1 rounded-full", cls as string)}>{val as string}</span>
          ))}
        </div>
        <div className="hidden print:flex gap-4 text-base font-black text-blue-700">
          <span>{Math.round(t.cal)} kcal</span><span className="opacity-60">P:{Math.round(t.pro)}g</span><span className="opacity-60">C:{Math.round(t.carb)}g</span><span className="opacity-60">F:{Math.round(t.fat)}g</span>
        </div>
        <div className="flex items-center gap-1 print:hidden">
          <button onClick={onDuplicate} className="p-1.5 text-neutral-500 hover:text-emerald-500 transition-colors"><Copy size={15}/></button>
          <button onClick={() => setIsCollapsed(!isCollapsed)} className="p-1.5 text-neutral-500 hover:text-blue-500 transition-colors">{isCollapsed ? <ChevronDown size={16}/> : <ChevronUp size={16}/>}</button>
          <button onClick={onRemove} className="p-1.5 text-neutral-500 hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
        </div>
      </div>

      {!isCollapsed && (
        <div className="p-5">
          {meal.items.length === 0 ? (
            <div className="text-center py-8 opacity-25"><p className="font-bold text-sm">لا توجد أصناف</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right border-separate border-spacing-y-1.5 min-w-[500px]">
                <thead>
                  <tr className="text-[10px] uppercase font-black text-neutral-500">
                    <th className="pb-2 pr-3">الصنف</th>
                    <th className="pb-2 text-center">الكمية (جم)</th>
                    <th className="pb-2 text-center">بروتين</th>
                    <th className="pb-2 text-center">كارب</th>
                    <th className="pb-2 text-center">دهون</th>
                    <th className="pb-2 text-center">سعرات</th>
                    <th className="pb-2 text-center print:hidden"></th>
                  </tr>
                </thead>
                <tbody>
                  {meal.items.map(it => (
                    <tr key={it.instId} className={cn("rounded-xl", theme === 'dark' ? "bg-black/20" : "bg-gray-50/60")}>
                      <td className="py-3 pr-3 rounded-r-xl">
                        <div className="font-bold text-xs">{it.name}</div>
                        <div className="text-[9px] opacity-40 font-bold">{it.category}</div>
                      </td>
                      <td className="py-3 text-center">
                        <input type="number" min="0" className={cn("w-14 p-1.5 rounded-lg text-center font-black text-xs border outline-none print:hidden", theme === 'dark' ? "bg-black border-neutral-800 text-white" : "bg-white border-gray-200")} value={it.grams} onChange={e => onUpdateMeal({ ...meal, items: meal.items.map(i => i.instId === it.instId ? { ...i, grams: parseFloat(e.target.value) || 0 } : i) })}/>
                        <span className="hidden print:inline font-black text-sm">{it.grams}{it.state === "Liquid" ? "ml" : "g"}</span>
                      </td>
                      <td className="py-3 text-center text-xs font-bold text-red-500/80">{Math.round(it.protein * it.grams / 100)}g</td>
                      <td className="py-3 text-center text-xs font-bold text-blue-500/80">{Math.round(it.carbs * it.grams / 100)}g</td>
                      <td className="py-3 text-center text-xs font-bold text-yellow-500/80">{Math.round(it.fat * it.grams / 100)}g</td>
                      <td className="py-3 text-center text-sm font-black text-blue-500">{Math.round(it.calories * it.grams / 100)}</td>
                      <td className="py-3 text-center rounded-l-xl print:hidden">
                        <div className="flex items-center justify-center gap-0.5">
                          <button onClick={() => moveItem(it.instId, 'up')} className="p-1 text-neutral-600 hover:text-blue-500 transition-colors"><ArrowUp size={12}/></button>
                          <button onClick={() => moveItem(it.instId, 'down')} className="p-1 text-neutral-600 hover:text-blue-500 transition-colors"><ArrowDown size={12}/></button>
                          <button onClick={() => onRemoveItem(it.instId)} className="p-1 text-neutral-600 hover:text-red-500 transition-colors"><Trash2 size={12}/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <textarea placeholder="ملاحظات الوجبة..." className={cn("w-full p-3 rounded-2xl text-xs font-bold outline-none border h-16 resize-none", theme === 'dark' ? "bg-black/40 border-neutral-800 text-white" : "bg-gray-50 border-gray-100")} value={meal.notes} onChange={e => onUpdateMeal({ ...meal, notes: e.target.value })}/>
            </div>
            <button onClick={onAddItems} className="flex items-center gap-2 px-5 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-sm print:hidden transition-all shadow-lg shadow-blue-600/20 shrink-0"><Plus size={16}/> إضافة صنف</button>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// SMALL COMPONENTS
// =====================================================================
function IGroup({ label, value, onChange, placeholder, theme }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; theme: 'dark' | 'light' }) {
  return (
    <div>
      <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-1">{label}</label>
      <input className={cn("w-full border p-3 rounded-xl outline-none focus:border-blue-600 font-bold text-sm transition-all", theme === 'dark' ? "bg-black/40 border-neutral-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900")} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}/>
    </div>
  );
}

function CalcInput({ label, value, onChange, theme }: { label: string; value: number; onChange: (v: number) => void; theme: 'dark' | 'light' }) {
  return (
    <div>
      <label className="text-[10px] font-black opacity-40 uppercase tracking-widest block mb-1">{label}</label>
      <input type="number" min="0" className={cn("w-full border p-3 rounded-xl outline-none focus:border-blue-600 font-bold text-sm transition-all", theme === 'dark' ? "bg-black/40 border-neutral-800 text-white" : "bg-gray-50 border-gray-200 text-gray-900")} value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}/>
    </div>
  );
}

function MacroInput({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div className={cn("p-3.5 rounded-2xl", color)}>
      <label className="text-[10px] font-black uppercase block mb-1 opacity-70">{label}</label>
      <input type="number" min="0" className="bg-transparent w-full font-black text-lg outline-none" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)}/>
    </div>
  );
}

function ProgressBar({ label, current, target, unit, color, theme }: { label: string; current: number; target: number; unit: string; color: string; theme: 'dark' | 'light' }) {
  const pct = Math.min((current / target) * 100, 100);
  const over = current > target;
  return (
    <div>
      <div className="flex justify-between items-end mb-1.5">
        <span className="text-xs font-black opacity-60">{label}</span>
        <span className={cn("text-sm font-black", over ? "text-red-500" : "")}>{Math.round(current)} <span className="opacity-40 text-xs">/ {target}{unit}</span></span>
      </div>
      <div className={cn("h-2 rounded-full overflow-hidden", theme === 'dark' ? "bg-neutral-800" : "bg-gray-100")}>
        <div className={cn("h-full transition-all duration-500 rounded-full", over ? "bg-red-500" : color)} style={{ width: `${pct}%` }}/>
      </div>
    </div>
  );
}

function TotalBadge({ label, value, unit, color, theme }: { label: string; value: number; unit: string; color: string; theme: 'dark' | 'light' }) {
  const map: Record<string, string> = {
    orange: theme === 'dark' ? "bg-orange-500/10 border-orange-500/20 text-orange-400" : "bg-orange-50 border-orange-200 text-orange-600",
    red: theme === 'dark' ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-red-50 border-red-200 text-red-600",
    blue: theme === 'dark' ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-blue-50 border-blue-200 text-blue-600",
    yellow: theme === 'dark' ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-400" : "bg-yellow-50 border-yellow-200 text-yellow-600",
  };
  return (
    <div className={cn("p-4 rounded-2xl border text-center", map[color])}>
      <p className="text-[10px] font-black uppercase opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] opacity-50 font-bold">{unit}</p>
    </div>
  );
}

function MacroPie({ data, theme }: { data: { protein: number; carbs: number; fat: number }; theme: 'dark' | 'light' }) {
  const size = 120;
  const cx = size / 2, cy = size / 2, r = 44;
  const segments = [
    { pct: data.protein, color: '#ef4444', label: 'بروتين' },
    { pct: data.carbs, color: '#3b82f6', label: 'كارب' },
    { pct: data.fat, color: '#eab308', label: 'دهون' },
  ];
  let cumulativePct = 0;
  const slices = segments.map(s => {
    const startAngle = (cumulativePct / 100) * 2 * Math.PI - Math.PI / 2;
    cumulativePct += s.pct;
    const endAngle = (cumulativePct / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const large = s.pct > 50 ? 1 : 0;
    return { ...s, d: `M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z` };
  });
  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} className="shrink-0">
        {slices.map((s, i) => s.pct > 0 && <path key={i} d={s.d} fill={s.color} opacity={0.85}/>)}
        <circle cx={cx} cy={cy} r={28} fill={theme === 'dark' ? '#0a0a0a' : '#f9fafb'}/>
      </svg>
      <div className="space-y-2">
        {segments.map(s => (
          <div key={s.label} className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: s.color }}/>
            <span className="text-xs font-black opacity-70">{s.label}</span>
            <span className="text-xs font-black" style={{ color: s.color }}>{s.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}