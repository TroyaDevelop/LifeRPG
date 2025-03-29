import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { AvatarService } from '../services/AvatarService';
import { BASE_SPRITES, HAIR_STYLES, HAIR_COLORS, SKIN_TONES, EYE_COLORS } from '../constants/AvatarSprites';
import LoadingIndicator from './LoadingIndicator';

// Добавляем avatarData в props
const Avatar = ({ size = 'medium', onPress, style, avatarData = null }) => {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загружаем данные аватара при монтировании компонента или обновлении avatarData
  useEffect(() => {
    const loadAvatar = async () => {
      try {
        if (avatarData) {
          // Если переданы данные аватара, используем их
          setAvatar(avatarData);
          setLoading(false);
        } else {
          // Иначе загружаем из хранилища
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
  }, [avatarData]); // Зависимость от avatarData для повторного запуска эффекта

  // Определяем размеры аватара в зависимости от переданного параметра
  const getSize = () => {
    switch (size) {
      case 'small':
        return 64;
      case 'medium':
        return 120;
      case 'large':
        return 180;
      default:
        return size; // Если передано числовое значение
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

  // Определяем спрайты для отображения
  const baseSprite = BASE_SPRITES[avatar?.baseSprite] || BASE_SPRITES.default;
  const hairStyle = avatar?.hairStyle ? HAIR_STYLES[avatar.hairStyle]?.sprite : null;
  const hairColor = avatar?.hairColor ? HAIR_COLORS[avatar.hairColor] : HAIR_COLORS.brown;
  
  return (
    <View style={[styles.container, { width: avatarSize, height: avatarSize }, style]}>
      {/* Базовый спрайт персонажа */}
      <Image
        source={baseSprite}
        style={styles.baseSprite}
        resizeMode="contain"
      />
      
      {/* Здесь будут добавляться другие элементы аватара (волосы, глаза, снаряжение и т.д.) */}
      {hairStyle && (
        <Image
          source={hairStyle}
          style={[styles.hairStyle, { tintColor: hairColor }]}
          resizeMode="contain"
        />
      )}
      
      {/* Место для будущих слоев снаряжения */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    aspectRatio: 1,
  },
  baseSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  hairStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
});

export default Avatar;