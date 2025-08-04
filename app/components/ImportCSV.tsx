import React from 'react';
import { Alert, Text, TouchableOpacity } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';
import { useAlert } from 'context/AlertContext';

type ImportCSVProps = {
  onImport: (data: any[]) => void;
  label?: string;
};

export default function ImportCSV({ onImport, label = 'Import from CSV' }: ImportCSVProps) {
  const {showAlert} = useAlert();
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
        showAlert('File harus berekstensi .csv', 'error');
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
        showAlert('CSV tidak valid atau ada kesalahan format.', 'error');
        return;
      }

      const data = parsed.data as any[];

      onImport(data); // Lempar ke parent
      showAlert( `Berhasil mengimpor ${data.length} data.`, 'success');
    } catch (error) {
      showAlert('Terjadi kesalahan saat import.', 'error');
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
