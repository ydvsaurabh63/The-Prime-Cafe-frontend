/**
 * Predefined items mapping by category for Aaj Kal Cafe / The Prime Cafe.
 * Categories:
 * 1. CHINEES (47 items)
 * 2. COMBO (6 items)
 * 3. TPC SPECIAL PREMIUM TEA (5 items)
 * 4. DRINKS (6 items)
 * 5. INSTANT HUNGER (15 items)
 */

export const CATEGORY_PRESET_ITEMS = {
  chinees: [
    { name: 'Egg Roll Single', price: 40, isVeg: false },
    { name: 'Egg Roll Double', price: 50, isVeg: false },
    { name: 'Egg Chicken Roll Single', price: 110, isVeg: false },
    { name: 'Egg Chicken Roll Double', price: 140, isVeg: false },
    { name: 'Paneer Roll', price: 80, isVeg: true },
    { name: 'Veg Roll', price: 70, isVeg: true },
    { name: 'Paneer Chilli (Full)', price: 200, isVeg: true },
    { name: 'Paneer Chilli (Half)', price: 110, isVeg: true },
    { name: 'Paneer Pyaza (Half)', price: 120, isVeg: true },
    { name: 'Paneer Pyaza (Full)', price: 240, isVeg: true },
    { name: 'Paneer Butter Masala (Half)', price: 130, isVeg: true },
    { name: 'Paneer Butter Masala (Full)', price: 250, isVeg: true },
    { name: 'Mashroom Masala (Full)', price: 220, isVeg: true },
    { name: 'Mashroom Masala (Half)', price: 120, isVeg: true },
    { name: 'Mashroom Chilli (Full)', price: 200, isVeg: true },
    { name: 'Mashroom Chilli (Half)', price: 110, isVeg: true },
    { name: 'Chicken Chilli (Full)', price: 200, isVeg: false },
    { name: 'Chicken Chilli (Half)', price: 110, isVeg: false },
    { name: 'Veg Manchurian (Full)', price: 130, isVeg: true },
    { name: 'Veg Manchurian (Half)', price: 70, isVeg: true },
    { name: 'Paratha (1Pcs)', price: 15, isVeg: true },
    { name: 'Paneer Paratha (2Pcs)', price: 80, isVeg: true },
    { name: 'Lachchha Paratha', price: 40, isVeg: true },
    { name: 'Aloo Paratha (2Pcs)', price: 60, isVeg: true },
    { name: 'Butter Paratha (1Pcs)', price: 25, isVeg: true },
    { name: 'Sattu Paratha (2Pcs)', price: 60, isVeg: true },
    { name: 'Veg Fry Rice (Full)', price: 110, isVeg: true },
    { name: 'Veg Fry Rice (Half)', price: 70, isVeg: true },
    { name: 'Egg Fry Rice (Half)', price: 80, isVeg: false },
    { name: 'Egg Fry Rice (Full)', price: 130, isVeg: false },
    { name: 'Chicken Fry Rice (Full)', price: 160, isVeg: false },
    { name: 'Chicken Fry Rice (Half)', price: 90, isVeg: false },
    { name: 'Egg Chicken Fry Rice (Full)', price: 180, isVeg: false },
    { name: 'Egg Chicken Fry Rice (Half)', price: 100, isVeg: false },
    { name: 'Chicken Pakora (6 Piece)', price: 100, isVeg: false },
    { name: 'Chowmein (Half)', price: 40, isVeg: true },
    { name: 'Chowmein (Full)', price: 70, isVeg: true },
    { name: 'Chicken Chowmein (Half)', price: 60, isVeg: false },
    { name: 'Chicken Chowmein (Full)', price: 90, isVeg: false },
    { name: 'Paneer Chowmein (Half)', price: 70, isVeg: true },
    { name: 'Paneer Chowmein (Full)', price: 110, isVeg: true },
    { name: 'Egg Chowmein (Half)', price: 50, isVeg: false },
    { name: 'Egg Chowmein (Full)', price: 90, isVeg: false },
    { name: 'Chicken Egg Chowmein (Half)', price: 70, isVeg: false },
    { name: 'Chicken Egg Chowmein (Full)', price: 110, isVeg: false },
    { name: 'Paneer Pakaura (Full-12pcs)', price: 200, isVeg: true },
    { name: 'Paneer Pakaura (Half-6pcs)', price: 100, isVeg: true }
  ],

  combo: [
    { name: 'Bun Maska+Tea/Cold Drinks', price: 59, isVeg: true },
    { name: 'Sandwich+Peri-Peri', price: 89, isVeg: true },
    { name: 'Sandwich+Peri-Peri+Cold Drinks', price: 109, isVeg: true },
    { name: 'Peri-Peri+Cold Drinks/Tea', price: 69, isVeg: true },
    { name: 'Sandwich+Cold Drinks/Tea', price: 69, isVeg: true },
    { name: 'Burger+Cold Drinks/Tea', price: 79, isVeg: true }
  ],

  'tpc-special-premium-tea': [
    { name: 'Special Jaggery Tea', price: 39, isVeg: true },
    { name: 'Immunity Booster Tea', price: 39, isVeg: true },
    { name: 'Black Coffee', price: 59, isVeg: true },
    { name: 'Flavored Cold Coffee', price: 99, isVeg: true },
    { name: 'Mathca Tea', price: 99, isVeg: true }
  ],

  drinks: [
    { name: 'Mojito', price: 70, isVeg: true },
    { name: 'Soft Drinks', price: 30, isVeg: true },
    { name: 'Banana Shake', price: 80, isVeg: true },
    { name: 'Lassi / Flavour Lassi', price: 80, isVeg: true },
    { name: 'Water 1 Ltr.', price: 20, isVeg: true },
    { name: 'Water 500 ML', price: 10, isVeg: true }
  ],

  'instant-hunger': [
    { name: 'Sandwich', price: 49, isVeg: true },
    { name: 'Bun Maska', price: 39, isVeg: true },
    { name: 'Peri-Peri', price: 49, isVeg: true },
    { name: 'Chhola Bhatura', price: 50, isVeg: true },
    { name: 'Bhatura (Per Piece)', price: 20, isVeg: true },
    { name: 'TPC Special Momos (Full)', price: 120, isVeg: true },
    { name: 'Paneer Momos (8Pcs)', price: 150, isVeg: true },
    { name: 'Kurkure Momos (Veg.) (6Pcs)', price: 120, isVeg: true },
    { name: 'Dahi Bada (2Pcs)', price: 60, isVeg: true },
    { name: 'Burger', price: 60, isVeg: true },
    { name: 'Maggi', price: 60, isVeg: true },
    { name: 'Veg. Maggi', price: 80, isVeg: true },
    { name: 'Cheez Maggi', price: 90, isVeg: true },
    { name: 'Butter Egg Aamlet (Full)', price: 120, isVeg: false },
    { name: 'Butter Egg Aamlet (Half)', price: 70, isVeg: false }
  ]
};

/**
 * Returns the list of preset items for a given category object or string.
 * Supports matching by slug, name (case-insensitive), or ID.
 */
export const getCategoryPresetItems = (category) => {
  if (!category) return [];

  const name = (typeof category === 'object' ? category.name : category) || '';
  const slug = (typeof category === 'object' ? category.slug : category) || '';

  const cleanName = String(name).toLowerCase().trim();
  const cleanSlug = String(slug).toLowerCase().trim();

  // Match Chinees / Chinese variants
  if (
    cleanSlug === 'chinees' ||
    cleanSlug === 'chinese' ||
    cleanName.includes('chinee') ||
    cleanName.includes('chinese')
  ) {
    return CATEGORY_PRESET_ITEMS.chinees;
  }

  // Match Combo
  if (cleanSlug === 'combo' || cleanName.includes('combo')) {
    return CATEGORY_PRESET_ITEMS.combo;
  }

  // Match TPC Special Premium Tea
  if (
    cleanSlug === 'tpc-special-premium-tea' ||
    cleanName.includes('tpc special') ||
    cleanName.includes('premium tea')
  ) {
    return CATEGORY_PRESET_ITEMS['tpc-special-premium-tea'];
  }

  // Match Drinks
  if (
    cleanSlug === 'drinks' ||
    cleanName === 'drinks' ||
    cleanName === 'drink'
  ) {
    return CATEGORY_PRESET_ITEMS.drinks;
  }

  // Match Instant Hunger
  if (
    cleanSlug === 'instant-hunger' ||
    cleanName.includes('instant') ||
    cleanName.includes('hunger')
  ) {
    return CATEGORY_PRESET_ITEMS['instant-hunger'];
  }

  if (CATEGORY_PRESET_ITEMS[cleanSlug]) {
    return CATEGORY_PRESET_ITEMS[cleanSlug];
  }

  return [];
};
