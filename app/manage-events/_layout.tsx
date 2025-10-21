import { Stack, router } from 'expo-router';
import { Platform, TouchableOpacity, Alert, View, Modal, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useState } from 'react';

const ContextMenu = ({ visible, onClose, onExport }: { visible: boolean; onClose: () => void; onExport: () => void }) => (
  <Modal visible={visible} transparent animationType="none">
    <Pressable style={styles.modalOverlay} onPress={onClose}>
      <View style={styles.contextMenu}>
        <GlassView
          glassEffectStyle="regular"
          tintColor="rgba(0,0,0,0.3)"
          style={StyleSheet.absoluteFillObject}
          experimentalBlurMethod="dimezisBlurView"
        />
        <Pressable
          style={styles.menuItem}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onExport();
            onClose();
          }}
        >
          <Ionicons name="document-outline" size={16} color="#ffffff" />
          <Text style={styles.menuItemText}>Exportar Excel</Text>
        </Pressable>
      </View>
    </Pressable>
  </Modal>
);

export default function ManageEventsLayout() {
  const [showMenu, setShowMenu] = useState(false);

  const handleMenuPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setShowMenu(true);
  };

  const handleExport = () => {
    Alert.alert('Exportar Excel', 'Funcionalidad de exportar Excel próximamente');
  };

  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: 'transparent',
            height: 120, // Make header taller
          },
          headerTintColor: '#ffffff',
          headerShadowVisible: false,
          headerTransparent: true,
          headerBlurEffect: 'dark',
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: 'Mis Eventos',
            headerLargeTitle: false,
            headerBackVisible: true,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                style={{ marginLeft: Platform.OS === 'ios' ? 0 : 8 }}
              >
                <View style={{ paddingLeft: 4 }}>
                  <Ionicons
                    name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                    size={Platform.OS === 'ios' ? 22 : 20}
                    color="#ffffff"
                  />
                </View>
              </TouchableOpacity>
            ),
            headerSearchBarOptions: Platform.OS === 'ios' ? {
              placeholder: 'Buscar eventos',
              hideWhenScrolling: false,
              autoCapitalize: 'none',
            } : undefined,
          }}
        />
        <Stack.Screen
          name="[id]"
          options={{
            title: 'Dashboard del Evento',
            headerLargeTitle: false,
            headerBackVisible: false,
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.back();
                }}
                style={{ marginLeft: Platform.OS === 'ios' ? 0 : 8 }}
              >
                <View style={{ paddingLeft: 4 }}>
                  <Ionicons
                    name={Platform.OS === 'ios' ? 'chevron-back' : 'arrow-back'}
                    size={Platform.OS === 'ios' ? 22 : 20}
                    color="#ffffff"
                  />
                </View>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={handleMenuPress}
                style={{ marginRight: Platform.OS === 'ios' ? 0 : 8 }}
              >
                <View style={{ paddingRight: 4, paddingLeft: 6 }}>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={22}
                    color="#ffffff"
                  />
                </View>
              </TouchableOpacity>
            ),
          }}
        />
      </Stack>
      <ContextMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        onExport={handleExport}
      />
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'flex-start',
    paddingTop: Platform.OS === 'ios' ? 120 : 80,
    paddingRight: 20,
  },
  contextMenu: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 120 : 80,
    right: 20,
    backgroundColor: 'rgba(28, 28, 30, 0.8)',
    borderRadius: 16,
    minWidth: 150,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 22,
    elevation: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: 'transparent',
  },
  menuItemText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
    fontFamily: 'System',
    letterSpacing: -0.3,
  },
});