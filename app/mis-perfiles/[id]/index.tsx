import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Typography } from '../../../constants/fonts';
import { ApiService, ProducerUsersResponse, ProducerAdmin, ProducerSeller, ProducerScanner, UpdateProducerRequest } from '../../../lib/api';

const { width, height } = Dimensions.get('window');

interface TeamMember {
  id: string;
  user_id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'admin' | 'seller' | 'scanner';
  status: 'active' | 'inactive' | 'pending';
  joinDate?: string;
  lastActive?: string;
  permissions?: string[];
  totalSales?: number;
  eventsAssigned?: number;
}

interface Producer {
  id: string;
  name: string;
  logo: string | null;
  description?: string;
  totalEvents?: number;
  totalRevenue?: number;
  teamCount?: number;
}

export default function ProducerDetailScreen() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { session } = useAuth();

  console.log('ProducerDetailScreen rendering, id:', id, 'session:', !!session);

  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [producer, setProducer] = useState<Producer | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [viewModes, setViewModes] = useState({
    admin: false,
    seller: false,
    scanner: false,
  });

  // Modal animation values
  const backdropOpacity = useSharedValue(0);
  const translateY = useSharedValue(height);
  const modalOpacity = useSharedValue(0);
  const blurRadius = useSharedValue(0);

  // New member form state
  const [newMember, setNewMember] = useState({
    email: '',
    role: 'seller' as TeamMember['role'],
  });

  // Edit profile state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    email: '',
    phone: '',
    status: true,
    banner: '',
    logo: ''
  });

  useEffect(() => {
    loadProducerData();
    loadTeamMembers();
  }, [id]);

  useEffect(() => {
    if (producer?.name) {
      navigation.setOptions({
        title: producer.name,
      });
    }
  }, [producer?.name, navigation]);

  useEffect(() => {
    if (showAddMemberModal) {
      backdropOpacity.value = withTiming(1, { duration: 400 });
      blurRadius.value = withTiming(1, { duration: 350 });
      modalOpacity.value = withTiming(1, { duration: 300 });
      translateY.value = withSpring(0, {
        damping: 30,
        stiffness: 400,
        mass: 1,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      blurRadius.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 250 });
      translateY.value = withSpring(height * 0.2, {
        damping: 25,
        stiffness: 500,
        mass: 0.8,
      });
    }
  }, [showAddMemberModal]);

  useEffect(() => {
    if (showEditModal) {
      backdropOpacity.value = withTiming(1, { duration: 350 });
      blurRadius.value = withTiming(1, { duration: 300 });
      modalOpacity.value = withTiming(1, { duration: 400 });
      translateY.value = withSpring(0, {
        damping: 25,
        stiffness: 300,
        mass: 0.9,
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 250 });
      blurRadius.value = withTiming(0, { duration: 200 });
      modalOpacity.value = withTiming(0, { duration: 200 });
      translateY.value = withSpring(60, {
        damping: 20,
        stiffness: 400,
        mass: 0.7,
      });
    }
  }, [showEditModal]);

  const loadProducerData = async () => {
    try {
      if (!session?.accessToken) {
        console.warn('No authentication token available');
        // Set mock data if no token
        setProducer({
          id: id as string,
          name: 'Productora Demo',
          logo: null,
          description: 'Descripción de demo',
        });
        return;
      }

      // Get complete producer details with logo and other info
      const producerDetails = await ApiService.getProducerDetails(id as string, session.accessToken);

      setProducer({
        id: producerDetails.id,
        name: producerDetails.name,
        logo: producerDetails.logo,
        description: producerDetails.description || 'Sin descripción',
        email: producerDetails.email,
        phone: producerDetails.phone,
        status: producerDetails.status,
        banner: producerDetails.banner,
      });
    } catch (error) {
      console.error('Error loading producer:', error);
      Alert.alert('Error', 'No se pudo cargar la información del productor');
      // Set fallback data on error
      setProducer({
        id: id as string,
        name: 'Error al cargar',
        logo: null,
        description: 'Error al cargar descripción',
      });
    }
  };

  const loadTeamMembers = async () => {
    try {
      setLoading(true);
      console.log('👥 Loading team members for producer:', id);

      if (!session?.accessToken) {
        console.warn('⚠️ No authentication token available');
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      if (!id) {
        console.warn('⚠️ No producer ID available');
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      console.log('📞 Calling getProducerUsers API...');
      // Get producer users from API
      const producerUsersResponse = await ApiService.getProducerUsers(id as string, session.accessToken);
      console.log('🎉 Team members API response received:', producerUsersResponse);

      // Transform API response to TeamMember format
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
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          permissions: ['manage_events', 'manage_team', 'view_reports'],
          totalSales: 0,
          eventsAssigned: 0,
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
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          permissions: ['sell_tickets'],
          totalSales: 0,
          eventsAssigned: 0,
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
          joinDate: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          permissions: ['scan_tickets'],
          totalSales: 0,
          eventsAssigned: 0,
        });
      });

      console.log('💾 Setting team members in state:', {
        totalMembers: teamMembers.length,
        admins: teamMembers.filter(m => m.role === 'admin').length,
        sellers: teamMembers.filter(m => m.role === 'seller').length,
        scanners: teamMembers.filter(m => m.role === 'scanner').length
      });

      setTeamMembers(teamMembers);
    } catch (error) {
      console.error('💥 Error loading team members:', error);

      // More specific error handling
      if (error.message?.includes('400')) {
        console.warn('⚠️ API returned 400 - possibly no team members or invalid producer ID');
        Alert.alert('Información', 'No hay miembros del equipo configurados aún.');
      } else {
        Alert.alert('Error', 'No se pudieron cargar los miembros del equipo. Inténtalo de nuevo.');
      }

      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadProducerData(), loadTeamMembers()]);
    setRefreshing(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'rgba(255, 59, 48, 0.8)';
      case 'manager': return 'rgba(255, 149, 0, 0.8)';
      case 'seller': return 'rgba(52, 199, 89, 0.8)';
      case 'scanner': return 'rgba(0, 122, 255, 0.8)';
      case 'viewer': return 'rgba(0, 122, 255, 0.8)';
      default: return 'rgba(255, 255, 255, 0.8)';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'rgba(52, 199, 89, 0.8)';
      case 'inactive': return 'rgba(255, 149, 0, 0.8)';
      case 'pending': return 'rgba(255, 59, 48, 0.8)';
      default: return 'rgba(255, 255, 255, 0.8)';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'shield-checkmark';
      case 'manager': return 'people';
      case 'seller': return 'storefront';
      case 'scanner': return 'scan';
      case 'viewer': return 'eye';
      default: return 'person';
    }
  };

  const handleAddMember = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAddMemberModal(true);
  };

  const closeAddMemberModal = () => {
    runOnJS(setShowAddMemberModal)(false);
  };

  const submitNewMember = async () => {
    if (!newMember.email.trim()) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    if (!session?.accessToken) {
      Alert.alert('Error', 'Token de autenticación no disponible');
      return;
    }

    try {
      // Convert role to role_type number: 1=admin, 2=seller, 3=scanner
      const roleTypeMap = {
        'admin': 1,
        'seller': 2,
        'scanner': 3
      };

      const roleType = roleTypeMap[newMember.role];

      console.log('Adding new team member via API:', {
        producerId: id,
        email: newMember.email,
        roleType: roleType
      });

      // Call the API to add the producer user role
      await ApiService.addProducerUserRole(
        id as string,
        newMember.email,
        roleType,
        session.accessToken
      );

      // Reset form and close modal
      setNewMember({ email: '', role: 'seller' });
      closeAddMemberModal();

      // Reload team members to show the new addition
      await loadTeamMembers();

      Alert.alert('Éxito', 'Miembro del equipo agregado correctamente');
    } catch (error) {
      console.error('Error adding team member:', error);
      Alert.alert('Error', 'No se pudo agregar el miembro del equipo. Verifica que el email sea válido.');
    }
  };

  const handleMemberPress = (member: TeamMember) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert(
      member.name,
      `Email: ${member.email}\nRol: ${member.role}\nEstado: ${member.status}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Editar', onPress: () => console.log('Edit member:', member.id) },
        { text: 'Eliminar', style: 'destructive', onPress: () => removeMember(member.id) },
      ]
    );
  };

  const toggleViewMode = (section: 'admin' | 'seller' | 'scanner') => {
    setViewModes(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderSectionHeader = (title: string, section: 'admin' | 'seller' | 'scanner') => {
    const isCompact = viewModes[section];
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity
          style={styles.sectionToggle}
          onPress={() => toggleViewMode(section)}
        >
          <BlurView
            intensity={40}
            tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons
            name={isCompact ? "grid" : "list"}
            size={16}
            color="rgba(255, 255, 255, 0.8)"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const renderMemberCard = (member: TeamMember, index: number, section: 'admin' | 'seller' | 'scanner') => {
    const isCompactView = viewModes[section];

    return (
      <TouchableOpacity
        key={member.id}
        style={isCompactView ? styles.compactCard : styles.normalCard}
        onPress={() => handleMemberPress(member)}
        activeOpacity={0.8}
      >
        <BlurView
          intensity={40}
          tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
          style={StyleSheet.absoluteFillObject}
        />

        {isCompactView ? (
          // Compact view - simple horizontal layout
          <View style={styles.compactContent}>
            <View style={styles.compactAvatar}>
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.compactAvatarImage} />
              ) : (
                <View style={styles.compactAvatarPlaceholder}>
                  <Ionicons name="person" size={16} color="rgba(255, 255, 255, 0.8)" />
                </View>
              )}
            </View>
            <View style={styles.compactInfo}>
              <Text style={styles.compactName}>{member.name}</Text>
              <Text style={styles.compactEmail}>{member.email}</Text>
            </View>
          </View>
        ) : (
          // Normal view - clean card layout
          <View style={styles.normalContent}>
            <View style={styles.normalAvatar}>
              {member.avatar ? (
                <Image source={{ uri: member.avatar }} style={styles.normalAvatarImage} />
              ) : (
                <View style={styles.normalAvatarPlaceholder}>
                  <Text style={styles.normalAvatarText}>
                    {member.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
            <View style={styles.normalInfo}>
              <Text style={styles.normalName}>{member.name}</Text>
              <Text style={styles.normalEmail}>{member.email}</Text>
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const removeMember = (memberId: string) => {
    Alert.alert(
      'Confirmar eliminación',
      '¿Estás seguro de que quieres eliminar este miembro del equipo?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            setTeamMembers(prev => prev.filter(member => member.id !== memberId));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ]
    );
  };

  const handleEditProfile = async () => {
    try {
      if (!session?.accessToken) {
        Alert.alert('Error', 'Token de autenticación no disponible');
        return;
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Fetch complete producer data from API
      console.log('Loading complete producer data for editing...');
      const completeProducerData = await ApiService.getProducerDetails(
        id as string,
        session.accessToken
      );

      // Set form data with complete producer data
      setEditForm({
        name: completeProducerData.name || '',
        description: completeProducerData.description || '',
        email: completeProducerData.email || '',
        phone: completeProducerData.phone || '',
        status: completeProducerData.status ?? true,
        banner: completeProducerData.banner || '',
        logo: completeProducerData.logo || ''
      });

      setShowEditModal(true);
    } catch (error) {
      console.error('Error loading producer data:', error);
      Alert.alert('Error', 'No se pudo cargar la información del productor');
    }
  };

  const closeEditModal = () => {
    runOnJS(setShowEditModal)(false);
    // Reset form after modal closes
    setTimeout(() => {
      setEditForm({
        name: '',
        description: '',
        email: '',
        phone: '',
        status: true,
        banner: '',
        logo: ''
      });
    }, 300); // Wait for animation to complete
  };

  const submitEditProfile = async () => {
    if (!editForm.name.trim()) {
      Alert.alert('Error', 'El nombre es requerido');
      return;
    }

    if (!session?.accessToken) {
      Alert.alert('Error', 'Token de autenticación no disponible');
      return;
    }

    try {
      console.log('Updating producer profile:', {
        producerId: id,
        formData: editForm
      });

      const updateData: UpdateProducerRequest = {
        name: editForm.name,
        description: editForm.description || undefined,
        email: editForm.email || undefined,
        phone: editForm.phone || undefined,
        status: editForm.status,
        banner: editForm.banner || undefined,
        logo: editForm.logo || undefined
      };

      await ApiService.updateProducer(
        id as string,
        updateData,
        session.accessToken
      );

      // Update local producer data
      setProducer(prev => prev ? { ...prev, ...updateData } : null);

      closeEditModal();
      Alert.alert('Éxito', 'Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating producer profile:', error);
      Alert.alert('Error', 'No se pudo actualizar el perfil');
    }
  };

  const adminMembers = teamMembers.filter(member => member.role === 'admin');
  const sellerMembers = teamMembers.filter(member => member.role === 'seller');
  const scannerMembers = teamMembers.filter(member => member.role === 'scanner');

  // Modal animation styles
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const blurAnimatedStyle = useAnimatedStyle(() => ({
    opacity: blurRadius.value,
  }));

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: modalOpacity.value,
  }));

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

      {/* Custom Header */}
      <View style={[styles.customHeader, { paddingTop: insets.top }]}>
        <TouchableOpacity
          style={styles.customBackButton}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
        >
          <BlurView
            intensity={60}
            tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
            style={StyleSheet.absoluteFillObject}
          />
          <Ionicons name="chevron-back" size={24} color="#ffffff" />
        </TouchableOpacity>

        <Text style={styles.customHeaderTitle}>
          Gestión de Equipo
        </Text>

        <View style={styles.customHeaderSpacer} />
      </View>

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
        {/* Filter Controls - idéntico a Mis Perfiles */}
        <View style={styles.filterContainer}>
          <SegmentedControl
            values={['Analíticas', 'Equipo', 'Perfil']}
            selectedIndex={selectedTab}
            onChange={(event) => {
              setSelectedTab(event.nativeEvent.selectedSegmentIndex);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.segmentedControl}
          />
        </View>

        {/* Add Member Section - solo mostrar en tab Equipo */}
        {selectedTab === 1 && (
          <TouchableOpacity style={styles.createButton} onPress={handleAddMember}>
            <View style={styles.createButtonContent}>
              <Ionicons name="add" size={18} color="#000000" />
              <Text style={styles.createButtonText}>Agregar Miembro</Text>
            </View>
          </TouchableOpacity>
        )}
        {/* Tab 0: Analíticas */}
        {selectedTab === 0 && (
          <View style={styles.tabContent}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="people" size={28} color="rgba(0, 122, 255, 0.8)" />
                  <Text style={styles.statValue}>{teamMembers.length}</Text>
                  <Text style={styles.statLabel}>Total Miembros</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="shield-checkmark" size={28} color="rgba(255, 59, 48, 0.8)" />
                  <Text style={styles.statValue}>{adminMembers.length}</Text>
                  <Text style={styles.statLabel}>Administradores</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="storefront" size={28} color="rgba(52, 199, 89, 0.8)" />
                  <Text style={styles.statValue}>{sellerMembers.length}</Text>
                  <Text style={styles.statLabel}>Vendedores</Text>
                </View>
              </View>

              <View style={styles.statCard}>
                <BlurView
                  intensity={40}
                  tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.statCardContent}>
                  <Ionicons name="scan" size={28} color="rgba(0, 122, 255, 0.8)" />
                  <Text style={styles.statValue}>{scannerMembers.length}</Text>
                  <Text style={styles.statLabel}>Escaneadores</Text>
                </View>
              </View>
            </View>
            <View style={{ height: 100 }} />
          </View>
        )}

        {/* Tab 1: Equipo */}
        {selectedTab === 1 && (
          <View style={styles.tabContent}>
            {/* Administradores */}
            {adminMembers.length > 0 && (
          <>
            {renderSectionHeader('Administradores', 'admin')}
            <View style={viewModes.admin ? styles.compactMembersList : styles.membersList}>
              {adminMembers.map((member, index) => renderMemberCard(member, index, 'admin'))}
            </View>
          </>
        )}

        {/* Vendedores */}
        {sellerMembers.length > 0 && (
          <>
            {renderSectionHeader('Vendedores', 'seller')}
            <View style={viewModes.seller ? styles.compactMembersList : styles.membersList}>
              {sellerMembers.map((member, index) => renderMemberCard(member, index, 'seller'))}
            </View>
          </>
        )}

        {/* Escaneadores */}
        {scannerMembers.length > 0 && (
          <>
            {renderSectionHeader('Escaneadores', 'scanner')}
            <View style={viewModes.scanner ? styles.compactMembersList : styles.membersList}>
              {scannerMembers.map((member, index) => renderMemberCard(member, index, 'scanner'))}
            </View>
          </>
        )}

        {/* Estado vacío */}
        {teamMembers.length === 0 && (
          <View style={styles.emptyState}>
            <BlurView
              intensity={40}
              tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
              style={StyleSheet.absoluteFillObject}
            />
            <Ionicons name="people-outline" size={64} color="rgba(255, 255, 255, 0.4)" />
            <Text style={styles.emptyTitle}>Sin miembros</Text>
            <Text style={styles.emptySubtitle}>Agrega miembros a tu equipo</Text>
          </View>
        )}

            <View style={{ height: 100 }} />
          </View>
        )}

        {/* Tab 2: Perfil */}
        {selectedTab === 2 && (
          <View style={styles.tabContent}>
            {/* Producer Info Card */}
            <View style={styles.profileCard}>
              <BlurView
                intensity={40}
                tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                style={StyleSheet.absoluteFillObject}
              />
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
                    <BlurView
                      intensity={60}
                      tint={theme.isDark ? "systemUltraThinMaterialDark" : "systemUltraThinMaterialLight"}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Ionicons name="create-outline" size={22} color="rgba(255, 255, 255, 0.9)" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Settings Options */}
            <View style={styles.settingsSection}>
              <Text style={styles.sectionTitle}>Configuración</Text>
              <View style={styles.settingsList}>
                <TouchableOpacity style={styles.settingItem}>
                  <BlurView
                    intensity={40}
                    tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.settingItemContent}>
                    <Ionicons name="notifications" size={24} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.settingItemText}>Notificaciones</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <BlurView
                    intensity={40}
                    tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.settingItemContent}>
                    <Ionicons name="key" size={24} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.settingItemText}>Permisos</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity style={styles.settingItem}>
                  <BlurView
                    intensity={40}
                    tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <View style={styles.settingItemContent}>
                    <Ionicons name="information-circle" size={24} color="rgba(255, 255, 255, 0.8)" />
                    <Text style={styles.settingItemText}>Información</Text>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.4)" />
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ height: 100 }} />
          </View>
        )}
      </ScrollView>

      {/* Add Member Modal */}
      <Modal transparent visible={showAddMemberModal} statusBarTranslucent>
        <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyle]}>
          <Animated.View style={[blurAnimatedStyle, StyleSheet.absoluteFillObject]}>
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
              <BlurView
                intensity={100}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Agregar Miembro</Text>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={closeAddMemberModal}
                >
                  <BlurView
                    intensity={60}
                    tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Ionicons name="close" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Email</Text>
                  <View style={styles.inputContainer}>
                    <BlurView
                      intensity={40}
                      tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <TextInput
                      style={styles.textInput}
                      placeholder="email@ejemplo.com"
                      placeholderTextColor="rgba(255, 255, 255, 0.5)"
                      value={newMember.email}
                      onChangeText={(text) => setNewMember(prev => ({ ...prev, email: text }))}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.fieldLabel}>Rol</Text>
                  <View style={styles.roleSelector}>
                    {(['admin', 'seller', 'scanner'] as const).map((role) => (
                      <TouchableOpacity
                        key={role}
                        style={[
                          styles.roleOption,
                          newMember.role === role && styles.roleOptionSelected
                        ]}
                        onPress={() => {
                          setNewMember(prev => ({ ...prev, role }));
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                        <BlurView
                          intensity={40}
                          tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                          style={StyleSheet.absoluteFillObject}
                        />
                        <Ionicons
                          name={getRoleIcon(role) as any}
                          size={20}
                          color={newMember.role === role ? "#ffffff" : "rgba(255, 255, 255, 0.6)"}
                        />
                        <Text style={[
                          styles.roleOptionText,
                          { color: newMember.role === role ? "#ffffff" : "rgba(255, 255, 255, 0.6)" }
                        ]}>
                          {role === 'admin' ? 'Admin' : role === 'seller' ? 'Vendedor' : 'Scanner'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={closeAddMemberModal}
                >
                  <BlurView
                    intensity={40}
                    tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={submitNewMember}
                >
                  <BlurView
                    intensity={60}
                    tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                    style={StyleSheet.absoluteFillObject}
                  />
                  <Text style={styles.submitButtonText}>Agregar Miembro</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal transparent visible={showEditModal} statusBarTranslucent>
        <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyle]}>
          <Animated.View style={[blurAnimatedStyle, StyleSheet.absoluteFillObject]}>
            <BlurView
              intensity={80}
              tint="dark"
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          <KeyboardAvoidingView
            style={styles.keyboardAvoidingContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
          >
            <Animated.View style={[styles.modalContainer, modalAnimatedStyle]}>
              <BlurView
                intensity={100}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Editar Perfil</Text>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={closeEditModal}
                  >
                    <BlurView
                      intensity={60}
                      tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Ionicons name="close" size={20} color="#ffffff" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>Nombre *</Text>
                    <View style={styles.inputContainer}>
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={editForm.name}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, name: text }))}
                        placeholder="Nombre del productor"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        autoCapitalize="words"
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>Descripción</Text>
                    <View style={[styles.inputContainer, { height: 80 }]}>
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={[styles.textInput, { height: 70, textAlignVertical: 'top' }]}
                        value={editForm.description}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, description: text }))}
                        placeholder="Descripción del productor"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        multiline
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>Email</Text>
                    <View style={styles.inputContainer}>
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={editForm.email}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, email: text }))}
                        placeholder="email@ejemplo.com"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>Teléfono</Text>
                    <View style={styles.inputContainer}>
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={editForm.phone}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, phone: text }))}
                        placeholder="+1234567890"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="phone-pad"
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>URL del Logo</Text>
                    <View style={styles.inputContainer}>
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={editForm.logo}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, logo: text }))}
                        placeholder="https://ejemplo.com/logo.png"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="url"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.formGroup}>
                    <Text style={styles.fieldLabel}>URL del Banner</Text>
                    <View style={styles.inputContainer}>
                      <BlurView
                        intensity={40}
                        tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
                        style={StyleSheet.absoluteFillObject}
                      />
                      <TextInput
                        style={styles.textInput}
                        value={editForm.banner}
                        onChangeText={(text) => setEditForm(prev => ({ ...prev, banner: text }))}
                        placeholder="https://ejemplo.com/banner.png"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        keyboardType="url"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalCancelButton]}
                    onPress={closeEditModal}
                  >
                    <BlurView
                      intensity={60}
                      tint="light"
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Text style={styles.modalCancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionButton, styles.modalSubmitButton]}
                    onPress={submitEditProfile}
                  >
                    <LinearGradient
                      colors={['#007AFF', '#0056CC']}
                      style={StyleSheet.absoluteFillObject}
                    />
                    <Text style={styles.modalSubmitButtonText}>Guardar Cambios</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
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


    // Custom Header
    customHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
      height: 120,
      zIndex: 100,
    },
    customBackButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    customHeaderTitle: {
      ...Typography.title2,
      color: '#ffffff',
      fontWeight: 'bold',
      flex: 1,
      textAlign: 'center',
      marginHorizontal: 16,
    },
    customHeaderSpacer: {
      width: 44,
    },

    // ScrollView - ajustado para header custom
    scrollView: {
      flex: 1,
      paddingTop: 0,
    },
    contentContainer: {
      paddingBottom: insets.bottom + 100,
    },
    // Filter Controls - idéntico a Mis Perfiles
    filterContainer: {
      paddingHorizontal: 20,
      marginBottom: 12,
      marginTop: 8,
    },
    segmentedControl: {
      height: 36,
      width: '100%',
    },
    // Create Button - idéntico a Mis Perfiles
    createButton: {
      marginHorizontal: 20,
      marginTop: 6,
      marginBottom: 16,
      borderRadius: 12,
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

    // Tab Content
    tabContent: {
      paddingHorizontal: 20,
      marginTop: 8,
    },

    sectionTitle: {
      ...Typography.title3,
      color: '#ffffff',
      fontWeight: '600',
      marginBottom: 16,
      marginTop: 8,
    },
    membersList: {
      marginBottom: 32,
    },

    // Member Cards
    memberCard: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    memberContent: {
      padding: 20,
    },
    memberHeader: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatarContainer: {
      // Simplified container without position relative
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
      ...Typography.subheadline,
      color: '#ffffff',
      fontWeight: '600',
      marginBottom: 4,
    },
    memberEmail: {
      ...Typography.body,
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: 8,
    },
    memberBadges: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    roleBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
      gap: 4,
    },
    roleText: {
      ...Typography.caption,
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 11,
      textTransform: 'capitalize',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    statusText: {
      ...Typography.caption,
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 11,
      textTransform: 'capitalize',
    },
    memberStats: {
      alignItems: 'flex-end',
    },
    salesAmount: {
      ...Typography.subheadline,
      color: '#ffffff',
      fontWeight: '600',
      marginBottom: 2,
    },
    salesLabel: {
      ...Typography.caption,
      color: 'rgba(255, 255, 255, 0.6)',
    },

    // Empty State
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 100,
    },
    emptyTitle: {
      ...Typography.title3,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtitle: {
      ...Typography.body,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
    },


    // Modal styles
    modalBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    keyboardAvoidingContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    modalContainer: {
      maxHeight: height * 0.85,
      borderRadius: 20,
      margin: 20,
      overflow: 'hidden',
    },
    modalContent: {
      padding: 24,
      paddingBottom: insets.bottom + 24,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 24,
    },
    modalTitle: {
      ...Typography.title2,
      color: '#ffffff',
      fontWeight: '600',
    },
    modalCloseButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalScrollContent: {
      maxHeight: height * 0.4,
    },
    formGroup: {
      marginBottom: 20,
    },
    fieldLabel: {
      ...Typography.subheadline,
      color: '#ffffff',
      marginBottom: 8,
      fontWeight: '600',
    },
    inputContainer: {
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    textInput: {
      padding: 16,
      color: '#ffffff',
      fontSize: 16,
      ...Typography.body,
    },
    roleSelector: {
      flexDirection: 'row',
      gap: 8,
    },
    roleOption: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 16,
      borderRadius: 12,
      gap: 8,
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    roleOptionSelected: {
      borderColor: 'rgba(255, 255, 255, 0.4)',
      backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    roleOptionText: {
      ...Typography.caption,
      color: '#ffffff',
      fontWeight: '600',
      textAlign: 'center',
      fontSize: 12,
    },
    modalActions: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 24,
    },
    cancelButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      overflow: 'hidden',
    },
    cancelButtonText: {
      ...Typography.subheadline,
      color: '#ffffff',
      fontWeight: '600',
    },
    submitButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      overflow: 'hidden',
      backgroundColor: 'rgba(0, 122, 255, 0.3)',
    },
    submitButtonText: {
      ...Typography.subheadline,
      color: '#ffffff',
      fontWeight: '600',
    },

    // Analytics
    analyticsContainer: {
      paddingBottom: 20,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
      marginBottom: 32,
    },
    statCard: {
      width: (width - 52) / 2,
      height: 120,
      borderRadius: 16,
      overflow: 'hidden',
    },
    statCardContent: {
      flex: 1,
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statValue: {
      ...Typography.title2,
      color: '#ffffff',
      fontWeight: 'bold',
      marginTop: 8,
      marginBottom: 4,
      textAlign: 'center',
    },
    statLabel: {
      ...Typography.caption,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
    },

    // Profile
    profileContainer: {
      paddingBottom: 20,
    },
    profileCard: {
      borderRadius: 20,
      overflow: 'hidden',
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    profileCardContent: {
      padding: 20,
    },
    profileContent: {
      padding: 24,
    },
    profileHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    profileIconContainer: {
      marginRight: 20,
    },
    profileIcon: {
      width: 80,
      height: 80,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    profileIconFallback: {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      borderRadius: 16,
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      fontWeight: '700',
      color: '#ffffff',
      marginBottom: 4,
    },
    profileEmail: {
      fontSize: 14,
      color: 'rgba(255, 255, 255, 0.8)',
      marginBottom: 2,
    },
    profileDescription: {
      ...Typography.body,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    editButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 12,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    profileStats: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    profileStatItem: {
      flex: 1,
      alignItems: 'center',
    },
    profileStatNumber: {
      ...Typography.title3,
      color: '#ffffff',
      fontWeight: 'bold',
      marginBottom: 4,
    },
    profileStatLabel: {
      ...Typography.caption,
      color: 'rgba(255, 255, 255, 0.6)',
      textAlign: 'center',
    },
    statDivider: {
      width: 1,
      height: 32,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      marginHorizontal: 20,
    },

    // Settings
    settingsSection: {
      marginBottom: 32,
    },
    settingsList: {
      gap: 12,
    },
    settingItem: {
      borderRadius: 16,
      overflow: 'hidden',
    },
    settingItemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 20,
    },
    settingItemText: {
      ...Typography.body,
      color: '#ffffff',
      fontWeight: '500',
      flex: 1,
      marginLeft: 16,
    },

    // Section Headers
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 20,
    },
    sectionToggle: {
      width: 32,
      height: 32,
      borderRadius: 8,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Clean Card Styles
    compactMembersList: {
      marginBottom: 32,
      gap: 8,
    },

    // Compact Cards
    compactCard: {
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      height: 56,
    },
    compactContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      flex: 1,
    },
    compactAvatar: {
      marginRight: 12,
    },
    compactAvatarImage: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    compactAvatarPlaceholder: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    compactAvatarText: {
      ...Typography.caption,
      color: '#ffffff',
      fontWeight: '600',
      fontSize: 14,
    },
    compactInfo: {
      flex: 1,
    },
    compactName: {
      fontSize: 16,
      color: '#ffffff',
      fontWeight: '600',
      marginBottom: 2,
      fontFamily: 'System',
    },
    compactEmail: {
      fontSize: 12,
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: '400',
      fontFamily: 'System',
    },

    // Normal Cards
    normalCard: {
      borderRadius: 16,
      overflow: 'hidden',
      marginBottom: 12,
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    normalContent: {
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
    },
    normalAvatar: {
      marginRight: 16,
    },
    normalAvatarImage: {
      width: 48,
      height: 48,
      borderRadius: 24,
    },
    normalAvatarPlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    normalAvatarText: {
      ...Typography.title3,
      color: '#ffffff',
      fontWeight: '700',
    },
    normalInfo: {
      flex: 1,
    },
    normalName: {
      ...Typography.headline,
      color: '#ffffff',
      fontWeight: '600',
      marginBottom: 4,
    },
    normalEmail: {
      ...Typography.body,
      color: 'rgba(255, 255, 255, 0.7)',
    },

  });
}