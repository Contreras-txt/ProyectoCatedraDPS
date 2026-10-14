import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, SafeAreaView, FlatList,
  Platform, StatusBar, ActivityIndicator, Alert, Modal, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiPost } from '../config/api';

export default function AdminPedidosScreen({ navigation }) {
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [detallePedido, setDetallePedido] = useState([]);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    setCargando(true);
    try {
      const response = await fetch('http://192.168.1.4/novatrend_api/admin/pedidos');
      const data = await response.json();
      setPedidos(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron cargar los pedidos.');
    } finally {
      setCargando(false);
    }
  };

  const abrirDetalle = async (pedido) => {
    setPedidoSeleccionado(pedido);
    setModalVisible(true);
    setCargandoDetalle(true);
    try {
      const response = await fetch(`http://192.168.1.4/novatrend_api/admin/pedidos/detalle?id=${pedido.IDOrden}`);
      const data = await response.json();
      setDetallePedido(data || []);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo cargar el detalle del pedido.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cambiarEstado = (idOrden, nuevoEstado) => {
    Alert.alert(
      'Confirmar Cambio',
      `¿Cambiar el estado del pedido #${idOrden} a ${nuevoEstado}?${nuevoEstado === 'Cancelada' ? '\n\nEsto devolverá el stock al inventario.' : ''}`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Confirmar', 
          style: nuevoEstado === 'Cancelada' ? 'destructive' : 'default',
          onPress: async () => {
            try {
              const res = await apiPost('/admin/pedidos/estado', { id: idOrden, estado: nuevoEstado });
              if (res.status === 'success') {
                setModalVisible(false);
                cargarPedidos();
              }
            } catch (error) {
              Alert.alert('Error', error.message || 'No se pudo actualizar el estado.');
            }
          }
        }
      ]
    );
  };

  const formatearFecha = (fechaDb) => {
    if(!fechaDb) return '';
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
    <TouchableOpacity style={styles.card} activeOpacity={0.8} onPress={() => abrirDetalle(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.orderId}>ORDEN #{item.IDOrden}</Text>
        <View style={[styles.badge, { backgroundColor: getColorEstado(item.EstadoOrden) }]}>
          <Text style={styles.badgeText}>{item.EstadoOrden.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <View style={styles.infoCol}>
          <Text style={styles.label}>CLIENTE</Text>
          <Text style={styles.value} numberOfLines={1}>{item.Nombre} {item.Apellido}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>FECHA</Text>
          <Text style={styles.value}>{formatearFecha(item.FechaPedido)}</Text>
        </View>
        <View style={styles.infoCol}>
          <Text style={styles.label}>TOTAL</Text>
          <Text style={styles.totalValue}>${Number(item.Total || 0).toFixed(2)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>GESTIÓN DE PEDIDOS</Text>
        <View style={{ width: 40 }} />
      </View>

      {cargando ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#fff" /></View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={(item) => item.IDOrden.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay pedidos registrados.</Text>}
        />
      )}

      {/* Modal de Detalle y Acciones */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setModalVisible(false)} />
          <View style={styles.modalContent}>
            {pedidoSeleccionado && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>ORDEN #{pedidoSeleccionado.IDOrden}</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color="#fff" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>ESTADO ACTUAL</Text>
                  <Text style={[styles.modalValue, { color: getColorEstado(pedidoSeleccionado.EstadoOrden) }]}>
                    {pedidoSeleccionado.EstadoOrden.toUpperCase()}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>DATOS DEL CLIENTE</Text>
                  <Text style={styles.modalValue}>{pedidoSeleccionado.Nombre} {pedidoSeleccionado.Apellido}</Text>
                  <Text style={styles.modalValue}>{pedidoSeleccionado.Email}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalLabel}>DATOS DE ENVÍO</Text>
                  <Text style={styles.modalValue}>Entrega: {formatearFecha(pedidoSeleccionado.FechaEntrega)}</Text>
                  <Text style={styles.modalValue}>Contacto: {pedidoSeleccionado.TelefonoEnvio || 'No especificado'}</Text>
                  <Text style={styles.modalValue}>{pedidoSeleccionado.DireccionEnvio}, {pedidoSeleccionado.CiudadEnvio}</Text>
                </View>

                <Text style={styles.modalLabel}>PRODUCTOS ({cargandoDetalle ? '...' : detallePedido.length})</Text>
                {cargandoDetalle ? (
                   <ActivityIndicator size="small" color="#fff" style={{ marginVertical: 10 }} />
                ) : (
                  detallePedido.map((item, idx) => (
                    <Text key={idx} style={styles.modalItem}>
                      • {item.Cantidad}x {item.NombreProducto} (Talla: {item.Talla})
                    </Text>
                  ))
                )}

                {/* Acciones de Estado */}
                <Text style={[styles.modalLabel, { marginTop: 20 }]}>CAMBIAR ESTADO A:</Text>
                <View style={styles.actionRow}>
                  {pedidoSeleccionado.EstadoOrden !== 'Aprobada' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#2980b9' }]} onPress={() => cambiarEstado(pedidoSeleccionado.IDOrden, 'Aprobada')}>
                      <Text style={styles.actionBtnText}>APROBAR</Text>
                    </TouchableOpacity>
                  )}
                  {pedidoSeleccionado.EstadoOrden !== 'Entregada' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#27ae60' }]} onPress={() => cambiarEstado(pedidoSeleccionado.IDOrden, 'Entregada')}>
                      <Text style={styles.actionBtnText}>ENTREGAR</Text>
                    </TouchableOpacity>
                  )}
                  {pedidoSeleccionado.EstadoOrden !== 'Cancelada' && (
                    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#c0392b' }]} onPress={() => cambiarEstado(pedidoSeleccionado.IDOrden, 'Cancelada')}>
                      <Text style={styles.actionBtnText}>CANCELAR</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#151515', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' },
  backBtn: { width: 40 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#888', marginTop: 10, fontSize: 14, textAlign: 'center' },
  list: { padding: 15 },
  card: { backgroundColor: '#151515', borderRadius: 6, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#1f1f1f' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#1f1f1f', paddingBottom: 12, marginBottom: 12 },
  orderId: { fontSize: 16, fontWeight: '900', color: '#fff' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: 'bold', letterSpacing: 1 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { flex: 1 },
  label: { fontSize: 9, color: '#888', fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 12, color: '#ccc' },
  totalValue: { fontSize: 14, color: '#fff', fontWeight: 'bold' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#151515', borderTopLeftRadius: 15, borderTopRightRadius: 15, padding: 20, maxHeight: '85%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#333', paddingBottom: 15 },
  modalTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  modalSection: { marginBottom: 15 },
  modalLabel: { color: '#888', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, marginBottom: 4 },
  modalValue: { color: '#ddd', fontSize: 13, marginBottom: 2 },
  modalItem: { color: '#bbb', fontSize: 12, marginLeft: 10, marginBottom: 4 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 4, alignItems: 'center', marginHorizontal: 5 },
  actionBtnText: { color: '#fff', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 }
});