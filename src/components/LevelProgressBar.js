import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { UserProfile } from '../models/UserProfile';

const LevelProgressBar = ({ profile, style }) => {
  if (!profile) return null;
  
  // Получаем опыт для начала текущего уровня
  const currentLevelExp = UserProfile.getExperienceForNextLevel(profile.level - 1) || 0;
  
  // Получаем опыт для следующего уровня
  const nextLevelExp = UserProfile.getExperienceForNextLevel(profile.level);
  
  // Вычисляем, сколько опыта набрано в рамках текущего уровня
  const currentExp = Math.max(0, profile.experience - currentLevelExp);
  
  // Вычисляем, сколько опыта нужно для перехода на следующий уровень
  const levelExpNeeded = nextLevelExp - currentLevelExp;
  
  // Вычисляем процент прогресса
  const progress = Math.min(100, Math.max(0, Math.floor((currentExp / levelExpNeeded) * 100)));
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.labelContainer}>
        <Text style={styles.level}>Уровень {profile.level}</Text>
        <Text style={styles.expText}>
          {currentExp}/{levelExpNeeded}
        </Text>
      </View>
      <View style={styles.barBackground}>
        <View style={[styles.barFill, { width: `${progress}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  level: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4E64EE',
  },
  expText: {
    fontSize: 12,
    color: '#666666',
  },
  barBackground: {
    height: 8,
    backgroundColor: '#E5E5E5',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#4E64EE',
    borderRadius: 4,
  },
});

export default LevelProgressBar;
