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
  micros?: Partial<Record<string, number>>; // per 100g (or per piece for per-piece items)
}

const FOOD_DATABASE: FoodEntry[] = [
  // ── PROTEINS ──────────────────────────────────────────────────────────────
  { id: 101, name: "Chicken Breast - صدر دجاج", category: "Protein", state: "per 100g", carbs: 0, protein: 31, fat: 3.6, calories: 165, micros: { vitB3: 13.4, vitB6: 1.0, vitB12: 0.3, vitB5: 1.5, phosphorus: 220, selenium: 22, zinc: 1.0, potassium: 340, iron: 0.7, magnesium: 29, saturatedFat: 1.0 } },
  { id: 102, name: "Chicken Thigh - فخذ دجاج", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 10.9, calories: 209, micros: { vitB3: 6.3, vitB6: 0.6, vitB12: 0.3, phosphorus: 180, selenium: 18, zinc: 1.5, potassium: 280, iron: 1.2, magnesium: 24 } },
  { id: 103, name: "Ground Beef (lean) - لحم مفروم", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 7, calories: 172, micros: { vitB12: 2.5, vitB3: 5.5, vitB6: 0.4, iron: 2.5, zinc: 5.4, phosphorus: 200, selenium: 18, potassium: 320 } },
  { id: 104, name: "Beef Steak - ستيك لحم", category: "Protein", state: "per 100g", carbs: 0, protein: 27, fat: 8, calories: 180, micros: { vitB12: 2.5, vitB3: 6.2, vitB6: 0.5, iron: 2.2, zinc: 5.0, phosphorus: 210, selenium: 20, potassium: 330 } },
  { id: 105, name: "Lamb - لحم ضاني", category: "Protein", state: "per 100g", carbs: 0, protein: 25, fat: 14, calories: 218, micros: { vitB12: 2.7, vitB3: 5.7, vitB6: 0.4, iron: 1.9, zinc: 4.2, phosphorus: 195, selenium: 15, potassium: 310 } },
  { id: 106, name: "Tuna (canned in water) - تونة", category: "Protein", state: "per 100g", carbs: 0, protein: 25, fat: 1, calories: 116, micros: { vitB12: 2.5, vitB3: 13.3, vitB6: 0.9, vitD: 4.0, selenium: 80, phosphorus: 195, potassium: 290, magnesium: 31, iron: 1.3 } },
  { id: 107, name: "Salmon - سلمون", category: "Protein", state: "per 100g", carbs: 0, protein: 20, fat: 13, calories: 208, micros: { vitB12: 3.2, vitB3: 8.9, vitB6: 0.8, vitD: 11.1, selenium: 36, phosphorus: 240, potassium: 490, magnesium: 29, iron: 0.8, omega3: 2.3, saturatedFat: 3.2 } },
  { id: 108, name: "Tilapia - بلطي", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 2.7, calories: 128, micros: { vitB12: 1.6, vitB3: 3.9, vitB6: 0.2, vitD: 1.2, selenium: 40, phosphorus: 185, potassium: 380, magnesium: 28 } },
  { id: 109, name: "Shrimp - جمبري", category: "Protein", state: "per 100g", carbs: 0.9, protein: 24, fat: 0.3, calories: 99, micros: { vitB12: 1.1, vitB3: 2.6, selenium: 38, phosphorus: 205, iodine: 35, zinc: 1.3, iron: 2.4, potassium: 259 } },
  { id: 110, name: "Turkey Breast - ديك رومي", category: "Protein", state: "per 100g", carbs: 0, protein: 29, fat: 1, calories: 135, micros: { vitB12: 1.1, vitB3: 11.8, vitB6: 0.9, selenium: 32, phosphorus: 240, potassium: 330, zinc: 2.0, magnesium: 28 } },
  { id: 111, name: "Sardines - سردين", category: "Protein", state: "per 100g", carbs: 0, protein: 21, fat: 11, calories: 185, micros: { vitB12: 8.9, vitD: 4.8, vitB3: 5.2, calcium: 382, phosphorus: 490, selenium: 53, iron: 2.9, zinc: 1.3, potassium: 397 } },
  // ── EGGS ─────────────────────────────────────────────────────────────────
  { id: 120, name: "Whole Egg - بيضة كاملة", category: "Eggs", state: "per 100g", carbs: 1.1, protein: 13, fat: 10, calories: 143, micros: { vitA: 149, vitD: 2.0, vitB12: 1.1, vitB2: 0.46, vitB7: 20, vitK: 0.3, selenium: 30, phosphorus: 198, zinc: 1.3, iron: 1.8, choline: 294, saturatedFat: 3.1 } },
  { id: 121, name: "Egg White - بياض البيض", category: "Eggs", state: "per 100g", carbs: 0.7, protein: 11, fat: 0.2, calories: 52, micros: { vitB2: 0.44, selenium: 20, potassium: 163, magnesium: 11 } },
  { id: 122, name: "Egg Yolk - صفار البيض", category: "Eggs", state: "per 100g", carbs: 3.6, protein: 16, fat: 27, calories: 322, micros: { vitA: 381, vitD: 5.4, vitB12: 2.5, vitB7: 53, vitK: 0.7, selenium: 56, phosphorus: 390, zinc: 2.5, iron: 2.7 } },
  { id: 123, name: "Boiled Egg - بيضة مسلوقة", category: "Eggs", state: "per piece", carbs: 0.6, protein: 6.3, fat: 5, calories: 72, micros: { vitA: 74, vitD: 1.0, vitB12: 0.6, vitB2: 0.23, vitB7: 10, selenium: 15, phosphorus: 95, zinc: 0.6, iron: 0.8 } },
  { id: 124, name: "Fried Egg - بيضة مقلية", category: "Eggs", state: "per piece", carbs: 0.4, protein: 6.3, fat: 7, calories: 90, micros: { vitA: 74, vitD: 1.0, vitB12: 0.6, selenium: 15, phosphorus: 95, zinc: 0.6, iron: 0.8 } },
  { id: 125, name: "Scrambled Egg - بيض مخفوق", category: "Eggs", state: "per piece", carbs: 1.4, protein: 6.8, fat: 7.5, calories: 102, micros: { vitA: 75, vitD: 1.0, vitB12: 0.6, selenium: 15, phosphorus: 100, zinc: 0.6, iron: 0.8 } },
  { id: 126, name: "Egg White only - بياض بيضة", category: "Eggs", state: "per piece", carbs: 0.2, protein: 3.6, fat: 0.1, calories: 17, micros: { vitB2: 0.15, selenium: 7, potassium: 54 } },
  { id: 127, name: "Raw Whole Egg - بيضة كاملة نية", category: "Eggs", state: "per piece", carbs: 0.6, protein: 6, fat: 5, calories: 70, micros: { vitA: 74, vitD: 1.0, vitB12: 0.6, vitB2: 0.23, vitB7: 10, selenium: 15, phosphorus: 95, zinc: 0.6, iron: 0.8 } },
  // ── DAIRY ────────────────────────────────────────────────────────────────
  { id: 201, name: "Low-Fat Yogurt - زبادي قليل الدسم", category: "Dairy", state: "per 100g", carbs: 7, protein: 5, fat: 1.5, calories: 61, micros: { calcium: 183, vitB12: 0.75, vitB2: 0.23, phosphorus: 144, potassium: 255, iodine: 25, selenium: 3, magnesium: 17 } },
  { id: 202, name: "Full-Fat Yogurt - زبادي كامل الدسم", category: "Dairy", state: "per 100g", carbs: 4.7, protein: 3.5, fat: 3.3, calories: 61, micros: { calcium: 121, vitB12: 0.4, vitB2: 0.14, phosphorus: 94, potassium: 141, iodine: 20, magnesium: 11 } },
  { id: 203, name: "Cottage Cheese - جبن قريش", category: "Dairy", state: "per 100g", carbs: 3.4, protein: 11, fat: 4, calories: 98, micros: { calcium: 83, vitB12: 0.43, vitB2: 0.16, phosphorus: 159, selenium: 10, sodium: 364, potassium: 104 } },
  { id: 204, name: "Feta Cheese - جبن فيتا", category: "Dairy", state: "per 100g", carbs: 4, protein: 14, fat: 21, calories: 264 },
  { id: 205, name: "Cheddar Cheese - جبن شيدر", category: "Dairy", state: "per 100g", carbs: 1.3, protein: 25, fat: 33, calories: 402 },
  { id: 206, name: "Mozzarella - موزاريلا", category: "Dairy", state: "per 100g", carbs: 2.2, protein: 22, fat: 17, calories: 254 },
  { id: 207, name: "Cream Cheese - كريم تشيز", category: "Dairy", state: "per 100g", carbs: 4.1, protein: 6.2, fat: 34, calories: 350 },
  { id: 208, name: "Butter - زبدة", category: "Dairy", state: "per 100g", carbs: 0.1, protein: 0.9, fat: 80, calories: 717, micros: { saturatedFat: 51.4 } },
  { id: 209, name: "Labneh - لبنة", category: "Dairy", state: "per 100g", carbs: 4, protein: 7, fat: 5, calories: 89 },
  { id: 210, name: "Whipping Cream - كريمة خفق", category: "Dairy", state: "per 100g", carbs: 3.6, protein: 2.5, fat: 36, calories: 340 },
  { id: 211, name: "Greek Yogurt (low-fat) - زبادي يوناني", category: "Dairy", state: "per 100g", carbs: 4, protein: 10, fat: 0.7, calories: 59 },
  { id: 212, name: "Greek Yogurt (full-fat) - زبادي يوناني كامل", category: "Dairy", state: "per 100g", carbs: 3.6, protein: 9, fat: 5, calories: 97 },
  { id: 213, name: "Rayeb Yogurt - رايب", category: "Dairy", state: "per 100g", carbs: 5, protein: 3.5, fat: 3, calories: 60 },
  // ── MILK ──────────────────────────────────────────────────────────────────
  { id: 412, name: "Whole Milk - حليب كامل الدسم", category: "Milk", state: "per 100ml", carbs: 4.7, protein: 3.2, fat: 3.6, calories: 61, micros: { calcium: 113, vitB12: 0.45, vitB2: 0.16, vitD: 1.0, potassium: 150 } },
  { id: 413, name: "Skim Milk - حليب خالي الدسم", category: "Milk", state: "per 100ml", carbs: 5.0, protein: 3.5, fat: 0.2, calories: 36, micros: { calcium: 125, vitB12: 0.5, vitB2: 0.18, vitD: 1.0, potassium: 160 } },
  { id: 414, name: "Semi-Skim Milk - حليب نصف دسم", category: "Milk", state: "per 100ml", carbs: 4.8, protein: 3.3, fat: 1.8, calories: 47, micros: { calcium: 120, vitB12: 0.45, vitB2: 0.17, vitD: 1.0, potassium: 155 } },
  { id: 415, name: "Almarai Protein Milk - حليب ألمراي بروتين", category: "Milk", state: "per 100ml", carbs: 5.0, protein: 5.0, fat: 0.2, calories: 42, micros: { calcium: 130, vitB12: 0.5, vitD: 1.0, potassium: 160 } },
  { id: 416, name: "Oat Milk - حليب الشوفان", category: "Milk", state: "per 100ml", carbs: 7.0, protein: 1.0, fat: 1.5, calories: 45 },
  { id: 417, name: "Almond Milk (unsweetened) - حليب اللوز", category: "Milk", state: "per 100ml", carbs: 1.2, protein: 0.4, fat: 1.5, calories: 20 },
  // ── CARBS ─────────────────────────────────────────────────────────────────
  { id: 301, name: "White Rice - أرز أبيض", category: "Carbs", state: "per 100g cooked", carbs: 28, protein: 2.7, fat: 0.3, calories: 130, micros: { vitB1: 0.02, vitB3: 0.4, vitB9: 3, iron: 0.2, magnesium: 12, phosphorus: 43, potassium: 35, selenium: 7.5 } },
  { id: 302, name: "Brown Rice - أرز بني", category: "Carbs", state: "per 100g cooked", carbs: 23, protein: 2.6, fat: 0.9, calories: 112, micros: { vitB1: 0.1, vitB3: 1.5, vitB6: 0.15, vitE: 0.1, magnesium: 44, phosphorus: 83, potassium: 79, selenium: 9.8, manganese: 0.9, zinc: 0.6 } },
  { id: 303, name: "Oats - شوفان", category: "Carbs", state: "per 100g dry", carbs: 66, protein: 17, fat: 7, calories: 389, micros: { vitB1: 0.76, vitB5: 1.35, vitB9: 56, iron: 4.72, magnesium: 177, phosphorus: 523, potassium: 429, zinc: 3.97, manganese: 4.91, selenium: 28.9, copper: 626, fiber: 10.6 } },
  { id: 304, name: "Whole Wheat Bread - خبز قمح كامل", category: "Carbs", state: "per 100g", carbs: 43, protein: 9, fat: 3.4, calories: 247, micros: { vitB1: 0.4, vitB3: 4.2, vitB9: 44, iron: 2.8, magnesium: 76, phosphorus: 212, potassium: 248, zinc: 1.8, selenium: 26, manganese: 2.7 } },
  { id: 305, name: "White Bread - خبز أبيض", category: "Carbs", state: "per 100g", carbs: 49, protein: 9, fat: 3.2, calories: 265, micros: { vitB1: 0.5, vitB3: 4.5, vitB9: 100, iron: 3.6, calcium: 260, selenium: 22, phosphorus: 108 } },
  { id: 306, name: "Pasta - مكرونة", category: "Carbs", state: "per 100g cooked", carbs: 25, protein: 5, fat: 0.9, calories: 131, micros: { vitB1: 0.09, vitB3: 1.0, vitB9: 7, iron: 0.5, magnesium: 15, phosphorus: 56, selenium: 18.4 } },
  { id: 307, name: "Whole Wheat Pasta - مكرونة قمح كامل", category: "Carbs", state: "per 100g cooked", carbs: 23, protein: 5.5, fat: 0.8, calories: 124, micros: { vitB1: 0.15, vitB3: 1.6, vitB9: 13, iron: 1.4, magnesium: 45, phosphorus: 125, zinc: 1.1, manganese: 1.3, selenium: 20 } },
  { id: 308, name: "Sweet Potato - بطاطا حلوة", category: "Carbs", state: "per 100g", carbs: 20, protein: 1.6, fat: 0.1, calories: 86, micros: { vitA: 961, vitC: 2.4, vitB5: 0.8, vitB6: 0.29, vitE: 0.26, vitB9: 11, potassium: 337, magnesium: 25, phosphorus: 47, manganese: 0.26, calcium: 30 } },
  { id: 309, name: "White Potato - بطاطس", category: "Carbs", state: "per 100g", carbs: 17, protein: 2, fat: 0.1, calories: 77, micros: { vitC: 19.7, vitB6: 0.3, vitB9: 16, vitB3: 1.44, potassium: 421, magnesium: 23, phosphorus: 57, iron: 0.78 } },
  { id: 310, name: "Bread (Baladi) - خبز بلدي", category: "Carbs", state: "per 100g", carbs: 52, protein: 8, fat: 1.5, calories: 253, micros: { vitB1: 0.35, vitB3: 3.8, vitB9: 80, iron: 3.2, calcium: 200, selenium: 20, phosphorus: 100 } },
  { id: 311, name: "Quinoa - كينوا", category: "Carbs", state: "per 100g cooked", carbs: 22, protein: 4, fat: 1.9, calories: 120, micros: { vitB1: 0.1, vitB2: 0.11, vitB9: 42, vitE: 0.6, iron: 1.49, magnesium: 64, phosphorus: 152, zinc: 1.09, potassium: 172, manganese: 0.63, copper: 199 } },
  { id: 312, name: "Lentils (cooked) - عدس", category: "Carbs", state: "per 100g", carbs: 20, protein: 9, fat: 0.4, calories: 116, micros: { vitB1: 0.17, vitB6: 0.18, vitB9: 181, iron: 3.33, magnesium: 36, phosphorus: 180, potassium: 369, zinc: 1.27, manganese: 0.49, copper: 251, selenium: 2.8, fiber: 7.9 } },
  { id: 313, name: "Chickpeas (cooked) - حمص", category: "Carbs", state: "per 100g", carbs: 27, protein: 9, fat: 2.6, calories: 164, micros: { vitB6: 0.14, vitB9: 172, vitB5: 0.29, iron: 2.89, magnesium: 48, phosphorus: 168, potassium: 291, zinc: 1.53, manganese: 1.03, copper: 352, selenium: 3.7 } },
  { id: 314, name: "Fava Beans (Ful) - فول مدمس", category: "Carbs", state: "per 100g", carbs: 26, protein: 8, fat: 0.5, calories: 110, micros: { vitB1: 0.15, vitB9: 148, vitC: 1.4, iron: 1.9, magnesium: 43, phosphorus: 125, potassium: 332, zinc: 1.0, copper: 180, manganese: 0.54 } },
  { id: 315, name: "Corn - ذرة", category: "Carbs", state: "per 100g", carbs: 19, protein: 3.2, fat: 1.2, calories: 96, micros: { vitC: 6.8, vitB1: 0.2, vitB3: 1.77, vitB9: 42, vitB5: 0.72, magnesium: 37, phosphorus: 89, potassium: 270, zinc: 0.45, manganese: 0.16 } },
  // ── VEGETABLES ────────────────────────────────────────────────────────────
  { id: 501, name: "Broccoli - بروكلي", category: "Vegetables", state: "per 100g", carbs: 7, protein: 2.8, fat: 0.4, calories: 34, micros: { vitC: 89.2, vitK: 101.6, vitA: 31, vitB9: 63, vitB6: 0.18, calcium: 47, potassium: 316, magnesium: 21, iron: 0.73, phosphorus: 66, manganese: 0.21, fiber: 2.6 } },
  { id: 502, name: "Spinach - سبانخ", category: "Vegetables", state: "per 100g", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23, micros: { vitK: 482.9, vitA: 469, vitC: 28.1, vitB9: 194, vitE: 2.0, iron: 2.71, calcium: 99, magnesium: 79, potassium: 558, manganese: 0.9, fiber: 2.2 } },
  { id: 503, name: "Cucumber - خيار", category: "Vegetables", state: "per 100g", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 16, micros: { vitK: 16.4, vitC: 2.8, potassium: 147, magnesium: 13, vitB5: 0.26 } },
  { id: 504, name: "Tomato - طماطم", category: "Vegetables", state: "per 100g", carbs: 3.9, protein: 0.9, fat: 0.2, calories: 18, micros: { vitC: 13.7, vitA: 42, vitK: 7.9, vitB9: 15, potassium: 237, magnesium: 11, iron: 0.27 } },
  { id: 505, name: "Lettuce - خس", category: "Vegetables", state: "per 100g", carbs: 2.9, protein: 1.4, fat: 0.2, calories: 15, micros: { vitK: 102.3, vitA: 166, vitC: 9.2, vitB9: 73, calcium: 36, iron: 0.86 } },
  { id: 506, name: "Bell Pepper - فلفل رومي", category: "Vegetables", state: "per 100g", carbs: 6, protein: 1, fat: 0.3, calories: 31, micros: { vitC: 127.7, vitA: 157, vitB6: 0.29, vitK: 4.9, vitB9: 46, potassium: 211, magnesium: 12 } },
  { id: 507, name: "Cauliflower - قرنبيط", category: "Vegetables", state: "per 100g", carbs: 5, protein: 1.9, fat: 0.3, calories: 25, micros: { vitC: 48.2, vitK: 15.5, vitB9: 57, vitB6: 0.18, potassium: 299, magnesium: 15 } },
  { id: 508, name: "Green Beans - فاصوليا خضراء", category: "Vegetables", state: "per 100g", carbs: 7, protein: 1.8, fat: 0.1, calories: 31, micros: { vitK: 43, vitC: 12.2, vitA: 35, vitB9: 37, calcium: 37, iron: 1.03, magnesium: 25, potassium: 211 } },
  { id: 509, name: "Zucchini - كوسة", category: "Vegetables", state: "per 100g", carbs: 3.1, protein: 1.2, fat: 0.3, calories: 17, micros: { vitC: 17.9, vitB6: 0.16, vitA: 10, potassium: 261, magnesium: 18, manganese: 0.18 } },
  { id: 510, name: "Eggplant - باذنجان", category: "Vegetables", state: "per 100g", carbs: 5.9, protein: 1, fat: 0.2, calories: 25, micros: { vitB9: 22, vitK: 3.5, vitC: 2.2, potassium: 229, magnesium: 14, manganese: 0.25 } },
  { id: 511, name: "Carrots - جزر", category: "Vegetables", state: "per 100g", carbs: 10, protein: 0.9, fat: 0.2, calories: 41, micros: { vitA: 835, vitK: 13.2, vitC: 5.9, vitB9: 19, potassium: 320, magnesium: 12, calcium: 33, iron: 0.30 } },
  { id: 512, name: "Onion - بصل", category: "Vegetables", state: "per 100g", carbs: 9.3, protein: 1.1, fat: 0.1, calories: 40, micros: { vitC: 7.4, vitB6: 0.12, vitB9: 19, potassium: 146, calcium: 23 } },
  { id: 513, name: "Garlic - ثوم", category: "Vegetables", state: "per 100g", carbs: 33, protein: 6.4, fat: 0.5, calories: 149, micros: { vitC: 31.2, vitB6: 1.24, vitB1: 0.2, calcium: 181, iron: 1.7, magnesium: 25, phosphorus: 153, potassium: 401, selenium: 14.2, manganese: 1.67 } },
  { id: 514, name: "Mushrooms - فطر", category: "Vegetables", state: "per 100g", carbs: 3.3, protein: 3.1, fat: 0.3, calories: 22, micros: { vitD: 0.2, vitB2: 0.4, vitB3: 3.6, vitB5: 1.5, vitB9: 17, selenium: 9.3, phosphorus: 86, potassium: 318, copper: 305, iron: 0.5 } },
  { id: 515, name: "Peas - بازلاء", category: "Vegetables", state: "per 100g", carbs: 14, protein: 5.4, fat: 0.4, calories: 81, micros: { vitC: 40, vitK: 24.8, vitB1: 0.27, vitB9: 65, vitB6: 0.17, iron: 1.47, magnesium: 33, phosphorus: 108, potassium: 244, zinc: 1.24 } },
  { id: 516, name: "Molokhia - ملوخية", category: "Vegetables", state: "per 100g", carbs: 7, protein: 4.5, fat: 0.7, calories: 43, micros: { vitK: 700, vitA: 467, vitC: 33, vitB9: 102, calcium: 208, iron: 3.0, magnesium: 75, potassium: 525 } },
  { id: 517, name: "Arugula (Rocket) - جرجير", category: "Vegetables", state: "per 100g", carbs: 3.7, protein: 2.6, fat: 0.7, calories: 25, micros: { vitK: 108.6, vitA: 119, vitC: 15, vitB9: 97, calcium: 160, iron: 1.46, magnesium: 47, potassium: 369 } },
  { id: 518, name: "Parsley - بقدونس", category: "Vegetables", state: "per 100g", carbs: 6.3, protein: 3, fat: 0.8, calories: 36, micros: { vitK: 1640, vitC: 133, vitA: 421, vitB9: 152, iron: 6.2, calcium: 138, potassium: 554, magnesium: 50 } },
  // ── FATS ──────────────────────────────────────────────────────────────────
  { id: 601, name: "Olive Oil - زيت زيتون", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 14.35, vitK: 60.2, omega3: 0.76, omega6: 9.76, saturatedFat: 13.8 } },
  { id: 602, name: "Coconut Oil - زيت جوز الهند", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 892 },
  { id: 603, name: "Avocado - أفوكادو", category: "Fats", state: "per 100g", carbs: 9, protein: 2, fat: 15, calories: 160, micros: { vitK: 21, vitE: 2.07, vitC: 10, vitB5: 1.39, vitB6: 0.26, vitB9: 81, potassium: 485, magnesium: 29, copper: 190 } },
  { id: 604, name: "Almonds - لوز", category: "Fats", state: "per 100g", carbs: 22, protein: 21, fat: 50, calories: 579, micros: { vitE: 25.6, vitB2: 1.14, vitB3: 3.38, magnesium: 270, calcium: 264, phosphorus: 481, iron: 3.71, zinc: 3.12, copper: 996, manganese: 2.18, selenium: 4.1 } },
  { id: 605, name: "Walnuts - جوز", category: "Fats", state: "per 100g", carbs: 14, protein: 15, fat: 65, calories: 654, micros: { vitB6: 0.54, vitB9: 98, vitE: 0.7, magnesium: 158, phosphorus: 346, iron: 2.91, zinc: 3.09, copper: 1590, manganese: 3.41 } },
  { id: 606, name: "Cashews - كاجو", category: "Fats", state: "per 100g", carbs: 30, protein: 18, fat: 44, calories: 553, micros: { vitK: 34.1, vitB1: 0.42, vitB6: 0.42, vitB9: 25, magnesium: 292, phosphorus: 593, iron: 6.68, zinc: 5.78, copper: 2195, manganese: 1.66, selenium: 19.9 } },
  { id: 607, name: "Peanut Butter - زبدة الفول السوداني", category: "Fats", state: "per 100g", carbs: 20, protein: 25, fat: 50, calories: 588, micros: { vitE: 9.1, vitB3: 13.1, vitB6: 0.44, vitB9: 87, magnesium: 168, phosphorus: 335, potassium: 558, iron: 1.74, zinc: 2.9, copper: 440 } },
  { id: 608, name: "Peanuts - فول سوداني", category: "Fats", state: "per 100g", carbs: 16, protein: 26, fat: 49, calories: 567, micros: { vitE: 8.33, vitB3: 12.07, vitB1: 0.64, vitB9: 240, magnesium: 168, phosphorus: 376, iron: 4.58, zinc: 3.27, copper: 1144, manganese: 1.93, selenium: 7.2 } },
  { id: 609, name: "Sunflower Seeds - بذور عباد الشمس", category: "Fats", state: "per 100g", carbs: 20, protein: 21, fat: 51, calories: 584, micros: { vitE: 35.17, vitB1: 1.48, vitB6: 1.35, vitB9: 227, vitB5: 6.75, magnesium: 325, phosphorus: 660, iron: 5.25, zinc: 5.0, copper: 1800, manganese: 1.95, selenium: 53, omega6: 23.0 } },
  { id: 610, name: "Tahini - طحينة", category: "Fats", state: "per 100g", carbs: 21, protein: 17, fat: 54, calories: 595, micros: { vitB1: 1.0, vitB9: 53, calcium: 426, iron: 8.95, magnesium: 95, phosphorus: 732, zinc: 4.62, copper: 1500, manganese: 1.42 } },
  { id: 611, name: "Flaxseeds - بذور الكتان", category: "Fats", state: "per 100g", carbs: 29, protein: 18, fat: 42, calories: 534, micros: { vitB1: 1.64, vitB9: 87, vitE: 0.31, magnesium: 392, phosphorus: 642, iron: 5.73, zinc: 4.34, copper: 1220, manganese: 2.48, selenium: 25.4 } },
  { id: 612, name: "Chia Seeds - بذور الشيا", category: "Fats", state: "per 100g", carbs: 42, protein: 17, fat: 31, calories: 486, micros: { vitB1: 0.62, vitB3: 8.83, calcium: 631, iron: 7.72, magnesium: 335, phosphorus: 860, zinc: 4.58, copper: 924, manganese: 2.72, selenium: 55.2 } },
  { id: 613, name: "Ghee - سمن بلدي", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 99.8, calories: 900, micros: { vitA: 300, vitD: 1.5, vitK: 8.6, saturatedFat: 62.0 } },
  { id: 614, name: "Sunflower Oil - زيت عباد الشمس", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 41.1, omega6: 65.7 } },
  { id: 615, name: "Corn Oil - زيت الذرة", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 14.3, vitK: 1.9, omega6: 54.0 } },
  { id: 616, name: "Avocado Oil - زيت الأفوكادو", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 12.1, vitK: 7.1, omega3: 0.96 } },
  { id: 617, name: "Coconut Oil - زيت جوز الهند (Fats)", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 892, micros: { saturatedFat: 82.5 } },
  // ── FRUITS ────────────────────────────────────────────────────────────────
  { id: 701, name: "Banana - موز", category: "Fruits", state: "per 100g", carbs: 23, protein: 1.1, fat: 0.3, calories: 89, micros: { vitB6: 0.37, vitC: 8.7, vitB9: 20, vitB5: 0.33, potassium: 358, magnesium: 27, manganese: 0.27, copper: 78, fiber: 2.6 } },
  { id: 702, name: "Apple - تفاح", category: "Fruits", state: "per 100g", carbs: 14, protein: 0.3, fat: 0.2, calories: 52, micros: { vitC: 4.6, vitK: 3.2, vitB9: 3, potassium: 107, calcium: 6, fiber: 2.4 } },
  { id: 703, name: "Orange - برتقال", category: "Fruits", state: "per 100g", carbs: 12, protein: 0.9, fat: 0.1, calories: 47, micros: { vitC: 53.2, vitB9: 30, vitA: 11, vitB1: 0.09, potassium: 181, calcium: 40, magnesium: 10 } },
  { id: 704, name: "Mango - مانجو", category: "Fruits", state: "per 100g", carbs: 15, protein: 0.8, fat: 0.4, calories: 60, micros: { vitC: 36.4, vitA: 54, vitB6: 0.12, vitK: 4.2, vitB9: 43, vitE: 0.9, potassium: 168, magnesium: 10, copper: 111 } },
  { id: 705, name: "Strawberry - فراولة", category: "Fruits", state: "per 100g", carbs: 8, protein: 0.7, fat: 0.3, calories: 32, micros: { vitC: 58.8, vitK: 2.2, vitB9: 24, manganese: 0.39, potassium: 153, magnesium: 13 } },
  { id: 706, name: "Watermelon - بطيخ", category: "Fruits", state: "per 100g", carbs: 8, protein: 0.6, fat: 0.2, calories: 30, micros: { vitC: 8.1, vitA: 28, vitB5: 0.22, potassium: 112, magnesium: 10, copper: 42 } },
  { id: 707, name: "Grapes - عنب", category: "Fruits", state: "per 100g", carbs: 18, protein: 0.7, fat: 0.2, calories: 69, micros: { vitK: 14.6, vitC: 3.2, vitB6: 0.09, vitB9: 2, potassium: 191, copper: 127 } },
  { id: 708, name: "Dates - تمر", category: "Fruits", state: "per 100g", carbs: 75, protein: 1.8, fat: 0.2, calories: 282, micros: { vitB5: 0.81, vitB6: 0.25, vitB3: 1.27, vitK: 2.7, vitB9: 15, potassium: 696, magnesium: 54, copper: 362, manganese: 0.3, iron: 0.9 } },
  { id: 709, name: "Figs - تين", category: "Fruits", state: "per 100g", carbs: 19, protein: 0.7, fat: 0.3, calories: 74, micros: { vitB6: 0.11, vitK: 4.7, vitB9: 6, calcium: 35, potassium: 232, magnesium: 17, manganese: 0.13 } },
  { id: 710, name: "Pomegranate - رمان", category: "Fruits", state: "per 100g", carbs: 19, protein: 1.7, fat: 1.2, calories: 83, micros: { vitC: 10.2, vitK: 16.4, vitB9: 38, vitB5: 0.38, vitE: 0.6, potassium: 236, magnesium: 12, phosphorus: 36, copper: 158 } },
  { id: 711, name: "Lemon - ليمون", category: "Fruits", state: "per 100g", carbs: 9, protein: 1.1, fat: 0.3, calories: 29, micros: { vitC: 53, vitB6: 0.08, vitB9: 11, calcium: 26, potassium: 138 } },
  { id: 712, name: "Pineapple - أناناس", category: "Fruits", state: "per 100g", carbs: 13, protein: 0.5, fat: 0.1, calories: 50, micros: { vitC: 47.8, vitB1: 0.08, vitB6: 0.11, vitB9: 18, manganese: 0.93, potassium: 109, magnesium: 12, copper: 110 } },
  { id: 713, name: "Peach - خوخ", category: "Fruits", state: "per 100g", carbs: 10, protein: 0.9, fat: 0.3, calories: 39, micros: { vitC: 6.6, vitA: 16, vitK: 2.6, vitE: 0.7, vitB3: 0.81, potassium: 190, magnesium: 9 } },
  { id: 714, name: "Pear - كمثرى", category: "Fruits", state: "per 100g", carbs: 15, protein: 0.4, fat: 0.1, calories: 57, micros: { vitC: 4.3, vitK: 4.4, vitB9: 7, copper: 82, potassium: 116 } },
  // ── PANTRY ────────────────────────────────────────────────────────────────
  { id: 801, name: "Vanilla Extract - فانيليا سائلة", category: "Pantry", state: "per 100g", carbs: 12.7, protein: 0.1, fat: 0.1, calories: 288 },
  { id: 802, name: "Vanilla Package - باكيت فانيليا", category: "Pantry", state: "per piece", carbs: 2, protein: 0, fat: 0, calories: 8 },
  { id: 803, name: "Baking Powder - بيكنج باودر", category: "Pantry", state: "per 100g", carbs: 27.7, protein: 0, fat: 0, calories: 53 },
  { id: 804, name: "Cornstarch - نشا ذرة", category: "Pantry", state: "per 100g", carbs: 91, protein: 0.3, fat: 0.1, calories: 381 },
  // ── SUPPLEMENTS ───────────────────────────────────────────────────────────
  { id: 901, name: "Whey Protein - بروتين مصل اللبن", category: "Supplements", state: "per 30g scoop", carbs: 3, protein: 24, fat: 1.5, calories: 120 },
  { id: 902, name: "Casein Protein - بروتين كازين", category: "Supplements", state: "per 30g scoop", carbs: 4, protein: 24, fat: 1, calories: 120 },
  { id: 903, name: "Plant Protein - بروتين نباتي", category: "Supplements", state: "per 30g scoop", carbs: 5, protein: 20, fat: 2, calories: 118 },
  { id: 904, name: "Mass Gainer - مكسب كتلة", category: "Supplements", state: "per 100g", carbs: 75, protein: 14, fat: 2, calories: 378 },
  { id: 905, name: "BCAA - أحماض أمينية", category: "Supplements", state: "per 10g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 906, name: "Creatine - كرياتين", category: "Supplements", state: "per 5g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 907, name: "Pre-Workout - ما قبل التمرين", category: "Supplements", state: "per serving", carbs: 5, protein: 0, fat: 0, calories: 20 },
  { id: 908, name: "Omega-3 - أوميغا 3", category: "Supplements", state: "per capsule", carbs: 0, protein: 0, fat: 1, calories: 9, micros: { omega3: 0.3 } },
  { id: 920, name: "Peak Man Multivitamin - بيك مان", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 921, name: "Centrum Multivitamin - سنتروم", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 922, name: "Vitastress - فيتاستريس", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 923, name: "L-Citrulline 5000mg - سيترولين", category: "Supplements", state: "per 5g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 924, name: "L-Carnitine Liquid 1500mg - كارنيتين سائل", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 925, name: "L-Carnitine 500mg tablet - كارنيتين أقراص", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 926, name: "Vitamin D3 - فيتامين د3", category: "Supplements", state: "per capsule", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 927, name: "Zinc - زنك", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 928, name: "Magnesium - مغنيسيوم", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 929, name: "Iron - حديد", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 930, name: "Vitamin C 1000mg - فيتامين ج", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 931, name: "B-Complex - فيتامين ب مركب", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 932, name: "Melatonin 5mg - ميلاتونين", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 933, name: "Collagen - كولاجين", category: "Supplements", state: "per 10g scoop", carbs: 0, protein: 9, fat: 0, calories: 36 },
  { id: 941, name: "Multivitamins - فيتامينات متعددة", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 942, name: "Omega-3 Fish Oil - أوميجا 3", category: "Supplements", state: "per serving", carbs: 0, protein: 0, fat: 1.0, calories: 9, micros: { omega3: 0.5 } },
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
  { id: 962, name: "Diet Sugar / Splenda - سكر دايت", category: "Sweeteners", state: "per bag (1g)", carbs: 1, protein: 0, fat: 0, calories: 0 },
  { id: 963, name: "Erythritol - إيريثريتول", category: "Sweeteners", state: "per 100g", carbs: 100, protein: 0, fat: 0, calories: 20 },
  { id: 964, name: "White Sugar - سكر أبيض", category: "Sweeteners", state: "per 100g", carbs: 100, protein: 0, fat: 0, calories: 387 },
  // ── SOFT DRINKS ───────────────────────────────────────────────────────────
  { id: 971, name: "Diet Pepsi - بيبسي دايت", category: "Beverages", state: "per 330ml can", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 972, name: "Diet Coke - كوكا كولا زيرو", category: "Beverages", state: "per 330ml can", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 973, name: "Water - مياه", category: "Beverages", state: "per 250ml glass", carbs: 0, protein: 0, fat: 0, calories: 0 },
  // ── RAW / UNCOOKED ────────────────────────────────────────────────────────
  { id: 1001, name: "Raw Chicken Breast (uncooked) - صدر دجاج نيء", category: "Raw", state: "per 100g raw", carbs: 0, protein: 23, fat: 2.6, calories: 120 },
  { id: 1002, name: "Raw Chicken Thigh (uncooked) - فخذ دجاج نيء", category: "Raw", state: "per 100g raw", carbs: 0, protein: 19, fat: 8, calories: 153 },
  { id: 1003, name: "Raw Ground Beef (uncooked) - لحم مفروم نيء", category: "Raw", state: "per 100g raw", carbs: 0, protein: 20, fat: 10, calories: 176 },
  { id: 1004, name: "Raw White Rice (dry) - أرز أبيض جاف", category: "Raw", state: "per 100g dry", carbs: 78, protein: 6.5, fat: 0.5, calories: 350 },
  { id: 1005, name: "Raw Brown Rice (dry) - أرز بني جاف", category: "Raw", state: "per 100g dry", carbs: 76, protein: 7.5, fat: 2.5, calories: 370 },
  { id: 1006, name: "Raw Oats (dry) - شوفان جاف", category: "Raw", state: "per 100g dry", carbs: 66, protein: 17, fat: 7, calories: 389 },
  { id: 1007, name: "Raw Potato (uncooked) - بطاطس نية", category: "Raw", state: "per 100g raw", carbs: 17, protein: 2, fat: 0.1, calories: 77 },
  { id: 1008, name: "Raw Sweet Potato - بطاطا حلوة نية", category: "Raw", state: "per 100g raw", carbs: 20, protein: 1.6, fat: 0.1, calories: 86 },
  { id: 1009, name: "Raw Pasta (dry) - مكرونة جافة", category: "Raw", state: "per 100g dry", carbs: 74, protein: 13, fat: 1.5, calories: 357 },
  { id: 1010, name: "Raw Lentils (dry) - عدس جاف", category: "Raw", state: "per 100g dry", carbs: 63, protein: 26, fat: 1, calories: 353 },
  // ── EGYPTIAN DISHES ───────────────────────────────────────────────────────
  { id: 1101, name: "Egyptian Lentil Soup - شوربة عدس مصرية", category: "Egyptian", state: "per 100g", carbs: 11, protein: 4, fat: 1.5, calories: 76 },
  { id: 1102, name: "Baked Falafel - فلافل بالفرن", category: "Egyptian", state: "per piece (~30g)", carbs: 6, protein: 2.5, fat: 1.5, calories: 48 },
  { id: 1103, name: "Ful Medames - فول مدمس", category: "Egyptian", state: "per 100g", carbs: 26, protein: 8, fat: 0.5, calories: 110 },
  { id: 1104, name: "Koshari - كشري", category: "Egyptian", state: "per 100g", carbs: 23, protein: 4, fat: 2, calories: 126 },
  { id: 1105, name: "Hawawshi (lean) - حواوشي هش", category: "Egyptian", state: "per 100g", carbs: 18, protein: 14, fat: 8, calories: 200 },
  { id: 1106, name: "Molokhia with Chicken - ملوخية بالدجاج", category: "Egyptian", state: "per 100g", carbs: 4, protein: 8, fat: 3, calories: 75 },
  { id: 1107, name: "Grilled Kofta - كفتة مشوية", category: "Egyptian", state: "per 100g", carbs: 5, protein: 18, fat: 8, calories: 164 },
  { id: 1108, name: "Mahshi Kousa - محشي كوسة", category: "Egyptian", state: "per 100g", carbs: 14, protein: 5, fat: 3, calories: 103 },
  { id: 1109, name: "Baladi Bread (Large) - عيش بلدي كبير", category: "Egyptian", state: "per piece (~120g)", carbs: 62, protein: 10, fat: 1.8, calories: 304 },
  { id: 1110, name: "Rusks / Biscotti - بقسماط", category: "Egyptian", state: "per piece (~10g)", carbs: 7.5, protein: 0.8, fat: 0.5, calories: 38 },
  { id: 1110, name: "Taamiya (falafel) fried - طعمية مقلية", category: "Egyptian", state: "per piece (~20g)", carbs: 7, protein: 2, fat: 3, calories: 63 },
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
  // health profile
  gender: "male" | "female";
  age: number;
  isTraining: boolean;
  isPregnant: boolean;
  pregnancyMonth: number; // 1-9
  isLactating: boolean;
  diseases: string;      // free text, comma-separated
  allergies: string;     // free text
  foodDislikes: string;  // free text
}

// ─── MICRONUTRIENT TYPES ──────────────────────────────────────────────────────
interface MicroNutrient {
  key: string; name: string; unit: string; category: "Vitamins" | "Minerals" | "Fatty Acids";
}

const MICROS: MicroNutrient[] = [
  // Vitamins
  { key: "vitA",  name: "Vitamin A",          unit: "μg RAE", category: "Vitamins" },
  { key: "vitC",  name: "Vitamin C",          unit: "mg",     category: "Vitamins" },
  { key: "vitD",  name: "Vitamin D",          unit: "μg",     category: "Vitamins" },
  { key: "vitE",  name: "Vitamin E",          unit: "mg",     category: "Vitamins" },
  { key: "vitK",  name: "Vitamin K",          unit: "μg",     category: "Vitamins" },
  { key: "vitB1", name: "Vitamin B1 (Thiamine)", unit: "mg",  category: "Vitamins" },
  { key: "vitB2", name: "Vitamin B2 (Riboflavin)", unit: "mg",category: "Vitamins" },
  { key: "vitB3", name: "Vitamin B3 (Niacin)", unit: "mg",   category: "Vitamins" },
  { key: "vitB5", name: "Vitamin B5 (Pantothenic)", unit: "mg", category: "Vitamins" },
  { key: "vitB6", name: "Vitamin B6",         unit: "mg",     category: "Vitamins" },
  { key: "vitB7", name: "Vitamin B7 (Biotin)", unit: "μg",   category: "Vitamins" },
  { key: "vitB9", name: "Folate (B9)",        unit: "μg DFE", category: "Vitamins" },
  { key: "vitB12",name: "Vitamin B12",        unit: "μg",     category: "Vitamins" },
  // Minerals
  { key: "calcium",  name: "Calcium",         unit: "mg",     category: "Minerals" },
  { key: "iron",     name: "Iron",            unit: "mg",     category: "Minerals" },
  { key: "magnesium",name: "Magnesium",       unit: "mg",     category: "Minerals" },
  { key: "zinc",     name: "Zinc",            unit: "mg",     category: "Minerals" },
  { key: "potassium",name: "Potassium",       unit: "mg",     category: "Minerals" },
  { key: "sodium",   name: "Sodium",          unit: "mg",     category: "Minerals" },
  { key: "phosphorus",name:"Phosphorus",      unit: "mg",     category: "Minerals" },
  { key: "selenium", name: "Selenium",        unit: "μg",     category: "Minerals" },
  { key: "iodine",   name: "Iodine",          unit: "μg",     category: "Minerals" },
  { key: "zinc",     name: "Zinc",            unit: "mg",     category: "Minerals" },
  { key: "copper",   name: "Copper",          unit: "μg",     category: "Minerals" },
  { key: "manganese",name: "Manganese",       unit: "mg",     category: "Minerals" },
  { key: "chromium", name: "Chromium",        unit: "μg",     category: "Minerals" },
  // Fatty Acids & Fiber
  { key: "fiber",       name: "Fiber",          unit: "g",  category: "Fatty Acids" },
  { key: "omega3",      name: "Omega-3",         unit: "g",  category: "Fatty Acids" },
  { key: "omega6",      name: "Omega-6",         unit: "g",  category: "Fatty Acids" },
  { key: "saturatedFat",name: "Saturated Fat",   unit: "g",  category: "Fatty Acids" },
];
// dedupe
const MICROS_LIST = MICROS.filter((m, i) => MICROS.findIndex(x => x.key === m.key) === i);

/**
 * getRDI — returns daily recommended intake based on client profile.
 * Sources: NIH DRI (2020), ISSA CPT/CSCS, NASM CPT, American Dietetic Assoc.
 * Training multipliers: ISSA ch.12, NASM ch.9 "Nutrition for Performance"
 */
function getRDI(profile: { gender: "male"|"female"; age: number; isTraining: boolean; isPregnant: boolean; pregnancyMonth: number; isLactating: boolean }) {
  const { gender, age, isTraining, isPregnant, pregnancyMonth, isLactating } = profile;
  const m = gender === "male";
  const tri = pregnancyMonth <= 3 ? 1 : pregnancyMonth <= 6 ? 2 : 3;
  const train = isTraining ? 1 : 0;

  // Base values (non-pregnant adult, NIH DRI 2020)
  // Format: [male_19_30, male_31_50, male_51+, female_19_30, female_31_50, female_51+]
  const ageIdx = age < 31 ? 0 : age < 51 ? 1 : 2;
  const base = (mVals: number[], fVals: number[]) => (m ? mVals : fVals)[ageIdx];

  const rdi: Record<string, number> = {
    vitA:   base([900,900,900],[700,700,700]),
    vitC:   base([90,90,90],[75,75,75]) + (train ? 35 : 0), // ISSA: +35mg for athletes
    vitD:   base([15,15,20],[15,15,20]),   // μg; NIH 2020 (600-800 IU)
    vitE:   15,
    vitK:   base([120,120,120],[90,90,90]),
    vitB1:  base([1.2,1.2,1.2],[1.1,1.1,1.1]) + (train ? 0.1 : 0),
    vitB2:  base([1.3,1.3,1.3],[1.1,1.1,1.1]) + (train ? 0.15 : 0),
    vitB3:  base([16,16,16],[14,14,14])   + (train ? 2 : 0),
    vitB5:  5,
    vitB6:  base([1.3,1.3,1.7],[1.3,1.3,1.5]),
    vitB7:  30,
    vitB9:  400,
    vitB12: 2.4,
    calcium: base([1000,1000,1200],[1000,1000,1200]),
    iron:    base([8,8,8],[18,18,8])      * (isTraining && !m ? 1.3 : 1), // ISSA: female athletes +30%
    magnesium: base([400,420,420],[310,320,320]) * (train ? 1.2 : 1), // NASM/ISSA: athletes ~20% more
    zinc:    base([11,11,11],[8,8,8])     + (train ? 1.5 : 0),
    potassium: 3400,
    sodium:  2300,
    phosphorus: 700,
    selenium: 55,
    iodine:  150,
    copper:  900,
    manganese: base([2.3,2.3,2.3],[1.8,1.8,1.8]),
    chromium: base([35,35,30],[25,25,20]),
    // Fatty Acids & Fiber (AI / recommended values)
    fiber: base([38,38,30],[25,25,21]),         // g/day — AI (Adequate Intake), DRI 2002
    omega3: 1.6,                                 // g/day ALA — AI; EPA+DHA ~0.5g extra for athletes
    omega6: 17,                                  // g/day LA — AI
    saturatedFat: 20,                            // g/day — WHO: ≤10% of 2000 kcal
  };

  // Pregnancy adjustments (NIH DRI, ACOG guidelines)
  if (isPregnant) {
    rdi.vitA   = tri === 3 ? 770 : 770;
    rdi.vitC   = 85;
    rdi.vitD   = 15;
    rdi.vitB1  = 1.4;
    rdi.vitB2  = 1.4;
    rdi.vitB3  = 18;
    rdi.vitB6  = 1.9;
    rdi.vitB9  = 600; // CRITICAL for neural tube
    rdi.vitB12 = 2.6;
    rdi.calcium = 1000;
    rdi.iron    = 27; // ACOG
    rdi.magnesium = tri === 1 ? 350 : 360;
    rdi.zinc    = 11;
    rdi.iodine  = 220;
    rdi.selenium = 60;
    rdi.chromium = 30;
  }

  // Lactating adjustments
  if (isLactating) {
    rdi.vitA   = 1300;
    rdi.vitC   = 120;
    rdi.vitB1  = 1.4;
    rdi.vitB2  = 1.6;
    rdi.vitB3  = 17;
    rdi.vitB6  = 2.0;
    rdi.vitB9  = 500;
    rdi.vitB12 = 2.8;
    rdi.iron   = 9;
    rdi.iodine = 290;
    rdi.selenium = 70;
    rdi.zinc   = 12;
  }

  return rdi;
}

interface CustomRecipe {
  id: number; name: string; category: string; notes: string;
  serves: number;
  ingredients: { foodId: number; isCustom?: boolean; grams: number }[];
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

function isPerPiece(state: string) {
  return state === "per piece" || state.startsWith("per piece") ||
    state === "per serving" || state.startsWith("per serving") ||
    state === "per tablet" || state.startsWith("per tablet") ||
    state.startsWith("per cup") || state.startsWith("per shot") ||
    state.startsWith("per packet") || state.startsWith("per bag") ||
    state.startsWith("per teaspoon") || state.startsWith("per scoop") ||
    state.startsWith("per capsule") || state.startsWith("per sachet");
}

/** Returns a short unit label and sensible quick-pick values for a food state string */
function getUnitInfo(state: string): { label: string; picks: number[] } {
  if (state.startsWith("per cup"))      return { label: "cup",    picks: [1, 2, 3, 4] };
  if (state.startsWith("per shot"))     return { label: "shot",   picks: [1, 2, 3, 4] };
  if (state.startsWith("per serving"))  return { label: "srv",    picks: [1, 2, 3, 4] };
  if (state.startsWith("per tablet"))   return { label: "tab",    picks: [1, 2, 3, 4] };
  if (state.startsWith("per capsule"))  return { label: "cap",    picks: [1, 2, 3, 4] };
  if (state.startsWith("per packet"))   return { label: "pkt",    picks: [1, 2, 3, 4] };
  if (state.startsWith("per bag"))      return { label: "bag",    picks: [1, 2, 3, 4] };
  if (state.startsWith("per sachet"))   return { label: "sachet", picks: [1, 2, 3, 4] };
  if (state.startsWith("per teaspoon")) return { label: "tsp",    picks: [1, 2, 3, 4] };
  if (state.startsWith("per scoop"))    return { label: "scoop",  picks: [1, 2, 3, 4] };
  if (state.startsWith("per piece"))    return { label: "×",      picks: [1, 2, 3, 4] };
  if (state.includes("100ml"))          return { label: "ml",     picks: [50, 100, 150, 200] };
  return { label: "g", picks: [50, 100, 150, 200] };
}

function calcMacros(item: FoodItem) {
  const r = isPerPiece(item.state) ? item.grams : item.grams / 100;
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
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1">
          <input
            type="number" min="0" step={isPerPiece(item.state) ? "1" : item.state.includes("100ml") ? "10" : "5"}
            value={item.grams}
            onChange={e => onGramsChange(+e.target.value)}
            className="w-14 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 px-1 py-0.5 text-xs"
          />
          <span className="text-xs text-gray-500">{getUnitInfo(item.state).label}</span>
        </div>
        <div className="flex gap-0.5">
          {getUnitInfo(item.state).picks.map(g => (
            <button key={g} onClick={() => onGramsChange(g)}
              className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors ${item.grams === g ? "bg-teal-600 text-white border-teal-600" : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-teal-500 hover:text-teal-600"}`}>
              {g}
            </button>
          ))}
        </div>
      </div>
      <button onClick={onRemove} className="text-red-400 hover:text-red-600 self-start mt-1"><Trash2 size={14} /></button>
    </div>
  );
}

// ─── MEAL CARD ─────────────────────────────────────────────────────────────────
function MealCard({ meal, onUpdate, onDelete, onDuplicate, lang, extraFoods, dragHandleProps }: {
  meal: Meal; onUpdate: (m: Meal) => void; onDelete: () => void; onDuplicate: () => void;
  lang: "ar" | "en" | "both"; extraFoods: FoodEntry[]; dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<number>>(new Set());
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customForm, setCustomForm] = useState({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0, grams: 100, fiber: 0, saturatedFat: 0, omega3: 0, omega6: 0 });
  const allFoods = [...FOOD_DATABASE, ...extraFoods];
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );
  const totals = mealTotals(meal);

  const allCategories = Array.from(new Set(allFoods.map(f => f.category)));
  const filtered = allFoods.filter(f => {
    const q = normalizeAr(search);
    const matchQ = !q || normalizeAr(f.name).includes(q);
    const matchC = selectedCat === "All" || f.category === selectedCat;
    return matchQ && matchC;
  });
  // recent foods: last 8 unique food ids added to this meal
  const recentIds = meal.items.slice(-8).map(i => i.id).filter((v, i, a) => a.indexOf(v) === i).reverse();
  const recentFoods = recentIds.map(id => allFoods.find(f => f.id === id)).filter(Boolean) as FoodEntry[];

  function addItem(food: FoodEntry) {
    const defaultGrams = isPerPiece(food.state) ? 1 : 100;
    const newItem: FoodItem = { ...food, grams: defaultGrams, instId: `${food.id}-${Date.now()}-${Math.random()}` };
    onUpdate({ ...meal, items: [...meal.items, newItem] });
    setSearch("");
  }
  function addSelectedItems() {
    const toAdd = allFoods.filter(f => selectedFoodIds.has(f.id));
    const newItems: FoodItem[] = toAdd.map(food => ({
      ...food, grams: isPerPiece(food.state) ? 1 : 100,
      instId: `${food.id}-${Date.now()}-${Math.random()}`
    }));
    onUpdate({ ...meal, items: [...meal.items, ...newItems] });
    setSelectedFoodIds(new Set());
    setSearch("");
  }
  function toggleFoodSelect(id: number) {
    setSelectedFoodIds(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function addCustomFoodToMeal() {
    if (!customForm.name.trim()) return;
    const tempId = 90000 + Date.now() % 10000;
    const micros: Record<string, number> = {};
    if (customForm.fiber) micros.fiber = customForm.fiber;
    if (customForm.saturatedFat) micros.saturatedFat = customForm.saturatedFat;
    if (customForm.omega3) micros.omega3 = customForm.omega3;
    if (customForm.omega6) micros.omega6 = customForm.omega6;
    const newItem: FoodItem = {
      id: tempId, name: customForm.name, category: "Custom", state: "custom",
      carbs: customForm.carbs, protein: customForm.protein, fat: customForm.fat,
      calories: customForm.calories || Math.round(customForm.protein * 4 + customForm.carbs * 4 + customForm.fat * 9),
      ...(Object.keys(micros).length > 0 ? { micros } : {}),
      grams: customForm.grams, instId: `custom-${Date.now()}-${Math.random()}`
    };
    onUpdate({ ...meal, items: [...meal.items, newItem] });
    setCustomForm({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0, grams: 100, fiber: 0, saturatedFat: 0, omega3: 0, omega6: 0 });
    setShowCustomForm(false);
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
        <span {...dragHandleProps} className="text-gray-400 hover:text-gray-600 cursor-grab touch-none select-none print:hidden" title="Drag to reorder">
          <GripVertical size={16} />
        </span>
        <input
          value={meal.name}
          onChange={e => onUpdate({ ...meal, name: e.target.value })}
          className="flex-1 font-semibold bg-transparent border-none outline-none text-sm"
          placeholder="Meal name..."
        />
        <div className="flex gap-3 text-xs text-gray-500 print:hidden">
          <span className="text-yellow-600 font-medium">{totals.carbs.toFixed(0)}<span className="opacity-60 ml-0.5">C</span></span>
          <span className="text-blue-600 font-medium">{totals.protein.toFixed(0)}<span className="opacity-60 ml-0.5">P</span></span>
          <span className="text-red-500 font-medium">{totals.fat.toFixed(0)}<span className="opacity-60 ml-0.5">F</span></span>
          <span className="font-bold text-gray-700 dark:text-gray-200">{totals.calories.toFixed(0)}<span className="opacity-60 ml-0.5 font-normal">kcal</span></span>
        </div>
        <button title="Duplicate meal" onClick={onDuplicate} className="text-gray-400 hover:text-blue-500 print:hidden"><Copy size={14} /></button>
        <button title="Clear all items" onClick={() => onUpdate({ ...meal, items: [] })} className="text-gray-400 hover:text-orange-500 print:hidden"><Minus size={14} /></button>
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
            className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-800 resize-none print:hidden"
          />
          {meal.notes && (
            <div className="hidden print:block text-xs text-gray-700 bg-amber-50 border-r-4 border-amber-400 px-3 py-2 whitespace-pre-wrap" style={{ fontStyle: "italic" }}>
              📝 {meal.notes}
            </div>
          )}
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
          {/* add food - multi select */}
          <div className="print:hidden space-y-2">
            {/* recent foods chips */}
            {!search && recentFoods.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-gray-400 self-center">أخيراً:</span>
                {recentFoods.slice(0, 5).map(f => (
                  <button key={f.id} onClick={() => addItem(f)}
                    className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-blue-100 dark:hover:bg-blue-900/40 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600 truncate max-w-[120px]">
                    {displayName(f.name, lang)}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-1">
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 ابحث عن أكل..." className="flex-1 text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800" />
              <select value={selectedCat} onChange={e => setSelectedCat(e.target.value)} className="text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-1 py-1 bg-white dark:bg-gray-800">
                <option value="All">الكل</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <button onClick={() => setShowCustomForm(!showCustomForm)} title="Add custom food"
                className={cn("text-xs px-2 py-1 rounded-lg border font-bold transition-colors", showCustomForm ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 dark:border-gray-600 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/30")}>
                ✚
              </button>
            </div>
            {/* custom food inline form */}
            {showCustomForm && (
              <div className="border border-purple-200 dark:border-purple-800 rounded-xl bg-purple-50 dark:bg-purple-900/20 p-3 space-y-2">
                <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">➕ إضافة أكل مخصص</p>
                <input value={customForm.name} onChange={e => setCustomForm(p => ({ ...p, name: e.target.value }))} placeholder="اسم الأكل..." className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 bg-white dark:bg-gray-800" />
                <div className="grid grid-cols-3 gap-1">
                  {(["calories","protein","carbs","fat","grams"] as const).map(k => (
                    <div key={k}>
                      <label className="text-xs text-gray-500 capitalize">{k === "grams" ? "الوزن (g)" : k}</label>
                      <input type="number" value={customForm[k] || ""} onChange={e => setCustomForm(p => ({ ...p, [k]: +e.target.value }))} className="w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {([["fiber","Fiber (g)"],["saturatedFat","Sat. Fat (g/100g)"],["omega3","Omega-3 (g)"],["omega6","Omega-6 (g)"]] as const).map(([k, lbl]) => (
                    <div key={k}>
                      <label className="text-xs text-gray-400">{lbl}</label>
                      <input type="number" step="0.01" value={(customForm as unknown as Record<string,number>)[k] || ""} onChange={e => setCustomForm(p => ({ ...p, [k]: +e.target.value }))} className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded px-1 py-1 bg-white dark:bg-gray-800" />
                    </div>
                  ))}
                </div>
                <div className="flex gap-1 justify-end">
                  <button onClick={() => setShowCustomForm(false)} className="text-xs text-gray-500 px-3 py-1 hover:text-gray-700">إلغاء</button>
                  <button onClick={addCustomFoodToMeal} className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 font-semibold">إضافة ✓</button>
                </div>
              </div>
            )}
            {(search || selectedCat !== "All") && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
                <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                  {filtered.length === 0 && <p className="text-xs text-gray-400 text-center py-3">لا توجد نتائج</p>}
                  {filtered.slice(0, 25).map(f => (
                    <label key={f.id} className={cn("flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30", selectedFoodIds.has(f.id) && "bg-blue-50 dark:bg-blue-900/30")}>
                      <input type="checkbox" checked={selectedFoodIds.has(f.id)} onChange={() => toggleFoodSelect(f.id)} className="accent-blue-600" />
                      <span className="flex-1">{displayName(f.name, lang)}</span>
                      <span className="text-gray-400 text-xs">{f.state}</span>
                      <button onClick={e => { e.preventDefault(); addItem(f); }} className="text-blue-500 hover:text-blue-700 font-bold px-1 text-base leading-none">+</button>
                    </label>
                  ))}
                </div>
                {selectedFoodIds.size > 0 && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between">
                    <span className="text-xs text-blue-700 dark:text-blue-300">{selectedFoodIds.size} محدد</span>
                    <div className="flex gap-1">
                      <button onClick={() => setSelectedFoodIds(new Set())} className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1">مسح</button>
                      <button onClick={addSelectedItems} className="text-xs bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 font-semibold">إضافة الكل ✓</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── RECIPE BUILDER COMPONENT ────────────────────────────────────────────────
interface RecipeBuilderProps {
  allFoods: FoodEntry[];
  customRecipes: CustomRecipe[];
  setCustomRecipes: React.Dispatch<React.SetStateAction<CustomRecipe[]>>;
  onAddAsMeal: (r: CustomRecipe) => void;
  onClose: () => void;
}
function RecipeBuilder({ allFoods, customRecipes, setCustomRecipes, onAddAsMeal, onClose }: RecipeBuilderProps) {
  const [rbName, setRbName] = useState("");
  const [rbCategory, setRbCategory] = useState("Meal");
  const [rbNotes, setRbNotes] = useState("");
  const [rbServes, setRbServes] = useState(1);
  const [rbIngredients, setRbIngredients] = useState<{ foodId: number; grams: number }[]>([]);
  const [rbSearch, setRbSearch] = useState("");
  const [editId, setEditId] = useState<number | null>(null);

  function loadForEdit(r: CustomRecipe) {
    setEditId(r.id); setRbName(r.name); setRbCategory(r.category);
    setRbNotes(r.notes); setRbServes(r.serves);
    setRbIngredients(r.ingredients.map(i => ({ foodId: i.foodId, grams: i.grams })));
  }
  function clearForm() {
    setEditId(null); setRbName(""); setRbCategory("Meal"); setRbNotes(""); setRbServes(1); setRbIngredients([]);
  }
  function saveRecipe() {
    if (!rbName.trim() || rbIngredients.length === 0) return;
    const recipe: CustomRecipe = { id: editId || Date.now(), name: rbName, category: rbCategory, notes: rbNotes, serves: rbServes, ingredients: rbIngredients };
    setCustomRecipes(prev => {
      const next = editId ? prev.map(r => r.id === editId ? recipe : r) : [...prev, recipe];
      localStorage.setItem("custom_recipes_v1", JSON.stringify(next));
      return next;
    });
    clearForm();
  }
  function deleteRecipe(id: number) {
    setCustomRecipes(prev => { const next = prev.filter(r => r.id !== id); localStorage.setItem("custom_recipes_v1", JSON.stringify(next)); return next; });
  }

  const rbTotals = rbIngredients.reduce((acc, ing) => {
    const fd = allFoods.find(f => f.id === ing.foodId);
    if (!fd) return acc;
    const mult = isPerPiece(fd.state) ? ing.grams : ing.grams / 100;
    return { calories: acc.calories + fd.calories * mult, protein: acc.protein + fd.protein * mult, carbs: acc.carbs + fd.carbs * mult, fat: acc.fat + fd.fat * mult };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const rbSearched = rbSearch.trim().length > 1
    ? allFoods.filter(f => f.name.toLowerCase().includes(rbSearch.toLowerCase()) || normalizeAr(f.name).includes(normalizeAr(rbSearch)))
    : [];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4 border-2 border-purple-100 dark:border-purple-900">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base flex items-center gap-2">
          <UtensilsCrossed size={16} className="text-purple-600" />
          Recipe Builder - منشئ الوصفات
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>

      {/* saved recipes list */}
      {customRecipes.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Saved Recipes ({customRecipes.length})</div>
          {customRecipes.map(r => {
            const rTotals = r.ingredients.reduce((acc, ing) => {
              const fd = allFoods.find(f => f.id === ing.foodId);
              if (!fd) return acc;
              const mult = isPerPiece(fd.state) ? ing.grams : ing.grams / 100;
              return { calories: acc.calories + fd.calories * mult, protein: acc.protein + fd.protein * mult };
            }, { calories: 0, protein: 0 });
            return (
              <div key={r.id} className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/30 rounded-xl px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{r.name}</div>
                  <div className="text-xs text-gray-400">
                    {r.ingredients.length} ingredients · {(rTotals.calories / r.serves).toFixed(0)} kcal · {(rTotals.protein / r.serves).toFixed(0)}g P per serving
                  </div>
                </div>
                <div className="flex gap-1 shrink-0 ml-2">
                  <button onClick={() => onAddAsMeal(r)} className="text-xs bg-teal-600 text-white px-2 py-1 rounded-lg hover:bg-teal-700">+ Meal</button>
                  <button onClick={() => loadForEdit(r)} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">Edit</button>
                  <button onClick={() => deleteRecipe(r.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* builder form */}
      <div className="space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {editId ? "✏️ Editing Recipe" : "New Recipe"}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <input value={rbName} onChange={e => setRbName(e.target.value)} placeholder="Recipe name..."
            className="col-span-2 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800" />
          <div>
            <label className="text-xs text-gray-500">Category</label>
            <input value={rbCategory} onChange={e => setRbCategory(e.target.value)} placeholder="Meal / Snack / Breakfast..."
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Servings</label>
            <input type="number" min="1" value={rbServes} onChange={e => setRbServes(Math.max(1, +e.target.value))}
              className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
          </div>
          <textarea value={rbNotes} onChange={e => setRbNotes(e.target.value)} placeholder="Prep instructions / notes..." rows={2}
            className="col-span-2 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 resize-none" />
        </div>

        {/* ingredient search */}
        <div className="relative">
          <label className="text-xs text-gray-500">Search &amp; add ingredient</label>
          <input value={rbSearch} onChange={e => setRbSearch(e.target.value)} placeholder="Type food name..."
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
          {rbSearched.length > 0 && (
            <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg max-h-40 overflow-y-auto bg-white dark:bg-gray-800 shadow z-10">
              {rbSearched.slice(0, 8).map(f => (
                <button key={f.id}
                  onClick={() => {
                    if (!rbIngredients.find(i => i.foodId === f.id))
                      setRbIngredients(p => [...p, { foodId: f.id, grams: isPerPiece(f.state) ? 1 : 100 }]);
                    setRbSearch("");
                  }}
                  className="w-full text-left px-3 py-1.5 text-xs hover:bg-purple-50 dark:hover:bg-purple-950/30 border-b border-gray-100 dark:border-gray-700 last:border-0 flex justify-between items-center">
                  <span className="font-medium">{f.name.split(" - ")[0]}</span>
                  <span className="text-gray-400 text-[10px]">{f.category} · {f.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ingredient list */}
        {rbIngredients.length > 0 && (
          <div className="space-y-1">
            <div className="text-xs text-gray-500 font-semibold">Ingredients ({rbIngredients.length})</div>
            {rbIngredients.map((ing, idx) => {
              const fd = allFoods.find(f => f.id === ing.foodId);
              if (!fd) return null;
              const mult = isPerPiece(fd.state) ? ing.grams : ing.grams / 100;
              const kcal = (fd.calories * mult).toFixed(0);
              return (
                <div key={ing.foodId} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1.5">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{fd.name.split(" - ")[0]}</div>
                    <div className="text-xs text-gray-400">{kcal} kcal · {(fd.protein * mult).toFixed(1)}g P</div>
                  </div>
                  <input type="number" min="0" step={isPerPiece(fd.state) ? "1" : "5"} value={ing.grams}
                    onChange={e => setRbIngredients(p => p.map((x, i) => i === idx ? { ...x, grams: +e.target.value } : x))}
                    className="w-14 text-xs text-center border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700" />
                  <span className="text-xs text-gray-400 w-5">{isPerPiece(fd.state) ? "pcs" : "g"}</span>
                  {!isPerPiece(fd.state) && (
                    <div className="flex gap-0.5">
                      {[50, 100, 150, 200].map(g => (
                        <button key={g} onClick={() => setRbIngredients(p => p.map((x, i) => i === idx ? { ...x, grams: g } : x))}
                          className={`text-[10px] px-1 py-0.5 rounded border ${ing.grams === g ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-purple-500 hover:text-purple-600"}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  )}
                  <button onClick={() => setRbIngredients(p => p.filter((_, i) => i !== idx))} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={13} /></button>
                </div>
              );
            })}
            {/* macro totals */}
            <div className="flex flex-wrap gap-3 text-xs bg-purple-50 dark:bg-purple-950/30 rounded-lg px-3 py-2 font-medium">
              <span>Total: <b>{rbTotals.calories.toFixed(0)} kcal</b></span>
              <span className="text-blue-600">{rbTotals.protein.toFixed(1)}g P</span>
              <span className="text-yellow-600">{rbTotals.carbs.toFixed(1)}g C</span>
              <span className="text-red-500">{rbTotals.fat.toFixed(1)}g F</span>
              {rbServes > 1 && (
                <span className="text-gray-400">· per serving: <b>{(rbTotals.calories / rbServes).toFixed(0)}</b> kcal / {(rbTotals.protein / rbServes).toFixed(1)}g P</span>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button onClick={saveRecipe} disabled={!rbName.trim() || rbIngredients.length === 0}
            className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            {editId ? "Update Recipe ✓" : "Save Recipe ✓"}
          </button>
          {editId && (
            <button onClick={clearForm} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MealPlanner() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<"planner" | "calculator" | "clients" | "micros">("planner");
  const [microsClientId, setMicrosClientId] = useState<number | null>(null);
  const [lang, setLang] = useState<"ar" | "en" | "both">("both");
  const [printLang, setPrintLang] = useState<"ar" | "en" | "both">("en");
  const [copyLang, setCopyLang] = useState<"ar" | "en" | "both">("both");
  const [meals, setMeals] = useState<Meal[]>([{ id: "m1", name: "Meal 1 - وجبة 1", notes: "", items: [] }]);
  const [targetMacros, setTargetMacros] = useState<TargetMacros>({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const [planNotes, setPlanNotes] = useState("");
  const [planClientName, setPlanClientName] = useState("");
  const [planGoal, setPlanGoal] = useState("تنشيف");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [planWaterGoal, setPlanWaterGoal] = useState(2);
  const [coachName, setCoachName] = useState("C/ Mohamed Saed");
  const [coachPhone, setCoachPhone] = useState("01022816320");
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
  // Custom foods & recipes
  const [customFoods, setCustomFoods] = useState<FoodEntry[]>(() => {
    try { const s = localStorage.getItem("custom_foods_v1"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>(() => {
    try { const s = localStorage.getItem("custom_recipes_v1"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false);
  // Micronutrient manual overrides: clientId → { key → value }
  const [microOverrides, setMicroOverrides] = useState<Record<number, Record<string, number>>>({});
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
    const isAr = l !== "en";
    let txt = "";
    // Header
    txt += `🌟 *${isAr ? "نظامك الغذائي المخصص - MSR Nutrition" : "Your Custom Nutrition Plan - MSR Nutrition"}* 🌟\n\n`;
    if (planClientName) txt += `👤 ${isAr ? "العميل" : "Client"}: ${planClientName}\n`;
    if (planGoal) txt += `🎯 ${isAr ? "الهدف" : "Goal"}: ${planGoal}\n`;
    txt += `📅 ${isAr ? "التاريخ" : "Date"}: ${planDate}\n\n`;
    // Meals
    const mealEmojis = ["🍳","🥗","🍽️","🥙","🥘","🫕","🍱","🥣"];
    meals.forEach((meal, i) => {
      txt += `*${mealEmojis[i % mealEmojis.length]} ${displayName(meal.name, l)}*\n`;
      meal.items.forEach(item => {
        const unit = isPerPiece(item.state) ? (item.grams === 1 ? "حبة" : `${item.grams} حبات`) : `${item.grams}g`;
        txt += `🔸 ${displayName(item.name, l)}: ${unit}\n`;
      });
      if (meal.notes) txt += `📝 _${isAr ? "ملاحظة" : "Note"}: ${meal.notes}_\n`;
      const t = mealTotals(meal);
      txt += `⚡ ${isAr ? "سعرات الوجبة" : "Meal kcal"}: ${t.calories.toFixed(0)} kcal\n\n`;
    });
    // Totals
    txt += `*📊 ${isAr ? "إجمالي الماكروز لليوم" : "Daily Macro Totals"}:*\n`;
    txt += `🔥 ${isAr ? "السعرات" : "Calories"}: ${totals.calories.toFixed(0)} kcal\n`;
    txt += `💪 ${isAr ? "البروتين" : "Protein"}: ${totals.protein.toFixed(1)}g\n`;
    txt += `🍞 ${isAr ? "الكارب" : "Carbs"}: ${totals.carbs.toFixed(1)}g\n`;
    txt += `🥑 ${isAr ? "الدهون" : "Fats"}: ${totals.fat.toFixed(1)}g\n`;
    txt += `💧 ${isAr ? "هدف الماء" : "Water Goal"}: ${planWaterGoal}L\n\n`;
    // Notes
    if (planNotes) {
      txt += `*💡 ${isAr ? "تعليمات هامة" : "Important Notes"}:*\n${planNotes}\n\n`;
    }
    // Footer
    txt += `💪 ${isAr ? "مع تحيات" : "Best regards"}: ${coachName}\n`;
    txt += `📞 ${isAr ? "للتواصل" : "Contact"}: ${coachPhone}`;
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

  const allFoodsForTracking = [...FOOD_DATABASE, ...customFoods];
  const planTracking = meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      const fd = allFoodsForTracking.find(f => f.id === item.id);
      if (!fd || !fd.micros) return;
      const mult = isPerPiece(fd.state) ? item.grams : item.grams / 100;
      acc.fiber += (fd.micros.fiber || 0) * mult;
      acc.saturatedFat += (fd.micros.saturatedFat || 0) * mult;
      acc.omega3 += (fd.micros.omega3 || 0) * mult;
      acc.omega6 += (fd.micros.omega6 || 0) * mult;
    });
    return acc;
  }, { fiber: 0, saturatedFat: 0, omega3: 0, omega6: 0 });

  // Client helpers
  function addClient() {
    if (!newClient.name.trim()) return;
    const c: Client = {
      id: Date.now(), ...newClient, createdAt: new Date().toISOString(), checkIns: [], dietPlans: [],
      gender: "male", age: 30, isTraining: true, isPregnant: false, pregnancyMonth: 0, isLactating: false,
      diseases: "", allergies: "", foodDislikes: "",
    };
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
          <h1 className="text-2xl font-bold text-center">🥗 MSR Nutrition</h1>
          <p className="text-center text-gray-500 text-sm">Pro Nutrition Planner</p>
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
      {/* Print styles — MSR Nutrition Planner brand, inspired by FlexCoach layout */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          body { background: white !important; color: #111 !important; font-family: 'Segoe UI', 'Arial', sans-serif !important; margin: 0 !important; }
          @page { margin: 0; size: A4; }
          @page :first { margin: 0; }

          /* ── COVER PAGE ─────────────────────────────────────────── */
          .pdf-cover {
            display: flex !important; flex-direction: column !important;
            min-height: 100vh !important; background: #0b1f38 !important;
            color: white !important; padding: 40px 50px !important;
            page-break-after: always !important; position: relative !important;
            overflow: hidden !important;
          }
          .pdf-cover-accent {
            position: absolute !important; bottom: 0 !important; right: 0 !important;
            width: 220px !important; height: 220px !important;
            background: linear-gradient(135deg, #0d7a5f 0%, #0ea5e9 100%) !important;
            clip-path: polygon(100% 0, 100% 100%, 0 100%) !important;
          }
          .pdf-cover-logo {
            width: 52px !important; height: 52px !important;
            background: #0d7a5f !important; border-radius: 8px !important;
            display: flex !important; align-items: center !important;
            justify-content: center !important; font-size: 22px !important;
            font-weight: 900 !important; color: white !important;
          }
          .pdf-cover-issued { text-align: right !important; font-size: 11px !important; letter-spacing: 2px !important; opacity: 0.7 !important; text-transform: uppercase !important; }
          .pdf-cover-spacer { flex: 1 !important; }
          .pdf-cover-brand { font-size: 11px !important; letter-spacing: 3px !important; text-transform: uppercase !important; color: #0d7a5f !important; margin-bottom: 8px !important; display: flex !important; align-items: center !important; gap: 10px !important; }
          .pdf-cover-brand::before { content: '' !important; display: inline-block !important; width: 40px !important; height: 2px !important; background: #0d7a5f !important; }
          .pdf-cover-title { font-size: 52px !important; font-weight: 900 !important; line-height: 1.05 !important; margin-bottom: 30px !important; text-transform: uppercase !important; letter-spacing: -1px !important; }
          .pdf-cover-prepared { font-size: 10px !important; letter-spacing: 2px !important; text-transform: uppercase !important; opacity: 0.6 !important; }
          .pdf-cover-client { font-size: 26px !important; font-weight: 700 !important; margin-top: 4px !important; margin-bottom: 28px !important; }
          .pdf-cover-stats { display: flex !important; gap: 0 !important; border-top: 1px solid rgba(255,255,255,0.2) !important; padding-top: 18px !important; }
          .pdf-cover-stat { flex: 1 !important; padding-right: 20px !important; border-right: 1px solid rgba(255,255,255,0.15) !important; margin-right: 20px !important; }
          .pdf-cover-stat:last-child { border-right: none !important; }
          .pdf-cover-stat-val { font-size: 32px !important; font-weight: 900 !important; }
          .pdf-cover-stat-lbl { font-size: 9px !important; letter-spacing: 2px !important; text-transform: uppercase !important; opacity: 0.6 !important; }
          .pdf-cover-powered { font-size: 9px !important; opacity: 0.4 !important; margin-top: 20px !important; letter-spacing: 1px !important; }

          /* ── PAGE HEADER (all pages except cover) ──────────────── */
          .pdf-page-header {
            display: flex !important; align-items: center !important;
            justify-content: space-between !important;
            padding: 14px 40px !important; border-bottom: 1px solid #e5e7eb !important;
            margin-bottom: 30px !important;
          }
          .pdf-page-header-logo { display: flex !important; align-items: center !important; gap: 10px !important; }
          .pdf-page-header-logo-icon { width: 28px !important; height: 28px !important; background: #0d7a5f !important; border-radius: 5px !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 13px !important; font-weight: 900 !important; color: white !important; }
          .pdf-page-header-name { font-weight: 700 !important; font-size: 13px !important; }
          .pdf-page-header-right { font-size: 11px !important; color: #6b7280 !important; }
          .pdf-page-header-right span { color: #0b1f38 !important; font-weight: 600 !important; }

          /* ── SUMMARY PAGE ───────────────────────────────────────── */
          .pdf-summary { padding: 0 40px 40px !important; page-break-after: always !important; }
          .pdf-section-label { font-size: 10px !important; letter-spacing: 3px !important; text-transform: uppercase !important; color: #0d7a5f !important; font-weight: 700 !important; margin-bottom: 6px !important; }
          .pdf-section-title { font-size: 30px !important; font-weight: 900 !important; text-transform: uppercase !important; color: #0b1f38 !important; margin-bottom: 14px !important; }
          .pdf-subtitle-text { font-size: 12px !important; color: #6b7280 !important; line-height: 1.6 !important; max-width: 420px !important; margin-bottom: 28px !important; }
          .pdf-macro-row { display: flex !important; align-items: center !important; padding: 12px 0 !important; border-bottom: 1px solid #f3f4f6 !important; gap: 12px !important; }
          .pdf-macro-dot { width: 10px !important; height: 10px !important; border-radius: 50% !important; flex-shrink: 0 !important; }
          .pdf-macro-label { flex: 1 !important; font-size: 13px !important; color: #374151 !important; }
          .pdf-macro-val { font-weight: 700 !important; font-size: 14px !important; margin-right: 12px !important; }
          .pdf-macro-pct { font-size: 12px !important; color: #9ca3af !important; min-width: 36px !important; text-align: right !important; }
          .pdf-coach-box { background: #f0fdf9 !important; border-left: 4px solid #0d7a5f !important; padding: 16px 20px !important; border-radius: 6px !important; margin-top: 28px !important; }
          .pdf-coach-box-label { font-size: 10px !important; letter-spacing: 2px !important; text-transform: uppercase !important; color: #0d7a5f !important; font-weight: 700 !important; margin-bottom: 8px !important; }
          .pdf-coach-box-text { font-size: 12px !important; color: #374151 !important; line-height: 1.7 !important; white-space: pre-wrap !important; }

          /* ── MEALS PAGES ────────────────────────────────────────── */
          .pdf-meals-header { background: #0b1f38 !important; color: white !important; padding: 16px 40px !important; margin: 0 0 32px !important; display: flex !important; align-items: center !important; justify-content: space-between !important; }
          .pdf-meals-header-left .lbl { font-size: 9px !important; letter-spacing: 3px !important; text-transform: uppercase !important; color: #0d7a5f !important; font-weight: 700 !important; }
          .pdf-meals-header-left .ttl { font-size: 22px !important; font-weight: 900 !important; text-transform: uppercase !important; }
          .pdf-meals-header-stats { display: flex !important; gap: 24px !important; }
          .pdf-meals-header-stat { text-align: center !important; }
          .pdf-meals-header-stat .val { font-size: 20px !important; font-weight: 900 !important; }
          .pdf-meals-header-stat .lbl { font-size: 8px !important; letter-spacing: 2px !important; text-transform: uppercase !important; opacity: 0.7 !important; }
          .pdf-meal-block { padding: 0 40px !important; margin-bottom: 28px !important; }
          .pdf-meal-title-row { display: flex !important; align-items: center !important; margin-bottom: 14px !important; gap: 14px !important; }
          .pdf-meal-num { width: 32px !important; height: 32px !important; border-radius: 50% !important; background: #0d7a5f !important; color: white !important; display: flex !important; align-items: center !important; justify-content: center !important; font-weight: 900 !important; font-size: 14px !important; flex-shrink: 0 !important; }
          .pdf-meal-name { font-size: 18px !important; font-weight: 700 !important; flex: 1 !important; }
          .pdf-meal-kcal { font-size: 13px !important; font-weight: 700 !important; color: #0d7a5f !important; }
          .pdf-food-item { display: flex !important; justify-content: space-between !important; padding: 9px 0 9px 46px !important; border-bottom: 1px dashed #e5e7eb !important; }
          .pdf-food-item:last-of-type { border-bottom: none !important; }
          .pdf-food-en { font-size: 13px !important; font-weight: 500 !important; color: #111827 !important; }
          .pdf-food-ar { font-size: 11px !important; color: #9ca3af !important; margin-top: 2px !important; }
          .pdf-food-amt { font-size: 13px !important; font-weight: 700 !important; color: #374151 !important; white-space: nowrap !important; }
          .pdf-meal-macros { display: flex !important; gap: 16px !important; padding: 10px 0 0 46px !important; }
          .pdf-meal-macro-pill { display: flex !important; align-items: center !important; gap: 5px !important; font-size: 12px !important; }
          .pdf-meal-macro-dot { width: 8px !important; height: 8px !important; border-radius: 50% !important; }
          .pdf-meal-notes { margin: 8px 0 0 46px !important; background: #fefce8 !important; border-left: 3px solid #eab308 !important; padding: 8px 12px !important; font-size: 11px !important; font-style: italic !important; color: #92400e !important; white-space: pre-wrap !important; border-radius: 0 4px 4px 0 !important; }

          /* ── HEALTH INFO PAGE ───────────────────────────────────── */
          .pdf-health { padding: 0 40px 40px !important; page-break-before: always !important; }
          .pdf-health-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 20px !important; margin-top: 20px !important; }
          .pdf-health-card { border: 1px solid #e5e7eb !important; border-radius: 8px !important; padding: 16px !important; }
          .pdf-health-card-title { font-size: 10px !important; letter-spacing: 2px !important; text-transform: uppercase !important; color: #0d7a5f !important; font-weight: 700 !important; margin-bottom: 8px !important; }
          .pdf-health-card-text { font-size: 13px !important; color: #374151 !important; line-height: 1.6 !important; }

          /* ── GUIDELINES PAGE ────────────────────────────────────── */
          .pdf-guidelines { padding: 0 40px 40px !important; page-break-before: always !important; }
          .pdf-guideline-row { display: flex !important; align-items: flex-start !important; gap: 18px !important; padding: 14px 0 !important; border-bottom: 1px solid #f3f4f6 !important; }
          .pdf-guideline-num { font-size: 22px !important; font-weight: 900 !important; color: #0d7a5f !important; min-width: 36px !important; line-height: 1 !important; padding-top: 2px !important; }
          .pdf-guideline-text { font-size: 13px !important; color: #374151 !important; line-height: 1.6 !important; flex: 1 !important; }

          /* ── SHOPPING LIST PAGE ─────────────────────────────────── */
          .pdf-shopping { padding: 0 40px 40px !important; page-break-before: always !important; }
          .pdf-shopping-grid { display: grid !important; grid-template-columns: 1fr 1fr !important; gap: 0 40px !important; margin-top: 24px !important; }
          .pdf-shopping-cat { margin-bottom: 20px !important; }
          .pdf-shopping-cat-title { font-size: 9px !important; letter-spacing: 3px !important; text-transform: uppercase !important; font-weight: 700 !important; color: #0b1f38 !important; border-bottom: 2px solid #0b1f38 !important; padding-bottom: 4px !important; margin-bottom: 8px !important; }
          .pdf-shopping-item { display: flex !important; justify-content: space-between !important; align-items: center !important; padding: 7px 0 !important; border-bottom: 1px dashed #e5e7eb !important; gap: 8px !important; }
          .pdf-shopping-check { width: 14px !important; height: 14px !important; border: 1.5px solid #6b7280 !important; border-radius: 2px !important; flex-shrink: 0 !important; }
          .pdf-shopping-name { flex: 1 !important; font-size: 13px !important; color: #374151 !important; }
          .pdf-shopping-qty { font-size: 13px !important; font-weight: 700 !important; color: #0b1f38 !important; white-space: nowrap !important; }

          /* ── FOOTER ─────────────────────────────────────────────── */
          .pdf-footer { position: fixed !important; bottom: 16px !important; left: 40px !important; right: 40px !important; display: flex !important; justify-content: space-between !important; font-size: 9px !important; color: #9ca3af !important; border-top: 1px solid #f3f4f6 !important; padding-top: 8px !important; }

          /* ── MSR LOGO ───────────────────────────────────────────── */
          .pdf-logo-msr { font-size: 15px !important; font-weight: 900 !important; letter-spacing: 1px !important; color: white !important; font-family: 'Segoe UI', Arial, sans-serif !important; }
          .pdf-logo-msr-sm { font-size: 11px !important; font-weight: 900 !important; letter-spacing: 1px !important; color: white !important; font-family: 'Segoe UI', Arial, sans-serif !important; }
        }
      `}</style>

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2">
          <span className="text-xl">🥗</span>
          <span className="font-bold text-lg">MSR Nutrition Planner</span>
        </div>
        <div className="flex gap-1">
          {([["planner", <UtensilsCrossed size={16} />, "Planner"], ["calculator", <Calculator size={16} />, "Calc"], ["clients", <Users size={16} />, "Clients"], ["micros", <BarChart2 size={16} />, "Micros"]] as const).map(([t, icon, label]) => (
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
            {/* ── PDF COVER PAGE (print only) ─────────────────────────────── */}
            {(() => {
              const gt = grandTotals(meals);
              const dateFormatted = new Date(planDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
              const calPct = gt.calories > 0 ? { p: Math.round(gt.protein*4/gt.calories*100), c: Math.round(gt.carbs*4/gt.calories*100), f: Math.round(gt.fat*9/gt.calories*100) } : { p:0,c:0,f:0 };
              return (
                <>
                  {/* COVER */}
                  <div className="pdf-cover hidden print:flex">
                    <div className="pdf-cover-accent" />
                    <div className="flex justify-between items-start">
                      <div className="pdf-cover-logo"><span className="pdf-logo-msr">MSR</span></div>
                      <div className="pdf-cover-issued"><div>ISSUED</div><div>{dateFormatted}</div></div>
                    </div>
                    <div className="pdf-cover-spacer" />
                    <div>
                      <div className="pdf-cover-brand">MSR Coach Mohamed Saed</div>
                      <div className="pdf-cover-title">Nutrition<br/>Plan</div>
                      {planClientName && <><div className="pdf-cover-prepared">Prepared for</div><div className="pdf-cover-client">{planClientName}</div></>}
                      <div className="pdf-cover-stats">
                        <div className="pdf-cover-stat"><div className="pdf-cover-stat-val">{gt.calories.toFixed(0)}</div><div className="pdf-cover-stat-lbl">KCAL</div></div>
                        <div className="pdf-cover-stat"><div className="pdf-cover-stat-val">{gt.protein.toFixed(0)}g</div><div className="pdf-cover-stat-lbl">PROTEIN</div></div>
                        <div className="pdf-cover-stat"><div className="pdf-cover-stat-val">{meals.length}</div><div className="pdf-cover-stat-lbl">MEALS</div></div>
                        {planGoal && <div className="pdf-cover-stat"><div className="pdf-cover-stat-val" style={{fontSize:"18px"}}>{planGoal}</div><div className="pdf-cover-stat-lbl">GOAL</div></div>}
                      </div>
                      <div className="pdf-cover-powered">MSR Nutrition Planner · {coachPhone}</div>
                    </div>
                  </div>

                  {/* SUMMARY PAGE */}
                  <div className="hidden print:block">
                    <div className="pdf-page-header">
                      <div className="pdf-page-header-logo">
                        <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
                        <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
                      </div>
                      <div className="pdf-page-header-right">Nutrition Plan &nbsp;·&nbsp; <span>{planClientName}</span></div>
                    </div>
                    <div className="pdf-summary">
                      <div className="pdf-section-label">Daily Targets</div>
                      <div className="pdf-section-title">Nutrition Plan</div>
                      <div className="pdf-subtitle-text">Your meals are built around your goal and your lifestyle. Follow the portions as closely as you can, and message your coach whenever something doesn't fit your day.</div>
                      <div style={{display:"flex", gap:"40px", alignItems:"flex-start"}}>
                        <div style={{flex:"0 0 auto"}}>
                          <MacroPieChart carbs={gt.carbs} protein={gt.protein} fat={gt.fat} />
                          <div style={{textAlign:"center", marginTop:"4px", fontWeight:"900", fontSize:"20px"}}>{gt.calories.toFixed(0)}</div>
                          <div style={{textAlign:"center", fontSize:"10px", letterSpacing:"2px", color:"#9ca3af"}}>KCAL</div>
                        </div>
                        <div style={{flex:1}}>
                          <div className="pdf-macro-row"><div className="pdf-macro-dot" style={{background:"#3b82f6"}} /><div className="pdf-macro-label">Protein</div><div className="pdf-macro-val">{gt.protein.toFixed(0)} g</div><div className="pdf-macro-pct">{calPct.p}%</div></div>
                          <div className="pdf-macro-row"><div className="pdf-macro-dot" style={{background:"#0d7a5f"}} /><div className="pdf-macro-label">Carbs</div><div className="pdf-macro-val">{gt.carbs.toFixed(0)} g</div><div className="pdf-macro-pct">{calPct.c}%</div></div>
                          <div className="pdf-macro-row"><div className="pdf-macro-dot" style={{background:"#6b7280"}} /><div className="pdf-macro-label">Fat</div><div className="pdf-macro-val">{gt.fat.toFixed(0)} g</div><div className="pdf-macro-pct">{calPct.f}%</div></div>
                          <div style={{fontSize:"10px", color:"#9ca3af", marginTop:"10px"}}>Daily total · {planWaterGoal}L water daily</div>
                        </div>
                      </div>
                      {planNotes && (
                        <div className="pdf-coach-box">
                          <div className="pdf-coach-box-label">From Your Coach</div>
                          <div className="pdf-coach-box-text">{planNotes}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MEALS PAGES */}
                  <div className="hidden print:block" style={{pageBreakBefore:"always"}}>
                    <div className="pdf-page-header">
                      <div className="pdf-page-header-logo">
                        <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
                        <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
                      </div>
                      <div className="pdf-page-header-right">Nutrition Plan &nbsp;·&nbsp; <span>{planClientName}</span></div>
                    </div>
                    <div className="pdf-meals-header">
                      <div className="pdf-meals-header-left"><div className="lbl">Meals</div><div className="ttl">Nutrition Plan</div></div>
                      <div className="pdf-meals-header-stats">
                        <div className="pdf-meals-header-stat"><div className="val">{gt.calories.toFixed(0)}</div><div className="lbl">KCAL</div></div>
                        <div className="pdf-meals-header-stat"><div className="val">{gt.protein.toFixed(0)}g</div><div className="lbl">PROTEIN</div></div>
                        <div className="pdf-meals-header-stat"><div className="val">{gt.carbs.toFixed(0)}g</div><div className="lbl">CARBS</div></div>
                        <div className="pdf-meals-header-stat"><div className="val">{gt.fat.toFixed(0)}g</div><div className="lbl">FAT</div></div>
                      </div>
                    </div>
                    {meals.map((meal, mi) => {
                      const mt = mealTotals(meal);
                      return (
                        <div key={meal.id} className="pdf-meal-block">
                          <div className="pdf-meal-title-row">
                            <div className="pdf-meal-num">{mi + 1}</div>
                            <div className="pdf-meal-name">{displayName(meal.name, printLang)}</div>
                            <div className="pdf-meal-kcal">{mt.calories.toFixed(0)} kcal</div>
                          </div>
                          {meal.items.map(item => {
                            const nameParts = item.name.split(" - ");
                            const enName = nameParts[0];
                            const arName = nameParts[1] || "";
                            const amt = isPerPiece(item.state) ? `${item.grams} ${item.grams === 1 ? "pc" : "pcs"}` : `${item.grams} g`;
                            const showEn = printLang === "en" || printLang === "both";
                            const showAr = printLang === "ar" || printLang === "both";
                            return (
                              <div key={item.instId} className="pdf-food-item">
                                <div>
                                  {showEn && <div className="pdf-food-en">{enName}</div>}
                                  {showAr && arName && <div className={showEn ? "pdf-food-ar" : "pdf-food-en"} style={showEn ? {} : {fontFamily:"'Noto Sans Arabic',sans-serif", direction:"rtl"}}>{arName}</div>}
                                </div>
                                <div className="pdf-food-amt">{amt}</div>
                              </div>
                            );
                          })}
                          {meal.notes && <div className="pdf-meal-notes">📝 {meal.notes}</div>}
                          <div className="pdf-meal-macros">
                            <div className="pdf-meal-macro-pill"><div className="pdf-meal-macro-dot" style={{background:"#3b82f6"}} /><span>Protein {mt.protein.toFixed(0)}g</span></div>
                            <div className="pdf-meal-macro-pill"><div className="pdf-meal-macro-dot" style={{background:"#0d7a5f"}} /><span>Carbs {mt.carbs.toFixed(0)}g</span></div>
                            <div className="pdf-meal-macro-pill"><div className="pdf-meal-macro-dot" style={{background:"#6b7280"}} /><span>Fat {mt.fat.toFixed(0)}g</span></div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{padding:"0 40px", fontSize:"9px", color:"#9ca3af", borderTop:"1px solid #f3f4f6", paddingTop:"12px", marginTop:"20px"}}>
                      MSR Coach Mohamed Saed · {coachPhone} · Prepared exclusively for {planClientName}
                    </div>
                  </div>

                  {/* HEALTH INFO PAGE — only renders when client data exists */}
                  {(() => {
                    const c = clients.find(cl => cl.name === planClientName);
                    const hasHealth = c && (c.diseases || c.allergies || c.foodDislikes);
                    if (!hasHealth) return null;
                    return (
                      <div className="pdf-health hidden print:block">
                        <div className="pdf-page-header">
                          <div className="pdf-page-header-logo">
                            <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
                            <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
                          </div>
                          <div className="pdf-page-header-right">Health Profile &nbsp;·&nbsp; <span>{planClientName}</span></div>
                        </div>
                        <div style={{padding:"30px 40px 0"}}>
                          <div style={{fontSize:"22px", fontWeight:800, color:"#0b1f38", marginBottom:"6px"}}>Client Health Profile</div>
                          <div style={{fontSize:"12px", color:"#6b7280", marginBottom:"24px"}}>Important medical information to consider when preparing and following this nutrition plan.</div>
                          <div className="pdf-health-grid">
                            {c.diseases && (
                              <div className="pdf-health-card">
                                <div className="pdf-health-card-title">⚕️ Medical Conditions / الأمراض</div>
                                <div className="pdf-health-card-text">{c.diseases}</div>
                              </div>
                            )}
                            {c.allergies && (
                              <div className="pdf-health-card" style={{borderColor:"#fca5a5"}}>
                                <div className="pdf-health-card-title" style={{color:"#dc2626"}}>⚠️ Allergies / الحساسية</div>
                                <div className="pdf-health-card-text">{c.allergies}</div>
                              </div>
                            )}
                            {c.foodDislikes && (
                              <div className="pdf-health-card">
                                <div className="pdf-health-card-title">🚫 Food Dislikes / أطعمة غير مفضلة</div>
                                <div className="pdf-health-card-text">{c.foodDislikes}</div>
                              </div>
                            )}
                            <div className="pdf-health-card" style={{borderColor:"#0d7a5f", background:"#f0fdf4"}}>
                              <div className="pdf-health-card-title">👤 Profile</div>
                              <div className="pdf-health-card-text">
                                {c.gender === "male" ? "Male" : "Female"} · Age {c.age}
                                {c.isTraining && " · Athlete"}
                                {c.isPregnant && ` · Pregnant (Month ${c.pregnancyMonth})`}
                                {c.isLactating && " · Lactating"}
                              </div>
                            </div>
                          </div>
                          <div style={{marginTop:"24px", padding:"16px", background:"#fff7ed", border:"1px solid #fed7aa", borderRadius:"8px", fontSize:"12px", color:"#92400e"}}>
                            ⚠️ This information is confidential and intended solely for the client and their healthcare provider. Always consult a physician before making changes to diet or supplementation, especially with existing medical conditions or pregnancy.
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* GUIDELINES PAGE */}
                  <div className="pdf-guidelines hidden print:block">
                    <div className="pdf-page-header">
                      <div className="pdf-page-header-logo">
                        <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
                        <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
                      </div>
                      <div className="pdf-page-header-right">Nutrition Plan &nbsp;·&nbsp; <span>{planClientName}</span></div>
                    </div>
                    <div style={{marginTop:"32px", marginBottom:"24px"}}>
                      <div style={{fontSize:"22px", fontWeight:900, color:"#0b1f38", letterSpacing:"-0.5px"}}>Plan Guidelines</div>
                      <div style={{fontSize:"12px", color:"#6b7280", marginTop:"4px"}}>Follow these instructions for the best results.</div>
                    </div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">01</div><div className="pdf-guideline-text">Weigh foods raw unless the plan says cooked.</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">02</div><div className="pdf-guideline-text">Drink at least {planWaterGoal}L of water daily.</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">03</div><div className="pdf-guideline-text">Swap within the same meal option only, never across meals.</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">04</div><div className="pdf-guideline-text">Season freely with herbs and spices; count sauces and oils.</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">05</div><div className="pdf-guideline-text">Weigh yourself every morning on an empty stomach, after using the bathroom, wearing minimum light clothing.</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">06</div><div className="pdf-guideline-text">Take photos of your meals when in doubt about portions.</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">07</div><div className="pdf-guideline-text">Contact your coach if you feel unwell or cannot follow the plan.</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">08</div><div className="pdf-guideline-text">Consistency beats perfection — never skip more than one meal.</div></div>
                  </div>

                  {/* SHOPPING LIST PAGE */}
                  {(() => {
                    const allFoodsDB = [...FOOD_DATABASE, ...customFoods];
                    const shoppingMap: Record<string, { name: string; category: string; grams: number }> = {};
                    meals.forEach(meal => {
                      meal.items.forEach(item => {
                        const fd = allFoodsDB.find(f => f.id === item.id);
                        const cat = fd?.category || "Other";
                        const key = item.id + "_" + item.name;
                        if (!shoppingMap[key]) shoppingMap[key] = { name: item.name, category: cat, grams: 0 };
                        shoppingMap[key].grams += item.grams;
                      });
                    });
                    const items = Object.values(shoppingMap);
                    if (items.length === 0) return null;
                    const byCategory: Record<string, typeof items> = {};
                    items.forEach(it => { if (!byCategory[it.category]) byCategory[it.category] = []; byCategory[it.category].push(it); });
                    const cats = Object.keys(byCategory).sort();
                    return (
                      <div className="pdf-shopping hidden print:block">
                        <div className="pdf-page-header">
                          <div className="pdf-page-header-logo">
                            <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
                            <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
                          </div>
                          <div className="pdf-page-header-right">Nutrition Plan &nbsp;·&nbsp; <span>{planClientName}</span></div>
                        </div>
                        <div style={{marginTop:"32px", marginBottom:"8px"}}>
                          <div style={{fontSize:"22px", fontWeight:900, color:"#0b1f38", letterSpacing:"-0.5px"}}>Shopping List</div>
                          <div style={{fontSize:"12px", color:"#6b7280", marginTop:"4px"}}>Estimated for 7 days.</div>
                        </div>
                        <div className="pdf-shopping-grid">
                          {cats.map(cat => (
                            <div key={cat} className="pdf-shopping-cat">
                              <div className="pdf-shopping-cat-title">{cat}</div>
                              {byCategory[cat].map((it, idx) => {
                                const nameParts = it.name.split(" - ");
                                const enName = nameParts[0];
                                const weekly = Math.round(it.grams * 7);
                                return (
                                  <div key={idx} className="pdf-shopping-item">
                                    <div className="pdf-shopping-check" />
                                    <div className="pdf-shopping-name">{enName}</div>
                                    <div className="pdf-shopping-qty">{weekly}g</div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}

            {/* plan info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3 print:hidden">
              <h2 className="font-bold text-sm text-gray-500 uppercase">معلومات الخطة</h2>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-500">اسم العميل</label><input value={planClientName} onChange={e => setPlanClientName(e.target.value)} placeholder="سارة عماد..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">الهدف</label><input value={planGoal} onChange={e => setPlanGoal(e.target.value)} placeholder="تنشيف..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">التاريخ</label><input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">هدف الماء (لتر)</label><input type="number" step="0.5" min="0" value={planWaterGoal} onChange={e => setPlanWaterGoal(+e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">اسم الكوتش</label><input value={coachName} onChange={e => setCoachName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">رقم التواصل</label><input value={coachPhone} onChange={e => setCoachPhone(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
              </div>
            </div>

            {/* target macros */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3 print:hidden">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-base">Target Macros - الماكرو المستهدف</h2>
                <MacroPieChart carbs={targetMacros.carbs} protein={targetMacros.protein} fat={targetMacros.fat} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
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
                <div>
                  <div className="flex justify-between text-xs mb-0.5">
                    <span>🌾 Fiber</span>
                    <span>{planTracking.fiber.toFixed(1)}g / 25g recommended</span>
                  </div>
                  <ProgressBar value={planTracking.fiber} max={25} color="bg-green-500" />
                </div>
                {(() => {
                  const satFatLimit = targetMacros.calories > 0 ? (targetMacros.calories * 0.1) / 9 : 22;
                  const satPct = satFatLimit > 0 ? planTracking.saturatedFat / satFatLimit * 100 : 0;
                  return (
                    <div>
                      <div className="flex justify-between text-xs mb-0.5">
                        <span>🧈 Saturated Fat</span>
                        <span>{planTracking.saturatedFat.toFixed(1)}g / {satFatLimit.toFixed(0)}g limit</span>
                      </div>
                      <ProgressBar value={planTracking.saturatedFat} max={satFatLimit} color={satPct > 100 ? "bg-red-500" : satPct > 80 ? "bg-orange-400" : "bg-amber-400"} />
                      {satPct > 100 && <div className="text-xs text-red-500 mt-0.5">⚠️ High saturated fat — consider reducing for heart health</div>}
                    </div>
                  );
                })()}
                {(() => {
                  const ratio = planTracking.omega3 > 0 ? planTracking.omega6 / planTracking.omega3 : null;
                  const ratioColor = ratio === null ? "text-gray-400" : ratio <= 4 ? "text-green-600" : ratio <= 10 ? "text-yellow-600" : "text-red-500";
                  return (
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs">🐟 Omega-3 : Omega-6</span>
                        <span className={`text-xs font-bold ${ratioColor}`}>
                          {ratio === null ? "— no data" : `1 : ${ratio.toFixed(1)}`}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 mt-0.5">
                        ω-3: {planTracking.omega3.toFixed(2)}g · ω-6: {planTracking.omega6.toFixed(2)}g · Aim for 1:1 to 1:4
                      </div>
                      {ratio !== null && ratio > 10 && <div className="text-xs text-red-500 mt-0.5">⚠️ Very high omega-6 ratio — increase omega-3 sources</div>}
                      {ratio !== null && ratio > 4 && ratio <= 10 && <div className="text-xs text-yellow-600 mt-0.5">Consider adding more omega-3 sources (salmon, sardines, flaxseed)</div>}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* meals — interactive (hidden in print; PDF version is in the print-only section above) */}
            <div className="print:hidden">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleMealDragEnd}>
              <SortableContext items={meals.map(m => m.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {meals.map(meal => (
                    <SortableMealWrapper key={meal.id} mealId={meal.id}>
                      {dragHandleProps => (
                        <MealCard
                          meal={meal} lang={lang}
                          onUpdate={u => updateMeal(meal.id, u)}
                          onDelete={() => deleteMeal(meal.id)}
                          onDuplicate={() => {
                            const copy = { ...JSON.parse(JSON.stringify(meal)), id: `m${Date.now()}`, name: meal.name + " (copy)" };
                            setMeals(prev => { const i = prev.findIndex(m => m.id === meal.id); const next = [...prev]; next.splice(i + 1, 0, copy); return next; });
                          }}
                          extraFoods={customFoods}
                          dragHandleProps={dragHandleProps}
                        />
                      )}
                    </SortableMealWrapper>
                  ))}
                </div>
              </SortableContext>
            </DndContext>
            </div>

            <div className="flex gap-2 print:hidden">
              <button onClick={addMeal} className="flex-1 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-2">
                <Plus size={16} /> Add Meal - إضافة وجبة
              </button>
              <button onClick={() => setShowRecipeBuilder(p => !p)} className="border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-xl py-3 px-4 text-sm text-purple-500 hover:border-purple-500 flex items-center gap-2">
                <UtensilsCrossed size={16} /> Recipes
              </button>
            </div>

            {/* ── RECIPE BUILDER ───────────────────────────────────────────── */}
            {showRecipeBuilder && (
              <RecipeBuilder
                allFoods={[...FOOD_DATABASE, ...customFoods]}
                customRecipes={customRecipes}
                setCustomRecipes={setCustomRecipes}
                onAddAsMeal={r => {
                  const items = r.ingredients.flatMap(ing => {
                    const fd = [...FOOD_DATABASE, ...customFoods].find(f => f.id === ing.foodId);
                    if (!fd) return [];
                    return [{ ...fd, grams: ing.grams / r.serves, instId: `ri-${Date.now()}-${Math.random()}` }];
                  });
                  setMeals(prev => [...prev, { id: `m${Date.now()}`, name: r.name, items, notes: r.notes, collapsed: false }]);
                }}
                onClose={() => setShowRecipeBuilder(false)}
              />
            )}

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
                <input dir="ltr" value={templateName} onChange={e => setTemplateName(e.target.value)} placeholder="Template name..." className="flex-1 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-1.5 text-sm bg-white dark:bg-gray-800" />
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

                {/* health profile */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
                  <h3 className="font-semibold text-sm flex items-center gap-2">🏥 Health Profile</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <label className="text-xs text-gray-500">Gender</label>
                      <select value={selectedClient.gender || "male"} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, gender: e.target.value as "male"|"female" } : c))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1">
                        <option value="male">Male - ذكر</option>
                        <option value="female">Female - أنثى</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Age</label>
                      <input type="number" min="1" max="120" value={selectedClient.age || 30} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, age: +e.target.value } : c))}
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
                    </div>
                    <div className="flex items-center gap-2 col-span-2 flex-wrap">
                      <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                        <input type="checkbox" checked={!!selectedClient.isTraining} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, isTraining: e.target.checked } : c))} className="accent-teal-600" />
                        <span>Training / رياضي</span>
                      </label>
                      {selectedClient.gender === "female" && (
                        <>
                          <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                            <input type="checkbox" checked={!!selectedClient.isPregnant} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, isPregnant: e.target.checked, pregnancyMonth: e.target.checked ? (c.pregnancyMonth || 1) : 0 } : c))} className="accent-teal-600" />
                            <span>Pregnant / حامل</span>
                          </label>
                          {selectedClient.isPregnant && (
                            <div className="flex items-center gap-1">
                              <label className="text-xs text-gray-500">Month:</label>
                              <select value={selectedClient.pregnancyMonth || 1} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, pregnancyMonth: +e.target.value } : c))}
                                className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-xs bg-white dark:bg-gray-800">
                                {[1,2,3,4,5,6,7,8,9].map(m => <option key={m} value={m}>{m}</option>)}
                              </select>
                            </div>
                          )}
                          <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                            <input type="checkbox" checked={!!selectedClient.isLactating} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, isLactating: e.target.checked } : c))} className="accent-teal-600" />
                            <span>Lactating / مرضع</span>
                          </label>
                        </>
                      )}
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Diseases / الأمراض</label>
                      <input value={selectedClient.diseases || ""} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, diseases: e.target.value } : c))}
                        placeholder="e.g. Diabetes, Hypertension..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Allergies / الحساسية</label>
                      <input value={selectedClient.allergies || ""} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, allergies: e.target.value } : c))}
                        placeholder="e.g. Lactose, Gluten, Shellfish..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500">Food Dislikes / أطعمة غير مفضلة</label>
                      <input value={selectedClient.foodDislikes || ""} onChange={e => setClients(prev => prev.map(c => c.id === selectedClient.id ? { ...c, foodDislikes: e.target.value } : c))}
                        placeholder="e.g. Broccoli, Fish..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" />
                    </div>
                  </div>
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

                {/* ── MICRONUTRIENT TRACKER ───────────────────────────── */}
                {(() => {
                  const rdi = getRDI({
                    gender: selectedClient.gender || "male",
                    age: selectedClient.age || 30,
                    isTraining: !!selectedClient.isTraining,
                    isPregnant: !!selectedClient.isPregnant,
                    pregnancyMonth: selectedClient.pregnancyMonth || 0,
                    isLactating: !!selectedClient.isLactating,
                  });
                  // Calculate micros from current plan meals
                  const planMicros: Record<string, number> = {};
                  const allFoods = [...FOOD_DATABASE, ...customFoods];
                  meals.forEach(meal => {
                    meal.items.forEach(item => {
                      const fd = allFoods.find(f => f.id === item.id);
                      if (!fd?.micros) return;
                      const mult = isPerPiece(fd.state) ? item.grams : item.grams / 100;
                      Object.entries(fd.micros).forEach(([k, v]) => {
                        planMicros[k] = (planMicros[k] || 0) + (v as number) * mult;
                      });
                    });
                  });
                  // Merge with manual overrides
                  const clientOverrides = microOverrides[selectedClient.id] || {};
                  const totalMicros: Record<string, number> = { ...planMicros };
                  Object.entries(clientOverrides).forEach(([k, v]) => {
                    totalMicros[k] = (totalMicros[k] || 0) + v;
                  });

                  return (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-sm flex-1">🔬 Micronutrient Tracker</h3>
                        <span className="text-xs text-gray-400">vs RDI ({selectedClient.isTraining ? "Athlete" : "Sedentary"}{selectedClient.isPregnant ? " · Pregnant" : ""}{selectedClient.isLactating ? " · Lactating" : ""})</span>
                      </div>
                      <p className="text-xs text-gray-400">Based on current plan meals + any manual additions below. Green = met, Yellow = &gt;50%, Red = below 50%.</p>

                      {/* VITAMINS */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Vitamins</div>
                        <div className="space-y-2">
                          {MICROS_LIST.filter(m => m.category === "Vitamins").map(micro => {
                            const got = totalMicros[micro.key] || 0;
                            const target = rdi[micro.key] || 0;
                            const pct = target > 0 ? Math.min((got / target) * 100, 100) : 0;
                            const color = pct >= 100 ? "#0d7a5f" : pct >= 50 ? "#f59e0b" : "#ef4444";
                            const manualVal = clientOverrides[micro.key] || "";
                            return (
                              <div key={micro.key} className="flex items-center gap-2">
                                <div className="w-28 text-xs text-gray-600 dark:text-gray-300 shrink-0 truncate" title={micro.name}>{micro.name}</div>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                </div>
                                <div className="text-xs w-20 text-right shrink-0" style={{ color }}>
                                  {got.toFixed(1)} / {target} {micro.unit}
                                </div>
                                <input
                                  type="number" min="0" step="any"
                                  value={manualVal}
                                  placeholder="+add"
                                  onChange={e => setMicroOverrides(prev => ({
                                    ...prev,
                                    [selectedClient.id]: { ...(prev[selectedClient.id] || {}), [micro.key]: +e.target.value || 0 }
                                  }))}
                                  className="w-16 text-xs border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-800 text-center"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* MINERALS */}
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 mt-3">Minerals</div>
                        <div className="space-y-2">
                          {MICROS_LIST.filter(m => m.category === "Minerals").map(micro => {
                            const got = totalMicros[micro.key] || 0;
                            const target = rdi[micro.key] || 0;
                            const pct = target > 0 ? Math.min((got / target) * 100, 100) : 0;
                            const color = pct >= 100 ? "#0d7a5f" : pct >= 50 ? "#f59e0b" : "#ef4444";
                            const manualVal = clientOverrides[micro.key] || "";
                            return (
                              <div key={micro.key} className="flex items-center gap-2">
                                <div className="w-28 text-xs text-gray-600 dark:text-gray-300 shrink-0 truncate" title={micro.name}>{micro.name}</div>
                                <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                  <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                </div>
                                <div className="text-xs w-20 text-right shrink-0" style={{ color }}>
                                  {got.toFixed(1)} / {target} {micro.unit}
                                </div>
                                <input
                                  type="number" min="0" step="any"
                                  value={manualVal}
                                  placeholder="+add"
                                  onChange={e => setMicroOverrides(prev => ({
                                    ...prev,
                                    [selectedClient.id]: { ...(prev[selectedClient.id] || {}), [micro.key]: +e.target.value || 0 }
                                  }))}
                                  className="w-16 text-xs border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-800 text-center"
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mt-2">💡 "+add" column: manually enter extra intake (supplements, unlisted foods) in {" "}{"{unit}"} per nutrient.</p>
                    </div>
                  );
                })()}
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
        {tab === "micros" && (
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm">
              <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                <BarChart2 size={18} className="text-purple-500" />
                Micronutrient Tracker
              </h2>
              <p className="text-xs text-gray-400 mb-3">Based on current planner meals. Select a client for their RDI targets.</p>

              {/* Client selector */}
              <div className="mb-4">
                <label className="text-xs text-gray-500">Client RDI Profile</label>
                <select
                  value={microsClientId ?? ""}
                  onChange={e => setMicrosClientId(e.target.value ? +e.target.value : null)}
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1"
                >
                  <option value="">— Use default (adult male) —</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {(() => {
                const clientForMicros = clients.find(c => c.id === microsClientId) || null;
                const rdi = getRDI(clientForMicros ?? { gender: "male", age: 30, isTraining: true, isPregnant: false, pregnancyMonth: 0, isLactating: false });
                const clientOverrides = microOverrides[clientForMicros?.id ?? -1] || {};

                // Build planMicros AND microSources from current meals
                const planMicros: Record<string, number> = {};
                const microSources: Record<string, { name: string; amount: number; unit: string }[]> = {};

                meals.forEach(meal => {
                  meal.items.forEach(item => {
                    const fd = allFoodsForTracking.find(f => f.id === item.id);
                    if (!fd || !fd.micros) return;
                    const mult = isPerPiece(fd.state) ? item.grams : item.grams / 100;
                    Object.entries(fd.micros).forEach(([key, val]) => {
                      const contributed = (val as number) * mult;
                      planMicros[key] = (planMicros[key] || 0) + contributed;
                      if (!microSources[key]) microSources[key] = [];
                      const existing = microSources[key].find(s => s.name === fd.name);
                      if (existing) {
                        existing.amount += contributed;
                      } else {
                        microSources[key].push({ name: fd.name, amount: contributed, unit: "" });
                      }
                    });
                  });
                });

                const totalMicros: Record<string, number> = { ...planMicros };
                Object.entries(clientOverrides).forEach(([k, v]) => {
                  totalMicros[k] = (totalMicros[k] || 0) + (v as number);
                });

                return (
                  <div className="space-y-6">
                    {(["Vitamins", "Minerals", "Fatty Acids"] as const).map(cat => (
                      <div key={cat}>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{cat}</div>
                        <div className="space-y-3">
                          {MICROS_LIST.filter(m => m.category === cat).map(micro => {
                            const got = totalMicros[micro.key] || 0;
                            const target = rdi[micro.key] || 0;
                            const pct = target > 0 ? Math.min((got / target) * 100, 100) : 0;
                            const color = pct >= 100 ? "#0d7a5f" : pct >= 50 ? "#f59e0b" : "#ef4444";
                            const sources = (microSources[micro.key] || [])
                              .filter(s => s.amount > 0.01)
                              .sort((a, b) => b.amount - a.amount)
                              .slice(0, 4);
                            const manualVal = clientOverrides[micro.key] || "";
                            return (
                              <div key={micro.key} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <div className="w-28 text-xs font-medium text-gray-700 dark:text-gray-200 shrink-0 truncate" title={micro.name}>{micro.name}</div>
                                  <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
                                  </div>
                                  <div className="text-xs w-24 text-right shrink-0 font-medium" style={{ color }}>
                                    {got.toFixed(1)} / {target} {micro.unit}
                                  </div>
                                  <input
                                    type="number" min="0" step="any"
                                    value={manualVal}
                                    placeholder="+add"
                                    onChange={e => { const cid = clientForMicros?.id ?? -1; setMicroOverrides(prev => ({ ...prev, [cid]: { ...(prev[cid] || {}), [micro.key]: +e.target.value || 0 } })); }}
                                    className="w-16 text-xs border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 bg-white dark:bg-gray-700 text-center"
                                  />
                                </div>
                                {sources.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1 pl-28">
                                    {sources.map((s, i) => (
                                      <span key={i} className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 text-gray-500 dark:text-gray-400">
                                        {s.name.split(" - ")[0]} · {s.amount.toFixed(1)}{micro.unit}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-gray-400">💡 "+add" to manually log supplements or unlisted foods.</p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// ─── SORTABLE MEAL WRAPPER ──────────────────────────────────────────────────────
function SortableMealWrapper({ mealId, children }: { mealId: string; children: (dragHandleProps: React.HTMLAttributes<HTMLElement>) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: mealId });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {children({ ...listeners })}
    </div>
  );
}
