import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const LevelUpModal = ({ visible, level, bonuses = [], onClose }) => {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const starAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.elastic(1),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(starAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Сбрасываем анимации при закрытии
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      starAnim.setValue(0);
    }
  }, [visible]);
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalBackground}>
        <Animated.View 
          style={[
            styles.modalContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={styles.header}>
            <Animated.View 
              style={{
                transform: [
                  { scale: starAnim.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.5, 1.2, 1]
                  })},
                  { rotate: starAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg']
                  })}
                ]
              }}
            >
              <Ionicons name="star" size={50} color="#FFD700" />
            </Animated.View>
            <Text style={styles.title}>Уровень повышен!</Text>
          </View>
          
          <Text style={styles.levelText}>Вы достигли {level} уровня</Text>
          
          {bonuses.length > 0 && (
            <View style={styles.bonusContainer}>
              <Text style={styles.bonusTitle}>Полученные бонусы:</Text>
              {bonuses.map((bonus) => (
                <View key={bonus.id} style={styles.bonusItem}>
                  <Ionicons name="gift" size={24} color="#8a2be2" />
                  <View style={styles.bonusInfo}>
                    <Text style={styles.bonusName}>{bonus.name}</Text>
                    <Text style={styles.bonusDescription}>{bonus.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
          
          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Отлично!</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  levelText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  bonusContainer: {
    width: '100%',
    marginBottom: 20,
  },
  bonusTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  bonusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  bonusInfo: {
    marginLeft: 10,
    flex: 1,
  },
  bonusName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bonusDescription: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#8a2be2',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default LevelUpModal;
