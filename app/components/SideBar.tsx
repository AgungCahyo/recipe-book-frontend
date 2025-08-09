import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { useColorScheme } from 'nativewind';

type SidebarItem = {
  key: string;
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: string;
};

const items: SidebarItem[] = [
  { key: 'home', title: 'Home', icon: 'home-outline', route: '/' },
  { key: 'recipes', title: 'Resep', icon: 'book-outline', route: '/recipePage' },
  { key: 'ingredients', title: 'Bahan', icon: 'leaf-outline', route: '/ingredientsPage' },
];

type SidebarProps = {
  children?: React.ReactNode;
};

export default function Sidebar({ children }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
const showTabBar = ['/', '/recipePage', '/ingredientsPage'].includes(pathname);
  const handleNavigate = (route: string) => {
    if (pathname !== route) {
      router.push(route);
    }
  };
if (!showTabBar) {
  // Kalau bukan di route itu, tab bar gak muncul, cuma render konten doang
  return <View style={{ flex: 1 }}>{children}</View>;
}

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Sidebar */}
      <View
        className={`bg-${isDark ? 'dark' : 'accent'} h-full w-56 p-4 border-r border-gray-300 dark:border-gray-700`}
      >
        {items.map(({ key, title, icon, route }) => {
          const active = pathname === route;
          return (
            <TouchableOpacity
              key={key}
              onPress={() => handleNavigate(route)}
              className={`flex-row items-center p-3 mb-2 rounded-md ${
                active ? 'bg-primary' : 'bg-transparent'
              }`}
              activeOpacity={0.7}
            >
              <Ionicons
                name={icon}
                size={22}
                className={active ? 'text-accent' : isDark ? 'text-muted-dark' : 'text-muted'}
              />
              <Text
                className={`ml-3 text-lg ${
                  active ? 'text-accent' : isDark ? 'text-muted-dark' : 'text-primary'
                }`}
              >
                {title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Konten utama di samping sidebar */}
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}
