# 🔥 Firebase Authentication Setup

## Шаг 1: Создание проекта Firebase

1. Перейдите в [Firebase Console](https://console.firebase.google.com/)
2. Нажмите "Создать проект" или "Add project"
3. Введите название проекта: `nearby-ai`
4. Отключите Google Analytics (не обязательно для данного проекта)
5. Нажмите "Создать проект"

## Шаг 2: Настройка Authentication

1. В боковом меню выберите **Authentication**
2. Нажмите **"Начать"**
3. Перейдите на вкладку **"Sign-in method"**
4. Включите следующие провайдеры:
   - ✅ **Email/Password** - включить
   - ✅ **Google** (опционально для будущего)

## Шаг 3: Добавление веб-приложения

1. В настройках проекта нажмите **"Add app"** → **Web**
2. Введите название: `Nearby AI Web`
3. Включите **"Firebase Hosting"** (опционально)
4. Нажмите **"Register app"**

## Шаг 4: Получение конфигурации

После создания приложения вы получите конфигурацию вида:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAbc123...",
  authDomain: "nearby-ai-12345.firebaseapp.com",
  projectId: "nearby-ai-12345",
  storageBucket: "nearby-ai-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
```

## Шаг 5: Обновление конфигурации

Замените данные в файле `config/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "ВАШ_API_KEY",
  authDomain: "ВАШ_AUTH_DOMAIN", 
  projectId: "ВАШ_PROJECT_ID",
  storageBucket: "ВАШ_STORAGE_BUCKET",
  messagingSenderId: "ВАШ_SENDER_ID",
  appId: "ВАШ_APP_ID"
};
```

## Шаг 6: Настройка для мобильных платформ

### Android

1. В Firebase Console добавьте Android приложение
2. Введите package name: `com.nearbyai.app`
3. Скачайте `google-services.json`
4. Поместите файл в `android/app/google-services.json`

### iOS

1. В Firebase Console добавьте iOS приложение
2. Введите bundle ID: `com.nearbyai.app`
3. Скачайте `GoogleService-Info.plist`
4. Поместите файл в корень iOS проекта

## Шаг 7: Тестирование

1. Запустите приложение: `npx expo start`
2. Попробуйте зарегистрироваться с тестовым email
3. Проверьте, что пользователь появился в Firebase Console → Authentication → Users

## 🛡️ Настройки безопасности

### Ограничения API ключа

1. В Google Cloud Console → APIs & Services → Credentials
2. Найдите ваш API ключ
3. Настройте Application restrictions:
   - **HTTP referrers** для веба
   - **Android apps** для Android
   - **iOS apps** для iOS

### Правила безопасности

В Firebase Console → Authentication → Settings → Authorized domains
добавьте ваши домены.

## 🚀 Дополнительные возможности

### Google Sign-In

Для Google авторизации понадобится:
1. Настроить OAuth consent screen в Google Cloud Console
2. Получить Web client ID
3. Добавить в конфигурацию приложения

### Сброс пароля

Настроить шаблоны email в Firebase Console → Authentication → Templates

## 📝 Полезные ссылки

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Auth for React Native](https://rnfirebase.io/auth/usage)
- [Expo Firebase](https://docs.expo.dev/guides/using-firebase/)

---

⚠️ **Важно**: Никогда не коммитьте реальные Firebase ключи в публичные репозитории! 