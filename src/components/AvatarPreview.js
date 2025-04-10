import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BODY_TYPES, HAIR_STYLES, EYE_SPRITE, EYE_COLORS } from '../constants/AvatarSprites';

/**
 * Компонент для отображения миниатюры аватара
 */
const AvatarPreview = ({ 
  bodyType = 'typeA',
  skinTone = 'normal',
  hairStyle,
  hairColor,
  eyeColor = '#4A90E2',
  style
}) => {
  // Получаем правильный спрайт в зависимости от типа тела и тона кожи
  const bodySprite = BODY_TYPES[bodyType]?.sprites?.[skinTone] || BODY_TYPES.typeA.sprites.normal;
  
  // Получаем спрайт для волос только если стиль не 'none'
  const hairSprite = hairStyle !== 'none' && HAIR_STYLES[hairStyle]?.sprite;
  
  return (
    <View style={[styles.container, style]}>
      {/* Базовое тело с заданным тоном кожи */}
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
      
      {/* Волосы - в два слоя, только если hairStyle не 'none' */}
      {hairSprite && (
        <>
          {/* Базовый слой волос с цветом */}
          <Image
            source={hairSprite}
            style={[styles.hairSprite, hairColor && { tintColor: hairColor }]}
            resizeMode="contain"
          />
          
          {/* Слой деталей волос */}
          {hairStyle && HAIR_STYLES[hairStyle]?.details && (
            <Image
              source={HAIR_STYLES[hairStyle].details}
              style={styles.hairDetails}
              resizeMode="contain"
            />
          )}
        </>
      )}
    </View>
  );
};

// Стили остаются без изменений
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    aspectRatio: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  baseSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  eyeSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  faceSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
  },
  hairSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 3,
  },
  hairDetails: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 4,
  },
});

export default AvatarPreview;