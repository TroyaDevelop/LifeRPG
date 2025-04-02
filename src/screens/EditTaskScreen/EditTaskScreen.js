import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  Modal,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from '../../context/AppContext'; // Импортируем контекст

const EditTaskScreen = ({ navigation, route }) => {
  const { taskId } = route.params;
  
  // Используем контекст вместо прямых вызовов сервисов
  const { 
    tasks, 
    categories, 
    getTaskById, 
    updateTask, 
    deleteTask,
    refreshData 
  } = useAppContext();
  
  // Состояние задачи
  const [loading, setLoading] = useState(true);
  const [task, setTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  
  // Состояние ошибок
  const [titleError, setTitleError] = useState('');
  
  // Загрузка задачи
  useEffect(() => {
    const loadTask = async () => {
      try {
        // Используем задачу из контекста или получаем по ID
        let taskData = tasks.find(t => t.id === taskId);
        
        if (!taskData) {
          throw new Error(`Задача с ID ${taskId} не найдена`);
        }
        
        setTask(taskData);
        setTitle(taskData.title);
        setDescription(taskData.description || '');
        
        if (taskData.dueDate) {
          setHasDueDate(true);
          setDueDate(new Date(taskData.dueDate));
        } else {
          setHasDueDate(false);
          setDueDate(new Date());
        }
        
        setPriority(taskData.priority || 'medium');
        setCategory(taskData.categoryId || '');
        setIsCompleted(taskData.isCompleted || false);
        
        if (taskData.reminderEnabled) {
          setReminderEnabled(true);
          if (taskData.reminderTime) {
            setReminderTime(new Date(taskData.reminderTime));
          } else if (taskData.dueDate) {
            // Если время напоминания не задано, но есть дедлайн - устанавливаем дефолтное время
            const defaultReminderTime = new Date(taskData.dueDate);
            defaultReminderTime.setHours(defaultReminderTime.getHours() - 1);
            setReminderTime(defaultReminderTime);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error('Ошибка при загрузке задачи:', error);
        Alert.alert(
          'Ошибка',
          'Не удалось загрузить данные задачи',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }
    };
    
    loadTask();
  }, [taskId, tasks]);

  // Валидация формы
  const validateForm = () => {
    let isValid = true;
    
    if (!title.trim()) {
      setTitleError('Название задачи обязательно');
      isValid = false;
    } else {
      setTitleError('');
    }
    
    return isValid;
  };

  // Обработка изменения даты
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || dueDate;
    setShowDatePicker(Platform.OS === 'ios');
    setDueDate(currentDate);
  };

  // Обработчик изменения времени напоминания
  const onReminderTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || reminderTime;
    setShowReminderTimePicker(Platform.OS === 'ios');
    setReminderTime(currentTime);
  };

  // Обновление задачи
  const handleUpdateTask = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Обновляем объект задачи только с теми полями, которые изменились
      const updatedTaskData = {
        title,
        description,
        dueDate: hasDueDate ? new Date(dueDate).toISOString() : null,
        priority,
        categoryId: category,
        isCompleted,
        reminderEnabled: reminderEnabled && hasDueDate,
        reminderTime: reminderEnabled && hasDueDate ? new Date(reminderTime).toISOString() : null,
        updatedAt: new Date().toISOString()
      };
      
      // Используем функцию из контекста
      await updateTask(taskId, updatedTaskData);
      
      // Обновляем данные в контексте
      refreshData();
      
      navigation.goBack();
    } catch (error) {
      console.error('Ошибка при обновлении задачи:', error);
      Alert.alert('Ошибка', 'Не удалось обновить задачу');
    }
  };

  // Удаление задачи
  const handleDeleteTask = () => {
    Alert.alert(
      'Удалить задачу',
      'Вы уверены, что хотите удалить эту задачу?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            try {
              // Используем функцию из контекста
              await deleteTask(taskId);
              
              // Возвращаемся назад
              navigation.goBack();
            } catch (error) {
              console.error('Ошибка при удалении задачи:', error);
              Alert.alert('Ошибка', 'Не удалось удалить задачу');
            }
          }
        }
      ]
    );
  };

  // Функция для форматирования даты
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  // Получение цвета приоритета
  const getPriorityColor = (priorityValue) => {
    switch (priorityValue) {
      case 'high': return '#FFECB3';
      case 'medium': return '#E3F2FD';
      case 'low': return '#E8F5E9';
      default: return '#EEEEEE';
    }
  };

  // Получение текста приоритета
  const getPriorityText = (priorityValue) => {
    switch (priorityValue) {
      case 'high': return 'Высокий';
      case 'medium': return 'Средний';
      case 'low': return 'Низкий';
      default: return 'Не установлен';
    }
  };

  // Получение иконки приоритета
  const getPriorityIcon = (priorityValue) => {
    switch (priorityValue) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert';
      case 'low': return 'alert-outline';
      default: return 'remove-circle-outline';
    }
  };

  // Модальное окно выбора приоритета
  const renderPriorityModal = () => {
    if (!showPriorityModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите приоритет</Text>
            <TouchableOpacity onPress={() => setShowPriorityModal(false)}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity 
            style={[styles.priorityOption, priority === 'high' && styles.selectedOption]} 
            onPress={() => {
              setPriority('high');
              setShowPriorityModal(false);
            }}
          >
            <View style={[styles.priorityColor, { backgroundColor: '#FFECB3' }]} />
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <Text style={styles.priorityOptionText}>Высокий</Text>
            {priority === 'high' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.priorityOption, priority === 'medium' && styles.selectedOption]} 
            onPress={() => {
              setPriority('medium');
              setShowPriorityModal(false);
            }}
          >
            <View style={[styles.priorityColor, { backgroundColor: '#E3F2FD' }]} />
            <Ionicons name="alert" size={20} color="#2196F3" />
            <Text style={styles.priorityOptionText}>Средний</Text>
            {priority === 'medium' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.priorityOption, priority === 'low' && styles.selectedOption]} 
            onPress={() => {
              setPriority('low');
              setShowPriorityModal(false);
            }}
          >
            <View style={[styles.priorityColor, { backgroundColor: '#E8F5E9' }]} />
            <Ionicons name="alert-outline" size={20} color="#4CAF50" />
            <Text style={styles.priorityOptionText}>Низкий</Text>
            {priority === 'low' && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Модальное окно выбора категории
  const renderCategoryModal = () => {
    if (!showCategoryModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Выберите категорию</Text>
            <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
              <Ionicons name="close" size={24} color="#666666" />
            </TouchableOpacity>
          </View>
          
          {categories.length > 0 ? (
            categories.map((cat) => (
              <TouchableOpacity 
                key={cat.id}
                style={[styles.categoryOption, category === cat.id && styles.selectedOption]} 
                onPress={() => {
                  setCategory(cat.id);
                  setShowCategoryModal(false);
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View style={[styles.categoryColor, { backgroundColor: cat.color || '#CCCCCC' }]} />
                  <Ionicons 
                    name={cat.icon || "folder-outline"} 
                    size={20} 
                    color={cat.color || '#CCCCCC'} 
                    style={{ marginRight: 8 }} 
                  />
                  <Text style={styles.categoryOptionText}>{cat.name}</Text>
                </View>
                {category === cat.id && <Ionicons name="checkmark" size={20} color="#4E64EE" />}
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>
              Нет доступных категорий. Создайте новую категорию.
            </Text>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4E64EE" />
        <Text style={styles.loadingText}>Загрузка задачи...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Заголовок */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Редактирование задачи</Text>
          <TouchableOpacity onPress={handleDeleteTask} style={styles.deleteButton}>
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        </View>
        
        {/* Форма задачи */}
        <View style={styles.formContainer}>
          {/* Статус задачи */}
          <View style={styles.statusContainer}>
            <TouchableOpacity 
              style={styles.statusToggle}
              onPress={() => setIsCompleted(!isCompleted)}
            >
              <Ionicons 
                name={isCompleted ? "checkmark-circle" : "ellipse-outline"} 
                size={24} 
                color={isCompleted ? "#4CAF50" : "#AAAAAA"} 
              />
              <Text style={[styles.statusText, isCompleted && styles.completedStatusText]}>
                {isCompleted ? "Выполнено" : "Активно"}
              </Text>
            </TouchableOpacity>
            
            {task.createdAt && (
              <Text style={styles.createdAtText}>
                Создано: {new Date(task.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>
          
          {/* Название задачи */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Название*</Text>
            <TextInput
              style={[styles.input, titleError && styles.inputError]}
              placeholder="Введите название задачи"
              value={title}
              onChangeText={(text) => {
                setTitle(text);
                if (text.trim()) setTitleError('');
              }}
              maxLength={100}
            />
            {titleError ? <Text style={styles.errorText}>{titleError}</Text> : null}
          </View>
          
          {/* Описание */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Описание</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Введите описание задачи"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          {/* Дата выполнения */}
          <View style={styles.inputContainer}>
            <View style={styles.switchContainer}>
              <Text style={styles.label}>Срок выполнения</Text>
              <Switch
                value={hasDueDate}
                onValueChange={setHasDueDate}
                trackColor={{ false: "#E5E7EB", true: "#4E64EE" }}
                thumbColor={hasDueDate ? "#FFFFFF" : "#F4F3F4"}
              />
            </View>
            {hasDueDate && (
              <TouchableOpacity 
                style={styles.datePickerButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#4E64EE" />
                <Text style={styles.datePickerText}>{formatDate(dueDate)}</Text>
              </TouchableOpacity>
            )}

            {showDatePicker && (
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )}
          </View>

          {hasDueDate && (
            <View style={styles.inputContainer}>
              <View style={styles.switchContainer}>
                <Text style={styles.label}>Напоминание</Text>
                <Switch
                  value={reminderEnabled}
                  onValueChange={setReminderEnabled}
                  trackColor={{ false: "#E5E7EB", true: "#4E64EE" }}
                  thumbColor={reminderEnabled ? "#FFFFFF" : "#F4F3F4"}
                />
              </View>
              {reminderEnabled && (
                <TouchableOpacity 
                  style={styles.datePickerButton}
                  onPress={() => setShowReminderTimePicker(true)}
                >
                  <Ionicons name="time-outline" size={20} color="#4E64EE" />
                  <Text style={styles.datePickerText}>
                    {reminderTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </TouchableOpacity>
              )}

              {showReminderTimePicker && (
                <DateTimePicker
                  value={reminderTime}
                  mode="time"
                  display="default"
                  onChange={onReminderTimeChange}
                />
              )}
            </View>
          )}
          
          {/* Приоритет */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Приоритет</Text>
            <TouchableOpacity 
              style={styles.priorityButton}
              onPress={() => setShowPriorityModal(true)}
            >
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) }]}>
                <Ionicons name={getPriorityIcon(priority)} size={16} color="#666666" />
                <Text style={styles.priorityBadgeText}>{getPriorityText(priority)}</Text>
              </View>
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
          
          {/* Категория */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Категория</Text>
            <TouchableOpacity 
              style={styles.categoryButton}
              onPress={() => setShowCategoryModal(true)}
            >
              <Text style={styles.categoryButtonText}>
                {categories.find(cat => cat.id === category)?.name || 'Выберите категорию'}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666666" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Кнопки */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleUpdateTask}
          >
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Модальные окна */}
      {renderPriorityModal()}
      {renderCategoryModal()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666666',
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  deleteButton: {
    padding: 8,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusToggle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  completedStatusText: {
    color: '#4CAF50',
  },
  createdAtText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: '#333333',
  },
  textArea: {
    minHeight: 100,
    maxHeight: 150,
  },
  inputError: {
    borderColor: '#F87171',
  },
  errorText: {
    color: '#F87171',
    fontSize: 12,
    marginTop: 4,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  datePickerText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333333',
  },
  priorityButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityBadgeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666666',
  },
  priorityColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  categoryButtonText: {
    fontSize: 16,
    color: '#333333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    paddingVertical: 12,
    marginRight: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666666',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#4E64EE',
    borderRadius: 8,
    paddingVertical: 12,
    marginLeft: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    width: '80%',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  selectedOption: {
    backgroundColor: '#F0F4FF',
  },
  priorityOptionText: {
    fontSize: 16,
    color: '#333333',
    marginLeft: 8,
    flex: 1,
  },
  categoryOptionText: {
    fontSize: 16,
    color: '#333333',
  },
  emptyText: {
    fontSize: 16,
    color: '#666666',
    padding: 16,
    textAlign: 'center',
  },
});

export default EditTaskScreen;
