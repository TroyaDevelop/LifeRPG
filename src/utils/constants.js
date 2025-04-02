// Ключи для AsyncStorage
export const STORAGE_KEYS = {
  TASKS: 'tasks',
  CATEGORIES: 'categories',
  USER_PROFILE: 'userProfile',
  APP_SETTINGS: 'appSettings',
};

// Приоритеты задач
export const TASK_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Цвета приоритетов
export const PRIORITY_COLORS = {
  low: '#2ecc71',     // зеленый
  medium: '#f39c12',  // оранжевый
  high: '#e74c3c',    // красный
};

// Иконки для категорий
export const CATEGORY_ICONS = [
  'briefcase-outline',   // Работа
  'person-outline',      // Личное
  'book-outline',        // Учеба
  'home-outline',        // Дом
  'medkit-outline',      // Здоровье
  'fitness-outline',     // Спорт
  'restaurant-outline',  // Еда
  'cash-outline',        // Финансы
  'heart-outline',       // Личное
  'people-outline',      // Семья
  'desktop-outline',     // Компьютер
  'game-controller-outline', // Хобби
  'calendar-outline',    // Планирование
  'cart-outline',        // Покупки
  'airplane-outline',    // Путешествия
  'call-outline',        // Звонки
  'mail-outline',        // Почта
  'star-outline',        // Важное
  'gift-outline',        // Подарки
];

// Цвета для категорий
export const CATEGORY_COLORS = [
  '#4E64EE', // Синий
  '#FF6B6B', // Красный
  '#48BB78', // Зеленый
  '#F6AD55', // Оранжевый
  '#9F7AEA', // Фиолетовый
  '#4FD1C5', // Бирюзовый
  '#F687B3', // Розовый
  '#718096', // Серый
  '#F6E05E', // Желтый
  '#DD6B20', // Коричневый
  '#38B2AC', // Бирюзовый темный
  '#5A67D8', // Сине-фиолетовый
];

// События для EventBus
export const APP_EVENTS = {
  // События задач
  TASKS_UPDATED: 'tasks:updated',
  TASK_COMPLETED: 'task:completed',
  TASK_CREATED: 'task:created',
  TASK_DELETED: 'task:deleted',
  TASK_UNCOMPLETED: 'task:uncompleted',
  
  // События категорий
  CATEGORIES_UPDATED: 'categories:updated',
  
  // События профиля
  PROFILE_UPDATED: 'profile:updated',
  LEVEL_UP: 'profile:levelUp',
  LEVEL_DOWN: 'profile:levelDown',
  
  // События аватара
  AVATAR_UPDATED: 'avatar:updated',
  
  // События статистики
  STATISTICS_UPDATED: 'statistics:updated',
  
  // События достижений
  ACHIEVEMENTS_UPDATED: 'achievements:updated',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  
  // События настроек
  SETTINGS_UPDATED: 'settings:updated',
  
  // Глобальные события
  DATA_RESET: 'app:dataReset',
  THEME_CHANGED: 'app:themeChanged',
};
