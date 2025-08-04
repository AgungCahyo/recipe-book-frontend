// components/AlertBox.tsx
import { View, Text, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'

interface AlertBoxProps {
  message: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'neutral'
  onClose?: () => void
}

export default function AlertMessage({ message, type = 'info', onClose }: AlertBoxProps) {
  let bgClass = ''
  let textClass = ''
  let iconName: any = 'information-circle-outline'
  let iconColor = ''

  switch (type) {
    case 'success':
      bgClass = 'bg-green-50 dark:bg-gray-800'
      textClass = 'text-green-800 dark:text-green-400'
      iconName = 'checkmark-circle-outline'
      iconColor = '#10b981'
      break
    case 'warning':
      bgClass = 'bg-yellow-50 dark:bg-gray-800'
      textClass = 'text-yellow-800 dark:text-yellow-300'
      iconName = 'alert-circle-outline'
      iconColor = '#eab308'
      break
    case 'error':
      bgClass = 'bg-red-50 dark:bg-gray-800'
      textClass = 'text-red-800 dark:text-red-400'
      iconName = 'close-circle-outline'
      iconColor = '#ef4444'
      break
    case 'neutral':
      bgClass = 'bg-gray-50 dark:bg-gray-800'
      textClass = 'text-gray-800 dark:text-gray-300'
      iconName = 'information-circle-outline'
      iconColor = '#6b7280'
      break
    default:
      bgClass = 'bg-blue-50 dark:bg-gray-800'
      textClass = 'text-blue-800 dark:text-blue-400'
      iconName = 'information-circle-outline'
      iconColor = '#3b82f6'
  }

  return (
    <View className={`flex-row items-center p-4 mb-4 rounded-lg ${bgClass}`}>
      <Ionicons name={iconName} size={20} color={iconColor} />
      <Text className={`ml-3 text-sm font-medium flex-1 ${textClass}`}>
        {message}
      </Text>
      {onClose && (
        <TouchableOpacity
          className="ml-auto p-1.5 rounded-lg"
          onPress={onClose}
        >
          <Ionicons name="close" size={16} color={iconColor} />
        </TouchableOpacity>
      )}
    </View>
  )
}
