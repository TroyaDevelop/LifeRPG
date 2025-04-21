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
    price: 1,
    level: 1,
    set: 'Фермер'
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
    price: 1,
    level: 1,
    set: 'Фермер'
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
    price: 1,
    level: 1,
    set: 'Фермер'
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
    price: 1,
    level: 1,
    set: 'Фермер'
  },

  {
    id: 'farmer_set_weapon',
    name: 'Фермерские вилы',
    type: 'weapon',
    description: 'Ведьмаки их боятся.',
    rarity: 'common',
    stats: {
      strength: 7,
      intelligence: 5
    },
    price: 1,
    level: 1,
    set: 'Фермер'
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
  
  {
    id: 'leather_armor_body1',
    name: 'Проклепанный кожаный доспех',
    type: 'body',
    description: 'Прочная и надежная кольчуга из качественной стали.',
    rarity: 'rare',
    stats: {
      strength: 5,
      willpower: 2
    },
    price: 1,
    level: 1,
  },
  {
    id: 'leather_armor_legs1',
    name: 'Проклепанные кожаные штаны',
    type: 'legs',
    description: 'Прочные штаны с кожаными вставками для дополнительной защиты.',
    rarity: 'rare',
    stats: {
      strength: 3,
      willpower: 2
    },
    price: 1,
    level: 1,
    set: 'Стражник'
  },
  {
    id: 'leather_armor_footwear1',
    name: 'Проклепанные кожаные ботинки',
    type: 'footwear',
    description: 'Легкие сапоги, которые даруют своему владельцу необычайную скорость.',
    rarity: 'rare',
    stats: {
      agility: 5,
      luck: 3
    },
    price: 1,
    level: 1
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
  
  {
    id: 'leather_armor_body2',
    name: 'Кожаный доспех',
    type: 'body',
    description: 'Мантия, сотканная из нитей, пропитанных магией.',
    rarity: 'epic',
    stats: {
      intelligence: 5,
      willpower: 3,
      luck: 4
    },
    price: 1,
    level: 1,
    set: 'Мудрец'
  },
  {
    id: 'leather_armor_legs2',
    name: 'Кожаные штаны',
    type: 'legs',
    description: 'Закаленные в битвах латные поножи.',
    rarity: 'epic',
    stats: {
      strength: 7,
      willpower: 4
    },
    price: 1,
    level: 1
  },
  {
    id: 'leather_armor_footwear2',
    name: 'Кожаные ботинки',
    type: 'footwear',
    description: 'Легендарные сапоги, позволяющие преодолевать огромные расстояния.',
    rarity: 'epic',
    stats: {
      agility: 8,
      luck: 5,
      strength: 3
    },
    price: 1,
    level: 1
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
    price: 1,
    level: 1
  },
  {
    id: 'leather_armor_body3',
    name: 'Доспех героя',
    type: 'body',
    description: 'Легендарный доспех, выкованный из материала, добытого с упавшей звезды.',
    rarity: 'legendary',
    stats: {
      strength: 12,
      willpower: 8,
      agility: 10
    },
    price: 1,
    level: 1,
    set: 'Герой'
  },
  {
    id: 'leather_armor_legs3',
    name: 'Поножи героя',
    type: 'legs',
    description: 'Часть легендарного комплекта, дарует невероятную выносливость.',
    rarity: 'legendary',
    stats: {
      strength: 10,
      willpower: 12,
      agility: 5
    },
    price: 1,
    level: 1,
    set: 'Герой'
  },
  {
    id: 'leather_armor_footwear3',
    name: 'Качественные кожаные сапоги',
    type: 'footwear',
    description: 'Завершающая часть комплекта героя, позволяет двигаться молниеносно.',
    rarity: 'legendary',
    stats: {
      agility: 15,
      luck: 12,
      strength: 8
    },
    price: 1,
    level: 1,
    set: 'Герой'
  },
  {
    id: 'magic_staff',
    name: 'Посох мага',
    type: 'weapon',
    description: 'Легендарный меч короля Артура. Как он оказался в вашем приложении - загадка.',
    rarity: 'legendary',
    stats: {
      strength: 15,
      intelligence: 10,
      luck: 8
    },
    price: 1,
    level: 1,
  },

  {
    id: 'pole',
    name: 'Шест',
    type: 'weapon',
    description: 'Боевой шест, который может быть использован как для атаки, так и для защиты.',
    rarity: 'legendary',
    stats: {
      strength: 15,
      intelligence: 10,
      luck: 8
    },
    price: 1,
    level: 1,
  },

  // Предметы для призыва боссов
  {
    id: 'boss_summon_scroll_1',
    name: 'Свиток призыва (I)',
    type: 'consumable',
    subType: 'boss_summon',
    tier: 1,
    description: 'Призывает базового босса 1 уровня для борьбы с ним.',
    rarity: 'common',
    price: 1,
    level: 1,
    imageUrl: null,
    usable: true
  },
  {
    id: 'boss_summon_scroll_2',
    name: 'Свиток призыва (II)',
    type: 'consumable',
    subType: 'boss_summon',
    tier: 2,
    description: 'Призывает босса 2 уровня с повышенными характеристиками.',
    rarity: 'uncommon',
    price: 1,
    level: 1,
    imageUrl: null,
    usable: true
  },
  {
    id: 'boss_summon_scroll_3',
    name: 'Свиток призыва (III)',
    type: 'consumable',
    subType: 'boss_summon',
    tier: 3,
    description: 'Призывает мощного босса 3 уровня для настоящих испытаний.',
    rarity: 'rare',
    price: 1,
    level: 1,
    imageUrl: null,
    usable: true
  },
  
  // Также добавим зелья для восстановления ресурсов
  {
    id: 'minor_health_potion',
    name: 'Малое зелье здоровья',
    type: 'consumable',
    subType: 'health_potion',
    description: 'Восстанавливает 20 единиц здоровья.',
    rarity: 'common',
    price: 30,
    level: 1,
    healAmount: 20,
    imageUrl: null,
    usable: true
  },
  {
    id: 'minor_energy_potion',
    name: 'Малое зелье энергии',
    type: 'consumable',
    subType: 'energy_potion',
    description: 'Восстанавливает 15 единиц энергии.',
    rarity: 'common',
    price: 30,
    level: 1,
    energyAmount: 15,
    imageUrl: null,
    usable: true
  },
];