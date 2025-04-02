import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Компонент загрузочного экрана
const SplashScreen = ({ onFinish }) => {
  // Создаем значение для анимации
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Запускаем анимацию
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      })
    ]).start();

    // Таймер для завершения загрузочного экрана
    const timer = setTimeout(() => {
      // Сначала анимация исчезновения
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // После завершения анимации вызываем onFinish
        if (onFinish) onFinish();
      });
    }, 2500); // 2.5 секунды отображения

    // Очистка таймера при размонтировании
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Taskovia</Text>
        <Text style={styles.subtitle}>Превратите жизнь в приключение!</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4E64EE', // Фирменный синий цвет
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});

export default SplashScreen;