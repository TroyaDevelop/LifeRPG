export class UserProfile {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Искатель приключений';
    this.experience = data.experience || 0;
    this.level = data.level || 1;
    this.avatar = data.avatar || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    // Дополнительные данные для будущих функций
    this.totalTasksCompleted = data.totalTasksCompleted || 0;
    this.streakDays = data.streakDays || 0;
    this.lastActive = data.lastActive || new Date().toISOString();
    this.unlockedBonuses = data.unlockedBonuses || [];
  }

  // Метод для расчета опыта, необходимого для следующего уровня
  static getExperienceForNextLevel(level) {
    // Формула: для каждого следующего уровня требуется на 50 XP больше, чем для предыдущего
    // Расчет общего опыта для достижения указанного уровня
    // Уровень 1->2: 100 XP
    // Уровень 2->3: 100 + 150 = 250 XP
    // Уровень 3->4: 100 + 150 + 200 = 450 XP
    if (level <= 0) return 0;
    if (level === 1) return 100;
    
    // Формула суммы арифметической прогрессии: Sn = n/2 * (a1 + an)
    // Где n - количество уровней, a1 - начальное значение, an - последнее значение
    const firstLevelXP = 100;
    const nthLevelXP = firstLevelXP + (level - 1) * 50;
    const totalXP = level * (firstLevelXP + nthLevelXP) / 2;
    
    return totalXP;
  }

  // Метод для расчета текущего прогресса уровня (в процентах)
  getLevelProgress() {
    const currentLevelExp = UserProfile.getExperienceForNextLevel(this.level - 1) || 0;
    const nextLevelExp = UserProfile.getExperienceForNextLevel(this.level);
    const levelExpNeeded = nextLevelExp - currentLevelExp;
    const currentExp = this.experience - currentLevelExp;
    
    return Math.min(Math.floor((currentExp / levelExpNeeded) * 100), 100);
  }

  // Метод для добавления опыта и обновления уровня
  addExperience(expAmount) {
    this.experience += expAmount;
    this.updatedAt = new Date().toISOString();
    
    // Проверяем, нужно ли повысить уровень
    let didLevelUp = false;
    let newBonuses = [];
    
    while (this.experience >= UserProfile.getExperienceForNextLevel(this.level)) {
      this.level += 1;
      didLevelUp = true;
      
      // Проверяем, есть ли бонусы на этом уровне
      const bonus = UserProfile.getBonusForLevel(this.level);
      if (bonus && !this.unlockedBonuses.includes(bonus.id)) {
        this.unlockedBonuses.push(bonus.id);
        newBonuses.push(bonus);
      }
    }
    
    return {
      didLevelUp,
      newLevel: this.level,
      newBonuses
    };
  }

  // Метод для получения бонуса за определенный уровень
  static getBonusForLevel(level) {
    const bonuses = [
      { id: 'bonus_1', level: 5, name: 'Выносливость +1', description: 'Увеличена выносливость персонажа' },
      { id: 'bonus_2', level: 10, name: 'Особый предмет', description: 'Разблокирован доступ к особому предмету' },
      { id: 'bonus_3', level: 15, name: 'Дополнительный слот', description: 'Добавлен дополнительный слот для снаряжения' },
      { id: 'bonus_4', level: 20, name: 'Особая способность', description: 'Разблокирована особая способность персонажа' },
    ];
    
    return bonuses.find(bonus => bonus.level === level);
  }
}
