/**
 * Модель для хранения информации об аватаре пользователя
 */
export class AvatarModel {
  constructor(data = {}) {
    this.id = data.id || Date.now().toString();
    this.bodyType = data.bodyType || 'typeA';        // Тип тела персонажа
    this.skinTone = data.skinTone || 'normal';       // Оттенок кожи
    this.hairStyle = data.hairStyle || 'short';      // Стиль волос
    this.hairColor = data.hairColor || 'brown';      // Цвет волос
    this.eyeColor = data.eyeColor || 'blue';         // Цвет глаз
    // Убираем faceExpression
    this.equipment = data.equipment || {             // Места для снаряжения (пока пустые)
      head: null,
      body: null,
      legs: null,
      weapon: null,
      accessory: null
    };
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  /**
   * Обновление аватара
   * @param {Object} data - Новые данные аватара
   * @returns {AvatarModel} - Обновленный аватар
   */
  update(data) {
    Object.keys(data).forEach(key => {
      if (this.hasOwnProperty(key) && key !== 'id' && key !== 'createdAt') {
        this[key] = data[key];
      }
    });
    this.updatedAt = new Date().toISOString();
    return this;
  }

  /**
   * Возвращает объект для сохранения в хранилище
   * @returns {Object} - Объект для сохранения
   */
  toJSON() {
    return {
      id: this.id,
      bodyType: this.bodyType,
      skinTone: this.skinTone,
      hairStyle: this.hairStyle,
      hairColor: this.hairColor,
      eyeColor: this.eyeColor,
      equipment: this.equipment,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Создает модель из данных хранилища
   * @param {Object} data - Данные из хранилища
   * @returns {AvatarModel} - Созданная модель
   */
  static fromJSON(data) {
    return new AvatarModel(data);
  }
}