// Типы телосложения с разными спрайтами для разных тонов кожи
export const BODY_TYPES = {
  typeA: {
    sprites: {
      light: require('../../assets/sprites/avatars/male/light.png'),
      normal: require('../../assets/sprites/avatars/male/normal.png'),
      tan: require('../../assets/sprites/avatars/male/tan.png'),
      brown: require('../../assets/sprites/avatars/male/brown.png'),
      dark: require('../../assets/sprites/avatars/male/dark.png'),
    },
    name: 'Тип A',
  },
  typeB: {
    sprites: {
      light: require('../../assets/sprites/avatars/female/light.png'),
      normal: require('../../assets/sprites/avatars/female/normal.png'),
      tan: require('../../assets/sprites/avatars/female/tan.png'),
      brown: require('../../assets/sprites/avatars/female/brown.png'),
      dark: require('../../assets/sprites/avatars/female/dark.png'),
    },
    name: 'Тип B',
  },
};

// Прически
export const HAIR_STYLES = {
  none: {  // Добавляем лысую прическу
    sprite: null,  // Для лысой прически спрайт не нужен
    name: 'Без волос',
  },
  short: {
    sprite: require('../../assets/sprites/avatars/hair/short.png'),
    name: 'Короткие',
  },
  medium: {
    sprite: require('../../assets/sprites/avatars/hair/medium.png'),
    name: 'Средние',
  },
  long: {
    sprite: require('../../assets/sprites/avatars/hair/long.png'),
    name: 'Длинные',
  },
  ponytail: {
    sprite: require('../../assets/sprites/avatars/hair/ponytail.png'),
    name: 'Хвост',
  },
};

// Расширенная палитра цветов волос
export const HAIR_COLORS = {
  black: '#111111',
  brown: '#6B4226',
  blonde: '#E6BE8A',
  red: '#8D4A43',
  blue: '#5B6BBF',
  green: '#3D9956',
  purple: '#8A2BE2',
  pink: '#FF69B4',
  white: '#FFFFFF',
  gray: '#808080',
  cyan: '#00FFFF',
  orange: '#FF8C00',
};

// Оттенки кожи с разными спрайтами для каждого тона
export const SKIN_TONES = {
  light: {
    color: '#FFE0BD',
    name: 'Светлый',
  },
  normal: {
    color: '#F8D5AC',
    name: 'Обычный',
  },
  tan: {
    color: '#E0BE96',
    name: 'Загорелый',
  },
  brown: {
    color: '#C69076',
    name: 'Смуглый',
  },
  dark: {
    color: '#9C7248',
    name: 'Тёмный',
  },
};

// Спрайт зрачков - добавляем один вид зрачков
export const EYE_SPRITE = require('../../assets/sprites/avatars/eyes/regular.png');

// Расширенная палитра цветов глаз
export const EYE_COLORS = {
  blue: '#4A90E2',
  green: '#50E3C2',
  brown: '#8B572A',
  black: '#393939',
  purple: '#9013FE',
  red: '#FF3B30',
  amber: '#FFBF00',
  gray: '#9E9E9E',
  turquoise: '#40E0D0',
  gold: '#FFD700',
  silver: '#C0C0C0',
  pink: '#FF69B4',
};

// Выражения лица - добавляем миниатюры для редактора
export const FACE_EXPRESSIONS = {
  neutral: {
    sprite: null, // Спрайт для нейтрального выражения
    thumbnail: require('../../assets/sprites/avatars/thumbnails/face/neutral.png'),
    name: 'Нейтральное'
  },
  };

// Добавим константы для будущих фонов и элементов окружения

export const BACKGROUNDS = {
  default: null, // В будущем здесь будет путь к изображению фона
  forest: null, 
  castle: null,
  library: null,
};

export const ENVIRONMENT_ITEMS = {
  table: null,
  chair: null,
  bookshelf: null,
  trophy: null,
};