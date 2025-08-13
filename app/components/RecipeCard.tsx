import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type RecipeCardProps = {
  item: any;
  isDark: boolean;
  onPress: () => Promise<void> | void;
  onLongPress?: () => void;
  selected?: boolean;
  isSelectionMode?: boolean;
};

export default function RecipeCard({
  item,
  isDark,
  onPress,
  onLongPress,
  selected = false,
  isSelectionMode = false,
}: RecipeCardProps) {
  const cardWidth = (Dimensions.get('window').width - 40 - 12) / 2;
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (isSelectionMode) {
      onPress();
      return;
    }
    setLoading(true);
    try {
      await onPress();
    } catch {
      // optional error handling
    } finally {
      setLoading(false);
    }
  };

  // Tailwind classes untuk border dan background berdasarkan state
  const borderClass = selected
    ? 'border-primary'
    : isDark
      ? 'border-gray-700'
      : 'border-gray-300';

  const bgClass = selected
    ? isDark
      ? 'bg-primary/20'
      : 'bg-blue-500/20'
    : isDark
      ? 'bg-gray-800'
      : 'bg-white';

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={onLongPress}
      activeOpacity={0.85}
      className={`${borderClass} ${bgClass} rounded-xl overflow-hidden relative`}
      style={{
        width: cardWidth,
        borderWidth: 2,
      }}
      disabled={loading && !isSelectionMode}
    >
      {item.imageUris?.[0] ? (
        <Image
          source={{ uri: item.imageUris[0] }}
          className="w-full h-28"
          resizeMode="cover"
        />
      ) : (
        <View
          className={`${isDark ? 'bg-gray-700' : 'bg-gray-200'} justify-center items-center w-full h-28`}
        >
          <Ionicons
            name="image-outline"
            size={24}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1 text-xs`}>
            Tidak Ada Gambar
          </Text>
        </View>
      )}

      <View className="p-3">
        <Text
          numberOfLines={1}
          className={`${isDark ? 'text-white' : 'text-black'} text-lg font-semibold mb-1`}
        >
          {item.title}
        </Text>

        <Text
          className={`${isDark ? 'text-blue-400' : 'text-primary'} text-base font-medium`}
        >
          Harga Jual: Rp{' '}
          {item.sellingPrice
            ? item.sellingPrice.toLocaleString('id-ID')
            : '—'}
        </Text>

        <View className="flex-row items-center mt-1">
          <Ionicons
            name="pricetag-outline"
            size={12}
            color={isDark ? '#9CA3AF' : '#6B7280'}
          />
          <Text
            numberOfLines={1}
            className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-xs ml-1`}
          >
            {`${item.ingredients.length} bahan • ${item.category || 'Tanpa kategori'}`}
          </Text>
        </View>
      </View>

      {loading && (
        <View
          className="absolute top-0 left-0 right-0 bottom-0 justify-center items-center rounded-xl"
          style={{
            width: cardWidth,
            backgroundColor: isDark ? 'rgba(31,41,55,0.7)' : 'rgba(255,255,255,0.7)',
          }}
        >
          <ActivityIndicator
            size="large"
            color={isDark ? '#0a84ff' : '#204c4b'}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}
