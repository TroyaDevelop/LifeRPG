import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppContext } from '../context/AppContext';
import { AvatarService } from '../services/AvatarService'; // Добавляем импорт
import Header from '../components/Header';
import Avatar from '../components/Avatar';
import LoadingIndicator from '../components/LoadingIndicator';
import { SKIN_TONES, HAIR_COLORS, HAIR_STYLES, EYE_COLORS, BODY_TYPES } from '../constants/AvatarSprites';
import { Button } from '../components';
import AvatarPreview from '../components/AvatarPreview';

const AvatarCustomizationScreen = ({ navigation }) => {
  // Получаем данные из контекста вместо прямых вызовов сервиса
  const { avatar, updateAvatar, isLoading } = useAppContext();
  
  // Оставляем существующие состояния
  const [currentTab, setCurrentTab] = useState('hair'); // или то, что используется у вас
  const [loading, setLoading] = useState(true);
  // Другие состояния, которые у вас есть

  // Локальное состояние для аватара
  const [localAvatar, setLocalAvatar] = useState(null);
  const [originalAvatarData, setOriginalAvatarData] = useState(null);

  // Загрузка данных аватара при монтировании
  useEffect(() => {
    if (avatar) {
      // Сохраняем оригинальные данные для возможности отмены
      setOriginalAvatarData(JSON.parse(JSON.stringify(avatar)));
      setLocalAvatar(avatar);
      setLoading(false);
    }
  }, [avatar]);

  // Обновленная функция обработки изменений
  const handleUpdateAvatar = (field, value) => {
    // Обновляем ТОЛЬКО локальное состояние, без вызова updateAvatar из контекста
    setLocalAvatar(prevAvatar => ({
      ...prevAvatar,
      [field]: value
    }));
  };

  // Обработчик отмены изменений
  const handleCancel = () => {
    Alert.alert(
      'Отменить изменения?',
      'Все внесённые изменения будут потеряны. Вы уверены?',
      [
        { text: 'Нет', style: 'cancel' },
        { 
          text: 'Да', 
          onPress: () => {
            // Возвращаемся к начальному состоянию и переходим назад
            navigation.goBack();
          }
        }
      ]
    );
  };

  // Рендер для выбора типа тела
  const renderBodyTypeSelection = () => (
    <View style={styles.bodyTypeSelectionContainer}>
      {Object.keys(BODY_TYPES || {}).map((type) => (
        <TouchableOpacity
          key={`body-${type}`}
          style={[
            styles.bodyTypeOption,
            localAvatar?.bodyType === type && styles.selectedBodyTypeOption
          ]}
          onPress={() => handleUpdateAvatar('bodyType', type)}
        >
          <Text style={[
            styles.bodyTypeOptionText,
            localAvatar?.bodyType === type && styles.selectedBodyTypeText // Заменить avatar на localAvatar
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
            localAvatar?.hairStyle === style && styles.selectedSpriteItem
          ]}
          onPress={() => handleUpdateAvatar('hairStyle', style)}
        >
          {style === 'none' ? (
            // Для лысой прически отображаем только базовый спрайт
              <Image 
                source={BODY_TYPES[avatar?.bodyType || 'typeA'].sprites[avatar?.skinTone || 'normal']}
                style={styles.hairPreview}
                resizeMode="contain"
              />
          ) : (
            // Для обычных причесок используем AvatarPreview с передачей тона кожи
            <AvatarPreview
              bodyType={localAvatar?.bodyType || 'typeA'}
              skinTone={localAvatar?.skinTone || 'normal'}
              faceExpression={localAvatar?.faceExpression || 'neutral'}
              hairStyle={style}
              hairColor={HAIR_COLORS[localAvatar?.hairColor] || HAIR_COLORS.brown}
              eyeColor={EYE_COLORS[localAvatar?.eyeColor] || EYE_COLORS.blue}
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

  // Обновленная функция рендеринга цветов волос
const renderHairColorSelection = () => (
  <View style={styles.colorGrid}>
    {Object.keys(HAIR_COLORS).map((color) => (
      <TouchableOpacity
        key={`hair-color-${color}`}
        style={[
          styles.colorOption,
          { backgroundColor: HAIR_COLORS[color] },
          // Добавляем дополнительную тень для светлых цветов
          HAIR_COLORS[color] === '#FFFFFF' || HAIR_COLORS[color] === '#F0F0F0' ? 
            styles.lightColorOption : null,
          localAvatar?.hairColor === color && styles.selectedColorOption
        ]}
        onPress={() => handleUpdateAvatar('hairColor', color)}
      />
    ))}
  </View>
);

// Обновленная функция рендеринга цветов глаз
const renderEyeColorSelection = () => (
  <View style={styles.colorGrid}>
    {Object.keys(EYE_COLORS).map((color) => (
      <TouchableOpacity
        key={`eye-${color}`}
        style={[
          styles.colorOption,
          { backgroundColor: EYE_COLORS[color] },
          // Добавляем дополнительную тень для светлых цветов
          EYE_COLORS[color] === '#FFFFFF' || EYE_COLORS[color] === '#F0F0F0' ? 
            styles.lightColorOption : null,
          localAvatar?.eyeColor === color && styles.selectedColorOption
        ]}
        onPress={() => handleUpdateAvatar('eyeColor', color)}
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
            localAvatar?.skinTone === tone && styles.selectedColorOption
          ]}
          onPress={() => handleUpdateAvatar('skinTone', tone)}
        />
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

  // Обновленная функция сохранения изменений
  const handleSaveAndGoBack = async () => {
    try {
      // Применяем все накопленные изменения сразу при сохранении
      await updateAvatar(localAvatar);
      
      // Инвалидируем кэш аватара перед возвратом
      if (typeof AvatarService.invalidateCache === 'function') {
        AvatarService.invalidateCache();
      }
      
      // Возвращаемся на предыдущий экран
      navigation.goBack();
    } catch (error) {
      console.error('Ошибка при сохранении настроек аватара:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить изменения аватара');
    }
  };

  // Вычисляем цвета из объекта аватар для использования в компоненте
  const hairColor = avatar?.hairColor ? HAIR_COLORS[avatar.hairColor] : HAIR_COLORS.brown;
  const eyeColor = avatar?.eyeColor ? EYE_COLORS[avatar.eyeColor] : EYE_COLORS.blue;

  // Проверка на загрузку
  if (loading || isLoading) {
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
      <Header 
        title="Редактирование внешности" 
        hasBack={true} 
        onBack={handleCancel}  // Используем новую функцию для кнопки назад
      />
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color="#4E64EE" />
          <Text style={styles.loadingText}>Загрузка редактора...</Text>
        </View>
      ) : (
        <>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.avatarPreviewSection}>
              <View style={styles.avatarFrame}>
                <Avatar size="large" style={styles.avatar} avatarData={localAvatar} />
              </View>
              <Text style={styles.previewLabel}>Предпросмотр персонажа</Text>
            </View>

            <View style={styles.customizationSection}>
              {Object.keys(BODY_TYPES || {}).length > 0 && (
                <View style={styles.customizationOption}>
                  <Text style={styles.optionTitle}>Тип тела</Text>
                  {renderBodyTypeSelection()}
                </View>
              )}

              <View style={styles.customizationOption}>
                <Text style={styles.optionTitle}>Тон кожи</Text>
                {renderSkinToneSelection()}
              </View>
              
              <View style={styles.customizationOption}>
                <Text style={styles.optionTitle}>Прическа</Text>
                {renderHairStyleSelection()}
              </View>

              {/* Удаляем блок с выражениями лица */}
              
              <View style={styles.customizationOption}>
                <Text style={styles.optionTitle}>Цвет волос</Text>
                {renderHairColorSelection()}
              </View>
              
              <View style={styles.customizationOption}>
                <Text style={styles.optionTitle}>Цвет глаз</Text>
                {renderEyeColorSelection()}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonsContainer}>
            <Button
              title="Сохранить"
              onPress={handleSaveAndGoBack} // Используем функцию для сохранения
              style={styles.doneButton}
            />
          </View>
        </>
      )}
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
    borderWidth: 1,  // Базовая обводка для всех цветов
    borderColor: '#DDDDDD',  // Серый цвет обводки
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  lightColorOption: {
    borderWidth: 1.5,  // Более толстая обводка для светлых цветов
    borderColor: '#AAAAAA',  // Более тёмная обводка для светлых цветов
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  selectedColorOption: {
    borderWidth: 3,  // Увеличиваем толщину обводки для выбранного элемента
    borderColor: '#4E64EE',  // Синий цвет для выбранного элемента
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