import { EquipmentModel } from '../models';
import StorageService from './StorageService';
import { sampleEquipment } from '../data/sampleEquipment';

const EQUIPMENT_STORAGE_KEY = 'liferpg_equipment';
const PLAYER_INVENTORY_KEY = 'liferpg_player_inventory';

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
      
      // Получаем все предметы из магазина
      const allItems = await this.getAllEquipment();
      
      // Находим предмет по ID
      const itemToPurchase = allItems.find(item => item.id === itemId);
      
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
   * @returns {Object} - Суммарные бонусы от снаряжения { strength: 10, intelligence: 5, ... }
   */
  calculateEquipmentBonuses(equippedItems) {
    // Начальные значения бонусов
    const bonuses = {};
    
    // Если нет экипированных предметов, возвращаем пустой объект бонусов
    if (!equippedItems || equippedItems.length === 0) {
      return bonuses;
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
            items: []
          };
        }
        equipmentSets[item.set].count++;
        equipmentSets[item.set].items.push(item);
      }
    });
    
    // Проверяем наборы снаряжения для дополнительных бонусов
    Object.entries(equipmentSets).forEach(([setName, setData]) => {
      // Проверяем, какой процент набора собран
      // Предполагаем, что полный набор состоит из 5 предметов (по одному на каждый слот)
      const setCompletion = setData.count / 5;
      
      // Добавляем бонус за набор в зависимости от процента собранного набора
      if (setCompletion >= 1) {
        // Полный набор - максимальный бонус
        bonuses.setBonus = (bonuses.setBonus || 0) + 20;
        // Добавляем уникальный бонус набора
        bonuses[`${setName.toLowerCase()}_full`] = 15;
      } else if (setCompletion >= 0.6) {
        // 3+ предметов из набора - средний бонус
        bonuses.setBonus = (bonuses.setBonus || 0) + 10;
      } else if (setCompletion >= 0.4) {
        // 2 предмета из набора - минимальный бонус
        bonuses.setBonus = (bonuses.setBonus || 0) + 5;
      }
    });
    
    return bonuses;
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
   * Исключает предметы, которые уже есть в инвентаре игрока
   * @returns {Promise<Array>} - Массив предметов, доступных для покупки
   */
  async getShopItems() {
    try {
      // Инициализируем магазин, если это необходимо
      const allEquipment = await this.initializeShopItems();
      
      // Получаем инвентарь игрока
      const playerInventory = await this.getPlayerInventory();
      
      // Создаем множество ID предметов, которые уже есть у игрока
      // Учитываем как обычные ID, так и originalId для предметов, которые были куплены ранее
      const playerItemIds = new Set();
      playerInventory.forEach(item => {
        playerItemIds.add(item.id);
        if (item.originalId) {
          playerItemIds.add(item.originalId);
        }
      });
      
      // Фильтруем предметы, которых еще нет в инвентаре игрока
      const shopItems = allEquipment.filter(item => !playerItemIds.has(item.id));
      
      return shopItems;
    } catch (error) {
      console.error('Error getting shop items:', error);
      return [];
    }
  }
}

export default EquipmentService;