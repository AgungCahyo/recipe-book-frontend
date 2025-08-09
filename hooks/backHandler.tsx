// hooks/useBackHandler.ts
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';
import { useCallback } from 'react';

export default function useBackHandler(callback: () => boolean) {
  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', callback);

      return () => subscription.remove();
    }, [callback])
  );
}
