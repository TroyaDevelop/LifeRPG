import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import Modal from '../components/Modal';
import { useAppContext } from '../context/AppContext'; // Импортируем хук контекста

export default function SettingsScreen({ navigation }) {
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetOptions, setResetOptions] = useState({
    resetProfile: true,
    resetTasks: true,
    resetAchievements: true,
    resetStatistics: true,
    resetCategories: true
  });
  const [isResetting, setIsResetting] = useState(false);
  
  // Корректно получаем функции из контекста
  const { resetProgress, refreshData } = useAppContext();

  const menuItems = [
    {
      id: 'statistics',
      title: 'Статистика',
      icon: 'bar-chart-outline',
      description: 'Просмотр статистики выполнения задач',
      onPress: () => navigation.navigate('Statistics')
    },
    {
      id: 'achievements',
      title: 'Достижения',
      icon: 'trophy-outline',
      description: 'Ваши полученные и доступные достижения',
      onPress: () => navigation.navigate('Achievements')
    },
    {
      id: 'categories',
      title: 'Категории',
      icon: 'pricetags-outline',
      description: 'Управление категориями задач',
      onPress: () => navigation.navigate('Categories')
    },
    {
      id: 'notifications',
      title: 'Уведомления',
      icon: 'notifications-outline',
      description: 'Настройка напоминаний и уведомлений',
      onPress: () => navigation.navigate('NotificationSettings')
    },
    {
      id: 'profile',
      title: 'Профиль',
      icon: 'person-outline',
      description: 'Управление профилем персонажа',
      onPress: () => navigation.navigate('Profile')
    },
    {
      id: 'appSettings',
      title: 'Настройки приложения',
      icon: 'settings-outline',
      description: 'Настройка поведения приложения',
      onPress: () => navigation.navigate('AppSettings')
    },
    {
      id: 'about',
      title: 'О приложении',
      icon: 'information-circle-outline',
      description: 'Информация о приложении и разработчиках',
      onPress: () => navigation.navigate('About')
    }
  ];

  const renderMenuItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.menuItem}
      onPress={item.onPress}
    >
      <View style={styles.menuIconContainer}>
        <Ionicons name={item.icon} size={24} color="#4E66F1" />
      </View>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{item.title}</Text>
        <Text style={styles.menuDescription}>{item.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#CCCCCC" />
    </TouchableOpacity>
  );

  // Обработчик изменения опции сброса
  const handleResetOptionChange = (option) => {
    setResetOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Обработчик сброса данных
  const handleResetData = async () => {
    setIsResetting(true);
    try {
      console.log('SettingsScreen: Начинаем сброс данных с опциями:', resetOptions);
      
      // Используем функцию из контекста для сброса данных
      const success = await resetProgress(resetOptions);
      
      if (success) {
        console.log('SettingsScreen: Сброс данных выполнен успешно');
        
        // Закрываем модальное окно
        setShowResetModal(false);
        
        // Принудительно обновляем данные приложения
        await refreshData();
        
        // Показываем уведомление об успешном сбросе
        Alert.alert(
          "Сброс выполнен",
          "Выбранные данные были успешно сброшены",
          [{ 
            text: "OK",
            onPress: () => {
              // Еще раз обновляем данные после закрытия уведомления
              refreshData();
              
              // Для гарантированного обновления навигируем на домашний экран
              navigation.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              });
            }
          }]
        );
      } else {
        throw new Error('Сброс данных не выполнен');
      }
    } catch (error) {
      console.error('Ошибка при сбросе данных:', error);
      Alert.alert(
        "Ошибка",
        "Не удалось выполнить сброс данных. Пожалуйста, попробуйте снова.",
        [{ text: "OK" }]
      );
    } finally {
      setIsResetting(false);
    }
  };

  const toggleOption = (option) => {
    setResetOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  const renderResetModal = () => (
    <Modal
      visible={showResetModal}
      onClose={() => setShowResetModal(false)}
      title="Сброс данных"
    >
      <View style={styles.modalContent}>
        <View style={styles.warningContainer}>
          <Ionicons name="warning" size={36} color="#FF3B30" />
          <Text style={styles.warningText}>
            Вы собираетесь сбросить данные приложения. Это действие необратимо!
          </Text>
        </View>
        
        <Text style={styles.optionsTitle}>Выберите данные для сброса:</Text>
        
        <View style={styles.optionsList}>
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => toggleOption('resetProfile')}
          >
            <View style={[
              styles.optionCheckbox, 
              { backgroundColor: resetOptions.resetProfile ? '#4E66F1' : 'transparent' }
            ]}>
              {resetOptions.resetProfile && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.optionText}>Профиль пользователя</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => toggleOption('resetTasks')}
          >
            <View style={[
              styles.optionCheckbox, 
              { backgroundColor: resetOptions.resetTasks ? '#4E66F1' : 'transparent' }
            ]}>
              {resetOptions.resetTasks && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.optionText}>Все задачи</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => toggleOption('resetAchievements')}
          >
            <View style={[
              styles.optionCheckbox, 
              { backgroundColor: resetOptions.resetAchievements ? '#4E66F1' : 'transparent' }
            ]}>
              {resetOptions.resetAchievements && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.optionText}>Достижения</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => toggleOption('resetStatistics')}
          >
            <View style={[
              styles.optionCheckbox, 
              { backgroundColor: resetOptions.resetStatistics ? '#4E66F1' : 'transparent' }
            ]}>
              {resetOptions.resetStatistics && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.optionText}>Статистика</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionItem} 
            onPress={() => toggleOption('resetCategories')}
          >
            <View style={[
              styles.optionCheckbox, 
              { backgroundColor: resetOptions.resetCategories ? '#4E66F1' : 'transparent' }
            ]}>
              {resetOptions.resetCategories && (
                <Ionicons name="checkmark" size={18} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.optionText}>Категории</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => setShowResetModal(false)}
            disabled={isResetting}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={handleResetData}
            disabled={isResetting || 
              !(resetOptions.resetProfile || 
                resetOptions.resetTasks || 
                resetOptions.resetAchievements || 
                resetOptions.resetStatistics || 
                resetOptions.resetCategories)}
          >
            <Text style={styles.resetButtonText}>
              {isResetting ? 'Сброс...' : 'Сбросить данные'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <Header 
        title="Настройки" 
        hasBack={true} 
        onBack={() => navigation.goBack()} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Основные настройки</Text>
          {menuItems.map(renderMenuItem)}
        </View>
        
        <View style={styles.dangerSection}>
          <Text style={styles.dangerTitle}>Опасная зона</Text>
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={() => setShowResetModal(true)}
          >
            <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
            <Text style={styles.dangerButtonText}>Сбросить все данные</Text>
          </TouchableOpacity>
          <Text style={styles.dangerDescription}>
            При сбросе данных будут удалены все ваши задачи, достижения, статистика и настройки. 
            Это действие необратимо.
          </Text>
        </View>
        
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Версия: 1.0.0</Text>
        </View>
      </ScrollView>
      
      {renderResetModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 16,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginHorizontal: 16,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888888',
    marginHorizontal: 16,
    marginVertical: 12,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF1FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#888888',
  },
  versionContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  versionText: {
    fontSize: 14,
    color: '#888888',
  },
  dangerSection: {
    marginTop: 24,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF3B30',
    marginBottom: 12,
  },
  dangerButton: {
    backgroundColor: '#FF3B30',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  dangerDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  modalContent: {
    padding: 16,
  },
  warningContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFEEEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  warningText: {
    flex: 1,
    marginLeft: 16,
    color: '#FF3B30',
    fontWeight: '500',
    lineHeight: 20,
  },
  optionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333333',
  },
  optionsList: {
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4E66F1',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 16,
    color: '#333333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#666666',
    fontWeight: '500',
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  resetButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 16,
  },
  settingText: {
    fontSize: 16,
    color: '#333333',
  },
});