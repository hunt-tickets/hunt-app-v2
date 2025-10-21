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
  Keyboard,
  Alert,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useProducerId } from './_layout';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Typography } from '../../../constants/fonts';
import { ApiService } from '../../../lib/api';

const { width, height } = Dimensions.get('window');

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'admin' | 'seller' | 'scanner';
  status: 'active' | 'inactive' | 'pending';
}

export default function TeamManagementScreen() {
  const id = useProducerId();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { session } = useAuth();

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [viewModes, setViewModes] = useState({
    admin: true,
    seller: true,
    scanner: true,
  });

  // Modal animation values
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(height);
  const modalOpacity = useSharedValue(0);

  // New member form state
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'seller' as TeamMember['role'],
  });

  useEffect(() => {
    loadTeamMembers();
  }, [id]);

  const loadTeamMembers = async () => {
    try {
      setLoading(true);

      // Check if we have a valid ID
      if (!id || id === 'undefined' || typeof id !== 'string') {
        console.warn('Invalid producer ID:', id);
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      if (!session?.accessToken) {
        // Use mock data for demo
        setTeamMembers([
          {
            id: '1',
            user_id: 'user1',
            name: 'María García',
            email: 'maria@productora.com',
            avatar: null,
            role: 'admin',
            status: 'active',
          },
          {
            id: '2',
            user_id: 'user2',
            name: 'Carlos Rodríguez',
            email: 'carlos@productora.com',
            avatar: null,
            role: 'seller',
            status: 'active',
          },
          {
            id: '3',
            user_id: 'user3',
            name: 'Ana Martínez',
            email: 'ana@productora.com',
            avatar: null,
            role: 'seller',
            status: 'active',
          },
          {
            id: '4',
            user_id: 'user4',
            name: 'Luis Fernández',
            email: 'luis@productora.com',
            avatar: null,
            role: 'scanner',
            status: 'active',
          },
        ]);
        setLoading(false);
        return;
      }

      try {
        const producerUsersResponse = await ApiService.getProducerUsers(id as string, session.accessToken);
        const teamMembers: TeamMember[] = [];

        // Add admins
        producerUsersResponse.admins.forEach(admin => {
          teamMembers.push({
            id: admin.admin_id,
            user_id: admin.user_id,
            name: admin.formatted_name,
            email: admin.email,
            avatar: null,
            role: 'admin',
            status: 'active',
          });
        });

        // Add sellers
        producerUsersResponse.sellers.forEach(seller => {
          teamMembers.push({
            id: seller.seller_id,
            user_id: seller.user_id,
            name: seller.formatted_name,
            email: seller.email,
            avatar: null,
            role: 'seller',
            status: 'active',
          });
        });

        // Add scanners
        producerUsersResponse.scanners.forEach(scanner => {
          teamMembers.push({
            id: scanner.scanner_id,
            user_id: scanner.user_id,
            name: scanner.formatted_name,
            email: scanner.email,
            avatar: null,
            role: 'scanner',
            status: 'active',
          });
        });

        setTeamMembers(teamMembers);
      } catch (apiError) {
        console.error('API Error loading team members, using fallback data:', apiError);
        // Use fallback data when API fails
        setTeamMembers([
          {
            id: 'fallback-1',
            user_id: 'fallback-user1',
            name: 'Admin Principal',
            email: 'admin@productora.com',
            avatar: null,
            role: 'admin',
            status: 'active',
          },
          {
            id: 'fallback-2',
            user_id: 'fallback-user2',
            name: 'Vendedor Principal',
            email: 'ventas@productora.com',
            avatar: null,
            role: 'seller',
            status: 'active',
          },
          {
            id: 'fallback-3',
            user_id: 'fallback-user3',
            name: 'Scanner Principal',
            email: 'scanner@productora.com',
            avatar: null,
            role: 'scanner',
            status: 'active',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading team members:', error);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeamMembers();
    setRefreshing(false);
  };

  // Filter members by role and sort alphabetically
  const adminMembers = teamMembers.filter(m => m.role === 'admin').sort((a, b) => a.name.localeCompare(b.name));
  const sellerMembers = teamMembers.filter(m => m.role === 'seller').sort((a, b) => a.name.localeCompare(b.name));
  const scannerMembers = teamMembers.filter(m => m.role === 'scanner').sort((a, b) => a.name.localeCompare(b.name));

  const getRoleIcon = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return 'shield-checkmark';
      case 'seller': return 'storefront';
      case 'scanner': return 'scan';
      default: return 'person';
    }
  };

  const toggleViewMode = (section: keyof typeof viewModes) => {
    setViewModes(prev => ({ ...prev, [section]: !prev[section] }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderSectionHeader = (title: string, section: keyof typeof viewModes, count: number) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title} ({count})</Text>
      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => toggleViewMode(section)}
      >
        <Ionicons
          name={viewModes[section] ? 'list' : 'grid'}
          size={16}
          color="rgba(255, 255, 255, 0.8)"
        />
      </TouchableOpacity>
    </View>
  );

  const renderMemberCard = (member: TeamMember, index: number, section: keyof typeof viewModes) => (
    <TouchableOpacity
      key={member.id}
      style={[
        viewModes[section] ? styles.compactMemberCard : styles.memberCard,
        { marginBottom: 12 }
      ]}
      onPress={() => handleMemberPress(member)}
      activeOpacity={0.8}
    >
      <View style={viewModes[section] ? styles.compactMemberContent : styles.memberContent}>
        <View style={styles.memberHeader}>
          {!viewModes[section] && (
            <View style={styles.avatarContainer}>
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarFallback]}>
                  <Ionicons name="person" size={24} color="rgba(255, 255, 255, 0.6)" />
                </View>
              )}
            </View>
          )}
          <View style={styles.memberInfo}>
            <Text
              style={[
                styles.memberName,
                viewModes[section] && styles.compactMemberName
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {member.name}
            </Text>
            <Text
              style={[
                styles.memberEmail,
                viewModes[section] && styles.compactMemberEmail
              ]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {member.email}
            </Text>
          </View>
          {!viewModes[section] && (
            <View style={styles.chevronContainer}>
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  const getRoleColor = (role: TeamMember['role']) => {
    switch (role) {
      case 'admin': return 'rgba(244, 63, 94, 0.8)';
      case 'seller': return 'rgba(34, 197, 94, 0.8)';
      case 'scanner': return 'rgba(59, 130, 246, 0.8)';
      default: return 'rgba(156, 163, 175, 0.8)';
    }
  };

  // Modal animations
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: modalOpacity.value,
  }));

  const handleAddMember = async () => {
    setShowAddMemberModal(true);
    backdropOpacity.value = withSpring(1, { damping: 20 });
    translateY.value = withSpring(0, { damping: 20 });
    modalOpacity.value = withSpring(1, { damping: 20 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Auto-paste email from clipboard
    try {
      const text = await Clipboard.getStringAsync();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (text && emailRegex.test(text)) {
        setNewMember(prev => ({ ...prev, email: text }));
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      // Silently fail if clipboard access fails
    }
  };

  const closeAddMemberModal = () => {
    backdropOpacity.value = withSpring(0, { damping: 20 });
    translateY.value = withSpring(height, { damping: 20 });
    modalOpacity.value = withSpring(0, { damping: 20 });
    setTimeout(() => {
      setShowAddMemberModal(false);
      setNewMember({ email: '', role: 'seller' });
    }, 300);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmitMember = () => {
    if (!newMember.email.trim()) {
      alert('Por favor ingresa un email válido');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMember.email)) {
      alert('Por favor ingresa un formato de email válido');
      return;
    }

    // Create new member
    const newTeamMember: TeamMember = {
      id: Date.now().toString(), // Simple ID generation for demo
      user_id: Date.now().toString(),
      name: newMember.email.split('@')[0], // Use email prefix as name for demo
      email: newMember.email,
      avatar: null,
      role: newMember.role,
      status: 'active',
    };

    // Add to team members list
    setTeamMembers(prev => [...prev, newTeamMember]);

    // Show success feedback
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Close modal and reset form
    closeAddMemberModal();
  };

  const handleMemberPress = (member: TeamMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const roleText = member.role === 'admin' ? 'Administrador' :
                    member.role === 'seller' ? 'Vendedor' : 'Escaneador';

    Alert.alert(
      member.name,
      member.email,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            handleDeleteMember(member);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDeleteMember = (member: TeamMember) => {
    Alert.alert(
      'Confirmar eliminación',
      `¿Estás seguro que deseas eliminar a ${member.name} del equipo?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setTeamMembers(prev => prev.filter(m => m.id !== member.id));
            // Success feedback after deletion
            setTimeout(() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 100);
          },
        },
      ],
      { cancelable: true }
    );
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
          <Text style={styles.loadingText}>Cargando equipo...</Text>
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
            titleColor="#ffffff"
          />
        }
      >
        {/* Add Member Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleAddMember}>
          <View style={styles.createButtonContent}>
            <Ionicons name="add" size={18} color="#000000" />
            <Text style={styles.createButtonText}>Agregar Miembro</Text>
          </View>
        </TouchableOpacity>

        {/* Administradores */}
        {adminMembers.length > 0 && (
          <>
            {renderSectionHeader('Administradores', 'admin', adminMembers.length)}
            <View style={viewModes.admin ? styles.compactMembersList : styles.membersList}>
              {adminMembers.map((member, index) => renderMemberCard(member, index, 'admin'))}
            </View>
          </>
        )}

        {/* Vendedores */}
        {sellerMembers.length > 0 && (
          <>
            {renderSectionHeader('Vendedores', 'seller', sellerMembers.length)}
            <View style={viewModes.seller ? styles.compactMembersList : styles.membersList}>
              {sellerMembers.map((member, index) => renderMemberCard(member, index, 'seller'))}
            </View>
          </>
        )}

        {/* Escaneadores */}
        {scannerMembers.length > 0 && (
          <>
            {renderSectionHeader('Escaneadores', 'scanner', scannerMembers.length)}
            <View style={viewModes.scanner ? styles.compactMembersList : styles.membersList}>
              {scannerMembers.map((member, index) => renderMemberCard(member, index, 'scanner'))}
            </View>
          </>
        )}

        {/* Estado vacío */}
        {teamMembers.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="people-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
            <Text style={styles.emptyTitle}>Sin miembros</Text>
            <Text style={styles.emptySubtitle}>Agrega miembros a tu equipo</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add Member Modal - Redesigned */}
      <Modal transparent visible={showAddMemberModal} statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalBackdrop}
        >
          <GlassView
            glassEffectStyle="regular"
            tintColor="rgba(0,0,0,0.4)"
            style={StyleSheet.absoluteFillObject}
          />
          <TouchableOpacity
            style={StyleSheet.absoluteFillObject}
            onPress={closeAddMemberModal}
            activeOpacity={1}
          />
          <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
            <View style={styles.modalHandle} />

            <TouchableOpacity
              style={styles.modalContent}
              activeOpacity={1}
              onPress={() => Keyboard.dismiss()}
            >
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleContainer}>
                  <Text style={styles.modalTitle}>Nuevo Miembro</Text>
                  <Text style={styles.modalSubtitle}>Agrega un miembro a tu equipo</Text>
                </View>
              </View>

              {/* Form */}
              <View style={styles.formContainer}>
                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Correo electrónico</Text>
                  <View style={styles.inputWrapper}>
                    <Ionicons name="mail-outline" size={20} color="rgba(255, 255, 255, 0.6)" style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.4)"
                      value={newMember.email}
                      onChangeText={(text) => setNewMember(prev => ({ ...prev, email: text.toLowerCase() }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={() => Keyboard.dismiss()}
                      contextMenuHidden={false}
                      textContentType="emailAddress"
                    />
                    {newMember.email.length > 0 && (
                      <TouchableOpacity
                        style={styles.clearButton}
                        onPress={() => {
                          setNewMember(prev => ({ ...prev, email: '' }));
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Role Selection */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Selecciona el rol</Text>
                  <View style={styles.roleGrid}>
                    {(['admin', 'seller', 'scanner'] as const).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleCard,
                          newMember.role === role && styles.roleCardSelected
                        ]}
                        onPress={() => {
                          setNewMember(prev => ({ ...prev, role }));
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <View style={[
                          styles.roleIconContainer,
                          { backgroundColor: newMember.role === role ? '#ffffff' : 'rgba(255, 255, 255, 0.1)' }
                        ]}>
                          <Ionicons
                            name={getRoleIcon(role) as any}
                            size={20}
                            color={newMember.role === role ? '#000000' : 'rgba(255, 255, 255, 0.8)'}
                          />
                        </View>
                        <Text style={[
                          styles.roleCardTitle,
                          { color: newMember.role === role ? '#ffffff' : 'rgba(255, 255, 255, 0.8)' }
                        ]}>
                          {role === 'admin' ? 'Admin' : role === 'seller' ? 'Vendedor' : 'Scanner'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={closeAddMemberModal}
                >
                  <Text style={styles.secondaryButtonText}>Cancelar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleSubmitMember}
                >
                  <Text style={styles.primaryButtonText}>Agregar Miembro</Text>
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

    // Create Button
    createButton: {
      marginBottom: 16,
      borderRadius: 25,
      backgroundColor: '#ffffff',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 2,
      elevation: 2,
    },
    createButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      gap: 8,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#000000',
    },

    // Section Headers
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      ...Typography.title3,
      color: '#ffffff',
      fontWeight: '600',
    },
    toggleButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },

    // Member Lists
    membersList: {
      gap: 12,
      marginBottom: 32,
    },
    compactMembersList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 32,
    },

    // Member Cards
    memberCard: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    compactMemberCard: {
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      width: '48%',
      marginBottom: 12,
    },
    memberContent: {
      padding: 20,
    },
    compactMemberContent: {
      padding: 16,
      alignItems: 'center',
    },
    memberHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      marginRight: 16,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 16,
    },
    avatarFallback: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 4,
      numberOfLines: 1,
      ellipsizeMode: 'tail',
    },
    compactMemberName: {
      fontSize: 16,
      fontWeight: '600',
      color: '#ffffff',
      marginBottom: 4,
      textAlign: 'center',
      numberOfLines: 1,
      ellipsizeMode: 'tail',
    },
    memberEmail: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.7)',
      numberOfLines: 1,
      ellipsizeMode: 'tail',
    },
    compactMemberEmail: {
      fontSize: 13,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
      marginBottom: 6,
      numberOfLines: 1,
      ellipsizeMode: 'tail',
    },
    roleIndicator: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chevronContainer: {
      justifyContent: 'center',
      alignItems: 'center',
      paddingLeft: 8,
    },

    // Empty State
    emptyState: {
      borderRadius: 20,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      padding: 40,
      alignItems: 'center',
      marginTop: 40,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 16,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
    },

    // Modal Styles - Redesigned
    modalBackdrop: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: 'rgba(18, 18, 18, 0.95)',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      minHeight: height * 0.5,
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
    roleGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    roleCard: {
      flex: 1,
      backgroundColor: 'rgba(255, 255, 255, 0.06)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      padding: 16,
      alignItems: 'center',
    },
    roleCardSelected: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    roleIconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 8,
    },
    roleCardTitle: {
      fontSize: 12,
      fontWeight: '600',
      textAlign: 'center',
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
    clearButton: {
      position: 'absolute',
      right: 12,
      padding: 4,
    },
  });
}