import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProfileService } from '../services/ProfileService';
import { AvatarService } from '../services/AvatarService';
import Avatar from '../components/Avatar';
import Header from '../components/Header';
import LevelProgressBar from '../components/LevelProgressBar';
import LoadingIndicator from '../components/LoadingIndicator';
// Обновляем импорт компонентов
import { Button, HealthBar, EnergyBar, CurrencyRow, CharacterStats } from '../components';
// Добавьте импорт useAppContext
import { useAppContext } from '../context/AppContext';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarSize, setAvatarSize] = useState('large');
  
  // Добавьте извлечение параметров из контекста
  const { health, maxHealth, energy, maxEnergy, actus, taskCoins } = useAppContext();

  // Функция для переключения размера аватара
  const toggleAvatarSize = () => {
    setAvatarSize(prev => prev === 'large' ? 'xlarge' : 'large');
  };

  // Функция загрузки данных профиля и аватара
  const loadProfileData = async () => {
    try {
      setLoading(true);
      // Используем getInstance(), так как ProfileService - это синглтон
      const profileService = ProfileService.getInstance();
      const userProfile = await profileService.getProfile();
      const userAvatar = await AvatarService.getAvatar(true); // Форсируем свежие данные
      
      setProfile(userProfile);
      setAvatar(userAvatar);
    } catch (error) {
      console.error('Ошибка при загрузке данных профиля:', error);
    } finally {
      setLoading(false);
    }
  };

  // Загрузка профиля при первом рендере
  useEffect(() => {
    loadProfileData();
  }, []);

  // Важное дополнение: обновляем данные при каждом фокусе на экране
  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [])
  );

  // Определяем размеры аватара
  const getAvatarSize = (size) => {
    switch (size) {
      case 'small': return 64;
      case 'medium': return 120;
      case 'large': return 180;
      case 'xlarge': return 240;
      default: return 180;
    }
  };

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
          <View style={styles.avatarContainer}>
            <TouchableOpacity 
              onPress={toggleAvatarSize}
              activeOpacity={0.8}
              style={[
                styles.avatarWrapper,
                {
                  // Возвращаем квадратную рамку
                  width: avatarSize === 'xlarge' ? 260 : 200,
                  height: avatarSize === 'xlarge' ? 260 : 200,
                  borderRadius: 20, // Фиксированный радиус для квадратной рамки с закругленными углами
                }
              ]}
            >
              <Avatar 
                size={avatarSize === 'xlarge' ? 'xlarge' : 'large'} // Явно указываем размер
                style={styles.avatar}
                avatarData={avatar} 
                showEquipment={true}
              />
              
              {/* Иконка увеличения/уменьшения */}
              <View style={styles.zoomIconContainer}>
                <Ionicons 
                  name={avatarSize === 'large' ? 'expand-outline' : 'contract-outline'} 
                  size={24} 
                  color="#FFFFFF" 
                />
              </View>
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            {profile && <LevelProgressBar profile={profile} style={styles.levelProgress} />}
            
            <View style={styles.resourcesContainer}>
              <HealthBar 
                health={health} 
                maxHealth={maxHealth} 
                style={styles.resourceBar} 
              />
              <EnergyBar 
                energy={energy} 
                maxEnergy={maxEnergy} 
                style={styles.resourceBar} 
              />
              {/* Отображение валюты в одном ряду */}
              <CurrencyRow 
                actus={actus} 
                taskCoins={taskCoins} 
                style={styles.currencyRow} 
              />
            </View>
            
            {/* Блок статистики удален */}
          </View>

          {/* Добавляем кнопку для перехода на экран редактирования аватара */}
          <Button 
            title="Изменить внешность" 
            onPress={() => navigation.navigate('AvatarCustomization')}
            icon="brush-outline"
            style={styles.editAvatarButton}
          />
          
          {/* Добавляем кнопку для перехода в инвентарь */}
          <Button 
            title="Инвентарь" 
            onPress={() => navigation.navigate('Inventory')}
            icon="briefcase-outline"
            style={styles.editAvatarButton}
          />
          
          {/* Кнопка "Магазин снаряжения" удалена, она перенесена в SettingsScreen */}
        </View>
        
        <View style={styles.resourcesInfoSection}>
          <Text style={styles.sectionTitle}>Ресурсы персонажа</Text>
          
          <View style={styles.resourceInfo}>
            <View style={styles.resourceIconContainer}>
              <Ionicons name="heart" size={24} color="#FF3B30" />
            </View>
            <View style={styles.resourceTextContainer}>
              <Text style={styles.resourceTitle}>Здоровье</Text>
              <Text style={styles.resourceDescription}>
                Снижается при невыполнении ежедневных задач. 
                Восстанавливается медленно при выполнении всех ежедневных задач.
              </Text>
            </View>
          </View>
          
          <View style={styles.resourceInfo}>
            <View style={styles.resourceIconContainer}>
              <Ionicons name="flash" size={24} color="#5AC8FA" />
            </View>
            <View style={styles.resourceTextContainer}>
              <Text style={styles.resourceTitle}>Энергия</Text>
              <Text style={styles.resourceDescription}>
                Тратится при выполнении задач для получения опыта. 
                Полностью восстанавливается каждый день.
              </Text>
            </View>
          </View>
          
          <View style={styles.resourceInfo}>
            <View style={styles.resourceIconContainer}>
              <Ionicons name="cash-outline" size={24} color="#4CD964" />
            </View>
            <View style={styles.resourceTextContainer}>
              <Text style={styles.resourceTitle}>Актусы</Text>
              <Text style={styles.resourceDescription}>
                Основная игровая валюта. Получается за выполнение задач.
                Используется для покупки снаряжения и улучшений.
              </Text>
            </View>
          </View>
          
          <View style={styles.resourceInfo}>
            <View style={styles.resourceIconContainer}>
              <Ionicons name="diamond-outline" size={24} color="#FF9500" />
            </View>
            <View style={styles.resourceTextContainer}>
              <Text style={styles.resourceTitle}>TaskCoin</Text>
              <Text style={styles.resourceDescription}>
                Премиум-валюта. Получается за выполнение особых достижений
                и при повышении уровня. Используется для покупки редких предметов.
              </Text>
            </View>
          </View>
          
        </View>
        
        {/* Добавляем компонент CharacterStats */}
        <CharacterStats style={styles.characterStatsSection} />
        
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
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '100%',
  },
  avatarWrapper: {
    borderWidth: 3,
    borderColor: '#4E64EE',
    backgroundColor: '#F0F3FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden', // Важно! Это не позволит аватару выйти за пределы
    position: 'relative', // Для правильного позиционирования дочерних элементов
  },
  avatar: {
    width: '92%', // Чуть меньше контейнера для гарантии
    height: '92%',
    // Используем абсолютное позиционирование для центрирования
    position: 'absolute',
    top: '4%',
    left: '4%',
  },
  zoomIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(78, 100, 238, 0.7)',
    borderRadius: 15,
    padding: 5,
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
  resourcesContainer: {
    width: '100%',
    marginTop: 8,
    marginBottom: 16,
  },
  resourceBar: {
    marginBottom: 8,
  },
  // Стили для блока статистики удалены
  editAvatarButton: {
    marginTop: 16,
    width: '100%',
  },
  resourcesInfoSection: {
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
  resourceInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  resourceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F3FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  resourceTextContainer: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  currencyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  currencyItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  characterStats: {
    marginTop: 16,
  },
  characterStatsSection: {
    margin: 16,
    marginTop: 0,
    marginBottom: 24,
  },
});

export default ProfileScreen;