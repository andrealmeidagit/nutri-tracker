/**
 * NutriFlow Food Database
 * Curated list of 100+ staple fitness and whole foods with nutritional values per 100g (or 100ml / unit).
 */

const FOOD_DATABASE = [
  // ==========================================
  // 1. PROTEINS (STAPLES, MEAT, SEAFOOD, VEGAN)
  // ==========================================
  {
    id: "db_chicken_breast",
    name: "Chicken Breast (Cooked)",
    category: "Proteins",
    calories: 165,
    protein: 31.0,
    carbs: 0.0,
    fats: 3.6,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_chicken_thigh",
    name: "Chicken Thigh (Cooked, Skinless)",
    category: "Proteins",
    calories: 209,
    protein: 26.0,
    carbs: 0.0,
    fats: 10.9,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_lean_beef",
    name: "Lean Ground Beef (93/7 Cooked)",
    category: "Proteins",
    calories: 213,
    protein: 26.0,
    carbs: 0.0,
    fats: 11.0,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_sirloin_steak",
    name: "Sirloin Steak (Cooked, Lean)",
    category: "Proteins",
    calories: 200,
    protein: 30.0,
    carbs: 0.0,
    fats: 8.0,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_ribeye_steak",
    name: "Ribeye Steak (Cooked, Trimmed)",
    category: "Proteins",
    calories: 291,
    protein: 24.0,
    carbs: 0.0,
    fats: 21.8,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_salmon",
    name: "Salmon Fillet (Cooked)",
    category: "Proteins",
    calories: 206,
    protein: 22.0,
    carbs: 0.0,
    fats: 12.0,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_canned_tuna",
    name: "Tuna (Canned in Water)",
    category: "Proteins",
    calories: 116,
    protein: 26.0,
    carbs: 0.0,
    fats: 1.0,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_cod",
    name: "Cod Fillet (Cooked)",
    category: "Proteins",
    calories: 105,
    protein: 23.0,
    carbs: 0.0,
    fats: 0.9,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_tilapia",
    name: "Tilapia Fillet (Cooked)",
    category: "Proteins",
    calories: 128,
    protein: 26.0,
    carbs: 0.0,
    fats: 2.7,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_shrimp",
    name: "Shrimp (Cooked)",
    category: "Proteins",
    calories: 99,
    protein: 24.0,
    carbs: 0.2,
    fats: 0.3,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_turkey_breast",
    name: "Turkey Breast (Cooked)",
    category: "Proteins",
    calories: 135,
    protein: 30.0,
    carbs: 0.0,
    fats: 1.0,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_ground_turkey_lean",
    name: "Lean Ground Turkey (93/7 Cooked)",
    category: "Proteins",
    calories: 203,
    protein: 27.2,
    carbs: 0.0,
    fats: 9.8,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_pork_tenderloin",
    name: "Pork Tenderloin (Cooked)",
    category: "Proteins",
    calories: 143,
    protein: 26.0,
    carbs: 0.0,
    fats: 3.5,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_egg_white",
    name: "Egg Whites (Liquid)",
    category: "Proteins",
    calories: 52,
    protein: 11.0,
    carbs: 0.7,
    fats: 0.2,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_whole_egg",
    name: "Whole Egg (Large)",
    category: "Proteins",
    calories: 143,
    protein: 12.6,
    carbs: 0.7,
    fats: 9.5,
    defaultServing: 50,
    unit: "g"
  },
  {
    id: "db_hard_boiled_egg",
    name: "Hard Boiled Egg (Large)",
    category: "Proteins",
    calories: 155,
    protein: 12.6,
    carbs: 1.1,
    fats: 10.6,
    defaultServing: 50,
    unit: "g"
  },
  {
    id: "db_whey_protein",
    name: "Whey Protein Isolate",
    category: "Proteins",
    calories: 360,
    protein: 83.3,
    carbs: 6.7,
    fats: 3.3,
    defaultServing: 30,
    unit: "g"
  },
  {
    id: "db_casein_protein",
    name: "Casein Protein Powder",
    category: "Proteins",
    calories: 355,
    protein: 80.0,
    carbs: 10.0,
    fats: 3.3,
    defaultServing: 30,
    unit: "g"
  },
  {
    id: "db_collagen_peptides",
    name: "Collagen Peptides Powder",
    category: "Proteins",
    calories: 360,
    protein: 90.0,
    carbs: 0.0,
    fats: 0.0,
    defaultServing: 10,
    unit: "g"
  },
  {
    id: "db_tofu",
    name: "Tofu (Firm)",
    category: "Proteins",
    calories: 83,
    protein: 10.0,
    carbs: 1.5,
    fats: 4.8,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_tempeh",
    name: "Tempeh (Cooked)",
    category: "Proteins",
    calories: 196,
    protein: 18.2,
    carbs: 9.4,
    fats: 11.4,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_seitan",
    name: "Seitan (Wheat Gluten)",
    category: "Proteins",
    calories: 370,
    protein: 75.0,
    carbs: 14.0,
    fats: 1.9,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_edamame",
    name: "Edamame (Shelled, Boiled)",
    category: "Proteins",
    calories: 122,
    protein: 11.0,
    carbs: 10.0,
    fats: 5.2,
    defaultServing: 100,
    unit: "g"
  },

  // ==========================================
  // 2. CARBOHYDRATES (GRAINS, TUBERS, BEANS, SWEETS)
  // ==========================================
  {
    id: "db_white_rice",
    name: "White Jasmine Rice (Cooked)",
    category: "Carbohydrates",
    calories: 130,
    protein: 2.7,
    carbs: 28.0,
    fats: 0.3,
    defaultServing: 200,
    unit: "g"
  },
  {
    id: "db_brown_rice",
    name: "Brown Rice (Cooked)",
    category: "Carbohydrates",
    calories: 111,
    protein: 2.6,
    carbs: 23.0,
    fats: 0.9,
    defaultServing: 200,
    unit: "g"
  },
  {
    id: "db_rolled_oats",
    name: "Rolled Oats (Raw)",
    category: "Carbohydrates",
    calories: 379,
    protein: 13.5,
    carbs: 67.7,
    fats: 6.9,
    defaultServing: 50,
    unit: "g"
  },
  {
    id: "db_instant_oats",
    name: "Instant Oatmeal (Plain)",
    category: "Carbohydrates",
    calories: 367,
    protein: 12.0,
    carbs: 67.0,
    fats: 6.0,
    defaultServing: 40,
    unit: "g"
  },
  {
    id: "db_cream_of_rice",
    name: "Cream of Rice (Raw)",
    category: "Carbohydrates",
    calories: 367,
    protein: 6.7,
    carbs: 83.3,
    fats: 0.0,
    defaultServing: 50,
    unit: "g"
  },
  {
    id: "db_cream_of_wheat",
    name: "Cream of Wheat (Raw)",
    category: "Carbohydrates",
    calories: 340,
    protein: 10.0,
    carbs: 74.0,
    fats: 1.0,
    defaultServing: 40,
    unit: "g"
  },
  {
    id: "db_sweet_potato",
    name: "Sweet Potato (Baked)",
    category: "Carbohydrates",
    calories: 90,
    protein: 2.0,
    carbs: 20.7,
    fats: 0.2,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_white_potato",
    name: "White Potato (Baked)",
    category: "Carbohydrates",
    calories: 93,
    protein: 2.5,
    carbs: 21.0,
    fats: 0.1,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_quinoa",
    name: "Quinoa (Cooked)",
    category: "Carbohydrates",
    calories: 120,
    protein: 4.4,
    carbs: 21.3,
    fats: 1.9,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_whole_wheat_bread",
    name: "Whole Wheat Bread (Slice)",
    category: "Carbohydrates",
    calories: 250,
    protein: 12.0,
    carbs: 43.0,
    fats: 3.5,
    defaultServing: 30,
    unit: "g"
  },
  {
    id: "db_white_bread",
    name: "White Bread (Slice)",
    category: "Carbohydrates",
    calories: 265,
    protein: 9.0,
    carbs: 49.0,
    fats: 3.2,
    defaultServing: 30,
    unit: "g"
  },
  {
    id: "db_plain_bagel",
    name: "Plain Bagel (Medium)",
    category: "Carbohydrates",
    calories: 257,
    protein: 10.0,
    carbs: 51.5,
    fats: 1.5,
    defaultServing: 90,
    unit: "g"
  },
  {
    id: "db_pasta",
    name: "Pasta (Cooked)",
    category: "Carbohydrates",
    calories: 158,
    protein: 5.8,
    carbs: 31.0,
    fats: 0.9,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_couscous",
    name: "Couscous (Cooked)",
    category: "Carbohydrates",
    calories: 112,
    protein: 3.8,
    carbs: 23.0,
    fats: 0.2,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_rice_cake_plain",
    name: "Plain Rice Cake (Unit)",
    category: "Carbohydrates",
    calories: 387,
    protein: 8.0,
    carbs: 82.0,
    fats: 2.8,
    defaultServing: 9,
    unit: "g"
  },
  {
    id: "db_granola_low_fat",
    name: "Granola (Low Fat)",
    category: "Carbohydrates",
    calories: 395,
    protein: 8.5,
    carbs: 79.0,
    fats: 5.0,
    defaultServing: 40,
    unit: "g"
  },
  {
    id: "db_corn_tortilla",
    name: "Corn Tortilla (Unit)",
    category: "Carbohydrates",
    calories: 218,
    protein: 5.7,
    carbs: 45.0,
    fats: 2.4,
    defaultServing: 25,
    unit: "g"
  },
  {
    id: "db_flour_tortilla",
    name: "Flour Tortilla (Unit)",
    category: "Carbohydrates",
    calories: 312,
    protein: 8.0,
    carbs: 50.0,
    fats: 8.0,
    defaultServing: 45,
    unit: "g"
  },
  {
    id: "db_black_beans",
    name: "Black Beans (Canned/Boiled)",
    category: "Carbohydrates",
    calories: 132,
    protein: 8.9,
    carbs: 23.7,
    fats: 0.5,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_chickpeas",
    name: "Chickpeas / Garbanzo Beans (Boiled)",
    category: "Carbohydrates",
    calories: 164,
    protein: 8.9,
    carbs: 27.4,
    fats: 2.6,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_kidney_beans",
    name: "Kidney Beans (Boiled)",
    category: "Carbohydrates",
    calories: 127,
    protein: 8.7,
    carbs: 22.8,
    fats: 0.5,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_lentils",
    name: "Lentils (Cooked)",
    category: "Carbohydrates",
    calories: 116,
    protein: 9.0,
    carbs: 20.0,
    fats: 0.4,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_honey",
    name: "Pure Natural Honey",
    category: "Carbohydrates",
    calories: 304,
    protein: 0.3,
    carbs: 82.4,
    fats: 0.0,
    defaultServing: 20,
    unit: "g"
  },
  {
    id: "db_maple_syrup",
    name: "Pure Maple Syrup",
    category: "Carbohydrates",
    calories: 260,
    protein: 0.0,
    carbs: 67.0,
    fats: 0.1,
    defaultServing: 20,
    unit: "g"
  },

  // ==========================================
  // 3. FATS (OILS, SEEDS, NUTS, DELICACIES)
  // ==========================================
  {
    id: "db_avocado",
    name: "Avocado (Fresh)",
    category: "Fats",
    calories: 160,
    protein: 2.0,
    carbs: 8.5,
    fats: 14.7,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_peanut_butter",
    name: "Natural Peanut Butter",
    category: "Fats",
    calories: 588,
    protein: 25.0,
    carbs: 20.0,
    fats: 50.0,
    defaultServing: 16,
    unit: "g"
  },
  {
    id: "db_olive_oil",
    name: "Extra Virgin Olive Oil",
    category: "Fats",
    calories: 884,
    protein: 0.0,
    carbs: 0.0,
    fats: 100.0,
    defaultServing: 14,
    unit: "g"
  },
  {
    id: "db_coconut_oil",
    name: "Coconut Oil",
    category: "Fats",
    calories: 862,
    protein: 0.0,
    carbs: 0.0,
    fats: 100.0,
    defaultServing: 14,
    unit: "g"
  },
  {
    id: "db_butter_salted",
    name: "Butter (Salted)",
    category: "Fats",
    calories: 717,
    protein: 0.9,
    carbs: 0.1,
    fats: 81.1,
    defaultServing: 10,
    unit: "g"
  },
  {
    id: "db_ghee",
    name: "Ghee (Clarified Butter)",
    category: "Fats",
    calories: 876,
    protein: 0.3,
    carbs: 0.0,
    fats: 99.5,
    defaultServing: 10,
    unit: "g"
  },
  {
    id: "db_almonds",
    name: "Almonds (Raw)",
    category: "Fats",
    calories: 579,
    protein: 21.2,
    carbs: 21.6,
    fats: 49.9,
    defaultServing: 28,
    unit: "g"
  },
  {
    id: "db_walnuts",
    name: "Walnuts (Raw)",
    category: "Fats",
    calories: 654,
    protein: 15.2,
    carbs: 13.7,
    fats: 65.2,
    defaultServing: 28,
    unit: "g"
  },
  {
    id: "db_cashews",
    name: "Cashews (Raw)",
    category: "Fats",
    calories: 553,
    protein: 18.2,
    carbs: 30.2,
    fats: 43.8,
    defaultServing: 28,
    unit: "g"
  },
  {
    id: "db_pecans",
    name: "Pecans (Raw)",
    category: "Fats",
    calories: 691,
    protein: 9.2,
    carbs: 13.9,
    fats: 72.0,
    defaultServing: 28,
    unit: "g"
  },
  {
    id: "db_macadamia_nuts",
    name: "Macadamia Nuts (Raw)",
    category: "Fats",
    calories: 718,
    protein: 7.9,
    carbs: 13.8,
    fats: 75.8,
    defaultServing: 28,
    unit: "g"
  },
  {
    id: "db_chia_seeds",
    name: "Chia Seeds",
    category: "Fats",
    calories: 486,
    protein: 16.5,
    carbs: 42.1,
    fats: 30.7,
    defaultServing: 15,
    unit: "g"
  },
  {
    id: "db_flax_seeds_ground",
    name: "Flax Seeds (Ground)",
    category: "Fats",
    calories: 534,
    protein: 18.3,
    carbs: 28.9,
    fats: 42.2,
    defaultServing: 15,
    unit: "g"
  },
  {
    id: "db_pumpkin_seeds",
    name: "Pumpkin Seeds (Pepitas)",
    category: "Fats",
    calories: 559,
    protein: 30.2,
    carbs: 10.7,
    fats: 49.0,
    defaultServing: 20,
    unit: "g"
  },
  {
    id: "db_dark_chocolate",
    name: "Dark Chocolate (85% Cacao)",
    category: "Fats",
    calories: 598,
    protein: 7.8,
    carbs: 22.4,
    fats: 45.9,
    defaultServing: 30,
    unit: "g"
  },

  // ==========================================
  // 4. DAIRY & ALTERNATIVES (MILK, YOGURT, CHEESES)
  // ==========================================
  {
    id: "db_greek_yogurt_0",
    name: "Greek Yogurt (Non-Fat)",
    category: "Dairy",
    calories: 59,
    protein: 10.3,
    carbs: 3.6,
    fats: 0.4,
    defaultServing: 170,
    unit: "g"
  },
  {
    id: "db_cottage_cheese_0",
    name: "Cottage Cheese (Fat Free)",
    category: "Dairy",
    calories: 72,
    protein: 10.3,
    carbs: 2.7,
    fats: 0.3,
    defaultServing: 113,
    unit: "g"
  },
  {
    id: "db_skim_milk",
    name: "Skim Milk (Non-Fat)",
    category: "Dairy",
    calories: 34,
    protein: 3.4,
    carbs: 5.0,
    fats: 0.1,
    defaultServing: 240,
    unit: "ml"
  },
  {
    id: "db_whole_milk",
    name: "Whole Milk (3.25%)",
    category: "Dairy",
    calories: 61,
    protein: 3.2,
    carbs: 4.8,
    fats: 3.3,
    defaultServing: 240,
    unit: "ml"
  },
  {
    id: "db_almond_milk_unsweetened",
    name: "Almond Milk (Unsweetened)",
    category: "Dairy",
    calories: 15,
    protein: 0.4,
    carbs: 0.3,
    fats: 1.1,
    defaultServing: 240,
    unit: "ml"
  },
  {
    id: "db_oat_milk_unsweetened",
    name: "Oat Milk (Unsweetened)",
    category: "Dairy",
    calories: 45,
    protein: 0.8,
    carbs: 7.0,
    fats: 1.5,
    defaultServing: 240,
    unit: "ml"
  },
  {
    id: "db_soy_milk_plain",
    name: "Soy Milk (Plain)",
    category: "Dairy",
    calories: 43,
    protein: 3.3,
    carbs: 2.5,
    fats: 1.7,
    defaultServing: 240,
    unit: "ml"
  },
  {
    id: "db_whey_isolate_milk",
    name: "Fairlife Skim Milk (High Protein)",
    category: "Dairy",
    calories: 33,
    protein: 5.4,
    carbs: 2.5,
    fats: 0.0,
    defaultServing: 240,
    unit: "ml"
  },
  {
    id: "db_mozzarella_part_skim",
    name: "Mozzarella Cheese (Part-Skim)",
    category: "Dairy",
    calories: 254,
    protein: 24.2,
    carbs: 2.8,
    fats: 15.9,
    defaultServing: 30,
    unit: "g"
  },
  {
    id: "db_feta_cheese",
    name: "Feta Cheese (Crumbled)",
    category: "Dairy",
    calories: 264,
    protein: 14.2,
    carbs: 4.1,
    fats: 21.3,
    defaultServing: 30,
    unit: "g"
  },
  {
    id: "db_cheddar_cheese",
    name: "Cheddar Cheese",
    category: "Dairy",
    calories: 403,
    protein: 24.9,
    carbs: 1.3,
    fats: 33.1,
    defaultServing: 30,
    unit: "g"
  },
  {
    id: "db_parm_cheese",
    name: "Parmesan Cheese (Grated)",
    category: "Dairy",
    calories: 431,
    protein: 38.5,
    carbs: 4.1,
    fats: 28.6,
    defaultServing: 15,
    unit: "g"
  },

  // ==========================================
  // 5. FRUITS (NATURE'S VITAMINS & GLUCOSE)
  // ==========================================
  {
    id: "db_banana",
    name: "Banana (Fresh)",
    category: "Fruits",
    calories: 89,
    protein: 1.1,
    carbs: 22.8,
    fats: 0.3,
    defaultServing: 120,
    unit: "g"
  },
  {
    id: "db_apple",
    name: "Apple (with Skin)",
    category: "Fruits",
    calories: 52,
    protein: 0.3,
    carbs: 13.8,
    fats: 0.2,
    defaultServing: 180,
    unit: "g"
  },
  {
    id: "db_blueberries",
    name: "Blueberries (Fresh)",
    category: "Fruits",
    calories: 57,
    protein: 0.7,
    carbs: 14.5,
    fats: 0.3,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_strawberries",
    name: "Strawberries (Fresh)",
    category: "Fruits",
    calories: 32,
    protein: 0.7,
    carbs: 7.7,
    fats: 0.3,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_raspberries",
    name: "Raspberries (Fresh)",
    category: "Fruits",
    calories: 52,
    protein: 1.2,
    carbs: 11.9,
    fats: 0.7,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_blackberries",
    name: "Blackberries (Fresh)",
    category: "Fruits",
    calories: 43,
    protein: 1.4,
    carbs: 9.6,
    fats: 0.5,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_orange",
    name: "Orange (Fresh)",
    category: "Fruits",
    calories: 47,
    protein: 0.9,
    carbs: 11.8,
    fats: 0.1,
    defaultServing: 130,
    unit: "g"
  },
  {
    id: "db_grapefruit",
    name: "Grapefruit (Fresh)",
    category: "Fruits",
    calories: 42,
    protein: 0.8,
    carbs: 10.7,
    fats: 0.1,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_pineapple",
    name: "Pineapple (Fresh Slices)",
    category: "Fruits",
    calories: 50,
    protein: 0.5,
    carbs: 13.1,
    fats: 0.1,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_mango",
    name: "Mango (Fresh)",
    category: "Fruits",
    calories: 60,
    protein: 0.8,
    carbs: 15.0,
    fats: 0.4,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_grapes",
    name: "Red/Green Grapes",
    category: "Fruits",
    calories: 69,
    protein: 0.7,
    carbs: 18.1,
    fats: 0.2,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_watermelon",
    name: "Watermelon (Fresh Blocks)",
    category: "Fruits",
    calories: 30,
    protein: 0.6,
    carbs: 7.6,
    fats: 0.2,
    defaultServing: 200,
    unit: "g"
  },
  {
    id: "db_peach",
    name: "Peach (Fresh)",
    category: "Fruits",
    calories: 39,
    protein: 0.9,
    carbs: 9.5,
    fats: 0.3,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_pear",
    name: "Pear (Fresh with Skin)",
    category: "Fruits",
    calories: 57,
    protein: 0.4,
    carbs: 15.2,
    fats: 0.1,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_kiwi",
    name: "Kiwi Fruit (Fresh)",
    category: "Fruits",
    calories: 61,
    protein: 1.1,
    carbs: 14.7,
    fats: 0.5,
    defaultServing: 75,
    unit: "g"
  },

  // ==========================================
  // 6. VEGETABLES (FIBER, PHYTONUTRIENTS)
  // ==========================================
  {
    id: "db_broccoli",
    name: "Broccoli (Raw/Steamed)",
    category: "Vegetables",
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fats: 0.4,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_spinach",
    name: "Spinach (Fresh)",
    category: "Vegetables",
    calories: 23,
    protein: 2.9,
    carbs: 3.6,
    fats: 0.4,
    defaultServing: 80,
    unit: "g"
  },
  {
    id: "db_kale",
    name: "Kale (Raw Leaves)",
    category: "Vegetables",
    calories: 49,
    protein: 4.3,
    carbs: 8.8,
    fats: 0.9,
    defaultServing: 80,
    unit: "g"
  },
  {
    id: "db_asparagus",
    name: "Asparagus (Steamed)",
    category: "Vegetables",
    calories: 20,
    protein: 2.2,
    carbs: 3.9,
    fats: 0.1,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_cucumber",
    name: "Cucumber (with Peel)",
    category: "Vegetables",
    calories: 15,
    protein: 0.7,
    carbs: 3.6,
    fats: 0.1,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_bell_pepper",
    name: "Bell Pepper (Red/Green)",
    category: "Vegetables",
    calories: 31,
    protein: 1.0,
    carbs: 6.0,
    fats: 0.3,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_white_mushroom",
    name: "White Button Mushrooms (Raw)",
    category: "Vegetables",
    calories: 22,
    protein: 3.1,
    carbs: 3.3,
    fats: 0.3,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_zucchini",
    name: "Zucchini (Steamed)",
    category: "Vegetables",
    calories: 17,
    protein: 1.2,
    carbs: 3.1,
    fats: 0.3,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_cauliflower",
    name: "Cauliflower (Steamed)",
    category: "Vegetables",
    calories: 25,
    protein: 1.9,
    carbs: 5.0,
    fats: 0.3,
    defaultServing: 150,
    unit: "g"
  },
  {
    id: "db_carrots",
    name: "Carrots (Raw / Sliced)",
    category: "Vegetables",
    calories: 41,
    protein: 0.9,
    carbs: 9.6,
    fats: 0.2,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_yellow_onion",
    name: "Yellow Onion (Sautéed)",
    category: "Vegetables",
    calories: 40,
    protein: 1.1,
    carbs: 9.3,
    fats: 0.1,
    defaultServing: 50,
    unit: "g"
  },
  {
    id: "db_tomatoes",
    name: "Tomatoes (Red, Fresh)",
    category: "Vegetables",
    calories: 18,
    protein: 0.9,
    carbs: 3.9,
    fats: 0.2,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_romaine_lettuce",
    name: "Romaine Lettuce (Shredded)",
    category: "Vegetables",
    calories: 17,
    protein: 1.2,
    carbs: 3.3,
    fats: 0.3,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_brussels_sprouts",
    name: "Brussels Sprouts (Roasted)",
    category: "Vegetables",
    calories: 43,
    protein: 3.4,
    carbs: 9.0,
    fats: 0.3,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_green_beans",
    name: "Green Beans (Steamed)",
    category: "Vegetables",
    calories: 31,
    protein: 1.8,
    carbs: 7.0,
    fats: 0.2,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_celery",
    name: "Celery (Stalk, Raw)",
    category: "Vegetables",
    calories: 16,
    protein: 0.7,
    carbs: 3.0,
    fats: 0.2,
    defaultServing: 100,
    unit: "g"
  },
  {
    id: "db_sweet_corn",
    name: "Sweet Corn (Canned/Boiled)",
    category: "Vegetables",
    calories: 86,
    protein: 3.2,
    carbs: 19.0,
    fats: 1.2,
    defaultServing: 100,
    unit: "g"
  }
];
