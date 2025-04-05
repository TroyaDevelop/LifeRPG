import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const EnergyBar = ({ energy, maxEnergy, style }) => {
  // Процент энергии для отображения полосы
  const energyPercentage = (energy / maxEnergy) * 100;
  
  // Определяем цвет в зависимости от уровня энергии
  const getEnergyColor = () => {
    if (energyPercentage > 65) return '#5AC8FA'; // Синий
    if (energyPercentage > 30) return '#748AFF'; // Фиолетовый
    return '#5856D6'; // Темно-фиолетовый
  };
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Ionicons name="flash" size={16} color="#5AC8FA" />
        <Text style={styles.label}>{Math.round(energy)}/{maxEnergy}</Text>
      </View>
      <View style={styles.barBackground}>
        <View 
          style={[
            styles.barFill, 
            { 
              width: `${energyPercentage}%`,
              backgroundColor: getEnergyColor()
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

export default EnergyBar;