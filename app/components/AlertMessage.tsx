import { useEffect, useRef } from 'react'
import { Animated, View, StyleSheet } from 'react-native'
import { useAlert } from 'context/AlertContext'
import AlertBox from './AlertBox'
import { playAlertSound } from '../../utils/soundEffect' // import sound player

export default function AlertMessage() {
  const { alert, hideAlert } = useAlert()
  const translateY = useRef(new Animated.Value(-100)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (alert?.visible) {
      // 👇 Play sound saat alert muncul
      playAlertSound(alert.type)

      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start()
    }
  }, [alert?.visible])

  if (!alert?.message || !alert.visible) return null

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <AlertBox
        message={alert.message}
        type={alert.type}
        onClose={hideAlert}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    zIndex: 50,
  },
})
