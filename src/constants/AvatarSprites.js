export const BASE_SPRITES = {
  default: require('../../assets/sprites/avatars/default.png'),
  male: require('../../assets/sprites/avatars/male.png'),
  female: require('../../assets/sprites/avatars/female.png'),
};

export const HAIR_STYLES = {
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

export const HAIR_COLORS = {
  black: '#111111',
  brown: '#6B4226',
  blonde: '#E6BE8A',
  red: '#8D4A43',
  blue: '#5B6BBF',
  green: '#3D9956',
};

export const SKIN_TONES = {
  light: '#FFE0BD',
  normal: '#F8D5AC',
  tan: '#E0BE96',
  brown: '#C69076',
  dark: '#9C7248',
};

export const EYE_COLORS = {
  blue: '#4A90E2',
  green: '#50E3C2',
  brown: '#8B572A',
  black: '#393939',
  purple: '#9013FE',
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