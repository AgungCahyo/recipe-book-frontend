import React, { useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ingredient } from 'context/ingredients/IngredientsProvider';
import clsx from 'clsx';

type Props = {
  item: Ingredient;
  isSelected: boolean;
  isSelectionMode: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

export default function IngredientItem({
  item,
  isSelected,
  isSelectionMode,
  onPress,
  onLongPress,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

  const onPressIn = () => {
    Animated.timing(scaleAnim, {
      toValue: 0.99,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 80,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={200}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={[
        { transform: [{ scale: scaleAnim }] },
        isSelected && { borderColor: '#204C4B', borderWidth: 2 },
        isSelected && isSelectionMode && { backgroundColor: '#204C4B20' },
      ]}
      className={clsx(
        'pt-3 rounded-lg  px-3 flex-row items-center justify-between',
        !isSelected && 'border-transparent bg-transparent'
      )}
      android_ripple={{ color: 'rgba(0,0,0,0.1)' }}
    >
      <View className="flex-1 px-3 border-b border-primary/30 pb-2">
        <Text
          numberOfLines={1}
          className={clsx(
            'font-semibold text-lg',
            isSelected ? 'text-[#204C4B]' : 'text-[#204C4B]'
          )}
        >
          {item.name}
        </Text>

        <Text className="text-gray-600 mt-1">
          {`${item.quantity.toLocaleString()} ${item.unit} • Rp${item.totalPrice.toLocaleString()}`}
        </Text>

        <Text className="text-[#204C4B] mt-0.5 italic text-xs">
          {`Rp${item.pricePerUnit.toLocaleString()} / ${item.unit}`}
        </Text>
      </View>

      {isSelectionMode && isSelected && (
        <View className="absolute top-2 right-2 bg-[#204C4B] rounded-full w-6 h-6 justify-center items-center shadow">
          <Ionicons name="checkmark" size={16} color="white" />
        </View>
      )}
    </AnimatedPressable>
  );
}
