import React, { useState, useEffect, memo } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { AvatarService } from '../services/AvatarService';
import { EquipmentService } from '../services';
import { BODY_TYPES, HAIR_STYLES, HAIR_COLORS, EYE_SPRITE, EYE_COLORS } from '../constants/AvatarSprites'; 
import LoadingIndicator from './LoadingIndicator';

/**
 * Универсальный компонент аватара с возможностью отображения снаряжения
 * @param {string} size - размер аватара ('small', 'medium', 'large', 'xlarge')
 * @param {Function} onPress - функция-обработчик нажатия
 * @param {Object} style - дополнительные стили
 * @param {Object} avatarData - данные аватара
 * @param {boolean} showEquipment - флаг отображения снаряжения
 */
const Avatar = ({ size = 'medium', onPress, style, avatarData, showEquipment = false }) => {
  // Используем переданные данные или загружаем, если их нет
  const [avatar, setAvatar] = useState(avatarData || null);
  const [loading, setLoading] = useState(!avatarData);
  const [equippedItems, setEquippedItems] = useState({});
  const [loadingEquipment, setLoadingEquipment] = useState(showEquipment);

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

  // Загружаем снаряжение, если нужно его отображать
  useEffect(() => {
    if (showEquipment) {
      const loadEquippedItems = async () => {
        setLoadingEquipment(true);
        try {
          const equipmentService = new EquipmentService();
          const items = await equipmentService.getEquippedItems();
          
          // Группируем предметы по типу
          const equipped = {};
          items.forEach(item => {
            equipped[item.type] = item;
          });
          
          setEquippedItems(equipped);
        } catch (error) {
          console.error('Ошибка при загрузке снаряжения:', error);
        } finally {
          setLoadingEquipment(false);
        }
      };
      
      loadEquippedItems();
    }
  }, [showEquipment]);

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
  if (loading || (showEquipment && loadingEquipment)) {
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

  // Функция для получения цвета снаряжения по редкости
  const getEquipmentColor = (rarity) => {
    switch (rarity) {
      case 'legendary': return '#FF8C00'; // Оранжевый
      case 'epic': return '#9013FE';      // Фиолетовый
      case 'rare': return '#4E64EE';      // Синий
      default: return '#48BB78';          // Зеленый (common)
    }
  };

  // Функция для получения стилей элемента снаряжения
  const getEquipmentStyle = (type) => {
    if (!equippedItems[type]) return null;
    
    const item = equippedItems[type];
    
    return { 
      backgroundColor: getEquipmentColor(item.rarity),
    };
  };

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
        
        {/* Слой снаряжения - отображаем только если showEquipment=true */}
        {showEquipment && (
          <View style={styles.equipmentLayer}>
            {/* Предмет для головы */}
            {equippedItems.head && (
              <View 
                style={[
                  styles.headSlot, 
                  getEquipmentStyle('head')
                ]} 
              />
            )}
            
            {/* Предмет для тела */}
            {equippedItems.body && (
              <View 
                style={[
                  styles.bodySlot, 
                  getEquipmentStyle('body')
                ]} 
              />
            )}
            
            {/* Предмет для ног */}
            {equippedItems.legs && (
              <View 
                style={[
                  styles.legsSlot, 
                  getEquipmentStyle('legs')
                ]} 
              />
            )}
            
            {/* Предмет для обуви */}
            {equippedItems.footwear && (
              <View 
                style={[
                  styles.footwearSlot, 
                  getEquipmentStyle('footwear')
                ]} 
              />
            )}
            
            {/* Предмет для оружия */}
            {equippedItems.weapon && (
              <View 
                style={[
                  styles.weaponSlot, 
                  getEquipmentStyle('weapon')
                ]} 
              />
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// Расширенные стили, включающие и аватар, и снаряжение
const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden', // Ограничиваем видимую область
    borderRadius: 12, // Немного скругляем края
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
  // Стили для слоя снаряжения
  equipmentLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%', 
    height: '100%',
    zIndex: 5, // Поверх всего остального
  },
  headSlot: {
    position: 'absolute',
    top: '5%',
    left: '30%',
    width: '40%',
    height: '20%',
    borderRadius: 20,
    opacity: 0.8,
  },
  bodySlot: {
    position: 'absolute',
    top: '25%',
    left: '20%',
    width: '60%',
    height: '30%',
    borderRadius: 10,
    opacity: 0.8,
  },
  legsSlot: {
    position: 'absolute',
    top: '55%',
    left: '30%',
    width: '40%',
    height: '25%',
    borderRadius: 10,
    opacity: 0.8,
  },
  footwearSlot: {
    position: 'absolute',
    top: '80%',
    left: '30%',
    width: '40%',
    height: '15%',
    borderRadius: 5,
    opacity: 0.8,
  },
  weaponSlot: {
    position: 'absolute',
    top: '40%',
    right: '5%',
    width: '20%',
    height: '30%',
    borderRadius: 5,
    opacity: 0.8,
  },
});

export default memo(Avatar);