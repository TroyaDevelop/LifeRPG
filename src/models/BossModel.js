// filepath: c:\Users\Artem\LifeRPG\src\models\BossModel.js
import { BOSS_SPRITES } from '../constants/BossSprites';
import { getBossById } from '../data/BossesData';

export class BossModel {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.name = data.name || 'Неизвестный босс';
    this.description = data.description || '';
    this.maxHealth = data.maxHealth || 1000;
    this.currentHealth = data.currentHealth !== undefined ? data.currentHealth : data.maxHealth;
    // Удалено поле level
    
    // Новые свойства для Этапа 12.2
    this.rarity = data.rarity || 'common';
    this.imageKey = data.imageKey || 'PLACEHOLDER';
    this.imageUrl = data.imageUrl || null;
    this.effects = data.effects || [];
    
    // Награды за победу над боссом (расширенные)
    this.rewards = data.rewards || {
      experience: 100,
      gold: 50,
      possibleEquipment: ['common'],
      guaranteedEquipment: false,
      taskCoins: 0,
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
    
    // Эффект накопления сопротивления
    this.currentResistance = data.currentResistance || this.getInitialResistance();
  }

  // Получение начального сопротивления от эффектов босса
  getInitialResistance() {
    const increasingResistanceEffect = this.effects.find(effect => effect.type === 'increasingResistance');
    return increasingResistanceEffect ? increasingResistanceEffect.startValue : 0;
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
      } else {
        // Применяем ежедневные эффекты босса
        this.applyDailyEffects();
      }
      
      return damage;
    }
    
    return 0;
  }

  // Применение ежедневных эффектов босса
  applyDailyEffects() {
    // Восстановление здоровья
    const healthRegenEffect = this.effects.find(effect => effect.type === 'healthRegen');
    if (healthRegenEffect && healthRegenEffect.value > 0) {
      const regenAmount = Math.floor(this.maxHealth * (healthRegenEffect.value / 100));
      this.currentHealth = Math.min(this.maxHealth, this.currentHealth + regenAmount);
    }
    
    // Увеличение сопротивления со временем
    const increasingResistanceEffect = this.effects.find(effect => effect.type === 'increasingResistance');
    if (increasingResistanceEffect) {
      this.currentResistance = Math.min(
        increasingResistanceEffect.maxValue,
        this.currentResistance + increasingResistanceEffect.increment
      );
    }
  }

  // Накопление урона за выполнение задач с учетом сопротивления босса и характеристик персонажа
  addDamage(rawDamage, playerStats = {}) {
    // Базовый урон
    let damage = rawDamage;
    
    // Применяем множитель от атаки персонажа, если она указана
    if (playerStats.attack) {
      // Формула: каждые 10 единиц атаки дают +5% к урону
      const attackMultiplier = 1 + (playerStats.attack / 200);
      damage = Math.floor(damage * attackMultiplier);
    }
    
    // Проверяем критический удар
    let isCritical = false;
    if (playerStats.critChance) {
      const criticalResistanceEffect = this.effects.find(effect => effect.type === 'criticalResistance');
      const critResistance = criticalResistanceEffect ? criticalResistanceEffect.value : 0;
      
      // Уменьшаем шанс крита на сопротивление босса
      const effectiveCritChance = Math.max(0, playerStats.critChance - critResistance);
      
      // Проверка на крит
      if (Math.random() * 100 < effectiveCritChance) {
        const critMultiplier = playerStats.critDamage || 1.5;
        damage = Math.floor(damage * critMultiplier);
        isCritical = true;
      }
    }
    
    // Общее сопротивление босса урону
    let totalResistance = 0;
    
    // Добавляем сопротивление от эффекта damageReduction
    const damageReductionEffect = this.effects.find(effect => effect.type === 'damageReduction');
    if (damageReductionEffect) {
      totalResistance += damageReductionEffect.value;
    }
    
    // Добавляем текущее накопленное сопротивление
    totalResistance += this.currentResistance;
    
    // Применяем сопротивление (максимум 75%)
    if (totalResistance > 0) {
      totalResistance = Math.min(75, totalResistance);
      damage = Math.floor(damage * (1 - totalResistance / 100));
    }
    
    // Минимальный урон 1
    damage = Math.max(1, damage);
    
    // Сохраняем информацию о критическом ударе
    if (isCritical) {
      const todayDate = new Date().toISOString().split('T')[0];
      const todayDamage = this.damageHistory.find(entry => entry.date === todayDate);
      
      if (todayDamage) {
        todayDamage.criticalHits = (todayDamage.criticalHits || 0) + 1;
      }
    }
    
    this.accumulatedDamage += damage;
    return {
      damage,
      isCritical,
      totalResistance
    };
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
  
  // Получение цвета редкости босса
  getRarityColor() {
    switch (this.rarity) {
      case 'legendary': return '#FF9800';  // Оранжевый
      case 'epic': return '#9C27B0';       // Фиолетовый
      case 'rare': return '#2196F3';       // Синий
      case 'uncommon': return '#4CAF50';   // Зеленый
      default: return '#9E9E9E';           // Серый для обычных
    }
  }
  
  // Получение названия редкости на русском
  getRarityName() {
    switch (this.rarity) {
      case 'legendary': return 'Легендарный';
      case 'epic': return 'Эпический';
      case 'rare': return 'Редкий';
      case 'uncommon': return 'Необычный';
      default: return 'Обычный';
    }
  }
  
  // Получение изображения босса (с учетом imageKey или imageUrl)
  getBossImage() {
    // Если есть URL, используем его
    if (this.imageUrl) {
      return { uri: this.imageUrl };
    }
    
    // Если есть ключ для спрайта
    if (this.imageKey && BOSS_SPRITES[this.imageKey]) {
      return BOSS_SPRITES[this.imageKey];
    }
    
    // Если ничего нет, используем заполнитель
    return BOSS_SPRITES.PLACEHOLDER;
  }
  
  // Получение описаний всех активных эффектов
  getEffectsDescriptions() {
    return this.effects.map(effect => effect.description);
  }

  // Метод для преобразования объекта босса в обычный объект
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      maxHealth: this.maxHealth,
      currentHealth: this.currentHealth,
      // Удалено поле level
      rarity: this.rarity,
      imageKey: this.imageKey,
      imageUrl: this.imageUrl,
      rewards: this.rewards,
      createdAt: this.createdAt,
      completedAt: this.completedAt,
      status: this.status,
      damageHistory: this.damageHistory,
      accumulatedDamage: this.accumulatedDamage,
      duration: this.duration,
      type: this.type,
      effects: this.effects,
      currentResistance: this.currentResistance
    };
  }

  // Статический метод для создания экземпляра BossModel из обычного объекта
  static fromJSON(json) {
    return new BossModel(json);
  }
  
  // Статический метод для создания босса из шаблона
  static fromTemplate(templateId) {
    const template = getBossById(templateId);
    if (!template) {
      throw new Error(`Шаблон босса с ID ${templateId} не найден`);
    }
    
    return new BossModel(template);
  }
}

export default BossModel;