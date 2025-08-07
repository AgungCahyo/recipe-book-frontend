import React, { useState, useMemo } from 'react';
import {
  Modal,
  TouchableOpacity,
  View,
  Text,
  FlatList,
  TextInput,
  Pressable,
} from 'react-native';

type Option = {
  label: string;
  value: string;
};

type Props = {
  options: Option[];
  selectedValue: string | null;
  onSelect: (val: string) => void;
  onAddNew?: () => void;
  placeholder?: string;
};

export default function IngredientsDropdown({
  options,
  selectedValue,
  onSelect,
  onAddNew,
  placeholder = 'Pilih...',
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const filteredOptions = useMemo(() => {
    return options.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [options, search]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setModalVisible(false);
    setSearch('');
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="border border-gray-300 rounded-lg px-4 py-3   dark:bg-gray-900"
      >
        <Text className="text-black dark:text-white">
          {selectedValue
            ? options.find((o) => o.value === selectedValue)?.label
            : placeholder}
        </Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable
          className="flex-1 bg-black/40 justify-center px-6"
          onPressOut={() => {
            setModalVisible(false);
            setSearch('');
          }}
        >

          <View
            onStartShouldSetResponder={() => true}
            className="bg-white dark:bg-gray-900 rounded-xl w-full max-h-[500px] p-4"
          >
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Cari opsi..."
              placeholderTextColor="#9CA3AF"
              className="bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 rounded-md mb-3"
            />

            {filteredOptions.length === 0 ? (
              <Text className="text-gray-400 text-center py-6">Tidak ditemukan</Text>
            ) : (
              <FlatList
                data={filteredOptions}

                keyboardShouldPersistTaps="handled"
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    onPress={() => handleSelect(item.value)}
                    className="py-3 px-2 border-b border-gray-100 dark:border-gray-700"
                  >
                    <Text className="text-gray-800 dark:text-white text-base">
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}

            {onAddNew && (
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  setSearch('');
                  onAddNew();

                }}
                className="py-3 px-4 mt-3 bg-blue-100 dark:bg-blue-950 rounded-md"
              >
                <Text className="text-blue-700 dark:text-blue-400 text-center font-medium">
                  ＋ Tambah Bahan Baru
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
