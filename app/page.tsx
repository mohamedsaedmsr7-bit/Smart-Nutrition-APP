"use client";
import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  BookOpen, ImagePlus, Download, Upload, X, Clock, Cloud, CloudOff, RefreshCw,
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: Parameters<typeof clsx>) { return twMerge(clsx(inputs)); }

// ─── FOOD DATABASE ────────────────────────────────────────────────────────────
interface FoodEntry {
  id: number; name: string; category: string; state: string;
  carbs: number; protein: number; fat: number; calories: number;
  micros?: Partial<Record<string, number>>; // per 100g (or per piece for per-piece items)
  recipeId?: number; // set when this food item IS a saved recipe (per serving)
}

const FOOD_DATABASE: FoodEntry[] = [
  // ── PROTEINS ──────────────────────────────────────────────────────────────
  { id: 101, name: "Chicken Breast - صدر دجاج", category: "Protein", state: "per 100g", carbs: 0, protein: 31, fat: 3.6, calories: 165, micros: { vitB3: 13.4, vitB6: 1.0, vitB12: 0.3, vitB5: 1.5, phosphorus: 220, selenium: 22, zinc: 1.0, potassium: 340, iron: 0.7, magnesium: 29, saturatedFat: 1.0, omega3: 0.04, omega6: 0.65 } },
  { id: 102, name: "Chicken Thigh - فخذ دجاج", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 10.9, calories: 209, micros: { vitB3: 6.3, vitB6: 0.6, vitB12: 0.3, phosphorus: 180, selenium: 18, zinc: 1.5, potassium: 280, iron: 1.2, magnesium: 24, saturatedFat: 3.0, omega3: 0.1, omega6: 2.0 } },
  { id: 103, name: "Ground Beef (lean) - لحم مفروم", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 7, calories: 172, micros: { vitB12: 2.5, vitB3: 5.5, vitB6: 0.4, iron: 2.5, zinc: 5.4, phosphorus: 200, selenium: 18, potassium: 320, saturatedFat: 2.8, omega3: 0.03, omega6: 0.3 } },
  { id: 104, name: "Beef Steak - ستيك لحم", category: "Protein", state: "per 100g", carbs: 0, protein: 27, fat: 8, calories: 180, micros: { vitB12: 2.5, vitB3: 6.2, vitB6: 0.5, iron: 2.2, zinc: 5.0, phosphorus: 210, selenium: 20, potassium: 330, saturatedFat: 3.2, omega3: 0.03, omega6: 0.25 } },
  { id: 105, name: "Lamb - لحم ضاني", category: "Protein", state: "per 100g", carbs: 0, protein: 25, fat: 14, calories: 218, micros: { vitB12: 2.7, vitB3: 5.7, vitB6: 0.4, iron: 1.9, zinc: 4.2, phosphorus: 195, selenium: 15, potassium: 310, saturatedFat: 5.8, omega3: 0.25, omega6: 0.9 } },
  { id: 106, name: "Tuna (canned in water) - تونة", category: "Protein", state: "per 100g", carbs: 0, protein: 25, fat: 1, calories: 116, micros: { vitB12: 2.5, vitB3: 13.3, vitB6: 0.9, vitD: 4.0, selenium: 80, phosphorus: 195, potassium: 290, magnesium: 31, iron: 1.3, saturatedFat: 0.2, omega3: 0.27, omega6: 0.03 } },
  { id: 107, name: "Salmon - سلمون", category: "Protein", state: "per 100g", carbs: 0, protein: 20, fat: 13, calories: 208, micros: { vitB12: 3.2, vitB3: 8.9, vitB6: 0.8, vitD: 11.1, selenium: 36, phosphorus: 240, potassium: 490, magnesium: 29, iron: 0.8, omega3: 2.3, saturatedFat: 3.2 } },
  { id: 108, name: "Tilapia - بلطي", category: "Protein", state: "per 100g", carbs: 0, protein: 26, fat: 2.7, calories: 128, micros: { vitB12: 1.6, vitB3: 3.9, vitB6: 0.2, vitD: 1.2, selenium: 40, phosphorus: 185, potassium: 380, magnesium: 28, saturatedFat: 0.9, omega3: 0.2, omega6: 0.15 } },
  { id: 109, name: "Shrimp - جمبري", category: "Protein", state: "per 100g", carbs: 0.9, protein: 24, fat: 0.3, calories: 99, micros: { vitB12: 1.1, vitB3: 2.6, selenium: 38, phosphorus: 205, iodine: 35, zinc: 1.3, iron: 2.4, potassium: 259, saturatedFat: 0.1, omega3: 0.27, omega6: 0.05 } },
  { id: 110, name: "Turkey Breast - ديك رومي", category: "Protein", state: "per 100g", carbs: 0, protein: 29, fat: 1, calories: 135, micros: { vitB12: 1.1, vitB3: 11.8, vitB6: 0.9, selenium: 32, phosphorus: 240, potassium: 330, zinc: 2.0, magnesium: 28, saturatedFat: 0.3, omega3: 0.04, omega6: 0.3 } },
  { id: 111, name: "Sardines - سردين", category: "Protein", state: "per 100g", carbs: 0, protein: 21, fat: 11, calories: 185, micros: { vitB12: 8.9, vitD: 4.8, vitB3: 5.2, calcium: 382, phosphorus: 490, selenium: 53, iron: 2.9, zinc: 1.3, potassium: 397, omega3: 1.4, saturatedFat: 2.5, omega6: 1.4 } },
  { id: 112, name: "Mullet (Boori) - بوري", category: "Protein", state: "per 100g cooked", carbs: 0, protein: 25.6, fat: 4.9, calories: 150, micros: { vitB12: 1.5, vitB3: 6.5, selenium: 45, phosphorus: 260, potassium: 420, magnesium: 35, iron: 1.0, omega3: 0.5, omega6: 0.4, saturatedFat: 1.3 } },
  { id: 113, name: "Mackerel - ماكريل", category: "Protein", state: "per 100g cooked", carbs: 0, protein: 24, fat: 18, calories: 260, micros: { vitB12: 19, vitD: 16, vitB3: 9.1, selenium: 51, phosphorus: 217, potassium: 520, magnesium: 97, iron: 1.6, calcium: 15, omega3: 3.0, omega6: 0.4, saturatedFat: 4.2 } },
  // ── EGGS ─────────────────────────────────────────────────────────────────
  { id: 120, name: "Whole Egg - بيضة كاملة", category: "Eggs", state: "per 100g", carbs: 1.1, protein: 13, fat: 10, calories: 143, micros: { vitA: 149, vitD: 2.0, vitB12: 1.1, vitB2: 0.46, vitB7: 20, vitK: 0.3, selenium: 30, phosphorus: 198, zinc: 1.3, iron: 1.8, choline: 294, saturatedFat: 3.1, omega3: 0.08, omega6: 1.15 } },
  { id: 121, name: "Egg White - بياض البيض", category: "Eggs", state: "per 100g", carbs: 0.7, protein: 11, fat: 0.2, calories: 52, micros: { vitB2: 0.44, selenium: 20, potassium: 163, magnesium: 11, saturatedFat: 0 } },
  { id: 122, name: "Egg Yolk - صفار البيض", category: "Eggs", state: "per 100g", carbs: 3.6, protein: 16, fat: 27, calories: 322, micros: { vitA: 381, vitD: 5.4, vitB12: 2.5, vitB7: 53, vitK: 0.7, selenium: 56, phosphorus: 390, zinc: 2.5, iron: 2.7, saturatedFat: 9.6, omega3: 0.2, omega6: 3.3 } },
  { id: 123, name: "Boiled Egg - بيضة مسلوقة", category: "Eggs", state: "per piece", carbs: 0.6, protein: 6.3, fat: 5, calories: 72, micros: { vitA: 74, vitD: 1.0, vitB12: 0.6, vitB2: 0.23, vitB7: 10, selenium: 15, phosphorus: 95, zinc: 0.6, iron: 0.8, saturatedFat: 1.6, omega3: 0.04, omega6: 0.55 } },
  { id: 124, name: "Fried Egg - بيضة مقلية", category: "Eggs", state: "per piece", carbs: 0.4, protein: 6.3, fat: 7, calories: 90, micros: { vitA: 74, vitD: 1.0, vitB12: 0.6, selenium: 15, phosphorus: 95, zinc: 0.6, iron: 0.8, saturatedFat: 2.0, omega3: 0.04, omega6: 0.9 } },
  { id: 125, name: "Scrambled Egg - بيض مخفوق", category: "Eggs", state: "per piece", carbs: 1.4, protein: 6.8, fat: 7.5, calories: 102, micros: { vitA: 75, vitD: 1.0, vitB12: 0.6, selenium: 15, phosphorus: 100, zinc: 0.6, iron: 0.8, saturatedFat: 2.2, omega3: 0.05, omega6: 0.8 } },
  { id: 126, name: "Egg White only - بياض بيضة", category: "Eggs", state: "per piece", carbs: 0.2, protein: 3.6, fat: 0.1, calories: 17, micros: { vitB2: 0.15, selenium: 7, potassium: 54, saturatedFat: 0 } },
  { id: 127, name: "Raw Whole Egg - بيضة كاملة نية", category: "Eggs", state: "per piece", carbs: 0.6, protein: 6, fat: 5, calories: 70, micros: { vitA: 74, vitD: 1.0, vitB12: 0.6, vitB2: 0.23, vitB7: 10, selenium: 15, phosphorus: 95, zinc: 0.6, iron: 0.8, saturatedFat: 1.6, omega3: 0.04, omega6: 0.55 } },
  // ── DAIRY ────────────────────────────────────────────────────────────────
  { id: 201, name: "Low-Fat Yogurt - زبادي قليل الدسم", category: "Dairy", state: "per 100g", carbs: 7, protein: 5, fat: 1.5, calories: 61, micros: { calcium: 183, vitB12: 0.75, vitB2: 0.23, phosphorus: 144, potassium: 255, iodine: 25, selenium: 3, magnesium: 17, saturatedFat: 0.9, omega3: 0.01, omega6: 0.03 } },
  { id: 202, name: "Full-Fat Yogurt - زبادي كامل الدسم", category: "Dairy", state: "per 100g", carbs: 4.7, protein: 3.5, fat: 3.3, calories: 61, micros: { calcium: 121, vitB12: 0.4, vitB2: 0.14, phosphorus: 94, potassium: 141, iodine: 20, magnesium: 11, saturatedFat: 2.1, omega3: 0.03, omega6: 0.1 } },
  { id: 203, name: "Cottage Cheese - جبن قريش", category: "Dairy", state: "per 100g", carbs: 3.4, protein: 11, fat: 4, calories: 98, micros: { calcium: 83, vitB12: 0.43, vitB2: 0.16, phosphorus: 159, selenium: 10, sodium: 364, potassium: 104, saturatedFat: 1.7, omega3: 0.02, omega6: 0.07 } },
  { id: 204, name: "Feta Cheese - جبن فيتا", category: "Dairy", state: "per 100g", carbs: 4, protein: 14, fat: 21, calories: 264, micros: { calcium: 493, saturatedFat: 14.9, sodium: 917, omega3: 0.05, omega6: 0.5 } },
  { id: 205, name: "Cheddar Cheese - جبن شيدر", category: "Dairy", state: "per 100g", carbs: 1.3, protein: 25, fat: 33, calories: 402, micros: { calcium: 721, saturatedFat: 21.0, sodium: 621, omega3: 0.3, omega6: 0.6 } },
  { id: 206, name: "Mozzarella - موزاريلا", category: "Dairy", state: "per 100g", carbs: 2.2, protein: 22, fat: 17, calories: 254, micros: { calcium: 505, saturatedFat: 11.0, sodium: 486, omega3: 0.15, omega6: 0.4 } },
  { id: 207, name: "Cream Cheese - كريم تشيز", category: "Dairy", state: "per 100g", carbs: 4.1, protein: 6.2, fat: 34, calories: 350, micros: { saturatedFat: 20.0, calcium: 98, omega3: 0.3, omega6: 1.1 } },
  { id: 208, name: "Butter - زبدة", category: "Dairy", state: "per 100g", carbs: 0.1, protein: 0.9, fat: 80, calories: 717, micros: { saturatedFat: 51.4, omega3: 0.3, omega6: 2.7 } },
  { id: 209, name: "Labneh - لبنة", category: "Dairy", state: "per 100g", carbs: 4, protein: 7, fat: 5, calories: 89, micros: { calcium: 150, saturatedFat: 3.2, omega3: 0.05, omega6: 0.15 } },
  { id: 210, name: "Whipping Cream - كريمة خفق", category: "Dairy", state: "per 100g", carbs: 3.6, protein: 2.5, fat: 36, calories: 340, micros: { saturatedFat: 23.0, omega3: 0.2, omega6: 0.9 } },
  { id: 211, name: "Greek Yogurt (low-fat) - زبادي يوناني", category: "Dairy", state: "per 100g", carbs: 4, protein: 10, fat: 0.7, calories: 59, micros: { calcium: 110, vitB12: 0.75, saturatedFat: 0.4, omega3: 0.01, omega6: 0.02 } },
  { id: 212, name: "Greek Yogurt (full-fat) - زبادي يوناني كامل", category: "Dairy", state: "per 100g", carbs: 3.6, protein: 9, fat: 5, calories: 97, micros: { calcium: 100, vitB12: 0.75, saturatedFat: 3.2, omega3: 0.04, omega6: 0.12 } },
  { id: 213, name: "Rayeb Yogurt - رايب", category: "Dairy", state: "per 100g", carbs: 5, protein: 3.5, fat: 3, calories: 60, micros: { calcium: 118, saturatedFat: 1.9, omega3: 0.03, omega6: 0.08 } },
  { id: 214, name: "Light Cream Cheese - كريم تشيز لايت", category: "Dairy", state: "per 100g", carbs: 5, protein: 9, fat: 8, calories: 125, micros: { calcium: 100, sodium: 420, saturatedFat: 5.2, omega3: 0.1, omega6: 0.3 } },
  { id: 215, name: "Low-Salt White Cheese (low-fat) - جبنة بيضاء قليلة الملح قليلة الدسم", category: "Dairy", state: "per 100g", carbs: 3, protein: 17, fat: 9, calories: 170, micros: { calcium: 450, sodium: 350, phosphorus: 300, vitB12: 1.0, saturatedFat: 5.8, omega3: 0.05, omega6: 0.2 } },
  { id: 216, name: "Low-Salt White Cheese (full-fat) - جبنة بيضاء قليلة الملح", category: "Dairy", state: "per 100g", carbs: 3, protein: 14, fat: 20, calories: 248, micros: { calcium: 450, sodium: 350, phosphorus: 280, vitB12: 1.0, saturatedFat: 13, omega3: 0.1, omega6: 0.5 } },
  // ── MILK ──────────────────────────────────────────────────────────────────
  { id: 412, name: "Whole Milk - حليب كامل الدسم", category: "Milk", state: "per 100ml", carbs: 4.7, protein: 3.2, fat: 3.6, calories: 61, micros: { calcium: 113, vitB12: 0.45, vitB2: 0.16, vitD: 1.0, potassium: 150, saturatedFat: 2.3, omega3: 0.07, omega6: 0.12 } },
  { id: 413, name: "Skim Milk - حليب خالي الدسم", category: "Milk", state: "per 100ml", carbs: 5.0, protein: 3.5, fat: 0.2, calories: 36, micros: { calcium: 125, vitB12: 0.5, vitB2: 0.18, vitD: 1.0, potassium: 160, saturatedFat: 0.1 } },
  { id: 414, name: "Semi-Skim Milk - حليب نصف دسم", category: "Milk", state: "per 100ml", carbs: 4.8, protein: 3.3, fat: 1.8, calories: 47, micros: { calcium: 120, vitB12: 0.45, vitB2: 0.17, vitD: 1.0, potassium: 155, saturatedFat: 1.1, omega3: 0.04, omega6: 0.06 } },
  { id: 415, name: "Almarai Protein Milk - حليب ألمراي بروتين", category: "Milk", state: "per 100ml", carbs: 5.0, protein: 5.0, fat: 0.2, calories: 42, micros: { calcium: 130, vitB12: 0.5, vitD: 1.0, potassium: 160, saturatedFat: 0.1 } },
  { id: 416, name: "Oat Milk - حليب الشوفان", category: "Milk", state: "per 100ml", carbs: 7.0, protein: 1.0, fat: 1.5, calories: 45, micros: { calcium: 120, fiber: 0.8, saturatedFat: 0.2 } },
  { id: 417, name: "Almond Milk (unsweetened) - حليب اللوز", category: "Milk", state: "per 100ml", carbs: 1.2, protein: 0.4, fat: 1.5, calories: 20, micros: { calcium: 150, fiber: 0.4, saturatedFat: 0.1 } },
  // ── CARBS ─────────────────────────────────────────────────────────────────
  { id: 301, name: "White Rice - أرز أبيض", category: "Carbs", state: "per 100g cooked", carbs: 28, protein: 2.7, fat: 0.3, calories: 130, micros: { vitB1: 0.02, vitB3: 0.4, vitB9: 3, iron: 0.2, magnesium: 12, phosphorus: 43, potassium: 35, selenium: 7.5, fiber: 0.4, saturatedFat: 0.1 } },
  { id: 302, name: "Brown Rice - أرز بني", category: "Carbs", state: "per 100g cooked", carbs: 23, protein: 2.6, fat: 0.9, calories: 112, micros: { vitB1: 0.1, vitB3: 1.5, vitB6: 0.15, vitE: 0.1, magnesium: 44, phosphorus: 83, potassium: 79, selenium: 9.8, manganese: 0.9, zinc: 0.6, fiber: 1.8, saturatedFat: 0.2, omega3: 0.01, omega6: 0.3 } },
  { id: 303, name: "Oats - شوفان", category: "Carbs", state: "per 100g dry", carbs: 66, protein: 17, fat: 7, calories: 389, micros: { vitB1: 0.76, vitB5: 1.35, vitB9: 56, iron: 4.72, magnesium: 177, phosphorus: 523, potassium: 429, zinc: 3.97, manganese: 4.91, selenium: 28.9, copper: 626, fiber: 10.6, saturatedFat: 1.2, omega3: 0.1, omega6: 2.4 } },
  { id: 304, name: "Whole Wheat Bread - خبز قمح كامل", category: "Carbs", state: "per 100g", carbs: 43, protein: 9, fat: 3.4, calories: 247, micros: { vitB1: 0.4, vitB3: 4.2, vitB9: 44, iron: 2.8, magnesium: 76, phosphorus: 212, potassium: 248, zinc: 1.8, selenium: 26, manganese: 2.7, fiber: 6.0, saturatedFat: 0.7, omega3: 0.07, omega6: 0.7 } },
  { id: 305, name: "White Bread - خبز أبيض", category: "Carbs", state: "per 100g", carbs: 49, protein: 9, fat: 3.2, calories: 265, micros: { vitB1: 0.5, vitB3: 4.5, vitB9: 100, iron: 3.6, calcium: 260, selenium: 22, phosphorus: 108, fiber: 2.7, saturatedFat: 0.7, omega3: 0.1, omega6: 0.8 } },
  { id: 306, name: "Pasta - مكرونة", category: "Carbs", state: "per 100g cooked", carbs: 25, protein: 5, fat: 0.9, calories: 131, micros: { vitB1: 0.09, vitB3: 1.0, vitB9: 7, iron: 0.5, magnesium: 15, phosphorus: 56, selenium: 18.4, fiber: 1.8, saturatedFat: 0.1, omega3: 0.01, omega6: 0.2 } },
  { id: 307, name: "Whole Wheat Pasta - مكرونة قمح كامل", category: "Carbs", state: "per 100g cooked", carbs: 23, protein: 5.5, fat: 0.8, calories: 124, micros: { vitB1: 0.15, vitB3: 1.6, vitB9: 13, iron: 1.4, magnesium: 45, phosphorus: 125, zinc: 1.1, manganese: 1.3, selenium: 20, fiber: 4.5, saturatedFat: 0.1, omega3: 0.02, omega6: 0.3 } },
  { id: 308, name: "Sweet Potato - بطاطا حلوة", category: "Carbs", state: "per 100g", carbs: 20, protein: 1.6, fat: 0.1, calories: 86, micros: { vitA: 961, vitC: 2.4, vitB5: 0.8, vitB6: 0.29, vitE: 0.26, vitB9: 11, potassium: 337, magnesium: 25, phosphorus: 47, manganese: 0.26, calcium: 30, fiber: 3.0, saturatedFat: 0 } },
  { id: 309, name: "White Potato - بطاطس", category: "Carbs", state: "per 100g", carbs: 17, protein: 2, fat: 0.1, calories: 77, micros: { vitC: 19.7, vitB6: 0.3, vitB9: 16, vitB3: 1.44, potassium: 421, magnesium: 23, phosphorus: 57, iron: 0.78, fiber: 2.1, saturatedFat: 0 } },
  { id: 310, name: "Bread (Baladi) - خبز بلدي", category: "Carbs", state: "per 100g", carbs: 52, protein: 8, fat: 1.5, calories: 253, micros: { vitB1: 0.35, vitB3: 3.8, vitB9: 80, iron: 3.2, calcium: 200, selenium: 20, phosphorus: 100, fiber: 5.0, saturatedFat: 0.3, omega3: 0.03, omega6: 0.4 } },
  { id: 311, name: "Quinoa - كينوا", category: "Carbs", state: "per 100g cooked", carbs: 22, protein: 4, fat: 1.9, calories: 120, micros: { vitB1: 0.1, vitB2: 0.11, vitB9: 42, vitE: 0.6, iron: 1.49, magnesium: 64, phosphorus: 152, zinc: 1.09, potassium: 172, manganese: 0.63, copper: 199, fiber: 2.8, saturatedFat: 0.2, omega3: 0.1, omega6: 0.9 } },
  { id: 312, name: "Lentils (cooked) - عدس", category: "Carbs", state: "per 100g", carbs: 20, protein: 9, fat: 0.4, calories: 116, micros: { vitB1: 0.17, vitB6: 0.18, vitB9: 181, iron: 3.33, magnesium: 36, phosphorus: 180, potassium: 369, zinc: 1.27, manganese: 0.49, copper: 251, selenium: 2.8, fiber: 7.9, saturatedFat: 0.1, omega3: 0.05, omega6: 0.15 } },
  { id: 313, name: "Chickpeas (cooked) - حمص", category: "Carbs", state: "per 100g", carbs: 27, protein: 9, fat: 2.6, calories: 164, micros: { vitB6: 0.14, vitB9: 172, vitB5: 0.29, iron: 2.89, magnesium: 48, phosphorus: 168, potassium: 291, zinc: 1.53, manganese: 1.03, copper: 352, selenium: 3.7, fiber: 7.6, saturatedFat: 0.3, omega3: 0.1, omega6: 1.0 } },
  { id: 314, name: "Fava Beans (Ful) - فول مدمس", category: "Carbs", state: "per 100g", carbs: 26, protein: 8, fat: 0.5, calories: 110, micros: { vitB1: 0.15, vitB9: 148, vitC: 1.4, iron: 1.9, magnesium: 43, phosphorus: 125, potassium: 332, zinc: 1.0, copper: 180, manganese: 0.54, fiber: 5.4, saturatedFat: 0.1, omega3: 0.03, omega6: 0.2 } },
  { id: 315, name: "Corn - ذرة", category: "Carbs", state: "per 100g", carbs: 19, protein: 3.2, fat: 1.2, calories: 96, micros: { vitC: 6.8, vitB1: 0.2, vitB3: 1.77, vitB9: 42, vitB5: 0.72, magnesium: 37, phosphorus: 89, potassium: 270, zinc: 0.45, manganese: 0.16, fiber: 2.4, saturatedFat: 0.2, omega3: 0.02, omega6: 0.5 } },
  { id: 316, name: "Sweet Potato (boiled) - بطاطا مسلوقة", category: "Carbs", state: "per 100g", carbs: 17.7, protein: 1.4, fat: 0.1, calories: 76, micros: { vitA: 787, vitC: 12.8, vitB6: 0.24, vitB5: 0.5, vitB9: 6, potassium: 230, magnesium: 18, phosphorus: 32, manganese: 0.26, calcium: 27, fiber: 2.5, saturatedFat: 0 } },
  { id: 317, name: "Pasta with Tomato Sauce (boiled) - مكرونة بصلصة الطماطم", category: "Carbs", state: "per 100g cooked", carbs: 24, protein: 4.7, fat: 1.5, calories: 130, micros: { vitC: 2.5, vitA: 12, vitK: 3, vitB9: 10, iron: 0.6, magnesium: 16, phosphorus: 55, potassium: 120, selenium: 14, fiber: 2.0, saturatedFat: 0.3, omega6: 0.3 } },
  { id: 318, name: "Tortilla Bread (wheat) - خبز تورتيلا", category: "Carbs", state: "per 100g", carbs: 50, protein: 8.5, fat: 8, calories: 306, micros: { vitB1: 0.6, vitB3: 4.5, vitB9: 90, iron: 3.5, calcium: 130, magnesium: 25, phosphorus: 120, selenium: 25, fiber: 2.9, saturatedFat: 2.5, omega3: 0.1, omega6: 1.0 } },
  // ── VEGETABLES ────────────────────────────────────────────────────────────
  { id: 501, name: "Broccoli - بروكلي", category: "Vegetables", state: "per 100g", carbs: 7, protein: 2.8, fat: 0.4, calories: 34, micros: { vitC: 89.2, vitK: 101.6, vitA: 31, vitB9: 63, vitB6: 0.18, calcium: 47, potassium: 316, magnesium: 21, iron: 0.73, phosphorus: 66, manganese: 0.21, fiber: 2.6, saturatedFat: 0.1, omega3: 0.1, omega6: 0.03 } },
  { id: 502, name: "Spinach - سبانخ", category: "Vegetables", state: "per 100g", carbs: 3.6, protein: 2.9, fat: 0.4, calories: 23, micros: { vitK: 482.9, vitA: 469, vitC: 28.1, vitB9: 194, vitE: 2.0, iron: 2.71, calcium: 99, magnesium: 79, potassium: 558, manganese: 0.9, fiber: 2.2, saturatedFat: 0.1, omega3: 0.14, omega6: 0.03 } },
  { id: 503, name: "Cucumber - خيار", category: "Vegetables", state: "per 100g", carbs: 3.6, protein: 0.7, fat: 0.1, calories: 16, micros: { vitK: 16.4, vitC: 2.8, potassium: 147, magnesium: 13, vitB5: 0.26, fiber: 0.5, saturatedFat: 0 } },
  { id: 504, name: "Tomato - طماطم", category: "Vegetables", state: "per 100g", carbs: 3.9, protein: 0.9, fat: 0.2, calories: 18, micros: { vitC: 13.7, vitA: 42, vitK: 7.9, vitB9: 15, potassium: 237, magnesium: 11, iron: 0.27, fiber: 1.2, saturatedFat: 0 } },
  { id: 505, name: "Lettuce - خس", category: "Vegetables", state: "per 100g", carbs: 2.9, protein: 1.4, fat: 0.2, calories: 15, micros: { vitK: 102.3, vitA: 166, vitC: 9.2, vitB9: 73, calcium: 36, iron: 0.86, fiber: 1.3, saturatedFat: 0, omega3: 0.05, omega6: 0.04 } },
  { id: 506, name: "Bell Pepper - فلفل رومي", category: "Vegetables", state: "per 100g", carbs: 6, protein: 1, fat: 0.3, calories: 31, micros: { vitC: 127.7, vitA: 157, vitB6: 0.29, vitK: 4.9, vitB9: 46, potassium: 211, magnesium: 12, fiber: 2.1, saturatedFat: 0.1 } },
  { id: 507, name: "Cauliflower - قرنبيط", category: "Vegetables", state: "per 100g", carbs: 5, protein: 1.9, fat: 0.3, calories: 25, micros: { vitC: 48.2, vitK: 15.5, vitB9: 57, vitB6: 0.18, potassium: 299, magnesium: 15, fiber: 2.0, saturatedFat: 0.1 } },
  { id: 508, name: "Green Beans - فاصوليا خضراء", category: "Vegetables", state: "per 100g", carbs: 7, protein: 1.8, fat: 0.1, calories: 31, micros: { vitK: 43, vitC: 12.2, vitA: 35, vitB9: 37, calcium: 37, iron: 1.03, magnesium: 25, potassium: 211, fiber: 2.7, saturatedFat: 0 } },
  { id: 509, name: "Zucchini - كوسة", category: "Vegetables", state: "per 100g", carbs: 3.1, protein: 1.2, fat: 0.3, calories: 17, micros: { vitC: 17.9, vitB6: 0.16, vitA: 10, potassium: 261, magnesium: 18, manganese: 0.18, fiber: 1.0, saturatedFat: 0 } },
  { id: 510, name: "Eggplant - باذنجان", category: "Vegetables", state: "per 100g", carbs: 5.9, protein: 1, fat: 0.2, calories: 25, micros: { vitB9: 22, vitK: 3.5, vitC: 2.2, potassium: 229, magnesium: 14, manganese: 0.25, fiber: 3.0, saturatedFat: 0 } },
  { id: 511, name: "Carrots - جزر", category: "Vegetables", state: "per 100g", carbs: 10, protein: 0.9, fat: 0.2, calories: 41, micros: { vitA: 835, vitK: 13.2, vitC: 5.9, vitB9: 19, potassium: 320, magnesium: 12, calcium: 33, iron: 0.30, fiber: 2.8, saturatedFat: 0 } },
  { id: 512, name: "Onion - بصل", category: "Vegetables", state: "per 100g", carbs: 9.3, protein: 1.1, fat: 0.1, calories: 40, micros: { vitC: 7.4, vitB6: 0.12, vitB9: 19, potassium: 146, calcium: 23, fiber: 1.7, saturatedFat: 0 } },
  { id: 513, name: "Garlic - ثوم", category: "Vegetables", state: "per 100g", carbs: 33, protein: 6.4, fat: 0.5, calories: 149, micros: { vitC: 31.2, vitB6: 1.24, vitB1: 0.2, calcium: 181, iron: 1.7, magnesium: 25, phosphorus: 153, potassium: 401, selenium: 14.2, manganese: 1.67, fiber: 2.1, saturatedFat: 0.1 } },
  { id: 514, name: "Mushrooms - فطر", category: "Vegetables", state: "per 100g", carbs: 3.3, protein: 3.1, fat: 0.3, calories: 22, micros: { vitD: 0.2, vitB2: 0.4, vitB3: 3.6, vitB5: 1.5, vitB9: 17, selenium: 9.3, phosphorus: 86, potassium: 318, copper: 305, iron: 0.5, fiber: 1.0, saturatedFat: 0.1 } },
  { id: 515, name: "Peas - بازلاء", category: "Vegetables", state: "per 100g", carbs: 14, protein: 5.4, fat: 0.4, calories: 81, micros: { vitC: 40, vitK: 24.8, vitB1: 0.27, vitB9: 65, vitB6: 0.17, iron: 1.47, magnesium: 33, phosphorus: 108, potassium: 244, zinc: 1.24, fiber: 5.7, saturatedFat: 0.1 } },
  { id: 516, name: "Molokhia - ملوخية", category: "Vegetables", state: "per 100g", carbs: 7, protein: 4.5, fat: 0.7, calories: 43, micros: { vitK: 700, vitA: 467, vitC: 33, vitB9: 102, calcium: 208, iron: 3.0, magnesium: 75, potassium: 525, fiber: 3.5, saturatedFat: 0.1 } },
  { id: 517, name: "Arugula (Rocket) - جرجير", category: "Vegetables", state: "per 100g", carbs: 3.7, protein: 2.6, fat: 0.7, calories: 25, micros: { vitK: 108.6, vitA: 119, vitC: 15, vitB9: 97, calcium: 160, iron: 1.46, magnesium: 47, potassium: 369, fiber: 1.6, saturatedFat: 0.1, omega3: 0.17, omega6: 0.1 } },
  { id: 518, name: "Parsley - بقدونس", category: "Vegetables", state: "per 100g", carbs: 6.3, protein: 3, fat: 0.8, calories: 36, micros: { vitK: 1640, vitC: 133, vitA: 421, vitB9: 152, iron: 6.2, calcium: 138, potassium: 554, magnesium: 50, fiber: 3.3, saturatedFat: 0.1 } },
  { id: 519, name: "Green Pepper - فلفل أخضر", category: "Vegetables", state: "per 100g", carbs: 4.6, protein: 0.9, fat: 0.2, calories: 20, micros: { vitC: 80.4, vitA: 18, vitK: 7.4, vitB6: 0.22, vitB9: 10, potassium: 175, magnesium: 10, fiber: 1.7, saturatedFat: 0.1 } },
  { id: 520, name: "Cabbage - كرنب", category: "Vegetables", state: "per 100g", carbs: 5.8, protein: 1.3, fat: 0.1, calories: 25, micros: { vitC: 36.6, vitK: 76, vitB9: 43, vitB6: 0.12, calcium: 40, potassium: 170, magnesium: 12, fiber: 2.5, saturatedFat: 0, omega3: 0.03 } },
  { id: 521, name: "Okra - بامية", category: "Vegetables", state: "per 100g", carbs: 7.5, protein: 1.9, fat: 0.2, calories: 33, micros: { vitC: 23, vitK: 31, vitB9: 60, vitB6: 0.2, calcium: 82, magnesium: 57, potassium: 299, manganese: 0.8, fiber: 3.2, saturatedFat: 0 } },
  { id: 522, name: "Radish - فجل", category: "Vegetables", state: "per 100g", carbs: 3.4, protein: 0.7, fat: 0.1, calories: 16, micros: { vitC: 14.8, vitB9: 25, potassium: 233, calcium: 25, magnesium: 10, fiber: 1.6, saturatedFat: 0 } },
  { id: 523, name: "Beetroot (boiled) - بنجر مسلوق", category: "Vegetables", state: "per 100g", carbs: 10, protein: 1.7, fat: 0.2, calories: 44, micros: { vitB9: 80, vitC: 3.6, potassium: 305, magnesium: 23, manganese: 0.33, iron: 0.8, phosphorus: 38, fiber: 2.0, saturatedFat: 0 } },
  { id: 524, name: "Pumpkin - قرع عسلي", category: "Vegetables", state: "per 100g", carbs: 6.5, protein: 1, fat: 0.1, calories: 26, micros: { vitA: 426, vitC: 9, vitE: 0.4, potassium: 340, magnesium: 12, fiber: 0.5, saturatedFat: 0.1 } },
  { id: 525, name: "Mixed Vegetables (boiled) - خضار مسلوقة متنوعة", category: "Vegetables", state: "per 100g", carbs: 7, protein: 2, fat: 0.3, calories: 35, micros: { vitC: 20, vitK: 40, vitA: 250, vitB9: 40, potassium: 220, magnesium: 18, fiber: 2.8, saturatedFat: 0 } },
  { id: 526, name: "Green Salad (no dressing) - سلطة خضراء", category: "Vegetables", state: "per 100g", carbs: 3, protein: 1.2, fat: 0.2, calories: 16, micros: { vitK: 70, vitA: 120, vitC: 12, vitB9: 60, calcium: 40, potassium: 190, magnesium: 14, fiber: 1.3, saturatedFat: 0, omega3: 0.05 } },
  { id: 527, name: "Mixed Salad: Tomato, Cucumber, Green Pepper - سلطة طماطم وخيار وفلفل أخضر", category: "Vegetables", state: "per 100g", carbs: 4, protein: 0.8, fat: 0.2, calories: 18, micros: { vitC: 32, vitK: 10.6, vitA: 22, vitB9: 11, potassium: 186, magnesium: 11, fiber: 1.1, saturatedFat: 0 } },
  // ── FATS ──────────────────────────────────────────────────────────────────
  { id: 601, name: "Olive Oil - زيت زيتون", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 14.35, vitK: 60.2, omega3: 0.76, omega6: 9.76, saturatedFat: 13.8 } },
  { id: 602, name: "Coconut Oil - زيت جوز الهند", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 892, micros: { saturatedFat: 82.5, omega6: 1.8 } },
  { id: 603, name: "Avocado - أفوكادو", category: "Fats", state: "per 100g", carbs: 9, protein: 2, fat: 15, calories: 160, micros: { vitK: 21, vitE: 2.07, vitC: 10, vitB5: 1.39, vitB6: 0.26, vitB9: 81, potassium: 485, magnesium: 29, copper: 190, fiber: 6.7, saturatedFat: 2.1, omega3: 0.1, omega6: 1.7 } },
  { id: 604, name: "Almonds - لوز", category: "Fats", state: "per 100g", carbs: 22, protein: 21, fat: 50, calories: 579, micros: { vitE: 25.6, vitB2: 1.14, vitB3: 3.38, magnesium: 270, calcium: 264, phosphorus: 481, iron: 3.71, zinc: 3.12, copper: 996, manganese: 2.18, selenium: 4.1, fiber: 12.5, saturatedFat: 3.8, omega6: 12.3 } },
  { id: 605, name: "Walnuts - جوز", category: "Fats", state: "per 100g", carbs: 14, protein: 15, fat: 65, calories: 654, micros: { vitB6: 0.54, vitB9: 98, vitE: 0.7, magnesium: 158, phosphorus: 346, iron: 2.91, zinc: 3.09, copper: 1590, manganese: 3.41, omega3: 9.08, fiber: 6.7, saturatedFat: 6.1, omega6: 38.1 } },
  { id: 606, name: "Cashews - كاجو", category: "Fats", state: "per 100g", carbs: 30, protein: 18, fat: 44, calories: 553, micros: { vitK: 34.1, vitB1: 0.42, vitB6: 0.42, vitB9: 25, magnesium: 292, phosphorus: 593, iron: 6.68, zinc: 5.78, copper: 2195, manganese: 1.66, selenium: 19.9, fiber: 3.3, saturatedFat: 7.8, omega3: 0.06, omega6: 7.8 } },
  { id: 607, name: "Peanut Butter - زبدة الفول السوداني", category: "Fats", state: "per 100g", carbs: 20, protein: 25, fat: 50, calories: 588, micros: { vitE: 9.1, vitB3: 13.1, vitB6: 0.44, vitB9: 87, magnesium: 168, phosphorus: 335, potassium: 558, iron: 1.74, zinc: 2.9, copper: 440, fiber: 6.0, saturatedFat: 10.0, omega6: 12.5 } },
  { id: 608, name: "Peanuts - فول سوداني", category: "Fats", state: "per 100g", carbs: 16, protein: 26, fat: 49, calories: 567, micros: { vitE: 8.33, vitB3: 12.07, vitB1: 0.64, vitB9: 240, magnesium: 168, phosphorus: 376, iron: 4.58, zinc: 3.27, copper: 1144, manganese: 1.93, selenium: 7.2, fiber: 8.5, saturatedFat: 6.8, omega6: 15.6 } },
  { id: 609, name: "Sunflower Seeds - بذور عباد الشمس", category: "Fats", state: "per 100g", carbs: 20, protein: 21, fat: 51, calories: 584, micros: { vitE: 35.17, vitB1: 1.48, vitB6: 1.35, vitB9: 227, vitB5: 6.75, magnesium: 325, phosphorus: 660, iron: 5.25, zinc: 5.0, copper: 1800, manganese: 1.95, selenium: 53, omega6: 23.0, fiber: 8.6, saturatedFat: 4.5, omega3: 0.07 } },
  { id: 610, name: "Tahini - طحينة", category: "Fats", state: "per 100g", carbs: 21, protein: 17, fat: 54, calories: 595, micros: { vitB1: 1.0, vitB9: 53, calcium: 426, iron: 8.95, magnesium: 95, phosphorus: 732, zinc: 4.62, copper: 1500, manganese: 1.42, fiber: 9.3, saturatedFat: 7.5, omega3: 0.4, omega6: 21.6 } },
  { id: 611, name: "Flaxseeds - بذور الكتان", category: "Fats", state: "per 100g", carbs: 29, protein: 18, fat: 42, calories: 534, micros: { vitB1: 1.64, vitB9: 87, vitE: 0.31, magnesium: 392, phosphorus: 642, iron: 5.73, zinc: 4.34, copper: 1220, manganese: 2.48, selenium: 25.4, omega3: 22.8, fiber: 27.3, saturatedFat: 3.7, omega6: 5.9 } },
  { id: 612, name: "Chia Seeds - بذور الشيا", category: "Fats", state: "per 100g", carbs: 42, protein: 17, fat: 31, calories: 486, micros: { vitB1: 0.62, vitB3: 8.83, calcium: 631, iron: 7.72, magnesium: 335, phosphorus: 860, zinc: 4.58, copper: 924, manganese: 2.72, selenium: 55.2, omega3: 17.8, fiber: 34.4, saturatedFat: 3.3, omega6: 5.8 } },
  { id: 613, name: "Ghee - سمن بلدي", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 99.8, calories: 900, micros: { vitA: 300, vitD: 1.5, vitK: 8.6, saturatedFat: 62.0, omega3: 0.4, omega6: 3.0 } },
  { id: 614, name: "Sunflower Oil - زيت عباد الشمس", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 41.1, omega6: 65.7, saturatedFat: 11.0, omega3: 0.2 } },
  { id: 615, name: "Corn Oil - زيت الذرة", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 14.3, vitK: 1.9, omega6: 54.0, saturatedFat: 13.0, omega3: 1.2 } },
  { id: 616, name: "Avocado Oil - زيت الأفوكادو", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 884, micros: { vitE: 12.1, vitK: 7.1, omega3: 0.96, saturatedFat: 11.6, omega6: 12.5 } },
  { id: 617, name: "Coconut Oil - زيت جوز الهند (Fats)", category: "Fats", state: "per 100g", carbs: 0, protein: 0, fat: 100, calories: 892, micros: { saturatedFat: 82.5, omega6: 1.8 } },
  // ── FRUITS ────────────────────────────────────────────────────────────────
  { id: 701, name: "Banana - موز", category: "Fruits", state: "per 100g", carbs: 23, protein: 1.1, fat: 0.3, calories: 89, micros: { vitB6: 0.37, vitC: 8.7, vitB9: 20, vitB5: 0.33, potassium: 358, magnesium: 27, manganese: 0.27, copper: 78, fiber: 2.6, saturatedFat: 0.1 } },
  { id: 702, name: "Apple - تفاح", category: "Fruits", state: "per 100g", carbs: 14, protein: 0.3, fat: 0.2, calories: 52, micros: { vitC: 4.6, vitK: 3.2, vitB9: 3, potassium: 107, calcium: 6, fiber: 2.4, saturatedFat: 0 } },
  { id: 703, name: "Orange - برتقال", category: "Fruits", state: "per 100g", carbs: 12, protein: 0.9, fat: 0.1, calories: 47, micros: { vitC: 53.2, vitB9: 30, vitA: 11, vitB1: 0.09, potassium: 181, calcium: 40, magnesium: 10, fiber: 2.4, saturatedFat: 0 } },
  { id: 704, name: "Mango - مانجو", category: "Fruits", state: "per 100g", carbs: 15, protein: 0.8, fat: 0.4, calories: 60, micros: { vitC: 36.4, vitA: 54, vitB6: 0.12, vitK: 4.2, vitB9: 43, vitE: 0.9, potassium: 168, magnesium: 10, copper: 111, fiber: 1.6, saturatedFat: 0.1 } },
  { id: 705, name: "Strawberry - فراولة", category: "Fruits", state: "per 100g", carbs: 8, protein: 0.7, fat: 0.3, calories: 32, micros: { vitC: 58.8, vitK: 2.2, vitB9: 24, manganese: 0.39, potassium: 153, magnesium: 13, fiber: 2.0, saturatedFat: 0 } },
  { id: 706, name: "Watermelon - بطيخ", category: "Fruits", state: "per 100g", carbs: 8, protein: 0.6, fat: 0.2, calories: 30, micros: { vitC: 8.1, vitA: 28, vitB5: 0.22, potassium: 112, magnesium: 10, copper: 42, fiber: 0.4, saturatedFat: 0 } },
  { id: 707, name: "Grapes - عنب", category: "Fruits", state: "per 100g", carbs: 18, protein: 0.7, fat: 0.2, calories: 69, micros: { vitK: 14.6, vitC: 3.2, vitB6: 0.09, vitB9: 2, potassium: 191, copper: 127, fiber: 0.9, saturatedFat: 0.1 } },
  { id: 708, name: "Dates - تمر", category: "Fruits", state: "per 100g", carbs: 75, protein: 1.8, fat: 0.2, calories: 282, micros: { vitB5: 0.81, vitB6: 0.25, vitB3: 1.27, vitK: 2.7, vitB9: 15, potassium: 696, magnesium: 54, copper: 362, manganese: 0.3, iron: 0.9, fiber: 7.0, saturatedFat: 0 } },
  { id: 709, name: "Figs - تين", category: "Fruits", state: "per 100g", carbs: 19, protein: 0.7, fat: 0.3, calories: 74, micros: { vitB6: 0.11, vitK: 4.7, vitB9: 6, calcium: 35, potassium: 232, magnesium: 17, manganese: 0.13, fiber: 2.9, saturatedFat: 0.1 } },
  { id: 710, name: "Pomegranate - رمان", category: "Fruits", state: "per 100g", carbs: 19, protein: 1.7, fat: 1.2, calories: 83, micros: { vitC: 10.2, vitK: 16.4, vitB9: 38, vitB5: 0.38, vitE: 0.6, potassium: 236, magnesium: 12, phosphorus: 36, copper: 158, fiber: 4.0, saturatedFat: 0.2 } },
  { id: 711, name: "Lemon - ليمون", category: "Fruits", state: "per 100g", carbs: 9, protein: 1.1, fat: 0.3, calories: 29, micros: { vitC: 53, vitB6: 0.08, vitB9: 11, calcium: 26, potassium: 138, fiber: 2.8, saturatedFat: 0 } },
  { id: 712, name: "Pineapple - أناناس", category: "Fruits", state: "per 100g", carbs: 13, protein: 0.5, fat: 0.1, calories: 50, micros: { vitC: 47.8, vitB1: 0.08, vitB6: 0.11, vitB9: 18, manganese: 0.93, potassium: 109, magnesium: 12, copper: 110, fiber: 1.4, saturatedFat: 0 } },
  { id: 713, name: "Peach - خوخ", category: "Fruits", state: "per 100g", carbs: 10, protein: 0.9, fat: 0.3, calories: 39, micros: { vitC: 6.6, vitA: 16, vitK: 2.6, vitE: 0.7, vitB3: 0.81, potassium: 190, magnesium: 9, fiber: 1.5, saturatedFat: 0 } },
  { id: 714, name: "Pear - كمثرى", category: "Fruits", state: "per 100g", carbs: 15, protein: 0.4, fat: 0.1, calories: 57, micros: { vitC: 4.3, vitK: 4.4, vitB9: 7, copper: 82, potassium: 116, fiber: 3.1, saturatedFat: 0 } },
  // ── PANTRY ────────────────────────────────────────────────────────────────
  { id: 801, name: "Vanilla Extract - فانيليا سائلة", category: "Pantry", state: "per 100g", carbs: 12.7, protein: 0.1, fat: 0.1, calories: 288 },
  { id: 802, name: "Vanilla Package - باكيت فانيليا", category: "Pantry", state: "per piece", carbs: 2, protein: 0, fat: 0, calories: 8 },
  { id: 803, name: "Baking Powder - بيكنج باودر", category: "Pantry", state: "per 100g", carbs: 27.7, protein: 0, fat: 0, calories: 53 },
  { id: 804, name: "Corn Starch (Cornstarch) - نشا ذرة", category: "Pantry", state: "per 100g", carbs: 91, protein: 0.3, fat: 0.1, calories: 381 },
  { id: 805, name: "Cocoa Powder (Coco, unsweetened) - كاكاو بودرة", category: "Pantry", state: "per 100g", carbs: 57.9, protein: 19.6, fat: 13.7, calories: 228, micros: { iron: 13.9, magnesium: 499, phosphorus: 734, potassium: 1524, zinc: 6.8, copper: 3788, manganese: 3.8, calcium: 128, selenium: 14.3, fiber: 33.2, saturatedFat: 8.1, omega6: 0.4 } },
  // ── SUPPLEMENTS ───────────────────────────────────────────────────────────
  { id: 901, name: "Whey Protein - بروتين مصل اللبن", category: "Supplements", state: "per 30g scoop", carbs: 3, protein: 24, fat: 1.5, calories: 120 },
  { id: 902, name: "Casein Protein - بروتين كازين", category: "Supplements", state: "per 30g scoop", carbs: 4, protein: 24, fat: 1, calories: 120 },
  { id: 903, name: "Plant Protein - بروتين نباتي", category: "Supplements", state: "per 30g scoop", carbs: 5, protein: 20, fat: 2, calories: 118 },
  { id: 904, name: "Mass Gainer - مكسب كتلة", category: "Supplements", state: "per 100g", carbs: 75, protein: 14, fat: 2, calories: 378 },
  { id: 905, name: "BCAA - أحماض أمينية", category: "Supplements", state: "per 10g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 906, name: "Creatine - كرياتين", category: "Supplements", state: "per 5g", carbs: 0, protein: 0, fat: 0, calories: 0 },
  { id: 907, name: "Pre-Workout - ما قبل التمرين", category: "Supplements", state: "per serving", carbs: 5, protein: 0, fat: 0, calories: 20 },
  { id: 908, name: "Omega-3 - أوميغا 3", category: "Supplements", state: "per serving (1g omega-3)", carbs: 0, protein: 0, fat: 1, calories: 9, micros: { omega3: 1.0 } },
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
  { id: 942, name: "Omega-3 Fish Oil - أوميجا 3", category: "Supplements", state: "per serving (1g omega-3)", carbs: 0, protein: 0, fat: 1.0, calories: 9, micros: { omega3: 1.0 } },
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
  { id: 1001, name: "Raw Chicken Breast (uncooked) - صدر دجاج نيء", category: "Raw", state: "per 100g raw", carbs: 0, protein: 23, fat: 2.6, calories: 120, micros: { omega3: 0.03, omega6: 0.5 } },
  { id: 1002, name: "Raw Chicken Thigh (uncooked) - فخذ دجاج نيء", category: "Raw", state: "per 100g raw", carbs: 0, protein: 19, fat: 8, calories: 153, micros: { omega3: 0.1, omega6: 1.5 } },
  { id: 1003, name: "Raw Ground Beef (uncooked) - لحم مفروم نيء", category: "Raw", state: "per 100g raw", carbs: 0, protein: 20, fat: 10, calories: 176, micros: { omega3: 0.05, omega6: 0.4 } },
  { id: 1004, name: "Raw White Rice (dry) - أرز أبيض جاف", category: "Raw", state: "per 100g dry", carbs: 78, protein: 6.5, fat: 0.5, calories: 350 },
  { id: 1005, name: "Raw Brown Rice (dry) - أرز بني جاف", category: "Raw", state: "per 100g dry", carbs: 76, protein: 7.5, fat: 2.5, calories: 370 },
  { id: 1006, name: "Raw Oats (dry) - شوفان جاف", category: "Raw", state: "per 100g dry", carbs: 66, protein: 17, fat: 7, calories: 389, micros: { omega3: 0.1, omega6: 2.4 } },
  { id: 1007, name: "Raw Potato (uncooked) - بطاطس نية", category: "Raw", state: "per 100g raw", carbs: 17, protein: 2, fat: 0.1, calories: 77 },
  { id: 1008, name: "Raw Sweet Potato - بطاطا حلوة نية", category: "Raw", state: "per 100g raw", carbs: 20, protein: 1.6, fat: 0.1, calories: 86 },
  { id: 1009, name: "Raw Pasta (dry) - مكرونة جافة", category: "Raw", state: "per 100g dry", carbs: 74, protein: 13, fat: 1.5, calories: 357 },
  { id: 1010, name: "Raw Lentils (dry) - عدس جاف", category: "Raw", state: "per 100g dry", carbs: 63, protein: 26, fat: 1, calories: 353 },
  // ── EGYPTIAN DISHES ───────────────────────────────────────────────────────
  { id: 1101, name: "Egyptian Lentil Soup - شوربة عدس مصرية", category: "Egyptian", state: "per 100g", carbs: 11, protein: 4, fat: 1.5, calories: 76, micros: { fiber: 3.0, saturatedFat: 0.2 } },
  { id: 1102, name: "Baked Falafel - فلافل بالفرن", category: "Egyptian", state: "per piece (~30g)", carbs: 6, protein: 2.5, fat: 1.5, calories: 48, micros: { fiber: 1.5, saturatedFat: 0.2, omega3: 0.01, omega6: 0.4 } },
  { id: 1103, name: "Ful Medames - فول مدمس", category: "Egyptian", state: "per 100g", carbs: 26, protein: 8, fat: 0.5, calories: 110, micros: { vitB1: 0.15, vitB9: 148, vitC: 1.4, iron: 1.9, magnesium: 43, phosphorus: 125, potassium: 332, zinc: 1.0, copper: 180, manganese: 0.54, fiber: 5.4, saturatedFat: 0.1 } },
  { id: 1104, name: "Koshari - كشري", category: "Egyptian", state: "per 100g", carbs: 23, protein: 4, fat: 2, calories: 126, micros: { fiber: 3.8, saturatedFat: 0.3 } },
  { id: 1105, name: "Hawawshi (lean) - حواوشي هش", category: "Egyptian", state: "per 100g", carbs: 18, protein: 14, fat: 8, calories: 200, micros: { fiber: 1.2, saturatedFat: 3.2 } },
  { id: 1106, name: "Molokhia with Chicken - ملوخية بالدجاج", category: "Egyptian", state: "per 100g", carbs: 4, protein: 8, fat: 3, calories: 75, micros: { vitK: 350, vitA: 240, fiber: 2.2, saturatedFat: 0.8 } },
  { id: 1107, name: "Grilled Kofta - كفتة مشوية", category: "Egyptian", state: "per 100g", carbs: 5, protein: 18, fat: 8, calories: 164, micros: { saturatedFat: 3.5, iron: 1.8 } },
  { id: 1108, name: "Mahshi Kousa - محشي كوسة", category: "Egyptian", state: "per 100g", carbs: 14, protein: 5, fat: 3, calories: 103, micros: { fiber: 1.8, saturatedFat: 0.6 } },
  { id: 1109, name: "Baladi Bread (Large) - عيش بلدي كبير", category: "Egyptian", state: "per piece (~120g)", carbs: 62, protein: 10, fat: 1.8, calories: 304, micros: { vitB1: 0.42, iron: 3.8, calcium: 240, fiber: 6.0, saturatedFat: 0.3 } },
  { id: 1110, name: "Rusks / Biscotti - بقسماط", category: "Egyptian", state: "per 100g", carbs: 75, protein: 8, fat: 5, calories: 380, micros: { fiber: 4, saturatedFat: 1.0 } },
  { id: 1111, name: "Taamiya (falafel) fried - طعمية مقلية", category: "Egyptian", state: "per piece (~20g)", carbs: 7, protein: 2, fat: 3, calories: 63, micros: { fiber: 1.2, saturatedFat: 0.5, omega3: 0.02, omega6: 1.0 } },
];

// ─── INTERFACES ────────────────────────────────────────────────────────────────
interface FoodItem {
  id: number; name: string; category: string; state: string;
  carbs: number; protein: number; fat: number; calories: number;
  grams: number; instId: string;
  recipeId?: number; micros?: Partial<Record<string, number>>;
}
interface Meal { id: string; name: string; notes: string; items: FoodItem[]; recipeId?: number; }
interface TargetMacros { calories: number; protein: number; carbs: number; fat: number; }
interface Template { id: number; name: string; meals: Meal[]; targetMacros: TargetMacros; createdAt: string; waterGoal?: number; }
interface BodyMeasurements {
  weight: number; height: number; bodyFat: number;
  arms: number; thighs: number; waist: number;
  hip: number; highHip: number; neck: number;
}
interface ClientCheckIn { id: number; date: string; measurements: BodyMeasurements; notes: string; }
interface DietPlanSnapshot { id: number; date: string; label: string; meals: Meal[]; targetMacros: TargetMacros; notes: string; waterGoal?: number; gender?: "male" | "female"; }
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
 * getRDI — returns daily recommended intake based on client gender and profile.
 * Sources: NIH DRI (2020), Dietary Guidelines for Americans, ISSA CPT, NASM CPT.
 * - Fiber: Men = 38g, Women = 25g (AI, DRI)
 * - Saturated fat: Cap of 20 grams per 2000 calories (or proportional to target calories)
 */
function getRDI(
  profile: {
    gender: "male" | "female";
    age?: number;
    isTraining?: boolean;
    isPregnant?: boolean;
    pregnancyMonth?: number;
    isLactating?: boolean;
  },
  targetCalories: number = 2000
) {
  const gender = profile.gender || "male";
  const age = profile.age ?? 30;
  const isTraining = !!profile.isTraining;
  const isPregnant = gender === "female" && !!profile.isPregnant;
  const pregnancyMonth = profile.pregnancyMonth ?? 0;
  const isLactating = gender === "female" && !!profile.isLactating;

  const m = gender === "male";
  const tri = pregnancyMonth <= 3 ? 1 : pregnancyMonth <= 6 ? 2 : 3;
  const train = isTraining ? 1 : 0;

  // Base values (non-pregnant adult, NIH DRI 2020)
  // Format: [male_19_30, male_31_50, male_51+, female_19_30, female_31_50, female_51+]
  const ageIdx = age < 31 ? 0 : age < 51 ? 1 : 2;
  const base = (mVals: number[], fVals: number[]) => (m ? mVals : fVals)[ageIdx];

  // Saturated fat cap: 20 grams per 2000 calories
  const cal = targetCalories > 0 ? targetCalories : 2000;
  const satFatCap = Number(((cal / 2000) * 20).toFixed(1));

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
    iron:    base([8,8,8],[18,18,8])      * (isTraining && !m ? 1.3 : 1), // Women: 18mg (athletes +30% = 23.4mg) vs Men: 8mg
    magnesium: base([400,420,420],[310,320,320]) * (train ? 1.2 : 1), // Men: 400-420mg vs Women: 310-320mg
    zinc:    base([11,11,11],[8,8,8])     + (train ? 1.5 : 0), // Men: 11mg vs Women: 8mg
    potassium: 3400,
    sodium:  2300,
    phosphorus: 700,
    selenium: 55,
    iodine:  150,
    copper:  900,
    manganese: base([2.3,2.3,2.3],[1.8,1.8,1.8]),
    chromium: base([35,35,30],[25,25,20]),
    // Fatty Acids & Fiber (RDI / AI based on Gender)
    fiber: base([38,38,30],[25,25,21]),         // g/day — DRI: Men 38g, Women 25g
    omega3: m ? 1.6 : 1.1,                      // g/day ALA — AI: Men 1.6g, Women 1.1g
    omega6: m ? 17 : 12,                        // g/day LA — AI: Men 17g, Women 12g
    saturatedFat: satFatCap,                    // g/day — Cap: 20g per 2000 kcal
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
    rdi.fiber   = 28; // NIH DRI for pregnancy
    rdi.omega3  = 1.4;
    rdi.omega6  = 13;
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
    rdi.fiber   = 29; // NIH DRI for lactation
    rdi.omega3  = 1.3;
    rdi.omega6  = 13;
  }

  return rdi;
}

interface CustomRecipe {
  id: number; name: string; category: string; notes: string;
  serves: number;
  ingredients: { foodId: number; isCustom?: boolean; grams: number }[];
  steps?: string[];            // instructions, one entry per step
  images?: string[];           // compressed JPEG data-URLs; first one is the cover
  prepMin?: number; cookMin?: number;
  difficulty?: "Easy" | "Medium" | "Hard";
  updatedAt?: string;
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

// ─── RECIPE / CUSTOM-FOOD HELPERS ─────────────────────────────────────────────
const RECIPE_CATEGORIES = ["Breakfast", "Lunch", "Dinner", "Snack", "Meal prep", "High-protein", "Dessert", "Drink"];
const MAX_RECIPE_IMAGES = 6;

/** Calories vs. macros check. Atwater: 4 kcal/g protein & carbs, 9 kcal/g fat.
 *  Differences up to 5% (or ≤ 5 kcal) are treated as rounding/fibre noise and ignored. */
const CAL_TOLERANCE_PCT = 5;
const CAL_TOLERANCE_ABS = 5;
function calorieCheck(protein: number, carbs: number, fat: number, calories: number) {
  const calc = Math.round(protein * 4 + carbs * 4 + fat * 9);
  const diff = calories - calc;
  const base = Math.max(calc, calories, 1);
  const pct = (Math.abs(diff) / base) * 100;
  const mismatch = calories > 0 && pct > CAL_TOLERANCE_PCT && Math.abs(diff) > CAL_TOLERANCE_ABS;
  return { calc, diff, pct, mismatch };
}

function foodMult(fd: FoodEntry, amount: number) {
  return isPerPiece(fd.state) ? amount : amount / 100;
}

function round1(n: number) { return Math.round(n * 10) / 10; }

/** Totals for the WHOLE recipe (all servings). */
function recipeBatch(r: CustomRecipe, foods: FoodEntry[]) {
  const t = { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const micros: Record<string, number> = {};
  let missing = 0;
  r.ingredients.forEach(ing => {
    const fd = foods.find(f => f.id === ing.foodId);
    if (!fd) { missing++; return; }
    const m = foodMult(fd, ing.grams);
    t.calories += fd.calories * m;
    t.protein += fd.protein * m;
    t.carbs += fd.carbs * m;
    t.fat += fd.fat * m;
    if (fd.micros) {
      Object.entries(fd.micros).forEach(([k, v]) => {
        if (typeof v === "number") micros[k] = (micros[k] || 0) + v * m;
      });
    }
  });
  return { ...t, micros, missing };
}

/** A recipe behaves like any other food item: macros + micros are PER SERVING. */
function recipeToFood(r: CustomRecipe, foods: FoodEntry[]): FoodEntry {
  const b = recipeBatch(r, foods);
  const s = Math.max(1, r.serves || 1);
  const micros: Record<string, number> = {};
  Object.entries(b.micros).forEach(([k, v]) => { micros[k] = Math.round((v / s) * 1000) / 1000; });
  return {
    id: r.id, name: r.name || "Untitled recipe", category: "Recipes", state: "per serving (recipe)",
    carbs: round1(b.carbs / s), protein: round1(b.protein / s), fat: round1(b.fat / s),
    calories: Math.round(b.calories / s), micros, recipeId: r.id,
  };
}

function newRecipe(): CustomRecipe {
  return {
    id: Date.now(), name: "", category: "Meal prep", notes: "", serves: 1, ingredients: [],
    steps: [""], images: [], prepMin: 0, cookMin: 0, difficulty: "Easy",
  };
}

// ─── LOCAL DATABASE (IndexedDB) — recipes + photos live here, on this PC/browser ──
const IDB_NAME = "msr_planner_db";
const IDB_STORE = "kv";
function idbOpen(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") { reject(new Error("IndexedDB unavailable")); return; }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => { req.result.createObjectStore(IDB_STORE); };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
async function idbGet<T>(key: string): Promise<T | undefined> {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const rq = db.transaction(IDB_STORE, "readonly").objectStore(IDB_STORE).get(key);
    rq.onsuccess = () => { resolve(rq.result as T | undefined); db.close(); };
    rq.onerror = () => { reject(rq.error); db.close(); };
  });
}
async function idbSet(key: string, value: unknown): Promise<void> {
  const db = await idbOpen();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, "readwrite");
    tx.objectStore(IDB_STORE).put(value, key);
    tx.oncomplete = () => { resolve(); db.close(); };
    tx.onerror = () => { reject(tx.error); db.close(); };
    tx.onabort = () => { reject(tx.error); db.close(); };
  });
}

/** Resize + re-encode a photo so many of them fit comfortably in local storage (~60-150 KB each). */
function compressImage(file: File, maxDim = 1000, quality = 0.78): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) { reject(new Error("Not an image file")); return; }
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("Could not read file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Could not open this image (unsupported format?)"));
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        const w = Math.max(1, Math.round(img.width * scale));
        const h = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("Canvas not available")); return; }
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function fmtAmt(n: number) {
  const r = Math.round(n * 10) / 10;
  return Number.isInteger(r) ? String(r) : r.toFixed(1);
}

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

// ─── MANUAL TARGET EDITOR (fiber / saturated fat) ─────────────────────────────
function TargetEditor({ value, defaultValue, unit, onChange }: {
  value: number | null; defaultValue: number; unit: string; onChange: (v: number | null) => void;
}) {
  const isCustom = value !== null;
  return (
    <span className="inline-flex items-center gap-1" dir="ltr">
      <input
        type="number" min="0" step="0.5"
        value={isCustom ? value : ""}
        placeholder={String(defaultValue)}
        title="Type a custom target, or leave empty to use the recommended value"
        onChange={e => onChange(e.target.value === "" ? null : Math.max(0, +e.target.value))}
        className={cn(
          "w-14 text-center text-xs border rounded px-1 py-0.5 bg-white dark:bg-gray-800",
          isCustom ? "border-blue-400 font-bold text-blue-700 dark:text-blue-300" : "border-gray-300 dark:border-gray-600"
        )}
      />
      <span className="text-[10px] text-gray-500">{unit}</span>
      {isCustom && (
        <button onClick={() => onChange(null)} title={`Reset to recommended (${defaultValue}${unit})`}
          className="text-[10px] text-blue-600 hover:underline">reset</button>
      )}
    </span>
  );
}

// ─── OMEGA-3 : OMEGA-6 BALANCE ────────────────────────────────────────────────
function OmegaBalance({ omega3, omega6, target3, target6 }: {
  omega3: number; omega6: number; target3: number; target6: number;
}) {
  const total = omega3 + omega6;
  const hasData = total > 0;
  const ratio = omega3 > 0 ? omega6 / omega3 : null;          // grams of ω-6 per 1 g of ω-3
  const share3 = hasData ? (omega3 / total) * 100 : 0;         // % of the omega pool that is ω-3
  // Ratio zones: ≤ 4:1 good · 4–10:1 high · > 10:1 very high  (ω-3 share ≥ 20% / ≥ 9% )
  let tone: "none" | "good" | "warn" | "bad" = "none";
  let message = "";
  if (hasData) {
    if (omega3 === 0) { tone = "bad"; message = "No omega-3 in this plan — add fatty fish, walnuts, flax/chia or an omega-3 serving."; }
    else if (ratio! <= 4) { tone = "good"; message = "Well balanced — ω-6 : ω-3 is within 4 : 1."; }
    else if (ratio! <= 10) { tone = "warn"; message = "Omega-6 is high — add omega-3 sources (salmon, sardines, mackerel, flax, fish oil)."; }
    else { tone = "bad"; message = "Omega-6 is very high — increase omega-3 sources or reduce seed oils / fried foods."; }
  }
  const toneText = { none: "text-gray-400", good: "text-green-600", warn: "text-yellow-600", bad: "text-red-500" }[tone];
  const chip = !hasData ? "no data" : omega3 === 0 ? "no ω-3" : `1 : ${ratio!.toFixed(1)}`;
  const p3 = target3 > 0 ? (omega3 / target3) * 100 : 0;
  const p6 = target6 > 0 ? (omega6 / target6) * 100 : 0;
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-medium">🐟 Omega-3 : Omega-6 balance</span>
        <span className={`text-xs font-bold ${toneText}`} dir="ltr">{chip}</span>
      </div>
      {/* balance bar: teal = ω-3 share, amber = ω-6 share. Marker = 1:4 target (ω-3 ≥ 20% of total) */}
      <div dir="ltr">
        <div className="relative h-3 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex">
          {hasData && <div className="h-full bg-teal-500 transition-all" style={{ width: `${share3}%` }} />}
          {hasData && <div className="h-full bg-amber-400 transition-all" style={{ width: `${100 - share3}%` }} />}
          <div className="absolute top-0 bottom-0 w-0.5 bg-gray-800 dark:bg-white opacity-70" style={{ left: "20%" }} />
        </div>
        <div className="relative h-3 text-[9px] text-gray-400">
          <span className="absolute" style={{ left: "20%", transform: "translateX(-50%)" }}>1:4 target</span>
          <span className="absolute right-0">more ω-3 ←</span>
        </div>
      </div>
      <div className="flex justify-between text-[11px]" dir="ltr">
        <span><span className="inline-block w-2 h-2 rounded-full bg-teal-500 mr-1" />ω-3 {omega3.toFixed(2)} g {hasData && <span className="text-gray-400">({share3.toFixed(0)}%)</span>}</span>
        <span><span className="inline-block w-2 h-2 rounded-full bg-amber-400 mr-1" />ω-6 {omega6.toFixed(2)} g {hasData && <span className="text-gray-400">({(100 - share3).toFixed(0)}%)</span>}</span>
      </div>
      {/* intake vs daily adequate intake */}
      <div className="space-y-1">
        <div>
          <div className="flex justify-between text-[10px] text-gray-500"><span>Omega-3 intake</span><span dir="ltr">{omega3.toFixed(2)} / {target3} g</span></div>
          <ProgressBar value={omega3} max={target3} color={p3 >= 100 ? "bg-green-600" : p3 >= 50 ? "bg-teal-500" : "bg-teal-300"} />
        </div>
        <div>
          <div className="flex justify-between text-[10px] text-gray-500"><span>Omega-6 intake</span><span dir="ltr">{omega6.toFixed(2)} / {target6} g</span></div>
          <ProgressBar value={omega6} max={target6} color={p6 > 150 ? "bg-orange-400" : "bg-amber-400"} />
        </div>
      </div>
      {message && <div className={`text-xs ${toneText}`}>{tone === "good" ? "✅" : "⚠️"} {message}</div>}
      {!hasData && <div className="text-xs text-gray-400">Add foods to see the balance. Aim for ω-6 : ω-3 of 4 : 1 or lower.</div>}
    </div>
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
function SortableFoodItem({ item, onRemove, onGramsChange, lang, onOpenRecipe }: {
  item: FoodItem; onRemove: () => void; onGramsChange: (g: number) => void; lang: "ar" | "en" | "both"; onOpenRecipe?: () => void;
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
        <div className="font-medium truncate text-xs flex items-center gap-1">
          <span className="truncate">{displayName(item.name, lang)}</span>
          {item.recipeId !== undefined && onOpenRecipe && (
            <button onClick={onOpenRecipe} title="Open this recipe" className="shrink-0 flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 print:hidden">
              <BookOpen size={10} />recipe
            </button>
          )}
        </div>
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
function MealCard({ meal, onUpdate, onDelete, onDuplicate, lang, extraFoods, dragHandleProps, onSaveCustomFood, onDeleteCustomFood, onOpenRecipe }: {
  meal: Meal; onUpdate: (m: Meal) => void; onDelete: () => void; onDuplicate: () => void;
  lang: "ar" | "en" | "both"; extraFoods: FoodEntry[]; dragHandleProps?: React.HTMLAttributes<HTMLElement>;
  onSaveCustomFood: (food: Omit<FoodEntry, "id">) => FoodEntry;
  onDeleteCustomFood: (food: FoodEntry) => void;
  onOpenRecipe: (id: number) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedFoodIds, setSelectedFoodIds] = useState<Set<number>>(new Set());
  const [showCustomForm, setShowCustomForm] = useState(false);
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
  /** Adds a custom food to this meal. If "save" is ticked it is also stored in the food database for later. */
  function addCustomFoodToMeal(food: Omit<FoodEntry, "id">, amount: number, save: boolean) {
    const entry: FoodEntry = save ? onSaveCustomFood(food) : { ...food, id: 90000 + (Date.now() % 100000) };
    const newItem: FoodItem = { ...entry, grams: amount, instId: `custom-${Date.now()}-${Math.random()}` };
    onUpdate({ ...meal, items: [...meal.items, newItem] });
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
                    onOpenRecipe={item.recipeId !== undefined ? () => onOpenRecipe(item.recipeId as number) : undefined}
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
            {/* custom food form (shared component: calorie check + save to database) */}
            {showCustomForm && (
              <CustomFoodForm showAmount showSaveToggle submitLabel="Add to meal ✓"
                onSubmit={addCustomFoodToMeal} onCancel={() => setShowCustomForm(false)} />
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
                      {extraFoods.some(x => x.id === f.id) && f.category === "Custom" && (
                        <button onClick={e => { e.preventDefault(); onDeleteCustomFood(f); }} title="Remove from my food database"
                          className="text-red-400 hover:text-red-600 px-1"><Trash2 size={13} /></button>
                      )}
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

// ─── CUSTOM FOOD FORM (shared: planner meal card + Recipes tab) ────────────────
interface FoodDraft {
  name: string; basis: "100g" | "serving";
  calories: number; protein: number; carbs: number; fat: number;
  fiber: number; saturatedFat: number; omega3: number; omega6: number; amount: number;
}
const EMPTY_FOOD_DRAFT: FoodDraft = {
  name: "", basis: "100g", calories: 0, protein: 0, carbs: 0, fat: 0,
  fiber: 0, saturatedFat: 0, omega3: 0, omega6: 0, amount: 100,
};
function draftFromFood(f: FoodEntry): FoodDraft {
  const m = f.micros || {};
  const serving = isPerPiece(f.state);
  return {
    name: f.name, basis: serving ? "serving" : "100g",
    calories: f.calories, protein: f.protein, carbs: f.carbs, fat: f.fat,
    fiber: m.fiber || 0, saturatedFat: m.saturatedFat || 0, omega3: m.omega3 || 0, omega6: m.omega6 || 0,
    amount: serving ? 1 : 100,
  };
}

function CustomFoodForm({ initial, showAmount, showSaveToggle, submitLabel, onSubmit, onCancel }: {
  initial?: FoodEntry; showAmount?: boolean; showSaveToggle?: boolean; submitLabel: string;
  onSubmit: (food: Omit<FoodEntry, "id">, amount: number, save: boolean) => void; onCancel: () => void;
}) {
  const [d, setD] = useState<FoodDraft>(initial ? draftFromFood(initial) : EMPTY_FOOD_DRAFT);
  const [save, setSave] = useState(true);
  const set = (k: keyof FoodDraft) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setD(p => ({ ...p, [k]: Math.max(0, +e.target.value) }));
  const chk = calorieCheck(d.protein, d.carbs, d.fat, d.calories);
  const canSubmit = d.name.trim().length > 0;
  const inputCls = "w-full text-xs border border-gray-300 dark:border-gray-600 rounded px-1.5 py-1 bg-white dark:bg-gray-800";

  function submit() {
    if (!canSubmit) return;
    const micros: Record<string, number> = {};
    if (d.fiber) micros.fiber = d.fiber;
    if (d.saturatedFat) micros.saturatedFat = d.saturatedFat;
    if (d.omega3) micros.omega3 = d.omega3;
    if (d.omega6) micros.omega6 = d.omega6;
    const food: Omit<FoodEntry, "id"> = {
      name: d.name.trim(), category: "Custom", state: d.basis === "100g" ? "per 100g" : "per serving",
      carbs: d.carbs, protein: d.protein, fat: d.fat,
      calories: d.calories > 0 ? d.calories : chk.calc,
      ...(Object.keys(micros).length ? { micros } : {}),
    };
    onSubmit(food, d.amount > 0 ? d.amount : d.basis === "100g" ? 100 : 1, save);
  }

  return (
    <div dir="ltr" className="border border-purple-200 dark:border-purple-800 rounded-xl bg-purple-50 dark:bg-purple-900/20 p-3 space-y-2 text-left">
      <p className="text-xs font-semibold text-purple-700 dark:text-purple-300">{initial ? "✏️ Edit food - تعديل" : "➕ Custom food - أكل مخصص"}</p>
      <input value={d.name} onChange={e => setD(p => ({ ...p, name: e.target.value }))}
        placeholder="Name — e.g. Protein Bar - بار بروتين" className={inputCls} />
      <div className="flex gap-1 text-xs">
        {([["100g", "Values per 100 g"], ["serving", "Values per serving / piece"]] as const).map(([v, lbl]) => (
          <button key={v} type="button"
            onClick={() => setD(p => ({ ...p, basis: v, amount: v === "100g" ? 100 : 1 }))}
            className={cn("flex-1 px-2 py-1 rounded-lg border transition-colors",
              d.basis === v ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300")}>
            {lbl}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {([["calories", "Calories"], ["protein", "Protein g"], ["carbs", "Carbs g"], ["fat", "Fat g"]] as const).map(([k, lbl]) => (
          <div key={k}>
            <label className="text-[11px] text-gray-500">{lbl}</label>
            <input type="number" min="0" step="any" value={d[k] || ""} onChange={set(k)} className={inputCls} />
          </div>
        ))}
      </div>
      {/* calories vs macros check — silent when the gap is small */}
      {chk.mismatch && (
        <div className="rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 p-2 text-xs text-amber-800 dark:text-amber-200 space-y-1">
          <div>⚠️ Calories don&apos;t match the macros: you entered <b>{d.calories} kcal</b>, but protein×4 + carbs×4 + fat×9 = <b>{chk.calc} kcal</b> ({chk.diff > 0 ? "+" : ""}{chk.diff} kcal, {chk.pct.toFixed(0)}% off).</div>
          <div className="flex gap-2 items-center flex-wrap">
            <button type="button" onClick={() => setD(p => ({ ...p, calories: chk.calc }))}
              className="px-2 py-0.5 rounded bg-amber-600 text-white hover:bg-amber-700">Use {chk.calc} kcal</button>
            <span className="opacity-80">or keep yours if it matches the product label.</span>
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-1">
        {([["fiber", "Fiber g"], ["saturatedFat", "Sat. fat g"], ["omega3", "Omega-3 g"], ["omega6", "Omega-6 g"]] as const).map(([k, lbl]) => (
          <div key={k}>
            <label className="text-[11px] text-gray-400">{lbl}</label>
            <input type="number" min="0" step="any" value={d[k] || ""} onChange={set(k)} className={inputCls} />
          </div>
        ))}
      </div>
      {showAmount && (
        <div className="w-32">
          <label className="text-[11px] text-gray-500">Amount to add ({d.basis === "100g" ? "g" : "servings"})</label>
          <input type="number" min="0" step="any" value={d.amount || ""} onChange={set("amount")} className={inputCls} />
        </div>
      )}
      {showSaveToggle && (
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={save} onChange={e => setSave(e.target.checked)} className="accent-purple-600" />
          Save to my food database for later (حفظ في قاعدة بياناتي)
        </label>
      )}
      <div className="flex gap-1 justify-end">
        <button type="button" onClick={onCancel} className="text-xs text-gray-500 px-3 py-1 hover:text-gray-700">Cancel - إلغاء</button>
        <button type="button" onClick={submit} disabled={!canSubmit}
          className="text-xs bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed">{submitLabel}</button>
      </div>
    </div>
  );
}

// ─── BACKUP VALIDATION ─────────────────────────────────────────────────────────
function isRecipeLike(r: unknown): r is CustomRecipe {
  const x = r as Partial<CustomRecipe> | null;
  return !!x && typeof x.id === "number" && typeof x.name === "string" && Array.isArray(x.ingredients);
}
function isFoodLike(f: unknown): f is FoodEntry {
  const x = f as Partial<FoodEntry> | null;
  return !!x && typeof x.id === "number" && typeof x.name === "string" && typeof x.calories === "number" &&
    typeof x.protein === "number" && typeof x.carbs === "number" && typeof x.fat === "number" && typeof x.state === "string";
}

// ─── CLOUD SYNC · Google Drive (private "app data" folder) ─────────────────────
// Browser-only: Google Identity Services gives a short-lived access token, the Drive REST API
// stores one small JSON file per recipe / client plus one for My Foods. Nothing passes through a server.
interface GoogleTokenResponse { access_token?: string; expires_in?: number | string; error?: string; error_description?: string; }
interface GoogleTokenClient { requestAccessToken: (cfg?: { prompt?: string; hint?: string }) => void; }
interface GoogleOAuth2 {
  initTokenClient: (cfg: {
    client_id: string; scope: string; callback: (r: GoogleTokenResponse) => void;
    error_callback?: (e: { type?: string; message?: string }) => void;
  }) => GoogleTokenClient;
  revoke?: (token: string, done?: () => void) => void;
}
declare global { interface Window { google?: { accounts?: { oauth2?: GoogleOAuth2 } } } }

const CLOUD_SCOPE = "https://www.googleapis.com/auth/drive.appdata https://www.googleapis.com/auth/userinfo.email";
const CLOUD_LS = { clientId: "cloud_google_client_id", connected: "cloud_connected", account: "cloud_account", auto: "cloud_auto", state: "cloud_sync_state_v1" };
const DRIVE_API = "https://www.googleapis.com/drive/v3";
const DRIVE_UPLOAD = "https://www.googleapis.com/upload/drive/v3";
const MAX_CLOUD_FILE_BYTES = 4.5 * 1024 * 1024;   // Drive multipart upload limit is 5 MB

type CloudStatus = "disconnected" | "needs-auth" | "idle" | "syncing" | "error";
type SyncMode = "merge" | "push-all" | "pull-all";
type CloudChoice = "local" | "cloud" | "both";

interface SyncRecord { hash: string; fileId: string }
interface SyncState { account: string; items: Record<string, SyncRecord>; tomb: string[]; lastSyncAt: string }
interface LocalCloudItem { key: string; hash: string; data: object; label: string }
interface RemoteCloudItem { key: string; fileId: string; hash: string; modified: string }
type CloudAction =
  | { type: "upload"; key: string }
  | { type: "download"; key: string; asCopy?: boolean }
  | { type: "deleteRemote"; key: string }
  | { type: "deleteLocal"; key: string }
  | { type: "adopt"; key: string }
  | { type: "forget"; key: string };
interface CloudConflict { key: string; label: string; kind: "recipe" | "client" | "foods"; remoteModified: string }
interface CloudBatch { recipesUp: CustomRecipe[]; recipesDel: Set<number>; clientsUp: Client[]; clientsDel: Set<number>; foods: FoodEntry[] | null }

function lsGet(k: string): string { try { return localStorage.getItem(k) ?? ""; } catch { return ""; } }
function lsSet(k: string, v: string) { try { if (v === "") localStorage.removeItem(k); else localStorage.setItem(k, v); } catch {} }
function emptyState(account = ""): SyncState { return { account, items: {}, tomb: [], lastSyncAt: "" }; }
function emptyBatch(): CloudBatch { return { recipesUp: [], recipesDel: new Set(), clientsUp: [], clientsDel: new Set(), foods: null }; }
function cloudKind(key: string): CloudConflict["kind"] { return key.startsWith("recipe-") ? "recipe" : key.startsWith("client-") ? "client" : "foods"; }

function isClientLike(c: unknown): c is Client {
  const x = c as Partial<Client> | null;
  return !!x && typeof x.id === "number" && typeof x.name === "string" && Array.isArray(x.checkIns) && Array.isArray(x.dietPlans);
}

// ── change detection: content hash of a canonical (key-sorted) JSON string ──
function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v) ?? "null";
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  const o = v as Record<string, unknown>;
  return "{" + Object.keys(o).filter(k => o[k] !== undefined).sort().map(k => JSON.stringify(k) + ":" + stableStringify(o[k])).join(",") + "}";
}
async function sha256Hex(s: string): Promise<string> {
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
      return "s:" + Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {}
  let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57 ^ s.length;           // fallback (insecure context)
  for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return "f:" + (h2 >>> 0).toString(16).padStart(8, "0") + (h1 >>> 0).toString(16).padStart(8, "0");
}
const hashCache = new WeakMap<object, string>();
async function hashItem(data: object): Promise<string> {
  const hit = hashCache.get(data);
  if (hit) return hit;
  const h = await sha256Hex(stableStringify(data));
  hashCache.set(data, h);
  return h;
}

async function buildLocalSnapshot(recipes: CustomRecipe[], clients: Client[], foods: FoodEntry[]): Promise<Map<string, LocalCloudItem>> {
  const m = new Map<string, LocalCloudItem>();
  for (const r of recipes) { const key = `recipe-${r.id}`; m.set(key, { key, data: r, hash: await hashItem(r), label: r.name || "Untitled recipe" }); }
  for (const c of clients) { const key = `client-${c.id}`; m.set(key, { key, data: c, hash: await hashItem(c), label: c.name || "Client" }); }
  if (foods.length) { const blob = { foods }; m.set("foods", { key: "foods", data: blob, hash: await hashItem(blob), label: "My Foods" }); }
  return m;
}

/** Decides what to upload / download / delete. Pure function (no I/O) so it can be tested on its own.
 *  `state` = what both sides looked like at the last successful sync. */
function planSync(local: Map<string, LocalCloudItem>, remote: Map<string, RemoteCloudItem>, state: SyncState): { actions: CloudAction[]; conflicts: CloudConflict[] } {
  const actions: CloudAction[] = [];
  const conflicts: CloudConflict[] = [];
  const keys = new Set<string>([...local.keys(), ...remote.keys(), ...Object.keys(state.items)]);
  const cloudHasData = remote.size > 0;      // if the cloud is completely empty we never treat that as "deleted everywhere"
  keys.forEach(key => {
    const L = local.get(key), R = remote.get(key), S = state.items[key];
    if (L && R) {
      if (L.hash === R.hash) { actions.push({ type: "adopt", key }); return; }
      if (!S) { conflicts.push({ key, label: L.label, kind: cloudKind(key), remoteModified: R.modified }); return; }
      const localChanged = L.hash !== S.hash, cloudChanged = R.hash !== S.hash;
      if (localChanged && cloudChanged) conflicts.push({ key, label: L.label, kind: cloudKind(key), remoteModified: R.modified });
      else if (localChanged) actions.push({ type: "upload", key });
      else if (cloudChanged) actions.push({ type: "download", key });
      else actions.push({ type: "adopt", key });
      return;
    }
    if (L && !R) {
      // gone from the cloud: deleted on another device (propagate) — unless edited here, or the cloud looks wiped (restore it)
      if (S && cloudHasData && L.hash === S.hash && key !== "foods") actions.push({ type: "deleteLocal", key });
      else actions.push({ type: "upload", key });
      return;
    }
    if (!L && R) {
      // missing here: only an explicit delete made on this device (tombstone) may remove it from the cloud
      if (S && state.tomb.includes(key) && R.hash === S.hash) actions.push({ type: "deleteRemote", key });
      else actions.push({ type: "download", key });
      return;
    }
    actions.push({ type: "forget", key });
  });
  return { actions, conflicts };
}

// ── Drive REST helpers ──
class DriveError extends Error {
  status: number;
  constructor(status: number, message: string) { super(message); this.status = status; }
}
class CloudAuthError extends Error {}

async function driveFetch(token: string, url: string, init?: RequestInit): Promise<Response> {
  const res = await fetch(url, { ...init, headers: { ...(init?.headers || {}), Authorization: `Bearer ${token}` } });
  if (!res.ok) {
    let body = ""; try { body = await res.text(); } catch {}
    throw new DriveError(res.status, body.slice(0, 300) || `Drive error ${res.status}`);
  }
  return res;
}
async function driveUserEmail(token: string): Promise<string> {
  const res = await driveFetch(token, "https://www.googleapis.com/oauth2/v3/userinfo");
  const j = await res.json() as { email?: string };
  return j.email || "";
}
async function driveList(token: string): Promise<RemoteCloudItem[]> {
  const out: RemoteCloudItem[] = [];
  let pageToken = "";
  do {
    const fields = encodeURIComponent("nextPageToken,files(id,name,modifiedTime,appProperties)");
    const url = `${DRIVE_API}/files?spaces=appDataFolder&pageSize=1000&fields=${fields}&q=${encodeURIComponent("trashed=false")}` + (pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : "");
    const j = await (await driveFetch(token, url)).json() as { nextPageToken?: string; files?: { id: string; name: string; modifiedTime?: string; appProperties?: Record<string, string> }[] };
    (j.files || []).forEach(f => {
      const m = /^(recipe-\d+|client-\d+|foods)\.json$/.exec(f.name);
      if (m) out.push({ key: m[1], fileId: f.id, hash: f.appProperties?.h || "", modified: f.modifiedTime || "" });
    });
    pageToken = j.nextPageToken || "";
  } while (pageToken);
  return out;
}
async function driveDownload(token: string, fileId: string): Promise<unknown> {
  return (await driveFetch(token, `${DRIVE_API}/files/${fileId}?alt=media`)).json();
}
async function driveUpload(token: string, key: string, content: string, hash: string, existingId?: string): Promise<{ id: string }> {
  const boundary = "msr" + Math.random().toString(36).slice(2);
  const build = (update: boolean) => {
    const meta = update ? { appProperties: { h: hash } } : { name: `${key}.json`, parents: ["appDataFolder"], mimeType: "application/json", appProperties: { h: hash } };
    return `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${content}\r\n--${boundary}--`;
  };
  const send = async (update: boolean) => {
    const body = build(update);
    if (new Blob([body]).size > MAX_CLOUD_FILE_BYTES) throw new Error(`"${key}" is too large to sync (over 4.5 MB) — remove a few photos`);
    const url = update ? `${DRIVE_UPLOAD}/files/${existingId}?uploadType=multipart&fields=id` : `${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id`;
    const res = await driveFetch(token, url, { method: update ? "PATCH" : "POST", headers: { "Content-Type": `multipart/related; boundary=${boundary}` }, body });
    return await res.json() as { id: string };
  };
  if (!existingId) return send(false);
  try { return await send(true); }
  catch (e) { if (e instanceof DriveError && e.status === 404) return send(false); throw e; }   // cloud copy vanished → recreate
}
async function driveDelete(token: string, fileId: string): Promise<void> {
  try { await driveFetch(token, `${DRIVE_API}/files/${fileId}`, { method: "DELETE" }); }
  catch (e) { if (!(e instanceof DriveError && e.status === 404)) throw e; }
}

/** Runs the planned actions. Mutates `state` and `batch`; returns per-item error messages. A 401 aborts the whole run. */
async function executeCloudActions(token: string, actions: CloudAction[], local: Map<string, LocalCloudItem>, remote: Map<string, RemoteCloudItem>, state: SyncState, batch: CloudBatch): Promise<string[]> {
  const errors: string[] = [];
  let copyN = 0;
  const untomb = (key: string) => { state.tomb = state.tomb.filter(k => k !== key); };
  for (const a of actions) {
    try {
      if (a.type === "upload") {
        const L = local.get(a.key); if (!L) continue;
        const { id } = await driveUpload(token, a.key, JSON.stringify(L.data), L.hash, remote.get(a.key)?.fileId);
        state.items[a.key] = { hash: L.hash, fileId: id }; untomb(a.key);
      } else if (a.type === "download") {
        const R = remote.get(a.key); if (!R) continue;
        const data = await driveDownload(token, R.fileId);
        const kind = cloudKind(a.key);
        if (kind === "recipe") {
          if (!isRecipeLike(data)) throw new Error("not a valid recipe file");
          batch.recipesUp.push(a.asCopy ? { ...data, id: Date.now() + (++copyN), name: data.name + " (cloud copy)" } : data);
        } else if (kind === "client") {
          if (!isClientLike(data)) throw new Error("not a valid client file");
          batch.clientsUp.push(a.asCopy ? { ...data, id: Date.now() + (++copyN), name: data.name + " (cloud copy)" } : data);
        } else {
          const foods = (data as { foods?: unknown })?.foods;
          if (!Array.isArray(foods)) throw new Error("not a valid foods file");
          batch.foods = foods.filter(isFoodLike);
        }
        if (!a.asCopy) state.items[a.key] = { hash: R.hash || await hashItem(data as object), fileId: R.fileId };
      } else if (a.type === "deleteRemote") {
        const R = remote.get(a.key); if (R) await driveDelete(token, R.fileId);
        delete state.items[a.key]; untomb(a.key);
      } else if (a.type === "deleteLocal") {
        const kind = cloudKind(a.key); const id = Number(a.key.split("-")[1]);
        if (kind === "recipe") batch.recipesDel.add(id); else if (kind === "client") batch.clientsDel.add(id); else batch.foods = [];
        delete state.items[a.key];
      } else if (a.type === "adopt") {
        const L = local.get(a.key), R = remote.get(a.key);
        if (L && R) state.items[a.key] = { hash: L.hash, fileId: R.fileId };
      } else {
        delete state.items[a.key]; untomb(a.key);
      }
    } catch (e) {
      if (e instanceof DriveError && e.status === 401) throw e;
      errors.push(`${a.key}: ${e instanceof Error ? e.message : "failed"}`);
    }
  }
  return errors;
}

function loadGis(): Promise<GoogleOAuth2> {
  return new Promise((resolve, reject) => {
    const ready = () => window.google?.accounts?.oauth2;
    const now = ready();
    if (now) { resolve(now); return; }
    let s = document.querySelector<HTMLScriptElement>("script[data-gis]");
    if (!s) {
      s = document.createElement("script");
      s.src = "https://accounts.google.com/gsi/client"; s.async = true; s.setAttribute("data-gis", "1");
      document.head.appendChild(s);
    }
    s.addEventListener("load", () => { const o = ready(); if (o) resolve(o); else reject(new Error("Google sign-in library did not start")); });
    s.addEventListener("error", () => reject(new Error("Could not load Google sign-in (offline, or blocked by an ad-blocker?)")));
  });
}

interface CloudApi {
  clientId: string; saveClientId: (id: string) => void;
  connected: boolean; account: string; status: CloudStatus; message: string; lastSyncAt: string;
  auto: boolean; setAuto: (v: boolean) => void; dirty: boolean;
  conflicts: CloudConflict[]; conflictOpen: boolean; setConflictOpen: (v: boolean) => void;
  connect: () => Promise<void>; disconnect: (forgetClientId: boolean) => void;
  syncNow: () => Promise<void>; replaceCloud: () => Promise<void>; replaceLocal: () => Promise<void>;
  resolveConflicts: (c: Record<string, CloudChoice>) => Promise<void>; resume: () => void;
}

function useCloudSync(args: {
  ready: boolean; recipes: CustomRecipe[]; clients: Client[]; foods: FoodEntry[];
  setRecipes: React.Dispatch<React.SetStateAction<CustomRecipe[]>>;
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  setFoods: React.Dispatch<React.SetStateAction<FoodEntry[]>>;
}): CloudApi {
  const { ready, recipes, clients, foods, setRecipes, setClients, setFoods } = args;
  const [clientId, setClientId] = useState("");
  const [connected, setConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [auto, setAutoState] = useState(true);
  const [status, setStatus] = useState<CloudStatus>("disconnected");
  const [message, setMessage] = useState("");
  const [lastSyncAt, setLastSyncAt] = useState("");
  const [conflicts, setConflicts] = useState<CloudConflict[]>([]);
  const [conflictOpen, setConflictOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  const clientIdRef = useRef(""); const connectedRef = useRef(false); const accountRef = useRef(""); const autoRef = useRef(true);
  const tokenRef = useRef<{ token: string; exp: number } | null>(null);
  const expTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncingRef = useRef(false); const queuedRef = useRef(false);
  const stateRef = useRef<SyncState>(emptyState());
  const readyRef = useRef(ready); readyRef.current = ready;
  const latestRef = useRef({ recipes, clients, foods });
  latestRef.current = { recipes, clients, foods };
  const prevKeysRef = useRef<Set<string> | null>(null);
  const skipTombRef = useRef(false);
  const changeSeqRef = useRef(0);
  const firstChangeRef = useRef(true);
  const runSyncRef = useRef<(mode: SyncMode, interactive: boolean) => Promise<void>>(async () => {});

  // restore settings after mount (not during render → no server/client mismatch)
  useEffect(() => {
    const id = lsGet(CLOUD_LS.clientId); const conn = lsGet(CLOUD_LS.connected) === "1";
    const acc = lsGet(CLOUD_LS.account); const au = lsGet(CLOUD_LS.auto) !== "0";
    let st = emptyState(acc);
    try { const raw = lsGet(CLOUD_LS.state); if (raw) { const p = JSON.parse(raw) as SyncState; if (p && p.items) st = { ...emptyState(acc), ...p, tomb: p.tomb || [] }; } } catch {}
    stateRef.current = st;
    clientIdRef.current = id; connectedRef.current = conn; accountRef.current = acc; autoRef.current = au;
    setClientId(id); setConnected(conn); setAccount(acc); setAutoState(au); setLastSyncAt(st.lastSyncAt);
    if (conn) { setStatus("needs-auth"); setMessage("Click Resume to continue syncing with Google Drive."); }
    if (id) loadGis().catch(() => {});      // preload so a later click can open the sign-in popup immediately
  }, []);

  const saveState = (s: SyncState) => { stateRef.current = s; lsSet(CLOUD_LS.state, JSON.stringify(s)); };
  const tokenValid = () => !!tokenRef.current && Date.now() < tokenRef.current.exp - 60_000;

  const getToken = async (interactive: boolean): Promise<string> => {
    if (tokenRef.current && tokenValid()) return tokenRef.current.token;
    if (!interactive) throw new CloudAuthError("Google sign-in expired — click Resume to keep syncing.");
    const id = clientIdRef.current;
    if (!id) throw new Error("Add your Google Client ID first.");
    const oauth = await loadGis();
    return new Promise<string>((resolve, reject) => {
      const timer = setTimeout(() => reject(new CloudAuthError("The Google sign-in window was closed or timed out.")), 120_000);
      const client = oauth.initTokenClient({
        client_id: id, scope: CLOUD_SCOPE,
        callback: r => {
          clearTimeout(timer);
          if (r.error || !r.access_token) { reject(new CloudAuthError(r.error_description || r.error || "Google sign-in failed.")); return; }
          const ms = (Number(r.expires_in) || 3600) * 1000;
          tokenRef.current = { token: r.access_token, exp: Date.now() + ms };
          if (expTimerRef.current) clearTimeout(expTimerRef.current);
          expTimerRef.current = setTimeout(() => {
            if (connectedRef.current && !syncingRef.current) { setStatus("needs-auth"); setMessage("Google sign-in expired (they last about an hour). Click Resume to keep syncing."); }
          }, Math.max(0, ms - 60_000));
          resolve(r.access_token);
        },
        error_callback: e => {
          clearTimeout(timer);
          reject(new CloudAuthError(e?.type === "popup_failed_to_open" ? "The sign-in popup was blocked — allow popups for this site and try again."
            : e?.type === "popup_closed" ? "The Google sign-in window was closed." : (e?.message || "Google sign-in failed.")));
        },
      });
      client.requestAccessToken({ prompt: "", hint: accountRef.current || undefined });
    });
  };

  const applyBatch = (b: CloudBatch) => {
    if (!b.recipesUp.length && !b.recipesDel.size && !b.clientsUp.length && !b.clientsDel.size && b.foods === null) return;
    skipTombRef.current = true;     // these removals come from the cloud, they are not user deletions
    if (b.recipesUp.length || b.recipesDel.size) setRecipes(prev => {
      const m = new Map(prev.map(r => [r.id, r] as const));
      b.recipesUp.forEach(r => m.set(r.id, r)); b.recipesDel.forEach(id => m.delete(id));
      return Array.from(m.values());
    });
    if (b.clientsUp.length || b.clientsDel.size) setClients(prev => {
      const m = new Map(prev.map(c => [c.id, c] as const));
      b.clientsUp.forEach(c => m.set(c.id, c)); b.clientsDel.forEach(id => m.delete(id));
      return Array.from(m.values());
    });
    if (b.foods !== null) setFoods(b.foods);
  };

  const listRemote = async (token: string) => {
    const files = await driveList(token);
    const remote = new Map<string, RemoteCloudItem>(); const dups: RemoteCloudItem[] = [];
    files.forEach(f => {
      const prev = remote.get(f.key);
      if (!prev) remote.set(f.key, f);
      else if (f.modified > prev.modified) { dups.push(prev); remote.set(f.key, f); } else dups.push(f);
    });
    for (const d of dups) { try { await driveDelete(token, d.fileId); } catch {} }   // two devices created the same file at once
    return remote;
  };

  const beginState = async (token: string): Promise<SyncState> => {
    if (!accountRef.current) {
      try {
        const email = await driveUserEmail(token);
        if (email) { accountRef.current = email; setAccount(email); lsSet(CLOUD_LS.account, email); }
      } catch {}
    }
    let st = stateRef.current;
    if (st.account && accountRef.current && st.account !== accountRef.current) st = emptyState(accountRef.current);   // different Google account → start fresh
    return { ...st, account: accountRef.current, items: { ...st.items }, tomb: [...st.tomb] };
  };

  const syncWithToken = async (token: string, mode: SyncMode) => {
    const state = await beginState(token);
    const remote = await listRemote(token);
    const cur = latestRef.current;
    const local = await buildLocalSnapshot(cur.recipes, cur.clients, cur.foods);
    let actions: CloudAction[] = []; let found: CloudConflict[] = [];
    if (mode === "push-all") {
      local.forEach((_, key) => actions.push({ type: "upload", key }));
      remote.forEach((_, key) => { if (!local.has(key)) actions.push({ type: "deleteRemote", key }); });
    } else if (mode === "pull-all") {
      remote.forEach((_, key) => actions.push({ type: "download", key }));
      local.forEach((_, key) => { if (!remote.has(key)) actions.push({ type: "deleteLocal", key }); });
    } else {
      const p = planSync(local, remote, state); actions = p.actions; found = p.conflicts;
    }
    const batch = emptyBatch();
    const errors = await executeCloudActions(token, actions, local, remote, state, batch);
    applyBatch(batch);
    state.lastSyncAt = new Date().toISOString();
    saveState(state); setLastSyncAt(state.lastSyncAt);
    return { errors, conflicts: found };
  };

  const resolveWithToken = async (token: string, choices: Record<string, CloudChoice>) => {
    const state = await beginState(token);
    const remote = await listRemote(token);
    const cur = latestRef.current;
    const local = await buildLocalSnapshot(cur.recipes, cur.clients, cur.foods);
    const actions: CloudAction[] = [];
    Object.entries(choices).forEach(([key, choice]) => {
      const L = local.get(key), R = remote.get(key);
      if (choice === "local") { if (L) actions.push({ type: "upload", key }); else if (R) actions.push({ type: "deleteRemote", key }); }
      else if (choice === "cloud") { if (R) actions.push({ type: "download", key }); }
      else { if (R && cloudKind(key) !== "foods") actions.push({ type: "download", key, asCopy: true }); if (L) actions.push({ type: "upload", key }); }   // copy first: the upload overwrites the cloud file
    });
    const batch = emptyBatch();
    const errors = await executeCloudActions(token, actions, local, remote, state, batch);
    applyBatch(batch);
    state.lastSyncAt = new Date().toISOString();
    saveState(state); setLastSyncAt(state.lastSyncAt);
    return { errors, conflicts: [] as CloudConflict[] };
  };

  /** Runs one task at a time; a request that arrives meanwhile is queued and re-run afterwards. */
  const runTask = async (task: (token: string) => Promise<{ errors: string[]; conflicts: CloudConflict[] }>, interactive: boolean) => {
    if (!readyRef.current) { setStatus(connectedRef.current ? "idle" : "disconnected"); setMessage("Still loading local data — try again in a moment."); return; }
    if (syncingRef.current) { queuedRef.current = true; return; }
    syncingRef.current = true; setStatus("syncing"); setMessage("");
    const seq = changeSeqRef.current;
    try {
      const token = await getToken(interactive);
      const res = await task(token);
      setConflicts(prev => { const same = prev.length === res.conflicts.length && prev.every((c, i) => c.key === res.conflicts[i].key); if (!same && res.conflicts.length) setConflictOpen(true); return res.conflicts; });
      if (res.errors.length) { setStatus("error"); setMessage(`${res.errors.length} item(s) could not sync — ${res.errors[0]}`); }
      else { setStatus("idle"); setMessage(res.conflicts.length ? `${res.conflicts.length} item(s) changed on two devices — choose which version to keep.` : ""); }
      if (changeSeqRef.current === seq && !res.conflicts.length && !res.errors.length) setDirty(false);
    } catch (e) {
      if (e instanceof CloudAuthError) { setStatus("needs-auth"); setMessage(e.message); }
      else if (e instanceof DriveError && e.status === 401) { tokenRef.current = null; setStatus("needs-auth"); setMessage("Google session expired — click Resume."); }
      else if (e instanceof DriveError && e.status === 403 && /accessNotConfigured|has not been used|disabled/i.test(e.message)) { setStatus("error"); setMessage("The Google Drive API isn't enabled for your Google Cloud project — enable it (setup step 2), wait a minute, then retry."); }
      else if (e instanceof DriveError && e.status === 403 && /storageQuota|quota/i.test(e.message)) { setStatus("error"); setMessage("Your Google Drive storage is full."); }
      else if (e instanceof TypeError) { setStatus("error"); setMessage("Couldn't reach Google (offline?). Changes are safe on this device and will sync when you're back online."); }
      else { setStatus("error"); setMessage(e instanceof Error ? e.message : "Sync failed."); }
    } finally {
      syncingRef.current = false;
      if (queuedRef.current) { queuedRef.current = false; setTimeout(() => { void runSyncRef.current("merge", false); }, 400); }
    }
  };

  const runSync = (mode: SyncMode, interactive: boolean) => runTask(token => syncWithToken(token, mode), interactive);
  runSyncRef.current = runSync;

  // ── tombstones: remember deletions the user makes on THIS device so they can be propagated safely ──
  useEffect(() => {
    if (!ready) return;
    const keys = new Set<string>([...recipes.map(r => `recipe-${r.id}`), ...clients.map(c => `client-${c.id}`), ...(foods.length ? ["foods"] : [])]);
    const prev = prevKeysRef.current;
    if (prev && !skipTombRef.current && connectedRef.current) {
      const s = stateRef.current;
      const added = Array.from(prev).filter(k => !keys.has(k) && s.items[k] && !s.tomb.includes(k));
      if (added.length) saveState({ ...s, tomb: [...s.tomb, ...added] });
    }
    skipTombRef.current = false;
    prevKeysRef.current = keys;
  }, [ready, recipes, clients, foods]);

  // ── mark unsynced changes + auto-sync a few seconds after the last edit ──
  useEffect(() => {
    if (!ready) return;
    if (firstChangeRef.current) { firstChangeRef.current = false; return; }
    changeSeqRef.current += 1; setDirty(true);
  }, [ready, recipes, clients, foods]);
  useEffect(() => {
    if (!ready || !connected || !auto) return;
    const t = setTimeout(() => { if (tokenValid()) void runSyncRef.current("merge", false); }, 4000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, recipes, clients, foods, connected, auto]);
  useEffect(() => {
    if (!ready || !connected) return;
    const tick = () => { if (autoRef.current && tokenValid()) void runSyncRef.current("merge", false); };
    window.addEventListener("focus", tick);
    const iv = setInterval(tick, 5 * 60_000);
    return () => { window.removeEventListener("focus", tick); clearInterval(iv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, connected]);

  const saveClientId = (id: string) => { const v = id.trim(); clientIdRef.current = v; setClientId(v); lsSet(CLOUD_LS.clientId, v); if (v) loadGis().catch(() => {}); };
  const setAuto = (v: boolean) => { autoRef.current = v; setAutoState(v); lsSet(CLOUD_LS.auto, v ? "1" : "0"); };

  const connect = async () => {
    try {
      setStatus("syncing"); setMessage("");
      await getToken(true);
    } catch (e) { setStatus(connectedRef.current ? "needs-auth" : "disconnected"); setMessage(e instanceof Error ? e.message : "Could not connect."); return; }
    connectedRef.current = true; setConnected(true); lsSet(CLOUD_LS.connected, "1");
    await runSync("merge", false);
  };
  const disconnect = (forgetClientId: boolean) => {
    const t = tokenRef.current?.token;
    if (t) { try { window.google?.accounts?.oauth2?.revoke?.(t, () => {}); } catch {} }
    tokenRef.current = null; if (expTimerRef.current) clearTimeout(expTimerRef.current);
    connectedRef.current = false; accountRef.current = ""; setConnected(false); setAccount(""); setStatus("disconnected"); setMessage(""); setConflicts([]); setConflictOpen(false);
    lsSet(CLOUD_LS.connected, ""); lsSet(CLOUD_LS.account, ""); lsSet(CLOUD_LS.state, ""); stateRef.current = emptyState();
    if (forgetClientId) { clientIdRef.current = ""; setClientId(""); lsSet(CLOUD_LS.clientId, ""); }
  };
  const resume = () => { if (connectedRef.current) void runSync("merge", !tokenValid()); };
  const syncNow = async () => { await runSync("merge", true); };
  const replaceCloud = async () => { await runSync("push-all", true); };
  const replaceLocal = async () => { await runSync("pull-all", true); };
  const resolveConflicts = async (choices: Record<string, CloudChoice>) => { setConflictOpen(false); await runTask(token => resolveWithToken(token, choices), true); };

  return { clientId, saveClientId, connected, account, status, message, lastSyncAt, auto, setAuto, dirty, conflicts, conflictOpen, setConflictOpen,
    connect, disconnect, syncNow, replaceCloud, replaceLocal, resolveConflicts, resume };
}

function fmtWhen(iso: string) {
  if (!iso) return "never";
  const d = new Date(iso);
  return isNaN(d.getTime()) ? "never" : d.toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Small status button in the header. */
function CloudChip({ cloud, onOpen }: { cloud: CloudApi; onOpen: () => void }) {
  const s = cloud.status;
  const needsClick = cloud.connected && s === "needs-auth";
  const label = !cloud.connected ? "Cloud off" : s === "syncing" ? "Syncing…" : needsClick ? "Resume sync" : s === "error" ? "Sync error"
    : cloud.conflicts.length ? "Conflicts" : cloud.dirty ? "Unsynced" : "Synced";
  const tone = !cloud.connected ? "bg-gray-100 dark:bg-gray-800 text-gray-500"
    : s === "error" || needsClick || cloud.conflicts.length ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
    : s === "syncing" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
    : cloud.dirty ? "bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300" : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300";
  return (
    <button onClick={() => (needsClick ? cloud.resume() : onOpen())} title={cloud.message || (cloud.connected ? `Google Drive · ${cloud.account || "connected"} · last sync ${fmtWhen(cloud.lastSyncAt)}` : "Back up to Google Drive")}
      className={cn("flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors print:hidden", tone)}>
      {!cloud.connected ? <CloudOff size={14} /> : s === "syncing" ? <RefreshCw size={14} className="animate-spin" /> : <Cloud size={14} />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

/** "Cloud" section of the Recipes tab: connect, status, sync controls, setup steps. */
function CloudPanel({ cloud, counts }: { cloud: CloudApi; counts: { recipes: number; clients: number; foods: number } }) {
  const [idInput, setIdInput] = useState(cloud.clientId);
  const [origin, setOrigin] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => { setOrigin(window.location.origin); }, []);
  useEffect(() => { setIdInput(cloud.clientId); }, [cloud.clientId]);
  const run = async (fn: () => Promise<void>) => { setBusy(true); try { await fn(); } finally { setBusy(false); } };
  const idOk = /\.apps\.googleusercontent\.com$/.test(idInput.trim());
  const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800";
  const btn = "text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40";
  const syncing = cloud.status === "syncing";
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Cloud size={16} className="text-blue-600" />
          <span className="font-semibold text-sm">Google Drive backup</span>
          <span className={cn("text-[11px] px-2 py-0.5 rounded-full", cloud.connected ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500")}>
            {cloud.connected ? "Connected" : "Not connected"}
          </span>
        </div>
        <p className="text-xs text-gray-500">Recipes (with photos), saved clients &amp; diet plans, and My Foods are copied to a <b>private folder in your own Google Drive</b> that only this site can open. Local export / import still works exactly as before.</p>

        {!cloud.connected && (
          <div className="space-y-2">
            <label className="text-xs text-gray-500">Google OAuth Client ID</label>
            <div className="flex gap-2" dir="ltr">
              <input value={idInput} onChange={e => setIdInput(e.target.value)} placeholder="1234567890-abc123.apps.googleusercontent.com" className={inputCls} />
              <button onClick={() => cloud.saveClientId(idInput)} disabled={!idOk || idInput.trim() === cloud.clientId} className={btn}>Save</button>
            </div>
            {idInput.trim() && !idOk && <p className="text-[11px] text-amber-600">A Client ID ends with “.apps.googleusercontent.com”.</p>}
            <button onClick={() => run(cloud.connect)} disabled={busy || !cloud.clientId}
              className="w-full bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center gap-2">
              <Cloud size={15} />{busy || syncing ? "Connecting..." : "Connect Google Drive"}
            </button>
            {!cloud.clientId && <p className="text-[11px] text-gray-400">Paste your Client ID above and press Save first — the steps below show how to get one (about 5 minutes, one time).</p>}
          </div>
        )}

        {cloud.connected && (
          <div className="space-y-2">
            <div className="text-xs flex flex-wrap gap-x-4 gap-y-1" dir="ltr">
              <span>Account: <b>{cloud.account || "—"}</b></span>
              <span>Last sync: <b>{fmtWhen(cloud.lastSyncAt)}</b></span>
              <span>{counts.recipes} recipes · {counts.clients} clients · {counts.foods} foods</span>
            </div>
            {cloud.message && (
              <div className={cn("text-xs rounded-lg px-3 py-2 border", cloud.status === "error" || cloud.status === "needs-auth" || cloud.conflicts.length
                ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200" : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300")}>{cloud.message}</div>
            )}
            {cloud.status === "idle" && !cloud.message && !cloud.dirty && <div className="text-xs text-green-700 dark:text-green-300">✅ Everything is backed up.</div>}
            {cloud.dirty && cloud.status !== "syncing" && <div className="text-xs text-sky-700 dark:text-sky-300">Changes on this device haven&apos;t been backed up yet{cloud.auto ? " — they sync automatically in a few seconds." : "."}</div>}
            {cloud.conflicts.length > 0 && <button onClick={() => cloud.setConflictOpen(true)} className="text-xs px-3 py-1.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600">Review {cloud.conflicts.length} conflict(s)</button>}
            <div className="flex flex-wrap gap-2">
              <button onClick={() => run(cloud.status === "needs-auth" ? async () => cloud.resume() : cloud.syncNow)} disabled={busy || syncing}
                className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40">
                <RefreshCw size={13} className={syncing ? "animate-spin" : ""} />{cloud.status === "needs-auth" ? "Resume sync" : "Sync now"}
              </button>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer px-2">
                <input type="checkbox" checked={cloud.auto} onChange={e => cloud.setAuto(e.target.checked)} className="accent-blue-600" />Auto-sync
              </label>
              <button onClick={() => { if (window.confirm("Disconnect from Google Drive?\n\nYour data stays on this device and in your Drive; syncing just stops.")) cloud.disconnect(false); }} className={btn}>Disconnect</button>
            </div>
            <details className="text-xs">
              <summary className="cursor-pointer text-gray-500">Advanced</summary>
              <div className="mt-2 flex flex-wrap gap-2">
                <button disabled={busy || syncing} className={btn}
                  onClick={() => { if (window.confirm("Replace the cloud copy with what is on THIS device?\n\nAnything that only exists in the cloud will be deleted.")) run(cloud.replaceCloud); }}>Replace cloud with this device</button>
                <button disabled={busy || syncing} className={btn}
                  onClick={() => { if (window.confirm("Replace THIS device with the cloud copy?\n\nRecipes, clients and foods that only exist on this device will be deleted. Export a backup first if unsure.")) run(cloud.replaceLocal); }}>Replace this device with cloud</button>
              </div>
            </details>
          </div>
        )}
      </div>

      <details className="rounded-xl border border-gray-200 dark:border-gray-700 p-3 text-xs" open={!cloud.clientId}>
        <summary className="cursor-pointer font-semibold text-sm">How to get a Client ID (one-time setup)</summary>
        <ol className="list-decimal ps-5 mt-2 space-y-1.5 text-gray-600 dark:text-gray-300" dir="ltr">
          <li>Open <b>console.cloud.google.com</b>, sign in with the Google account that will store the backup, and create a project (any name).</li>
          <li><b>APIs &amp; Services → Library</b> → search <b>Google Drive API</b> → <b>Enable</b>.</li>
          <li><b>Google Auth Platform</b> (or “OAuth consent screen”): set an app name and your email; Audience = <b>External</b>. Add your own Gmail under <b>Test users</b> (or click <b>Publish app</b> to avoid the test-user limit).</li>
          <li><b>Data Access → Add or remove scopes</b>: add <code className="px-1 rounded bg-gray-100 dark:bg-gray-800">…/auth/drive.appdata</code> and <code className="px-1 rounded bg-gray-100 dark:bg-gray-800">…/auth/userinfo.email</code>.</li>
          <li><b>Clients → Create client → Web application</b>. Under <b>Authorized JavaScript origins</b> add exactly: <code className="px-1 rounded bg-gray-100 dark:bg-gray-800 select-all">{origin || "https://your-site-address"}</code> (and <code className="px-1 rounded bg-gray-100 dark:bg-gray-800">http://localhost:3000</code> if you also run it locally). No path, no trailing slash.</li>
          <li>Create, copy the <b>Client ID</b> (not the secret), paste it above, <b>Save</b>, then <b>Connect Google Drive</b>. Google may say the app is “unverified” — choose <b>Advanced → Continue</b> (it&apos;s your own app). Origin changes can take a few minutes to apply.</li>
        </ol>
        <p className="mt-2 text-gray-500">Use the same Client ID on every device so they all see the same folder. The Client ID is not secret.</p>
      </details>

      <div className="text-[11px] text-gray-400 space-y-1">
        <p>🔒 Client data (including health notes) is stored only in your private Drive app folder. It is not encrypted by this site, so keep that Google account secure.</p>
        <p>⏱ Google&apos;s browser sign-in lasts about an hour. After that, auto-sync pauses and the header shows <b>Resume sync</b> — one click continues. Signing in to this site also resumes it.</p>
      </div>
    </div>
  );
}

/** Shown when the same recipe/client/foods changed on two devices since the last sync. */
function CloudConflictDialog({ conflicts, onApply, onClose }: { conflicts: CloudConflict[]; onApply: (c: Record<string, CloudChoice>) => void; onClose: () => void }) {
  const [choices, setChoices] = useState<Record<string, CloudChoice>>(() => Object.fromEntries(conflicts.map(c => [c.key, "local" as CloudChoice])));
  const kindLabel = { recipe: "Recipe", client: "Client", foods: "My Foods" } as const;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 print:hidden" role="dialog" aria-modal="true">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-4 space-y-3">
        <h3 className="font-bold text-base">Changed on two devices</h3>
        <p className="text-xs text-gray-500">These items were edited here <i>and</i> in the cloud since the last sync. Pick which version to keep — nothing is overwritten until you press Apply.</p>
        <div className="space-y-2">
          {conflicts.map(c => (
            <div key={c.key} className="border border-gray-200 dark:border-gray-700 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium truncate">{c.label}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 shrink-0">{kindLabel[c.kind]}</span>
              </div>
              <div className="text-[11px] text-gray-400" dir="ltr">Cloud version saved {fmtWhen(c.remoteModified)}</div>
              <div className="flex gap-1 text-xs">
                {([["local", "Keep this device"], ["cloud", "Use cloud"], ...(c.kind !== "foods" ? [["both", "Keep both"]] : [])] as [CloudChoice, string][]).map(([v, l]) => (
                  <button key={v} onClick={() => setChoices(p => ({ ...p, [c.key]: v }))}
                    className={cn("flex-1 py-1.5 rounded-lg border", choices[c.key] === v ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300")}>{l}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="text-sm px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600">Decide later</button>
          <button onClick={() => onApply(choices)} className="text-sm px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700">Apply</button>
        </div>
      </div>
    </div>
  );
}

// ─── RECIPES TAB ───────────────────────────────────────────────────────────────
interface RecipeStudioProps {
  allFoods: FoodEntry[];                 // database + saved custom foods (NOT recipes — avoids recursion)
  customFoods: FoodEntry[];
  setCustomFoods: React.Dispatch<React.SetStateAction<FoodEntry[]>>;
  recipes: CustomRecipe[];
  setRecipes: React.Dispatch<React.SetStateAction<CustomRecipe[]>>;
  onAddAsMeal: (r: CustomRecipe) => void;
  storageError: string;
  focusRecipeId: number | null;
  onFocusHandled: () => void;
  cloud: CloudApi;
  clientCount: number;
}
function RecipeStudio({ allFoods, customFoods, setCustomFoods, recipes, setRecipes, onAddAsMeal, storageError, focusRecipeId, onFocusHandled, cloud, clientCount }: RecipeStudioProps) {
  const [section, setSection] = useState<"recipes" | "foods" | "cloud">("recipes");
  const [mode, setMode] = useState<"library" | "editor">("library");
  const [draft, setDraft] = useState<CustomRecipe>(newRecipe());
  const [search, setSearch] = useState("");
  const [cat, setCat] = useState("All");
  const [ingSearch, setIngSearch] = useState("");
  const [showNewIngredient, setShowNewIngredient] = useState(false);
  const [previewServings, setPreviewServings] = useState<number | null>(null);
  const [imgBusy, setImgBusy] = useState(false);
  const [imgError, setImgError] = useState("");
  const [toast, setToast] = useState("");
  const [foodSearch, setFoodSearch] = useState("");
  const [foodForm, setFoodForm] = useState<null | "new" | number>(null);
  const importRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const inputCls = "w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800";

  function flash(msg: string) { setToast(msg); setTimeout(() => setToast(""), 3500); }

  function openEditor(r?: CustomRecipe) {
    if (r) {
      const copy: CustomRecipe = JSON.parse(JSON.stringify(r));
      setDraft({ ...copy, steps: copy.steps && copy.steps.length ? copy.steps : [""], images: copy.images || [] });
    } else {
      setDraft(newRecipe());
    }
    setPreviewServings(null); setIngSearch(""); setShowNewIngredient(false); setImgError("");
    setSection("recipes"); setMode("editor");
  }

  useEffect(() => {
    if (focusRecipeId === null) return;
    const r = recipes.find(x => x.id === focusRecipeId);
    if (r) openEditor(r);
    onFocusHandled();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusRecipeId]);

  const isExisting = recipes.some(r => r.id === draft.id);
  const canSave = draft.name.trim().length > 0 && draft.ingredients.length > 0;

  function saveRecipe(asCopy = false) {
    if (!canSave) return;
    const final: CustomRecipe = {
      ...draft,
      id: asCopy ? Date.now() : draft.id,
      name: draft.name.trim() + (asCopy ? " (copy)" : ""),
      serves: Math.max(1, draft.serves || 1),
      steps: (draft.steps || []).map(s => s.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    setRecipes(prev => (prev.some(r => r.id === final.id) ? prev.map(r => (r.id === final.id ? final : r)) : [...prev, final]));
    flash(`Saved "${final.name}" ✓ — it is now also a food item in the Planner (category: Recipes).`);
    setMode("library");
  }
  function deleteRecipe(r: CustomRecipe) {
    if (!window.confirm(`Delete recipe "${r.name}"? This cannot be undone (export a backup first if unsure).`)) return;
    setRecipes(prev => prev.filter(x => x.id !== r.id));
  }
  function duplicateRecipe(r: CustomRecipe) {
    setRecipes(prev => [...prev, { ...r, id: Date.now(), name: r.name + " (copy)" }]);
  }

  // ── photos ──
  async function handlePhotos(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImgError(""); setImgBusy(true);
    try {
      const room = MAX_RECIPE_IMAGES - (draft.images || []).length;
      const picked = Array.from(files).slice(0, Math.max(0, room));
      if (files.length > room) setImgError(`Max ${MAX_RECIPE_IMAGES} photos per recipe — extra files were skipped.`);
      const out: string[] = [];
      for (const f of picked) {
        try { out.push(await compressImage(f)); }
        catch (err) { setImgError(`${f.name}: ${err instanceof Error ? err.message : "could not be added"}`); }
      }
      if (out.length) setDraft(p => ({ ...p, images: [...(p.images || []), ...out] }));
    } finally {
      setImgBusy(false);
      if (photoRef.current) photoRef.current.value = "";
    }
  }
  function makeCover(i: number) {
    setDraft(p => { const imgs = [...(p.images || [])]; const [x] = imgs.splice(i, 1); return { ...p, images: [x, ...imgs] }; });
  }

  // ── steps ──
  function setStep(i: number, v: string) { setDraft(p => ({ ...p, steps: (p.steps || []).map((s, j) => (j === i ? v : s)) })); }
  function moveStep(i: number, dir: -1 | 1) {
    setDraft(p => {
      const s = [...(p.steps || [])]; const j = i + dir;
      if (j < 0 || j >= s.length) return p;
      [s[i], s[j]] = [s[j], s[i]];
      return { ...p, steps: s };
    });
  }

  // ── ingredients ──
  function addIngredient(f: FoodEntry) {
    setDraft(p => p.ingredients.some(i => i.foodId === f.id) ? p
      : { ...p, ingredients: [...p.ingredients, { foodId: f.id, grams: isPerPiece(f.state) ? 1 : 100 }] });
    setIngSearch("");
  }
  const q = normalizeAr(ingSearch.trim());
  const ingResults = q.length > 1 ? allFoods.filter(f => normalizeAr(f.name).includes(q)).slice(0, 8) : [];

  const batch = recipeBatch(draft, allFoods);
  const s = Math.max(1, draft.serves || 1);
  const viewServings = previewServings && previewServings > 0 ? previewServings : s;
  const scale = viewServings / s;

  // ── backup ──
  function exportBackup() {
    const payload = { app: "msr-planner", version: 1, exportedAt: new Date().toISOString(), recipes, customFoods };
    const blob = new Blob([JSON.stringify(payload)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `msr-recipes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    flash(`Exported ${recipes.length} recipes and ${customFoods.length} custom foods.`);
  }
  async function importBackup(file: File) {
    try {
      const data: unknown = JSON.parse(await file.text());
      const obj = (data && typeof data === "object" ? data : {}) as { recipes?: unknown; customFoods?: unknown };
      const recs = Array.isArray(obj.recipes) ? obj.recipes.filter(isRecipeLike) : [];
      const foods = Array.isArray(obj.customFoods) ? obj.customFoods.filter(isFoodLike) : [];
      if (recs.length === 0 && foods.length === 0) { flash("That file has no recipes or foods in the expected format."); return; }
      setRecipes(prev => { const m = new Map(prev.map(r => [r.id, r] as const)); recs.forEach(r => m.set(r.id, r)); return Array.from(m.values()); });
      setCustomFoods(prev => { const m = new Map(prev.map(f => [f.id, f] as const)); foods.forEach(f => m.set(f.id, f)); return Array.from(m.values()); });
      flash(`Imported ${recs.length} recipes and ${foods.length} custom foods (existing ones with the same id were updated).`);
    } catch {
      flash("Could not read that file — is it a backup exported from this app?");
    } finally {
      if (importRef.current) importRef.current.value = "";
    }
  }

  // ── my foods ──
  function saveFoodFromManager(food: Omit<FoodEntry, "id">) {
    if (typeof foodForm === "number") {
      setCustomFoods(prev => prev.map(f => (f.id === foodForm ? { ...f, ...food } : f)));
    } else {
      setCustomFoods(prev => [...prev, { ...food, id: Date.now() }]);
    }
    setFoodForm(null);
  }
  function deleteFood(f: FoodEntry) {
    const used = recipes.filter(r => r.ingredients.some(i => i.foodId === f.id)).length;
    const msg = used > 0
      ? `"${displayName(f.name, "en")}" is used in ${used} recipe(s). Deleting it will leave a missing ingredient there. Delete anyway?`
      : `Delete "${displayName(f.name, "en")}" from your food database?`;
    if (window.confirm(msg)) setCustomFoods(prev => prev.filter(x => x.id !== f.id));
  }

  // ═════════════ RENDER ═════════════
  const header = (
    <div className="flex items-center justify-between flex-wrap gap-2">
      <h2 className="font-bold text-base flex items-center gap-2"><BookOpen size={18} className="text-purple-600" />Recipes - وصفات</h2>
      <div className="flex gap-1 text-xs">
        {([["recipes", "Recipes"], ["foods", "My Foods"], ["cloud", "☁ Cloud"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => { setSection(v); if (v === "recipes") setMode("library"); }}
            className={cn("px-3 py-1.5 rounded-lg font-medium", section === v ? "bg-purple-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700")}>{l}</button>
        ))}
      </div>
    </div>
  );

  const banner = (
    <>
      {toast && <div className="text-xs rounded-lg px-3 py-2 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-800">{toast}</div>}
      {storageError && <div className="text-xs rounded-lg px-3 py-2 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-800">⚠️ {storageError}</div>}
    </>
  );

  // ── CLOUD ──
  if (section === "cloud") {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
        {header}{banner}
        <CloudPanel cloud={cloud} counts={{ recipes: recipes.length, clients: clientCount, foods: customFoods.length }} />
      </div>
    );
  }

  // ── MY FOODS ──
  if (section === "foods") {
    const fq = normalizeAr(foodSearch.trim());
    const list = customFoods.filter(f => !fq || normalizeAr(f.name).includes(fq));
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
        {header}{banner}
        <p className="text-xs text-gray-400">Foods you saved are searchable in every meal (category “Custom”) and can be used as recipe ingredients. Editing a food updates recipes that use it; meals you already built keep the values they were added with.</p>
        <div className="flex gap-2">
          <input value={foodSearch} onChange={e => setFoodSearch(e.target.value)} placeholder="🔍 Search my foods..." className={inputCls} />
          <button onClick={() => setFoodForm("new")} className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"><Plus size={14} />New</button>
        </div>
        {foodForm !== null && (
          <CustomFoodForm key={String(foodForm)} initial={typeof foodForm === "number" ? customFoods.find(f => f.id === foodForm) : undefined}
            submitLabel="Save food ✓" onSubmit={f => saveFoodFromManager(f)} onCancel={() => setFoodForm(null)} />
        )}
        {customFoods.length === 0 && foodForm === null && <p className="text-sm text-gray-400 text-center py-6">No saved foods yet. Add one here, or tick “Save to my food database” when you add a custom food in the Planner.</p>}
        <div className="space-y-1">
          {list.map(f => {
            const chk = calorieCheck(f.protein, f.carbs, f.fat, f.calories);
            return (
              <div key={f.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{f.name}</div>
                  <div className="text-xs text-gray-500 flex flex-wrap gap-x-3" dir="ltr">
                    <span>{f.state}</span><span className="font-semibold">{f.calories} kcal</span>
                    <span className="text-blue-600">P {f.protein}</span><span className="text-yellow-600">C {f.carbs}</span><span className="text-red-500">F {f.fat}</span>
                  </div>
                  {chk.mismatch && <div className="text-[11px] text-amber-600" dir="ltr">⚠️ macros add up to {chk.calc} kcal ({chk.pct.toFixed(0)}% off)</div>}
                </div>
                <button onClick={() => setFoodForm(f.id)} className="text-xs text-blue-600 hover:underline">Edit</button>
                <button onClick={() => deleteFood(f)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={exportBackup} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"><Download size={13} />Export backup</button>
          <button onClick={() => importRef.current?.click()} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"><Upload size={13} />Import backup</button>
          <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importBackup(f); }} />
        </div>
      </div>
    );
  }

  // ── LIBRARY ──
  if (mode === "library") {
    const rq = normalizeAr(search.trim());
    const categories = ["All", ...Array.from(new Set(recipes.map(r => r.category).filter(Boolean)))];
    const list = recipes.filter(r => (cat === "All" || r.category === cat) && (!rq || normalizeAr(r.name).includes(rq) || normalizeAr(r.category || "").includes(rq)));
    return (
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3">
        {header}{banner}
        <div className="flex gap-2">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search recipes..." className={inputCls} />
          <button onClick={() => openEditor()} className="shrink-0 flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"><Plus size={14} />New recipe</button>
        </div>
        {categories.length > 2 && (
          <div className="flex gap-1 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCat(c)} className={cn("text-xs px-2.5 py-1 rounded-full border", cat === c ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300")}>{c}</button>
            ))}
          </div>
        )}
        {recipes.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm space-y-2">
            <BookOpen size={36} className="mx-auto opacity-40" />
            <p>No recipes yet.</p>
            <p className="text-xs">Create one with ingredients, photos and step-by-step instructions. It becomes a food item you can drop into any meal, and it can be printed in your client&apos;s PDF.</p>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {list.map(r => {
            const f = recipeToFood(r, allFoods);
            const total = (r.prepMin || 0) + (r.cookMin || 0);
            const missing = recipeBatch(r, allFoods).missing;
            return (
              <div key={r.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 flex flex-col">
                {r.images && r.images[0]
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={r.images[0]} alt={r.name} className="w-full h-32 object-cover" />
                  : <div className="w-full h-20 flex items-center justify-center bg-purple-50 dark:bg-purple-950/30 text-purple-300"><BookOpen size={28} /></div>}
                <div className="p-3 space-y-1.5 flex-1 flex flex-col">
                  <div className="font-semibold text-sm leading-snug">{r.name}</div>
                  <div className="text-[11px] text-gray-500 flex flex-wrap gap-x-2 items-center" dir="ltr">
                    {r.category && <span className="px-1.5 rounded bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300">{r.category}</span>}
                    <span>{r.serves} serving{r.serves > 1 ? "s" : ""}</span>
                    {total > 0 && <span className="flex items-center gap-0.5"><Clock size={11} />{total} min</span>}
                    {r.difficulty && <span>{r.difficulty}</span>}
                  </div>
                  <div className="text-xs flex flex-wrap gap-x-3" dir="ltr">
                    <span className="font-bold">{f.calories} kcal</span>
                    <span className="text-blue-600">P {f.protein}</span><span className="text-yellow-600">C {f.carbs}</span><span className="text-red-500">F {f.fat}</span>
                    <span className="text-gray-400">/ serving</span>
                  </div>
                  <div className="text-[11px] text-gray-400">{r.ingredients.length} ingredients · {(r.steps || []).filter(Boolean).length} steps{(r.images || []).length ? ` · ${(r.images || []).length} photo(s)` : ""}</div>
                  {missing > 0 && <div className="text-[11px] text-red-500">⚠️ {missing} ingredient(s) no longer exist — open and fix.</div>}
                  <div className="flex gap-1 flex-wrap mt-auto pt-1">
                    <button onClick={() => onAddAsMeal(r)} className="text-xs bg-teal-600 text-white px-2 py-1 rounded-lg hover:bg-teal-700">+ Add as meal</button>
                    <button onClick={() => openEditor(r)} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800">Open / Edit</button>
                    <button onClick={() => duplicateRecipe(r)} title="Duplicate" className="text-gray-400 hover:text-blue-500 px-1"><Copy size={14} /></button>
                    <button onClick={() => deleteRecipe(r)} title="Delete" className="text-red-400 hover:text-red-600 px-1"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {recipes.length > 0 && list.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No recipes match.</p>}
        <div className="border-t border-gray-100 dark:border-gray-800 pt-3 space-y-2">
          <p className="text-[11px] text-gray-400">💾 Recipes and photos are stored on <b>this computer</b> (your browser&apos;s local database) — not online. Clearing browser data erases them, so export a backup now and then.</p>
          <div className="flex gap-2">
            <button onClick={exportBackup} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"><Download size={13} />Export backup</button>
            <button onClick={() => importRef.current?.click()} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"><Upload size={13} />Import backup</button>
            <input ref={importRef} type="file" accept="application/json,.json" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) importBackup(f); }} />
          </div>
        </div>
      </div>
    );
  }

  // ── EDITOR ──
  const perServing = { kcal: Math.round(batch.calories / s), p: round1(batch.protein / s), c: round1(batch.carbs / s), f: round1(batch.fat / s) };
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
      {header}{banner}
      <div className="flex items-center justify-between">
        <button onClick={() => setMode("library")} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"><ArrowLeft size={14} />Back to recipes</button>
        <span className="text-xs font-semibold text-purple-600">{isExisting ? "✏️ Editing recipe" : "✨ New recipe"}</span>
      </div>

      {/* basics */}
      <div className="grid grid-cols-2 gap-2">
        <input value={draft.name} onChange={e => setDraft(p => ({ ...p, name: e.target.value }))} dir="auto"
          placeholder="Recipe name — e.g. Protein Pancakes - بان كيك بروتين" className={cn(inputCls, "col-span-2 font-medium")} />
        <div>
          <label className="text-xs text-gray-500">Category</label>
          <input list="recipe-cats" value={draft.category} onChange={e => setDraft(p => ({ ...p, category: e.target.value }))} className={cn(inputCls, "mt-1")} />
          <datalist id="recipe-cats">{RECIPE_CATEGORIES.map(c => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <label className="text-xs text-gray-500">Servings (makes)</label>
          <input type="number" min="1" value={draft.serves} onChange={e => setDraft(p => ({ ...p, serves: Math.max(1, +e.target.value) }))} className={cn(inputCls, "mt-1")} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Prep time (min)</label>
          <input type="number" min="0" value={draft.prepMin || ""} onChange={e => setDraft(p => ({ ...p, prepMin: Math.max(0, +e.target.value) }))} className={cn(inputCls, "mt-1")} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Cook time (min)</label>
          <input type="number" min="0" value={draft.cookMin || ""} onChange={e => setDraft(p => ({ ...p, cookMin: Math.max(0, +e.target.value) }))} className={cn(inputCls, "mt-1")} />
        </div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500">Difficulty</label>
          <div className="flex gap-1 mt-1">
            {(["Easy", "Medium", "Hard"] as const).map(dv => (
              <button key={dv} onClick={() => setDraft(p => ({ ...p, difficulty: dv }))}
                className={cn("flex-1 text-xs py-1.5 rounded-lg border", draft.difficulty === dv ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300")}>{dv}</button>
            ))}
          </div>
        </div>
      </div>

      {/* photos */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Photos ({(draft.images || []).length}/{MAX_RECIPE_IMAGES})</div>
          <button onClick={() => photoRef.current?.click()} disabled={imgBusy || (draft.images || []).length >= MAX_RECIPE_IMAGES}
            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 disabled:opacity-40">
            <ImagePlus size={14} />{imgBusy ? "Processing..." : "Add photos"}
          </button>
          <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={e => handlePhotos(e.target.files)} />
        </div>
        {imgError && <div className="text-xs text-red-500">{imgError}</div>}
        {(draft.images || []).length === 0
          ? <p className="text-xs text-gray-400">No photos yet. The first photo is the cover shown in the library and at the top of the recipe page in the PDF.</p>
          : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {(draft.images || []).map((src, i) => (
                <div key={i} className="relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`photo ${i + 1}`} className="w-full h-24 object-cover" />
                  {i === 0 && <span className="absolute top-1 left-1 text-[10px] bg-purple-600 text-white px-1.5 rounded">Cover</span>}
                  <button onClick={() => setDraft(p => ({ ...p, images: (p.images || []).filter((_, j) => j !== i) }))} title="Remove photo"
                    className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-red-600"><X size={12} /></button>
                  {i !== 0 && <button onClick={() => makeCover(i)} className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 rounded hover:bg-purple-600">Make cover</button>}
                </div>
              ))}
            </div>
          )}
      </div>

      {/* ingredients */}
      <div className="space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ingredients ({draft.ingredients.length})</div>
          <label className="flex items-center gap-1 text-[11px] text-gray-500" dir="ltr">
            Preview for
            <input type="number" min="1" value={previewServings ?? ""} placeholder={String(s)} onChange={e => setPreviewServings(e.target.value ? Math.max(1, +e.target.value) : null)}
              className="w-12 text-center text-xs border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-800" />
            servings
          </label>
        </div>
        <div className="relative">
          <input value={ingSearch} onChange={e => setIngSearch(e.target.value)} placeholder="🔍 Search a food to add as an ingredient..." className={inputCls} />
          {ingResults.length > 0 && (
            <div className="mt-1 border border-gray-200 dark:border-gray-700 rounded-lg max-h-48 overflow-y-auto bg-white dark:bg-gray-800 shadow">
              {ingResults.map(f => (
                <button key={f.id} onClick={() => addIngredient(f)}
                  className="w-full text-start px-3 py-1.5 text-xs hover:bg-purple-50 dark:hover:bg-purple-950/30 border-b border-gray-100 dark:border-gray-700 last:border-0 flex justify-between items-center gap-2">
                  <span className="font-medium">{displayName(f.name, "both")}</span>
                  <span className="text-gray-400 text-[10px] shrink-0" dir="ltr">{f.category} · {f.state}</span>
                </button>
              ))}
            </div>
          )}
          {q.length > 1 && ingResults.length === 0 && <p className="text-xs text-gray-400 mt-1">No match — create it below as a custom ingredient.</p>}
        </div>
        <button onClick={() => setShowNewIngredient(v => !v)} className="text-xs text-purple-600 hover:underline">{showNewIngredient ? "Hide custom ingredient form" : "➕ Can't find it? Create a custom ingredient"}</button>
        {showNewIngredient && (
          <CustomFoodForm submitLabel="Save & add to recipe ✓"
            onSubmit={food => {
              const entry: FoodEntry = { ...food, id: Date.now() + Math.floor(Math.random() * 1000) };
              setCustomFoods(prev => [...prev, entry]);
              setDraft(p => ({ ...p, ingredients: [...p.ingredients, { foodId: entry.id, grams: isPerPiece(entry.state) ? 1 : 100 }] }));
              setShowNewIngredient(false);
              flash(`"${displayName(entry.name, "en")}" was saved to My Foods and added to this recipe.`);
            }}
            onCancel={() => setShowNewIngredient(false)} />
        )}
        {draft.ingredients.length === 0 && <p className="text-xs text-gray-400">Add the ingredients for the <b>whole batch</b> — amounts are divided by the number of servings automatically.</p>}
        <div className="space-y-1">
          {draft.ingredients.map((ing, idx) => {
            const fd = allFoods.find(f => f.id === ing.foodId);
            if (!fd) return (
              <div key={`${ing.foodId}-${idx}`} className="flex items-center justify-between text-xs bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg px-3 py-2">
                <span>⚠️ Missing ingredient (the food was deleted)</span>
                <button onClick={() => setDraft(p => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }))}><Trash2 size={13} /></button>
              </div>
            );
            const unit = getUnitInfo(fd.state);
            const m = foodMult(fd, ing.grams);
            return (
              <div key={ing.foodId} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-2 py-1.5">
                <div className="flex items-center gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{displayName(fd.name, "both")}</div>
                    <div className="text-[11px] text-gray-400" dir="ltr">{Math.round(fd.calories * m)} kcal · {round1(fd.protein * m)}g P · {round1(fd.carbs * m)}g C · {round1(fd.fat * m)}g F</div>
                  </div>
                  <div className="flex items-center gap-1" dir="ltr">
                    <input type="number" min="0" step="any" value={ing.grams || ""}
                      onChange={e => setDraft(p => ({ ...p, ingredients: p.ingredients.map((x, i) => (i === idx ? { ...x, grams: Math.max(0, +e.target.value) } : x)) }))}
                      className="w-16 text-xs text-center border border-gray-300 dark:border-gray-600 rounded px-1 py-0.5 bg-white dark:bg-gray-700" />
                    <span className="text-xs text-gray-500 w-7">{unit.label}</span>
                  </div>
                  <button onClick={() => setDraft(p => ({ ...p, ingredients: p.ingredients.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600 shrink-0"><Trash2 size={13} /></button>
                </div>
                <div className="flex items-center justify-between gap-2 mt-1" dir="ltr">
                  <div className="flex gap-0.5">
                    {!isPerPiece(fd.state) && [50, 100, 150, 200].map(g => (
                      <button key={g} onClick={() => setDraft(p => ({ ...p, ingredients: p.ingredients.map((x, i) => (i === idx ? { ...x, grams: g } : x)) }))}
                        className={cn("text-[10px] px-1.5 py-0.5 rounded border", ing.grams === g ? "bg-purple-600 text-white border-purple-600" : "border-gray-300 dark:border-gray-600 text-gray-500 hover:border-purple-500")}>{g}</button>
                    ))}
                  </div>
                  <div className="text-[11px] text-gray-400 text-right">
                    {fmtAmt(ing.grams / s)} {unit.label} / serving
                    {scale !== 1 && <span className="text-purple-600 font-semibold"> · {fmtAmt(ing.grams * scale)} {unit.label} for {viewServings}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {draft.ingredients.length > 0 && (
          <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg px-3 py-2 text-xs space-y-0.5" dir="ltr">
            <div className="font-medium">Whole recipe ({s} serving{s > 1 ? "s" : ""}): <b>{Math.round(batch.calories)} kcal</b> · <span className="text-blue-600">{round1(batch.protein)}g P</span> · <span className="text-yellow-600">{round1(batch.carbs)}g C</span> · <span className="text-red-500">{round1(batch.fat)}g F</span></div>
            <div className="font-semibold text-purple-700 dark:text-purple-300">Per serving: {perServing.kcal} kcal · {perServing.p}g P · {perServing.c}g C · {perServing.f}g F</div>
          </div>
        )}
      </div>

      {/* instructions */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Instructions - طريقة التحضير</div>
        {(draft.steps || []).map((st, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="w-6 h-6 mt-1 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</div>
            <textarea value={st} dir="auto" rows={2} onChange={e => setStep(i, e.target.value)} placeholder={`Step ${i + 1}...`}
              className="flex-1 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 resize-y" />
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => moveStep(i, -1)} disabled={i === 0} className="text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronUp size={14} /></button>
              <button onClick={() => moveStep(i, 1)} disabled={i === (draft.steps || []).length - 1} className="text-gray-400 hover:text-gray-700 disabled:opacity-30"><ChevronDown size={14} /></button>
              <button onClick={() => setDraft(p => ({ ...p, steps: (p.steps || []).length > 1 ? (p.steps || []).filter((_, j) => j !== i) : [""] }))} className="text-red-400 hover:text-red-600"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
        <button onClick={() => setDraft(p => ({ ...p, steps: [...(p.steps || []), ""] }))} className="flex items-center gap-1 text-xs text-purple-600 hover:underline"><Plus size={13} />Add step</button>
        <textarea value={draft.notes} dir="auto" rows={2} onChange={e => setDraft(p => ({ ...p, notes: e.target.value }))}
          placeholder="Tips, storage, swaps (optional) — printed under the steps" className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 resize-none" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => saveRecipe(false)} disabled={!canSave}
          className="flex-1 bg-purple-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed">{isExisting ? "Update recipe ✓" : "Save recipe ✓"}</button>
        {isExisting && <button onClick={() => saveRecipe(true)} disabled={!canSave} className="px-4 py-2 border border-purple-300 text-purple-600 rounded-xl text-sm hover:bg-purple-50 dark:hover:bg-purple-950/30 disabled:opacity-40">Save as copy</button>}
        <button onClick={() => setMode("library")} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl text-sm hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
      </div>
      {!canSave && <p className="text-xs text-gray-400">A recipe needs a name and at least one ingredient to be saved.</p>}
    </div>
  );
}

// ─── PLANNER: QUICK RECIPE PANEL (keeps the original "add recipe as a meal" flow) ───
function RecipeQuickAdd({ recipes, foods, onAddAsMeal, onOpen, onManage, onClose }: {
  recipes: CustomRecipe[]; foods: FoodEntry[]; onAddAsMeal: (r: CustomRecipe) => void;
  onOpen: (id: number) => void; onManage: () => void; onClose: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3 border-2 border-purple-100 dark:border-purple-900 print:hidden">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm flex items-center gap-2"><BookOpen size={16} className="text-purple-600" />Recipes - وصفات</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>
      <p className="text-xs text-gray-400">Add a recipe as a ready-made <b>meal</b> (ingredients listed one by one) — or search for it inside any meal to add it as a <b>single food item</b> (category “Recipes”).</p>
      {recipes.length === 0 && <p className="text-sm text-gray-400 text-center py-3">No recipes yet.</p>}
      <div className="space-y-1.5">
        {recipes.map(r => {
          const f = recipeToFood(r, foods);
          return (
            <div key={r.id} className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950/30 rounded-xl px-3 py-2">
              {r.images && r.images[0]
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={r.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" /> : null}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{r.name}</div>
                <div className="text-xs text-gray-400" dir="ltr">{f.calories} kcal · {f.protein}g P / serving</div>
              </div>
              <button onClick={() => onAddAsMeal(r)} className="text-xs bg-teal-600 text-white px-2 py-1 rounded-lg hover:bg-teal-700 shrink-0">+ Meal</button>
              <button onClick={() => onOpen(r.id)} className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-lg shrink-0">Open</button>
            </div>
          );
        })}
      </div>
      <button onClick={onManage} className="w-full text-xs border border-purple-300 text-purple-600 rounded-xl py-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/30">Create / manage recipes in the Recipes tab →</button>
    </div>
  );
}

// ─── PDF: ONE FULL PAGE PER RECIPE (print-only; target of the clickable links) ──
function RecipePdfPage({ recipe, foods, printLang, clientName, showBackLink }: {
  recipe: CustomRecipe; foods: FoodEntry[]; printLang: "ar" | "en" | "both"; clientName: string; showBackLink: boolean;
}) {
  const ar = printLang === "ar";
  const both = printLang === "both";
  const t = (en: string, arS: string) => (ar ? arS : both ? `${en} · ${arS}` : en);
  const arFont = { fontFamily: "'Noto Sans Arabic',sans-serif" };
  const b = recipeBatch(recipe, foods);
  const s = Math.max(1, recipe.serves || 1);
  const per = { kcal: Math.round(b.calories / s), p: round1(b.protein / s), c: round1(b.carbs / s), f: round1(b.fat / s) };
  const imgs = recipe.images || [];
  const steps = (recipe.steps || []).filter(x => x.trim());
  const total = (recipe.prepMin || 0) + (recipe.cookMin || 0);
  const diffAr: Record<string, string> = { Easy: "سهل", Medium: "متوسط", Hard: "صعب" };
  return (
    <div id={`recipe-${recipe.id}`} dir={ar || both ? "rtl" : "ltr"} className="pdf-recipe pdf-break hidden print:block">
      <div className="pdf-page-header">
        <div className="pdf-page-header-logo">
          <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
          <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
        </div>
        <div className="pdf-page-header-right">{t("Recipe", "وصفة")} &nbsp;·&nbsp; <span>{clientName}</span></div>
      </div>
      <div className="pdf-recipe-body">
        {showBackLink && <a href="#pdf-meals" className="pdf-recipe-back">← {t("Back to meals", "الرجوع للوجبات")}</a>}
        <div className="pdf-section-label">{recipe.category || t("Recipe", "وصفة")}</div>
        <div className="pdf-recipe-title" style={ar ? arFont : undefined}>{displayName(recipe.name, printLang)}</div>
        <div className="pdf-recipe-meta">
          <span>🍽 {s} {t(s > 1 ? "servings" : "serving", "حصص")}</span>
          {(recipe.prepMin || 0) > 0 && <span>⏱ {t("Prep", "تحضير")} {recipe.prepMin} {t("min", "د")}</span>}
          {(recipe.cookMin || 0) > 0 && <span>🔥 {t("Cook", "طهي")} {recipe.cookMin} {t("min", "د")}</span>}
          {total > 0 && <span>⏳ {t("Total", "الإجمالي")} {total} {t("min", "د")}</span>}
          {recipe.difficulty && <span>📊 {ar ? diffAr[recipe.difficulty] : both ? `${recipe.difficulty} · ${diffAr[recipe.difficulty]}` : recipe.difficulty}</span>}
        </div>
        {imgs.length > 0 && (
          <div className="pdf-recipe-photos">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgs[0]} alt="" className="pdf-recipe-cover" />
            {imgs.length > 1 && (
              <div className="pdf-recipe-thumbs">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {imgs.slice(1, 4).map((src, i) => <img key={i} src={src} alt="" />)}
              </div>
            )}
          </div>
        )}
        <div className="pdf-recipe-macros">
          <div><b>{per.kcal}</b><span>kcal</span></div>
          <div><b>{per.p}g</b><span>{t("Protein", "بروتين")}</span></div>
          <div><b>{per.c}g</b><span>{t("Carbs", "كارب")}</span></div>
          <div><b>{per.f}g</b><span>{t("Fat", "دهون")}</span></div>
          <div className="pdf-recipe-macros-note">{t("per serving", "للحصة الواحدة")}</div>
        </div>
        <div className="pdf-recipe-h">{t("Ingredients", "المكونات")}</div>
        <table className="pdf-recipe-table">
          <thead><tr><th style={{ textAlign: "start" }}>{t("Ingredient", "المكوّن")}</th><th>{t("Per serving", "للحصة")}</th>{s > 1 && <th>{t(`Whole recipe (${s})`, `الوصفة كاملة (${s})`)}</th>}</tr></thead>
          <tbody>
            {recipe.ingredients.map((ing, i) => {
              const fd = foods.find(f => f.id === ing.foodId);
              if (!fd) return null;
              const unit = getUnitInfo(fd.state).label;
              return (
                <tr key={i}>
                  <td style={ar ? arFont : undefined}>{displayName(fd.name, printLang)}</td>
                  <td><bdi dir="ltr">{fmtAmt(ing.grams / s)} {unit}</bdi></td>
                  {s > 1 && <td><bdi dir="ltr">{fmtAmt(ing.grams)} {unit}</bdi></td>}
                </tr>
              );
            })}
          </tbody>
        </table>
        {steps.length > 0 && (
          <>
            <div className="pdf-recipe-h">{t("Instructions", "طريقة التحضير")}</div>
            <div className="pdf-recipe-steps">
              {steps.map((st, i) => (
                <div key={i} className="pdf-recipe-step">
                  <div className="pdf-recipe-step-num">{i + 1}</div>
                  <div className="pdf-recipe-step-text" dir="auto">{st}</div>
                </div>
              ))}
            </div>
          </>
        )}
        {recipe.notes.trim() && (
          <div className="pdf-recipe-notes" dir="auto">💡 {recipe.notes}</div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function MealPlanner() {
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState<"planner" | "calculator" | "clients" | "micros" | "recipes">("planner");
  const [microsClientId, setMicrosClientId] = useState<number | null>(null);
  const [lang, setLang] = useState<"ar" | "en" | "both">("both");
  const [printLang, setPrintLang] = useState<"ar" | "en" | "both">("en");
  const [showMealsInPdf, setShowMealsInPdf] = useState(false);
  const [copyLang, setCopyLang] = useState<"ar" | "en" | "both">("both");
  const [meals, setMeals] = useState<Meal[]>([{ id: "m1", name: "Meal 1 - وجبة 1", notes: "", items: [] }]);
  const [targetMacros, setTargetMacros] = useState<TargetMacros>({ calories: 2000, protein: 150, carbs: 200, fat: 65 });
  const [planNotes, setPlanNotes] = useState("");
  const [planClientName, setPlanClientName] = useState("");
  const [planGender, setPlanGender] = useState<"male" | "female">(() => {
    try {
      const s = localStorage.getItem("pro_planner_v2");
      if (s) {
        const d = JSON.parse(s);
        if (d.planGender === "male" || d.planGender === "female") return d.planGender;
      }
    } catch {}
    return "male";
  });
  const [planGoal, setPlanGoal] = useState("تنشيف");
  const [planDate, setPlanDate] = useState(new Date().toISOString().slice(0, 10));
  const [planWaterGoal, setPlanWaterGoal] = useState<number>(() => {
    try { const s = localStorage.getItem("pro_water_goal_v1"); return s ? parseFloat(s) : 2; } catch { return 2; }
  });
  const [waterLiters, setWaterLiters] = useState<number>(() => {
    try { const s = localStorage.getItem("pro_water_liters_v1"); return s ? parseFloat(s) : 0; } catch { return 0; }
  });
  const waterGlasses = Math.round(waterLiters / 0.25);
  const setWaterGlasses = (g: number | ((prev: number) => number)) => {
    setWaterLiters(prev => typeof g === "function" ? Number(((g(Math.round(prev / 0.25))) * 0.25).toFixed(2)) : Number((g * 0.25).toFixed(2)));
  };
  const [coachName, setCoachName] = useState("C/ Mohamed Saed");
  const [coachPhone, setCoachPhone] = useState("01022816320");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientView, setClientView] = useState<"list" | "detail" | "checkin" | "dietplan">("list");
  const [newClient, setNewClient] = useState<{
    name: string;
    goal: string;
    phone: string;
    coach: string;
    gender: "male" | "female";
  }>({
    name: "",
    goal: "cut",
    phone: "",
    coach: "",
    gender: "male",
  });
  const [newCheckIn, setNewCheckIn] = useState<{ date: string; measurements: BodyMeasurements; notes: string }>({ date: new Date().toISOString().slice(0, 10), measurements: { ...EMPTY_MEASUREMENTS }, notes: "" });
  const [newPlanLabel, setNewPlanLabel] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  // Custom foods & recipes
  const [customFoods, setCustomFoods] = useState<FoodEntry[]>(() => {
    try { const s = localStorage.getItem("custom_foods_v1"); return s ? JSON.parse(s) : []; } catch { return []; }
  });
  // Recipes (with photos) live in IndexedDB on this computer; loaded after mount.
  const [customRecipes, setCustomRecipes] = useState<CustomRecipe[]>([]);
  const [recipesLoaded, setRecipesLoaded] = useState(false);
  const [storageError, setStorageError] = useState("");
  const [showRecipeBuilder, setShowRecipeBuilder] = useState(false);
  const [focusRecipeId, setFocusRecipeId] = useState<number | null>(null);
  // Which recipes get a full page in the PDF: explicit tick overrides "is it used in the plan?"
  const [pdfRecipeOverride, setPdfRecipeOverride] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let loaded: CustomRecipe[] | null = null;
      try {
        const stored = await idbGet<CustomRecipe[]>("recipes_v2");
        if (Array.isArray(stored)) loaded = stored.filter(isRecipeLike);
      } catch {
        setStorageError("Your browser's local database isn't available (private window?). Recipes will work this session but won't be kept — use Export backup.");
      }
      if (loaded === null) {
        // one-time migration of recipes saved by the previous version (localStorage)
        try {
          const legacy = localStorage.getItem("custom_recipes_v1");
          const parsed: unknown = legacy ? JSON.parse(legacy) : [];
          loaded = Array.isArray(parsed) ? parsed.filter(isRecipeLike) : [];
        } catch { loaded = []; }
      }
      if (!cancelled) { setCustomRecipes(loaded); setRecipesLoaded(true); }
      try { await navigator.storage?.persist?.(); } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!recipesLoaded) return;
    idbSet("recipes_v2", customRecipes)
      .then(() => setStorageError(""))
      .catch(() => setStorageError("Couldn't save recipes to the browser database (storage full or blocked). Export a backup now so nothing is lost."));
  }, [customRecipes, recipesLoaded]);

  // Saved custom foods (small, plain JSON) stay in localStorage as before.
  const customFoodsReady = useRef(false);
  useEffect(() => {
    if (!customFoodsReady.current) { customFoodsReady.current = true; return; }
    try { localStorage.setItem("custom_foods_v1", JSON.stringify(customFoods)); } catch {}
  }, [customFoods]);

  const cloud = useCloudSync({
    ready: recipesLoaded && authenticated, recipes: customRecipes, clients, foods: customFoods,
    setRecipes: setCustomRecipes, setClients, setFoods: setCustomFoods,
  });

  /** Recipes behave like foods: searchable in any meal, macros/micros per serving. */
  const recipeFoods = useMemo(() => {
    const base = [...FOOD_DATABASE, ...customFoods];
    return customRecipes.map(r => recipeToFood(r, base));
  }, [customRecipes, customFoods]);

  /** Remove a saved custom food from the database (meals already built keep their copy). */
  function deleteCustomFood(f: FoodEntry) {
    const used = customRecipes.filter(r => r.ingredients.some(i => i.foodId === f.id)).length;
    const name = displayName(f.name, "en");
    const msg = used > 0
      ? `"${name}" is used in ${used} recipe(s). Removing it will leave a missing ingredient there. Remove anyway?`
      : `Remove "${name}" from your food database?\n\nMeals you already built keep it; it just won't appear in searches any more.`;
    if (window.confirm(msg)) setCustomFoods(prev => prev.filter(x => x.id !== f.id));
  }

  function saveCustomFood(food: Omit<FoodEntry, "id">): FoodEntry {
    const entry: FoodEntry = { ...food, id: Date.now() + Math.floor(Math.random() * 1000) };
    setCustomFoods(prev => [...prev, entry]);
    return entry;
  }
  // Micronutrient manual overrides: clientId → { key → value }
  const [microOverrides, setMicroOverrides] = useState<Record<number, Record<string, number>>>({});
  // Calculator state
  const [calcData, setCalcData] = useState<{ age: number; weight: number; height: number; gender: string; activity: string; goal: string; formula: "mifflin" | "katch"; bodyFat: number }>({
    age: 25, weight: 70, height: 170, gender: "male", activity: "1.55", goal: "maintain", formula: "mifflin", bodyFat: 20,
  });
  const [calcResult, setCalcResult] = useState<{ bmr: number; tdee: number; target: number; water?: number; formula?: "mifflin" | "katch"; lbm?: number } | null>(null);
  // Manual overrides for fiber / saturated fat targets (null = use the recommended value)
  const [manualTargets, setManualTargets] = useState<{ fiber: number | null; saturatedFat: number | null }>(() => {
    try {
      const s = localStorage.getItem("pro_manual_targets_v1");
      if (s) {
        const d = JSON.parse(s);
        return { fiber: typeof d.fiber === "number" ? d.fiber : null, saturatedFat: typeof d.saturatedFat === "number" ? d.saturatedFat : null };
      }
    } catch {}
    return { fiber: null, saturatedFat: null };
  });
  useEffect(() => {
    try { localStorage.setItem("pro_manual_targets_v1", JSON.stringify(manualTargets)); } catch {}
  }, [manualTargets]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    const saved = localStorage.getItem("pro_planner_v2");
    if (saved) {
      try {
        const d = JSON.parse(saved);
        setMeals(d.meals || []);
        setTargetMacros(d.targetMacros || {});
        setPlanNotes(d.planNotes || "");
        if (d.planClientName) setPlanClientName(d.planClientName);
        if (d.planGender === "male" || d.planGender === "female") setPlanGender(d.planGender);
        if (d.planGoal) setPlanGoal(d.planGoal);
        if (d.planDate) setPlanDate(d.planDate);
        if (d.coachName) setCoachName(d.coachName);
        if (d.coachPhone) setCoachPhone(d.coachPhone);
      } catch {}
    }
    const savedTpl = localStorage.getItem("pro_templates_v2");
    if (savedTpl) { try { setTemplates(JSON.parse(savedTpl)); } catch {} }
    const savedClients = localStorage.getItem("pro_clients_v2");
    if (savedClients) { try { setClients(JSON.parse(savedClients)); } catch {} }
    const savedDark = localStorage.getItem("pro_dark");
    if (savedDark === "1") { setDark(true); document.documentElement.classList.add("dark"); }
  }, []);

  useEffect(() => {
    localStorage.setItem("pro_planner_v2", JSON.stringify({
      meals, targetMacros, planNotes, planClientName, planGender, planGoal, planDate, coachName, coachPhone
    }));
  }, [meals, targetMacros, planNotes, planClientName, planGender, planGoal, planDate, coachName, coachPhone]);

  useEffect(() => {
    localStorage.setItem("pro_templates_v2", JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem("pro_clients_v2", JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    try { localStorage.setItem("pro_water_goal_v1", planWaterGoal.toString()); } catch {}
  }, [planWaterGoal]);

  useEffect(() => {
    try { localStorage.setItem("pro_water_liters_v1", waterLiters.toString()); } catch {}
  }, [waterLiters]);

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
    const tpl: Template = { id: Date.now(), name: templateName, meals: JSON.parse(JSON.stringify(meals)), targetMacros, createdAt: new Date().toISOString(), waterGoal: planWaterGoal };
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
    if (tpl.waterGoal) setPlanWaterGoal(tpl.waterGoal);
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
    txt += `💧 ${isAr ? "هدف الماء" : "Water Goal"}: ${planWaterGoal}L` + (waterLiters > 0 ? ` (${isAr ? "المستهلك" : "Logged"}: ${waterLiters}L)` : "") + `\n\n`;
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
    const { age, weight, height, gender, activity, goal, formula, bodyFat } = calcData;
    let bmr: number;
    let lbm: number | undefined;
    if (formula === "katch") {
      // Katch-McArdle: BMR = 370 + 21.6 × lean body mass (kg)
      const bf = Math.min(60, Math.max(3, bodyFat || 0));
      lbm = weight * (1 - bf / 100);
      bmr = 370 + 21.6 * lbm;
    } else {
      // Mifflin-St Jeor
      bmr = gender === "male"
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    }
    const tdee = bmr * parseFloat(activity);
    const target = goal === "cut" ? tdee - 500 : goal === "gain" ? tdee + 300 : tdee;
    const act = parseFloat(activity) || 1.2;
    const water = Number((weight * 0.035 + (act >= 1.725 ? 0.75 : act >= 1.55 ? 0.5 : 0.2)).toFixed(1));
    setCalcResult({ bmr: Math.round(bmr), tdee: Math.round(tdee), target: Math.round(target), water, formula, lbm: lbm !== undefined ? Number(lbm.toFixed(1)) : undefined });
  }

  function applyCalcToMacros() {
    if (!calcResult) return;
    const cal = calcResult.target;
    setTargetMacros({ calories: cal, protein: Math.round(calcData.weight * 2), carbs: Math.round((cal * 0.4) / 4), fat: Math.round((cal * 0.25) / 9) });
    if (calcResult.water) setPlanWaterGoal(calcResult.water);
    if (calcData.gender === "male" || calcData.gender === "female") {
      setPlanGender(calcData.gender);
    }
  }

  const totals = grandTotals(meals);
  const selectedClient = clients.find(c => c.id === selectedClientId) || null;

  const allFoodsForTracking = [...FOOD_DATABASE, ...customFoods, ...recipeFoods];
  const planTracking = meals.reduce((acc, meal) => {
    meal.items.forEach(item => {
      const fd = allFoodsForTracking.find(f => f.id === item.id);
      const micros = fd?.micros ?? item.micros;   // unsaved custom foods carry their own micros
      if (!micros) return;
      const mult = isPerPiece(fd?.state ?? item.state) ? item.grams : item.grams / 100;
      acc.fiber += (micros.fiber || 0) * mult;
      acc.saturatedFat += (micros.saturatedFat || 0) * mult;
      acc.omega3 += (micros.omega3 || 0) * mult;
      acc.omega6 += (micros.omega6 || 0) * mult;
    });
    return acc;
  }, { fiber: 0, saturatedFat: 0, omega3: 0, omega6: 0 });

  // Recipes: which ones are used in the plan / printed in the PDF
  const usedRecipeIds = new Set<number>();
  meals.forEach(m => {
    if (m.recipeId !== undefined) usedRecipeIds.add(m.recipeId);
    m.items.forEach(i => { if (i.recipeId !== undefined) usedRecipeIds.add(i.recipeId); });
  });
  const recipeInPdf = (id: number) => pdfRecipeOverride[id] ?? usedRecipeIds.has(id);
  const pdfRecipes = customRecipes.filter(r => recipeInPdf(r.id));
  const pdfRecipeIdSet = new Set(pdfRecipes.map(r => r.id));

  /** Original "add recipe as a meal" flow — still available. The meal remembers its recipe so the PDF can link it. */
  function addRecipeAsMeal(r: CustomRecipe) {
    const foods = [...FOOD_DATABASE, ...customFoods];
    const sv = Math.max(1, r.serves || 1);
    const items: FoodItem[] = r.ingredients.flatMap(ing => {
      const fd = foods.find(f => f.id === ing.foodId);
      if (!fd) return [];
      return [{ ...fd, grams: round1(ing.grams / sv), instId: `ri-${Date.now()}-${Math.random()}` }];
    });
    const hasSteps = (r.steps || []).some(x => x.trim());
    setMeals(prev => [...prev, { id: `m${Date.now()}`, name: r.name, items, notes: hasSteps ? "" : r.notes, recipeId: r.id }]);
  }
  function openRecipeFromPlanner(id: number) { setFocusRecipeId(id); setTab("recipes"); }

  // Client helpers
  function addClient() {
    if (!newClient.name.trim()) return;
    const c: Client = {
      id: Date.now(),
      name: newClient.name,
      goal: newClient.goal,
      phone: newClient.phone,
      coach: newClient.coach,
      gender: newClient.gender,
      createdAt: new Date().toISOString(),
      checkIns: [],
      dietPlans: [],
      age: 30,
      isTraining: true,
      isPregnant: false,
      pregnancyMonth: 0,
      isLactating: false,
      diseases: "",
      allergies: "",
      foodDislikes: "",
    };
    setClients(prev => [...prev, c]);
    setNewClient({ name: "", goal: "cut", phone: "", coach: "", gender: "male" });
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
    const snap: DietPlanSnapshot = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      label: newPlanLabel,
      meals: JSON.parse(JSON.stringify(meals)),
      targetMacros,
      notes: planNotes,
      waterGoal: planWaterGoal,
      gender: planGender,
    };
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
    setMeals(newMeals);
    setTargetMacros(snap.targetMacros);
    setPlanNotes(snap.notes);
    if (snap.waterGoal) setPlanWaterGoal(snap.waterGoal);
    if (snap.gender) {
      setPlanGender(snap.gender);
    } else if (selectedClient?.gender) {
      setPlanGender(selectedClient.gender);
    }
    if (selectedClient?.name) {
      setPlanClientName(selectedClient.name);
    }
    setTab("planner");
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl w-80 space-y-4">
          <h1 className="text-2xl font-bold text-center">🥗 MSR Nutrition</h1>
          <p className="text-center text-gray-500 text-sm">Pro Nutrition Planner</p>
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { if (password === "admin123") { setAuthenticated(true); cloud.resume(); } else setAuthError("Wrong password"); } }}
            className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm outline-none" />
          {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}
          <button onClick={() => { if (password === "admin123") { setAuthenticated(true); cloud.resume(); } else setAuthError("Wrong password"); }}
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
          html, body { height: auto !important; min-height: 0 !important; }
          .min-h-screen { min-height: 0 !important; background: #ffffff !important; }
          .pdf-main { max-width: none !important; margin: 0 !important; padding: 0 !important; }
          .pdf-main > *, .pdf-planner > * { margin-top: 0 !important; margin-bottom: 0 !important; }
          .pdf-break { break-before: page !important; page-break-before: always !important; }

          /* ── COVER PAGE ─────────────────────────────────────────── */
          .pdf-cover {
            display: flex !important; flex-direction: column !important;
            box-sizing: border-box !important; width: 100% !important;
            height: 296mm !important; min-height: 0 !important; max-height: 296mm !important;
            background: #0b1f38 !important;
            color: white !important; padding: 40px 50px !important;
            position: relative !important;
            overflow: hidden !important;
            break-inside: avoid !important; page-break-inside: avoid !important;
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
          .pdf-summary { padding: 0 40px 40px !important; }
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

          /* ── RECIPE PAGES + LINKS ───────────────────────────────── */
          a.pdf-recipe-link { color: #0d7a5f !important; text-decoration: underline !important; text-decoration-thickness: 1px !important; text-underline-offset: 2px !important; }
          .pdf-recipe-hint { font-size: 9px !important; color: #0d7a5f !important; margin-top: 2px !important; }
          .pdf-recipe-back { display: inline-block !important; font-size: 11px !important; color: #0d7a5f !important; text-decoration: none !important; margin-bottom: 14px !important; font-weight: 600 !important; }
          .pdf-recipe-body { padding: 0 40px 30px !important; }
          .pdf-recipe-title { font-size: 28px !important; font-weight: 900 !important; color: #0b1f38 !important; line-height: 1.15 !important; margin-bottom: 10px !important; }
          .pdf-recipe-meta { display: flex !important; flex-wrap: wrap !important; gap: 6px 16px !important; font-size: 11px !important; color: #4b5563 !important; margin-bottom: 16px !important; }
          .pdf-recipe-photos { margin-bottom: 16px !important; }
          .pdf-recipe-cover { width: 100% !important; max-height: 78mm !important; object-fit: cover !important; border-radius: 8px !important; display: block !important; }
          .pdf-recipe-thumbs { display: flex !important; gap: 8px !important; margin-top: 8px !important; }
          .pdf-recipe-thumbs img { flex: 1 1 0 !important; min-width: 0 !important; height: 26mm !important; object-fit: cover !important; border-radius: 6px !important; }
          .pdf-recipe-macros { display: flex !important; align-items: stretch !important; gap: 0 !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; margin-bottom: 18px !important; overflow: hidden !important; }
          .pdf-recipe-macros > div { flex: 1 !important; text-align: center !important; padding: 8px 4px !important; border-right: 1px solid #e5e7eb !important; display: flex !important; flex-direction: column !important; }
          .pdf-recipe-macros b { font-size: 16px !important; color: #0b1f38 !important; font-weight: 900 !important; }
          .pdf-recipe-macros span { font-size: 9px !important; text-transform: uppercase !important; letter-spacing: 1px !important; color: #6b7280 !important; }
          .pdf-recipe-macros .pdf-recipe-macros-note { background: #f0fdf9 !important; justify-content: center !important; font-size: 9px !important; color: #0d7a5f !important; text-transform: uppercase !important; letter-spacing: 1px !important; border-right: none !important; }
          .pdf-recipe-h { font-size: 10px !important; letter-spacing: 3px !important; text-transform: uppercase !important; color: #0d7a5f !important; font-weight: 800 !important; margin: 4px 0 8px !important; }
          .pdf-recipe-table { width: 100% !important; border-collapse: collapse !important; margin-bottom: 18px !important; font-size: 12px !important; }
          .pdf-recipe-table th { font-size: 9px !important; text-transform: uppercase !important; letter-spacing: 1px !important; color: #6b7280 !important; text-align: end !important; padding: 4px 6px !important; border-bottom: 2px solid #0b1f38 !important; }
          .pdf-recipe-table td { padding: 6px !important; border-bottom: 1px dashed #e5e7eb !important; text-align: end !important; font-weight: 600 !important; color: #374151 !important; }
          .pdf-recipe-table td:first-child, .pdf-recipe-table th:first-child { text-align: start !important; font-weight: 500 !important; }
          .pdf-recipe-table tr { break-inside: avoid !important; }
          .pdf-recipe-steps { margin-bottom: 14px !important; }
          .pdf-recipe-step { display: flex !important; gap: 12px !important; padding: 8px 0 !important; break-inside: avoid !important; page-break-inside: avoid !important; }
          .pdf-recipe-step-num { width: 24px !important; height: 24px !important; border-radius: 50% !important; background: #0d7a5f !important; color: white !important; font-size: 12px !important; font-weight: 900 !important; display: flex !important; align-items: center !important; justify-content: center !important; flex-shrink: 0 !important; }
          .pdf-recipe-step-text { font-size: 13px !important; line-height: 1.6 !important; color: #374151 !important; white-space: pre-wrap !important; flex: 1 !important; padding-top: 2px !important; }
          .pdf-recipe-notes { background: #fefce8 !important; border-left: 3px solid #eab308 !important; padding: 10px 14px !important; font-size: 12px !important; color: #92400e !important; border-radius: 0 6px 6px 0 !important; white-space: pre-wrap !important; break-inside: avoid !important; }

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
          {([["planner", <UtensilsCrossed size={16} />, "Planner"], ["calculator", <Calculator size={16} />, "Calc"], ["clients", <Users size={16} />, "Clients"], ["micros", <BarChart2 size={16} />, "Micros"], ["recipes", <BookOpen size={16} />, "Recipes"]] as const).map(([t, icon, label]) => (
            <button key={t} onClick={() => setTab(t as typeof tab)}
              className={cn("flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", tab === t ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700")}>
              {icon}{label}
            </button>
          ))}
          <CloudChip cloud={cloud} onOpen={() => setTab("recipes")} />
          <button onClick={toggleDark} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700">
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {cloud.conflictOpen && cloud.conflicts.length > 0 && (
        <CloudConflictDialog key={cloud.conflicts.map(c => c.key).join("|")} conflicts={cloud.conflicts} onApply={cloud.resolveConflicts} onClose={() => cloud.setConflictOpen(false)} />
      )}
      <main className="pdf-main max-w-4xl mx-auto p-4 space-y-4">
        {/* ── PLANNER TAB ── */}
        {tab === "planner" && (
          <div className="pdf-planner space-y-4">
            {/* ── PDF COVER PAGE (print only) ─────────────────────────────── */}
            {(() => {
              const gt = grandTotals(meals);
              const dateFormatted = new Date(planDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }).toUpperCase();
              const calPct = gt.calories > 0 ? { p: Math.round(gt.protein*4/gt.calories*100), c: Math.round(gt.carbs*4/gt.calories*100), f: Math.round(gt.fat*9/gt.calories*100) } : { p:0,c:0,f:0 };
              // PDF label translation helper
              const pdfAr = printLang === "ar";
              const pdfBoth = printLang === "both";
              function pdfT(en: string, ar: string) {
                if (pdfAr) return ar;
                if (pdfBoth) return `${en} · ${ar}`;
                return en;
              }
              function pdfLabel(en: string, ar: string) {
                if (pdfAr) return <span style={{fontFamily:"'Noto Sans Arabic',sans-serif"}}>{ar}</span>;
                if (pdfBoth) return <>{en} · <span style={{fontFamily:"'Noto Sans Arabic',sans-serif"}}>{ar}</span></>;
                return <>{en}</>;
              }
              return (
                <>
                  {/* COVER */}
                  <div className="pdf-cover hidden print:flex">
                    <div className="pdf-cover-accent" />
                    <div className="flex justify-between items-start">
                      <div className="pdf-cover-logo"><span className="pdf-logo-msr">MSR</span></div>
                      <div className="pdf-cover-issued"><div>{pdfT("ISSUED","صادر")}</div><div>{dateFormatted}</div></div>
                    </div>
                    <div className="pdf-cover-spacer" />
                    <div>
                      <div className="pdf-cover-brand">MSR Coach Mohamed Saed</div>
                      <div className="pdf-cover-title">{pdfAr ? <span style={{fontFamily:"'Noto Sans Arabic',sans-serif"}}>خطة<br/>التغذية</span> : <>Nutrition<br/>Plan</>}</div>
                      {planClientName && <><div className="pdf-cover-prepared">{pdfT("Prepared for","أُعدَّت لـ")}</div><div className="pdf-cover-client">{planClientName}</div></>}
                      <div className="pdf-cover-stats">
                        <div className="pdf-cover-stat"><div className="pdf-cover-stat-val">{gt.calories.toFixed(0)}</div><div className="pdf-cover-stat-lbl">KCAL</div></div>
                        <div className="pdf-cover-stat"><div className="pdf-cover-stat-val">{gt.protein.toFixed(0)}g</div><div className="pdf-cover-stat-lbl">{pdfT("PROTEIN","بروتين")}</div></div>
                        <div className="pdf-cover-stat"><div className="pdf-cover-stat-val">{meals.length}</div><div className="pdf-cover-stat-lbl">{pdfT("MEALS","وجبات")}</div></div>
                        {planGoal && <div className="pdf-cover-stat"><div className="pdf-cover-stat-val" style={{fontSize:"18px"}}>{planGoal}</div><div className="pdf-cover-stat-lbl">{pdfT("GOAL","الهدف")}</div></div>}
                      </div>
                      <div className="pdf-cover-powered">MSR Nutrition Planner · {coachPhone}</div>
                    </div>
                  </div>

                  {/* SUMMARY PAGE */}
                  <div className="pdf-break hidden print:block">
                    <div className="pdf-page-header">
                      <div className="pdf-page-header-logo">
                        <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
                        <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
                      </div>
                      <div className="pdf-page-header-right">{pdfT("Nutrition Plan","خطة التغذية")} &nbsp;·&nbsp; <span>{planClientName}</span></div>
                    </div>
                    <div className="pdf-summary">
                      <div className="pdf-section-label">{pdfLabel("Daily Targets","الأهداف اليومية")}</div>
                      <div className="pdf-section-title">{pdfLabel("Nutrition Plan","خطة التغذية")}</div>
                      <div className="pdf-subtitle-text">{pdfLabel("Your meals are built around your goal and your lifestyle. Follow the portions as closely as you can, and message your coach whenever something doesn't fit your day.","وجباتك مبنية على هدفك وأسلوب حياتك. اتبع الكميات قدر الإمكان، وتواصل مع كوتشك عند أي صعوبة.")}</div>
                      <div style={{display:"flex", gap:"40px", alignItems:"flex-start"}}>
                        <div style={{flex:"0 0 auto"}}>
                          <MacroPieChart carbs={gt.carbs} protein={gt.protein} fat={gt.fat} />
                          <div style={{textAlign:"center", marginTop:"4px", fontWeight:"900", fontSize:"20px"}}>{gt.calories.toFixed(0)}</div>
                          <div style={{textAlign:"center", fontSize:"10px", letterSpacing:"2px", color:"#9ca3af"}}>KCAL</div>
                        </div>
                        <div style={{flex:1}}>
                          <div className="pdf-macro-row"><div className="pdf-macro-dot" style={{background:"#3b82f6"}} /><div className="pdf-macro-label">{pdfLabel("Protein","بروتين")}</div><div className="pdf-macro-val">{gt.protein.toFixed(0)} g</div><div className="pdf-macro-pct">{calPct.p}%</div></div>
                          <div className="pdf-macro-row"><div className="pdf-macro-dot" style={{background:"#0d7a5f"}} /><div className="pdf-macro-label">{pdfLabel("Carbs","كربوهيدرات")}</div><div className="pdf-macro-val">{gt.carbs.toFixed(0)} g</div><div className="pdf-macro-pct">{calPct.c}%</div></div>
                          <div className="pdf-macro-row"><div className="pdf-macro-dot" style={{background:"#6b7280"}} /><div className="pdf-macro-label">{pdfLabel("Fat","دهون")}</div><div className="pdf-macro-val">{gt.fat.toFixed(0)} g</div><div className="pdf-macro-pct">{calPct.f}%</div></div>
                          <div style={{fontSize:"10px", color:"#9ca3af", marginTop:"10px"}}>{pdfLabel(`Daily total · ${planWaterGoal}L water daily`,`الإجمالي اليومي · ${planWaterGoal}ل ماء يومياً`)}</div>
                        </div>
                      </div>
                      {planNotes && (
                        <div className="pdf-coach-box">
                          <div className="pdf-coach-box-label">{pdfLabel("From Your Coach","من كوتشك")}</div>
                          <div className="pdf-coach-box-text">{planNotes}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* MEALS PAGES */}
                  {showMealsInPdf && <div id="pdf-meals" className="hidden print:block" style={{pageBreakBefore:"always"}}>
                    <div className="pdf-page-header">
                      <div className="pdf-page-header-logo">
                        <div className="pdf-page-header-logo-icon"><span className="pdf-logo-msr-sm">MSR</span></div>
                        <div className="pdf-page-header-name">MSR Coach Mohamed Saed</div>
                      </div>
                      <div className="pdf-page-header-right">{pdfT("Nutrition Plan","خطة التغذية")} &nbsp;·&nbsp; <span>{planClientName}</span></div>
                    </div>
                    <div className="pdf-meals-header">
                      <div className="pdf-meals-header-left"><div className="lbl">{pdfT("Meals","الوجبات")}</div><div className="ttl">{pdfT("Nutrition Plan","خطة التغذية")}</div></div>
                      <div className="pdf-meals-header-stats">
                        <div className="pdf-meals-header-stat"><div className="val">{gt.calories.toFixed(0)}</div><div className="lbl">KCAL</div></div>
                        <div className="pdf-meals-header-stat"><div className="val">{gt.protein.toFixed(0)}g</div><div className="lbl">{pdfT("PROTEIN","بروتين")}</div></div>
                        <div className="pdf-meals-header-stat"><div className="val">{gt.carbs.toFixed(0)}g</div><div className="lbl">{pdfT("CARBS","كارب")}</div></div>
                        <div className="pdf-meals-header-stat"><div className="val">{gt.fat.toFixed(0)}g</div><div className="lbl">{pdfT("FAT","دهون")}</div></div>
                      </div>
                    </div>
                    {meals.map((meal, mi) => {
                      const mt = mealTotals(meal);
                      return (
                        <div key={meal.id} className="pdf-meal-block">
                          <div className="pdf-meal-title-row">
                            <div className="pdf-meal-num">{mi + 1}</div>
                            <div className="pdf-meal-name">{meal.recipeId !== undefined && pdfRecipeIdSet.has(meal.recipeId)
                              ? <a className="pdf-recipe-link" href={`#recipe-${meal.recipeId}`}>{displayName(meal.name, printLang)}</a>
                              : displayName(meal.name, printLang)}</div>
                            <div className="pdf-meal-kcal">{mt.calories.toFixed(0)} kcal</div>
                          </div>
                          {meal.items.map(item => {
                            const nameParts = item.name.split(" - ");
                            const enName = nameParts[0];
                            const arName = nameParts[1] || "";
                            const { label: unitLbl } = getUnitInfo(item.state);
                            const amt = isPerPiece(item.state) ? `${item.grams} ${unitLbl}` : `${item.grams} ${unitLbl}`;
                            const showEn = printLang === "en" || printLang === "both";
                            const showAr = printLang === "ar" || printLang === "both";
                            const linkTo = item.recipeId !== undefined && pdfRecipeIdSet.has(item.recipeId) ? `#recipe-${item.recipeId}` : null;
                            const wrap = (node: React.ReactNode) => linkTo ? <a className="pdf-recipe-link" href={linkTo}>{node}</a> : node;
                            return (
                              <div key={item.instId} className="pdf-food-item">
                                <div>
                                  {showEn && <div className="pdf-food-en">{wrap(enName)}</div>}
                                  {showAr && arName && <div className={showEn ? "pdf-food-ar" : "pdf-food-en"} style={showEn ? {} : {fontFamily:"'Noto Sans Arabic',sans-serif", direction:"rtl"}}>{showEn ? arName : wrap(arName)}</div>}
                                  {linkTo && <div className="pdf-recipe-hint">📖 {pdfT("Recipe & instructions — tap the name", "الوصفة وطريقة التحضير — اضغط على الاسم")}</div>}
                                </div>
                                <div className="pdf-food-amt">{amt}</div>
                              </div>
                            );
                          })}
                          {meal.notes && <div className="pdf-meal-notes">📝 {meal.notes}</div>}
                          <div className="pdf-meal-macros">
                            <div className="pdf-meal-macro-pill"><div className="pdf-meal-macro-dot" style={{background:"#3b82f6"}} /><span>{pdfT("Protein","بروتين")} {mt.protein.toFixed(0)}g</span></div>
                            <div className="pdf-meal-macro-pill"><div className="pdf-meal-macro-dot" style={{background:"#0d7a5f"}} /><span>{pdfT("Carbs","كارب")} {mt.carbs.toFixed(0)}g</span></div>
                            <div className="pdf-meal-macro-pill"><div className="pdf-meal-macro-dot" style={{background:"#6b7280"}} /><span>{pdfT("Fat","دهون")} {mt.fat.toFixed(0)}g</span></div>
                          </div>
                        </div>
                      );
                    })}
                    <div style={{padding:"0 40px", fontSize:"9px", color:"#9ca3af", borderTop:"1px solid #f3f4f6", paddingTop:"12px", marginTop:"20px"}}>
                      MSR Coach Mohamed Saed · {coachPhone} · {pdfT(`Prepared exclusively for ${planClientName}`,`أُعدَّت خصيصاً لـ ${planClientName}`)}
                    </div>
                  </div>}

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
                      <div className="pdf-page-header-right">{pdfT("Nutrition Plan","خطة التغذية")} &nbsp;·&nbsp; <span>{planClientName}</span></div>
                    </div>
                    <div style={{marginTop:"32px", marginBottom:"24px"}}>
                      <div style={{fontSize:"22px", fontWeight:900, color:"#0b1f38", letterSpacing:"-0.5px"}}>{pdfLabel("Plan Guidelines","إرشادات الخطة")}</div>
                      <div style={{fontSize:"12px", color:"#6b7280", marginTop:"4px"}}>{pdfLabel("Follow these instructions for the best results.","اتبع هذه التعليمات للحصول على أفضل النتائج.")}</div>
                    </div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">01</div><div className="pdf-guideline-text">{pdfLabel("Weigh foods raw unless the plan says cooked.","زن الأكل نيئاً إلا إذا نص الخطة على الطهي.")}</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">02</div><div className="pdf-guideline-text">{pdfLabel(`Drink at least ${planWaterGoal}L of water daily.`,`اشرب على الأقل ${planWaterGoal} لتر ماء يومياً.`)}</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">03</div><div className="pdf-guideline-text">{pdfLabel("Swap within the same meal option only, never across meals.","استبدل داخل نفس الوجبة فقط، لا تنقل بين الوجبات.")}</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">04</div><div className="pdf-guideline-text">{pdfLabel("Season freely with herbs and spices; count sauces and oils.","تبّل بالأعشاب والتوابل بحرية، واحسب الصلصات والزيوت.")}</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">05</div><div className="pdf-guideline-text">{pdfLabel("Weigh yourself every morning on an empty stomach, after using the bathroom, wearing minimum light clothing.","زن نفسك كل صباح على معدة فارغة بعد الحمام وبأقل ملابس ممكنة.")}</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">06</div><div className="pdf-guideline-text">{pdfLabel("Take photos of your meals when in doubt about portions.","صوّر وجباتك عند الشك في الكميات.")}</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">07</div><div className="pdf-guideline-text">{pdfLabel("Contact your coach if you feel unwell or cannot follow the plan.","تواصل مع كوتشك إذا شعرت بعدم ارتياح أو تعذّر عليك الالتزام.")}</div></div>
                    <div className="pdf-guideline-row"><div className="pdf-guideline-num">08</div><div className="pdf-guideline-text">{pdfLabel("Consistency beats perfection — never skip more than one meal.","الاستمرارية أهم من الكمال — لا تفوّت أكثر من وجبة واحدة.")}</div></div>
                  </div>

                  {/* SHOPPING LIST PAGE */}
                  {(() => {
                    const allFoodsDB = [...FOOD_DATABASE, ...customFoods];
                    const shoppingMap: Record<string, { name: string; category: string; grams: number; unit: string }> = {};
                    const addShop = (food: FoodEntry | undefined, fallbackName: string, id: number, amount: number) => {
                      const name = food?.name ?? fallbackName;
                      const key = id + "_" + name;
                      const unit = food && isPerPiece(food.state) ? getUnitInfo(food.state).label : "g";
                      if (!shoppingMap[key]) shoppingMap[key] = { name, category: food?.category || "Other", grams: 0, unit };
                      shoppingMap[key].grams += amount;
                    };
                    meals.forEach(meal => {
                      meal.items.forEach(item => {
                        const rec = item.recipeId !== undefined ? customRecipes.find(r => r.id === item.recipeId) : undefined;
                        if (rec) {
                          // a recipe item is N servings → shop for its ingredients
                          const sv = Math.max(1, rec.serves || 1);
                          rec.ingredients.forEach(ing => {
                            const f = allFoodsDB.find(x => x.id === ing.foodId);
                            if (f) addShop(f, f.name, f.id, (ing.grams * item.grams) / sv);
                          });
                        } else {
                          addShop(allFoodsDB.find(f => f.id === item.id), item.name, item.id, item.grams);
                        }
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
                          <div className="pdf-page-header-right">{pdfT("Nutrition Plan","خطة التغذية")} &nbsp;·&nbsp; <span>{planClientName}</span></div>
                        </div>
                        <div style={{marginTop:"32px", marginBottom:"8px"}}>
                          <div style={{fontSize:"22px", fontWeight:900, color:"#0b1f38", letterSpacing:"-0.5px"}}>{pdfLabel("Shopping List","قائمة التسوق")}</div>
                          <div style={{fontSize:"12px", color:"#6b7280", marginTop:"4px"}}>{pdfLabel("Estimated for 7 days.","تقدير لمدة ٧ أيام.")}</div>
                        </div>
                        <div className="pdf-shopping-grid">
                          {cats.map(cat => (
                            <div key={cat} className="pdf-shopping-cat">
                              <div className="pdf-shopping-cat-title">{cat}</div>
                              {byCategory[cat].map((it, idx) => {
                                const nameParts = it.name.split(" - ");
                                const enName = nameParts[0];
                                const arName = nameParts[1] || "";
                                const shName = pdfAr ? (arName || enName) : pdfBoth && arName ? `${enName} - ${arName}` : enName;
                                const weekly = Math.round(it.grams * 7);
                                return (
                                  <div key={idx} className="pdf-shopping-item">
                                    <div className="pdf-shopping-check" />
                                    <div className="pdf-shopping-name" style={pdfAr ? {fontFamily:"'Noto Sans Arabic',sans-serif", direction:"rtl"} : {}}>{shName}</div>
                                    <div className="pdf-shopping-qty">{weekly}{it.unit === "g" ? "g" : ` ${it.unit}`}</div>
                                  </div>
                                );
                              })}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* RECIPE PAGES — one full page per selected recipe; the meal list links here */}
                  {pdfRecipes.map(r => (
                    <RecipePdfPage key={r.id} recipe={r} foods={[...FOOD_DATABASE, ...customFoods]}
                      printLang={printLang} clientName={planClientName} showBackLink={showMealsInPdf} />
                  ))}
                </>
              );
            })()}

            {/* plan info */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-3 print:hidden">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-sm text-gray-500 uppercase">معلومات الخطة - Plan Info</h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
                  {planGender === "female" ? "👩 Female / أنثى (25g fiber)" : "👨 Male / ذكر (38g fiber)"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex justify-between items-center mb-0.5">
                    <label className="text-xs text-gray-500 font-medium">اسم العميل - Client</label>
                    {clients.length > 0 && (
                      <select
                        onChange={e => {
                          const cl = clients.find(c => c.id === +e.target.value);
                          if (cl) {
                            setPlanClientName(cl.name);
                            if (cl.goal) setPlanGoal(cl.goal === "cut" ? "تنشيف" : cl.goal === "gain" ? "تضخيم" : "محافظة");
                            if (cl.gender) setPlanGender(cl.gender);
                          }
                        }}
                        className="text-[10px] text-blue-600 dark:text-blue-400 bg-transparent border-none outline-none cursor-pointer"
                        defaultValue=""
                      >
                        <option value="" disabled>اختر عميل مسجل...</option>
                        {clients.map(c => (
                          <option key={c.id} value={c.id}>{c.name} ({c.gender === "female" ? "أنثى" : "ذكر"})</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <input
                    value={planClientName}
                    onChange={e => {
                      const val = e.target.value;
                      setPlanClientName(val);
                      const found = clients.find(c => c.name.trim().toLowerCase() === val.trim().toLowerCase());
                      if (found && found.gender) setPlanGender(found.gender);
                    }}
                    placeholder="سارة عماد..."
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 font-medium">جنس العميل - Gender</label>
                  <select
                    value={planGender}
                    onChange={e => {
                      const g = e.target.value as "male" | "female";
                      setPlanGender(g);
                      const matched = clients.find(c => c.name.trim().toLowerCase() === planClientName.trim().toLowerCase());
                      if (matched) {
                        setClients(prev => prev.map(c => c.id === matched.id ? { ...c, gender: g } : c));
                      }
                    }}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1 font-medium"
                  >
                    <option value="male">👨 Male - ذكر (Man · 38g fiber)</option>
                    <option value="female">👩 Female - أنثى (Woman · 25g fiber)</option>
                  </select>
                </div>
                <div><label className="text-xs text-gray-500">الهدف - Goal</label><input value={planGoal} onChange={e => setPlanGoal(e.target.value)} placeholder="تنشيف..." className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">التاريخ - Date</label><input type="date" value={planDate} onChange={e => setPlanDate(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">هدف الماء (لتر)</label><input type="number" step="0.5" min="0" value={planWaterGoal} onChange={e => setPlanWaterGoal(+e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div><label className="text-xs text-gray-500">اسم الكوتش</label><input value={coachName} onChange={e => setCoachName(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
                <div className="col-span-2 sm:col-span-1"><label className="text-xs text-gray-500">رقم التواصل</label><input value={coachPhone} onChange={e => setCoachPhone(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-800 mt-1" /></div>
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
                {(() => {
                  const matchedClient = clients.find(c => c.name.trim().toLowerCase() === planClientName.trim().toLowerCase()) || null;
                  const currentGender = planGender || matchedClient?.gender || "male";
                  const planRDI = getRDI(
                    matchedClient || { gender: currentGender, age: 30, isTraining: true, isPregnant: false, pregnancyMonth: 0, isLactating: false },
                    targetMacros.calories
                  );
                  // Recommended values stay the default; a manual value (if typed) overrides them.
                  const defaultFiber = planRDI.fiber;
                  const defaultSatFat = planRDI.saturatedFat;
                  const fiberTarget = manualTargets.fiber ?? defaultFiber;
                  const satFatLimit = manualTargets.saturatedFat ?? defaultSatFat;
                  const isFiberMet = planTracking.fiber >= fiberTarget;
                  const satPct = satFatLimit > 0 ? (planTracking.saturatedFat / satFatLimit) * 100 : 0;
                  const isOver = planTracking.saturatedFat > satFatLimit;
                  return (
                    <>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-0.5 gap-2">
                          <span className="flex items-center gap-1 font-medium flex-wrap">
                            <span>🌾 Fiber - الألياف</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {manualTargets.fiber !== null ? `Custom · recommended ${defaultFiber}g` : `Recommended: ${defaultFiber}g`}
                            </span>
                          </span>
                          <span className={cn("flex items-center gap-1", isFiberMet ? "font-bold text-green-600 dark:text-green-400" : "font-medium")} dir="ltr">
                            {planTracking.fiber.toFixed(1)}g /
                            <TargetEditor value={manualTargets.fiber} defaultValue={defaultFiber} unit="g"
                              onChange={v => setManualTargets(p => ({ ...p, fiber: v }))} />
                          </span>
                        </div>
                        <ProgressBar
                          value={planTracking.fiber}
                          max={fiberTarget}
                          color={isFiberMet ? "bg-green-600" : planTracking.fiber >= fiberTarget * 0.5 ? "bg-green-500" : "bg-emerald-400"}
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center text-xs mb-0.5 gap-2">
                          <span className="flex items-center gap-1 font-medium flex-wrap">
                            <span>🧈 Saturated Fat - دهون مشبعة</span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {manualTargets.saturatedFat !== null ? `Custom · recommended ${defaultSatFat}g` : `Recommended cap: ${defaultSatFat}g (20g/2000 kcal)`}
                            </span>
                          </span>
                          <span className={cn("flex items-center gap-1", isOver ? "font-bold text-red-500" : "font-medium")} dir="ltr">
                            {planTracking.saturatedFat.toFixed(1)}g /
                            <TargetEditor value={manualTargets.saturatedFat} defaultValue={defaultSatFat} unit="g"
                              onChange={v => setManualTargets(p => ({ ...p, saturatedFat: v }))} />
                          </span>
                        </div>
                        <ProgressBar
                          value={planTracking.saturatedFat}
                          max={satFatLimit}
                          color={isOver ? "bg-red-500" : satPct > 80 ? "bg-orange-400" : "bg-amber-400"}
                        />
                        {isOver && (
                          <div className="text-xs text-red-500 mt-0.5 font-medium flex items-center gap-1">
                            ⚠️ Exceeded saturated fat limit ({satFatLimit.toFixed(1)}g max) — تجاوز الحد المسموح للدهون المشبعة
                          </div>
                        )}
                      </div>
                      <OmegaBalance
                        omega3={planTracking.omega3} omega6={planTracking.omega6}
                        target3={planRDI.omega3} target6={planRDI.omega6}
                      />
                    </>
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
                          extraFoods={[...customFoods, ...recipeFoods]}
                          onSaveCustomFood={saveCustomFood}
                          onDeleteCustomFood={deleteCustomFood}
                          onOpenRecipe={openRecipeFromPlanner}
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

            {/* ── RECIPES QUICK PANEL ──────────────────────────────────────── */}
            {showRecipeBuilder && (
              <RecipeQuickAdd
                recipes={customRecipes}
                foods={[...FOOD_DATABASE, ...customFoods]}
                onAddAsMeal={addRecipeAsMeal}
                onOpen={openRecipeFromPlanner}
                onManage={() => setTab("recipes")}
                onClose={() => setShowRecipeBuilder(false)}
              />
            )}

            {/* plan notes (screen only — the PDF shows these in the "From Your Coach" box) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm print:hidden">
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
                <div className="flex items-center gap-2 mt-1">
                  <input type="checkbox" id="showMealsInPdf" checked={showMealsInPdf} onChange={e => setShowMealsInPdf(e.target.checked)} className="rounded" />
                  <label htmlFor="showMealsInPdf" className="text-xs text-gray-500 cursor-pointer">Include meal details page in PDF</label>
                </div>
                {customRecipes.length > 0 && (
                  <div className="col-span-2 border border-purple-200 dark:border-purple-800 rounded-xl p-2.5 space-y-1.5 bg-purple-50/50 dark:bg-purple-950/20">
                    <div className="text-xs font-semibold text-purple-700 dark:text-purple-300 flex items-center gap-1"><BookOpen size={13} />Recipes in the PDF - وصفات في الـ PDF</div>
                    <p className="text-[11px] text-gray-500">Ticked recipes get a full page (photos, ingredients, steps) at the end of the PDF, and their names become clickable links in the meal list. Recipes used in the plan are ticked automatically.</p>
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {customRecipes.map(r => (
                        <label key={r.id} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input type="checkbox" className="accent-purple-600" checked={recipeInPdf(r.id)}
                            onChange={e => setPdfRecipeOverride(prev => ({ ...prev, [r.id]: e.target.checked }))} />
                          <span className="flex-1 truncate">{r.name}</span>
                          {usedRecipeIds.has(r.id) && <span className="text-[10px] px-1.5 rounded-full bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">in plan</span>}
                        </label>
                      ))}
                    </div>
                    {pdfRecipes.length > 0 && !showMealsInPdf && (
                      <p className="text-[11px] text-amber-600">Tip: tick “Include meal details page in PDF” so clients can tap a recipe name in their meal list.</p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <button onClick={copyPlan} className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700"><Copy size={14} /> Copy Plan</button>
                <button onClick={printPlan} className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded-xl text-sm hover:bg-gray-700"><Printer size={14} /> Print / PDF</button>
              </div>
              {/* water tracker */}
              <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 rounded-2xl p-3.5 space-y-3">
                {/* Header with Title, Metrics, and Reset */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💧</span>
                    <div>
                      <div className="text-xs font-bold text-gray-800 dark:text-gray-100">
                        Water Tracker - متابعة الماء
                      </div>
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                        {waterLiters.toFixed(2)}L / {planWaterGoal}L
                        <span className="text-gray-400 mx-1">•</span>
                        {Math.round(waterLiters * 1000)}ml ({Math.round(waterLiters / 0.25)} cups)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {waterLiters >= planWaterGoal && planWaterGoal > 0 ? (
                      <span className="px-2 py-0.5 text-[11px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 rounded-full">
                        🎯 {Math.round((waterLiters / planWaterGoal) * 100)}%
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[11px] font-semibold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full">
                        {planWaterGoal > 0 ? `${Math.round((waterLiters / planWaterGoal) * 100)}%` : "0%"}
                      </span>
                    )}
                    {waterLiters > 0 && (
                      <button
                        type="button"
                        title="Reset water intake - إعادة ضبط"
                        onClick={() => setWaterLiters(0)}
                        className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
                      >
                        ↺
                      </button>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      waterLiters >= planWaterGoal && planWaterGoal > 0
                        ? "bg-gradient-to-r from-blue-500 to-emerald-500"
                        : "bg-gradient-to-r from-blue-400 to-cyan-500"
                    )}
                    style={{
                      width: `${planWaterGoal > 0 ? Math.min(100, (waterLiters / planWaterGoal) * 100) : 0}%`,
                    }}
                  />
                </div>

                {/* Determine Goal & Intake Inputs */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Determine Intake Directly in Liters */}
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-0.5 font-medium">
                      Intake - المشروب (L)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={waterLiters === 0 ? "" : waterLiters}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setWaterLiters(isNaN(val) ? 0 : Math.max(0, val));
                        }}
                        placeholder="0.0"
                        className="w-full font-bold text-sm bg-transparent outline-none text-blue-600 dark:text-blue-400"
                      />
                      <span className="text-gray-400 font-semibold text-xs">L</span>
                    </div>
                  </div>

                  {/* Determine Goal Directly in Liters */}
                  <div className="bg-white dark:bg-gray-800 p-2 rounded-xl border border-gray-200 dark:border-gray-700">
                    <label className="text-[11px] text-gray-500 dark:text-gray-400 block mb-0.5 font-medium">
                      Daily Goal - الهدف (L)
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.5"
                        min="0.5"
                        value={planWaterGoal}
                        onChange={e => {
                          const val = parseFloat(e.target.value);
                          setPlanWaterGoal(isNaN(val) ? 2 : Math.max(0.5, val));
                        }}
                        className="w-full font-bold text-sm bg-transparent outline-none text-gray-800 dark:text-gray-100"
                      />
                      <span className="text-gray-400 font-semibold text-xs">L</span>
                    </div>
                  </div>
                </div>

                {/* Quick Add Liter Buttons - NO CAP */}
                <div>
                  <div className="text-[10px] text-gray-500 mb-1 font-medium flex justify-between">
                    <span>Quick Add Liters - إضافة سريعة</span>
                    {waterLiters < planWaterGoal && planWaterGoal > 0 && (
                      <span className="text-blue-600 dark:text-blue-400 font-medium">
                        باقي {(planWaterGoal - waterLiters).toFixed(2)}L
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setWaterLiters(prev => Math.max(0, Number((prev - 0.25).toFixed(2))))}
                      className="px-2 py-1 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-bold text-gray-600 dark:text-gray-300"
                      title="-0.25L (-250ml)"
                    >
                      -0.25L
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaterLiters(prev => Number((prev + 0.25).toFixed(2)))}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold shadow-sm transition-all text-center"
                      title="+0.25L (+250ml / كوب)"
                    >
                      +0.25L <span className="opacity-75 text-[10px] font-normal">كوب</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaterLiters(prev => Number((prev + 0.5).toFixed(2)))}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all text-center"
                      title="+0.5L (+500ml / زجاجة)"
                    >
                      +0.5L <span className="opacity-75 text-[10px] font-normal">زجاجة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWaterLiters(prev => Number((prev + 1.0).toFixed(2)))}
                      className="flex-1 py-1 px-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition-all text-center"
                      title="+1.0L (+1000ml / لتر)"
                    >
                      +1.0L <span className="opacity-75 text-[10px] font-normal">لتر</span>
                    </button>
                  </div>
                </div>

                {/* Visual Glass Tracker - Dynamically expands with NO CAP */}
                <div>
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                    <span>Cups Grid (250ml) - انقر لتحديد الأكواب</span>
                    <span>{Math.round(waterLiters / 0.25)} / {Math.max(1, Math.round(planWaterGoal / 0.25))} كوب</span>
                  </div>
                  <div className="flex gap-1 flex-wrap max-h-24 overflow-y-auto p-1 bg-white/70 dark:bg-gray-900/50 rounded-xl border border-gray-200/80 dark:border-gray-800">
                    {Array.from({
                      length: Math.max(Math.ceil((planWaterGoal || 2) / 0.25), Math.ceil(waterLiters / 0.25)),
                    }).map((_, i) => {
                      const cupLiters = Number(((i + 1) * 0.25).toFixed(2));
                      const isFilled = cupLiters <= waterLiters + 0.001;
                      const isBonus = cupLiters > planWaterGoal + 0.001;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setWaterLiters(cupLiters)}
                          title={`${cupLiters}L (${(i + 1) * 250}ml)`}
                          className={cn(
                            "w-5 h-7 rounded transition-all flex items-end justify-center pb-0.5 border text-[8px] font-bold select-none cursor-pointer hover:scale-105",
                            isFilled
                              ? isBonus
                                ? "bg-emerald-500 border-emerald-600 text-white shadow-sm"
                                : "bg-blue-500 border-blue-600 text-white shadow-sm"
                              : "bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-400 hover:border-blue-400"
                          )}
                        >
                          <span className="leading-none">{i + 1}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Quick Goal Presets */}
                <div className="flex items-center gap-1 text-[10px] text-gray-500 overflow-x-auto pb-0.5">
                  <span className="whitespace-nowrap font-medium">الهدف:</span>
                  {[2, 2.5, 3, 3.5, 4, 4.5, 5].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setPlanWaterGoal(g)}
                      className={cn(
                        "px-1.5 py-0.5 rounded-full border transition-colors whitespace-nowrap",
                        planWaterGoal === g
                          ? "bg-blue-600 text-white border-blue-600 font-semibold"
                          : "border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300"
                      )}
                    >
                      {g}L
                    </button>
                  ))}
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
        {/* ── RECIPES TAB ── */}
        {tab === "recipes" && (
          <RecipeStudio
            allFoods={[...FOOD_DATABASE, ...customFoods]}
            customFoods={customFoods} setCustomFoods={setCustomFoods}
            recipes={customRecipes} setRecipes={setCustomRecipes}
            onAddAsMeal={r => { addRecipeAsMeal(r); setTab("planner"); }}
            storageError={storageError}
            focusRecipeId={focusRecipeId} onFocusHandled={() => setFocusRecipeId(null)}
            cloud={cloud} clientCount={clients.length}
          />
        )}
        {/* ── CALCULATOR TAB ── */}
        {tab === "calculator" && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm space-y-4">
            <h2 className="font-bold text-base">BMR / TDEE Calculator - حاسبة السعرات</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><label className="text-xs text-gray-500">Equation - المعادلة</label>
                <select value={calcData.formula} onChange={e => setCalcData(p => ({ ...p, formula: e.target.value as "mifflin" | "katch" }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1">
                  <option value="mifflin">Mifflin-St Jeor (default) - ميفلن سانت جور</option>
                  <option value="katch">Katch-McArdle (uses body fat %) - كاتش ماكاردل</option>
                </select>
                <p className="text-[11px] text-gray-400 mt-1">
                  {calcData.formula === "katch"
                    ? "Based on lean body mass — more accurate for lean / muscular clients when body fat % is known."
                    : "Based on age, weight, height and gender — the standard choice when body fat % is unknown."}
                </p>
              </div>
              {calcData.formula === "katch" && (
                <div className="col-span-2"><label className="text-xs text-gray-500">Body Fat % - نسبة الدهون</label>
                  <input type="number" min="3" max="60" step="0.1" value={calcData.bodyFat} onChange={e => setCalcData(p => ({ ...p, bodyFat: +e.target.value }))} className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm bg-white dark:bg-gray-800 mt-1" />
                </div>
              )}
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
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Equation</span>
                  <span>{calcResult.formula === "katch" ? `Katch-McArdle${calcResult.lbm ? ` · LBM ${calcResult.lbm} kg` : ""}` : "Mifflin-St Jeor"}</span>
                </div>
                <div className="flex justify-between"><span>BMR</span><span className="font-bold">{calcResult.bmr} kcal</span></div>
                <div className="flex justify-between"><span>TDEE</span><span className="font-bold">{calcResult.tdee} kcal</span></div>
                <div className="flex justify-between text-blue-700 dark:text-blue-300"><span>Target ({calcData.goal})</span><span className="font-bold">{calcResult.target} kcal</span></div>
                {calcResult.water && (
                  <div className="flex justify-between text-cyan-700 dark:text-cyan-300">
                    <span>Recommended Water - احتياج الماء</span>
                    <span className="font-bold">💧 {calcResult.water} L / day</span>
                  </div>
                )}
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
                  if (manualTargets.fiber !== null) rdi.fiber = manualTargets.fiber;
                  if (manualTargets.saturatedFat !== null) rdi.saturatedFat = manualTargets.saturatedFat;
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
                if (manualTargets.fiber !== null) rdi.fiber = manualTargets.fiber;
                if (manualTargets.saturatedFat !== null) rdi.saturatedFat = manualTargets.saturatedFat;
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
