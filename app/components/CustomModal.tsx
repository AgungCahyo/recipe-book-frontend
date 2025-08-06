import {
  Modal,
  Animated,
  Easing,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useEffect, useRef, useState, ReactNode } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export default function CustomModal({ open, onClose, title, children }: Props) {
  const slideAnim = useRef(new Animated.Value(300)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const [isVisible, setIsVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 300,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setIsVisible(false);
      });
    }
  }, [open]);

  if (!isVisible) return null;
  const slideStyle = {
    transform: [{ translateY: slideAnim }],
  };

  const backdropStaticStyle = {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end' as const,
  };

  const backdropAnimatedStyle = {
    opacity: opacityAnim,
  };

  return (
    <Modal transparent animationType="none" visible={isVisible}>
      <Animated.View style={[backdropStaticStyle, backdropAnimatedStyle]}>

        <Animated.View style={[slideStyle]} className="bg-white dark:bg-neutral-900 rounded-t-2xl p-4 pt-6 w-full">
          <Text className="text-lg font-semibold text-gray-900 dark:text-white mb-3">{title}</Text>
          <View className="max-h-[70vh]">{children}</View>
          <TouchableOpacity
            onPress={onClose}
            className="absolute top-4 right-4 px-3 bg-gray-200 dark:bg-neutral-700 py-2 rounded">
            <Text className="text-center text-gray-800 dark:text-white font-medium">Tutup</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
