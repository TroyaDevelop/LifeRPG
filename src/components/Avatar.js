import React, { useState, useEffect, memo } from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { AvatarService } from '../services/AvatarService';
import { EquipmentService } from '../services';
import { BODY_TYPES, HAIR_STYLES, HAIR_COLORS, EYE_SPRITE, EYE_COLORS } from '../constants/AvatarSprites'; 
import { ALL_EQUIPMENT_SPRITES, RARITY_COLORS } from '../constants/EquipmentSprites';
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
  // Важное изменение: добавляем avatarData в зависимости, чтобы
  // компонент перезагружал снаряжение при изменении аватара
  useEffect(() => {
    if (showEquipment) {
      const loadEquippedItems = async () => {
        setLoadingEquipment(true);
        try {
          const equipmentService = new EquipmentService();
          const items = await equipmentService.getEquippedItems();
          console.log('Avatar: Loaded equipped items:', items.length);
          
          // Группируем предметы по типу
          const equipped = {};
          items.forEach(item => {
            equipped[item.type] = item;
            console.log(`Avatar: Equipped ${item.type}: ${item.name}`);
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
  }, [showEquipment, avatarData]); // Добавляем avatarData в зависимости

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
    return RARITY_COLORS[rarity] || RARITY_COLORS.common;
  };

  // Функция для получения стилей элемента снаряжения
  const getEquipmentStyle = (type) => {
    if (!equippedItems[type]) return null;
    
    const item = equippedItems[type];
    
    return { 
      backgroundColor: getEquipmentColor(item.rarity),
    };
  };

  // Функция для получения спрайта снаряжения по ID
  const getEquipmentSprite = (item) => {
    // Проверяем, что у предмета есть originalId (оригинальный ID)
    const itemId = item.originalId || item.id;
    
    // Сначала попробуем найти спрайт по originalId, затем по id без суффикса _player_
    let sprite = null;
    
    if (ALL_EQUIPMENT_SPRITES[itemId]) {
      sprite = ALL_EQUIPMENT_SPRITES[itemId].sprite;
    } 
    // Если не нашли по точному совпадению, пробуем найти базовый ID
    else if (item.id && item.id.includes('_player_')) {
      // Извлекаем базовый ID, убирая суффикс _player_timestamp
      const baseId = item.id.split('_player_')[0];
      if (ALL_EQUIPMENT_SPRITES[baseId]) {
        sprite = ALL_EQUIPMENT_SPRITES[baseId].sprite;
      }
    }

    console.log('Equipment debug - Item:', item.name);
    console.log('ID:', item.id);
    console.log('OriginalID:', item.originalId);
    console.log('Looking for sprite with ID:', itemId);
    console.log('Found sprite:', sprite ? 'YES' : 'NO');
    
    return sprite;
  };

  // Проверяем, должны ли мы скрыть волосы из-за головного убора
  const shouldHideHair = () => {
    // Если есть головной убор и прическа - афро, скрываем волосы
    return showEquipment && equippedItems.head && avatar.hairStyle === 'afro';
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
        
        {/* Слой снаряжения (тело, ноги, обувь и оружие) - отображаем только если showEquipment=true */}
        {showEquipment && (
          <>
            {/* Предмет для тела */}
            {equippedItems.body && getEquipmentSprite(equippedItems.body) ? (
              <Image 
                source={getEquipmentSprite(equippedItems.body)}
                style={styles.bodySlot}
                resizeMode="contain"
              />
            ) : equippedItems.body && (
              <View 
                style={[
                  styles.bodySlot, 
                  { backgroundColor: getEquipmentColor(equippedItems.body.rarity), opacity: 0.8 }
                ]} 
              />
            )}
            
            {/* Предмет для ног */}
            {equippedItems.legs && getEquipmentSprite(equippedItems.legs) ? (
              <Image 
                source={getEquipmentSprite(equippedItems.legs)}
                style={styles.legsSlot}
                resizeMode="contain"
              />
            ) : equippedItems.legs && (
              <View 
                style={[
                  styles.legsSlot, 
                  { backgroundColor: getEquipmentColor(equippedItems.legs.rarity), opacity: 0.8 }
                ]} 
              />
            )}
            
            {/* Предмет для обуви */}
            {equippedItems.footwear && getEquipmentSprite(equippedItems.footwear) ? (
              <Image 
                source={getEquipmentSprite(equippedItems.footwear)}
                style={styles.footwearSlot}
                resizeMode="contain"
              />
            ) : equippedItems.footwear && (
              <View 
                style={[
                  styles.footwearSlot, 
                  { backgroundColor: getEquipmentColor(equippedItems.footwear.rarity), opacity: 0.8 }
                ]} 
              />
            )}
            
            {/* Предмет для оружия */}
            {equippedItems.weapon && getEquipmentSprite(equippedItems.weapon) ? (
              <Image 
                source={getEquipmentSprite(equippedItems.weapon)}
                style={styles.weaponSlot}
                resizeMode="contain"
              />
            ) : equippedItems.weapon && (
              <View 
                style={[
                  styles.weaponSlot, 
                  { backgroundColor: getEquipmentColor(equippedItems.weapon.rarity), opacity: 0.8 }
                ]} 
              />
            )}
          </>
        )}
        
        {/* Прическа персонажа - в два слоя, но не отображаем афро с шапкой */}
        {hairStyle && !shouldHideHair() && (
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
        
        {/* Головной убор должен быть последним, чтобы отрисоваться поверх всего */}
        {showEquipment && equippedItems.head && getEquipmentSprite(equippedItems.head) ? (
          <Image 
            source={getEquipmentSprite(equippedItems.head)}
            style={styles.headSlot}
            resizeMode="contain"
          />
        ) : showEquipment && equippedItems.head && (
          <View 
            style={[
              styles.headSlot, 
              { backgroundColor: getEquipmentColor(equippedItems.head.rarity), opacity: 0.8 }
            ]} 
          />
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
    width: '100%', 
    height: '100%',
    position: 'relative',
  },
  baseSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  eyeSprite: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 2,
    top: 0,
    left: 0,
  },
  // Слои снаряжения
  equipmentLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%', 
    height: '100%',
    zIndex: 3, // Базовый z-index для слоя снаряжения
  },
  bodySlot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 1,
    zIndex: 3, // Тело (рубашка)
  },
  legsSlot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 1,
    zIndex: 3, // Ноги (тот же уровень, что и тело)
  },
  footwearSlot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 1,
    zIndex: 3, // Обувь (тот же уровень, что и тело)
  },
  weaponSlot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 1,
    zIndex: 3, // Оружие (тот же уровень, что и тело)
  },
  // Волосы выше тела, но ниже шапки
  hairStyle: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 4, // Волосы выше тела
    top: 0,
    left: 0,
  },
  hairDetails: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 5, // Детали волос выше базовых волос
    top: 0,
    left: 0,
  },
  // Шапка выше всего
  headSlot: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    opacity: 1,
    zIndex: 10, // Очень высокий z-index, чтобы гарантированно быть поверх всего
  },
});

export default memo(Avatar);