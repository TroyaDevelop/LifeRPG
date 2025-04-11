// Модель для хранения информации о снаряжении
class EquipmentModel {
  /**
   * Создает новый экземпляр снаряжения
   * @param {Object} params - Параметры снаряжения
   * @param {string|null} params.id - Уникальный идентификатор
   * @param {string} params.name - Название предмета
   * @param {string} params.type - Тип предмета ('head', 'body', 'legs', 'footwear', 'weapon')
   * @param {string} params.description - Описание предмета
   * @param {string} params.image - Путь к изображению предмета
   * @param {Object} params.stats - Характеристики предмета
   * @param {string} params.rarity - Редкость предмета ('common', 'rare', 'epic', 'legendary')
   * @param {number} params.price - Цена предмета в игровой валюте
   * @param {boolean} params.equipped - Надет ли предмет на персонажа
   * @param {Date} params.createdAt - Дата создания предмета
   */
  constructor({
    id = null,
    name = '',
    type = '', // 'head', 'body', 'legs', 'footwear', 'weapon'
    description = '',
    image = '',
    stats = {}, // { strength: 0, intelligence: 0, etc. }
    rarity = 'common', // common, rare, epic, legendary
    price = 0,
    equipped = false,
    createdAt = new Date(),
    level = 1, // Минимальный уровень для использования
    set = null, // Название набора, к которому принадлежит предмет
  }) {
    this.id = id || Math.random().toString(36).substr(2, 9);
    this.name = name;
    this.type = type;
    this.description = description;
    this.image = image;
    this.stats = stats;
    this.rarity = rarity;
    this.price = price;
    this.equipped = equipped;
    this.createdAt = createdAt;
    this.level = level;
    this.set = set;
  }

  /**
   * Возвращает множитель бонуса в зависимости от редкости предмета
   * @returns {number} - Множитель бонуса
   */
  getRarityMultiplier() {
    switch (this.rarity) {
      case 'legendary': return 4;
      case 'epic': return 3;
      case 'rare': return 2;
      default: return 1; // common
    }
  }
  
  /**
   * Возвращает цвет в зависимости от редкости предмета
   * @returns {string} - Цветовой код
   */
  getRarityColor() {
    switch (this.rarity) {
      case 'legendary': return '#FF8C00'; // Оранжевый
      case 'epic': return '#9013FE';      // Фиолетовый
      case 'rare': return '#4E64EE';      // Синий
      default: return '#48BB78';          // Зеленый (common)
    }
  }
}

export default EquipmentModel;