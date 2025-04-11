class AchievementModel {
  constructor(params = {}) {
    // Основные свойства
    this.id = params.id || '';
    this.title = params.title || params.name || '';
    this.description = params.description || '';
    this.type = params.type || '';
    this.rarity = params.rarity || 'common';
    this.icon = params.icon || 'trophy-outline';
    
    // Условия и прогресс
    this.condition = params.condition || {};
    this.progressTarget = params.progressTarget || params.condition?.value || 1;
    this.progress = params.progress || 0;
    
    // Статус
    this.unlocked = params.unlocked || false;
    this.viewed = params.viewed || false;
    this.unlockedAt = params.unlockedAt || null;
    this.hidden = params.hidden || false;
    
    // Категория
    this.category = params.category || 'general';
    
    // Награды (обновляем структуру наград)
    this.rewards = {
      experience: params.rewards?.experience || 0,
      actus: params.rewards?.actus || params.rewards?.coins || 0, // Совместимость с существующим кодом
      taskCoins: params.rewards?.taskCoins || 0
    };
  }
  
  // Получение метки редкости (доступное для вызова как метод)
  getRarityLabel() {
    return this.rarityName;
  }

  // Получение цвета в зависимости от редкости (доступное как свойство)
  get rarityColor() {
    switch(this.rarity) {
      case 'common':
        return '#8E8E93'; // серый
      case 'uncommon':
        return '#4CD964'; // зеленый
      case 'rare':
        return '#007AFF'; // синий
      case 'epic':
        return '#AF52DE'; // фиолетовый
      case 'legendary':
        return '#FF9500'; // оранжевый
      default:
        return '#8E8E93';
    }
  }

  // Получение названия редкости на русском (доступное как свойство)
  get rarityName() {
    switch(this.rarity) {
      case 'common':
        return 'Обычное';
      case 'uncommon':
        return 'Необычное';
      case 'rare':
        return 'Редкое';
      case 'epic':
        return 'Эпическое';
      case 'legendary':
        return 'Легендарное';
      default:
        return 'Обычное';
    }
  }
  
  // Обновление прогресса достижения
  updateProgress(value) {
    // Если уже разблокировано, возвращаем false
    if (this.unlocked) {
      return false;
    }

    let targetValue = 0;
    let shouldUpdate = false;

    // Обработка разных типов условий
    if (this.condition.type === 'taskCompleted') {
      targetValue = this.condition.value;
      // Устанавливаем прогресс равным переданному значению (количеству выполненных задач)
      this.progress = value;
      shouldUpdate = true;
    } else if (this.condition.type === 'streak') {
      targetValue = this.condition.days;
      // Устанавливаем прогресс равным значению (для полос)
      this.progress = value; 
      shouldUpdate = true;
    } else {
      // Для остальных типов достижений просто устанавливаем значение
      targetValue = this.progressTarget;
      this.progress = value;
      shouldUpdate = true;
    }

    // Обновляем статус разблокировки
    if (shouldUpdate && this.progress >= targetValue) {
      this.unlocked = true;
      this.unlockedAt = new Date().toISOString();
    }

    return shouldUpdate;
  }

  // Статический метод для создания предопределенных достижений
  static createPredefinedAchievements() {
    return [
      // Общие достижения
      new AchievementModel({
        id: 'first_steps',
        title: 'Первые шаги',
        description: 'Выполните вашу первую задачу',
        icon: 'checkmark-circle-outline',
        category: 'tasks',
        rarity: 'common',
        progressTarget: 1,
        rewards: { experience: 10, actus: 5 },
        condition: { type: 'taskCompleted', value: 1 }
      }),
      new AchievementModel({
        id: 'tasks_master',
        title: 'Мастер задач',
        description: 'Выполните 50 задач',
        icon: 'ribbon-outline',
        category: 'tasks',
        rarity: 'epic',
        progressTarget: 50,
        rewards: { experience: 100, actus: 15, taskCoins: 1 },
        condition: { type: 'taskCompleted', value: 50 }
      }),
      new AchievementModel({
        id: 'productivity_legend',
        title: 'Легенда продуктивности',
        description: 'Выполните 100 задач',
        icon: 'trophy-outline',
        category: 'tasks',
        rarity: 'legendary',
        progressTarget: 100,
        rewards: { experience: 200, actus: 30, taskCoins: 3 },
        condition: { type: 'taskCompleted', value: 100 }
      }),
      new AchievementModel({
        id: 'night_owl',
        title: 'Ночная сова',
        description: 'Выполните 10 задач между 22:00 и 5:00',
        icon: 'moon-outline',
        rarity: 'rare',
        condition: { type: 'timeOfDay', timeRange: 'night', count: 10 },
        progressTarget: 10,
        rewards: { experience: 100, actus: 20, taskCoins: 1 },
        category: 'tasks',
        hidden: false
      }),
      new AchievementModel({
        id: 'early_bird',
        title: 'Ранняя пташка',
        description: 'Выполните 10 задач между 5:00 и 9:00',
        icon: 'sunny-outline',
        rarity: 'rare',
        condition: { type: 'timeOfDay', timeRange: 'morning', count: 10 },
        progressTarget: 10,
        rewards: { experience: 100, actus: 20, taskCoins: 1 },
        category: 'tasks',
        hidden: false
      }),
      

      // Достижения по сериям
      new AchievementModel({
        id: 'streak_week',
        title: 'Недельный марафон',
        description: 'Выполняйте хотя бы одну задачу в день в течение 7 дней подряд',
        icon: 'calendar-outline',
        rarity: 'uncommon',
        condition: { type: 'streak', days: 7 },
        progressTarget: 7,
        rewards: { experience: 100, actus: 30, taskCoins: 1 },
        category: 'streaks'
      }),
      new AchievementModel({
        id: 'streak_month',
        title: 'Ежедневный герой',
        description: 'Выполняйте хотя бы одну задачу в день в течение 30 дней подряд',
        icon: 'calendar-outline',
        rarity: 'epic',
        condition: { type: 'streak', days: 30 },
        progressTarget: 30,
        rewards: { experience: 300, actus: 100, taskCoins: 5 },
        category: 'streaks'
      }),

      // Достижения по категориям задач
      new AchievementModel({
        id: 'category_master',
        title: 'Организатор',
        description: 'Создайте 5 разных категорий задач',
        icon: 'pricetags-outline',
        rarity: 'uncommon',
        condition: { type: 'categories', count: 5 },
        progressTarget: 5,
        rewards: { experience: 10, actus: 5},
        category: 'organization'
      }),
      
      // Достижения по приоритетам
      new AchievementModel({
        id: 'priority_master',
        title: 'Стратег',
        description: 'Выполните 20 задач с высоким приоритетом',
        icon: 'flame-outline',
        rarity: 'rare',
        condition: { type: 'priority', priority: 'high', count: 20 },
        progressTarget: 20,
        rewards: { experience: 100, actus: 20, taskCoins: 1 },
        category: 'priorities'
      }),
      
      // Достижения по уровню
      new AchievementModel({
        id: 'level_5',
        title: 'Начинающий',
        description: 'Достигните 5 уровня',
        icon: 'person-outline',
        rarity: 'common',
        condition: { type: 'level', level: 5 },
        progressTarget: 5,
        rewards: { experience: 0, actus: 20, taskCoins: 1 },
        category: 'levels'
      }),
      new AchievementModel({
        id: 'level_10',
        title: 'Опытный',
        description: 'Достигните 10 уровня',
        icon: 'person-outline',
        rarity: 'uncommon',
        condition: { type: 'level', level: 10 },
        progressTarget: 10,
        rewards: { experience: 0, actus: 50, taskCoins: 2 },
        category: 'levels'
      }),
      new AchievementModel({
        id: 'level_20',
        title: 'Эксперт',
        description: 'Достигните 20 уровня',
        icon: 'person-outline',
        rarity: 'epic',
        condition: { type: 'level', level: 20 },
        progressTarget: 20,
        rewards: { experience: 0, actus: 100, taskCoins: 5 },
        category: 'levels'
      }),
      new AchievementModel({
        id: 'level_50',
        title: 'Мастер жизни',
        description: 'Достигните 50 уровня',
        icon: 'person-outline',
        rarity: 'legendary',
        condition: { type: 'level', level: 50 },
        progressTarget: 50,
        rewards: { experience: 0, actus: 250, taskCoins: 10 },
        category: 'levels'
      }),
    ];
  }
}

// Не забудьте экспортировать класс
export { AchievementModel };