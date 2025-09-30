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
import { BlurView } from 'expo-blur';
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
  const modalOpacity = useSharedValue(0);
  const blurRadius = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      // Animación slide + fade estilo iOS 16 con blur
      backdropOpacity.value = withTiming(1, { duration: 400 });
      blurRadius.value = withTiming(1, { duration: 350 });
      modalOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 30,
        stiffness: 400,
        mass: 1,
      });
    } else {
      // Animación de salida suave con fade
      backdropOpacity.value = withTiming(0, { duration: 300 });
      blurRadius.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withSpring(height * 0.2, {
        damping: 25,
        stiffness: 500,
        mass: 0.8,
      });
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

  const handlePQR = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const email = 'pqr@hunt.app';
    const subject = 'PQR - HUNT App';
    const body = 'Petición/Queja/Reclamo/Sugerencia:\n\n';
    const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    Linking.openURL(url);
    onClose();
  };

  const handlePrivacyPolicy = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Aquí puedes abrir una URL específica de políticas de privacidad
    const url = 'https://hunt.app/privacy-policy'; // Reemplazar con URL real
    Linking.openURL(url);
    onClose();
  };

  const handleTermsOfService = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Aquí puedes abrir una URL específica de términos y condiciones
    const url = 'https://hunt.app/terms-of-service'; // Reemplazar con URL real
    Linking.openURL(url);
    onClose();
  };

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const blurStyle = useAnimatedStyle(() => ({
    opacity: blurRadius.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: modalOpacity.value,
  }));

  const modalHeight = height * 0.60; // 55% of screen height - tamaño más razonable

  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <View style={styles.container}>
        <Animated.View style={[styles.backdrop, backdropStyle]}>
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
        
        <Animated.View style={[styles.modal, modalStyle, { height: modalHeight, paddingBottom: insets.bottom + 20 }]}>
          {/* Handle */}
          <View style={styles.handle} />
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>¿Necesitas ayuda?</Text>
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

          {/* Additional Options */}
          <View style={styles.additionalOptions}>
            {/* PQR Option */}
            <TouchableOpacity style={styles.additionalButton} onPress={handlePQR}>
              <View style={[styles.additionalIconContainer, styles.pqrIcon]}>
                <Ionicons name="clipboard-outline" size={18} color="#ffffff" />
              </View>
              <View style={styles.additionalTextContainer}>
                <Text style={styles.additionalTitle}>PQRs</Text>
                <Text style={styles.additionalDescription}>Peticiones, quejas y reclamos</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>

            {/* Privacy Policy */}
            <TouchableOpacity style={styles.additionalButton} onPress={handlePrivacyPolicy}>
              <View style={[styles.additionalIconContainer, styles.privacyIcon]}>
                <Ionicons name="shield-outline" size={18} color="#ffffff" />
              </View>
              <View style={styles.additionalTextContainer}>
                <Text style={styles.additionalTitle}>Políticas de privacidad</Text>
                <Text style={styles.additionalDescription}>Información sobre privacidad</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
            </TouchableOpacity>

            {/* Terms of Service */}
            <TouchableOpacity style={styles.additionalButton} onPress={handleTermsOfService}>
              <View style={[styles.additionalIconContainer, styles.termsIcon]}>
                <Ionicons name="document-text-outline" size={18} color="#ffffff" />
              </View>
              <View style={styles.additionalTextContainer}>
                <Text style={styles.additionalTitle}>Términos y condiciones</Text>
                <Text style={styles.additionalDescription}>Condiciones de uso</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#999999" />
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modal: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    ...Typography.title2,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  subtitle: {
    ...Typography.body,
    color: '#666666',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionColumn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e5e5',
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
    color: '#1a1a1a',
    marginBottom: 4,
    textAlign: 'center',
  },
  optionDescription: {
    ...Typography.caption,
    color: '#666666',
    textAlign: 'center',
  },
  additionalOptions: {
    marginTop: 24,
    gap: 8,
    marginBottom: 36,
  },
  additionalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  additionalIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pqrIcon: {
    backgroundColor: '#FF9500',
  },
  privacyIcon: {
    backgroundColor: '#34C759',
  },
  termsIcon: {
    backgroundColor: '#5856D6',
  },
  additionalTextContainer: {
    flex: 1,
  },
  additionalTitle: {
    ...Typography.bodyMedium,
    color: '#1a1a1a',
    marginBottom: 2,
  },
  additionalDescription: {
    ...Typography.caption,
    color: '#666666',
  },
});