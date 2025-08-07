// components/BackButton.tsx
import { useRouter } from 'expo-router';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';

export default function BackButton() {
  const router = useRouter();
  const theme = useColorScheme();
  const isDark = theme === 'dark';

  return (
    <View>
      <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
        <Ionicons name="return-down-back-outline" size={28} color={isDark ? 'white' : 'black'} />
      </TouchableOpacity>
    </View>
  );
}
