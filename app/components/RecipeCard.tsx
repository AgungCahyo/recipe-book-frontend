import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecipeCard({ item, isDark, onPress }: any) {
  const cardWidth = (Dimensions.get('window').width - 40 - 12) / 2;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        {
          width: cardWidth,
          borderRadius: 12,
          overflow: 'hidden',
          borderWidth: 1,
          borderColor: isDark ? '#374151' : '#E5E7EB',
          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        },
      ]}
    >
      {/* === Thumbnail Image or Placeholder === */}
      {item.imageUris?.[0] ? (
        <Image
          source={{ uri: item.imageUris[0] }}
          className="w-full h-28"
          resizeMode="cover"
        />
      ) : (
        <View
          className={`w-full h-28 items-center justify-center ${
            isDark ? 'bg-gray-800' : 'bg-gray-200'
          }`}
        >
          <Ionicons
            name="image-outline"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text className="text-xs mt-1 text-gray-500">Tidak Ada Gambar</Text>
        </View>
      )}

      {/* === Info Section === */}
      <View className="p-3">
        {/* Title */}
        <Text
          numberOfLines={1}
          className={`text-sm font-semibold mb-1 ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}
        >
          {item.title}
        </Text>

        {/* Harga Jual */}
        <Text
          className={`text-xs font-medium mt-1 ${
            isDark ? 'text-blue-400' : 'text-primary'
          }`}
        >
          Harga Jual: Rp{' '}
          {item.sellingPrice
            ? item.sellingPrice.toLocaleString('id-ID')
            : '—'}
        </Text>

        {/* Subtitle: jumlah bahan + kategori */}
        <View className="flex-row items-center gap-1 mt-1">
          <Ionicons
            name="pricetag-outline"
            size={12}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            numberOfLines={1}
            className={`text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            {`${item.ingredients.length} bahan • ${
              item.category || 'Tanpa kategori'
            }`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
