import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const HealthBar = ({ health, maxHealth, style }) => {
  // Процент здоровья для отображения полосы
  const healthPercentage = (health / maxHealth) * 100;
  
  // Определяем цвет в зависимости от уровня здоровья
  const getHealthColor = () => {
    if (healthPercentage > 65) return '#4CD964'; // Зеленый
    if (healthPercentage > 30) return '#FFCC00'; // Желтый
    return '#FF3B30'; // Красный
  };
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Ionicons name="heart" size={16} color="#FF3B30" />
        <Text style={styles.label}>{Math.round(health)}/{maxHealth}</Text>
      </View>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barFill, 
            { 
              width: `${healthPercentage}%`,
              backgroundColor: getHealthColor()
            }
          ]} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2
  },
  label: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden'
  },
  barFill: {
    height: '100%',
    borderRadius: 4
  }
});

export default HealthBar;