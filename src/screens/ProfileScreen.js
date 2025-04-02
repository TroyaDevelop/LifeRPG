import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProfileService } from '../services/ProfileService';
import { AvatarService } from '../services/AvatarService';
import Avatar from '../components/Avatar';
import Header from '../components/Header';
import LevelProgressBar from '../components/LevelProgressBar';
import LoadingIndicator from '../components/LoadingIndicator';
import { Button } from '../components';

const ProfileScreen = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarSize, setAvatarSize] = useState('large'); // По умолчанию большой

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
                size={avatarSize === 'xlarge' ? 240 : 180} // Явно указываем размер
                style={styles.avatar}
                avatarData={avatar} 
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
            <Text style={styles.profileName}>Уровень {profile?.level}</Text>
            {profile && <LevelProgressBar profile={profile} style={styles.levelProgress} />}
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Ionicons name="checkbox" size={24} color="#4E64EE" />
                <Text style={styles.statValue}>{profile?.tasksCompleted || 0}</Text>
                <Text style={styles.statLabel}>Выполнено задач</Text>
              </View>
            </View>
          </View>

          {/* Добавляем кнопку для перехода на экран редактирования аватара */}
          <Button 
            title="Изменить внешность" 
            onPress={() => navigation.navigate('AvatarCustomization')}
            icon="brush-outline"
            style={styles.editAvatarButton}
          />
        </View>
        
        {/* Удалена секция statsSection со статистикой */}
        
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
  statsContainer: {
    justifyContent: 'center',
    width: '100%',
    marginTop: 10,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333333',
    marginVertical: 6,
  },
  statLabel: {
    fontSize: 14,
    color: '#888888',
  },
  editAvatarButton: {
    marginTop: 16,
    width: '100%',
  }
  // Удалены стили для statsSection и связанных элементов
});

export default ProfileScreen;