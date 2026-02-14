
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut, User as FirebaseUser } from 'firebase/auth';

// ------------------------------------------------------------------
// COLA AQUI AS TUAS CHAVES DO FIREBASE (Passo 4 do Guia)
// ------------------------------------------------------------------
const firebaseConfig = {
  apiKey: "AIzaSyAlHKJkKbbsbPU6UkFHqPtqUCPn_sg-6hk",             // Ex: "AIzaSy..."
  authDomain: "val-hub-4994b.firebaseapp.com",         // Ex: "val-hub.firebaseapp.com"
  projectId: "val-hub-4994b",           // Ex: "val-hub-123"
  storageBucket: "val-hub-4994b.firebasestorage.app",   // Ex: "val-hub.appspot.com"
  messagingSenderId: "107992744301",    // Ex: "8321..."
  appId: "1:107992744301:web:3499e5bc70499e0f351a64"                    // Ex: "1:8321..."
};

// Inicialização do Firebase
// Se as chaves acima não estiverem preenchidas, o site vai dar erro na consola.
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<FirebaseUser> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Erro ao fazer login com Google:", error);
    
    // Tratamento de erros comuns
    if (error.code === 'auth/unauthorized-domain') {
        const currentDomain = window.location.hostname;
        alert(`DOMÍNIO NÃO AUTORIZADO!\n\nO Firebase bloqueou este site por segurança.\n\nSOLUÇÃO:\n1. Vá à consola do Firebase > Authentication > Settings > Authorized Domains.\n2. Adicione este domínio: ${currentDomain}`);
    } else if (error.code === 'auth/configuration-not-found' || error.code === 'auth/api-key-not-valid. please pass a valid api key.') {
        alert("ERRO DE CONFIGURAÇÃO: As chaves API no ficheiro 'services/firebase.ts' estão incorretas.");
    } else if (error.code === 'auth/popup-closed-by-user') {
        // Usuário fechou a janela propositadamente, ignorar.
    } else {
        alert(`Erro de Autenticação (${error.code}): ${error.message}`);
    }
    throw error;
  }
};

export const logoutUser = async () => {
    await firebaseSignOut(auth);
};
