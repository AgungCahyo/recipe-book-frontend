import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, useColorScheme } from 'react-native';

const LoadingComponent = () => {
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  const opacity1 = useRef(new Animated.Value(0.3)).current;
  const opacity2 = useRef(new Animated.Value(0.3)).current;
  const opacity3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animate = (opacity: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 600,
            delay,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
        { resetBeforeIteration: true }
      ).start();
    };

    animate(opacity1, 0);
    animate(opacity2, 200);
    animate(opacity3, 400);
  }, [opacity1, opacity2, opacity3]);

  // style dot tetap pakai inline shadow dan borderRadius
  const dotBaseStyle = {
    width: 16,
    height: 16,
    borderRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  };

  return (
    <View
      className={`flex-1 justify-center items-center px-6 ${
        isDark ? 'bg-background-dark' : 'bg-background-light'
      }`}
    >
      <View className="flex-row justify-center items-center">
        {[opacity1, opacity2, opacity3].map((opacity, i) => (
          <Animated.View
            key={i}
            style={{
              ...dotBaseStyle,
              opacity,
              backgroundColor: isDark ? '#0a84ff' : '#204c4b',
              marginLeft: i === 0 ? 0 : 16,
              shadowColor: isDark ? '#0a84ff' : '#204c4b',
            }}
          />
        ))}
      </View>

      <Text
        className={`mt-5 text-base font-semibold ${
          isDark ? 'text-muted' : 'text-dark'
        }`}
        style={{ letterSpacing: 0.5 }}
      >
        Memuat data resep...
      </Text>
    </View>
  );
};

export default LoadingComponent;
