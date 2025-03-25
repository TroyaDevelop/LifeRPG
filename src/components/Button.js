import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * Универсальный компонент кнопки
 * @param {string} title - Текст кнопки
 * @param {function} onPress - Функция при нажатии
 * @param {string} type - Тип кнопки (primary, secondary, danger, success)
 * @param {boolean} disabled - Признак неактивности кнопки
 * @param {boolean} loading - Признак загрузки
 * @param {object} style - Дополнительные стили кнопки
 */
const Button = ({ 
  title, 
  onPress, 
  type = 'primary', 
  disabled = false,
  loading = false,
  style = {} 
}) => {
  const buttonTypeStyle = styles[type] || styles.primary;
  const buttonTextStyle = textStyles[type] || textStyles.primary;
  
  return (
    <TouchableOpacity
      style={[styles.button, buttonTypeStyle, disabled && styles.disabled, style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={buttonTextStyle.color} size="small" />
      ) : (
        <Text style={[styles.text, buttonTextStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  primary: {
    backgroundColor: '#4E64EE',
  },
  secondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4E64EE',
  },
  danger: {
    backgroundColor: '#FF4D4F',
  },
  success: {
    backgroundColor: '#52C41A',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '600',
    fontSize: 16,
  },
});

const textStyles = StyleSheet.create({
  primary: {
    color: '#FFFFFF',
  },
  secondary: {
    color: '#4E64EE',
  },
  danger: {
    color: '#FFFFFF',
  },
  success: {
    color: '#FFFFFF',
  },
});

export default Button;
