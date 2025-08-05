// utils/sounds.ts
import { Audio } from 'expo-av';

export async function playAlertSound(
  type: 'success' | 'error' | 'warning' | 'info' | 'neutral'
) {
  try {
    let soundFile;

    switch (type) {
      case 'success':
        soundFile = require('../assets/sound/success.wav');
        break;
      case 'error':
        soundFile = require('../assets/sound/error.wav');
        break;
      case 'warning':
        soundFile = require('../assets/sound/warning.wav');
        break;
      case 'info':
        soundFile = require('../assets/sound/info.wav');
        break;
      case 'neutral':
        soundFile = require('../assets/sound/neutral.wav');
        break;
    }

    if (!soundFile) return;

    const { sound } = await Audio.Sound.createAsync(soundFile);
    await sound.playAsync();
  } catch (err) {
    console.error('❌ Gagal memainkan sound alert:', err);
  }
}
