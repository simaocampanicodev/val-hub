// services/firebase.ts - VERSÃO ATUALIZADA
// ⭐ ADICIONADO: Firebase Storage para upload de avatares

import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // ⭐ NOVO

const firebaseConfig = {
  apiKey: "AIzaSyAlHKJkKbbsbPU6UkFHqPtqUCPn_sg-6hk",
  authDomain: "val-hub-4994b.firebaseapp.com",
  projectId: "val-hub-4994b",
  storageBucket: "val-hub-4994b.firebasestorage.app",
  messagingSenderId: "107992744301",
  appId: "1:107992744301:web:3499e5bc70499e0f351a64"
};

// Inicialização do Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app); // ⭐ NOVO: Storage inicializado
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Erro ao fazer login com Google:", error);
    
    if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(`UNAUTHORIZED DOMAIN!\n\nFirebase has blocked this site for security.\n\nFIX:\n1. Go to Firebase Console > Authentication > Settings > Authorized Domains.\n2. Add this domain: ${currentDomain}`);
    } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid. please pass a valid api key.') {
        alert("Configuration error: API keys in 'services/firebase.ts' are incorrect.");
    } else if (error.code === 'auth/popup-closed-by-user') {
        // Usuário fechou a janela propositadamente, ignorar.
    } else {
        alert(`Authentication error (${error.code}): ${error.message}`);
    }
    throw error;
  }
};

export const logoutUser = async () => {
    await firebaseSignOut(auth);
};
