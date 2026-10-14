import React, { useContext } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Image } from 'react-native';
import { AlertContext } from '../context/AlertContext';

export default function AdminDashboardScreen({ navigation }) {
  // Consumo del sistema global de alertas
  const { showAlert } = useContext(AlertContext);

  const handleLogout = () => {
    showAlert({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir del panel de administración?',
      type: 'warning',
      theme: 'dark', // Aplicamos tema oscuro
      actions: [
        { text: 'CANCELAR', style: 'cancel' },
        { 
          text: 'SALIR', 
          style: 'destructive',
          onPress: () => {
            navigation.replace('Home');
          }
        }
      ]
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header con Logo y botón de salir */}
        <View style={styles.header}>
          <Image source={require('../../assets/2.png')} style={styles.logo} resizeMode="contain" />
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
          </TouchableOpacity>
        </View>
        
        {/* Tarjeta de Inventario */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INVENTARIO</Text>
          <Text style={styles.cardDescription}>Gestione los productos, existencias y precios del catálogo.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('InventoryScreen')}>
            <Text style={styles.actionButtonText}>GESTIONAR PRODUCTOS</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Categorías */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CATEGORÍAS</Text>
          <Text style={styles.cardDescription}>Administre las categorías del catálogo por sección y descripción.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('CategoriesScreen')}>
            <Text style={styles.actionButtonText}>GESTIONAR CATEGORÍAS</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Pedidos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PEDIDOS</Text>
          <Text style={styles.cardDescription}>Revise y actualice el estado de las órdenes de sus clientes.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdminPedidosScreen')}>
            <Text style={styles.actionButtonText}>VER ÓRDENES</Text>
          </TouchableOpacity>
        </View>

        {/* Tarjeta de Clientes */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>CLIENTES</Text>
          <Text style={styles.cardDescription}>Consulte el listado de clientes registrados y sus métricas de compra.</Text>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AdminClientesScreen')}>
            <Text style={styles.actionButtonText}>VER CLIENTES</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30, marginTop: 20 },
  logo: { width: 120, height: 40 },
  logoutButton: { padding: 8, backgroundColor: 'rgba(255, 68, 68, 0.1)', borderRadius: 4, borderWidth: 1, borderColor: 'rgba(255, 68, 68, 0.3)' },
  logoutText: { color: '#ff4444', fontSize: 11, fontWeight: 'bold' },
  card: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#252525', borderRadius: 10, padding: 25, marginBottom: 20, alignItems: 'center' },
  cardTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  cardDescription: { color: '#888', fontSize: 13, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  actionButton: { backgroundColor: '#ffffff', paddingVertical: 14, paddingHorizontal: 20, borderRadius: 6, width: '100%', alignItems: 'center' },
  actionButtonText: { color: '#000000', fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
});