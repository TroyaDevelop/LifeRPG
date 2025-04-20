// Константы для спрайтов иконок предметов
// Здесь будут храниться отдельные спрайты иконок для отображения в магазине и инвентаре

// Импортируем спрайты иконок для различных типов предметов
// Примечание: В дальнейшем замените заглушки на реальные спрайты иконок

// Головные уборы
export const HEAD_ITEM_ICONS = {
  // Обычные предметы
  equip_head_common: {
    icon: null, // require('../../assets/sprites/icons/equipment/head_common_icon.png'),
    type: 'head',
    rarity: 'common',
  },
  // Редкие предметы
  equip_head_rare: {
    icon: null, // require('../../assets/sprites/icons/equipment/head_rare_icon.png'),
    type: 'head',
    rarity: 'rare',
  },
  // Эпические предметы
  equip_head_epic: {
    icon: null, // require('../../assets/sprites/icons/equipment/head_epic_icon.png'),
    type: 'head',
    rarity: 'epic',
  },
  // Легендарные предметы
  equip_head_legendary: {
    icon: null, // require('../../assets/sprites/icons/equipment/head_legendary_icon.png'),
    type: 'head',
    rarity: 'legendary',
  },
  // Наборы
  farmer_set_head: {
    icon: require("../../assets/sprites/icons/equipment/farmer_hat_icon.png"), // require('../../assets/sprites/icons/equipment/farmer_head_icon.png'),
    type: 'head',
    rarity: 'common',
  },
};

// Верхняя одежда (тело)
export const BODY_ITEM_ICONS = {
  // Обычные предметы
  equip_body_common: {
    icon: null, // require('../../assets/sprites/icons/equipment/body_common_icon.png'),
    type: 'body',
    rarity: 'common',
  },
  // Редкие предметы - новая кожаная броня
  leather_armor_body1: {
    icon: require('../../assets/sprites/icons/equipment/farmer_body_icon.png'),
    type: 'body',
    rarity: 'rare',
  },
  // Эпические предметы - новая кожаная броня
  leather_armor_body2: {
    icon: require('../../assets/sprites/icons/equipment/farmer_body_icon.png'),
    type: 'body',
    rarity: 'epic',
  },
  // Легендарные предметы - новая кожаная броня
  leather_armor_body3: {
    icon: require('../../assets/sprites/icons/equipment/farmer_body_icon.png'),
    type: 'body',
    rarity: 'legendary',
  },
  // Наборы
  farmer_set_body: {
    icon: require("../../assets/sprites/icons/equipment/farmer_body_icon.png"), // require('../../assets/sprites/icons/equipment/farmer_body_icon.png'),
    type: 'body',
    rarity: 'common',
  },
};

// Штаны
export const LEGS_ITEM_ICONS = {
  // Обычные предметы
  equip_legs_common: {
    icon: null, // require('../../assets/sprites/icons/equipment/legs_common_icon.png'),
    type: 'legs',
    rarity: 'common',
  },
  // Редкие предметы - новые кожаные штаны
  leather_armor_legs1: {
    icon: require('../../assets/sprites/icons/equipment/farmer_legs_icon.png'),
    type: 'legs',
    rarity: 'rare',
  },
  // Эпические предметы - новые кожаные штаны
  leather_armor_legs2: {
    icon: require('../../assets/sprites/icons/equipment/farmer_legs_icon.png'),
    type: 'legs',
    rarity: 'epic',
  },
  // Легендарные предметы - новые кожаные штаны
  leather_armor_legs3: {
    icon: require('../../assets/sprites/icons/equipment/farmer_legs_icon.png'),
    type: 'legs',
    rarity: 'legendary',
  },
  // Наборы
  farmer_set_legs: {
    icon: require("../../assets/sprites/icons/equipment/farmer_legs_icon.png"), // require('../../assets/sprites/icons/equipment/farmer_legs_icon.png'),
    type: 'legs',
    rarity: 'common',
  },
};

// Обувь
export const FOOTWEAR_ITEM_ICONS = {
  // Обычные предметы
  equip_footwear_common: {
    icon: null, // require('../../assets/sprites/icons/equipment/footwear_common_icon.png'),
    type: 'footwear',
    rarity: 'common',
  },
  // Редкие предметы - новая кожаная обувь
  leather_armor_footwear1: {
    icon: require('../../assets/sprites/icons/equipment/farmer_footwear_icon.png'),
    type: 'footwear',
    rarity: 'rare',
  },
  // Эпические предметы - новая кожаная обувь
  leather_armor_footwear2: {
    icon: require('../../assets/sprites/icons/equipment/farmer_footwear_icon.png'),
    type: 'footwear',
    rarity: 'epic',
  },
  // Легендарные предметы - новая кожаная обувь
  leather_armor_footwear3: {
    icon: require('../../assets/sprites/icons/equipment/farmer_footwear_icon.png'),
    type: 'footwear',
    rarity: 'legendary',
  },
  // Наборы
  farmer_set_footwear: {
    icon:  require("../../assets/sprites/icons/equipment/farmer_footwear_icon.png"), // require('../../assets/sprites/icons/equipment/farmer_footwear_icon.png'),
    type: 'footwear',
    rarity: 'common',
  },
};

// Оружие
export const WEAPON_ITEM_ICONS = {
  // Обычные предметы
  wooden_bow: {
    icon: require("../../assets/sprites/icons/equipment/wooden_bow_icon.png"), // require('../../assets/sprites/icons/equipment/wooden_bow_icon.png'),
    type: 'weapon',
    rarity: 'common',
  },
  spear: {
    icon: require("../../assets/sprites/icons/equipment/spear_icon.png"), // require('../../assets/sprites/icons/equipment/spear_icon.png'),
    type: 'weapon',
    rarity: 'common',
  },
  // Эпические предметы
  magic_staff: {
    icon: require("../../assets/sprites/icons/equipment/staff_icon.png"), // require('../../assets/sprites/icons/equipment/weapon_epic_icon.png'),
    type: 'weapon',
    rarity: 'epic',
  },
  // Легендарные предметы
  pole: {
    icon: require("../../assets/sprites/icons/equipment/pole_icon.png"), // require('../../assets/sprites/icons/equipment/weapon_legendary_icon.png'),
    type: 'weapon',
    rarity: 'legendary',
  },
  // Наборы
  farmer_set_weapon: {
    icon: require("../../assets/sprites/icons/equipment/pitchfork_icon.png"), // require('../../assets/sprites/icons/equipment/farmer_weapon_icon.png'),
    type: 'weapon',
    rarity: 'common',
  },
};

// Временные иконки для предметов (пока не созданы реальные спрайты)
// Используем типовые иконки для каждого типа снаряжения
export const DEFAULT_ITEM_ICONS = {
  head: null,
  body: null,
  legs: null,
  footwear: null,
  weapon: null,
};

// Получить все спрайты иконок в одном объекте
export const ALL_ITEM_ICONS = {
  ...HEAD_ITEM_ICONS,
  ...BODY_ITEM_ICONS,
  ...LEGS_ITEM_ICONS,
  ...FOOTWEAR_ITEM_ICONS,
  ...WEAPON_ITEM_ICONS
};

// Функция для получения иконки предмета по ID
export const getItemIcon = (itemId) => {
  // Проверяем, есть ли у нас специальная иконка для этого предмета
  if (ALL_ITEM_ICONS[itemId] && ALL_ITEM_ICONS[itemId].icon) {
    return ALL_ITEM_ICONS[itemId].icon;
  }
  
  // Если специальной иконки нет, но есть запись о предмете
  if (ALL_ITEM_ICONS[itemId]) {
    const type = ALL_ITEM_ICONS[itemId].type;
    // Используем типовую иконку для данного типа предмета
    return DEFAULT_ITEM_ICONS[type];
  }
  
  // Если ничего не нашли, возвращаем null
  return null;
};