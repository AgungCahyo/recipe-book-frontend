import React, { useRef, useState, useCallback } from 'react';
import {
  TouchableOpacity,
  View,
  Animated,
  StyleSheet,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';

type ActionButton = {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
};

export default function FABAdd({ actions }: { actions: ActionButton[] }) {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const animateTo = (toValue: number) => {
    Animated.spring(animation, {
      toValue,
      friction: 20,
      useNativeDriver: true,
    }).start();
  };

  const toggleMenu = () => {
  const toValue = open ? 0 : 1;

  // 💡 Cegah animasi dipanggil dengan value yang sama
  animation.stopAnimation((currentValue) => {
    if (currentValue === toValue) return; // Jangan animasi ulang
    Animated.spring(animation, {
      toValue,
      friction: 10,
      useNativeDriver: true,
    }).start();
    setOpen(prev => !prev)
  });
};


  // ✅ Reset FAB saat screen kembali aktif
  useFocusEffect(
    useCallback(() => {
      // Saat screen difokusin (balik dari halaman lain)
      animateTo(0);
      setOpen(false);
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Backdrop klik di luar */}
      {open && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={toggleMenu}
          style={styles.backdrop}
        />
      )}

      {actions.map((action, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -(70 * (index + 1))],
        });

        const animatedStyle = {
          transform: [{ scale: animation }, { translateY }],
          opacity: animation,
          zIndex: actions.length - index,
        };

        return (
          <Animated.View
            key={index}
            style={[styles.button, styles.secondary, animatedStyle]}
          >
            <TouchableOpacity
              onPress={() => {
                toggleMenu(); // Tutup setelah klik
                action.onPress();
              }}
            >
              <Ionicons name={action.icon} size={24} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB */}
      <TouchableOpacity onPress={toggleMenu} style={[styles.button, styles.main]}>
        <Ionicons name={open ? 'close' : 'add'} size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 70,
    right: 30,
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  button: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 5,
  },
  main: {
    backgroundColor: '#2563EB',
  },
  secondary: {
    backgroundColor: '#4B5563',
  },
});
