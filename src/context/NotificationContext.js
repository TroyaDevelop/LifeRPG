import React, { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

// Создаем контекст
const NotificationContext = createContext();

// Провайдер контекста уведомлений
export const NotificationProvider = ({ children }) => {
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'info',
    rewards: null,
  });

  // Функция для показа уведомления
  const showNotification = (message, type = 'info', rewards = null) => {
    setToast({
      visible: true,
      message,
      type,
      rewards,
    });
  };

  // Функция для скрытия уведомления
  const hideNotification = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  // Специализированные функции для разных типов уведомлений
  const showExperienceGained = (experience) => {
    showNotification('Задача выполнена!', 'success', { experience });
  };

  const showExperienceLost = (experience) => {
    showNotification('Выполнение отменено', 'warning', { experience: -experience });
  };

  // Добавляем уведомления для валюты
  const showActusGained = (actus) => {
    showNotification('Получена награда', 'success', { actus });
  };

  const showActusLost = (actus) => {
    showNotification('Отмена награды', 'warning', { actus: -actus });
  };

  // Функция для показа комплексной награды (опыт + актусы вместе)
  const showReward = (experience = 0, actus = 0) => {
    showNotification('Задача выполнена!', 'success', { experience, actus });
  };

  const showError = (message) => {
    showNotification(message || 'Произошла ошибка', 'error');
  };

  const showSuccess = (message) => {
    showNotification(message, 'success');
  };

  const showInfo = (message) => {
    showNotification(message, 'info');
  };

  const showWarning = (message) => {
    showNotification(message, 'warning');
  };

  // Значения, которые будут доступны через контекст
  const value = {
    showNotification,
    showExperienceGained,
    showExperienceLost,
    showActusGained,
    showActusLost,
    showReward,
    showError,
    showSuccess,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        rewards={toast.rewards}
        onHide={hideNotification}
      />
    </NotificationContext.Provider>
  );
};

// Хук для использования контекста уведомлений
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification должен использоваться внутри NotificationProvider');
  }
  return context;
};