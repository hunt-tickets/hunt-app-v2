import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
  Linking,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Typography, FontFamily } from '../constants/fonts';

const { height } = Dimensions.get('window');

interface SupportModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SupportModal({ visible, onClose }: SupportModalProps) {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(1, { duration: 150 });
      translateY.value = withTiming(0, { duration: 150 });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 150 });
      translateY.value = withTiming(height, { duration: 150 });
    }
  }, [visible]);

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(onClose)();
  };

  const handleWhatsApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const phoneNumber = '+573001234567'; // Replace with actual WhatsApp number
    const message = '¡Hola! Necesito ayuda con la app HUNT.';
    const url = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        // Fallback to web WhatsApp
        const webUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        Linking.openURL(webUrl);
      }
    });
    
    onClose();
  };

  const handleEmail = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const email = 'soporte@hunt.app'; // Replace with actual email
    const subject = 'Soporte - App HUNT';
    const body = 'Hola,\n\nNecesito ayuda con la siguiente consulta:\n\n';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(url);
    onClose();
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const modalHeight = height * 0.35; // 35% of screen height

  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
          <TouchableOpacity 
            style={StyleSheet.absoluteFillObject} 
            onPress={handleClose}
            activeOpacity={1}
          />
        </Animated.View>
        
        <Animated.View style={[styles.modal, modalStyle, { height: modalHeight, paddingBottom: insets.bottom + 20 }]}>
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>¿Necesitas ayuda?</Text>
            <Text style={styles.subtitle}>Elige cómo prefieres contactarnos</Text>
          </View>
          
          {/* Contact Options */}
          <View style={styles.optionsRow}>
            {/* WhatsApp Option */}
            <TouchableOpacity style={styles.optionColumn} onPress={handleWhatsApp}>
              <View style={[styles.iconContainer, styles.whatsappIcon]}>
                <Ionicons name="logo-whatsapp" size={24} color="#ffffff" />
              </View>
              <Text style={styles.optionTitle}>WhatsApp</Text>
              <Text style={styles.optionDescription}>Respuesta inmediata</Text>
            </TouchableOpacity>
            
            {/* Email Option */}
            <TouchableOpacity style={styles.optionColumn} onPress={handleEmail}>
              <View style={[styles.iconContainer, styles.emailIcon]}>
                <Ionicons name="mail" size={24} color="#ffffff" />
              </View>
              <Text style={styles.optionTitle}>Correo electrónico</Text>
              <Text style={styles.optionDescription}>Hasta 2 días hábiles</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...Typography.title2,
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: '#888888',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  whatsappIcon: {
    backgroundColor: '#25D366',
  },
  emailIcon: {
    backgroundColor: '#007AFF',
  },
  optionTitle: {
    ...Typography.bodyMedium,
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    ...Typography.caption,
    color: '#888888',
    textAlign: 'center',
  },
});