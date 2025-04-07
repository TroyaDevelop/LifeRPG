import { firebase } from '@react-native-firebase/app';

// Проверка, инициализирован ли Firebase
if (!firebase.apps.length) {
  firebase.initializeApp({
    // Минимальная конфигурация для работы push-уведомлений
    // Можно использовать пустые значения, если вы не планируете использовать Firebase напрямую
    apiKey: "dummy-api-key",
    projectId: "dummy-project",
    appId: "1:123456789012:android:abcdef1234567890"
  });
}

export default firebase;