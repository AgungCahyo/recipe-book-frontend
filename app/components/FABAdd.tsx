import { TouchableOpacity, Text } from 'react-native';

export default function FABAdd({ onPress }: { onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="absolute bottom-6 right-6 bg-blue-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
      activeOpacity={0.85}
    >
      <Text className="text-white text-3xl font-bold">＋</Text>
    </TouchableOpacity>
  );
}
