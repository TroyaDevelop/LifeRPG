// filepath: c:\Users\Artem\LifeRPG\src\services\BossService.js
import { BossModel } from '../models/BossModel';
import StorageService from './StorageService';
import { ProfileService } from './ProfileService';

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

  // Добавление урона активному боссу
  static async addDamageToActiveBoss(damage) {
    const activeBoss = await this.getActiveBoss();
    if (!activeBoss) return null;
    
    activeBoss.addDamage(damage);
    await this.updateBoss(activeBoss);
    
    return activeBoss;
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
      
      // Выдаем опыт
      if (boss.rewards.experience) {
        profile.experience += boss.rewards.experience;
      }
      
      // Выдаем золото
      if (boss.rewards.gold) {
        profile.gold += boss.rewards.gold;
      }
      
      // В будущем тут будет выдача предметов
      
      await ProfileService.updateProfile(profile);
      return true;
    } catch (error) {
      console.error('Ошибка при выдаче наград:', error);
      return false;
    }
  }

  // Расчет урона за выполнение задачи
  static calculateDamageForTask(task, profile) {
    // Базовый урон зависит от приоритета задачи
    let baseDamage = 5; // Низкий приоритет
    
    if (task.priority === 'medium') {
      baseDamage = 10;
    } else if (task.priority === 'high') {
      baseDamage = 15;
    }
    
    // Множитель урона от уровня персонажа (каждые 5 уровней +10% к урону)
    const levelMultiplier = 1 + (Math.floor(profile.level / 5) * 0.1);
    
    // Итоговый урон
    return Math.round(baseDamage * levelMultiplier);
  }

  // Получение предзаготовленных шаблонов боссов
  static getBossTemplates() {
    return [
      {
        name: 'Лень',
        description: 'Древний демон, питающийся человеческой прокрастинацией. Победите его, выполняя задачи вовремя!',
        maxHealth: 1000,
        level: 1,
        imageUrl: null,
        rewards: {
          experience: 100,
          gold: 50,
        },
        type: 'standard',
      },
      {
        name: 'Хаос',
        description: 'Воплощение беспорядка и неорганизованности. Справьтесь с ним, поддерживая дисциплину и порядок!',
        maxHealth: 1500,
        level: 2,
        imageUrl: null,
        rewards: {
          experience: 150,
          gold: 75,
        },
        type: 'standard',
      },
      {
        name: 'Отвлечение',
        description: 'Монстр, крадущий ваше внимание и фокус. Сосредоточьтесь на своих задачах, чтобы победить его!',
        maxHealth: 2000,
        level: 3,
        imageUrl: null,
        rewards: {
          experience: 200,
          gold: 100,
        },
        type: 'standard',
      },
    ];
  }

  // Призыв нового босса из шаблона
  static async summonBossFromTemplate(templateIndex = 0) {
    const templates = this.getBossTemplates();
    const template = templates[templateIndex] || templates[0];
    
    return this.createBoss(template);
  }
}

export default BossService;