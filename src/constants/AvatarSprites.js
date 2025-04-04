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
  none: {  
    sprite: null,
  },
  short: {
    sprite: require('../../assets/sprites/avatars/hair/short.png'),        // Базовая форма без деталей
    details: require('../../assets/sprites/avatars/hair/short_details.png'), // Детали (тени/блики)
  },
  square: {
    sprite: require('../../assets/sprites/avatars/hair/square.png'),
    details: require('../../assets/sprites/avatars/hair/square_details.png'),
  },
  emo: {
    sprite: require('../../assets/sprites/avatars/hair/emo.png'),
    details: require('../../assets/sprites/avatars/hair/emo_details.png'),
  },
  medium: {
    sprite: require('../../assets/sprites/avatars/hair/medium.png'),
    details: require('../../assets/sprites/avatars/hair/medium_details.png'),
  },
  straight: {
    sprite: require('../../assets/sprites/avatars/hair/straight.png'),
    details: require('../../assets/sprites/avatars/hair/straight_details.png'),
  },
  long: {
    sprite: require('../../assets/sprites/avatars/hair/long.png'),
    details: require('../../assets/sprites/avatars/hair/long_details.png'),
  },
  ponytail: {
    sprite: require('../../assets/sprites/avatars/hair/ponytail.png'),
    details: require('../../assets/sprites/avatars/hair/ponytail_details.png'),
  },
  afro: {
    sprite: require('../../assets/sprites/avatars/hair/afro.png'),
    details: require('../../assets/sprites/avatars/hair/afro_details.png'),
  },
};

// Расширенная палитра цветов волос
export const HAIR_COLORS = {
  darkBrown: '#2C222B',     // Тёмно-коричневый/Чёрный
  brown: '#6B4226',         // Коричневый
  lightBrown: '#8D6A47',    // Светло-коричневый
  blonde: '#E6BE8A',        // Светло-русый/Блонд
  darkBlonde: '#C19A49',    // Тёмно-русый
  auburn: '#922724',        // Каштановый
  ginger: '#D74E26',        // Рыжий
  gray: '#ABABAB',          // Серый/Седой
  white: '#FFFFFF',         // Белый/Платиновый
  blue: '#5B6BBF',          // Синий
  purple: '#8A2BE2',        // Фиолетовый
  green: '#3D9956',         // Зелёный
  pink: '#FF69B4',          // Розовый
  cyan: '#00FFFF',          // Голубой
  red: '#FF0000',           // Ярко-красный
  orange: '#FF8C00',        // Оранжевый
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
  darkBrown: '#3B2314',     // Тёмно-карий
  brown: '#6B4226',         // Карий
  hazel: '#9E6B4A',         // Ореховый
  amber: '#FFBF00',         // Янтарный
  green: '#3D7A40',         // Зелёный
  lightGreen: '#50E3C2',    // Светло-зелёный
  blue: '#4A90E2',          // Голубой
  darkBlue: '#1F4788',      // Синий
  gray: '#808080',          // Серый
  violet: '#9013FE',        // Фиолетовый
  red: '#FF0000',          // Красный
  pink: '#FF69B4',          // Розовый
  yellow: '#FFDB58',        // Жёлтый
  black: '#111111',         // Чёрный
  white: '#FFFFFF',         // Белый
  
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