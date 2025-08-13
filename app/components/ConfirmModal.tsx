import React from 'react';
import { Modal, View, Text, TouchableOpacity } from 'react-native';

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function ConfirmModal({
  visible,
  title,
  message,
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View className="flex-1 justify-center items-center bg-black/60 px-6">
        <View className="bg-accent dark:bg-zinc-900 rounded-xl p-6 w-full max-w-md shadow-lg">
          <Text className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 text-center">
            {title}
          </Text>
          <Text className="text-gray-700 dark:text-gray-300 mb-6 text-center">
            {message}
          </Text>

          <View className="flex-row justify-between gap-4">
            <TouchableOpacity
              onPress={onCancel}
              className="flex-1 bg-gray-300 dark:bg-zinc-700 rounded-lg py-3"
              activeOpacity={0.7}
            >
              <Text className="text-center text-gray-800 dark:text-gray-200 font-semibold">
                Batal
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              className="flex-1 bg-red-600 rounded-lg py-3"
              activeOpacity={0.7}
            >
              <Text className="text-center text-white font-semibold">
                Hapus
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
