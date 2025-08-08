import { TextInput, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SearchBarProps = {
  title: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
};

export default function SearchBar({ title, placeholder = '', value, onChangeText }: SearchBarProps) {
  return (
    <View className=" px-5 bg-transparent">
    

      {/* Input + Icon */}
      <View className=" flex-row items-center px-4 py-2 bg-accent border-primary border dark:bg-primary-dark/40 rounded-3xl">
        <Ionicons name="search-outline" size={20} color="#204C4B" />
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#8AA5A4"
          value={value}
          onChangeText={onChangeText}
          className="flex-1 ml-2 text-dark rounded-xl dark:text-accent"
        />
      </View>
    </View>
  );
}
