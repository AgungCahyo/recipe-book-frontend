import React, { useEffect, useState, useRef } from 'react';
import { Animated, TouchableOpacity, Text, ViewStyle } from 'react-native';

type SelectionModeActionsProps = {
  isSelectionMode: boolean;
  handleSelectAll: () => void;
  selectAllText: string;
  deleteSelected: () => void;
  selectedCount: number;
  cancelSelection: () => void;
};

export default function SelectionModeActions({
  isSelectionMode,
  handleSelectAll,
  selectAllText,
  deleteSelected,
  selectedCount,
  cancelSelection,
}: SelectionModeActionsProps) {
  const [visible, setVisible] = useState(isSelectionMode);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isSelectionMode) {
      setVisible(true);
      Animated.timing(anim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setVisible(false));
    }
  }, [isSelectionMode, anim]);

  if (!visible) return null;

  const opacity = anim;
  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0], // slide dari atas ke bawah
  });

  const animatedStyle: ViewStyle = {
    opacity,
    transform: [{ translateY }],
  };

  return (
    <Animated.View
      style={animatedStyle}
      className="absolute top-0 left-0 right-0 flex-row justify-between bg-background-light dark:bg-background-dark p-4 rounded-b-xl shadow-lg z-50"
    >
      <TouchableOpacity
        onPress={handleSelectAll}
        className="flex-1 bg-blue-200 py-3 rounded-xl mr-2"
        activeOpacity={0.7}
      >
        <Text className="text-blue-800 text-center font-semibold">{selectAllText}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={deleteSelected}
        className="flex-1 bg-red-600 py-3 rounded-xl mr-2"
        activeOpacity={0.7}
      >
        <Text className="text-white text-center font-semibold">Hapus ({selectedCount})</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={cancelSelection}
        className="flex-1 bg-gray-300 py-3 rounded-xl"
        activeOpacity={0.7}
      >
        <Text className="text-gray-800 text-center font-semibold">Batal</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}
