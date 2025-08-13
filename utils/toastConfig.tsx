import { View, Text } from 'react-native';

export const toastConfig = {
  success: ({ text1, text2 }: any) => (
    <View className="bg-green-600 p-3 rounded-lg shadow-md">
      <Text className="text-white font-bold text-base">{text1}</Text>
      {text2 && <Text className="text-white text-sm mt-1">{text2}</Text>}
    </View>
  ),
  error: ({ text1, text2 }: any) => (
    <View className="bg-red-600 p-3 rounded-lg shadow-md">
      <Text className="text-white font-bold text-base">{text1}</Text>
      {text2 && <Text className="text-white text-sm mt-1">{text2}</Text>}
    </View>
  ),
  info: ({ text1, text2 }: any) => (
    <View className="bg-blue-600 p-3 rounded-lg shadow-md">
      <Text className="text-white font-bold text-base">{text1}</Text>
      {text2 && <Text className="text-white text-sm mt-1">{text2}</Text>}
    </View>
  ),
  warning: ({ text1, text2 }: any) => (
    <View className="bg-orange-500 p-3 rounded-lg shadow-md">
      <Text className="text-white font-bold text-base">{text1}</Text>
      {text2 && <Text className="text-white text-sm mt-1">{text2}</Text>}
    </View>
  ),
};
