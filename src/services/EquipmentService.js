import { EquipmentModel } from '../models';
import StorageService from './StorageService';
import { sampleEquipment } from '../data/sampleEquipment';

const EQUIPMENT_STORAGE_KEY = 'liferpg_equipment';

class EquipmentService {
  // Удаляем конструктор, так как StorageService содержит статические методы
  
  // Метод для загрузки тестовых данных при первом запуске
  async initializeWithSampleData() {
    try {
      const equipment = await this.getAllEquipment();
      
      // Если массив пуст, то инициализируем тестовыми данными
      if (equipment.length === 0) {
        const samplesWithModels = sampleEquipment.map(item => new EquipmentModel(item));
        await StorageService.setItem(EQUIPMENT_STORAGE_KEY, samplesWithModels);
        return samplesWithModels;
      }
      
      return equipment;
    } catch (error) {
      console.error('Error initializing sample equipment:', error);
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
      console.error('Error getting equipment by id:', error);
      return null;
    }
  }

  async getEquippedItems() {
    try {
      const equipment = await this.getAllEquipment();
      return equipment.filter(item => item.equipped);
    } catch (error) {
      console.error('Error getting equipped items:', error);
      return [];
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
      const equipment = await this.getAllEquipment();
      const item = equipment.find(item => item.id === itemId);
      
      if (!item) {
        throw new Error('Equipment not found');
      }
      
      // Если предмет того же типа уже экипирован, снимаем его
      const sameTypeItems = equipment.filter(
        equip => equip.type === item.type && equip.equipped
      );
      
      for (const equippedItem of sameTypeItems) {
        equippedItem.equipped = false;
      }
      
      // Экипируем новый предмет
      item.equipped = true;
      
      await StorageService.setItem(EQUIPMENT_STORAGE_KEY, equipment);
      return item;
    } catch (error) {
      console.error('Error equipping item:', error);
      throw error;
    }
  }

  async unequipItem(itemId) {
    try {
      const equipment = await this.getAllEquipment();
      const item = equipment.find(item => item.id === itemId);
      
      if (!item) {
        throw new Error('Equipment not found');
      }
      
      item.equipped = false;
      
      await StorageService.setItem(EQUIPMENT_STORAGE_KEY, equipment);
      return item;
    } catch (error) {
      console.error('Error unequipping item:', error);
      throw error;
    }
  }

  async deleteEquipment(itemId) {
    try {
      const equipment = await this.getAllEquipment();
      const updatedEquipment = equipment.filter(item => item.id !== itemId);
      
      await StorageService.setItem(EQUIPMENT_STORAGE_KEY, updatedEquipment);
      return true;
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  }

  /**
   * Сбрасывает весь инвентарь и снаряжение
   * @param {boolean} reinitialize - Если true, то после сброса будут загружены тестовые данные
   * @returns {Promise<boolean>} - Результат операции
   */
  async resetAllEquipment(reinitialize = true) {
    try {
      console.log('EquipmentService: Сбрасываем инвентарь и снаряжение');
      await StorageService.removeItem(EQUIPMENT_STORAGE_KEY);
      
      if (reinitialize) {
        console.log('EquipmentService: Инициализируем инвентарь тестовыми данными');
        const samplesWithModels = sampleEquipment.map(item => new EquipmentModel(item));
        await StorageService.setItem(EQUIPMENT_STORAGE_KEY, samplesWithModels);
      }
      
      console.log('EquipmentService: Инвентарь успешно сброшен');
      return true;
    } catch (error) {
      console.error('EquipmentService: Ошибка при сбросе инвентаря:', error);
      return false;
    }
  }

  /**
   * Статический метод для сброса всего инвентаря и снаряжения
   * @param {boolean} reinitialize - Если true, то после сброса будут загружены тестовые данные
   * @returns {Promise<boolean>} - Результат операции
   */
  static async resetAllEquipment(reinitialize = true) {
    const service = new EquipmentService();
    return await service.resetAllEquipment(reinitialize);
  }
}

export default EquipmentService;