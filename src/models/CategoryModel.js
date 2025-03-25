import { v4 as uuidv4 } from 'uuid';

class CategoryModel {
  constructor({
    id = uuidv4(),
    name = '',
    color = '#3498db', // цвет по умолчанию
    icon = 'list', // иконка по умолчанию
    createdAt = new Date(),
    updatedAt = new Date(),
  }) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.icon = icon;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // Метод для преобразования объекта категории в обычный объект
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      icon: this.icon,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  // Статический метод для создания экземпляра CategoryModel из обычного объекта
  static fromJSON(json) {
    return new CategoryModel({
      ...json,
      createdAt: json.createdAt ? new Date(json.createdAt) : new Date(),
      updatedAt: json.updatedAt ? new Date(json.updatedAt) : new Date(),
    });
  }
}

export default CategoryModel;
