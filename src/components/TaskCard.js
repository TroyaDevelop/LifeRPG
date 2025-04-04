import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CategoryService } from '../services'; // Исправленный импорт

/**
 * Компонент карточки задачи
 * @param {object} task - Объект задачи
 * @param {function} onPress - Функция при нажатии на карточку
 * @param {function} onComplete - Функция для отметки выполнения
 * @param {function} onDelete - Функция удаления задачи
 */
const TaskCard = ({ task, onPress, onComplete, onDelete }) => {
  const [categoryInfo, setCategoryInfo] = useState(null);

  // Загрузка информации о категории
  useEffect(() => {
    const loadCategoryInfo = async () => {
      if (task.categoryId) {
        try {
          const category = await CategoryService.getCategoryById(task.categoryId);
          if (category) {
            setCategoryInfo(category);
          } else {
            console.log(`Категория с ID ${task.categoryId} не найдена`);
          }
        } catch (error) {
          console.error('Ошибка при загрузке информации о категории:', error);
        }
      }
    };
    
    loadCategoryInfo();
  }, [task.categoryId]);

  const priorityColors = {
    high: '#FF4D4F',
    medium: '#FAAD14',
    low: '#52C41A',
  };

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('ru-RU');
  };

  return (
    <TouchableOpacity 
      style={[styles.card, task.isCompleted && styles.completedCard]} 
      onPress={() => onPress(task)}
      activeOpacity={0.7}
    >
      <TouchableOpacity 
        style={styles.completeButton} 
        onPress={() => onComplete(task.id)}
      >
        <Ionicons 
          name={task.isCompleted ? "checkmark-circle" : "ellipse-outline"} 
          size={24} 
          color={task.isCompleted ? "#4CAF50" : "#AAAAAA"} 
        />
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text 
            style={[styles.title, task.isCompleted && styles.completedText]} 
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={[styles.priority, { backgroundColor: priorityColors[task.priority] || '#BBBBBB' }]}>
            <Text style={styles.priorityText}>
              {task.priority && task.priority.charAt(0).toUpperCase()}
            </Text>
          </View>
        </View>
        
        {task.description ? (
          <Text 
            style={[styles.description, task.isCompleted && styles.completedText]} 
            numberOfLines={2}
          >
            {task.description}
          </Text>
        ) : null}
        
        <View style={styles.footer}>
          {categoryInfo ? (
            <View style={[styles.category, { backgroundColor: categoryInfo.color + '20' }]}>
              <Ionicons name={categoryInfo.icon} size={12} color={categoryInfo.color} />
              <Text style={[styles.categoryText, { color: categoryInfo.color }]}>
                {categoryInfo.name}
              </Text>
            </View>
          ) : (
            <View style={styles.category}>
              <Ionicons name="folder-outline" size={12} color="#888888" />
              <Text style={styles.categoryText}>
                Другое
              </Text>
            </View>
          )}
          
          {task.dueDate ? (
            <Text style={styles.date}>
              <Ionicons name="calendar-outline" size={12} />
              {' ' + formatDate(task.dueDate)}
            </Text>
          ) : null}
        </View>
      </View>
      
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onDelete(task.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#FF4D4F" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  completedCard: {
    opacity: 0.7,
    backgroundColor: '#F5F5F5',
  },
  completeButton: {
    marginRight: 10,
    width: 24, // Задаем фиксированную ширину
    height: 24, // и высоту для элемента
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4E64EE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#4E64EE',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    color: '#333333',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#888888',
  },
  priority: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  priorityText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  category: {
    backgroundColor: '#E6F7FF',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#0091FF',
    marginLeft: 4,
  },
  date: {
    fontSize: 12,
    color: '#888888',
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default TaskCard;
