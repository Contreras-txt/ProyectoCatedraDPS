import React, { useState, useEffect, useContext } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList,
  Platform, StatusBar, ActivityIndicator, RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { AlertContext } from '../context/AlertContext'; // Importamos contexto de alertas
import { apiPost } from '../config/api';

export default function MisPedidosScreen({ navigation }) {
  const { userSession } = useContext(CartContext);
  const { showToast } = useContext(AlertContext); // Para mostrar errores locales

  const [ordenes, setOrdenes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Estado para el pull-to-refresh

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setCargando(true);

    try {
      const res = await apiPost('/perfil', {
        idCliente: userSession.id,
        token: userSession.token
      });
      setOrdenes(res.data.ordenes || []);
    } catch (error) {
      // Si el error es NETWORK_ERROR o SESSION_EXPIRED, la API ya disparó la alerta global.
      // Solo mostramos un toast local si es otro tipo de error.
      if (error.message !== 'NETWORK_ERROR' && error.message !== 'SESSION_EXPIRED') {
        showToast({ message: error.message || 'No se pudieron cargar los pedidos', type: 'danger' });
      }
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => cargarPedidos(true);

  const formatearFecha = (fechaDb) => {
    const d = new Date(fechaDb);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getColorEstado = (estado) => {
    switch (estado) {
      case 'Aprobada': return '#2980b9';
      case 'Entregada': return '#27ae60';
      case 'Cancelada': return '#c0392b';
      default: return '#f39c12';
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card} 
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetallePedidoScreen', { orden: item })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>ORDEN #{item.IDOrden}</Text>
        <View style={[styles.badge, { backgroundColor: getColorEstado(item.EstadoOrden) }]}>
          <Text style={styles.badgeText}>{item.EstadoOrden.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.cardBody}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>FECHA</Text>
          <Text style={styles.value}>{formatearFecha(item.FechaPedido)}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>MÉTODO</Text>
          <Text style={styles.value}>
             {item.detalle && item.detalle[0] && item.detalle[0].Metodo_Pago === 'Contra_Entrega' ? 'Efectivo' : 'Transferencia'}
          </Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>TOTAL ({item.NumProductos} arts.)</Text>
          <Text style={styles.totalValue}>${Number(item.Total).toFixed(2)}</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <Text style={styles.footerText}>Ver detalles</Text>
        <Ionicons name="chevron-forward" size={16} color="#888" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MIS PEDIDOS</Text>
        <View style={{ width: 40 }} />
      </View>

      {cargando && !refreshing ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
      ) : (
        <FlatList
          data={ordenes}
          keyExtractor={(item) => item.IDOrden.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          // Añadimos el componente Pull-to-refresh
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#000" colors={['#000']} />
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="receipt-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>Aún no tienes pedidos.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F2', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { width: 40 },
  headerTitle: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', marginTop: 10, fontSize: 14 },
  list: { padding: 15 },
  card: { backgroundColor: '#fff', borderRadius: 6, padding: 16, marginBottom: 15, elevation: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12, marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '900', color: '#000' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  infoCol: { flex: 1 },
  label: { fontSize: 9, color: '#888', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 13, color: '#333' },
  totalValue: { fontSize: 14, color: '#000', fontWeight: 'bold' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f9f9f9' },
  footerText: { fontSize: 12, color: '#555' }
});