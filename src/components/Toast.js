import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, Dimensions, View, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Пути к спрайтам валюты
const ACTUS_ICON = require('../../assets/sprites/currency/actus_coin.png');
const EXP_ICON = require('../../assets/sprites/currency/exp_icon.png');

const Toast = ({ visible, message, type = 'success', onHide, rewards = null }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  
  useEffect(() => {
    if (visible) {
      // Показываем toast
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
      
      // Автоматически скрываем через 3 секунды
      const timer = setTimeout(() => {
        hideToast();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);
  
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) onHide();
    });
  };
  
  // Определяем иконку и стили в зависимости от типа уведомления
  const getIconAndStyle = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: '#4CAF50',
          backgroundColor: '#FFFFFF',
          borderColor: '#4CAF50',
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: '#F44336',
          backgroundColor: '#FFFFFF',
          borderColor: '#F44336',
        };
      case 'warning':
        return {
          icon: 'alert-circle',
          color: '#FF9800',
          backgroundColor: '#FFFFFF',
          borderColor: '#FF9800',
        };
      case 'info':
      default:
        return {
          icon: 'information-circle',
          color: '#4E64EE',
          backgroundColor: '#FFFFFF',
          borderColor: '#4E64EE',
        };
    }
  };
  
  const { icon, color, backgroundColor, borderColor } = getIconAndStyle();
  
  if (!visible) return null;
  
  // Рендерим уведомление с наградами
  if (rewards) {
    return (
      <Animated.View
        style={[
          styles.container,
          { 
            opacity, 
            transform: [{ translateY }], 
            backgroundColor,
            borderColor,
            borderWidth: 1,
          },
        ]}
      >
        <Ionicons name={icon} size={20} color={color} />
        <View style={styles.contentContainer}>
          <Text style={[styles.message, { color }]}>{message}</Text>
          <View style={styles.rewardsContainer}>
            {rewards.experience !== 0 && (
              <View style={styles.rewardItem}>
                <Image source={EXP_ICON} style={styles.rewardIcon} />
                <Text style={[styles.rewardText, { color }]}>
                  {rewards.experience > 0 ? `+${rewards.experience}` : rewards.experience}
                </Text>
              </View>
            )}
            {rewards.actus !== 0 && (
              <View style={styles.rewardItem}>
                <Image source={ACTUS_ICON} style={styles.rewardIcon} />
                <Text style={[styles.rewardText, { color }]}>
                  {rewards.actus > 0 ? `+${rewards.actus}` : rewards.actus}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
    );
  }
  
  // Стандартное уведомление
  return (
    <Animated.View
      style={[
        styles.container,
        { 
          opacity, 
          transform: [{ translateY }], 
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ]}
    >
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.message, { color }]}>{message}</Text>
    </Animated.View>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: height * 0.8, // Переместим уведомление ниже - примерно в нижнюю треть экрана
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
    width: width * 0.8,
    maxWidth: 400,
    zIndex: 9999,
  },
  message: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginLeft: 8,
  },
  rewardsContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  rewardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardIcon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  rewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default Toast;