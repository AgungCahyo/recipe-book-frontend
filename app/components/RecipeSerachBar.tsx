import { TextInput, View } from 'react-native';

export default function RecipeSearchBar({ value, onChange, isDark }: any) {
  return (
    <View
      className={`flex-row items-center px-4 py-2 mb-5 rounded-full shadow-sm border ${
        isDark ? 'bg-[#1F2937] border-gray-700' : 'bg-white border-gray-300'
      }`}
    >
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Cari resep..."
        placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
        className={`flex-1 text-base ${isDark ? 'text-white' : 'text-black'}`}
      />
    </View>
  );
}
