import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Pressable,
  Modal,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../constants/fonts';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { ApiService, UserProfile } from '../lib/api';

interface ProfileDrawerProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function ProfileDrawer({ isVisible, onClose }: ProfileDrawerProps) {
  const { session, signOut } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    if (isVisible) {
      loadProfile();
    }
  }, [isVisible]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const userToken = session?.accessToken;
      const profile = await ApiService.getUserProfile(userToken);
      setProfileData(profile);
      setEditData(profile);
      console.log('Profile loaded:', profile);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'No se pudo cargar el perfil del usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (editData) {
      setProfileData(editData as UserProfile);
      setIsEditing(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      Alert.alert('Perfil actualizado', 'Tus datos han sido guardados exitosamente');
      // TODO: Implement actual save to API
    }
  };

  const handleCancel = () => {
    setEditData(profileData || {});
    setIsEditing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClose = () => {
    if (isEditing) {
      handleCancel();
    }
    onClose();
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            onClose();
            signOut();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  const ProfileField = ({ label, value, onChangeText, placeholder, keyboardType = 'default' }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, Typography.caption, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <TextInput
        style={[styles.fieldInput, Typography.body, {
          color: theme.colors.text,
          borderBottomColor: isEditing ? theme.colors.primary : 'transparent'
        }]}
        value={value || ''}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        keyboardType={keyboardType}
        editable={isEditing}
        selectTextOnFocus={isEditing}
      />
    </View>
  );

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <StatusBar style="light" />
      <View style={styles.modalContainer}>
        {/* Background Blur */}
        <BlurView intensity={20} tint="dark" style={styles.backdrop}>
          <Pressable
            style={styles.backdropPress}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              handleClose();
            }}
          />
        </BlurView>

        {/* Drawer */}
        <View style={[styles.drawer, { paddingBottom: insets.bottom + 20 }]}>
          <BlurView intensity={80} tint="dark" style={styles.drawerBlur}>
            <View style={styles.drawerOverlay}>

              {/* Handle */}
              <View style={styles.handle} />

              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={styles.avatar}
                  >
                    <Text style={[styles.avatarText, Typography.h2]}>
                      {profileData?.name?.charAt(0)}{profileData?.lastName?.charAt(0)}
                    </Text>
                  </LinearGradient>
                  <View style={styles.headerText}>
                    <Text style={[styles.userName, Typography.h3, { color: theme.colors.text }]}>
                      {profileData?.name} {profileData?.lastName}
                    </Text>
                    <Text style={[styles.userEmail, Typography.caption, { color: theme.colors.textSecondary }]}>
                      {profileData?.email}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={styles.editButton}
                  onPress={() => {
                    setIsEditing(!isEditing);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Ionicons
                    name={isEditing ? "checkmark" : "pencil"}
                    size={20}
                    color={theme.colors.primary}
                  />
                </Pressable>
              </View>

              {/* Content */}
              <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  </View>
                ) : profileData ? (
                  <>
                    <ProfileField
                      label="Nombre"
                      value={isEditing ? editData.name : profileData.name}
                      onChangeText={(text: string) => setEditData({...editData, name: text})}
                      placeholder="Tu nombre"
                    />

                    <ProfileField
                      label="Apellido"
                      value={isEditing ? editData.lastName : profileData.lastName}
                      onChangeText={(text: string) => setEditData({...editData, lastName: text})}
                      placeholder="Tu apellido"
                    />

                    <ProfileField
                      label="Correo electrónico"
                      value={isEditing ? editData.email : profileData.email}
                      onChangeText={(text: string) => setEditData({...editData, email: text})}
                      placeholder="tu@email.com"
                      keyboardType="email-address"
                    />

                    <ProfileField
                      label="Teléfono"
                      value={isEditing ? editData.phone : profileData.phone}
                      onChangeText={(text: string) => setEditData({...editData, phone: text})}
                      placeholder="+57 300 123 4567"
                      keyboardType="phone-pad"
                    />

                    <ProfileField
                      label="Fecha de nacimiento"
                      value={isEditing ? editData.birthdate : profileData.birthdate}
                      onChangeText={(text: string) => setEditData({...editData, birthdate: text})}
                      placeholder="YYYY-MM-DD"
                    />

                    {/* Logout Button */}
                    <View style={styles.logoutSection}>
                      <Pressable
                        style={styles.logoutButton}
                        onPress={handleLogout}
                      >
                        <BlurView intensity={40} tint="dark" style={styles.logoutButtonBlur}>
                          <View style={styles.logoutButtonOverlay}>
                            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                            <Text style={[styles.logoutText, Typography.body]}>Cerrar sesión</Text>
                          </View>
                        </BlurView>
                      </Pressable>
                    </View>
                  </>
                ) : null}
              </ScrollView>

              {/* Floating Action Buttons */}
              {isEditing && (
                <View style={[styles.floatingButtons, { bottom: insets.bottom + 20 }]}>
                  <Pressable
                    style={styles.floatingButton}
                    onPress={handleCancel}
                  >
                    <BlurView intensity={60} tint="dark" style={styles.floatingButtonBlur}>
                      <View style={[styles.floatingButtonOverlay, styles.cancelButtonOverlay]}>
                        <Ionicons name="close" size={24} color="#FF3B30" />
                      </View>
                    </BlurView>
                  </Pressable>

                  <Pressable
                    style={styles.floatingButton}
                    onPress={handleSave}
                  >
                    <BlurView intensity={60} tint="dark" style={styles.floatingButtonBlur}>
                      <View style={[styles.floatingButtonOverlay, styles.saveButtonOverlay]}>
                        <Ionicons name="checkmark" size={24} color="#34C759" />
                      </View>
                    </BlurView>
                  </Pressable>
                </View>
              )}
            </View>
          </BlurView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropPress: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: '5%',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  drawerBlur: {
    flex: 1,
  },
  drawerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 32,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  headerText: {
    flex: 1,
  },
  userName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    opacity: 0.7,
  },
  editButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  fieldContainer: {
    marginBottom: 32,
  },
  fieldLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },
  fieldInput: {
    fontSize: 17,
    paddingVertical: 12,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  logoutSection: {
    marginTop: 40,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutButtonBlur: {
    borderRadius: 16,
  },
  logoutButtonOverlay: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#FF3B30',
    marginLeft: 8,
    fontWeight: '500',
  },
  floatingButtons: {
    position: 'absolute',
    left: 32,
    right: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  floatingButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  floatingButtonBlur: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  floatingButtonOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  cancelButtonOverlay: {
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
  },
  saveButtonOverlay: {
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
  },
});