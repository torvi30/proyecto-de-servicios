import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Configuración leída desde variables de entorno Vite
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
};

// Validar si las credenciales reales fueron configuradas
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes("AIzaSy...")
);

let app;
let auth;
let db;
let storage;
let googleProvider;

try {
  // Inicializa Firebase solo si hay credenciales o usa un placeholder seguro
  if (!getApps().length) {
    app = initializeApp(
      isFirebaseConfigured
        ? firebaseConfig
        : {
            apiKey: "demo-api-key-for-local-development",
            authDomain: "demo-project.firebaseapp.com",
            projectId: "demo-project",
            storageBucket: "demo-project.appspot.com",
            appId: "demo-app-id",
          }
    );
  } else {
    app = getApp();
  }

  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: "select_account" });
} catch (error) {
  console.warn("⚠️ Firebase se inicializó en modo demostración/local:", error.message);
}

export { app, auth, db, storage, googleProvider, firebaseConfig };
