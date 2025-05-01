import { BOSS_SPRITES } from '../constants/BossSprites';

// Данные о боссах
export const BOSSES_DATA = {
  // Стандартные боссы (уровень 1-3)
  standard: [
    {
      id: 'laziness',
      name: 'Лень',
      description: 'Древний демон, питающийся человеческой прокрастинацией. Победите его, выполняя задачи вовремя!',
      maxHealth: 1000,
      level: 1,
      imageKey: 'LAZINESS',
      rarity: 'common',
      duration: 5, // Длительность в днях
      rewards: {
        experience: 150,
        gold: 75,
        possibleEquipment: ['common', 'uncommon'], // Возможная редкость выпадающего снаряжения
      },
      type: 'standard',
      effects: [], // Особые эффекты босса
    },
    {
      id: 'chaos',
      name: 'Хаос',
      description: 'Воплощение беспорядка и неорганизованности. Справьтесь с ним, поддерживая дисциплину и порядок!',
      maxHealth: 1500,
      level: 2,
      imageKey: 'CHAOS',
      rarity: 'uncommon',
      duration: 6,
      rewards: {
        experience: 200,
        gold: 100,
        possibleEquipment: ['common', 'uncommon', 'rare'],
      },
      type: 'standard',
      effects: [
        {
          type: 'damageReduction',
          value: 10, // Снижает урон игрока на 10%
          description: 'Хаотическая аура: снижает урон от выполнения задач на 10%'
        }
      ],
    },
    {
      id: 'distraction',
      name: 'Отвлечение',
      description: 'Монстр, крадущий ваше внимание и фокус. Сосредоточьтесь на своих задачах, чтобы победить его!',
      maxHealth: 2000,
      level: 3,
      imageKey: 'DISTRACTION',
      rarity: 'rare',
      duration: 7,
      rewards: {
        experience: 250,
        gold: 125,
        possibleEquipment: ['uncommon', 'rare'],
      },
      type: 'standard',
      effects: [
        {
          type: 'damageReduction',
          value: 15, // Снижает урон игрока на 15%
          description: 'Рассеянность: снижает урон от выполнения задач на 15%'
        }
      ],
    },
  ],
  
  // Эпические боссы (уровень 4-6)
  epic: [
    {
      id: 'time_eater',
      name: 'Пожиратель Времени',
      description: 'Древнее существо, питающееся потраченным впустую временем. Каждая минута промедления делает его сильнее!',
      maxHealth: 3000,
      level: 4,
      imageKey: 'TIME_EATER',
      rarity: 'epic',
      duration: 10,
      rewards: {
        experience: 400,
        gold: 200,
        possibleEquipment: ['rare', 'epic'],
        guaranteedEquipment: true, // Гарантированное снаряжение
      },
      type: 'epic',
      effects: [
        {
          type: 'damageReduction',
          value: 20, // Снижает урон игрока на 20%
          description: 'Искажение времени: снижает урон от выполнения задач на 20%'
        },
        {
          type: 'healthRegen',
          value: 2, // Восстанавливает 2% максимального здоровья в день
          description: 'Временной поток: восстанавливает 2% здоровья каждый день'
        }
      ],
    },
    {
      id: 'burnout',
      name: 'Выгорание',
      description: 'Опасный демон, высасывающий из людей энергию и энтузиазм. Чем дольше он присутствует, тем сложнее ему противостоять.',
      maxHealth: 4000,
      level: 5,
      imageKey: 'BURNOUT',
      rarity: 'epic',
      duration: 12,
      rewards: {
        experience: 500,
        gold: 250,
        possibleEquipment: ['rare', 'epic'],
        guaranteedEquipment: true,
      },
      type: 'epic',
      effects: [
        {
          type: 'increasingResistance',
          startValue: 10, // Начинает с 10% сопротивления урону
          maxValue: 50,   // Максимум 50% сопротивления
          increment: 5,   // Увеличивается на 5% в день
          description: 'Нарастающее истощение: каждый день увеличивает сопротивление урону на 5% (максимум 50%)'
        }
      ],
    },
  ],
  
  // Легендарные боссы (уровень 7+)
  legendary: [
    {
      id: 'procrastination_lord',
      name: 'Повелитель Прокрастинации',
      description: 'Верховный лорд всех демонов, мешающих продуктивности. Непобедимый для слабых духом, но уязвимый для настоящей дисциплины.',
      maxHealth: 10000,
      level: 10,
      imageKey: 'PROCRASTINATION_LORD',
      rarity: 'legendary',
      duration: 15,
      rewards: {
        experience: 1000,
        gold: 500,
        possibleEquipment: ['epic', 'legendary'],
        guaranteedEquipment: true,
        taskCoins: 10, // Награда в виде монет задач
      },
      type: 'legendary',
      effects: [
        {
          type: 'damageReduction',
          value: 25, // Снижает урон игрока на 25%
          description: 'Аура промедления: снижает урон от выполнения задач на 25%'
        },
        {
          type: 'healthRegen',
          value: 3, // Восстанавливает 3% максимального здоровья в день
          description: 'Восстановление сил: восстанавливает 3% здоровья каждый день'
        },
        {
          type: 'criticalResistance',
          value: 50, // Снижает шанс критического удара на 50%
          description: 'Защита от рывков: снижает вероятность критического удара на 50%'
        }
      ],
    },
  ]
};

// Получение всех доступных боссов в виде плоского массива
export const getAllBosses = () => {
  return [
    ...BOSSES_DATA.standard,
    ...BOSSES_DATA.epic,
    ...BOSSES_DATA.legendary
  ];
};

// Получение босса по ID
export const getBossById = (id) => {
  return getAllBosses().find(boss => boss.id === id);
};

// Получение случайного босса определенной редкости
export const getRandomBoss = (rarity = 'common') => {
  let possibleBosses = [];
  
  switch(rarity) {
    case 'common':
      possibleBosses = [...BOSSES_DATA.standard];
      break;
    case 'uncommon':
    case 'rare':
      possibleBosses = [...BOSSES_DATA.standard, ...BOSSES_DATA.epic];
      break;
    case 'epic':
      possibleBosses = [...BOSSES_DATA.epic];
      break;
    case 'legendary':
      possibleBosses = [...BOSSES_DATA.legendary];
      break;
    default:
      possibleBosses = getAllBosses();
  }
  
  if (possibleBosses.length === 0) {
    return null;
  }
  
  const randomIndex = Math.floor(Math.random() * possibleBosses.length);
  return possibleBosses[randomIndex];
};

export default BOSSES_DATA;