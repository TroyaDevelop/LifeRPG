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
  KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { TaskService, CategoryService } from '../../services';

export default function AddTaskScreen({ navigation, route }) {
  // Получаем параметр isDaily из навигации
  const isDaily = route.params?.isDaily || false;

  // Состояние задачи
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hasDueDate, setHasDueDate] = useState(false);
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState('medium'); // 'low', 'medium', 'high'
  const [category, setCategory] = useState('');
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState(new Date());
  const [showReminderTimePicker, setShowReminderTimePicker] = useState(false);
  const [taskType, setTaskType] = useState(isDaily ? 'daily' : 'regular'); // Тип задачи

  // Состояние ошибок
  const [titleError, setTitleError] = useState('');
  
  // Предустановленные категории (позже будут загружаться из хранилища)
  const [categories, setCategories] = useState([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Загрузка категорий
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const allCategories = await CategoryService.getAllCategories();
        setCategories(allCategories || []);
      } catch (error) {
        console.error('Ошибка при загрузке категорий:', error);
      }
    };
    
    loadCategories();
  }, []);

  // Валидация формы
  const validateForm = () => {
    let isValid = true;
    
    // Проверка заголовка
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

  // Сохранение задачи
  const handleSaveTask = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      // Создаем объект задачи в зависимости от типа
      const taskData = {
        title,
        description,
        // Для ежедневных задач не устанавливаем срок выполнения
        dueDate: taskType === 'daily' ? null : (hasDueDate ? dueDate.toISOString() : null),
        priority,
        categoryId: category || 'Другое',
        isCompleted: false,
        // Для ежедневных задач отключаем напоминания
        reminderEnabled: taskType === 'daily' ? false : (hasDueDate && reminderEnabled),
        reminderTime: taskType === 'daily' ? null : (hasDueDate && reminderEnabled ? reminderTime.toISOString() : null),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDaily: taskType === 'daily'
      };
      
      // Сохраняем задачу через TaskService
      const savedTask = await TaskService.createTask(taskData);
      
      if (!savedTask) {
        throw new Error('Ошибка при сохранении задачи');
      }
      
      console.log('Новая задача создана:', savedTask);
      
      // Показываем сообщение об успехе
      Alert.alert(
        'Успех',
        'Задача успешно создана!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Ошибка при создании задачи:', error);
      Alert.alert('Ошибка', 'Не удалось создать задачу');
    }
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

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Новая задача</Text>
          <View style={{ width: 24 }} />
        </View>
        
        {/* Форма задачи */}
        <View style={styles.formContainer}>
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

          {/* Выбор типа задачи */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Тип задачи</Text>
            <View style={styles.typeSelector}>
            <TouchableOpacity 
                style={[
                  styles.typeOption, 
                  taskType === 'daily' ? styles.selectedType : null
                ]}
                onPress={() => setTaskType('daily')}
              >
                <Ionicons 
                  name="repeat" 
                  size={24} 
                  color={taskType === 'daily' ? '#4E66F1' : '#888888'} 
                />
                <Text style={[
                  styles.typeText,
                  taskType === 'daily' ? styles.selectedTypeText : null
                ]}>Ежедневная</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.typeOption, 
                  taskType === 'regular' ? styles.selectedType : null
                ]}
                onPress={() => setTaskType('regular')}
              >
                <Ionicons 
                  name="calendar-outline" 
                  size={24} 
                  color={taskType === 'regular' ? '#4E66F1' : '#888888'} 
                />
                <Text style={[
                  styles.typeText,
                  taskType === 'regular' ? styles.selectedTypeText : null
                ]}>Обычная</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Дата выполнения - только для обычных задач */}
          {taskType === 'regular' && (
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
          )}

          {/* Напоминание - только для обычных задач с установленным сроком выполнения */}
          {taskType === 'regular' && hasDueDate && (
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
            onPress={handleSaveTask}
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
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  selectedType: {
    borderColor: '#4E66F1',
    backgroundColor: '#F0F3FF',
  },
  typeText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#888888',
  },
  selectedTypeText: {
    color: '#4E66F1',
    fontWeight: 'bold',
  },
});
