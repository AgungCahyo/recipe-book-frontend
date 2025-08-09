import { useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { AlertType } from '../context/AlertContext';

export type ImageStatus = {
  uri: string;
  status: 'loading' | 'done' | 'error';
};

export function useRecipeUploader(
  showAlert: (msg: string, type?: AlertType) => void,
  initialImages: ImageStatus[] = []
) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<ImageStatus[]>([]);
  const [imageUris, setImageUris] = useState<ImageStatus[]>(initialImages);


  const saveImagePermanently = async (uri: string): Promise<string> => {
    try {
      const fileName = uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}images/${fileName}`;

      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, {
        intermediates: true,
      });

      await FileSystem.copyAsync({ from: uri, to: newPath });
      return newPath;
    } catch (err) {
      showAlert('Gagal menyimpan gambar.', 'error');
      throw err;
    }
  };

  const startImageUpload = async (assets: ImagePicker.ImagePickerAsset[]) => {
    setIsUploading(true);

    try {
      const resizedUris = await Promise.all(
        assets.map(async (asset) => {
          const manipulated = await ImageManipulator.manipulateAsync(
            asset.uri,
            [{ resize: { width: 800 } }],
            { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
          );
          return manipulated.uri;
        })
      );

      const savedUris = await Promise.all(resizedUris.map(saveImagePermanently));
      const imageStatusList: ImageStatus[] = savedUris.map((uri) => ({
        uri,
        status: 'done',
      }));
      setImageUris((prev) => [...prev, ...imageStatusList]);

    } catch (err) {
      console.error('❌ Gagal upload:', err);
      showAlert('Gagal menyimpan gambar.', 'error');
    } finally {
      setUploadQueue((prev) => prev.slice(assets.length));
      setIsUploading(false);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showAlert('Akses galeri dibutuhkan untuk memilih gambar.', 'warning');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
    });

    if (!result.canceled && result.assets.length > 0) {
      const placeholders: ImageStatus[] = result.assets.map(() => ({
        uri: '',
        status: 'loading',
      }));
      setUploadQueue((prev) => [...prev, ...placeholders]);
      setTimeout(() => {
        startImageUpload(result.assets);
      }, 10);
    }
  };

  return {
    imageUris: [...imageUris, ...uploadQueue],
    setImageUris,
    isUploading,
    pickImage,
  };
}
