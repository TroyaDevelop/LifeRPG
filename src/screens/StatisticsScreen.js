import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Button from '../components/Button';
import Header from '../components/Header';
import { StatisticsService } from '../services/StatisticsService';
import { AchievementService } from '../services/AchievementService';
import TaskService from '../services/TaskService';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { useIsFocused } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;

export default function StatisticsScreen({ navigation }) {
  const [period, setPeriod] = useState('day'); // 'day', 'week', 'month'
  const [loading, setLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [monthlyStats, setMonthlyStats] = useState([]);
  const isFocused = useIsFocused();

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const daily = await StatisticsService.getDailyStatistics(today);
      const weekly = await StatisticsService.getWeeklyStatistics();
      const monthly = await StatisticsService.getMonthlyStatistics();
      
      setDailyStats(daily);
      setWeeklyStats(weekly);
      setMonthlyStats(monthly);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isFocused) {
      loadStatistics();
    }
  }, [isFocused]);

  useEffect(() => {
    // Получаем все активные задачи и обновляем статистику
    const updateStatistics = async () => {
      try {
        const tasks = await TaskService.getAllTasks();
        const today = new Date().toISOString().split('T')[0];
        
        // Считаем количество просроченных и запланированных задач
        const overdueTasks = tasks.filter(task => 
          !task.isCompleted && 
          task.dueDate && 
          new Date(task.dueDate) < new Date() && 
          task.dueDate.split('T')[0] !== today);
        
        const plannedTasks = tasks.filter(task => 
          !task.isCompleted && 
          task.dueDate && 
          task.dueDate.split('T')[0] === today);
        
        // Обновляем статистику
        await StatisticsService.updateStatisticsData(today, {
          plannedTasks: plannedTasks.length,
          overdueTasks: overdueTasks.length
        });
        
        // Проверка достижений эффективности только в конце недели (воскресенье)
        const currentDay = new Date().getDay();
        const isEndOfWeek = currentDay === 0; // 0 = воскресенье
        
        if (isEndOfWeek) {
          try {
            const weeklyStats = await StatisticsService.getWeeklyStatistics();
            
            // Проверяем, достаточно ли дней для расчета
            if (weeklyStats && weeklyStats.length >= 3) {
              console.log("Проверка достижений по эффективности в конце недели");
              const result = await AchievementService.updateAchievementsForEfficiency();
              
              // Если получены новые достижения, показать уведомление
              if (result && result.achievementsUnlocked && result.achievementsUnlocked.length > 0) {
                Alert.alert(
                  "Новые достижения!",
                  `Получено ${result.achievementsUnlocked.length} новых достижений за эффективность. Проверьте их в разделе Достижения.`,
                  [
                    { text: "OK" },
                    { 
                      text: "Посмотреть", 
                      onPress: () => navigation.navigate('Achievements') 
                    }
                  ]
                );
              }
            }
          } catch (error) {
            console.error("Ошибка при проверке достижений эффективности:", error);
          }
        }
        
        // Теперь загружаем обновленную статистику
        loadStatistics();
      } catch (error) {
        console.error('Ошибка при обновлении статистики:', error);
      }
    };

    updateStatistics();
  }, [navigation, isFocused]);

  const renderPeriodSelector = () => (
    <View style={styles.periodSelector}>
      <Button 
        title="День" 
        onPress={() => setPeriod('day')} 
        style={period === 'day' ? styles.activeButton : styles.inactiveButton}
        textStyle={period === 'day' ? styles.activeButtonText : styles.inactiveButtonText}
      />
      <Button 
        title="Неделя" 
        onPress={() => setPeriod('week')} 
        style={period === 'week' ? styles.activeButton : styles.inactiveButton}
        textStyle={period === 'week' ? styles.activeButtonText : styles.inactiveButtonText}
      />
      <Button 
        title="Месяц" 
        onPress={() => setPeriod('month')} 
        style={period === 'month' ? styles.activeButton : styles.inactiveButton}
        textStyle={period === 'month' ? styles.activeButtonText : styles.inactiveButtonText}
      />
    </View>
  );

  const renderDailyStatistics = () => {
    if (!dailyStats) return null;
    
    const timeOfDayData = {
      labels: ['Утро', 'День', 'Вечер', 'Ночь'],
      datasets: [
        {
          data: [
            dailyStats.timeStats.morningCompleted,
            dailyStats.timeStats.afternoonCompleted,
            dailyStats.timeStats.eveningCompleted,
            dailyStats.timeStats.nightCompleted
          ]
        }
      ]
    };
    
    const priorityData = {
      labels: ['Низкий', 'Средний', 'Высокий'],
      datasets: [
        {
          data: [
            dailyStats.priorityStats.low.completed,
            dailyStats.priorityStats.medium.completed,
            dailyStats.priorityStats.high.completed
          ]
        }
      ]
    };
    
    return (
      <View>
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Сегодняшний прогресс</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyStats.dailyStats.tasksCompleted}</Text>
              <Text style={styles.statLabel}>Выполнено</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyStats.dailyStats.tasksCreated}</Text>
              <Text style={styles.statLabel}>Всего</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{dailyStats.dailyStats.completionRate}%</Text>
              <Text style={styles.statLabel}>Эффективность</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Продуктивность по времени суток</Text>
          <BarChart
            data={timeOfDayData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(78, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Задачи по приоритетам</Text>
          <BarChart
            data={priorityData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(241, 133, 78, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            style={styles.chart}
          />
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Ключевые показатели</Text>
          <Text style={styles.infoText}>Самое продуктивное время: <Text style={styles.highlightText}>{dailyStats.getMostProductiveTimeOfDay()}</Text></Text>
          <Text style={styles.infoText}>Заработано опыта: <Text style={styles.highlightText}>{dailyStats.dailyStats.totalExperienceGained} XP</Text></Text>
        </View>
      </View>
    );
  };

  const renderWeeklyStatistics = () => {
    if (!weeklyStats || weeklyStats.length === 0) return null;
    
    const completionData = {
      labels: weeklyStats.map(stat => {
        const date = new Date(stat.date);
        return date.getDate() + '/' + (date.getMonth() + 1);
      }),
      datasets: [
        {
          data: weeklyStats.map(stat => stat.dailyStats.completionRate),
          color: (opacity = 1) => `rgba(78, 102, 241, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Эффективность (%)']
    };
    
    const tasksData = {
      labels: weeklyStats.map(stat => {
        const date = new Date(stat.date);
        return date.getDate() + '/' + (date.getMonth() + 1);
      }),
      datasets: [
        {
          data: weeklyStats.map(stat => stat.dailyStats.tasksCompleted),
          color: (opacity = 1) => `rgba(78, 241, 120, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Выполненные задачи']
    };
    
    const weeklyEfficiency = StatisticsService.calculateEfficiency(weeklyStats);
    
    return (
      <View>
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Недельная эффективность</Text>
          <View style={styles.centerStat}>
            <Text style={styles.largeStatValue}>{weeklyEfficiency}%</Text>
            <Text style={styles.statLabel}>Средняя эффективность</Text>
          </View>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Динамика эффективности</Text>
          <LineChart
            data={completionData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(78, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4E66F1'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Выполненные задачи</Text>
          <LineChart
            data={tasksData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(78, 241, 120, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4EF178'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  const renderMonthlyStatistics = () => {
    if (!monthlyStats || monthlyStats.length === 0) return null;
    
    // Группируем данные по неделям для упрощения графика
    const weeklyData = [];
    for (let i = 0; i < monthlyStats.length; i += 7) {
      const weekStats = monthlyStats.slice(i, i + 7);
      const weekEfficiency = StatisticsService.calculateEfficiency(weekStats);
      const weekNumber = Math.floor(i / 7) + 1;
      weeklyData.push({ week: `Нед ${weekNumber}`, efficiency: weekEfficiency });
    }
    
    const completionData = {
      labels: weeklyData.map(week => week.week),
      datasets: [
        {
          data: weeklyData.map(week => week.efficiency),
          color: (opacity = 1) => `rgba(78, 102, 241, ${opacity})`,
          strokeWidth: 2
        }
      ],
      legend: ['Эффективность по неделям (%)']
    };
    
    // Вычисляем общую месячную статистику
    const totalTasksCompleted = monthlyStats.reduce((sum, stat) => sum + stat.dailyStats.tasksCompleted, 0);
    const totalTasksCreated = monthlyStats.reduce((sum, stat) => sum + stat.dailyStats.tasksCreated, 0);
    const monthlyEfficiency = StatisticsService.calculateEfficiency(monthlyStats);
    
    return (
      <View>
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Месячная статистика</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalTasksCompleted}</Text>
              <Text style={styles.statLabel}>Выполнено</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalTasksCreated}</Text>
              <Text style={styles.statLabel}>Всего</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{monthlyEfficiency}%</Text>
              <Text style={styles.statLabel}>Эффективность</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statsCard}>
          <Text style={styles.statTitle}>Эффективность по неделям</Text>
          <LineChart
            data={completionData}
            width={screenWidth - 40}
            height={220}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(78, 102, 241, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: {
                borderRadius: 16
              },
              propsForDots: {
                r: '6',
                strokeWidth: '2',
                stroke: '#4E66F1'
              }
            }}
            bezier
            style={styles.chart}
          />
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4E66F1" />
          <Text style={styles.loadingText}>Загрузка статистики...</Text>
        </View>
      );
    }

    switch (period) {
      case 'day':
        return renderDailyStatistics();
      case 'week':
        return renderWeeklyStatistics();
      case 'month':
        return renderMonthlyStatistics();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <Header title="Статистика" showBackButton onBack={() => navigation.goBack()} />
      
      {renderPeriodSelector()}
      
      <ScrollView style={styles.contentContainer}>
        {renderContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F6FA',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  activeButton: {
    backgroundColor: '#4E66F1',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  inactiveButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  activeButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  inactiveButtonText: {
    color: '#4E66F1',
    fontWeight: 'bold',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
  },
  statTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4E66F1',
  },
  largeStatValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4E66F1',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
  },
  highlightText: {
    fontWeight: 'bold',
    color: '#4E66F1',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
  centerStat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
});