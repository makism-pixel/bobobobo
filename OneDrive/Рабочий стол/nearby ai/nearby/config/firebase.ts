import { initializeApp, getApps } from 'firebase/app';
import { initializeAuth, getReactNativePersistence, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Firebase конфигурация
const firebaseConfig = {
    apiKey: "AIzaSyBNNibQxaYnGxO84IQwYTI2orSZvU6-zlU",
    authDomain: "nearby-74439.firebaseapp.com",
    projectId: "nearby-74439",
    storageBucket: "nearby-74439.firebasestorage.app",
    messagingSenderId: "1078283014446",
    appId: "1:1078283014446:web:efff3d7191f68c03212abf"
};

// Инициализация Firebase
let app;
if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
} else {
    app = getApps()[0];
}

// Инициализация Auth с персистентностью, Firestore и Storage
const auth: Auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});
const db: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);

export { auth, db, storage };
export default app; 