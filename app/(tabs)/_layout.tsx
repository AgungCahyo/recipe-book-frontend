// app/(tabs)/_layout.tsx
import "../../global.css"
import { useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { withLayoutContext } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const BottomTabs = createBottomTabNavigator();
const Tabs = withLayoutContext(BottomTabs.Navigator);

export default function TabsLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colorScheme === 'dark' ? '#60A5FA' : '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#111827' : '#FFFFFF',
          borderTopWidth: 1,
          borderColor: colorScheme === 'dark' ? '#1F2937' : '#E5E7EB',
          height: 60,
          paddingBottom: 6,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = '';
          if (route.name === 'HomeScreen') iconName = 'home-outline';
          if (route.name === 'RecipesScreen') iconName = 'book-outline';
          if (route.name === 'IngredientsScreen') iconName = 'leaf-outline';
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 2,
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: 'Home' }} />
      <Tabs.Screen name="recipes" options={{ title: 'Recipes' }} />
      <Tabs.Screen name="ingredients" options={{ title: 'Ingredients' }} />

    </Tabs>
  );
}
