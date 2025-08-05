import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import Papa from 'papaparse';

export async function cvsImporter(): Promise<any[] | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
     type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const parsed = Papa.parse(content, {
      header: true,
      skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
      console.warn('CSV parse error:', parsed.errors);
      return null;
    }

    return parsed.data; // array of object from CSV
  } catch (error) {
    console.error('Import CSV error:', error);
    return null;
  }
}
