import React, { useMemo, useEffect, useCallback } from 'react';
import { View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useColorScheme } from 'nativewind';
import TabBarItem from './TabBarItem';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useDerivedValue,
} from 'react-native-reanimated';

type TabItem = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const ITEMS: TabItem[] = [
  { key: 'home', title: 'Home', icon: 'home-outline', route: '/main' },
  { key: 'recipes', title: 'Resep', icon: 'book-outline', route: '/main/recipes' },
  { key: 'ingredients', title: 'Bahan', icon: 'leaf-outline', route: '/main/ingredients' },
];

const VALID_ROUTES = new Set(ITEMS.map(item => item.route));
const TAB_BAR_HEIGHT = 60;
const BACKGROUND_MARGIN = 8;

type Props = {
  children?: React.ReactNode;
};

export default function BottomTabBar({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();

  const isDark = useMemo(() => colorScheme === 'dark', [colorScheme]);
  const showTabBar = useMemo(() => VALID_ROUTES.has(pathname), [pathname]);

  const screenWidth = useMemo(() => Dimensions.get('window').width, []);
  const tabWidth = useMemo(() => screenWidth / ITEMS.length, [screenWidth]);

  const activeIndex = useMemo(() => {
    const index = ITEMS.findIndex((item) => item.route === pathname);
    return Math.max(index, 0);
  }, [pathname]);

  // Reanimated shared value
  const translateX = useSharedValue(activeIndex * tabWidth);

  // Use derived value for smoother animation
  const derivedTranslateX = useDerivedValue(() => {
    return withSpring(activeIndex * tabWidth, { damping: 15, stiffness: 150 });
  });

  // Handle navigation smooth
  const handleNavigate = useCallback((route: string) => {
    if (pathname !== route) {
      router.replace(route);
    }
  }, [pathname, router]);

  // Animated style for background
  const backgroundStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: derivedTranslateX.value }],
  }));

  return (
    <View className="flex-1">
      <View className="flex-1">{children}</View>

      {showTabBar && (
        <View
          className={`flex-row relative ${isDark ? 'bg-dark' : 'bg-accent'}`}
          style={{ height: TAB_BAR_HEIGHT }}
        >
          {/* Animated background */}
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 5,
                left: 0,
                width: tabWidth - BACKGROUND_MARGIN * 2,
                height: 50,
                backgroundColor: isDark ? '#1F2937' : '#E5D5C2',
                borderRadius: 12,
                marginHorizontal: BACKGROUND_MARGIN,
              },
              backgroundStyle
            ]}
          />

          {/* Tab items */}
          {ITEMS.map(({ key, title, icon, route }, index) => {
            const active = pathname === route;
            return (
              <View key={key} style={{ flex: 1 }}>
                <TabBarItem
                  icon={icon}
                  title={title}
                  active={active}
                  isDark={isDark}
                  onPress={() => handleNavigate(route)}
                />
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
