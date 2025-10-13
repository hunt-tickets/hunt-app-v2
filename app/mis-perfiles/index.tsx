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
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Typography } from '../../constants/fonts';
import { ApiService, Producer, Venue, Artist } from '../../lib/api';

const { width, height } = Dimensions.get('window');
const CARD_HEIGHT = 160;

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'promoter' | 'viewer';
  avatar: string | null;
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
  permissions: string[];
  city?: string;
  location?: string;
}

export default function MisPerfilesScreen() {
  const { theme } = useTheme();
  const { session } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const [selectedFilter, setSelectedFilter] = useState('venues');
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<UserProfile[]>([]);
  const [producers, setProducers] = useState<Producer[]>([]);
  const [loadingProducers, setLoadingProducers] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [showNewProducerModal, setShowNewProducerModal] = useState(false);
  const [showNewVenueModal, setShowNewVenueModal] = useState(false);
  const [newProducerForm, setNewProducerForm] = useState({
    name: '',
    email: '',
    phonePrefix: '+57',
    phoneNumber: '',
    logo: ''
  });
  const [newVenueForm, setNewVenueForm] = useState({
    name: '',
    city: '',
    logo: '',
    googleMapsLink: ''
  });

  // Modal animation values - Producer
  const translateYProducer = useSharedValue(height);
  const backdropOpacityProducer = useSharedValue(0);
  const modalOpacityProducer = useSharedValue(0);
  const blurRadiusProducer = useSharedValue(0);

  // Modal animation values - Venue
  const translateYVenue = useSharedValue(height);
  const backdropOpacityVenue = useSharedValue(0);
  const modalOpacityVenue = useSharedValue(0);
  const blurRadiusVenue = useSharedValue(0);

  // Sample data - replace with actual API call
  const mockProfiles: UserProfile[] = [
    {
      id: '1',
      name: 'Teatro Nacional',
      email: 'contacto@teatronacional.com',
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      lastActive: '2024-01-15',
      permissions: ['events.create', 'events.edit', 'users.manage'],
      city: 'Bogotá',
      location: 'Centro Histórico'
    },
    {
      id: '2',
      name: 'Gimnasio Moderno',
      email: 'eventos@gimnasiommoderno.com',
      role: 'promoter',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      status: 'active',
      lastActive: '2024-01-14',
      permissions: ['events.view', 'tickets.sell'],
      city: 'Medellín',
      location: 'El Poblado'
    },
    {
      id: '3',
      name: 'Parque Central',
      email: 'info@parquecentral.com',
      role: 'viewer',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      status: 'inactive',
      lastActive: '2024-01-10',
      permissions: ['events.view'],
      city: 'Cali',
      location: 'Centro'
    },
  ];

  useEffect(() => {
    loadProfiles();
    loadProducers();
    loadVenues();
    loadArtists();
  }, []);

  useEffect(() => {
    filterProfiles();
  }, [profiles, searchQuery, selectedFilter]);

  const loadProfiles = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProfiles(mockProfiles);
    } catch (error) {
      console.error('Error loading profiles:', error);
      Alert.alert('Error', 'No se pudieron cargar los perfiles');
    } finally {
      setLoading(false);
    }
  };

  const loadProducers = async () => {
    if (!session?.accessToken) {
      console.error('🔴 [Producers] No access token available');
      return;
    }

    try {
      setLoadingProducers(true);
      console.log('🟡 [Producers] Loading producers from API...');
      const producersData = await ApiService.getUserProducers(session.accessToken);
      console.log('🟢 [Producers] Successfully loaded', producersData.length, 'producers');
      console.log('🟢 [Producers] Data:', producersData);
      setProducers(producersData);
    } catch (error) {
      console.error('🔴 [Producers] Error loading producers:', error);
      Alert.alert('Error', 'No se pudieron cargar los productores');
    } finally {
      setLoadingProducers(false);
    }
  };

  const loadVenues = async () => {
    if (!session?.accessToken) {
      console.error('🔴 [Venues] No access token available');
      return;
    }

    try {
      setLoadingVenues(true);
      console.log('🟡 [Venues] Loading venues from API...');
      const venuesData = await ApiService.getVenues(session.accessToken);
      console.log('🟢 [Venues] Successfully loaded', venuesData.length, 'venues');
      console.log('🟢 [Venues] Data:', venuesData);
      setVenues(venuesData);
    } catch (error) {
      console.error('🔴 [Venues] Error loading venues:', error);
      Alert.alert('Error', 'No se pudieron cargar los venues');
    } finally {
      setLoadingVenues(false);
    }
  };

  const loadArtists = async () => {
    if (!session?.accessToken) {
      console.error('🔴 [Artists] No access token available');
      return;
    }

    try {
      setLoadingArtists(true);
      console.log('🟡 [Artists] Loading artists from API...');
      const artistsData = await ApiService.getArtists(session.accessToken);
      console.log('🟢 [Artists] Successfully loaded', artistsData.length, 'artists');
      console.log('🟢 [Artists] Data:', artistsData);
      setArtists(artistsData);
    } catch (error) {
      console.error('🔴 [Artists] Error loading artists:', error);
      Alert.alert('Error', 'No se pudieron cargar los artistas');
    } finally {
      setLoadingArtists(false);
    }
  };

  const filterProfiles = () => {
    // Don't filter for venues, productores and artistas as they have their own data sources
    if (selectedFilter === 'venues' || selectedFilter === 'productores' || selectedFilter === 'artistas') {
      setFilteredProfiles([]);
      return;
    }

    let filtered = profiles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by profile type/category
    // For now, keep all profiles since we don't have category data
    // In the future, filter by profile.category === selectedFilter

    setFilteredProfiles(filtered);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return 'shield-checkmark';
      case 'promoter': return 'megaphone';
      case 'viewer': return 'eye';
      default: return 'person';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'rgba(255, 59, 48, 0.8)';
      case 'promoter': return 'rgba(52, 199, 89, 0.8)';
      case 'viewer': return 'rgba(255, 149, 0, 0.8)';
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

  const handleProfilePress = (profile: UserProfile) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/mis-perfiles/${profile.id}`);
  };

  const handleCreateProfile = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (selectedFilter === 'productores') {
      setShowNewProducerModal(true);
    } else if (selectedFilter === 'venues') {
      setShowNewVenueModal(true);
    } else {
      Alert.alert('Crear Perfil', 'Funcionalidad próximamente disponible');
    }
  };

  // Modal animation styles - Producer
  const backdropAnimatedStyleProducer = useAnimatedStyle(() => ({
    opacity: backdropOpacityProducer.value,
  }));

  const blurAnimatedStyleProducer = useAnimatedStyle(() => ({
    opacity: blurRadiusProducer.value,
  }));

  const modalAnimatedStyleProducer = useAnimatedStyle(() => ({
    transform: [{ translateY: translateYProducer.value }],
    opacity: modalOpacityProducer.value,
  }));

  // Modal animation styles - Venue
  const backdropAnimatedStyleVenue = useAnimatedStyle(() => ({
    opacity: backdropOpacityVenue.value,
  }));

  const blurAnimatedStyleVenue = useAnimatedStyle(() => ({
    opacity: blurRadiusVenue.value,
  }));

  const modalAnimatedStyleVenue = useAnimatedStyle(() => ({
    transform: [{ translateY: translateYVenue.value }],
    opacity: modalOpacityVenue.value,
  }));

  // Modal animation effect - Producer
  React.useEffect(() => {
    if (showNewProducerModal) {
      // Animación slide + fade estilo iOS 16 con blur
      backdropOpacityProducer.value = withTiming(1, { duration: 400 });
      blurRadiusProducer.value = withTiming(1, { duration: 350 });
      modalOpacityProducer.value = withTiming(1, { duration: 300 });
      translateYProducer.value = withSpring(0, {
        damping: 30,
        stiffness: 400,
        mass: 1,
      });
    } else {
      // Animación de salida suave con fade
      backdropOpacityProducer.value = withTiming(0, { duration: 300 });
      blurRadiusProducer.value = withTiming(0, { duration: 200 });
      modalOpacityProducer.value = withTiming(0, { duration: 250 });
      translateYProducer.value = withSpring(height * 0.2, {
        damping: 25,
        stiffness: 500,
        mass: 0.8,
      });
    }
  }, [showNewProducerModal]);

  // Modal animation effect - Venue
  React.useEffect(() => {
    if (showNewVenueModal) {
      // Animación slide + fade estilo iOS 16 con blur
      backdropOpacityVenue.value = withTiming(1, { duration: 400 });
      blurRadiusVenue.value = withTiming(1, { duration: 350 });
      modalOpacityVenue.value = withTiming(1, { duration: 300 });
      translateYVenue.value = withSpring(0, {
        damping: 30,
        stiffness: 400,
        mass: 1,
      });
    } else {
      // Animación de salida suave con fade
      backdropOpacityVenue.value = withTiming(0, { duration: 300 });
      blurRadiusVenue.value = withTiming(0, { duration: 200 });
      modalOpacityVenue.value = withTiming(0, { duration: 250 });
      translateYVenue.value = withSpring(height * 0.2, {
        damping: 25,
        stiffness: 500,
        mass: 0.8,
      });
    }
  }, [showNewVenueModal]);

  const handleCreateProducer = () => {
    if (!newProducerForm.name || !newProducerForm.email || !newProducerForm.phoneNumber) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    // Here you would typically send the data to your API
    console.log('Creating producer:', newProducerForm);

    // Reset form and close modal
    setNewProducerForm({
      name: '',
      email: '',
      phonePrefix: '+57',
      phoneNumber: '',
      logo: ''
    });
    setShowNewProducerModal(false);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Éxito', 'Productor creado exitosamente');
  };

  const handleCloseModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(setShowNewProducerModal)(false);
    setNewProducerForm({
      name: '',
      email: '',
      phonePrefix: '+57',
      phoneNumber: '',
      logo: ''
    });
  };

  const handleCreateVenue = () => {
    if (!newVenueForm.name || !newVenueForm.city) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    // Here you would typically send the data to your API
    console.log('Creating venue:', newVenueForm);

    // Reset form and close modal
    setNewVenueForm({
      name: '',
      city: '',
      logo: '',
      googleMapsLink: ''
    });
    setShowNewVenueModal(false);

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Éxito', 'Venue creado exitosamente');
  };

  const handleCloseVenueModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(setShowNewVenueModal)(false);
    setNewVenueForm({
      name: '',
      city: '',
      logo: '',
      googleMapsLink: ''
    });
  };

  const styles = createStyles(theme, insets);

  // Render profiles list based on selected filter
  const renderProfilesList = () => {
    if (selectedFilter === 'venues') {
      // Venues Section using real API data
      if (loadingVenues) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Cargando venues...</Text>
          </View>
        );
      }

      if (venues.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="business-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyTitle}>No hay venues</Text>
            <Text style={styles.emptySubtitle}>Crea tu primer venue</Text>
          </View>
        );
      }

      return venues.map((venue) => (
        <TouchableOpacity
          key={venue.id}
          style={styles.profileCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/mis-perfiles/${venue.id}`);
          }}
          activeOpacity={0.8}
        >
          <BlurView
            intensity={40}
            tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.venueCardContent}>
            <View style={styles.venueRow}>
              <View style={styles.productorAvatarContainer}>
                {venue.logo ? (
                  <Image
                    source={{ uri: venue.logo }}
                    style={styles.venueAvatar}
                    onError={() => {
                      console.log('Failed to load venue logo:', venue.logo);
                    }}
                  />
                ) : (
                  <View style={[styles.venueAvatar, styles.productorAvatarFallback]}>
                    <Ionicons name="business" size={28} color="rgba(255, 255, 255, 0.6)" />
                  </View>
                )}
              </View>
              <Text style={styles.venueName}>{venue.name}</Text>
              <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.4)" />
            </View>
          </View>
        </TouchableOpacity>
      ));
    }

    if (selectedFilter === 'productores') {
      // Producers Section using real API data
      if (loadingProducers) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Cargando productores...</Text>
          </View>
        );
      }

      if (producers.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyTitle}>No hay productores</Text>
            <Text style={styles.emptySubtitle}>Crea tu primer productor</Text>
          </View>
        );
      }

      return producers.map((producer) => (
        <TouchableOpacity
          key={producer.id}
          style={styles.profileCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/mis-perfiles/${producer.id}`);
          }}
          activeOpacity={0.8}
        >
          <BlurView
            intensity={40}
            tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.productorCardContent}>
            <View style={styles.productorRow}>
              <View style={styles.productorAvatarContainer}>
                {producer.logo ? (
                  <Image
                    source={{ uri: producer.logo }}
                    style={styles.productorAvatar}
                    onError={() => {
                      console.log('Failed to load producer logo:', producer.logo);
                    }}
                  />
                ) : (
                  <View style={[styles.productorAvatar, styles.productorAvatarFallback]}>
                    <Ionicons name="business" size={28} color="rgba(255, 255, 255, 0.6)" />
                  </View>
                )}
              </View>
              <Text style={styles.productorName}>{producer.name}</Text>
              <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.4)" />
            </View>
          </View>
        </TouchableOpacity>
      ));
    }

    if (selectedFilter === 'artistas') {
      // Artists Section using real API data
      if (loadingArtists) {
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#ffffff" />
            <Text style={styles.loadingText}>Cargando artistas...</Text>
          </View>
        );
      }

      if (artists.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="musical-note-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyTitle}>No hay artistas</Text>
            <Text style={styles.emptySubtitle}>Crea tu primer artista</Text>
          </View>
        );
      }

      return artists.map((artist) => (
        <TouchableOpacity
          key={artist.id}
          style={styles.profileCard}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push(`/mis-perfiles/${artist.id}`);
          }}
          activeOpacity={0.8}
        >
          <BlurView
            intensity={40}
            tint={theme.isDark ? "systemThinMaterialDark" : "systemThinMaterialLight"}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.artistaCardContent}>
            <View style={styles.artistaRow}>
              <View style={styles.productorAvatarContainer}>
                {artist.logo ? (
                  <Image
                    source={{ uri: artist.logo }}
                    style={styles.artistaAvatar}
                    onError={() => {
                      console.log('Failed to load artist logo:', artist.logo);
                    }}
                  />
                ) : (
                  <View style={[styles.artistaAvatar, styles.productorAvatarFallback]}>
                    <Ionicons name="musical-note" size={28} color="rgba(255, 255, 255, 0.6)" />
                  </View>
                )}
              </View>
              <Text style={styles.artistaName}>{artist.name}</Text>
              <Ionicons name="chevron-forward" size={24} color="rgba(255, 255, 255, 0.4)" />
            </View>
          </View>
        </TouchableOpacity>
      ));
    }

    // No other filters - all sections (venues, productores, artistas) are handled above
    return null;
  };

  // No general loading needed since each section handles its own loading state

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
      >
        {/* Filter Controls */}
        <View style={styles.filterContainer}>
          <SegmentedControl
            values={['Venues', 'Productores', 'Artistas']}
            selectedIndex={selectedFilterIndex}
            onChange={(event) => {
              const index = event.nativeEvent.selectedSegmentIndex;
              setSelectedFilterIndex(index);
              const filters = ['venues', 'productores', 'artistas'];
              setSelectedFilter(filters[index]);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.segmentedControl}
          />
        </View>

        {/* Create Profile Button */}
        <TouchableOpacity style={styles.createButton} onPress={handleCreateProfile}>
          <View style={styles.createButtonContent}>
            <Ionicons name="add" size={18} color="#000000" />
            <Text style={styles.createButtonText}>
              {selectedFilter === 'venues' ? 'Nuevo Venue' :
               selectedFilter === 'productores' ? 'Nuevo Productor' :
               'Nuevo Artista'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Profiles List */}
        <View style={styles.profilesList}>
          {renderProfilesList()}
        </View>
      </ScrollView>

      {/* New Producer Modal - Slider Style */}
      <Modal transparent visible={showNewProducerModal} statusBarTranslucent>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyleProducer]}>
            <Animated.View style={[StyleSheet.absoluteFillObject, blurAnimatedStyleProducer]}>
              <BlurView
                intensity={15}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={handleCloseModal}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View style={[
            styles.modalContent,
            modalAnimatedStyleProducer,
            {
              height: height * 0.9,
              paddingBottom: insets.bottom + 20
            }
          ]}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Productor</Text>
            </View>

            {/* Form Content */}
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Name Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Nombre *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nombre del productor"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newProducerForm.name}
                  onChangeText={(text) => setNewProducerForm(prev => ({ ...prev, name: text }))}
                />
              </View>

              {/* Email Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Correo electrónico *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="contacto@productor.com"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newProducerForm.email}
                  onChangeText={(text) => setNewProducerForm(prev => ({ ...prev, email: text }))}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* Phone Fields */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Teléfono *</Text>
                <View style={styles.phoneContainer}>
                  <TextInput
                    style={[styles.textInput, styles.phonePrefix]}
                    placeholder="+57"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={newProducerForm.phonePrefix}
                    onChangeText={(text) => setNewProducerForm(prev => ({ ...prev, phonePrefix: text }))}
                    keyboardType="phone-pad"
                  />
                  <TextInput
                    style={[styles.textInput, styles.phoneNumber]}
                    placeholder="3001234567"
                    placeholderTextColor="rgba(255, 255, 255, 0.5)"
                    value={newProducerForm.phoneNumber}
                    onChangeText={(text) => setNewProducerForm(prev => ({ ...prev, phoneNumber: text }))}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>

              {/* Logo Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Logo</Text>
                <TouchableOpacity style={styles.logoUploadButton}>
                  <Ionicons name="camera-outline" size={24} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.logoUploadText}>Seleccionar logo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateProducer}
              >
                <Text style={styles.modalCreateButtonText}>Crear Productor</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* New Venue Modal - Slider Style */}
      <Modal transparent visible={showNewVenueModal} statusBarTranslucent>
        <View style={styles.modalContainer}>
          <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyleVenue]}>
            <Animated.View style={[StyleSheet.absoluteFillObject, blurAnimatedStyleVenue]}>
              <BlurView
                intensity={15}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={handleCloseVenueModal}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View style={[
            styles.modalContent,
            modalAnimatedStyleVenue,
            {
              height: height * 0.9,
              paddingBottom: insets.bottom + 20
            }
          ]}>
            {/* Handle */}
            <View style={styles.modalHandle} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nuevo Venue</Text>
            </View>

            {/* Form Content */}
            <ScrollView
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}
            >
              {/* Name Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Nombre *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nombre del venue"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newVenueForm.name}
                  onChangeText={(text) => setNewVenueForm(prev => ({ ...prev, name: text }))}
                />
              </View>

              {/* City Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Ciudad *</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Ciudad donde se encuentra"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newVenueForm.city}
                  onChangeText={(text) => setNewVenueForm(prev => ({ ...prev, city: text }))}
                />
              </View>

              {/* Google Maps Link Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Link de Google Maps</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="https://maps.google.com/..."
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={newVenueForm.googleMapsLink}
                  onChangeText={(text) => setNewVenueForm(prev => ({ ...prev, googleMapsLink: text }))}
                  keyboardType="url"
                  autoCapitalize="none"
                />
              </View>

              {/* Logo Field */}
              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Logo</Text>
                <TouchableOpacity style={styles.logoUploadButton}>
                  <Ionicons name="camera-outline" size={24} color="rgba(255, 255, 255, 0.7)" />
                  <Text style={styles.logoUploadText}>Seleccionar logo</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCloseVenueModal}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalCreateButton}
                onPress={handleCreateVenue}
              >
                <Text style={styles.modalCreateButtonText}>Crear Venue</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme, insets: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    marginTop: 20,
    fontWeight: '600',
    ...Typography.body,
  },
  scrollView: {
    flex: 1,
    paddingTop: insets.top + 80,
  },
  contentContainer: {
    paddingBottom: insets.bottom + 100,
  },
  filterContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  segmentedControl: {
    height: 36,
    width: '100%',
  },
  createButton: {
    marginHorizontal: 20,
    marginTop: 6,
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
  profilesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
  },
  profileCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  profileCardContent: {
    padding: 20,
  },
  productorCardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  artistaCardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  venueCardContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  productorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
  },
  productorAvatarContainer: {
    width: 56,
    height: 56,
  },
  productorAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  productorAvatarFallback: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  productorName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 16,
  },
  artistaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
  },
  artistaAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  artistaName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 16,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 72,
  },
  venueAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  venueInfo: {
    flex: 1,
    marginLeft: 0,
  },
  venueName: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 16,
  },
  venueLocation: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '400',
  },
  mapButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  avatarContainer: {
    // Simplified container without position relative
  },
  avatar: {
    width: 56,
    height: 56,
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
  profileLastActive: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  profileActions: {
    alignItems: 'flex-end',
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
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },

  // Modal Styles - Dark Theme Slider Style
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
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
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    ...Typography.title2,
    color: '#ffffff',
    marginBottom: 4,
    textAlign: 'center',
  },
  modalScrollView: {
    flex: 1,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  fieldLabel: {
    ...Typography.bodyMedium,
    color: '#ffffff',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  phoneContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  phonePrefix: {
    flex: 0.3,
  },
  phoneNumber: {
    flex: 0.7,
  },
  logoUploadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    width: '100%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  logoUploadText: {
    ...Typography.caption,
    color: 'rgba(255, 255, 255, 0.7)',
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    paddingTop: 20,
    gap: 12,
    marginBottom: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cancelButtonText: {
    ...Typography.bodyMedium,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  modalCreateButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCreateButtonText: {
    ...Typography.bodyMedium,
    color: '#000000',
  },
});