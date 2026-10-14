import React, { useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useCategories } from '../viewmodels/useCategories';

export default function CategoriesScreen({ navigation }) {
  const { categories, isLoading, getCategories } = useCategories();

  useFocusEffect(
    useCallback(() => {
      getCategories();
    }, [getCategories])
  );

  const renderCategory = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.categoryId}>ID: #{item.IDCategoria}</Text>
        <View style={[styles.badge, item.Seccion === 'Damas' ? styles.badgeDamas : (item.Seccion === 'Caballeros' ? styles.badgeCaballeros : styles.badgeNinos)]}>
          <Text style={styles.badgeText}>{item.Seccion}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.categoryName}>{item.NombreCategoria}</Text>
        <Text style={styles.categoryDesc} numberOfLines={2}>
          {item.Descripcion || 'Sin descripción disponible para esta categoría.'}
        </Text>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={styles.actionBtnEdit}
          onPress={() => navigation.navigate('NewCategoryScreen', { category: item })}
        >
          <Ionicons name="pencil" size={14} color="#000" style={{ marginRight: 4 }} />
          <Text style={styles.btnTextEdit}>EDITAR CATEGORÍA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>CATEGORÍAS</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate('NewCategoryScreen')}>
            <Ionicons name="add" size={16} color="#000" style={{ marginRight: 4 }} />
            <Text style={styles.newButtonText}>NUEVA</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.counterText}>Total: {categories.length} categorías registradas</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.IDCategoria.toString()}
          renderItem={renderCategory}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="albums-outline" size={50} color="#333" />
              <Text style={styles.emptyText}>No hay categorías registradas.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  headerContainer: { paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  backButton: { padding: 8, backgroundColor: '#222', borderRadius: 4, marginRight: 10 },
  newButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  newButtonText: { color: '#000000', fontWeight: 'bold', fontSize: 11 },
  
  infoContainer: { paddingHorizontal: 20, marginBottom: 15 },
  counterText: { color: '#777', fontSize: 12, fontWeight: 'bold' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },

  // Diseño de Tarjetas (Cards)
  card: { backgroundColor: '#151515', borderRadius: 10, borderWidth: 1, borderColor: '#222', marginBottom: 15, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingTop: 12, paddingBottom: 5 },
  categoryId: { color: '#666', fontSize: 11, fontWeight: 'bold' },
  
  badge: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 12 },
  badgeCaballeros: { backgroundColor: '#1a273b' },
  badgeDamas: { backgroundColor: '#3b1a2a' },
  badgeNinos: { backgroundColor: '#1a3b22' },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase' },
  
  cardBody: { paddingHorizontal: 15, paddingBottom: 15 },
  categoryName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  categoryDesc: { color: '#888', fontSize: 12, lineHeight: 18 },
  
  cardFooter: { borderTopWidth: 1, borderTopColor: '#222' },
  actionBtnEdit: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 12 },
  btnTextEdit: { color: "#000", fontSize: 11, fontWeight: "bold", letterSpacing: 1 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#555', marginTop: 10, fontSize: 14 }
});