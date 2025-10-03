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
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../constants/fonts';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { ApiService, UserProfile } from '../../lib/api';

export default function ProfileScreen() {
  const { session } = useAuth();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  // Always editable, no need for editing state
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfile | null>(null);
  const [editData, setEditData] = useState<Partial<UserProfile>>({});
  const [showPrefixModal, setShowPrefixModal] = useState(false);
  const [phonePrefix, setPhonePrefix] = useState('+57'); // Colombia default
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date(2000, 0, 1)); // Default date

  useEffect(() => {
    loadProfile();
  }, []);

  useEffect(() => {
    // Update selected date when profile data loads
    if (profileData?.birthdate) {
      try {
        const date = new Date(profileData.birthdate);
        if (!isNaN(date.getTime())) {
          setSelectedDate(date);
        }
      } catch (error) {
        console.log('Invalid birthdate format');
      }
    }
  }, [profileData?.birthdate]);

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

  // Auto-save on field change
  const handleFieldChange = (field: string, value: string) => {
    const newData = { ...editData, [field]: value };
    setEditData(newData);
    setProfileData(newData as UserProfile);
    // TODO: Implement debounced API save
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setSelectedDate(currentDate);
      const formattedDate = currentDate.toISOString().split('T')[0]; // YYYY-MM-DD format
      handleFieldChange('birthdate', formattedDate);
    }
  };

  const handleDateConfirm = () => {
    setShowDatePicker(false);
    const formattedDate = selectedDate.toISOString().split('T')[0];
    handleFieldChange('birthdate', formattedDate);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const formatDisplayDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      return date.toLocaleDateString('es-CO', options);
    } catch {
      return dateString;
    }
  };


  const ProfileField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', editable = true }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View style={[styles.fieldInputContainer, {
        backgroundColor: editable ? theme.colors.surface : 'rgba(128, 128, 128, 0.1)',
        borderColor: theme.colors.border,
      }]}>
        <TextInput
          style={[styles.fieldInput, {
            color: editable ? theme.colors.text : theme.colors.textSecondary,
          }]}
          value={value || ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType={keyboardType}
          editable={editable}
          selectTextOnFocus={editable}
        />
        {!editable && (
          <Ionicons name="lock-closed" size={16} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
        )}
      </View>
    </View>
  );

  const PhoneField = ({ label, value, onChangeText, placeholder }: any) => (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
        {label}
      </Text>
      <View style={[styles.phoneInputContainer, {
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
      }]}>
        <TouchableOpacity
          style={[styles.prefixButton, { borderRightColor: theme.colors.border }]}
          onPress={() => setShowPrefixModal(true)}
        >
          <Text style={[styles.prefixText, { color: theme.colors.text }]}>
            {phonePrefix}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.colors.textSecondary} />
        </TouchableOpacity>
        <TextInput
          style={[styles.phoneInput, {
            color: theme.colors.text,
          }]}
          value={value || ''}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          keyboardType="phone-pad"
          editable={true}
          selectTextOnFocus={true}
        />
      </View>
    </View>
  );

  const countryPrefixes = [
    { code: 'CO', prefix: '+57', name: 'Colombia' },
    { code: 'US', prefix: '+1', name: 'Estados Unidos' },
    { code: 'MX', prefix: '+52', name: 'México' },
    { code: 'ES', prefix: '+34', name: 'España' },
    { code: 'AR', prefix: '+54', name: 'Argentina' },
    { code: 'BR', prefix: '+55', name: 'Brasil' },
    { code: 'CL', prefix: '+56', name: 'Chile' },
    { code: 'PE', prefix: '+51', name: 'Perú' },
    { code: 'EC', prefix: '+593', name: 'Ecuador' },
    { code: 'VE', prefix: '+58', name: 'Venezuela' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, Typography.body, { color: theme.colors.text }]}>
              Cargando perfil...
            </Text>
          </View>
        ) : profileData ? (
          <>
            {/* Simplified Profile Header */}
            <View style={styles.profileSection}>
              <View style={styles.avatarContainer}>
                <View style={[styles.avatar, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.avatarText, { color: theme.colors.text }]}>
                    {profileData?.name?.charAt(0)}{profileData?.lastName?.charAt(0)}
                  </Text>
                </View>
              </View>
              <Text style={[styles.userName, { color: theme.colors.text }]}>
                {profileData?.name} {profileData?.lastName}
              </Text>
              <Text style={[styles.userEmail, { color: theme.colors.textSecondary }]}>
                {profileData?.email}
              </Text>
            </View>

            {/* Profile Fields */}
            <View style={styles.fieldsSection}>
              <ProfileField
                label="Nombre"
                value={editData.name || profileData.name}
                onChangeText={(text: string) => handleFieldChange('name', text)}
                placeholder="Tu nombre"
              />

              <ProfileField
                label="Apellido"
                value={editData.lastName || profileData.lastName}
                onChangeText={(text: string) => handleFieldChange('lastName', text)}
                placeholder="Tu apellido"
              />

              <ProfileField
                label="Correo electrónico"
                value={profileData.email}
                onChangeText={() => {}}
                placeholder="tu@email.com"
                keyboardType="email-address"
                editable={false}
              />

              <PhoneField
                label="Teléfono"
                value={editData.phone || profileData.phone}
                onChangeText={(text: string) => handleFieldChange('phone', text)}
                placeholder="300 123 4567"
              />

              <View style={styles.fieldContainer}>
                <Text style={[styles.fieldLabel, { color: theme.colors.textSecondary }]}>
                  Fecha de nacimiento
                </Text>
                <TouchableOpacity
                  style={[styles.dateInputContainer, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.border,
                  }]}
                  onPress={() => {
                    setShowDatePicker(true);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.dateText, {
                    color: (editData.birthdate || profileData.birthdate) ? theme.colors.text : theme.colors.textSecondary
                  }]}>
                    {formatDisplayDate(editData.birthdate || profileData.birthdate) || 'Selecciona tu fecha de nacimiento'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

          </>
        ) : null}
      </ScrollView>

      {/* Prefix Selection Modal */}
      <Modal
        visible={showPrefixModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowPrefixModal(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowPrefixModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Selecciona un prefijo</Text>
              <TouchableOpacity onPress={() => setShowPrefixModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={countryPrefixes}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.prefixItem, { borderBottomColor: theme.colors.border }]}
                  onPress={() => {
                    setPhonePrefix(item.prefix);
                    setShowPrefixModal(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.prefixItemCode, { color: theme.colors.text }]}>
                    {item.prefix}
                  </Text>
                  <Text style={[styles.prefixItemName, { color: theme.colors.textSecondary }]}>
                    {item.name}
                  </Text>
                  {phonePrefix === item.prefix && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </Pressable>
      </Modal>

      {/* Native Date Picker Modal */}
      {Platform.OS === 'ios' && showDatePicker && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable
            style={styles.modalBackdrop}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable style={[styles.datePickerModal, { backgroundColor: theme.colors.background }]}>
              {/* iOS Style Header */}
              <View style={[styles.datePickerHeader, { borderBottomColor: theme.colors.border }]}>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text style={[styles.headerButton, { color: theme.colors.textSecondary }]}>Cancelar</Text>
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Fecha de nacimiento</Text>

                <TouchableOpacity onPress={handleDateConfirm}>
                  <Text style={[styles.headerButton, { color: theme.colors.primary, fontWeight: '600' }]}>Listo</Text>
                </TouchableOpacity>
              </View>

              {/* Date Picker */}
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="spinner"
                onChange={handleDateChange}
                maximumDate={new Date()}
                minimumDate={new Date(1900, 0, 1)}
                locale="es"
                style={{ height: 220 }}
                textColor={theme.colors.text}
              />
            </Pressable>
          </Pressable>
        </Modal>
      )}

      {/* Android Date Picker */}
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
          minimumDate={new Date(1900, 0, 1)}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: 100, // Space for native header
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
  },
  userName: {
    ...Typography.title2,
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  userEmail: {
    ...Typography.body,
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.6,
  },
  fieldsSection: {
    paddingBottom: 32,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  fieldLabel: {
    ...Typography.caption,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  fieldInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  fieldInput: {
    ...Typography.body,
    fontSize: 17,
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  // Phone field with prefix
  phoneInputContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  prefixButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRightWidth: 1,
    gap: 8,
  },
  prefixText: {
    ...Typography.body,
    fontSize: 17,
    fontWeight: '600',
  },
  phoneInput: {
    ...Typography.body,
    fontSize: 17,
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...Typography.title2,
    fontSize: 20,
    fontWeight: '600',
  },
  prefixItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  prefixItemCode: {
    ...Typography.body,
    fontSize: 17,
    fontWeight: '600',
    minWidth: 60,
  },
  prefixItemName: {
    ...Typography.body,
    fontSize: 17,
    flex: 1,
    marginLeft: 16,
  },
  // Date picker styles
  dateInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dateText: {
    ...Typography.body,
    fontSize: 17,
    flex: 1,
  },
  // Date picker modal styles
  datePickerModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    ...Typography.body,
    fontSize: 17,
  },
  headerTitle: {
    ...Typography.title3,
    fontSize: 17,
    fontWeight: '600',
  },
});