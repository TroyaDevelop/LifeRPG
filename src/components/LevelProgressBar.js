import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../models/UserProfile';

const LevelProgressBar = ({ profile, style }) => {
  const progressWidth = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    const progress = profile.getLevelProgress() / 100;
    
    Animated.timing(progressWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [profile]);
  
  const nextLevelExp = UserProfile.getExperienceForNextLevel(profile.level);
  const currentLevelExp = UserProfile.getExperienceForNextLevel(profile.level - 1) || 0;
  const expToNextLevel = nextLevelExp - profile.experience;
  
  return (
    <View style={[styles.container, style]}>
      <View style={styles.levelContainer}>
        <View style={styles.levelBadge}>
          <Ionicons name="star" size={16} color="#FFF" />
          <Text style={styles.levelText}>{profile.level}</Text>
        </View>
        <Text style={styles.nextLevelText}>
          {expToNextLevel} XP до {profile.level + 1} уровня
        </Text>
      </View>
      
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressFill, 
            { width: progressWidth.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'],
            }) }
          ]} 
        />
      </View>
      
      <Text style={styles.experienceText}>
        {profile.experience - currentLevelExp} / {nextLevelExp - currentLevelExp} XP
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8a2be2',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  levelText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  nextLevelText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 14,
  },
  progressContainer: {
    height: 12,
    backgroundColor: '#e0e0e0',
    borderRadius: 6,
    overflow: 'hidden',
    marginVertical: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8a2be2',
  },
  experienceText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
});

export default LevelProgressBar;
