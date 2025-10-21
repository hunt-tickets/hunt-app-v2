import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useProducerId } from './_layout';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
// import { GlassView } from 'expo-glass-effect'; // Removed glassmorphism
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Typography } from '../../../constants/fonts';
import { ApiService } from '../../../lib/api';

const { width, height } = Dimensions.get('window');

interface Producer {
  id: string;
  name: string;
  logo: string | null;
  description?: string;
  email?: string;
  phone?: string;
  status?: boolean;
  banner?: string;
}

export default function ProfileSettingsScreen() {
  const id = useProducerId();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { session } = useAuth();


  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [producer, setProducer] = useState<Producer | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Modal animation values
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(height);
  const modalOpacity = useSharedValue(0);
  const blurRadius = useSharedValue(0);

  // Edit profile state
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    status: true,
    banner: '',
    logo: ''
  });

  useEffect(() => {
    loadProducerData();
  }, [id]);

  const loadProducerData = async () => {
    try {
      setLoading(true);

      // Check if we have a valid ID
      if (!id || id === 'undefined' || typeof id !== 'string') {
        console.warn('Invalid producer ID:', id);
        const fallbackData = {
          id: 'demo',
          name: 'Productora Demo',
          logo: null,
          description: 'ID inválido - usando datos de demo',
          email: 'demo@productora.com',
          phone: '+57 123 456 7890',
          status: true,
        };
        setProducer(fallbackData);
        setEditForm({
          name: fallbackData.name,
          email: fallbackData.email || '',
          phone: fallbackData.phone || '',
          status: fallbackData.status ?? true,
          banner: '',
          logo: ''
        });
        setLoading(false);
        return;
      }

      if (!session?.accessToken) {
        const demoData = {
          id: id as string,
          name: 'Productora Demo',
          logo: null,
          description: 'Descripción de demo',
          email: 'demo@productora.com',
          phone: '+57 123 456 7890',
          status: true,
        };
        setProducer(demoData);
        setEditForm({
          name: demoData.name,
          description: demoData.description || '',
          email: demoData.email || '',
          phone: demoData.phone || '',
          status: demoData.status ?? true,
          banner: '',
          logo: ''
        });
        setLoading(false);
        return;
      }

      try {
        const producerDetails = await ApiService.getProducerDetails(id as string, session.accessToken);
        const producerData = {
          id: producerDetails.id,
          name: producerDetails.name,
          logo: producerDetails.logo,
          description: producerDetails.description || 'Sin descripción',
          email: producerDetails.email || '',
          phone: producerDetails.phone || '',
          status: producerDetails.status ?? true,
          banner: producerDetails.banner || '',
        };

        setProducer(producerData);
        setEditForm({
          name: producerData.name,
          email: producerData.email || '',
          phone: producerData.phone || '',
          status: producerData.status ?? true,
          banner: producerData.banner || '',
          logo: producerData.logo || ''
        });
      } catch (apiError) {
        console.error('API Error loading producer, using fallback:', apiError);
        const fallbackData = {
          id: id as string,
          name: 'Productora Ejemplo',
          logo: null,
          description: 'Datos de ejemplo - API no disponible',
          email: 'ejemplo@productora.com',
          phone: '+57 300 123 4567',
          status: true,
        };
        setProducer(fallbackData);
        setEditForm({
          name: fallbackData.name,
          email: fallbackData.email || '',
          phone: fallbackData.phone || '',
          status: fallbackData.status ?? true,
          banner: '',
          logo: ''
        });
      }
    } catch (error) {
      console.error('Error loading producer:', error);
      const errorData = {
        id: id as string || 'unknown',
        name: 'Error al cargar',
        logo: null,
        description: 'Error al cargar descripción',
      };
      setProducer(errorData);
      setEditForm({
        name: errorData.name,
        email: '',
        phone: '',
        status: true,
        banner: '',
        logo: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducerData();
    setRefreshing(false);
  };

  // Modal animations
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: modalOpacity.value,
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blurRadius.value,
  }));

  const handleEditProfile = () => {
    setShowEditModal(true);
    backdropOpacity.value = withSpring(1, { damping: 20 });
    translateY.value = withSpring(0, { damping: 20 });
    modalOpacity.value = withSpring(1, { damping: 20 });
    blurRadius.value = withSpring(1, { damping: 20 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const closeEditModal = () => {
    backdropOpacity.value = withSpring(0, { damping: 20 });
    translateY.value = withSpring(height, { damping: 20 });
    modalOpacity.value = withSpring(0, { damping: 20 });
    blurRadius.value = withSpring(0, { damping: 20 });
    setTimeout(() => {
      setShowEditModal(false);
    }, 300);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSaveProfile = () => {
    // Save profile logic here
    closeEditModal();
    // Update local state
    if (producer) {
      setProducer({
        ...producer,
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
      });
    }
  };

  const styles = createStyles(theme, insets);

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style={theme.isDark ? "light" : "dark"} />
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
          <Text style={styles.loadingText}>Cargando perfil...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Background Gradient */}
      <LinearGradient
        colors={theme.colors.gradientOverlay}
        locations={[0, 0.7, 1]}
        style={StyleSheet.absoluteFillObject}
      />


      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            titleColor="#ffffff"
          />
        }
      >
        {/* Producer Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileContent}>
            <View style={styles.profileHeader}>
              <View style={styles.profileIconContainer}>
                {producer?.logo ? (
                  <Image source={{ uri: producer.logo }} style={styles.profileIcon} />
                ) : (
                  <View style={[styles.profileIcon, styles.profileIconFallback]}>
                    <Ionicons name="business" size={48} color="rgba(255, 255, 255, 0.8)" />
                  </View>
                )}
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{producer?.name}</Text>
              </View>
              <TouchableOpacity
                style={styles.editButton}
                onPress={handleEditProfile}
                activeOpacity={0.8}
              >
                <Ionicons name="create-outline" size={22} color="rgba(255, 255, 255, 0.9)" />
              </TouchableOpacity>
            </View>

            {/* Contact Info */}
            {(producer?.email || producer?.phone) && (
              <View style={styles.contactInfo}>
                {producer?.email && (
                  <View style={styles.contactItem}>
                    <Ionicons name="mail-outline" size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.contactText}>{producer.email}</Text>
                  </View>
                )}
                {producer?.phone && (
                  <View style={styles.contactItem}>
                    <Ionicons name="call-outline" size={16} color="rgba(255, 255, 255, 0.6)" />
                    <Text style={styles.contactText}>{producer.phone}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Settings Options */}
        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Configuración</Text>
          <View style={styles.settingsList}>
            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="notifications" size={24} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.settingItemText}>Notificaciones</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="key" size={24} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.settingItemText}>Permisos</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="card" size={24} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.settingItemText}>Facturación</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingItem}>
              <View style={styles.settingItemContent}>
                <Ionicons name="information-circle" size={24} color="rgba(255, 255, 255, 0.8)" />
                <Text style={styles.settingItemText}>Información</Text>
                <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Edit Profile Modal - Redesigned */}
      <Modal transparent visible={showEditModal} statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <Animated.View style={[styles.modalBackdropOverlay, backdropAnimatedStyle]} />
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={closeEditModal}
            activeOpacity={1}
          />
          <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
            <View style={styles.modalHandle} />

            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={() => {}}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Editar Perfil</Text>
                  <Text style={styles.modalSubtitle}>Actualiza la información de tu productora</Text>
                </View>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Name Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Nombre</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="business-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Nombre de la productora"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={editForm.name}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Correo electrónico</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="email@productora.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={editForm.email}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text.toLowerCase() }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="next"
                    />
                  </View>
                </View>

                {/* Phone Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="call-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="+57 123 456 7890"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={editForm.phone}
                      onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                      keyboardType="phone-pad"
                      returnKeyType="done"
                    />
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={closeEditModal}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSaveProfile}
                >
                  <Text style={styles.primaryButtonText}>Guardar Cambios</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

function createStyles(theme: Theme, insets: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      ...Typography.body,
      color: '#ffffff',
      marginTop: 16,
    },


    // ScrollView
    scrollView: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: 20,
      paddingTop: insets.top + 80, // Reduced padding - Safe area + compact header
      paddingBottom: insets.bottom + 100,
    },

    // Profile Card
    profileCard: {
      borderRadius: 20,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      marginBottom: 32,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    profileContent: {
      padding: 24,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    profileIconContainer: {
      marginRight: 16,
    },
    profileIcon: {
      width: 80,
      height: 80,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    profileIconFallback: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 8,
    },
    profileDescription: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.7)',
      lineHeight: 22,
    },
    editButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    contactInfo: {
      gap: 12,
    },
    contactItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    contactText: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
    },

    // Settings Section
    settingsSection: {
      marginBottom: 32,
    },
    sectionTitle: {
      ...Typography.title3,
      color: '#ffffff',
      fontWeight: '600',
      marginBottom: 16,
    },
    settingsList: {
      gap: 12,
    },
    settingItem: {
      borderRadius: 16,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    settingItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    settingItemText: {
      fontSize: 16,
      fontWeight: '500',
      color: '#ffffff',
      flex: 1,
      marginLeft: 16,
    },

    // Modal Styles - Redesigned
    modalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalBackdropOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContainer: {
      backgroundColor: 'rgba(18, 18, 18, 0.95)',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      minHeight: height * 0.6,
      maxHeight: height * 0.85,
      paddingBottom: insets.bottom,
    },
    modalHandle: {
      width: 40,
      height: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.3)',
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 20,
    },
    modalContent: {
      flex: 1,
      paddingHorizontal: 24,
    },
    modalHeader: {
      marginBottom: 32,
    },
    modalTitleContainer: {
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 8,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
    },
    formContainer: {
      gap: 24,
      marginBottom: 32,
    },
    inputGroup: {
      gap: 12,
    },
    inputLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      paddingHorizontal: 16,
      height: 56,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: '#ffffff',
      fontWeight: '500',
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      paddingBottom: 24,
    },
    secondaryButton: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.8)',
    },
    primaryButton: {
      flex: 1,
      height: 52,
      borderRadius: 16,
      backgroundColor: '#ffffff',
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000000',
    },
  });
}