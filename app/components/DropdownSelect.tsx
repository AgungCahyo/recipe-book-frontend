import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  TextInput,
} from 'react-native';

type Props = {
  label?: string;
  placeholder?: string;
  value: string;
  options:readonly string[];
  onSelect: (value: string) => void;
  className?: string;
};

export default function DropdownSelect({
  value,
  options,
  onSelect,
  placeholder = 'Pilih opsi...',
  className = '',
  label,
}: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  return (
    <View className={`mb-4 ${className}`}>
      {label && (
        <Text className="text-gray-100 dark:text-gray-300 font-semibold mb-2">
          {label}
        </Text>
      )}
      <TouchableOpacity
        onPress={() => setOpen(true)}
        className="border border-primary dark:border-gray-600 bg-white dark:bg-neutral-900 rounded-xl px-4 py-2 justify-center"
      >
        <Text className={`text-base ${value ? 'text-gray-800 dark:text-white' : 'text-gray-400'}`}>
          {value || placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-center px-8"
          onPress={() => setOpen(false)}
        >
          <Pressable
            className="bg-accent dark:bg-neutral-900 rounded-xl p-4 max-h-[400px] w-full"
            onStartShouldSetResponder={() => true}
          >
            <TextInput
              placeholder="Cari..."
              value={search}
              onChangeText={setSearch}
              placeholderTextColor="#9CA3AF"
              className="border border-primary dark:border-gray-600 rounded-md px-3 py-2 mb-3 text-black dark:text-white bg-white dark:bg-neutral-800"
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(item);
                    setOpen(false);
                  }}
                  className="py-3 px-2 border-b border-primary/30 dark:border-gray-700"
                >
                  <Text className="text-primary dark:text-white text-base">
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-center text-gray-400 mt-4">
                  Tidak ditemukan
                </Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
