import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Platform, Image
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Easing } from 'react-native-reanimated';
import { useAuth } from '../../context/AuthContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type DrawerItem = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
};

export default function ModalDrawer({
  isVisible,
  onClose,
  items,
  isDark = false,
}: {
  isVisible: boolean;
  onClose: () => void;
  items: DrawerItem[];
  isDark?: boolean;
}) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;
  const [internalVisible, setInternalVisible] = useState(isVisible);
  const DRAWER_WIDTH = SCREEN_WIDTH * 0.6;
  const { user } = useAuth()

  // Colors based on theme
  const colors = {
    background: isDark ? '#121212' : '#FFFFFF',
    text: isDark ? '#E0E0E0' : '#333333',
    icon: isDark ? '#BB86FC' : '#6200EE',
    divider: isDark ? '#333333' : '#EEEEEE',
    backdrop: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.5)',
  };

  useEffect(() => {
    if (isVisible) {
      setInternalVisible(true);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH - DRAWER_WIDTH,
          duration: 350,
          useNativeDriver: true,
          easing: Easing.out(Easing.ease)

        }),
        Animated.timing(backdropAnim, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SCREEN_WIDTH,
          duration: 300,
          useNativeDriver: true,
          easing: Easing.in(Easing.ease),
        }),
        Animated.timing(backdropAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setInternalVisible(false);
        onClose?.();
      });
    }
  }, [isVisible]);

  return (
    <Modal transparent visible={internalVisible} animationType="none">
      {/* Backdrop with pressable area */}
      <Animated.View
        style={[
          styles.backdrop,
          {
            opacity: backdropAnim,
            backgroundColor: colors.backdrop,
          }
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>

      {/* Drawer Container */}
      <Animated.View
        style={[
          styles.drawerContainer,
          {
            transform: [{ translateX: slideAnim }],
            backgroundColor: colors.background,
            shadowColor: isDark ? '#000' : '#888',
          },
        ]}
      >
        <View className="flex-row items-center mb-4">
          {user?.photoURL ? (
            <Image
              source={{ uri: user.photoURL }}
              className="w-16 h-16 rounded-full"
            />
          ) : (
            <View className="w-16 h-16 rounded-full bg-gray-300 dark:bg-gray-600 items-center justify-center">
              <Ionicons name="person" size={32} color="#666" />
            </View>
          )}
          <View className="ml-4 flex-1">
            <Text className="text-lg font-semibold text-gray-900 dark:text-white">
              {user?.displayName || 'User'}
            </Text>
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {user?.email}
            </Text>
          </View>
        </View>

        {/* Header Section */}
        <View style={styles.header}>
          
        </View>

        {/* Content Section */}
        <View style={styles.content}>
          {items.map((item, idx) => (
            <React.Fragment key={item.label}>
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  item.onPress();
                }}
                style={styles.menuItem}
              >
                <Ionicons
                  name={item.icon}
                  size={24}
                  color={colors.icon}
                  style={styles.menuIcon}
                />
                <Text style={[styles.menuText, { color: colors.text }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>

              {idx < items.length - 1 && (
                <View style={[styles.divider, { backgroundColor: colors.divider }]} />
              )}
            </React.Fragment>
          ))}
        </View>
        <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            
            hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          >
            <Ionicons
              name="close"
              size={28}
              color={colors.icon}
            />
          </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropTouchable: {
    flex: 1,
  },
  drawerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH * 0.6,
    paddingTop: Platform.select({ ios: 60, android: 40 }),
    paddingHorizontal: 20,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 25,
    overflow: 'hidden',
    backgroundColor: '#fff', // bisa ganti gradient
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  closeButton: {
    marginBottom:20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#eee', // tombol close lebih standout
  },
  content: {
    flex: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap:20,
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: '#f7f7f7', // menu item ada background
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  menuIcon: {
    width: 24,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    marginVertical: 6,
    opacity: 0.2,
    backgroundColor: '#ccc',
  },
  profileSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
});
