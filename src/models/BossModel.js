// filepath: c:\Users\Artem\LifeRPG\src\models\BossModel.js
export class BossModel {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Неизвестный босс';
    this.description = data.description || '';
    this.maxHealth = data.maxHealth || 1000;
    this.currentHealth = data.currentHealth !== undefined ? data.currentHealth : data.maxHealth;
    this.level = data.level || 1;
    this.imageUrl = data.imageUrl || null;
    
    // Награды за победу над боссом
    this.rewards = data.rewards || {
      experience: 100,
      gold: 50,
      items: [], // Массив объектов {id, quantity}
    };
    
    // Дата создания (призыва) босса
    this.createdAt = data.createdAt || new Date().toISOString();
    // Дата завершения (победы или исчезновения)
    this.completedAt = data.completedAt || null;
    // Статус босса (active, defeated, expired)
    this.status = data.status || 'active';
    
    // История урона по дням
    this.damageHistory = data.damageHistory || [];
    
    // Аккумулированный урон за текущий день (будет применен в полночь)
    this.accumulatedDamage = data.accumulatedDamage || 0;
    
    // Время жизни босса в днях (null - бессрочно)
    this.duration = data.duration || 7;
    
    // Тип босса для будущих механик
    this.type = data.type || 'standard';
  }

  // Применение накопленного урона
  applyAccumulatedDamage() {
    const today = new Date().toISOString().split('T')[0];
    const damage = this.accumulatedDamage;
    
    if (damage > 0) {
      // Добавляем запись в историю урона
      this.damageHistory.push({
        date: today,
        damage: damage,
      });
      
      // Применяем урон к здоровью
      this.currentHealth = Math.max(0, this.currentHealth - damage);
      
      // Сбрасываем накопленный урон
      this.accumulatedDamage = 0;
      
      // Проверяем, побежден ли босс
      if (this.currentHealth <= 0) {
        this.status = 'defeated';
        this.completedAt = new Date().toISOString();
      }
      
      return damage;
    }
    
    return 0;
  }

  // Накопление урона за выполнение задач
  addDamage(damage) {
    this.accumulatedDamage += damage;
    return this.accumulatedDamage;
  }
  
  // Проверка, активен ли босс
  isActive() {
    if (this.status !== 'active') return false;
    
    // Проверяем срок действия босса
    if (this.duration) {
      const createdDate = new Date(this.createdAt);
      const expiryDate = new Date(createdDate);
      expiryDate.setDate(expiryDate.getDate() + this.duration);
      
      if (new Date() > expiryDate) {
        this.status = 'expired';
        this.completedAt = new Date().toISOString();
        return false;
      }
    }
    
    return true;
  }
  
  // Расчет оставшихся дней жизни босса
  getRemainingDays() {
    if (!this.duration || this.status !== 'active') return 0;
    
    const createdDate = new Date(this.createdAt);
    const expiryDate = new Date(createdDate);
    expiryDate.setDate(expiryDate.getDate() + this.duration);
    
    const diffTime = expiryDate - new Date();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  }
  
  // Расчет процента оставшегося здоровья
  getHealthPercentage() {
    return Math.round((this.currentHealth / this.maxHealth) * 100);
  }

  // Метод для преобразования объекта босса в обычный объект
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      level: this.level,
      imageUrl: this.imageUrl,
      rewards: this.rewards,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      status: this.status,
      damageHistory: this.damageHistory,
      accumulatedDamage: this.accumulatedDamage,
      duration: this.duration,
      type: this.type,
    };
  }

  // Статический метод для создания экземпляра BossModel из обычного объекта
  static fromJSON(json) {
    return new BossModel(json);
  }
}

export default BossModel;