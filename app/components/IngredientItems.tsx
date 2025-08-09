import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Ingredient } from 'context/ingredients/IngredientsProvider';

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
      onLongPress={onLongPress}
      delayLongPress={200}
      activeOpacity={0.9}
      className="flex-row items-center justify-between px-10 py-3 border-b border-muted dark:border-zinc-700 bg-[#fff] dark:bg-dark"
    >
      <View className="flex-row items-center gap-3 flex-1">
        {isSelectionMode ? (
          <Checkbox
            value={isSelected}
            className="w-5 h-5 rounded-xl border border-primary"
            color={isSelected ? '#204C4B' : undefined}
          />
        ) : null}

        <View className="flex-1">
          <Text
            className="text-primary text-lg dark:text-accent font-semibold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.name}
          </Text>

          <Text className="text-sm text-primary-dark mt-0.5">
            {`${item.quantity} ${item.unit} • Rp${item.totalPrice.toLocaleString()}`}
          </Text>

          <Text className="text-sm text-primary mt-0.5 italic">
            {`Rp${item.pricePerUnit.toLocaleString()} / ${item.unit}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default IngredientItem;
