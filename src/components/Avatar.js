import React, { useState, useEffect, memo } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { AvatarService } from '../services/AvatarService';
import { BODY_TYPES, HAIR_STYLES, HAIR_COLORS, EYE_SPRITE, EYE_COLORS } from '../constants/AvatarSprites'; 
import LoadingIndicator from './LoadingIndicator';

const Avatar = ({ size = 'medium', onPress, style, avatarData }) => {
  // Используем переданные данные или загружаем, если их нет
  const [avatar, setAvatar] = useState(avatarData || null);
  const [loading, setLoading] = useState(!avatarData);

  // Загружаем данные аватара при монтировании компонента, если они не переданы
  useEffect(() => {
    if (avatarData) {
      setAvatar(avatarData);
      setLoading(false);
      return;
    }
    
    const loadAvatar = async () => {
      try {
        const userAvatar = await AvatarService.getAvatar();
        setAvatar(userAvatar);
      } catch (error) {
        console.error('Ошибка при загрузке аватара:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvatar();
  }, [avatarData]);

  // Определяем размеры аватара
  const getSize = () => {
    switch (size) {
      case 'small': return 64;
      case 'medium': return 120;
      case 'large': return 180;
      case 'xlarge': return 240;
      default: return size; // Если передано числовое значение
    }
  };

  const avatarSize = getSize();

  // Если загрузка, показываем индикатор
  if (loading) {
    return (
      <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
        <LoadingIndicator size="small" />
      </View>
    );
  }

  // Если аватар не загрузился, показываем заглушку
  if (!avatar) {
    return (
      <View style={[styles.container, { width: avatarSize, height: avatarSize, backgroundColor: '#F0F3FF' }, style]}>
        <Text style={{ color: '#4E64EE', fontSize: 12 }}>Аватар недоступен</Text>
      </View>
    );
  }

  const bodyType = avatar?.bodyType || 'typeA';
  const skinTone = avatar?.skinTone || 'normal';
  
  // Получаем правильный спрайт в зависимости от типа тела и тона кожи
  const bodySprite = BODY_TYPES[bodyType]?.sprites?.[skinTone] || BODY_TYPES.typeA.sprites.normal;
  
  const hairStyle = avatar?.hairStyle && HAIR_STYLES[avatar.hairStyle] && avatar.hairStyle !== 'none' ? 
    HAIR_STYLES[avatar.hairStyle].sprite : null;
  
  const hairColor = avatar?.hairColor ? HAIR_COLORS[avatar.hairColor] : HAIR_COLORS.brown;
    
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
        
        {/* Прическа персонажа - в два слоя */}
        {hairStyle && (
          <>
            {/* Базовая форма волос с применением цвета */}
            <Image
              source={hairStyle}
              style={[styles.hairStyle, { tintColor: hairColor }]}
              resizeMode="contain"
            />
            
            {/* Детали волос (тени и блики) */}
            {HAIR_STYLES[avatar.hairStyle]?.details && (
              <Image
                source={HAIR_STYLES[avatar.hairStyle].details}
                style={styles.hairDetails}
                resizeMode="contain"
              />
            )}
          </>
        )}
        
        {/* Убираем выражение лица */}
      </View>
    </View>
  );
};

// Стили остаются без изменений
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
    zIndex: 4, // Поверх всех остальных элементов
    top: 0,
    left: 0,
  },
  hairStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2, // Под деталями волос, но выше базового спрайта
    top: 0,
    left: 0,
  },
  hairDetails: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 3, // Поверх базовых волос
    top: 0,
    left: 0,
  },
});

export default memo(Avatar);