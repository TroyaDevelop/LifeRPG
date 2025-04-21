import { EquipmentModel } from '../models';
import StorageService from './StorageService';
import { sampleEquipment } from '../data/sampleEquipment';
import { EQUIPMENT_SETS } from '../constants/EquipmentSprites';

const EQUIPMENT_STORAGE_KEY = 'liferpg_equipment';
const PLAYER_INVENTORY_KEY = 'liferpg_player_inventory';
const SHOP_LAST_UPDATE_KEY = 'liferpg_shop_last_update';
const SHOP_ITEMS_KEY = 'liferpg_shop_items';
const SHOP_ITEMS_COUNT = 8; // Количество товаров в магазине

class EquipmentService {
  // Удаляем конструктор, так как StorageService содержит статические методы
  
  // Метод для загрузки оборудования при первом запуске (без начального инвентаря)
  async initializeWithSampleData() {
    try {
      const equipment = await this.getAllEquipment();
      
      // Просто возвращаем текущее оборудование без добавления тестовых данных
      return equipment;
    } catch (error) {
      console.error('Error initializing equipment:', error);
      return [];
    }
  }

  async getAllEquipment() {
    try {
      const equipmentData = await StorageService.getItem(EQUIPMENT_STORAGE_KEY) || [];
      return equipmentData.map(data => new EquipmentModel(data));
    } catch (error) {
      console.error('Error getting equipment:', error);
      return [];
    }
  }

  async getEquipmentById(id) {
    try {
      const equipment = await this.getAllEquipment();
      return equipment.find(item => item.id === id) || null;
    } catch (error) {
      console.error('Error getting equipment by ID:', error);
      return null;
    }
  }

  async getEquippedItems() {
    try {
      const playerInventory = await this.getPlayerInventory();
      return playerInventory.filter(item => item.equipped);
    } catch (error) {
      console.error('Error getting equipped items:', error);
      return [];
    }
  }
  
  /**
   * Получает инвентарь игрока
   * @returns {Promise<Array>} - Массив предметов в инвентаре игрока
   */
  async getPlayerInventory() {
    try {
      const inventoryData = await StorageService.getItem(PLAYER_INVENTORY_KEY) || [];
      return inventoryData.map(data => new EquipmentModel(data));
    } catch (error) {
      console.error('Error getting player inventory:', error);
      return [];
    }
  }

  /**
   * Добавляет предмет в инвентарь игрока (покупка)
   * @param {string|Object} itemIdOrObject - ID предмета или объект предмета для добавления в инвентарь
   * @returns {Promise<Object|null>} - Добавленный предмет или null в случае ошибки
   */
  async addToInventory(itemIdOrObject) {
    try {
      // Проверяем, передан ли ID или объект предмета
      let itemId = null;
      let itemObject = null;
      
      if (typeof itemIdOrObject === 'string') {
        itemId = itemIdOrObject;
      } else if (typeof itemIdOrObject === 'object' && itemIdOrObject !== null) {
        itemObject = itemIdOrObject;
        itemId = itemIdOrObject.id;
      }
      
      if (!itemId) {
        console.error('addToInventory: Неверный параметр:', itemIdOrObject);
        throw new Error('Неверный формат параметра. Ожидается ID предмета или объект предмета с id');
      }
      
      // Получаем текущий ассортимент магазина
      const currentShopItems = await StorageService.getItem(SHOP_ITEMS_KEY) || [];
      
      // Получаем все предметы из общего хранилища
      const allItems = await this.getAllEquipment();
      
      // Проверяем наличие предмета в текущем ассортименте магазина
      const shopItem = currentShopItems.find(item => item.id === itemId);
      
      // Находим предмет по ID в общем списке предметов
      let itemToPurchase = allItems.find(item => item.id === itemId);
      
      // Если предмет есть в магазине, но отсутствует в общем списке, используем его из магазина
      if (shopItem && !itemToPurchase) {
        console.log(`addToInventory: Предмет ${itemId} найден в ассортименте магазина, но отсутствует в общем хранилище. Используем данные из магазина.`);
        itemToPurchase = new EquipmentModel(shopItem);
        
        // Добавляем предмет в общее хранилище
        await this.saveEquipment(shopItem);
      }
      
      if (!itemToPurchase) {
        console.error('addToInventory: Предмет не найден:', itemId);
        throw new Error('Предмет не найден для покупки: ' + itemId);
      }

      // Получаем текущий инвентарь игрока
      const playerInventory = await this.getPlayerInventory();
      
      // Копируем предмет и устанавливаем его свойства для инвентаря
      const inventoryItem = new EquipmentModel({
        ...itemToPurchase,
        equipped: false,
        originalId: itemToPurchase.id, // Сохраняем оригинальный ID для связи
        id: `${itemToPurchase.id}_player_${Date.now()}` // Создаем новый уникальный ID
      });
      
      // Добавляем предмет в инвентарь
      playerInventory.push(inventoryItem);
      
      // Сохраняем обновленный инвентарь
      await StorageService.setItem(PLAYER_INVENTORY_KEY, playerInventory);
      
      // Удаляем предмет из общего списка предметов (из магазина)
      const updatedEquipment = allItems.filter(item => item.id !== itemId);
      await StorageService.setItem(EQUIPMENT_STORAGE_KEY, updatedEquipment);
      
      // Обновляем текущий ассортимент магазина
      const updatedShopItems = currentShopItems.filter(item => item.id !== itemId);
      await StorageService.setItem(SHOP_ITEMS_KEY, updatedShopItems);
      
      return inventoryItem;
    } catch (error) {
      console.error('Error adding item to inventory:', error);
      throw error; // Позволяем обработать ошибку в вызывающем коде
    }
  }

  async saveEquipment(equipmentData) {
    try {
      const equipment = new EquipmentModel(equipmentData);
      const existingEquipment = await this.getAllEquipment();
      
      const index = existingEquipment.findIndex(item => item.id === equipment.id);
      
      if (index !== -1) {
        // Обновляем существующее снаряжение
        existingEquipment[index] = equipment;
      } else {
        // Добавляем новое снаряжение
        existingEquipment.push(equipment);
      }
      
      await StorageService.setItem(EQUIPMENT_STORAGE_KEY, existingEquipment);
      return equipment;
    } catch (error) {
      console.error('Error saving equipment:', error);
      throw error;
    }
  }

  async equipItem(itemId) {
    try {
      const playerInventory = await this.getPlayerInventory();
      // Ищем предмет как по id, так и по originalId
      const item = playerInventory.find(item => item.id === itemId || item.originalId === itemId);
      
      if (!item) {
        throw new Error('Предмет не найден в инвентаре игрока: ' + itemId);
      }
      
      // Снимаем все предметы того же типа
      const sameTypeItems = playerInventory.filter(
        equip => equip.type === item.type && equip.equipped
      );
      
      for (const equippedItem of sameTypeItems) {
        equippedItem.equipped = false;
      }
      
      // Экипируем новый предмет
      item.equipped = true;
      
      // Сохраняем обновленный инвентарь
      await StorageService.setItem(PLAYER_INVENTORY_KEY, playerInventory);
      return item;
    } catch (error) {
      console.error('Error equipping item:', error);
      throw error;
    }
  }

  async unequipItem(itemId) {
    try {
      const playerInventory = await this.getPlayerInventory();
      // Ищем предмет как по id, так и по originalId
      const item = playerInventory.find(item => item.id === itemId || item.originalId === itemId);
      
      if (!item) {
        throw new Error('Предмет не найден в инвентаре игрока: ' + itemId);
      }
      
      // Снимаем предмет
      item.equipped = false;
      
      // Сохраняем обновленный инвентарь
      await StorageService.setItem(PLAYER_INVENTORY_KEY, playerInventory);
      return item;
    } catch (error) {
      console.error('Error unequipping item:', error);
      throw error;
    }
  }

  async deleteEquipment(itemId) {
    try {
      // Удаляем из магазина
      let equipment = await this.getAllEquipment();
      equipment = equipment.filter(item => item.id !== itemId);
      await StorageService.setItem(EQUIPMENT_STORAGE_KEY, equipment);
      
      // Удаляем из инвентаря игрока
      let playerInventory = await this.getPlayerInventory();
      playerInventory = playerInventory.filter(item => item.id !== itemId);
      await StorageService.setItem(PLAYER_INVENTORY_KEY, playerInventory);
      
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      return false;
    }
  }

  /**
   * Сбрасывает весь инвентарь и снаряжение
   * @param {boolean} reinitialize - Параметр больше не используется
   * @returns {Promise<boolean>} - Результат операции
   */
  async resetAllEquipment(reinitialize = false) {
    try {
      console.log('EquipmentService: Сбрасываем инвентарь и снаряжение');
      await StorageService.removeItem(EQUIPMENT_STORAGE_KEY);
      await StorageService.removeItem(PLAYER_INVENTORY_KEY); // Очищаем инвентарь игрока
      
      // Больше не инициализируем инвентарь тестовыми данными
      
      console.log('EquipmentService: Инвентарь успешно сброшен');
      return true;
    } catch (error) {
      console.error('EquipmentService: Ошибка при сбросе инвентаря:', error);
      return false;
    }
  }

  /**
   * Статический метод для сброса всего инвентаря и снаряжения
   * @returns {Promise<boolean>} - Результат операции
   */
  static async resetAllEquipment() {
    const service = new EquipmentService();
    return await service.resetAllEquipment();
  }
  
  /**
   * Применяет эффекты экипированного снаряжения к профилю
   * @param {Object[]} equippedItems - Массив экипированных предметов
   * @returns {Object} - Суммарные бонусы от снаряжения и информация о наборах
   */
  calculateEquipmentBonuses(equippedItems) {
    // Начальные значения бонусов
    const bonuses = {};
    
    // Если нет экипированных предметов, возвращаем пустой объект бонусов
    if (!equippedItems || equippedItems.length === 0) {
      return { 
        stats: bonuses,
        sets: {}
      };
    }
    
    // Собираем все наборы снаряжения, которые есть у игрока
    const equipmentSets = {};
    
    // Обрабатываем каждый предмет
    equippedItems.forEach(item => {
      // Суммируем бонусы от характеристик предмета
      if (item.stats) {
        Object.entries(item.stats).forEach(([stat, value]) => {
          // Учитываем множитель редкости предмета для бонусов
          const bonusValue = value * (item.getRarityMultiplier ? item.getRarityMultiplier() : 1);
          bonuses[stat] = (bonuses[stat] || 0) + bonusValue;
        });
      }
      
      // Если предмет принадлежит набору, отмечаем это
      if (item.set) {
        if (!equipmentSets[item.set]) {
          equipmentSets[item.set] = {
            count: 0,
            items: [],
            completed: false,
            name: item.getSetName(),
            bonusApplied: false
          };
        }
        equipmentSets[item.set].count++;
        equipmentSets[item.set].items.push(item.id);
      }
    });
    
    // Проверяем наборы снаряжения для дополнительных бонусов
    Object.entries(equipmentSets).forEach(([setName, setInfo]) => {
      const setData = EQUIPMENT_SETS[setName];
      
      if (setData) {
        // Проверяем, собран ли полный комплект
        const totalPieces = setData.pieces.length;
        const collectedPieces = setInfo.count;
        const completionPercentage = collectedPieces / totalPieces;
        
        setInfo.totalPieces = totalPieces;
        setInfo.collectedPieces = collectedPieces;
        setInfo.completionPercentage = completionPercentage;
        setInfo.description = setData.description || '';
        
        // Применяем бонусы в зависимости от степени заполненности набора
        if (completionPercentage >= 1) {
          // Полный комплект - применяем все бонусы
          setInfo.bonusApplied = true;
          
          // Добавляем бонусы набора к общим бонусам
          if (setData.bonus) {
            Object.entries(setData.bonus).forEach(([stat, value]) => {
              bonuses[stat] = (bonuses[stat] || 0) + value;
            });
          }
        } else if (completionPercentage >= 0.5) {
          // Более половины комплекта - частичный бонус
          setInfo.bonusApplied = true;
          
          if (setData.bonus) {
            Object.entries(setData.bonus).forEach(([stat, value]) => {
              // Применяем половину бонуса
              bonuses[stat] = (bonuses[stat] || 0) + Math.floor(value * 0.5);
            });
          }
        }
      }
    });
    
    return {
      stats: bonuses,
      sets: equipmentSets
    };
  }
  
  /**
   * Получает информацию о наборах снаряжения
   * @returns {Promise<Object>} - Информация о наборах и их комплектации
   */
  async getEquipmentSetsInfo() {
    try {
      // Получаем экипированные предметы
      const equippedItems = await this.getEquippedItems();
      
      // Получаем информацию о бонусах и наборах
      const equipmentInfo = this.calculateEquipmentBonuses(equippedItems);
      
      return equipmentInfo.sets;
    } catch (error) {
      console.error('Error getting equipment sets info:', error);
      return {};
    }
  }

  /**
   * Инициализирует магазин предметами для продажи
   * @returns {Promise<Array>} - Массив предметов, доступных для покупки
   */
  async initializeShopItems() {
    try {
      // Получаем все текущие предметы из базы данных
      let allEquipment = await this.getAllEquipment();
      
      // Если товаров в магазине нет, добавляем данные из sampleEquipment
      if (allEquipment.length === 0) {
        console.log('EquipmentService: Инициализируем магазин товарами');
        // Добавляем тестовые данные в базу предметов
        for (const item of sampleEquipment) {
          await this.saveEquipment(item);
        }
        // Получаем обновленный список предметов
        allEquipment = await this.getAllEquipment();
      }
      
      return allEquipment;
    } catch (error) {
      console.error('Error initializing shop items:', error);
      return [];
    }
  }

  /**
   * Получение предметов, доступных для покупки в магазине
   * Возвращает 8 случайных предметов и обновляет их раз в день в полночь
   * @returns {Promise<Array>} - Массив предметов, доступных для покупки
   */
  async getShopItems() {
    try {
      // Проверяем, нужно ли обновить ассортимент
      const shouldRefresh = await this.shouldRefreshShop();
      
      if (shouldRefresh) {
        // Если нужно обновить, генерируем новый набор предметов
        return await this.refreshShopItems();
      }
      
      // Иначе, возвращаем текущий ассортимент магазина
      const currentShopItems = await StorageService.getItem(SHOP_ITEMS_KEY);
      
      // Если ассортимент еще не был сгенерирован, делаем это
      if (!currentShopItems || currentShopItems.length === 0) {
        return await this.refreshShopItems();
      }
      
      // Преобразуем данные в модели
      return currentShopItems.map(data => new EquipmentModel(data));
    } catch (error) {
      console.error('Error getting shop items:', error);
      return [];
    }
  }

  /**
   * Проверяет, нужно ли обновить магазин (прошла ли полночь с момента последнего обновления)
   * @returns {Promise<boolean>} - true, если магазин нужно обновить
   */
  async shouldRefreshShop() {
    try {
      const lastUpdateTime = await StorageService.getItem(SHOP_LAST_UPDATE_KEY);
      
      // Если никогда не обновлялся, то нужно обновить
      if (!lastUpdateTime) {
        return true;
      }
      
      // Получаем текущую дату и последнюю дату обновления
      const currentDate = new Date();
      const lastUpdateDate = new Date(lastUpdateTime);
      
      // Сброс часов, минут и секунд для сравнения только дат
      currentDate.setHours(0, 0, 0, 0);
      lastUpdateDate.setHours(0, 0, 0, 0);
      
      // Если даты разные, значит прошла полночь
      return currentDate.getTime() > lastUpdateDate.getTime();
    } catch (error) {
      console.error('Error checking shop refresh status:', error);
      return false;
    }
  }

  /**
   * Возвращает время до следующего обновления магазина в миллисекундах
   * @returns {Promise<number>} - Время до следующего обновления в миллисекундах
   */
  async getTimeUntilNextRefresh() {
    try {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0); // Полночь следующего дня
      
      return tomorrow.getTime() - now.getTime();
    } catch (error) {
      console.error('Error calculating next refresh time:', error);
      return 24 * 60 * 60 * 1000; // 24 часа по умолчанию
    }
  }

  /**
   * Обновляет время последнего обновления магазина
   */
  async updateShopRefreshTime() {
    try {
      await StorageService.setItem(SHOP_LAST_UPDATE_KEY, Date.now());
    } catch (error) {
      console.error('Error updating shop refresh time:', error);
    }
  }

  /**
   * Генерирует новый ассортимент магазина из случайных предметов
   * @returns {Promise<Array>} - Массив предметов для магазина
   */
  async refreshShopItems() {
    try {
      console.log('EquipmentService: Обновляем ассортимент магазина');
      
      // Получаем все доступные предметы
      await this.initializeShopItems();
      const allEquipment = await this.getAllEquipment();
      
      // Получаем инвентарь игрока
      const playerInventory = await this.getPlayerInventory();
      
      // Создаем множество ID предметов, которые уже есть у игрока
      const playerItemIds = new Set();
      playerInventory.forEach(item => {
        playerItemIds.add(item.id);
        if (item.originalId) {
          playerItemIds.add(item.originalId);
        }
      });
      
      // Фильтруем предметы, которых еще нет в инвентаре игрока
      const availableItems = allEquipment.filter(item => !playerItemIds.has(item.id));
      
      // Если доступных предметов недостаточно, добавляем новые из sampleEquipment
      if (availableItems.length < SHOP_ITEMS_COUNT) {
        // Находим предметы из sampleEquipment, которых еще нет в базе
        const existingIds = new Set([
          ...allEquipment.map(item => item.id),
          ...playerInventory.map(item => item.originalId || item.id)
        ]);
        
        const newItems = sampleEquipment.filter(item => !existingIds.has(item.id));
        
        // Если есть новые предметы, добавляем их в базу
        for (const item of newItems) {
          await this.saveEquipment(item);
        }
        
        // Получаем обновленный список предметов
        const updatedEquipment = await this.getAllEquipment();
        const updatedAvailableItems = updatedEquipment.filter(item => !playerItemIds.has(item.id));
        
        if (updatedAvailableItems.length > 0) {
          availableItems.push(...updatedAvailableItems.filter(item => 
            !availableItems.some(existingItem => existingItem.id === item.id)
          ));
        }
      }
      
      // Выбираем случайные предметы для магазина
      const shuffledItems = [...availableItems].sort(() => 0.5 - Math.random());
      const shopItems = shuffledItems.slice(0, Math.min(SHOP_ITEMS_COUNT, shuffledItems.length));
      
      // Сохраняем выбранные предметы как текущий ассортимент магазина
      await StorageService.setItem(SHOP_ITEMS_KEY, shopItems);
      
      // Обновляем время последнего обновления
      await this.updateShopRefreshTime();
      
      return shopItems;
    } catch (error) {
      console.error('Error refreshing shop items:', error);
      return [];
    }
  }

  /**
   * Использует предмет из инвентаря игрока
   * @param {string} itemId - ID предмета в инвентаре игрока
   * @returns {Promise<Object>} - Результат использования предмета
   */
  async useItem(itemId) {
    try {
      const playerInventory = await this.getPlayerInventory();
      const itemIndex = playerInventory.findIndex(item => item.id === itemId);
      
      if (itemIndex === -1) {
        throw new Error('Предмет не найден в инвентаре: ' + itemId);
      }
      
      const item = playerInventory[itemIndex];
      let result = { success: false };

      console.log('Использование предмета:', item);
      
      // Проверяем ID предмета на совпадение со свитками призыва
      const isBossSummon = 
        item.id.includes('boss_summon') || 
        (item.originalId && item.originalId.includes('boss_summon')) ||
        item.name.toLowerCase().includes('свиток призыва');
      
      // Проверяем ID предмета на совпадение с зельями здоровья
      const isHealthPotion = 
        item.id.includes('health_potion') || 
        (item.originalId && item.originalId.includes('health_potion')) ||
        item.name.toLowerCase().includes('зелье здоровья');
      
      // Проверяем ID предмета на совпадение с зельями энергии
      const isEnergyPotion = 
        item.id.includes('energy_potion') || 
        (item.originalId && item.originalId.includes('energy_potion')) ||
        item.name.toLowerCase().includes('зелье энергии');
      
      // Обработка различных типов предметов
      if (item.type === 'consumable' || isBossSummon || isHealthPotion || isEnergyPotion) {
        // Обработка разных подтипов расходников
        if (item.subType === 'boss_summon' || isBossSummon) {
          // Предмет призыва босса
          const BossService = require('./BossService').default;
          const bossTier = item.tier || 1;
          const boss = await BossService.summonBossFromTemplate(bossTier - 1);
          result = { 
            success: true, 
            message: `Призван босс ${boss.name}!`,
            boss: boss,
            consumed: true
          };
        } else if (item.subType === 'health_potion' || isHealthPotion) {
          // Зелье здоровья
          const ProfileService = require('./ProfileService').ProfileService;
          const healAmount = item.healAmount || 20;
          
          await ProfileService.updateHealth(healAmount);
          result = {
            success: true,
            message: `Восстановлено ${healAmount} здоровья!`,
            consumed: true
          };
        } else if (item.subType === 'energy_potion' || isEnergyPotion) {
          // Зелье энергии
          const ProfileService = require('./ProfileService').ProfileService;
          const energyAmount = item.energyAmount || 15;
          
          await ProfileService.updateEnergy(energyAmount);
          result = {
            success: true,
            message: `Восстановлено ${energyAmount} энергии!`,
            consumed: true
          };
        } else {
          result = {
            success: false,
            message: 'Неизвестный тип расходуемого предмета',
            consumed: false
          };
        }
      } else {
        result = {
          success: false,
          message: 'Этот предмет нельзя использовать',
          consumed: false
        };
      }
      
      // Если предмет был использован и его нужно удалить
      if (result.success && result.consumed) {
        // Удаляем предмет из инвентаря
        playerInventory.splice(itemIndex, 1);
        await StorageService.setItem(PLAYER_INVENTORY_KEY, playerInventory);
      }
      
      return result;
    } catch (error) {
      console.error('Error using item:', error);
      throw error;
    }
  }
}

export default EquipmentService;