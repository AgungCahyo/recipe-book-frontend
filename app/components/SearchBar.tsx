import { TextInput, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // ✅ import ikon

type SearchBarProps = {
  title: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ title, placeholder, value, onChangeText }: SearchBarProps) {
  return (
    <View className="px-5 pt-10 pb-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-black shadow-sm">
      <Text className="text-2xl font-semibold text-gray-900 dark:text-white text-center">
        {title}
      </Text>

      {/* Input + Icon */}
      <View className="mt-4 flex-row items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-xl">
        <Ionicons name="search-outline" size={20} color="#9CA3AF" className="mr-2" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          className="flex-1 text-gray-900 dark:text-white"
        />
      </View>
    </View>
  );
}
