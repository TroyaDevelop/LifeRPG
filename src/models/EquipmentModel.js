/**
 * Модель для предмета снаряжения
 */
class EquipmentModel {
  /**
   * @param {Object} data - Данные предмета
   * @param {string} data.id - Уникальный идентификатор предмета
   * @param {string} data.name - Название предмета
   * @param {string} data.type - Тип предмета (head, body, legs, footwear, weapon)
   * @param {string} data.description - Описание предмета
   * @param {string} data.image - URL изображения предмета
   * @param {string} data.rarity - Редкость предмета (common, rare, epic, legendary)
   * @param {Object} data.stats - Характеристики предмета
   * @param {number} data.level - Требуемый уровень для использования предмета
   * @param {number} data.price - Цена предмета
   * @param {string} data.set - Название набора, к которому принадлежит предмет
   * @param {boolean} data.equipped - Флаг, указывающий, надет ли предмет
   * @param {string} data.originalId - Оригинальный ID предмета (для купленных предметов)
   */
  constructor(data = {}) {
    this.id = data.id || `equipment_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    this.name = data.name || 'Безымянный предмет';
    this.type = data.type || 'weapon'; // По умолчанию тип - оружие
    this.description = data.description || '';
    this.image = data.image || null;
    this.rarity = data.rarity || 'common';
    this.stats = data.stats || {};
    this.level = data.level || 1;
    this.price = data.price || 100;
    this.set = data.set || null;
    this.equipped = data.equipped || false;
    this.originalId = data.originalId || null;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }
  
  /**
   * Получает множитель бонусов в зависимости от редкости предмета
   * @returns {number} Множитель бонусов
   */
  getRarityMultiplier() {
    switch (this.rarity) {
      case 'legendary': return 2.0;  // Двойной бонус для легендарных предметов
      case 'epic': return 1.5;       // Полуторный бонус для эпических предметов
      case 'rare': return 1.25;      // Небольшой дополнительный бонус для редких предметов
      default: return 1.0;           // Стандартный бонус для обычных предметов
    }
  }
  
  /**
   * Получает числовое значение редкости предмета
   * @returns {number} Числовое значение редкости (1-4)
   */
  getRarityValue() {
    switch (this.rarity) {
      case 'legendary': return 4;
      case 'epic': return 3;
      case 'rare': return 2;
      default: return 1; // common
    }
  }
  
  /**
   * Получает цветовой код для отображения редкости предмета
   * @returns {string} Цветовой код в формате HEX
   */
  getRarityColor() {
    switch (this.rarity) {
      case 'legendary': return '#FF8C00'; // Оранжевый
      case 'epic': return '#9013FE';      // Фиолетовый
      case 'rare': return '#4E64EE';      // Синий
      default: return '#48BB78';          // Зеленый (common)
    }
  }
  
  /**
   * Получает текстовое представление редкости предмета
   * @returns {string} Текстовое представление редкости на русском
   */
  getRarityLabel() {
    switch (this.rarity) {
      case 'legendary': return 'Легендарный';
      case 'epic': return 'Эпический';
      case 'rare': return 'Редкий';
      default: return 'Обычный';
    }
  }
  
  /**
   * Получает общую силу предмета на основе его статистик и редкости
   * @returns {number} Числовое значение силы предмета
   */
  getItemPower() {
    let power = 0;
    
    // Суммируем все статистики предмета
    if (this.stats) {
      Object.values(this.stats).forEach(value => {
        power += value;
      });
    }
    
    // Умножаем на коэффициент редкости
    power *= this.getRarityMultiplier();
    
    // Округляем до целого числа
    return Math.round(power);
  }
}

export default EquipmentModel;