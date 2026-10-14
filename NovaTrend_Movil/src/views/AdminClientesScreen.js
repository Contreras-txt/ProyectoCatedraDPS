import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList,
  Platform, StatusBar, ActivityIndicator, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function AdminClientesScreen({ navigation }) {
  const [clientes, setClientes] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    setCargando(true);
    try {
      // Ajusta la IP si es necesario según tu configuración
      const response = await fetch('http://192.168.X.X/novatrend_api/admin/clientes');
      const data = await response.json();
      if (Array.isArray(data)) {
        setClientes(data);
      } else {
        setClientes([]);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los clientes.');
    } finally {
      setCargando(false);
    }
  };

  const estaBloqueado = (fechaBloqueo) => {
    if (!fechaBloqueo) return false;
    const bloqueadoHasta = new Date(fechaBloqueo);
    const ahora = new Date();
    return bloqueadoHasta > ahora;
  };

  const renderItem = ({ item }) => {
    const bloqueado = estaBloqueado(item.BloqueadoHasta);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientName} numberOfLines={1}>{item.Nombre} {item.Apellido}</Text>
            <Text style={styles.clientEmail} numberOfLines={1}>{item.Email}</Text>
          </View>
          <View style={styles.metricsBox}>
            <Text style={styles.metricsNumber}>{item.TotalPedidos}</Text>
            <Text style={styles.metricsLabel}>PEDIDOS</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={14} color="#888" style={styles.icon} />
            <Text style={styles.infoText}>{item.Telefono || 'Sin teléfono'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="location-outline" size={14} color="#888" style={styles.icon} />
            <Text style={styles.infoText}>
              {item.Ciudad ? `${item.Ciudad}, ${item.Departamento}` : 'Sin dirección registrada'}
            </Text>
          </View>
        </View>

        {bloqueado && (
          <View style={styles.blockedBadge}>
            <Ionicons name="lock-closed" size={12} color="#fff" style={{ marginRight: 5 }} />
            <Text style={styles.blockedText}>CUENTA BLOQUEADA TEMPORALMENTE</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GESTIÓN DE CLIENTES</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.summaryContainer}>
        <Text style={styles.summaryText}>TOTAL DE CLIENTES REGISTRADOS: <Text style={{ color: '#fff' }}>{clientes.length}</Text></Text>
      </View>

      {cargando ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>
      ) : (
        <FlatList
          data={clientes}
          keyExtractor={(item) => item.IDCliente.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="people-outline" size={50} color="#333" />
              <Text style={styles.emptyText}>No hay clientes registrados aún.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151515', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  backBtn: { width: 40 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  summaryContainer: { paddingHorizontal: 15, paddingVertical: 12, backgroundColor: '#111', borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  summaryText: { color: '#888', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#666', marginTop: 10, fontSize: 13, textAlign: 'center' },
  list: { padding: 15, paddingBottom: 40 },
  
  card: { backgroundColor: '#151515', borderRadius: 6, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#1f1f1f' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', borderBottomWidth: 1, borderBottomColor: '#222', paddingBottom: 12, marginBottom: 12 },
  clientName: { fontSize: 16, fontWeight: '900', color: '#fff', marginBottom: 4 },
  clientEmail: { fontSize: 12, color: '#aaa' },
  metricsBox: { backgroundColor: '#202020', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 4, alignItems: 'center', marginLeft: 10 },
  metricsNumber: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  metricsLabel: { color: '#777', fontSize: 8, fontWeight: 'bold', letterSpacing: 1, marginTop: 2 },
  
  cardBody: { paddingBottom: 5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  icon: { marginRight: 8, width: 16 },
  infoText: { color: '#bbb', fontSize: 12 },

  blockedBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#8a1c1c', marginTop: 12, paddingVertical: 8, borderRadius: 4 },
  blockedText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 }
});
