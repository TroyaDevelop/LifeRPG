import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { AvatarService } from '../services/AvatarService';
import Avatar from '../components/Avatar';
import Header from '../components/Header';
import LoadingIndicator from '../components/LoadingIndicator';
import { SKIN_TONES, HAIR_COLORS, HAIR_STYLES, EYE_COLORS, BODY_TYPES, FACE_EXPRESSIONS } from '../constants/AvatarSprites';
import { Button } from '../components';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AvatarPreview from '../components/AvatarPreview';

const AvatarCustomizationScreen = ({ navigation }) => {
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка аватара
  useEffect(() => {
    const loadAvatarData = async () => {
      try {
        const userAvatar = await AvatarService.getAvatar();
        setAvatar(userAvatar);
      } catch (error) {
        console.error('Ошибка при загрузке аватара:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAvatarData();
  }, []);

  // Обновление аватара
  const handleUpdateAvatar = async (field, value) => {
    try {
      const updateData = { [field]: value };
      const updatedAvatar = await AvatarService.updateAvatar(updateData);
      setAvatar(updatedAvatar);
    } catch (error) {
      console.error('Ошибка при обновлении аватара:', error);
    }
  };

  // Рендер для выбора типа тела
  const renderBodyTypeSelection = () => (
    <View style={styles.bodyTypeSelectionContainer}>
      {Object.keys(BODY_TYPES || {}).map((type) => (
        <TouchableOpacity
          key={`body-${type}`}
          style={[
            styles.bodyTypeOption,
            avatar?.bodyType === type && styles.selectedBodyTypeOption
          ]}
          onPress={() => handleUpdateAvatar('bodyType', type)}
        >
          <Text style={[
            styles.bodyTypeOptionText,
            avatar?.bodyType === type && styles.selectedBodyTypeText
          ]}>
            {BODY_TYPES[type]?.name || type}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Обновляем функцию отображения причесок
const renderHairStyleSelection = () => {
  const hairColor = avatar?.hairColor ? HAIR_COLORS[avatar.hairColor] : HAIR_COLORS.brown;
  
  return (
    <View style={styles.spriteGrid}>
      {Object.keys(HAIR_STYLES).map((style) => (
        <TouchableOpacity
          key={`hair-${style}`}
          style={[
            styles.spriteItem,
            avatar?.hairStyle === style && styles.selectedSpriteItem
          ]}
          onPress={() => handleUpdateAvatar('hairStyle', style)}
        >
          {style === 'none' ? (
            // Для лысой прически отображаем только базовый спрайт
            <View style={styles.spriteImageContainer}>
              <Image 
                source={BODY_TYPES[avatar?.bodyType || 'typeA'].sprites[avatar?.skinTone || 'normal']}
                style={styles.hairPreview}
                resizeMode="contain"
              />
              <Text style={styles.spriteLabel}>{HAIR_STYLES[style].name}</Text>
            </View>
          ) : (
            // Для обычных причесок используем AvatarPreview с передачей тона кожи
            <AvatarPreview
              bodyType={avatar?.bodyType || 'typeA'}
              skinTone={avatar?.skinTone || 'normal'} // Добавляем передачу тона кожи
              faceExpression={avatar?.faceExpression || 'neutral'}
              hairStyle={style}
              hairColor={hairColor}
              eyeColor={eyeColor} // Также добавляем цвет глаз
              style={styles.hairPreview}
            />
          )}
          
          {avatar?.hairStyle === style && (
            <View style={styles.selectedOverlay}>
              <Ionicons name="checkmark-circle" size={20} color="#4E64EE" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
};

  // Рендер для выбора цветов волос в сетке
  const renderHairColorSelection = () => (
    <View style={styles.colorGrid}>
      {Object.keys(HAIR_COLORS).map((color) => (
        <TouchableOpacity
          key={`hair-color-${color}`}
          style={[
            styles.colorOption,
            { backgroundColor: HAIR_COLORS[color] },
            avatar?.hairColor === color && styles.selectedColorOption
          ]}
          onPress={() => handleUpdateAvatar('hairColor', color)}
        />
      ))}
    </View>
  );

  // Рендер для выбора тона кожи
  const renderSkinToneSelection = () => (
    <View style={styles.colorGrid}>
      {Object.keys(SKIN_TONES).map((tone) => (
        <TouchableOpacity
          key={`skin-${tone}`}
          style={[
            styles.colorOption,
            { backgroundColor: SKIN_TONES[tone].color },
            avatar?.skinTone === tone && styles.selectedColorOption
          ]}
          onPress={() => handleUpdateAvatar('skinTone', tone)}
        />
      ))}
    </View>
  );

  // Рендер для выбора цвета глаз
  const renderEyeColorSelection = () => (
    <View style={styles.colorGrid}>
      {Object.keys(EYE_COLORS).map((color) => (
        <TouchableOpacity
          key={`eye-${color}`}
          style={[
            styles.colorOption,
            { backgroundColor: EYE_COLORS[color] },
            avatar?.eyeColor === color && styles.selectedColorOption
          ]}
          onPress={() => handleUpdateAvatar('eyeColor', color)}
        />
      ))}
    </View>
  );

  // Обновляем функцию отображения выражений лица с использованием миниатюр
  const renderFaceExpressionSelection = () => (
    <View style={styles.spriteGrid}>
      {Object.keys(FACE_EXPRESSIONS).map((expression) => (
        <TouchableOpacity
          key={`face-${expression}`}
          style={[
            styles.spriteItem,
            avatar?.faceExpression === expression && styles.selectedSpriteItem
          ]}
          onPress={() => handleUpdateAvatar('faceExpression', expression)}
        >
          <Image 
            source={FACE_EXPRESSIONS[expression].thumbnail || FACE_EXPRESSIONS[expression].sprite}
            style={styles.thumbnailSprite}
            resizeMode="contain"
          />
          <Text style={styles.spriteLabel}>{FACE_EXPRESSIONS[expression].name}</Text>
          {avatar?.faceExpression === expression && (
            <View style={styles.selectedOverlay}>
              <Ionicons name="checkmark-circle" size={20} color="#4E64EE" />
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  // Создаем новую функцию для предпросмотра спрайтов с базовым телом
  const renderSpritePreview = (spriteSource, tintColor = null) => {
    return (
      <View style={styles.previewSpriteContainer}>
        <Image 
          source={bodySprite} 
          style={styles.previewBaseSprite} 
          resizeMode="contain"
        />
        {spriteSource && (
          <Image 
            source={spriteSource} 
            style={[
              styles.previewOverlaySprite,
              tintColor && { tintColor }
            ]} 
            resizeMode="contain"
          />
        )}
      </View>
    );
  };

  // Обновим функцию сохранения и возврата
  const handleSaveAndGoBack = async () => {
    try {
      // Инвалидируем кэш аватара перед возвратом
      if (typeof AvatarService.invalidateCache === 'function') {
        AvatarService.invalidateCache();
      }
      
      // Возвращаемся на предыдущий экран
      navigation.goBack();
    } catch (error) {
      console.error('Ошибка при сохранении настроек аватара:', error);
    }
  };

  // Вычисляем цвета из объекта аватар для использования в компоненте
  const hairColor = avatar?.hairColor ? HAIR_COLORS[avatar.hairColor] : HAIR_COLORS.brown;
  const eyeColor = avatar?.eyeColor ? EYE_COLORS[avatar.eyeColor] : EYE_COLORS.blue;

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Редактирование внешности" hasBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color="#4E64EE" />
          <Text style={styles.loadingText}>Загрузка данных...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Редактирование внешности" hasBack={true} onBack={() => navigation.goBack()} />
      
      <ScrollView style={styles.scrollView}>
        {/* Предпросмотр аватара */}
        <View style={styles.avatarPreviewSection}>
          <View style={styles.avatarFrame}>
            <View style={styles.avatarFrameInner}>
              {/* Аватар должен быть немного меньше, чтобы не выходить за рамки */}
              <AvatarPreview
                bodyType={avatar?.bodyType || 'typeA'}
                skinTone={avatar?.skinTone || 'normal'}
                faceExpression={avatar?.faceExpression || 'neutral'}
                hairStyle={avatar?.hairStyle}
                hairColor={hairColor}
                eyeColor={eyeColor}
                style={styles.previewAvatar}
              />
            </View>
          </View>
          <Text style={styles.previewLabel}>Предпросмотр персонажа</Text>
          <Text style={styles.previewDescription}>
            Здесь вы можете увидеть, как будет выглядеть ваш персонаж
          </Text>
        </View>
        
        {/* Настройки аватара */}
        <View style={styles.customizationSection}>
          {Object.keys(BODY_TYPES || {}).length > 0 && (
            <View style={styles.customizationOption}>
              <Text style={styles.optionTitle}>Тип тела</Text>
              {renderBodyTypeSelection()}
            </View>
          )}
          
          <View style={styles.customizationOption}>
            <Text style={styles.optionTitle}>Прическа</Text>
            {renderHairStyleSelection()}
          </View>

          <View style={styles.customizationOption}>
            <Text style={styles.optionTitle}>Выражение лица</Text>
            {renderFaceExpressionSelection()}
          </View>
          
          <View style={styles.customizationOption}>
            <Text style={styles.optionTitle}>Цвет волос</Text>
            {renderHairColorSelection()}
          </View>
          
          <View style={styles.customizationOption}>
            <Text style={styles.optionTitle}>Тон кожи</Text>
            {renderSkinToneSelection()}
          </View>
          
          <View style={styles.customizationOption}>
            <Text style={styles.optionTitle}>Цвет глаз</Text>
            {renderEyeColorSelection()}
          </View>
          
        </View>
      </ScrollView>
      
      <View style={styles.buttonsContainer}>
        <Button
          title="Сохранить изменения"
          onPress={handleSaveAndGoBack}
          style={styles.doneButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  avatarPreviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatarFrame: {
    backgroundColor: '#F0F3FF',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#4E64EE',
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFrameInner: {
    width: '92%', // Немного меньше, чтобы был отступ
    height: '92%',
    borderRadius: 16,
    overflow: 'hidden', // Важно! Обрезаем все выходящее за пределы
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    backgroundColor: 'transparent',
    // Убираем тут все размеры - они задаются через props size
  },
  previewLabel: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  previewDescription: {
    marginTop: 8,
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  customizationSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  customizationOption: {
    marginBottom: 24,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  buttonsContainer: {
    padding: 16,
    paddingBottom: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  doneButton: {
    marginTop: 8,
  },
  bodyTypeSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  bodyTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F3FF',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    width: '45%',
    justifyContent: 'center',
  },
  selectedBodyTypeOption: {
    backgroundColor: '#4E64EE',
  },
  bodyTypeOptionText: {
    fontSize: 16,
    color: '#4E64EE',
    fontWeight: '500',
  },
  selectedBodyTypeText: {
    color: '#FFFFFF',
  },
  spriteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -5,
  },
  spriteItem: {
    width: '30%',    // По 3 элемента в ряду
    aspectRatio: 1,
    marginVertical: 8,
    marginHorizontal: 5,
    borderRadius: 8,
    backgroundColor: '#F0F3FF',
    padding: 4,      // Уменьшаем отступы, чтобы увеличить размер спрайта
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedSpriteItem: {
    borderColor: '#4E64EE',
    borderWidth: 2,
    backgroundColor: '#EEF1FE',
    padding: 3,     // Компенсируем увеличение толщины границы
  },
  hairSprite: {
    width: '95%',   // Увеличиваем размер спрайта
    height: '95%',  // с 90% до 95%
  },
  faceSprite: {
    width: '85%',   // Увеличиваем размер спрайта
    height: '75%',  // Оставляем место для подписи
    marginBottom: 2,
  },
  spriteLabel: {
    fontSize: 10,   // Уменьшаем размер шрифта подписи
    color: '#666666',
    textAlign: 'center',
    marginTop: 2,   // Уменьшаем отступ сверху
  },
  selectedOverlay: {
    position: 'absolute',
    top: 3,
    right: 3,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 0,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#4E64EE',
    transform: [{ scale: 1.1 }],
  },
  // Добавляем новый стиль для контейнера изображения в сетке
  spriteImageContainer: {
    width: '100%',
    height: '85%',  // Для выражений лица оставляем место для текста
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Дополнительные стили для предпросмотра
  previewSpriteContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewBaseSprite: {
    position: 'absolute',
    width: '90%',
    height: '90%',
  },
  previewFaceSprite: {
    position: 'absolute',
    width: '90%',
    height: '90%',
  },
  previewHairSprite: {
    position: 'absolute',
    width: '90%',
    height: '90%',
  },
  thumbnailSprite: {
    width: '75%',
    height: '75%',
    marginBottom: 4,
  },
  hairPreview: {
    width: '90%',
    height: '90%',
  },
});

export default AvatarCustomizationScreen;