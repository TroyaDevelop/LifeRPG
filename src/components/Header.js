import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * Универсальный компонент заголовка
 * @param {string} title - Текст заголовка
 * @param {boolean} hasBack - Показывать ли кнопку назад
 * @param {function} onBack - Функция при нажатии на кнопку назад
 * @param {ReactNode} rightComponent - Компонент справа от заголовка
 * @param {boolean} hasSettings - Показывать ли кнопку настройки
 * @param {function} onSettingsPress - Функция при нажатии на кнопку настройки
 */
const Header = ({ 
  title, 
  hasBack = false, 
  onBack, 
  rightComponent,
  hasSettings = false,
  onSettingsPress
}) => {
  // Получаем отступы безопасной зоны
  const insets = useSafeAreaInsets();
  
  // Если передан rightComponent, используем его, иначе проверяем на кнопку настроек
  const rightElement = rightComponent ? (
    rightComponent
  ) : hasSettings ? (
    <TouchableOpacity onPress={onSettingsPress} style={styles.settingsButton}>
      <Ionicons name="settings-outline" size={24} color="#333333" />
    </TouchableOpacity>
  ) : (
    <View style={{ width: 32 }} />
  );

  // Внутри компонента Header:
  return (
    <View style={[
      styles.container,
      // Добавляем верхний отступ для учета статус-бара
      { paddingTop: insets.top }
    ]}>
      <View style={styles.header}>
        {hasBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 32 }} />
        )}
        
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        
        {rightElement}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    zIndex: 1, // Добавляем для правильного отображения тени
    // Тень для iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    // Тень для Android
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  settingsButton: {
    padding: 8,
    marginRight: -8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    textAlign: 'center',
  },
});

export default Header;