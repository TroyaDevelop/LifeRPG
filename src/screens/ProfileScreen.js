import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileService } from '../services/ProfileService';
import { AvatarService } from '../services/AvatarService';
import Avatar from '../components/Avatar';
import Header from '../components/Header';
import LevelProgressBar from '../components/LevelProgressBar';
import { BODY_TYPES, HAIR_STYLES, HAIR_COLORS, SKIN_TONES, EYE_COLORS } from '../constants/AvatarSprites';
import LoadingIndicator from '../components/LoadingIndicator';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка профиля и аватара
  useEffect(() => {
    const loadProfileData = async () => {
      try {
        // Используем экземпляр профиль-сервиса
        const profileService = ProfileService.getInstance();
        const userProfile = await profileService.getProfile();
        const userAvatar = await AvatarService.getAvatar();
        
        setProfile(userProfile);
        setAvatar(userAvatar);
      } catch (error) {
        console.error('Ошибка при загрузке данных профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
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

  // Обновляем функцию renderBaseSelection на renderBodyTypeSelection
  const renderBodyTypeSelection = () => (
    <View style={styles.bodyTypeSelectionContainer}>
      <TouchableOpacity
        style={[
          styles.bodyTypeOption,
          avatar?.bodyType === 'typeA' && styles.selectedBodyTypeOption
        ]}
        onPress={() => handleUpdateAvatar('bodyType', 'typeA')}
      >
        <Text style={[
          styles.bodyTypeOptionText,
          avatar?.bodyType === 'typeA' && styles.selectedBodyTypeText
        ]}>Тип A</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.bodyTypeOption,
          avatar?.bodyType === 'typeB' && styles.selectedBodyTypeOption
        ]}
        onPress={() => handleUpdateAvatar('bodyType', 'typeB')}
      >
        <Text style={[
          styles.bodyTypeOptionText,
          avatar?.bodyType === 'typeB' && styles.selectedBodyTypeText
        ]}>Тип B</Text>
      </TouchableOpacity>
    </View>
  );

  // Рендер для выбора прически
  const renderHairStyleSelection = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScrollView}>
      {Object.keys(HAIR_STYLES).map((style) => (
        <TouchableOpacity
          key={`hair-${style}`}
          style={[
            styles.optionItem,
            avatar?.hairStyle === style && styles.selectedOption
          ]}
          onPress={() => handleUpdateAvatar('hairStyle', style)}
        >
          <Text style={styles.optionText}>{HAIR_STYLES[style].name}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );

  // Рендер для выбора цвета волос
  const renderHairColorSelection = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScrollView}>
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
    </ScrollView>
  );

  // Рендер для выбора тона кожи
  const renderSkinToneSelection = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScrollView}>
      {Object.keys(SKIN_TONES).map((tone) => (
        <TouchableOpacity
          key={`skin-${tone}`}
          style={[
            styles.colorOption,
            { backgroundColor: SKIN_TONES[tone] },
            avatar?.skinTone === tone && styles.selectedColorOption
          ]}
          onPress={() => handleUpdateAvatar('skinTone', tone)}
        />
      ))}
    </ScrollView>
  );

  // Рендер для выбора цвета глаз
  const renderEyeColorSelection = () => (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.optionsScrollView}>
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
    </ScrollView>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Header title="Профиль" hasBack={true} onBack={() => navigation.goBack()} />
        <View style={styles.loadingContainer}>
          <LoadingIndicator size="large" color="#4E64EE" />
          <Text style={styles.loadingText}>Загрузка профиля...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Профиль" hasBack={true} onBack={() => navigation.goBack()} />
      
      <ScrollView style={styles.scrollView}>
        {/* Информация о персонаже */}
        <View style={styles.profileSection}>
          {/* Передаем текущее состояние аватара в компонент Avatar */}
          <Avatar size="large" style={styles.avatar} avatarData={avatar} />
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Уровень {profile?.level}</Text>
            {profile && <LevelProgressBar profile={profile} style={styles.levelProgress} />}
            
            <View style={styles.statsContainer}>
              {/* Удаляем блок со статистикой опыта */}
              
              {/* Оставляем только информацию о выполненных задачах */}
              <View style={styles.statItem}>
                <Ionicons name="checkbox" size={24} color="#4E64EE" />
                <Text style={styles.statValue}>{profile?.tasksCompleted || 0}</Text>
                <Text style={styles.statLabel}>Выполнено задач</Text>
              </View>
            </View>
          </View>
        </View>
        
        {/* Настройки аватара */}
        <View style={styles.customizationSection}>
          <Text style={styles.sectionTitle}>Настройки персонажа</Text>
          
          <View style={styles.customizationOption}>
            <Text style={styles.optionTitle}>Тип тела</Text>
            {renderBodyTypeSelection()}
          </View>
          
          <View style={styles.customizationOption}>
            <Text style={styles.optionTitle}>Прическа</Text>
            {renderHairStyleSelection()}
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
  profileSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    margin: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    marginBottom: 16,
    borderWidth: 3,
    borderColor: '#4E64EE',
    borderRadius: 8, // Изменяем на квадрат с закругленными углами
    backgroundColor: '#E9EDF5', // Соответствует цвету фона в Avatar
    // Возможно добавить тень для более интересного эффекта
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  profileInfo: {
    width: '100%',
    alignItems: 'center',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 12,
  },
  levelProgress: {
    width: '100%',
    marginBottom: 16,
  },
  statsContainer: {
    justifyContent: 'center', // Центрируем контент
    width: '100%',
    marginTop: 10, // Добавляем отступ сверху
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 10, // Добавляем вертикальный отступ
  },
  statValue: {
    fontSize: 22, // Увеличиваем размер шрифта для лучшей видимости
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 6, // Увеличиваем отступы
  },
  statLabel: {
    fontSize: 14,
    color: '#888888',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  customizationOption: {
    marginBottom: 16,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    marginBottom: 8,
  },
  optionsScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#F0F3FF',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedOption: {
    backgroundColor: '#4E64EE',
  },
  optionText: {
    fontSize: 14,
    color: '#4E64EE',
    fontWeight: '500',
  },
  colorOption: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#4E64EE',
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
});

export default ProfileScreen;