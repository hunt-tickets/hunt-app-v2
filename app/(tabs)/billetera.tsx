import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from '../../constants/fonts';
import { useTheme, Theme } from '../../contexts/ThemeContext';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';

const { height } = Dimensions.get('window');

export default function BilleteraScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<'entradas' | 'cashless'>('entradas');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [transactionTab, setTransactionTab] = useState<'todas' | 'recargas' | 'pagos' | 'retiros'>('todas');
  const [transactionSelectedIndex, setTransactionSelectedIndex] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const insets = useSafeAreaInsets();

  // QR Modal animations
  const translateY = useSharedValue(height);
  const backdropOpacity = useSharedValue(0);
  const modalOpacity = useSharedValue(0);
  const blurRadius = useSharedValue(0);

  React.useEffect(() => {
    if (qrModalVisible) {
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
  }, [qrModalVisible]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const handleTabPress = (tab: 'entradas' | 'cashless') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  const handleSegmentChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setSelectedIndex(index);
    setActiveTab(index === 0 ? 'entradas' : 'cashless');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTransactionSegmentChange = (event: any) => {
    const index = event.nativeEvent.selectedSegmentIndex;
    setTransactionSelectedIndex(index);
    setTransactionTab(
      index === 0 ? 'todas' :
      index === 1 ? 'recargas' :
      index === 2 ? 'pagos' : 'retiros'
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleCloseQR = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    runOnJS(setQrModalVisible)(false);
  };

  // Mock data para entradas
  const entradas = [
    {
      id: 1,
      evento: 'MARÍA HELENA AMADOR',
      fecha: '29 Sep 2024',
      ubicacion: 'Gimnasio Moderno',
      precio: '$150.000',
      estado: 'activo',
    },
    {
      id: 2,
      evento: 'INSIDE PRESENTA',
      fecha: '20 Sep 2024',
      ubicacion: 'Teatro Nacional',
      precio: '$85.000',
      estado: 'usado',
    },
    {
      id: 3,
      evento: 'FESTIVAL DE MÚSICA',
      fecha: '15 Oct 2024',
      ubicacion: 'Parque Central',
      precio: '$200.000',
      estado: 'activo',
    },
  ];

  // Mock data para transacciones
  const todasTransacciones = [
    {
      id: 1,
      tipo: 'recarga',
      monto: '+$50.000',
      descripcion: 'Recarga desde tarjeta',
      fecha: '28 Sep 2024',
    },
    {
      id: 2,
      tipo: 'compra',
      monto: '-$12.000',
      descripcion: 'Compra en Food Truck',
      fecha: '28 Sep 2024',
    },
    {
      id: 3,
      tipo: 'compra',
      monto: '-$8.500',
      descripcion: 'Bebida en Bar Principal',
      fecha: '28 Sep 2024',
    },
    {
      id: 4,
      tipo: 'transferencia',
      monto: '-$25.000',
      descripcion: 'Transferencia a Luis',
      fecha: '27 Sep 2024',
    },
  ];

  const recargas = [
    {
      id: 1,
      tipo: 'recarga',
      monto: '+$50.000',
      descripcion: 'Recarga desde tarjeta',
      fecha: '28 Sep 2024',
    },
    {
      id: 2,
      tipo: 'recarga',
      monto: '+$100.000',
      descripcion: 'Recarga desde banco',
      fecha: '25 Sep 2024',
    },
    {
      id: 3,
      tipo: 'recarga',
      monto: '+$30.000',
      descripcion: 'Recarga desde efectivo',
      fecha: '22 Sep 2024',
    },
  ];

  const pagos = [
    {
      id: 1,
      tipo: 'pago',
      monto: '-$12.000',
      descripcion: 'Compra en Food Truck',
      fecha: '28 Sep 2024',
    },
    {
      id: 2,
      tipo: 'pago',
      monto: '-$8.500',
      descripcion: 'Bebida en Bar Principal',
      fecha: '28 Sep 2024',
    },
    {
      id: 3,
      tipo: 'pago',
      monto: '-$35.000',
      descripcion: 'Entrada concierto',
      fecha: '25 Sep 2024',
    },
  ];

  const retiros = [
    {
      id: 1,
      tipo: 'retiro',
      monto: '-$100.000',
      descripcion: 'Retiro a cuenta bancaria',
      fecha: '26 Sep 2024',
    },
    {
      id: 2,
      tipo: 'retiro',
      monto: '-$50.000',
      descripcion: 'Retiro en efectivo',
      fecha: '23 Sep 2024',
    },
    {
      id: 3,
      tipo: 'retiro',
      monto: '-$75.000',
      descripcion: 'Retiro a PayPal',
      fecha: '20 Sep 2024',
    },
  ];

  const saldoCashless = 59500;
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      <StatusBar style={theme.isDark ? "light" : "dark"} />

      {/* Header with Gradient Overlay */}
      <View style={[styles.headerOverlay, { paddingTop: insets.top + 20 }]}>
        <LinearGradient
          colors={theme.colors.gradientOverlay}
          locations={[0, 0.7, 1]}
          style={StyleSheet.absoluteFillObject}
        />
        <View style={styles.headerContent}>
          <Text style={styles.title}>Billetera</Text>

          {/* Native iOS Segmented Control */}
          <SegmentedControl
            values={['Entradas', 'Cashless']}
            selectedIndex={selectedIndex}
            onChange={handleSegmentChange}
            style={styles.segmentedControl}
          />
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ffffff"
          />
        }
      >
        {activeTab === 'entradas' ? (
          <View style={styles.entradasContent}>
            {entradas.map((entrada) => (
              <TouchableOpacity key={entrada.id} style={styles.entradaCardWrapper}>
                <LinearGradient
                  colors={['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.02)']}
                  style={styles.entradaCardGradient}
                >
                  <BlurView intensity={15} tint="dark" style={styles.entradaCard}>
                    {/* Imagen con glass effect */}
                    <View style={styles.entradaImageContainer}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                        style={styles.entradaImageGradient}
                      >
                        <Ionicons name="image" size={32} color="#888888" />
                      </LinearGradient>
                      {entrada.estado === 'activo' && (
                        <View style={styles.statusBadge}>
                          <BlurView intensity={20} tint="dark" style={styles.statusBadgeBlur}>
                            <Text style={styles.statusBadgeText}>ACTIVO</Text>
                          </BlurView>
                        </View>
                      )}
                    </View>

                    {/* Info con glass styling */}
                    <View style={styles.entradaInfo}>
                      <Text style={styles.entradaEvento} numberOfLines={2}>{entrada.evento}</Text>
                      <Text style={styles.entradaFecha}>{entrada.fecha}</Text>
                      <Text style={styles.entradaUbicacion} numberOfLines={1}>{entrada.ubicacion}</Text>
                      <Text style={styles.entradaPrecio}>{entrada.precio}</Text>
                    </View>
                  </BlurView>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.cashlessContent}>
            {/* Saldo Box Rediseñado */}
            <View style={styles.saldoCard}>
              {/* Badge de Puntos */}
              <View style={styles.pointsBadge}>
                <Ionicons name="star" size={12} color="#ffffff" />
                <Text style={styles.pointsText}>2,450</Text>
              </View>

              {/* Header del Saldo */}
              <View style={styles.saldoHeader}>
                <View style={styles.saldoIcon}>
                  <Ionicons name="wallet" size={20} color="#ffffff" />
                </View>
                <View style={styles.saldoInfo}>
                  <Text style={styles.saldoLabel}>Saldo disponible</Text>
                  <Text style={styles.saldoMonto}>${saldoCashless.toLocaleString()}</Text>
                </View>
              </View>

              {/* Botones principales del saldo */}
              <View style={styles.mainButtonsRow}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    console.log('Recargar pressed');
                  }}
                >
                  <Ionicons name="add" size={18} color={theme.colors.background} />
                  <Text style={styles.actionButtonText}>Recargar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    console.log('Transferir pressed');
                  }}
                >
                  <Ionicons name="swap-horizontal" size={18} color={theme.colors.background} />
                  <Text style={styles.actionButtonText}>Transferir</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Boxes de acciones adicionales */}
            <View style={styles.additionalActionsGrid}>
              <TouchableOpacity
                style={styles.additionalActionBox}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setQrModalVisible(true);
                }}
              >
                <View style={styles.additionalActionIcon}>
                  <Ionicons name="qr-code" size={24} color={theme.colors.text} />
                </View>
                <Text style={styles.additionalActionTitle}>Ver QR</Text>
                <Text style={styles.additionalActionSubtitle}>Código personal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.additionalActionBox}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  console.log('Conectar manilla pressed');
                }}
              >
                <View style={styles.additionalActionIcon}>
                  <Ionicons name="watch" size={24} color={theme.colors.text} />
                </View>
                <Text style={styles.additionalActionTitle}>Manillas</Text>
                <Text style={styles.additionalActionSubtitle}>Conectar dispositivo</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.additionalActionBox}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  console.log('Add to Apple Wallet');
                }}
              >
                <View style={styles.additionalActionIcon}>
                  <Ionicons name="wallet" size={24} color={theme.colors.text} />
                </View>
                <Text style={styles.additionalActionTitle}>Apple Wallet</Text>
                <Text style={styles.additionalActionSubtitle}>Añadir tarjeta</Text>
              </TouchableOpacity>
            </View>

            {/* Transacciones con tabs */}
            <View style={styles.transaccionesSection}>
              <View style={styles.transaccionesHeader}>
                <SegmentedControl
                  values={['Todas', 'Recargas', 'Pagos', 'Retiros']}
                  selectedIndex={transactionSelectedIndex}
                  onChange={handleTransactionSegmentChange}
                  style={styles.transactionSegmentedControl}
                />
              </View>

              {/* Renderizar transacciones según el tab seleccionado */}
              {(transactionTab === 'todas' ? todasTransacciones :
                transactionTab === 'recargas' ? recargas :
                transactionTab === 'pagos' ? pagos : retiros)
                .map((transaccion) => (
                <View key={transaccion.id} style={styles.transaccionItem}>
                  <View style={styles.transaccionIcon}>
                    <Ionicons
                      name={
                        transaccion.tipo === 'recarga' ? 'add' :
                        transaccion.tipo === 'pago' ? 'card' :
                        transaccion.tipo === 'retiro' ? 'remove' :
                        transaccion.tipo === 'transferencia' ? 'swap-horizontal' : 'remove'
                      }
                      size={20}
                      color={theme.colors.text}
                    />
                  </View>
                  <View style={styles.transaccionInfo}>
                    <Text style={styles.transaccionDescripcion}>{transaccion.descripcion}</Text>
                    <Text style={styles.transaccionFecha}>{transaccion.fecha}</Text>
                  </View>
                  <Text style={styles.transaccionMonto}>{transaccion.monto}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* QR Modal - Bottom Sheet Style */}
      <Modal transparent visible={qrModalVisible} statusBarTranslucent>
        <View style={styles.qrModalContainer}>
          <Animated.View style={[styles.qrBackdrop, useAnimatedStyle(() => ({ opacity: backdropOpacity.value }))]}>
            <Animated.View style={[StyleSheet.absoluteFillObject, useAnimatedStyle(() => ({ opacity: blurRadius.value }))]}>
              <BlurView
                intensity={15}
                tint="dark"
                style={StyleSheet.absoluteFillObject}
              />
            </Animated.View>
            <TouchableOpacity
              style={StyleSheet.absoluteFillObject}
              onPress={handleCloseQR}
              activeOpacity={1}
            />
          </Animated.View>

          <Animated.View style={[
            styles.qrModalContent,
            useAnimatedStyle(() => ({
              transform: [{ translateY: translateY.value }],
              opacity: modalOpacity.value,
            })),
            { paddingBottom: insets.bottom + 20 }
          ]}>
            {/* Handle */}
            <View style={styles.qrHandle} />

            {/* Content Container */}
            <View style={styles.qrContent}>
              {/* User Info Header */}
              <View style={styles.qrUserHeader}>
                <View style={styles.qrProfileSection}>
                  <View style={styles.qrUserAvatar}>
                    <Text style={styles.qrUserInitials}>LF</Text>
                  </View>
                  <View style={styles.qrUserDetails}>
                    <Text style={styles.qrUserName}>Luis Fernández</Text>
                    <Text style={styles.qrUserSubtext}>ID: LF-2024-8753</Text>
                  </View>
                </View>
              </View>

              {/* QR Code Container */}
              <View style={styles.qrMainContainer}>
                <View style={styles.qrCodeContainer}>
                  <QRCode
                    value={JSON.stringify({
                      userId: 'LF-2024-8753',
                      name: 'Luis Fernández',
                      type: 'transfer',
                      timestamp: Date.now()
                    })}
                    size={200}
                    color="#1a1a1a"
                    backgroundColor="#ffffff"
                    logoSize={40}
                    logoBackgroundColor="transparent"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.qrActions}>
                <TouchableOpacity style={styles.qrActionButton}>
                  <View style={styles.qrActionIcon}>
                    <Ionicons name="share-outline" size={20} color="#007AFF" />
                  </View>
                  <Text style={styles.qrActionText}>Compartir</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.qrActionButton}>
                  <View style={styles.qrActionIcon}>
                    <Ionicons name="download-outline" size={20} color="#007AFF" />
                  </View>
                  <Text style={styles.qrActionText}>Guardar</Text>
                </TouchableOpacity>
              </View>

              {/* Instructions */}
              <Text style={styles.qrInstructionsText}>
                Usa este código para recibir transferencias o identificarte en eventos
              </Text>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },

  // Header overlay like home screen
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
    height: 140,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 1,
  },
  title: {
    ...Typography.title1,
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text,
  },

  // Native iOS Segmented Control
  segmentedControl: {
    width: 180,
    height: 36,
  },

  content: {
    flex: 1,
    paddingTop: 140, // Increased padding to prevent overlap
  },

  // iOS 26 Entradas Glass Cards
  entradasContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  entradaCardWrapper: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  entradaCardGradient: {
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  entradaCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  entradaImageContainer: {
    height: 100,
    position: 'relative',
    overflow: 'hidden',
  },
  entradaImageGradient: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  statusBadgeBlur: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 255, 135, 0.3)',
    overflow: 'hidden',
  },
  statusBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#00FF87',
    letterSpacing: 0.5,
  },
  entradaInfo: {
    padding: 16,
  },
  entradaEvento: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
    lineHeight: 18,
  },
  entradaFecha: {
    fontSize: 12,
    color: '#cccccc',
    marginBottom: 4,
    fontWeight: '500',
  },
  entradaUbicacion: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 10,
    fontWeight: '500',
  },
  entradaPrecio: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },

  // iOS 26 Cashless Glass
  cashlessContent: {
    paddingHorizontal: 16,
  },
  saldoCard: {
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  // Nuevo diseño del saldo
  pointsBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    zIndex: 1,
  },
  pointsText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  saldoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  saldoIcon: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.card,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  saldoInfo: {
    flex: 1,
  },
  saldoLabel: {
    fontSize: 15,
    color: '#ffffff',
    marginBottom: 4,
    fontWeight: '400',
    opacity: 0.8,
  },
  saldoMonto: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: -0.8,
    marginBottom: 2,
  },
  saldoId: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '400',
    opacity: 0.6,
  },
  mainButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    gap: 6,
    backgroundColor: '#ffffff',
    borderWidth: 0,
    minHeight: 60,
  },
  actionButtonText: {
    color: theme.colors.background,
    fontSize: 12,
    fontWeight: '600',
  },

  // Additional Actions Grid
  additionalActionsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  additionalActionBox: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  additionalActionIcon: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.card,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  additionalActionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  additionalActionSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    textAlign: 'center',
  },

  // iOS 26 Transacciones Glass
  transaccionesSection: {
    marginBottom: 40,
  },
  transaccionesHeader: {
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  transactionSegmentedControl: {
    width: '100%',
    height: 36,
  },
  transaccionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: 20,
    borderRadius: 20,
    marginBottom: 12,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  transaccionIcon: {
    width: 44,
    height: 44,
    backgroundColor: theme.colors.card,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 0.5,
    borderColor: theme.colors.border,
  },
  transaccionInfo: {
    flex: 1,
  },
  transaccionDescripcion: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 22,
  },
  transaccionFecha: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    fontWeight: '400',
    lineHeight: 20,
  },
  transaccionMonto: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.colors.text,
    letterSpacing: -0.2,
  },

  // QR Modal Styles - Bottom Sheet Style
  qrModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  qrBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  qrModalContent: {
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
    height: height * 0.75,
  },
  qrHandle: {
    width: 36,
    height: 4,
    backgroundColor: '#e5e5e5',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  qrContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  qrUserHeader: {
    marginBottom: 20,
  },
  qrProfileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  qrUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  qrUserInitials: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  qrUserDetails: {
    flex: 1,
  },
  qrUserName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  qrUserSubtext: {
    fontSize: 13,
    color: '#666666',
    fontWeight: '500',
  },
  qrMainContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  qrCodeContainer: {
    width: 240,
    height: 240,
    backgroundColor: '#ffffff',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    padding: 20,
  },
  qrActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  qrActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    gap: 8,
  },
  qrActionIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qrActionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#007AFF',
  },
  qrInstructionsText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
    marginBottom: 20,
  },
});