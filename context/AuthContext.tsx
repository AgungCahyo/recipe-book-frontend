// context/AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { db, firebaseAuth, serverTimestamp, } from '../firebase/config';

interface AuthContextType {
  user: FirebaseAuthTypes.User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  hasProfile: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  hasProfile: false,
  signInWithGoogle: async () => { },
  signOut: async () => { },
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configure Google Sign-In + listen Firebase auth
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '512167328296-uko2aqhtla7n0hpoagvjg7va3gb9h1t7.apps.googleusercontent.com',
      offlineAccess: true,
      scopes: ['openid', 'email', 'profile'],
      forceCodeForRefreshToken: true,
    });

    const unsubscribe = auth().onAuthStateChanged((u) => setUser(u));
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Starting Google Sign-In...');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      await GoogleSignin.signIn();

      const { idToken } = await GoogleSignin.getTokens();
      if (!idToken) throw new Error('Google Sign-In failed: no ID token');

      const credential = auth.GoogleAuthProvider.credential(idToken);
      const userCredential = await auth().signInWithCredential(credential);

      const loggedInUser = userCredential.user;
      if (!loggedInUser) throw new Error('User not found after sign-in');

      setUser(loggedInUser);
      console.log('Firebase sign-in success:', loggedInUser.email);

      // Reference ke dokumen user
      const userRef = db.collection('users').doc(loggedInUser.uid);

      // Cek apakah dokumen ada
      const userSnapshot = await userRef.get();

      if (!userSnapshot.exists) {
        // Buat dokumen baru jika belum ada
        await userRef.set({
          name: loggedInUser.displayName || '',
          email: loggedInUser.email || '',
          age: 0,
          photoURL: loggedInUser.photoURL || '',
          createdAt: serverTimestamp(),
        });
        console.log('User document created in Firestore');
      } else {
        console.log('User document already exists');
      }

    } catch (err: any) {
      console.error('Google Sign-In Error:', err);

      let msg = 'Unknown error';
      if (err.code === statusCodes.SIGN_IN_CANCELLED) msg = 'Sign-in cancelled';
      else if (err.code === statusCodes.IN_PROGRESS) msg = 'Sign-in in progress';
      else if (err.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) msg = 'Play Services not available';
      else if (err.message) msg = err.message;

      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };


  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await GoogleSignin.revokeAccess().catch(() => { });
      await GoogleSignin.signOut().catch(() => { });
      await auth().signOut();
      setUser(null);
      console.log('User signed out');
    } catch (err) {
      console.error('Sign-out error:', err);
      setError('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  const isAuthenticated = !!user;
  const hasProfile = !!(user?.displayName && user?.photoURL);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, isAuthenticated, hasProfile, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
