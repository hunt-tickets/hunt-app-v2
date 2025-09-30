import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');
const MENU_WIDTH = width * 0.75; // 75% of screen width

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(-MENU_WIDTH);
  const blurRadius = useSharedValue(0);
  const menuOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, {
        duration: 300,
      });
      blurRadius.value = withTiming(15, { duration: 300 });
      menuOpacity.value = withTiming(1, { duration: 250 });
    } else {
      translateX.value = withTiming(-MENU_WIDTH, {
        duration: 250,
      });
      blurRadius.value = withTiming(0, { duration: 200 });
      menuOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [visible]);

  const menuStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: menuOpacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurRadius.value / 15,
  }));

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
  };

  const menuItems = [
    { id: 'profile', title: 'Mi perfil', icon: 'person-outline', subtitle: 'Editar información personal' },
    { id: 'favorites', title: 'Mis favoritos', icon: 'heart-outline', subtitle: 'Eventos guardados' },
    { id: 'tickets', title: 'Mis entradas', icon: 'ticket-outline', subtitle: 'Entradas compradas' },
    { id: 'manage-events', title: 'Administrar eventos', icon: 'calendar-outline', subtitle: 'Gestionar mis eventos' },
    { id: 'notifications', title: 'Notificaciones', icon: 'notifications-outline', subtitle: 'Configurar alertas' },
    { id: 'settings', title: 'Configuración', icon: 'settings-outline', subtitle: 'Preferencias de la app' },
    { id: 'help', title: 'Ayuda y soporte', icon: 'help-circle-outline', subtitle: 'Centro de ayuda' },
    { id: 'about', title: 'Acerca de', icon: 'information-circle-outline', subtitle: 'Versión e información' },
  ];

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
    >
      <View style={styles.container}>
        {/* Backdrop */}
        <Animated.View style={[styles.backdrop, blurStyle]}>
          <Animated.View style={[StyleSheet.absoluteFillObject, blurStyle]}>
            <BlurView
              intensity={15}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>

        {/* Side Menu */}
        <Animated.View style={[styles.menu, menuStyle, { paddingTop: insets.top + 20 }]}>
          <BlurView
            intensity={80}
            tint="dark"
            style={StyleSheet.absoluteFillObject}
          >
            <View style={styles.menuOverlay} />
          </BlurView>

          {/* Content with glass material effect */}
          <View style={styles.menuContentContainer}>
            {/* Header */}
            <View style={styles.menuHeader}>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* User Profile Section */}
            <View style={styles.userSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>LF</Text>
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>Luis Fernando</Text>
                <Text style={styles.userEmail}>luis@example.com</Text>
                <TouchableOpacity style={styles.editProfileButton}>
                  <Text style={styles.editProfileText}>Ver perfil</Text>
                  <Ionicons name="chevron-forward" size={16} color="#1d9bf0" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView style={styles.menuContent} showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (item.id === 'manage-events') {
                    onClose();
                    router.push('/(tabs)/administrar-eventos');
                  } else {
                    console.log(`Pressed: ${item.title}`);
                  }
                }}
              >
                <View style={styles.menuItemIcon}>
                  <Ionicons name={item.icon as any} size={24} color="#1d9bf0" />
                </View>
                <View style={styles.menuItemContent}>
                  <Text style={styles.menuItemText}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#666666" />
              </TouchableOpacity>
            ))}

            {/* Divider */}
            <View style={styles.divider} />

            {/* Logout */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                console.log('Logout pressed');
              }}
            >
              <Ionicons name="log-out-outline" size={22} color="#FF3B30" />
              <Text style={[styles.menuItemText, { color: '#FF3B30' }]}>Cerrar sesión</Text>
            </TouchableOpacity>
          </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  menu: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: MENU_WIDTH,
    shadowColor: '#000',
    shadowOffset: {
      width: 4,
      height: 0,
    },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 12,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 10, 10, 0.7)',
  },
  menuContentContainer: {
    flex: 1,
    zIndex: 1,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  userInfo: {
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#1d9bf0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '700',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editProfileText: {
    fontSize: 14,
    color: '#1d9bf0',
    fontWeight: '600',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
    paddingTop: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  menuItemIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: 'rgba(29, 155, 240, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(29, 155, 240, 0.3)',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 20,
    paddingRight: 12,
  },
  menuItemText: {
    fontSize: 17,
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  menuItemSubtitle: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '400',
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 20,
    marginHorizontal: 20,
  },
});