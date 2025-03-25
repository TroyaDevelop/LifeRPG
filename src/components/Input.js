import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';

/**
 * Универсальный компонент поля ввода
 * @param {string} label - Название поля
 * @param {string} value - Значение поля
 * @param {function} onChangeText - Функция изменения значения
 * @param {string} placeholder - Подсказка в пустом поле
 * @param {string} error - Текст ошибки
 * @param {boolean} secureTextEntry - Скрытие текста для пароля
 * @param {boolean} multiline - Многострочное поле ввода
 * @param {string} keyboardType - Тип клавиатуры
 * @param {function} onBlur - Функция при потере фокуса
 * @param {object} style - Дополнительные стили
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry = false,
  multiline = false,
  keyboardType = 'default',
  onBlur = () => {},
  style = {},
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          isFocused && styles.focused,
          error && styles.errorInput,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        keyboardType={keyboardType}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          onBlur();
        }}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
    color: '#333333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  focused: {
    borderColor: '#4E64EE',
    borderWidth: 2,
  },
  errorInput: {
    borderColor: '#FF4D4F',
  },
  errorText: {
    color: '#FF4D4F',
    fontSize: 14,
    marginTop: 4,
  },
});

export default Input;
