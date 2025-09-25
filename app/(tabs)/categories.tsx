import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

export default function CategoriesScreen() {
  const categories = [
    {
      id: 1,
      name: 'Música',
      count: '12 eventos',
      icon: 'musical-notes',
      color: '#FF6B6B',
      image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=200&fit=crop',
    },
    {
      id: 2,
      name: 'Teatro',
      count: '8 eventos', 
      icon: 'library',
      color: '#4ECDC4',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
    },
    {
      id: 3,
      name: 'Arte',
      count: '15 eventos',
      icon: 'color-palette',
      color: '#45B7D1',
      image: 'https://images.unsplash.com/photo-1578321272176-b7bbc0679853?w=400&h=200&fit=crop',
    },
    {
      id: 4,
      name: 'Deporte',
      count: '6 eventos',
      icon: 'football',
      color: '#96CEB4',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop',
    },
    {
      id: 5,
      name: 'Comedia',
      count: '4 eventos',
      icon: 'happy',
      color: '#FFEAA7',
      image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    },
    {
      id: 6,
      name: 'Gastronomía',
      count: '7 eventos',
      icon: 'restaurant',
      color: '#DDA0DD',
      image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=200&fit=crop',
    },
  ];

  const handleCategoryPress = (category: any) => {
    router.push(`/(tabs)/search?category=${category.name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Categorías</Text>
        <Text style={styles.subtitle}>Explora eventos por tipo</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoriesGrid}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => handleCategoryPress(category)}
            >
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
              <View style={styles.categoryOverlay} />
              
              <View style={styles.categoryIcon}>
                <Ionicons name={category.icon as any} size={24} color="#ffffff" />
              </View>
              
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.count}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Featured Events */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Eventos Destacados</Text>
          <View style={styles.featuredCard}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&h=300&fit=crop' }}
              style={styles.featuredImage} 
            />
            <View style={styles.featuredOverlay} />
            <View style={styles.featuredContent}>
              <Text style={styles.featuredTitle}>Festival de Verano 2024</Text>
              <Text style={styles.featuredSubtitle}>Los mejores artistas nacionales</Text>
              <TouchableOpacity style={styles.featuredButton}>
                <Text style={styles.featuredButtonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Trending */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tendencias</Text>
          <View style={styles.trendingList}>
            {['Rock alternativo', 'Teatro independiente', 'Stand up', 'Arte contemporáneo'].map((trend, index) => (
              <TouchableOpacity key={index} style={styles.trendingItem}>
                <View style={styles.trendingIcon}>
                  <Text style={styles.trendingNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.trendingText}>{trend}</Text>
                <Ionicons name="trending-up" size={16} color="#4ECDC4" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#cccccc',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryCard: {
    width: '48%',
    height: 120,
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  categoryIcon: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryInfo: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 12,
    color: '#cccccc',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  featuredCard: {
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  featuredContent: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  featuredTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  featuredSubtitle: {
    fontSize: 14,
    color: '#cccccc',
    marginBottom: 12,
  },
  featuredButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  featuredButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  trendingList: {
    gap: 12,
  },
  trendingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  trendingIcon: {
    width: 28,
    height: 28,
    backgroundColor: '#4ECDC4',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  trendingNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  trendingText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
});