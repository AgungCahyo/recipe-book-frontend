// utils/userStorage.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const USER_NAME_KEY = 'user_name';

export async function saveUserName(name: string) {
  await AsyncStorage.setItem(USER_NAME_KEY, name);
}

export async function getUserName(): Promise<string | null> {
  return await AsyncStorage.getItem(USER_NAME_KEY);
}
