import Toast from 'react-native-toast-message';

type ToastType = 'success' | 'error' | 'info' | 'warning';

export default function showToast(
  message: string,
  type: ToastType = 'info',
  subtitle?: string
) {
  Toast.show({
    type,
    text1: message,
    text2: subtitle,
    position: 'top',
    visibilityTime: 3000,
    topOffset: 50,
  });
}
