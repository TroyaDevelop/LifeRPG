import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppContext } from '../context/AppContext';
import { CategoryService, TaskService } from '../services';

const TaskCard = ({ task, onPress, onComplete, onDelete, onArchive }) => {
  const [categoryInfo, setCategoryInfo] = useState(null);
  const { energy } = useAppContext(); // Получаем энергию из контекста
  
  // Расчет стоимости энергии
  const energyCost = TaskService.calculateEnergyCost(task);
  
  // Проверка, достаточно ли энергии
  const hasEnoughEnergy = energy >= energyCost;

  // Загрузка категории
  useEffect(() => {
    const loadCategoryInfo = async () => {
      if (task.categoryId) {
        try {
          const category = await CategoryService.getCategoryById(task.categoryId);
          setCategoryInfo(category);
        } catch (error) {
          console.error('Ошибка при загрузке категории:', error);
          setCategoryInfo(null);
        }
      } else {
        setCategoryInfo(null);
      }
    };
    
    loadCategoryInfo();
  }, [task.categoryId]);

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day}.${month} ${hours}:${minutes}`;
  };

  // Отображение категории
  const renderCategory = () => {
    if (categoryInfo) {
      // Если категория есть, показываем её с цветом и иконкой
      return (
        <View style={[styles.category, { backgroundColor: categoryInfo.color }]}>
          <Ionicons name={categoryInfo.icon} size={12} color="#FFFFFF" />
          <Text style={styles.categoryText}>{categoryInfo.name}</Text>
        </View>
      );
    } else {
      // Если категории нет, показываем "Другое"
      return (
        <View style={[styles.category, { backgroundColor: '#888888' }]}>
          <Ionicons name="help-circle-outline" size={12} color="#FFFFFF" />
          <Text style={styles.categoryText}>Другое</Text>
        </View>
      );
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, task.isCompleted && styles.completedCard]} 
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        {/* Чекбокс слева внутри карточки */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => onComplete(task.id)}
        >
          <Ionicons 
            name={task.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
            size={28} 
            color={task.isCompleted ? "#4E64EE" : "#AAAAAA"} 
          />
        </TouchableOpacity>
        
        {/* Основное содержимое карточки */}
        <View style={styles.mainContent}>
          <View style={styles.header}>
            <View style={styles.titleContainer}>
              <Text style={[styles.title, task.isCompleted && styles.completedTitle]}>
                {task.title}
              </Text>
              {/* Удаляем индикатор ежедневной задачи
              {task.type === 'daily' && (
                <View style={styles.dailyIndicator}>
                  <Ionicons name="refresh" size={14} color="#FFFFFF" />
                </View>
              )}
              */}
            </View>
            
            {/* Используем renderCategory */}
            {renderCategory()}
          </View>
          
          {task.description ? (
            <Text style={[styles.description, task.isCompleted && styles.completedText]}>
              {task.description}
            </Text>
          ) : null}
          
          <View style={styles.footer}>
            <View style={styles.metaInfo}>
              {task.dueDate && (
                <View style={styles.dueDate}>
                  <Ionicons name="calendar-outline" size={14} color="#888888" />
                  <Text style={styles.metaText}>{formatDate(task.dueDate)}</Text>
                </View>
              )}
              
              {task.priority && (
                <View style={styles.priority}>
                  <Ionicons 
                    name={
                      task.priority === 'high' ? 'alert-circle' : 
                      task.priority === 'medium' ? 'alert' : 'alert-outline'
                    } 
                    size={14} 
                    color={
                      task.priority === 'high' ? '#FF9500' : 
                      task.priority === 'medium' ? '#5AC8FA' : '#4CD964'
                    } 
                  />
                  <Text style={styles.metaText}>
                    {task.priority === 'high' ? 'Высокий' : 
                     task.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </Text>
                </View>
              )}
            </View>
            
            <View style={styles.actionsContainer}>
              {/* Показываем информацию о стоимости энергии для невыполненных задач */}
              {!task.isCompleted && (
                <View style={styles.energyContainer}>
                  <Ionicons 
                    name="flash" 
                    size={16} 
                    color={hasEnoughEnergy ? "#5AC8FA" : "#FF3B30"} 
                  />
                  <Text style={[
                    styles.energyText,
                    { color: hasEnoughEnergy ? "#5AC8FA" : "#FF3B30" }
                  ]}>
                    {energyCost}
                  </Text>
                  {!hasEnoughEnergy && (
                    <Text style={styles.noXpText}>Без XP</Text>
                  )}
                </View>
              )}
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onDelete(task.id)}
              >
                <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              </TouchableOpacity>

              {/* Кнопка архивирования для выполненных задач */}
              {task.isCompleted && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => onArchive(task.id)}
                >
                  <Ionicons name="archive-outline" size={20} color="#4E64EE" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Оставляем все стили без изменений, даже неиспользуемый стиль dailyIndicator
  // можно оставить для возможного использования в будущем
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: '#F8F8F8',
  },
  cardContent: {
    flexDirection: 'row',
    padding: 16,
  },
  checkboxContainer: {
    marginRight: 12,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  completedTitle: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  dailyIndicator: {
    backgroundColor: '#4E64EE',
    borderRadius: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 8,
  },
  category: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginLeft: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#FFFFFF',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  completedText: {
    color: '#999999',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  priority: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#888888',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 6,
    marginLeft: 8,
  },
  energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  energyText: {
    fontSize: 12,
    marginLeft: 4,
  },
  noXpText: {
    fontSize: 10,
    color: '#FF3B30',
    marginLeft: 4,
  },
});

export default TaskCard;
