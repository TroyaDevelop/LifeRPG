import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { AvatarService } from '../services/AvatarService';
import LoadingIndicator from './LoadingIndicator';
import { BODY_TYPES, HAIR_STYLES, HAIR_COLORS, FACE_EXPRESSIONS, EYE_SPRITE, EYE_COLORS } from '../constants/AvatarSprites';

const Avatar = ({ size = 'medium', onPress, style, avatarData }) => {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем данные аватара при монтировании компонента или при изменении avatarData
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        if (avatarData) {
          setAvatar(avatarData);
          setLoading(false);
        } else {
          const userAvatar = await AvatarService.getAvatar();
          setAvatar(userAvatar);
          setLoading(false);
        }
      } catch (error) {
        console.error('Ошибка при загрузке аватара:', error);
        setLoading(false);
      }
    };

    loadAvatar();
  }, [avatarData]);

  // Определяем размеры аватара в зависимости от переданного параметра
  const getSize = () => {
    switch (size) {
      case 'small':
        return 64;
      case 'medium':
        return 120;
      case 'large':
        return 180;
      case 'xlarge':
        return 240;
      default:
        // Если передано числовое значение
        return typeof size === 'number' ? size : 120;
    }
  };

  const avatarSize = getSize();

  if (loading) {
    return (
      <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
        <LoadingIndicator size="small" />
      </View>
    );
  }

  // Определяем тип тела и тон кожи
  const bodyType = avatar?.bodyType || 'typeA';
  const skinTone = avatar?.skinTone || 'normal';
  
  // Получаем правильный спрайт в зависимости от типа тела и тона кожи
  const bodySprite = BODY_TYPES[bodyType]?.sprites?.[skinTone] || BODY_TYPES.typeA.sprites.normal;
  
  const hairStyle = avatar?.hairStyle && HAIR_STYLES[avatar.hairStyle] && avatar.hairStyle !== 'none' ? 
    HAIR_STYLES[avatar.hairStyle].sprite : null;
  
  const hairColor = avatar?.hairColor ? HAIR_COLORS[avatar.hairColor] : HAIR_COLORS.brown;

  const faceExpression = avatar?.faceExpression && FACE_EXPRESSIONS[avatar.faceExpression]?.sprite ?
    FACE_EXPRESSIONS[avatar.faceExpression].sprite : FACE_EXPRESSIONS.neutral.sprite;
    
  const eyeColor = avatar?.eyeColor ? EYE_COLORS[avatar.eyeColor] : EYE_COLORS.blue;

  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      <View style={styles.spriteContainer}>
        {/* Базовый спрайт персонажа с нужным тоном кожи */}
        <Image
          source={bodySprite}
          style={styles.baseSprite}
          resizeMode="contain"
        />
        
        {/* Зрачки глаз */}
        <Image
          source={EYE_SPRITE}
          style={[styles.eyeSprite, { tintColor: eyeColor }]}
          resizeMode="contain"
        />
        
        {/* Выражение лица персонажа */}
        <Image
          source={faceExpression}
          style={styles.faceExpression}
          resizeMode="contain"
        />
        
        {/* Прическа персонажа */}
        {hairStyle && (
          <Image
            source={hairStyle}
            style={[styles.hairStyle, { tintColor: hairColor }]}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
};

// Обновляем стили для аватара
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ограничиваем видимую область
  },
  spriteContainer: {
    width: '95%', // Немного уменьшаем размер спрайтов
    height: '95%',
    position: 'relative',
  },
  baseSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
  },
  eyeSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
    top: 0,
    left: 0,
  },
  faceExpression: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
    top: 0,
    left: 0,
  },
  hairStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 3,
    top: 0,
    left: 0,
  },
});

export default Avatar;