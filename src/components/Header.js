import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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

  return (
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
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  backButton: {
    padding: 4,
  },
  settingsButton: {
    padding: 4,
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