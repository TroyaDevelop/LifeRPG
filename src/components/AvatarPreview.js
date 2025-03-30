import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { BODY_TYPES, HAIR_STYLES, FACE_EXPRESSIONS, EYE_SPRITE, EYE_COLORS } from '../constants/AvatarSprites';

/**
 * Компонент для отображения миниатюры аватара
 */
const AvatarPreview = ({ 
  bodyType = 'typeA',
  skinTone = 'normal',
  faceExpression = 'neutral',
  hairStyle,
  hairColor,
  eyeColor = '#4A90E2',
  style
}) => {
  // Проверяем и логируем входные данные для отладки
  console.log("AvatarPreview props:", { 
    bodyType, skinTone, faceExpression, hairStyle, 
    hairColor: typeof hairColor === 'string' ? hairColor : JSON.stringify(hairColor),
    eyeColor: typeof eyeColor === 'string' ? eyeColor : JSON.stringify(eyeColor)
  });

  // Получаем правильный спрайт в зависимости от типа тела и тона кожи
  const bodySprite = BODY_TYPES[bodyType]?.sprites?.[skinTone] || BODY_TYPES.typeA.sprites.normal;
  const faceSprite = FACE_EXPRESSIONS[faceExpression]?.sprite || FACE_EXPRESSIONS.neutral.sprite;
  const hairSprite = hairStyle && HAIR_STYLES[hairStyle]?.sprite;
  
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
      
      {/* Выражение лица */}
      <Image
        source={faceSprite}
        style={styles.faceSprite}
        resizeMode="contain"
      />
      
      {/* Прическа - проверяем наличие спрайта */}
      {hairSprite && (
        <Image
          source={hairSprite}
          style={[styles.hairSprite, hairColor && { tintColor: hairColor }]}
          resizeMode="contain"
        />
      )}
    </View>
  );
};

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
});

export default AvatarPreview;