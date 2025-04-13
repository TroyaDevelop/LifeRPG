// Константы для спрайтов снаряжения, по аналогии с AvatarSprites.js

// Головные уборы
export const HEAD_EQUIPMENT = {
  // Обычные предметы
  equip_head_common: {
    // Временно используем farmer_set_head для всех типов, пока не созданы остальные спрайты
    sprite: require('../../assets/sprites/equipment/head/farmer_set_head.png'),
    name: 'Шляпа искателя приключений',
    rarity: 'common',
    description: 'Простая шляпа, защищающая от солнца.',
  },
  // Редкие предметы
  equip_head_rare: {
    sprite: require('../../assets/sprites/equipment/head/farmer_set_head.png'),
    name: 'Зачарованный капюшон',
    rarity: 'rare',
    description: 'Капюшон, наполненный магией для усиления концентрации.',
  },
  // Эпические предметы
  equip_head_epic: {
    sprite: require('../../assets/sprites/equipment/head/farmer_set_head.png'),
    name: 'Корона знаний',
    rarity: 'epic',
    description: 'Древняя корона, наполненная мудростью поколений.',
  },
  // Легендарные предметы
  equip_head_legendary: {
    sprite: require('../../assets/sprites/equipment/head/farmer_set_head.png'),
    name: 'Корона повелителя задач',
    rarity: 'legendary',
    description: 'Мифическая корона, дарующая своему владельцу невероятную продуктивность.',
  },
  // Наборы
  farmer_set_head: {
    sprite: require('../../assets/sprites/equipment/head/farmer_set_head.png'),
    name: 'Фермерская шляпа',
    rarity: 'common',
    description: 'Соломенная шляпа, защищающая от палящего солнца.',
    set: 'Фермер',
  },
};

// Верхняя одежда (тело)
export const BODY_EQUIPMENT = {
  // Обычные предметы
  equip_body_common: {
    sprite: require('../../assets/sprites/equipment/body/farmer_set_body.png'),
    name: 'Льняная рубашка',
    rarity: 'common',
    description: 'Обычная рубашка из льняной ткани.',
  },
  // Редкие предметы
  equip_body_rare: {
    sprite: require('../../assets/sprites/equipment/body/farmer_set_body.png'),
    name: 'Кольчуга стражника',
    rarity: 'rare',
    description: 'Прочная и надежная кольчуга из качественной стали.',
  },
  // Эпические предметы
  equip_body_epic: {
    sprite: require('../../assets/sprites/equipment/body/farmer_set_body.png'),
    name: 'Мантия архимага',
    rarity: 'epic',
    description: 'Мантия, сотканная из нитей, пропитанных магией.',
  },
  // Легендарные предметы
  equip_body_legendary: {
    sprite: require('../../assets/sprites/equipment/body/farmer_set_body.png'),
    name: 'Доспех героя',
    rarity: 'legendary',
    description: 'Легендарный доспех, выкованный из материала, добытого с упавшей звезды.',
  },
  // Наборы
  farmer_set_body: {
    sprite: require('../../assets/sprites/equipment/body/farmer_set_body.png'),
    name: 'Фермерская рубаха',
    rarity: 'common',
    description: 'Удобная и практичная одежда для работы в поле.',
    set: 'Фермер',
  },
};

// Штаны
export const LEGS_EQUIPMENT = {
  // Обычные предметы
  equip_legs_common: {
    sprite: require('../../assets/sprites/equipment/legs/farmer_set_legs.png'),
    name: 'Штаны путешественника',
    rarity: 'common',
    description: 'Прочные штаны для длительных походов.',
  },
  // Редкие предметы
  equip_legs_rare: {
    sprite: require('../../assets/sprites/equipment/legs/farmer_set_legs.png'),
    name: 'Штаны стражника',
    rarity: 'rare',
    description: 'Прочные штаны с кожаными вставками для дополнительной защиты.',
  },
  // Эпические предметы
  equip_legs_epic: {
    sprite: require('../../assets/sprites/equipment/legs/farmer_set_legs.png'),
    name: 'Штаны рыцаря',
    rarity: 'epic',
    description: 'Закаленные в битвах латные поножи.',
  },
  // Легендарные предметы
  equip_legs_legendary: {
    sprite: require('../../assets/sprites/equipment/legs/farmer_set_legs.png'),
    name: 'Поножи героя',
    rarity: 'legendary',
    description: 'Часть легендарного комплекта, дарует невероятную выносливость.',
  },
  // Наборы
  farmer_set_legs: {
    sprite: require('../../assets/sprites/equipment/legs/farmer_set_legs.png'),
    name: 'Фермерские штаны',
    rarity: 'common',
    description: 'Прочные и удобные штаны для полевых работ.',
    set: 'Фермер',
  },
};

// Обувь
export const FOOTWEAR_EQUIPMENT = {
  // Обычные предметы
  equip_footwear_common: {
    sprite: require('../../assets/sprites/equipment/footwear/farmer_set_footwear.png'),
    name: 'Кожаные ботинки',
    rarity: 'common',
    description: 'Удобные ботинки для долгих путешествий.',
  },
  // Редкие предметы
  equip_footwear_rare: {
    sprite: require('../../assets/sprites/equipment/footwear/farmer_set_footwear.png'),
    name: 'Сапоги скорохода',
    rarity: 'rare',
    description: 'Легкие сапоги, которые даруют своему владельцу необычайную скорость.',
  },
  // Эпические предметы
  equip_footwear_epic: {
    sprite: require('../../assets/sprites/equipment/footwear/farmer_set_footwear.png'),
    name: 'Сапоги семи лиг',
    rarity: 'epic',
    description: 'Легендарные сапоги, позволяющие преодолевать огромные расстояния.',
  },
  // Легендарные предметы
  equip_footwear_legendary: {
    sprite: require('../../assets/sprites/equipment/footwear/farmer_set_footwear.png'),
    name: 'Сапоги героя',
    rarity: 'legendary',
    description: 'Завершающая часть комплекта героя, позволяет двигаться молниеносно.',
  },
  // Наборы
  farmer_set_footwear: {
    sprite: require('../../assets/sprites/equipment/footwear/farmer_set_footwear.png'),
    name: 'Фермерские сапоги',
    rarity: 'common',
    description: 'Прочные и грязеустойчивые сапоги.',
    set: 'Фермер',
  },
};

// Оружие
export const WEAPON_EQUIPMENT = {
  // У вас нет файла для оружия, поэтому используем заглушку с одним из существующих спрайтов
  // Обычные предметы
  wooden_bow: {
    sprite: require("../../assets/sprites/equipment/weapons/wooden_bow.png"), // Временно нет изображения
    name: 'Деревянный лук',
    rarity: 'common',
    description: 'В умелых руках, выпущенная стрела попадёт в глаз и воробью.',
  },
  // Редкие предметы
  spear: {
    sprite: require("../../assets/sprites/equipment/weapons/spear.png"), // Временно нет изображения
    name: 'Копье',
    rarity: 'common',
    description: 'Хорошо сбалансированное копье из высококачественной стали.',
  },
  // Эпические предметы
  equip_weapon_epic: {
    sprite: null, // Временно нет изображения
    name: 'Рунный клинок',
    rarity: 'epic',
    description: 'Древний меч с высеченными на лезвии рунами силы.',
  },
  // Легендарные предметы
  equip_weapon_legendary: {
    sprite: null, // Временно нет изображения
    name: 'Экскалибур',
    rarity: 'legendary',
    description: 'Легендарный меч короля Артура. Как он оказался в вашем приложении - загадка.',
  },
  // Наборы
  farmer_set_weapon: {
    sprite: null, // Временно нет изображения
    name: 'Фермерские вилы',
    rarity: 'common',
    description: 'Полезный сельскохозяйственный инструмент.',
    set: 'Фермер',
  },
};

// Цвета для рарности предметов
export const RARITY_COLORS = {
  common: '#48BB78',    // Зеленый
  rare: '#4E64EE',      // Синий
  epic: '#9013FE',      // Фиолетовый
  legendary: '#FF8C00', // Оранжевый
};

// Сеты снаряжения
export const EQUIPMENT_SETS = {
  'Фермер': {
    name: 'Фермерский набор',
    description: 'Полный комплект фермерского снаряжения для работы в поле.',
    bonus: {
      willpower: 5,
      intelligence: 3,
      strength: 2
    },
    pieces: [
      'farmer_set_head',
      'farmer_set_body',
      'farmer_set_legs',
      'farmer_set_footwear',
      'farmer_set_weapon'
    ]
  },
  'Герой': {
    name: 'Комплект героя',
    description: 'Легендарный набор снаряжения, достойный величайших героев.',
    bonus: {
      strength: 10,
      intelligence: 10,
      willpower: 10,
      luck: 10,
      agility: 10
    },
    pieces: [
      'equip_head_legendary',
      'equip_body_legendary',
      'equip_legs_legendary',
      'equip_footwear_legendary',
      'equip_weapon_legendary'
    ]
  },
  'Мудрец': {
    name: 'Комплект мудреца',
    description: 'Набор для тех, кто стремится к знаниям и мудрости.',
    bonus: {
      intelligence: 15,
      willpower: 12
    },
    pieces: [
      'equip_head_epic',
      'equip_body_epic'
    ]
  },
  'Стражник': {
    name: 'Снаряжение стражника',
    description: 'Прочный комплект для защитников порядка.',
    bonus: {
      strength: 8,
      willpower: 5
    },
    pieces: [
      'equip_head_rare',
      'equip_body_rare',
      'equip_legs_rare'
    ]
  }
};

// Получить все спрайты снаряжения в одном объекте (для удобства использования)
export const ALL_EQUIPMENT_SPRITES = {
  ...HEAD_EQUIPMENT,
  ...BODY_EQUIPMENT,
  ...LEGS_EQUIPMENT,
  ...FOOTWEAR_EQUIPMENT,
  ...WEAPON_EQUIPMENT
};