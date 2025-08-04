import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Ingredient } from 'context/IngredientsContext';

type Props = {
  item: Ingredient;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function IngredientItem({
  item,
  isSelected,
  isSelectionMode,
  onPress,
  onLongPress,
}: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
     onLongPress={() => {
    onLongPress();
  }}
      delayLongPress={200} // ✅ lebih cepat masuk selection mode
      activeOpacity={0.9}
      className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-neutral-900"
    >
      <View className="flex-row items-center gap-3 flex-1">
        {isSelectionMode ? (
          <Checkbox value={isSelected} className="w-5 h-5 rounded-md" />
        ) : null}

        <View className="flex-1">
          <Text
            className="text-gray-900 dark:text-white font-semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>

          <Text className="text-sm text-gray-500 mt-0.5">
            {item.quantity} {item.unit} • Rp{item.totalPrice.toLocaleString()}
          </Text>

          <Text className="text-xs text-gray-400 mt-0.5 italic">
            Rp{item.pricePerUnit.toLocaleString()} / {item.unit}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(IngredientItem, (prev, next) => {
  return (
    prev.item.id === next.item.id &&
    prev.isSelected === next.isSelected &&
    prev.isSelectionMode === next.isSelectionMode
  );
});
