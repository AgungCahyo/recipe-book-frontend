// firebase/auth.ts
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

export const GOOGLE_WEB_CLIENT_ID = '512167328296-uko2aqhtla7n0hpoagvjg7va3gb9h1t7.apps.googleusercontent.com';

// Configure Google Signin (panggil sekali di App root)
export const configureGoogleSignin = () => {
  GoogleSignin.configure({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    offlineAccess: true,
    scopes: ['openid', 'email', 'profile'],
    forceCodeForRefreshToken: true,
  });
};

// Sign out helper
export const signOutGoogle = async () => {
  await GoogleSignin.revokeAccess().catch(() => {});
  await GoogleSignin.signOut().catch(() => {});
  await auth().signOut();
};

// Current user helper
export const getCurrentUser = () => auth().currentUser;

// Listen auth state
export const onAuthStateChanged = (callback: (user: any) => void) =>
  auth().onAuthStateChanged(callback);
