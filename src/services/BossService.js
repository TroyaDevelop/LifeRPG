// filepath: c:\Users\Artem\LifeRPG\src\services\BossService.js
import { BossModel } from '../models/BossModel';
import StorageService from './StorageService';
import ProfileService from './ProfileService';
import EquipmentService from './EquipmentService';
import { getAllBosses, getRandomBoss, getBossById } from '../data/BossesData';

const BOSSES_STORAGE_KEY = 'bosses';
const ACTIVE_BOSS_KEY = 'activeBoss';

class BossService {
  // Получение всех боссов
  static async getAllBosses() {
    const bosses = await StorageService.getItem(BOSSES_STORAGE_KEY) || [];
    return bosses.map(boss => BossModel.fromJSON(boss));
  }

  // Получение активного босса
  static async getActiveBoss() {
    const activeBossId = await StorageService.getItem(ACTIVE_BOSS_KEY);
    if (!activeBossId) return null;
    
    const bosses = await this.getAllBosses();
    const activeBoss = bosses.find(boss => boss.id === activeBossId && boss.isActive());
    
    if (!activeBoss) {
      // Если активный босс не найден или не активен, сбрасываем ключ
      await StorageService.removeItem(ACTIVE_BOSS_KEY);
      return null;
    }
    
    return activeBoss;
  }

  // Создание нового босса
  static async createBoss(bossData) {
    const newBoss = new BossModel(bossData);
    const bosses = await this.getAllBosses();
    
    bosses.push(newBoss);
    await StorageService.setItem(BOSSES_STORAGE_KEY, bosses.map(boss => boss.toJSON()));
    
    // Если нет активного босса, устанавливаем этого
    const activeBoss = await this.getActiveBoss();
    if (!activeBoss) {
      await this.setActiveBoss(newBoss.id);
    }
    
    return newBoss;
  }

  // Обновление босса
  static async updateBoss(updatedBoss) {
    const bosses = await this.getAllBosses();
    const index = bosses.findIndex(boss => boss.id === updatedBoss.id);
    
    if (index !== -1) {
      bosses[index] = updatedBoss instanceof BossModel ? updatedBoss : new BossModel(updatedBoss);
      await StorageService.setItem(BOSSES_STORAGE_KEY, bosses.map(boss => boss.toJSON()));
      return bosses[index];
    }
    
    return null;
  }

  // Удаление босса
  static async deleteBoss(bossId) {
    const bosses = await this.getAllBosses();
    const filteredBosses = bosses.filter(boss => boss.id !== bossId);
    
    if (filteredBosses.length !== bosses.length) {
      await StorageService.setItem(BOSSES_STORAGE_KEY, filteredBosses.map(boss => boss.toJSON()));
      
      // Если удалили активного босса, сбрасываем ключ
      const activeBossId = await StorageService.getItem(ACTIVE_BOSS_KEY);
      if (activeBossId === bossId) {
        await StorageService.removeItem(ACTIVE_BOSS_KEY);
      }
      
      return true;
    }
    
    return false;
  }

  // Установка активного босса
  static async setActiveBoss(bossId) {
    const bosses = await this.getAllBosses();
    const boss = bosses.find(b => b.id === bossId);
    
    if (boss && boss.isActive()) {
      await StorageService.setItem(ACTIVE_BOSS_KEY, bossId);
      return boss;
    }
    
    return null;
  }

  // Добавление урона активному боссу с учетом характеристик персонажа
  static async addDamageToActiveBoss(rawDamage) {
    const activeBoss = await this.getActiveBoss();
    if (!activeBoss) return null;
    
    // Получаем профиль пользователя для применения его характеристик
    const profile = await ProfileService.getProfile();
    
    // Статистика персонажа для расчета урона
    const playerStats = {
      attack: profile.stats?.attack || 0,
      critChance: profile.stats?.critChance || 5, // Базовый шанс крита 5%
      critDamage: profile.stats?.critDamage || 1.5, // Базовый множитель крита 1.5x
    };
    
    // Добавляем бонусы от экипировки
    if (profile.equipment) {
      const equipment = await EquipmentService.getAllEquipment();
      const equippedItems = equipment.filter(item => item.equipped);
      
      equippedItems.forEach(item => {
        if (item.stats) {
          // Атака
          if (item.stats.attack) {
            playerStats.attack += item.stats.attack;
          }
          
          // Шанс крита
          if (item.stats.critChance) {
            playerStats.critChance += item.stats.critChance;
          }
          
          // Множитель крита
          if (item.stats.critDamage) {
            playerStats.critDamage += item.stats.critDamage;
          }
        }
      });
    }
    
    // Добавляем урон боссу
    const damageResult = activeBoss.addDamage(rawDamage, playerStats);
    await this.updateBoss(activeBoss);
    
    return {
      boss: activeBoss,
      damageResult
    };
  }

  // Применение накопленного урона к активному боссу
  static async applyAccumulatedDamage() {
    const activeBoss = await this.getActiveBoss();
    if (!activeBoss) return { applied: false, damage: 0, isBossDefeated: false };
    
    const damage = activeBoss.applyAccumulatedDamage();
    await this.updateBoss(activeBoss);
    
    const isBossDefeated = activeBoss.status === 'defeated';
    
    // Если босс побежден, выдаем награду
    if (isBossDefeated) {
      await this.giveRewards(activeBoss);
    }
    
    return { 
      applied: damage > 0, 
      damage, 
      isBossDefeated 
    };
  }

  // Выдача наград за победу над боссом
  static async giveRewards(boss) {
    if (!boss || boss.status !== 'defeated') return false;
    
    try {
      const profile = await ProfileService.getProfile();
      const rewards = {
        experience: 0,
        gold: 0,
        taskCoins: 0,
        equipment: null
      };
      
      // Выдаем опыт
      if (boss.rewards.experience) {
        profile.experience += boss.rewards.experience;
        rewards.experience = boss.rewards.experience;
      }
      
      // Выдаем золото
      if (boss.rewards.gold) {
        profile.gold += boss.rewards.gold;
        rewards.gold = boss.rewards.gold;
      }
      
      // Выдаем монеты задач
      if (boss.rewards.taskCoins) {
        profile.taskCoins = (profile.taskCoins || 0) + boss.rewards.taskCoins;
        rewards.taskCoins = boss.rewards.taskCoins;
      }
      
      // Генерация снаряжения в награду при наличии возможных редкостей
      if (boss.rewards.possibleEquipment && boss.rewards.possibleEquipment.length > 0) {
        const shouldGenerateEquipment = boss.rewards.guaranteedEquipment || Math.random() < 0.7; // 70% шанс получить предмет без гарантии
        
        if (shouldGenerateEquipment) {
          // Выбираем случайную редкость из доступных
          const rarityIndex = Math.floor(Math.random() * boss.rewards.possibleEquipment.length);
          const rarity = boss.rewards.possibleEquipment[rarityIndex];
          
          // Генерируем предмет соответствующей редкости
          const newEquipment = await EquipmentService.generateRandomEquipment(rarity);
          await EquipmentService.addEquipment(newEquipment);
          
          rewards.equipment = newEquipment;
        }
      }
      
      await ProfileService.updateProfile(profile);
      return rewards;
    } catch (error) {
      console.error('Ошибка при выдаче наград:', error);
      return false;
    }
  }

  // Расчет урона за выполнение задачи с учетом характеристик персонажа
  static calculateDamageForTask(task, profile) {
    // Базовый урон зависит от приоритета задачи
    let baseDamage = 1; // Низкий приоритет (легкое задание)
    
    if (task.priority === 'medium') {
      baseDamage = 2; // Среднее задание
    } else if (task.priority === 'high') {
      baseDamage = 3; // Сложное задание
    }
    
    // Проверяем наличие объекта profile, чтобы избежать ошибок
    if (!profile) {
      console.log('BossService: profile не определен при расчёте урона');
      return baseDamage;
    }

    // Детальное логирование полученного профиля
    console.log('BossService.calculateDamageForTask - полный профиль:', 
      JSON.stringify({
        id: profile.id,
        level: profile.level,
        strength: profile.strength,
        intelligence: profile.intelligence,
        agility: profile.agility,
        willpower: profile.willpower,
        luck: profile.luck,
        hasStats: !!profile.stats,
        equipmentBonuses: profile.equipmentBonuses
      }, null, 2)
    );
    
    // Используем методы для получения характеристик с учетом бонусов снаряжения
    let strength = 0;
    let intellect = 0;
    
    if (typeof profile.getTotalStats === 'function') {
      // Используем новый метод, если он доступен
      const totalStats = profile.getTotalStats();
      strength = totalStats.strength;
      intellect = totalStats.intelligence;
      console.log('BossService: Использование getTotalStats для получения характеристик');
    } else if (typeof profile.totalStrength === 'number' && typeof profile.totalIntelligence === 'number') {
      // Используем геттеры, если они доступны
      strength = profile.totalStrength;
      intellect = profile.totalIntelligence;
      console.log('BossService: Использование геттеров для получения характеристик');
    } else {
      // Если геттеры недоступны, пробуем получить значения напрямую
      strength = profile.stats?.strength || profile.strength || 0;
      // Пробуем различные варианты названия интеллекта
      intellect = profile.stats?.intelligence || profile.stats?.intellect || profile.intelligence || profile.intellect || 0;
      
      // Добавляем бонусы от экипировки, если они есть
      if (profile.equipmentBonuses?.stats) {
        strength += profile.equipmentBonuses.stats.strength || 0;
        intellect += profile.equipmentBonuses.stats.intelligence || 0;
      }
    }
    
    console.log(`BossService: Характеристики персонажа с учетом бонусов - Сила: ${strength}, Интеллект: ${intellect}`);
    
    // Бонус урона от силы персонажа (каждые 10 единиц силы дают +1 к базовому урону)
    const strengthBonus = Math.floor(strength / 10);
    
    // Бонус урона от интеллекта персонажа (каждые 10 единиц интеллекта дают +1 к базовому урону)
    const intellectBonus = Math.floor(intellect / 10);
    
    // Добавляем бонусы от силы и интеллекта
    let totalDamage = baseDamage;
    
    if (strengthBonus > 0) {
      totalDamage += strengthBonus;
      console.log(`BossService: Добавлен бонус от силы: +${strengthBonus} урона`);
    }
    
    if (intellectBonus > 0) {
      totalDamage += intellectBonus;
      console.log(`BossService: Добавлен бонус от интеллекта: +${intellectBonus} урона`);
    }
    
    console.log(`BossService: Базовый урон ${baseDamage}, итоговый урон ${totalDamage}`);
    
    // Итоговый урон
    return totalDamage;
  }

  // Получение предзаготовленных шаблонов боссов из данных
  static getBossTemplates() {
    return getAllBosses();
  }

  // Призыв нового босса по ID шаблона или случайного босса определенной редкости
  static async summonBoss(bossIdentifier = null) {
    let bossTemplate;
    
    console.log(`BossService: Призываем босса с идентификатором: ${bossIdentifier}`);
    
    if (!bossIdentifier) {
      // Если ничего не указано, берем случайного босса
      console.log('BossService: Идентификатор не указан, выбираем случайного босса');
      bossTemplate = getRandomBoss();
    } else if (typeof bossIdentifier === 'string' && ['common', 'uncommon', 'rare', 'epic', 'legendary'].includes(bossIdentifier)) {
      // Если указана редкость, берем случайного босса этой редкости
      console.log(`BossService: Выбираем случайного босса редкости ${bossIdentifier}`);
      bossTemplate = getRandomBoss(bossIdentifier);
    } else {
      // Если указан ID, ищем конкретного босса
      console.log(`BossService: Ищем босса по ID: ${bossIdentifier}`);
      bossTemplate = getBossById(bossIdentifier);
      
      // Если не найден по ID напрямую, проверяем дополнительные форматы
      if (!bossTemplate && typeof bossIdentifier === 'string') {
        // Пытаемся извлечь идентификатор босса из ID свитка, формат может быть "boss_summon_X"
        console.log('BossService: Босс не найден по прямому ID, проверяем формат свитка');
        const parts = bossIdentifier.split('_');
        if (parts.length >= 3) {
          const possibleBossId = parts[parts.length - 1];
          console.log(`BossService: Извлечен возможный ID босса из свитка: ${possibleBossId}`);
          bossTemplate = getBossById(possibleBossId);
        }
      }
    }
    
    if (!bossTemplate) {
      console.log('BossService: Шаблон босса не найден, выбираем первого доступного босса');
      // Если не нашли шаблон, берем первого доступного босса
      const allBosses = getAllBosses();
      bossTemplate = allBosses[0];
      
      if (!bossTemplate) {
        console.error('BossService: Не удалось найти ни одного босса в базе данных');
        return null;
      }
    }
    
    console.log(`BossService: Создаем босса "${bossTemplate.name}" (${bossTemplate.id})`);
    return this.createBoss(bossTemplate);
  }
}

export default BossService;