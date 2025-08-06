import React, { useRef, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Animated,
  Text,
  StyleSheet,
  Easing,
  Dimensions,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { recipeCategories } from 'data/categories';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

type Props = {
  selected: string;
  onSelect: (category: string) => void;
};

export default function FilteredCategory({ selected, onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const animation = useRef(new Animated.Value(0)).current;

  const toggleDropdown = () => {
    Animated.timing(animation, {
      toValue: open ? 0 : 1,
      duration: 120,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => setOpen(!open));
  };

  const dropdownStyle = {
    opacity: animation,
    transform: [
      {
        scale: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [-10, 0],
        }),
      },
    ],
  };

  return (
    <View className="relative z-10">
      {/* Trigger Button */}
      <TouchableOpacity onPress={toggleDropdown} className="mr-2">
        <Ionicons name="filter-outline" size={20} color="#4B5563" />
      </TouchableOpacity>

      {/* Dropdown Layer */}
      {open && (
        <View
          style={StyleSheet.absoluteFillObject}
          pointerEvents="box-none"
        >
          {/* Fullscreen Pressable Backdrop */}
          <Pressable
            style={{
              position: 'absolute',
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              top: 0,
              left: 0,
              zIndex: 1,
            }}
            onPress={toggleDropdown}
          />

          {/* Dropdown Panel */}
          <Animated.View
            style={[styles.dropdownContainer, dropdownStyle, { zIndex: 2 }]}
            className="absolute top-10 right-0 w-52 bg-white dark:bg-neutral-900 rounded-xl  border border-gray-200 dark:border-gray-700 p-2"
          >
            <TouchableOpacity
              onPress={() => {
                onSelect('');
                toggleDropdown();
              }}
              className="flex-row items-center justify-between px-3 py-2 rounded-md"
            >
              <Text className="text-sm text-gray-700 dark:text-white">
                Semua Kategori
              </Text>
              {selected === '' && (
                <Ionicons name="checkmark" size={16} color="#4B5563" />
              )}
            </TouchableOpacity>

            {recipeCategories.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => {
                  onSelect(cat);
                  toggleDropdown();
                }}
                className="flex-row items-center justify-between px-3 py-2 rounded-md"
              >
                <Text className="text-sm text-gray-700 dark:text-white">{cat}</Text>
                {selected === cat && (
                  <Ionicons name="checkmark" size={16} color="#4B5563" />
                )}
              </TouchableOpacity>
            ))}
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  dropdownContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
  },
});
