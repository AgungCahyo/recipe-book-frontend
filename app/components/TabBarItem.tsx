import React, { useEffect } from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  active: boolean;
  isDark: boolean;
  onPress: () => void;
};

export default function TabBarItem({ icon, title, active, isDark, onPress }: Props) {
  const scale = useSharedValue(active ? 1.2 : 1);
  const opacity = useSharedValue(active ? 1 : 0.6);

  useEffect(() => {
    scale.value = withTiming(active ? 1.2 : 1, { duration: 100 });
    opacity.value = withTiming(active ? 1 : 0.6, { duration: 200 });
  }, [active]);

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const animatedTextStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 items-center justify-center"
      activeOpacity={0.7}
    >
      <Animated.View style={animatedIconStyle}>
        <Ionicons
          name={icon as any}
          size={24}
          color={active ? (isDark ? '#F2E8DC' : '#ffb901') : (isDark ? '#6b7280' : '#ffffff')}
          
        />
      </Animated.View>
      <Animated.Text
        style={[{ marginTop: 4, fontSize: 12, fontWeight: '600' }, animatedTextStyle]}
        className={`${isDark ? 'text-accent': 'text-dark'}`}
      >
        {title}
      </Animated.Text>
    </TouchableOpacity>
  );
}
