import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the designated database ID if provided
const firestoreDatabaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
export const db = firestoreDatabaseId && firestoreDatabaseId !== '(default)' 
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

/**
 * Check if the app is currently running inside an iframe (like AI Studio simulator)
 */
export const isInIframe = (): boolean => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/**
 * Robust sign-in with Google supporting Popup with timeout and redirect fallback
 */
export const signInWithGoogle = async (useRedirect: boolean = false): Promise<FirebaseUser | null> => {
  // If redirect requested or inside iframe, try popup with timeout or redirect
  if (useRedirect) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }

  // Promise with 15 second safety timeout to prevent getting stuck in "Conectando..."
  const popupPromise = signInWithPopup(auth, googleProvider).then(res => res.user);
  
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      reject(new Error('TIMEOUT: El inicio de sesión tardó demasiado o la ventana emergente fue bloqueada por el navegador.'));
    }, 18000);
  });

  try {
    const user = await Promise.race([popupPromise, timeoutPromise]);
    return user;
  } catch (error: any) {
    console.warn('Google sign-in attempt error:', error);
    // If popup blocked or cancelled or in iframe, we bubble the clear error
    throw error;
  }
};

export const checkRedirectResult = async (): Promise<FirebaseUser | null> => {
  try {
    const result = await getRedirectResult(auth);
    return result?.user || null;
  } catch (error) {
    console.warn('Error checking redirect result:', error);
    return null;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  onAuthStateChanged,
  type FirebaseUser
};
