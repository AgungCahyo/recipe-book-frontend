// utils/showToast.ts
import { Platform, ToastAndroid, Alert } from 'react-native';

export default function showToast(msg: string) {
  if (Platform.OS === 'android') {
    ToastAndroid.show(msg, ToastAndroid.SHORT);
  } else {
    Alert.alert(msg);
  }
};
