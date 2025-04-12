/**
 * Тестовые данные для снаряжения
 */
export const sampleEquipment = [
  // Набор обычного снаряжения
  {
    id: 'equip_head_common',
    name: 'Шляпа искателя приключений',
    type: 'head',
    description: 'Простая шляпа, защищающая от солнца.',
    rarity: 'common',
    stats: {
      intelligence: 1,
      charisma: 1
    },
    price: 3,
    level: 1
  },
  {
    id: 'equip_body_common',
    name: 'Льняная рубашка',
    type: 'body',
    description: 'Обычная рубашка из льняной ткани.',
    rarity: 'common',
    stats: {
      endurance: 1,
      charisma: 1
    },
    price: 5,
    level: 1
  },
  {
    id: 'equip_legs_common',
    name: 'Штаны путешественника',
    type: 'legs',
    description: 'Прочные штаны для длительных походов.',
    rarity: 'common',
    stats: {
      endurance: 2
    },
    price: 5,
    level: 1
  },
  {
    id: 'equip_footwear_common',
    name: 'Кожаные ботинки',
    type: 'footwear',
    description: 'Удобные ботинки для долгих путешествий.',
    rarity: 'common',
    stats: {
      endurance: 1,
      speed: 1
    },
    price: 100,
    level: 1
  },
  {
    id: 'equip_weapon_common',
    name: 'Учебный меч',
    type: 'weapon',
    description: 'Деревянный меч для тренировок.',
    rarity: 'common',
    stats: {
      strength: 2
    },
    price: 80,
    level: 1
  },
  
  // Набор редкого снаряжения
  {
    id: 'equip_head_rare',
    name: 'Зачарованный капюшон',
    type: 'head',
    description: 'Капюшон, наполненный магией для усиления концентрации.',
    rarity: 'rare',
    stats: {
      intelligence: 3,
      wisdom: 2
    },
    price: 350,
    level: 5
  },
  {
    id: 'equip_body_rare',
    name: 'Кольчуга стражника',
    type: 'body',
    description: 'Прочная и надежная кольчуга из качественной стали.',
    rarity: 'rare',
    stats: {
      defense: 5,
      endurance: 2
    },
    price: 500,
    level: 5,
    set: 'Стражник'
  },
  {
    id: 'equip_legs_rare',
    name: 'Штаны стражника',
    type: 'legs',
    description: 'Прочные штаны с кожаными вставками для дополнительной защиты.',
    rarity: 'rare',
    stats: {
      defense: 3,
      endurance: 2
    },
    price: 400,
    level: 5,
    set: 'Стражник'
  },
  {
    id: 'equip_footwear_rare',
    name: 'Сапоги скорохода',
    type: 'footwear',
    description: 'Легкие сапоги, которые даруют своему владельцу необычайную скорость.',
    rarity: 'rare',
    stats: {
      speed: 5,
      agility: 3
    },
    price: 450,
    level: 5
  },
  {
    id: 'equip_weapon_rare',
    name: 'Стальной меч',
    type: 'weapon',
    description: 'Хорошо сбалансированный меч из высококачественной стали.',
    rarity: 'rare',
    stats: {
      strength: 4,
      speed: 1
    },
    price: 550,
    level: 5
  },
  
  // Набор эпического снаряжения
  {
    id: 'equip_head_epic',
    name: 'Корона знаний',
    type: 'head',
    description: 'Древняя корона, наполненная мудростью поколений.',
    rarity: 'epic',
    stats: {
      intelligence: 6,
      wisdom: 4,
      charisma: 2
    },
    price: 1200,
    level: 10,
    set: 'Мудрец'
  },
  {
    id: 'equip_body_epic',
    name: 'Мантия архимага',
    type: 'body',
    description: 'Мантия, сотканная из нитей, пропитанных магией.',
    rarity: 'epic',
    stats: {
      intelligence: 5,
      wisdom: 3,
      magic: 4
    },
    price: 1500,
    level: 10,
    set: 'Мудрец'
  },
  {
    id: 'equip_legs_epic',
    name: 'Штаны рыцаря',
    type: 'legs',
    description: 'Закаленные в битвах латные поножи.',
    rarity: 'epic',
    stats: {
      defense: 7,
      endurance: 4
    },
    price: 1300,
    level: 10
  },
  {
    id: 'equip_footwear_epic',
    name: 'Сапоги семи лиг',
    type: 'footwear',
    description: 'Легендарные сапоги, позволяющие преодолевать огромные расстояния.',
    rarity: 'epic',
    stats: {
      speed: 8,
      agility: 5,
      endurance: 3
    },
    price: 1400,
    level: 10
  },
  {
    id: 'equip_weapon_epic',
    name: 'Рунный клинок',
    type: 'weapon',
    description: 'Древний меч с высеченными на лезвии рунами силы.',
    rarity: 'epic',
    stats: {
      strength: 7,
      magic: 5
    },
    price: 1600,
    level: 10
  },
  
  // Набор легендарного снаряжения
  {
    id: 'equip_head_legendary',
    name: 'Корона повелителя задач',
    type: 'head',
    description: 'Мифическая корона, дарующая своему владельцу невероятную продуктивность.',
    rarity: 'legendary',
    stats: {
      intelligence: 10,
      wisdom: 8,
      charisma: 5,
      productivity: 15
    },
    price: 3000,
    level: 20
  },
  {
    id: 'equip_body_legendary',
    name: 'Доспех героя',
    type: 'body',
    description: 'Легендарный доспех, выкованный из материала, добытого с упавшей звезды.',
    rarity: 'legendary',
    stats: {
      defense: 12,
      strength: 8,
      endurance: 10
    },
    price: 3500,
    level: 20,
    set: 'Герой'
  },
  {
    id: 'equip_legs_legendary',
    name: 'Поножи героя',
    type: 'legs',
    description: 'Часть легендарного комплекта, дарует невероятную выносливость.',
    rarity: 'legendary',
    stats: {
      defense: 10,
      endurance: 12,
      speed: 5
    },
    price: 3200,
    level: 20,
    set: 'Герой'
  },
  {
    id: 'equip_footwear_legendary',
    name: 'Сапоги героя',
    type: 'footwear',
    description: 'Завершающая часть комплекта героя, позволяет двигаться молниеносно.',
    rarity: 'legendary',
    stats: {
      speed: 15,
      agility: 12,
      endurance: 8
    },
    price: 3100,
    level: 20,
    set: 'Герой'
  },
  {
    id: 'equip_weapon_legendary',
    name: 'Экскалибур',
    type: 'weapon',
    description: 'Легендарный меч короля Артура. Как он оказался в вашем приложении - загадка.',
    rarity: 'legendary',
    stats: {
      strength: 15,
      magic: 10,
      charisma: 8
    },
    price: 5000,
    level: 20,
    set: 'Герой'
  }
];