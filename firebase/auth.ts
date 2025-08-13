// firebase/auth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export const GOOGLE_WEB_CLIENT_ID = '512167328296-uko2aqhtla7n0hpoagvjg7va3gb9h1t7.apps.googleusercontent.com';

// Hanya untuk konfigurasi, tidak langsung sign-in
export const configureGoogleSignin = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: ['openid', 'email', 'profile'],
    forceCodeForRefreshToken: true,
  });
};

// Optional helper sign-out
export const signOutGoogle = async () => {
  await GoogleSignin.revokeAccess();
  await GoogleSignin.signOut();
  await auth().signOut();
};

export const getCurrentUser = () => auth().currentUser;
export const onAuthStateChanged = (callback: (user: any) => void) =>
  auth().onAuthStateChanged(callback);
