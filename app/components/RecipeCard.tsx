import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';

export default function RecipeCard({ item, isDark, onPress }: any) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-2xl overflow-hidden border shadow-sm ${isDark ? 'bg-[#1F2937] border-gray-700' : 'bg-white border-gray-200'}`}
      style={{ width: (Dimensions.get('window').width - 40 - 12) / 2 }}
      activeOpacity={0.85}
    >
      {item.imageUris?.[0] ? (
        <Image source={{ uri: item.imageUris[0] }} className="w-full h-28" resizeMode="cover" />
      ) : (
        <View className={`w-full h-28 items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
          <Text className="text-xs text-gray-500">No Image</Text>
        </View>
      )}
      <View className="p-3">
        <Text numberOfLines={1} className={`text-base font-semibold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {item.title}
        </Text>
        <Text numberOfLines={1} className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {item.ingredients.length} bahan • {item.category || 'Tanpa kategori'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
