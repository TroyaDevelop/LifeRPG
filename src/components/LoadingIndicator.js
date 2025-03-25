import React from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

/**
 * Компонент индикатора загрузки
 * @param {boolean} fullScreen - Отображение на весь экран
 * @param {string} message - Сообщение под индикатором
 * @param {string} color - Цвет индикатора
 * @param {string} size - Размер индикатора (small, large)
 */
const LoadingIndicator = ({ 
  fullScreen = false, 
  message, 
  color = '#4E64EE', 
  size = 'large' 
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreen}>
        <ActivityIndicator size={size} color={color} />
        {message && <Text style={styles.message}>{message}</Text>}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
  },
  fullScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
});

export default LoadingIndicator;
