/**
 * Тестовые данные для снаряжения
 */
export const sampleEquipment = [
  // Набор обычного снаряжения
  {
    id: 'farmer_set_head',
    name: 'Фермерская шляпа',
    type: 'head',
    description: 'Защищает от солнца.',
    rarity: 'common',
    stats: {
      intelligence: 1,
      willpower: 1
    },
    price: 3,
    level: 1
  },
  {
    id: 'farmer_set_body',
    name: 'Фермерская льняная рубашка',
    type: 'body',
    description: 'Обычная рубашка из льняной ткани.',
    rarity: 'common',
    stats: {
      strength: 1,
      willpower: 1
    },
    price: 5,
    level: 1
  },
  {
    id: 'farmer_set_legs',
    name: 'Фермерские штаны',
    type: 'legs',
    description: 'Просторные штаны для удобства работы в поле.',
    rarity: 'common',
    stats: {
      strength: 2
    },
    price: 5,
    level: 1
  },
  {
    id: 'farmer_set_footwear',
    name: 'Фермерские ботинки',
    type: 'footwear',
    description: 'Удобство превыше всего.',
    rarity: 'common',
    stats: {
      strength: 1,
      agility: 1
    },
    price: 100,
    level: 1
  },
  {
    id: 'wooden_bow',
    name: 'Деревянный лук',
    type: 'weapon',
    description: 'В умелых руках, выпущенная стрела попадёт в глаз и воробью.',
    rarity: 'common',
    stats: {
      strength: 2
    },
    price: 1,
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
      willpower: 2
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
      strength: 5,
      willpower: 2
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
      strength: 3,
      willpower: 2
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
      agility: 5,
      luck: 3
    },
    price: 450,
    level: 5
  },
  {
    id: 'spear',
    name: 'Копье',
    type: 'weapon',
    description: 'Хорошо сбалансированное копье из высококачественной стали.',
    rarity: 'common',
    stats: {
      strength: 4,
      agility: 1
    },
    price: 1,
    level: 1
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
      willpower: 4,
      luck: 2
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
      willpower: 3,
      luck: 4
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
      strength: 7,
      willpower: 4
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
      agility: 8,
      luck: 5,
      strength: 3
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
      intelligence: 5
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
      willpower: 8,
      luck: 5
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
      strength: 12,
      willpower: 8,
      agility: 10
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
      strength: 10,
      willpower: 12,
      agility: 5
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
      agility: 15,
      luck: 12,
      strength: 8
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
      intelligence: 10,
      luck: 8
    },
    price: 5000,
    level: 20,
    set: 'Герой'
  }
];