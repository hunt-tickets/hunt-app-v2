import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as Haptics from 'expo-haptics';
import { Typography, FontFamily } from '../constants/fonts';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LocationSelectorModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectLocation: (city: string) => void;
  currentLocation: string;
}

const POPULAR_CITIES = [
  { name: 'Medellín', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Bogotá', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Cali', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Cartagena', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Barranquilla', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Bucaramanga', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Pereira', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Santa Marta', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Manizales', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Ibagué', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Neiva', country: 'Colombia', icon: '🇨🇴' },
  { name: 'Villavicencio', country: 'Colombia', icon: '🇨🇴' },
];

export default function LocationSelectorModal({
  visible,
  onClose,
  onSelectLocation,
  currentLocation,
}: LocationSelectorModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const filteredCities = POPULAR_CITIES.filter(city =>
    city.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const detectAndUpdateLocation = async () => {
    try {
      setIsDetectingLocation(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos de ubicación',
          'Necesitamos permisos de ubicación para detectar tu ciudad actual.',
          [{ text: 'OK' }]
        );
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address.city || address.region) {
        const cityName = address.city || address.region || 'Ubicación actual';

        // Update location but keep modal open for user to confirm or change
        onSelectLocation(cityName);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Show success message but don't close modal
        Alert.alert(
          'Ubicación detectada',
          `Se detectó tu ubicación como ${cityName}. Puedes cambiarla si lo deseas o cerrar el modal.`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Ubicación no encontrada',
          'No pudimos identificar tu ciudad. Selecciona manualmente.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error detecting location:', error);
      Alert.alert(
        'Error de ubicación',
        'No pudimos detectar tu ubicación. Intenta seleccionar manualmente.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSelectCity = (cityName: string) => {
    Haptics.selectionAsync();
    onSelectLocation(cityName);
    onClose();
  };

  const handleClose = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSearchQuery('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <SafeAreaView style={styles.safeArea}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>Seleccionar ubicación</Text>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Ionicons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={20} color="#888888" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar ciudad..."
                  placeholderTextColor="#888888"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Ionicons name="close-circle" size={20} color="#888888" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Current Location Detection - Updates but doesn't close */}
            <View style={styles.currentLocationContainer}>
              <TouchableOpacity 
                style={styles.detectLocationButton} 
                onPress={detectAndUpdateLocation}
                disabled={isDetectingLocation}
              >
                <View style={styles.detectLocationContent}>
                  {isDetectingLocation ? (
                    <ActivityIndicator size="small" color="#00D68F" />
                  ) : (
                    <Ionicons name="location" size={22} color="#00D68F" />
                  )}
                  <View style={styles.detectLocationText}>
                    <Text style={styles.detectLocationTitle}>
                      {isDetectingLocation ? 'Detectando ubicación...' : 'Actualizar mi ubicación'}
                    </Text>
                    <Text style={styles.detectLocationSubtitle}>
                      {isDetectingLocation ? 'Obteniendo coordenadas' : 'Detectar ubicación actual'}
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#666666" />
              </TouchableOpacity>
            </View>

            {/* Cities List */}
            <ScrollView style={styles.citiesList} showsVerticalScrollIndicator={false}>
              <Text style={styles.sectionTitle}>Ciudades populares</Text>
              {filteredCities.map((city, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.cityItem,
                    currentLocation === city.name && styles.selectedCityItem
                  ]}
                  onPress={() => handleSelectCity(city.name)}
                >
                  <View style={styles.cityContent}>
                    <Text style={styles.cityIcon}>{city.icon}</Text>
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{city.name}</Text>
                      <Text style={styles.cityCountry}>{city.country}</Text>
                    </View>
                  </View>
                  {currentLocation === city.name ? (
                    <Ionicons name="checkmark-circle" size={24} color="#00D68F" />
                  ) : (
                    <Ionicons name="chevron-forward" size={20} color="#666666" />
                  )}
                </TouchableOpacity>
              ))}

              {filteredCities.length === 0 && searchQuery.length > 0 && (
                <View style={styles.noResultsContainer}>
                  <Ionicons name="search-outline" size={48} color="#333333" />
                  <Text style={styles.noResultsText}>
                    No encontramos "{searchQuery}"
                  </Text>
                  <Text style={styles.noResultsSubtext}>
                    Intenta con otra búsqueda
                  </Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    marginTop: 60,
    marginHorizontal: 16, // Added horizontal margins
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20, // Added bottom radius for margins
    borderBottomRightRadius: 20,
    marginBottom: 16, // Added bottom margin
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  title: {
    ...Typography.title3,
    color: '#ffffff',
  },
  closeButton: {
    width: 44,
    height: 44,
    backgroundColor: '#1a1a1a',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    borderColor: '#333333',
    gap: 8,
  },
  searchInput: {
    flex: 1,
    ...Typography.body,
    color: '#ffffff',
  },
  currentLocationContainer: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  detectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 8,
  },
  detectLocationContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detectLocationText: {
    flex: 1,
  },
  detectLocationTitle: {
    ...Typography.body,
    color: '#ffffff',
    marginBottom: 2,
  },
  detectLocationSubtitle: {
    ...Typography.caption,
    color: '#888888',
  },
  citiesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...Typography.subheadline,
    color: '#cccccc',
    marginBottom: 12,
    marginTop: 8,
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1f1f1f',
  },
  selectedCityItem: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: -20,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 4,
  },
  cityContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cityIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    ...Typography.body,
    color: '#ffffff',
    marginBottom: 2,
  },
  cityCountry: {
    ...Typography.caption,
    color: '#888888',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    ...Typography.body,
    color: '#ffffff',
    marginTop: 16,
    marginBottom: 4,
  },
  noResultsSubtext: {
    ...Typography.caption,
    color: '#888888',
  },
});