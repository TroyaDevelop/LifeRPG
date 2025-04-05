export class UserProfile {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.username = data.username || 'Игрок';
    this.level = data.level || 1;
    this.experience = data.experience || 0;
    this.experienceToNextLevel = UserProfile.getExperienceForNextLevel(this.level);
    
    // Добавляем здоровье и энергию
    this.health = data.health !== undefined ? data.health : 100;
    this.maxHealth = data.maxHealth || 100;
    this.energy = data.energy !== undefined ? data.energy : 100;
    this.maxEnergy = data.maxEnergy || 100;
    
    this.tasksCompleted = data.tasksCompleted || 0;
    this.totalExperienceGained = data.totalExperienceGained || 0;
    this.streakDays = data.streakDays || 0;
    this.lastActive = data.lastActive || new Date().toISOString();
    this.lastEnergyRefill = data.lastEnergyRefill || new Date().toISOString();
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.settings = data.settings || {
      autoDeleteCompletedTasks: false,
      reminderEnabled: true,
    };
  }

  // Метод для обновления здоровья
  updateHealth(delta) {
    this.health = Math.max(0, Math.min(this.maxHealth, this.health + delta));
    this.updatedAt = new Date().toISOString();
    return this.health;
  }

  // Метод для обновления энергии
  updateEnergy(delta) {
    this.energy = Math.max(0, Math.min(this.maxEnergy, this.energy + delta));
    this.updatedAt = new Date().toISOString();
    return this.energy;
  }

  // Восстановление полной энергии
  restoreFullEnergy() {
    this.energy = this.maxEnergy;
    this.lastEnergyRefill = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
    return this.energy;
  }

  // Исправить метод addExperience
  addExperience(amount) {
    // Если отрицательное значение (отмена опыта), применяем в любом случае
    if (amount < 0) {
      this.experience = Math.max(0, this.experience + amount);
      this.updatedAt = new Date().toISOString();
      return null;
    }
    
    // Добавляем опыт
    this.experience += amount;
    this.totalExperienceGained += amount;
    this.updatedAt = new Date().toISOString();
    
    // Получаем правильные значения опыта для текущего и следующего уровня
    const currentLevelExp = UserProfile.getExperienceForNextLevel(this.level - 1) || 0;
    const nextLevelExp = UserProfile.getExperienceForNextLevel(this.level);
    
    console.log(`Уровень: ${this.level}, Опыт: ${this.experience}, Текущий уровень требует: ${currentLevelExp}, Следующий уровень требует: ${nextLevelExp}`);
    
    // Проверяем, достаточно ли опыта для перехода на следующий уровень
    if (this.experience >= nextLevelExp) {
      // Повышаем уровень
      this.level += 1;
      
      // Обновляем experienceToNextLevel для нового уровня
      this.experienceToNextLevel = UserProfile.getExperienceForNextLevel(this.level);
      
      // Бонусы при повышении уровня
      const bonuses = [];
      
      // При каждых 5 уровнях увеличиваем максимальные здоровье и энергию
      if (this.level % 5 === 0) {
        this.maxHealth += 10;
        this.maxEnergy += 10;
        this.health = this.maxHealth; // Полное восстановление здоровья
        this.energy = this.maxEnergy; // Полное восстановление энергии
        
        bonuses.push({
          id: 'health_energy_boost',
          name: 'Увеличение ресурсов',
          description: 'Максимальное здоровье и энергия увеличены на 10'
        });
      }
      
      return {
        level: this.level,
        bonuses
      };
    }
    
    return null;
  }

  // Добавляем новый метод для вычисления опыта до следующего уровня
  calculateExperienceToNextLevel() {
    const currentLevelExp = UserProfile.getExperienceForNextLevel(this.level - 1) || 0;
    const nextLevelExp = UserProfile.getExperienceForNextLevel(this.level);
    this.experienceToNextLevel = nextLevelExp;
    return nextLevelExp - currentLevelExp;
  }

  // Исправить статический метод getExperienceForNextLevel
  static getExperienceForNextLevel(level) {
    // Уровень 0 возвращает 0 опыта (начальная точка)
    if (level <= 0) return 0;
  
    // Формула для расчета опыта:
    // 1 уровень: 100
    // 2 уровень: 150
    // 3 уровень: 225
    // и т.д.
    return Math.round(100 * Math.pow(1.5, level - 1));
  }
  
  getLevelProgress() {
    // Получаем опыт для начала текущего уровня
    const currentLevelExp = UserProfile.getExperienceForNextLevel(this.level - 1) || 0;
    
    // Получаем опыт для следующего уровня
    const nextLevelExp = UserProfile.getExperienceForNextLevel(this.level);
    
    // Вычисляем разницу - сколько нужно набрать для нового уровня
    const levelExpNeeded = nextLevelExp - currentLevelExp;
    
    // Вычисляем, сколько опыта набрано в рамках текущего уровня
    const currentExp = this.experience - currentLevelExp;
    
    console.log(`Прогресс уровня: Опыт ${this.experience}, Для текущего уровня: ${currentLevelExp}, Для следующего: ${nextLevelExp}, Прогресс: ${currentExp}/${levelExpNeeded}`);
    
    // Проверка на возможные ошибки
    if (levelExpNeeded <= 0) return 0;
    
    // Вычисляем процент прогресса и ограничиваем его значениями 0-100
    const progress = Math.min(100, Math.max(0, Math.floor((currentExp / levelExpNeeded) * 100)));
    
    return progress;
  }
  
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      level: this.level,
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel,
      health: this.health,
      maxHealth: this.maxHealth,
      energy: this.energy,
      maxEnergy: this.maxEnergy,
      tasksCompleted: this.tasksCompleted,
      totalExperienceGained: this.totalExperienceGained,
      streakDays: this.streakDays,
      lastActive: this.lastActive,
      lastEnergyRefill: this.lastEnergyRefill,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      settings: this.settings
    };
  }
  
  static fromJSON(data) {
    return new UserProfile(data);
  }
}
