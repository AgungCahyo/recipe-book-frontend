import React from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

type ImportCSVProps = {
  onImport: (data: any[]) => void;
  label?: string;
};

export default function ImportCSV({ onImport, label = 'Import from CSV' }: ImportCSVProps) {
  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.length) return;

      const fileUri = result.assets[0].uri;
      const fileName = result.assets[0].name;

      if (!fileName.endsWith('.csv')) {
        Alert.alert('Format salah', 'File harus berekstensi .csv');
        return;
      }

      const content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const parsed = Papa.parse(content, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsed.errors.length) {
        console.log('CSV Parse errors:', parsed.errors);
        Alert.alert('Format Error', 'CSV tidak valid atau ada kesalahan format.');
        return;
      }

      const data = parsed.data as any[];

      onImport(data); // Lempar ke parent
      Alert.alert('Berhasil', `Berhasil mengimpor ${data.length} data.`);
    } catch (error) {
      console.error('❌ Gagal import CSV:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat import.');
    }
  };

  return (
    <TouchableOpacity
      onPress={handleImport}
      className="px-4 mb-2"
    >
      <Text className="text-left text-black ">{label}</Text>
    </TouchableOpacity>
  );
}
