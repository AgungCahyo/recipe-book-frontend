// hooks/useRecipeUploader.ts
import { useState, useCallback, useEffect, useRef } from 'react';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import showToast from '../utils/showToast';

export type ImageStatus = {
  uri: string;
  status: 'done' | 'loading' | 'error';
};

export function useRecipeUploader(
  initialImages: ImageStatus[] = []
) {
  const [imageUris, setImageUris] = useState<ImageStatus[]>(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  
  // FIXED: Track apakah initial images sudah di-load untuk menghindari override
  const initialImagesRef = useRef<ImageStatus[]>([]);
  const isInitialLoadRef = useRef(true);
  const userModifiedRef = useRef(false); // ADDED: Track jika user sudah modifikasi

  // FIXED: Update state hanya jika initial images benar-benar berubah DAN user belum modifikasi
  useEffect(() => {
    const initialImagesStr = JSON.stringify(initialImages);
    const currentInitialStr = JSON.stringify(initialImagesRef.current);
    
    // FIXED: Jangan override jika user sudah modifikasi images
    const shouldUpdate = (isInitialLoadRef.current || initialImagesStr !== currentInitialStr) && !userModifiedRef.current;
    
    if (shouldUpdate) {
      console.log('🔄 Updating images from initial:', { 
        from: imageUris.length, 
        to: initialImages.length,
        userModified: userModifiedRef.current 
      });
      setImageUris(initialImages);
      initialImagesRef.current = initialImages;
      isInitialLoadRef.current = false;
    }
  }, [initialImages]);

  const saveImagePermanently = useCallback(async (uri: string): Promise<string> => {
    try {
      const fileName = uri.split('/').pop();
      const newPath = `${FileSystem.documentDirectory}images/${fileName}`;

      await FileSystem.makeDirectoryAsync(`${FileSystem.documentDirectory}images`, { intermediates: true });
      await FileSystem.copyAsync({ from: uri, to: newPath });

      return newPath;
    } catch (err) {
      showToast('Gagal menyimpan gambar.', 'error');
      throw err;
    }
  }, []);

  const pickImage = useCallback(async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        
        // ADDED: Mark as user modified
        userModifiedRef.current = true;
        console.log('📸 User picked image, marking as modified');

        setIsUploading(true);
        
        // FIXED: Set loading state terlebih dahulu
        setImageUris(prev => [...prev, { uri: pickedUri, status: 'loading' }]);

        try {
          const permanentUri = await saveImagePermanently(pickedUri);

          setImageUris(prev => {
            const updated = [...prev];
            // Update yang terakhir (yang loading)
            updated[updated.length - 1] = { uri: permanentUri, status: 'done' };
            return updated;
          });
        } catch (err) {
          console.error('Error saving image:', err);
          
          // FIXED: Update status ke error jika gagal
          setImageUris(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { uri: pickedUri, status: 'error' };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error picking image:', err);
      showToast('Gagal memilih gambar.', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [saveImagePermanently]);

  const replaceImage = useCallback(async (index: number) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const pickedUri = result.assets[0].uri;
        
        // ADDED: Mark as user modified
        userModifiedRef.current = true;
        console.log('🔄 User replaced image, marking as modified');

        setIsUploading(true);
        
        // FIXED: Set loading state untuk image yang sedang di-replace
        setImageUris(prev => {
          const updated = [...prev];
          updated[index] = { uri: pickedUri, status: 'loading' };
          return updated;
        });

        try {
          const permanentUri = await saveImagePermanently(pickedUri);

          setImageUris(prev => {
            const updated = [...prev];
            updated[index] = { uri: permanentUri, status: 'done' };
            return updated;
          });
        } catch (err) {
          console.error('Error replacing image:', err);
          
          // FIXED: Revert ke status error jika gagal
          setImageUris(prev => {
            const updated = [...prev];
            updated[index] = { uri: pickedUri, status: 'error' };
            return updated;
          });
        }
      }
    } catch (err) {
      console.error('Error replacing image:', err);
      showToast('Gagal mengganti gambar.', 'error');
    } finally {
      setIsUploading(false);
    }
  }, [saveImagePermanently]);

  const removeImage = useCallback((index: number) => {
    // ADDED: Mark as user modified
    userModifiedRef.current = true;
    console.log('🗑️ User removed image, marking as modified');
    
    setImageUris(prev => prev.filter((_, i) => i !== index));
  }, []);

  // FIXED: Function untuk manual reset (jika diperlukan)
  const resetImages = useCallback(() => {
    console.log('🔄 Manual reset images');
    setImageUris([]);
    isInitialLoadRef.current = true;
    userModifiedRef.current = false; // ADDED: Reset user modified flag
  }, []);

  // FIXED: Function untuk manual set images
  const setImages = useCallback((images: ImageStatus[]) => {
    console.log('📝 Manual set images:', { count: images.length });
    setImageUris(images);
    initialImagesRef.current = images;
    // ADDED: Don't reset userModified flag here, karena ini mungkin dipanggil dari luar
  }, []);

  return {
    imageUris,
    setImageUris: setImages, // FIXED: Use custom setter
    pickImage,
    replaceImage, // FIXED: Return replaceImage function
    removeImage,
    resetImages, // FIXED: Add reset function
    isUploading,
  };
}