import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getImageUrl } from '../config/api';

export default function DetallePedidoScreen({ route, navigation }) {
  const { orden } = route.params;
  const items = orden.detalle || [];

  const formatearFecha = (fechaDb) => {
    if(!fechaDb) return '';
    const d = new Date(fechaDb);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getStepLevel = (estado) => {
    switch (estado) {
      case 'Entregada': return 3;
      case 'Aprobada': return 2;
      case 'Pendiente': return 1;
      case 'Cancelada': return 0;
      default: return 1;
    }
  };

  const stepLevel = getStepLevel(orden.EstadoOrden);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ORDEN #{orden.IDOrden}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Barra de Progreso */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ESTADO DEL PEDIDO</Text>
          
          {stepLevel === 0 ? (
            <View style={styles.cancelBox}>
              <Ionicons name="close-circle" size={30} color="#c0392b" />
              <Text style={styles.cancelText}>ESTA ORDEN FUE CANCELADA</Text>
            </View>
          ) : (
            <View style={styles.progressContainer}>
              <View style={styles.stepBox}>
                <View style={[styles.stepCircle, stepLevel >= 1 && styles.stepActive]}>
                  <Ionicons name="time" size={16} color="#fff" />
                </View>
                <Text style={[styles.stepText, stepLevel >= 1 && styles.stepTextActive]}>Pendiente</Text>
              </View>
              <View style={[styles.progressLine, stepLevel >= 2 && styles.lineActive]} />
              <View style={styles.stepBox}>
                <View style={[styles.stepCircle, stepLevel >= 2 && styles.stepActive]}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                </View>
                <Text style={[styles.stepText, stepLevel >= 2 && styles.stepTextActive]}>Aprobada</Text>
              </View>
              <View style={[styles.progressLine, stepLevel >= 3 && styles.lineActive]} />
              <View style={styles.stepBox}>
                <View style={[styles.stepCircle, stepLevel >= 3 && styles.stepActive]}>
                  <Ionicons name="home" size={16} color="#fff" />
                </View>
                <Text style={[styles.stepText, stepLevel >= 3 && styles.stepTextActive]}>Entregada</Text>
              </View>
            </View>
          )}
          
          <View style={styles.dateRow}>
            <Text style={styles.dateLabel}>Fecha de pedido: <Text style={{ color: '#000' }}>{formatearFecha(orden.FechaPedido)}</Text></Text>
            <Text style={styles.dateLabel}>Fecha est. entrega: <Text style={{ color: '#000' }}>{formatearFecha(orden.FechaEntrega)}</Text></Text>
          </View>
        </View>

        {/* Productos */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PRODUCTOS ({orden.NumProductos})</Text>
          {items.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <Image source={{ uri: getImageUrl(item.Imagen) }} style={styles.itemImg} />
              <View style={styles.itemInfo}>
                <Text style={styles.itemName} numberOfLines={2}>{item.NombreProducto}</Text>
                <Text style={styles.itemMeta}>Talla: {item.Talla} | Cant: {item.Cantidad}</Text>
              </View>
              <Text style={styles.itemPrice}>${(item.PrecioUnitario * item.Cantidad).toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TOTAL</Text>
            <Text style={styles.totalValue}>${Number(orden.Total).toFixed(2)}</Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F2', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  backBtn: { width: 40 },
  headerTitle: { color: '#000', fontSize: 16, fontWeight: '900', letterSpacing: 1 },
  scrollContent: { padding: 15, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 6, padding: 16, marginBottom: 16, elevation: 1 },
  cardTitle: { fontSize: 13, fontWeight: '900', color: '#000', letterSpacing: 1, marginBottom: 15 },
  
  cancelBox: { alignItems: 'center', paddingVertical: 10 },
  cancelText: { color: '#c0392b', fontSize: 12, fontWeight: 'bold', marginTop: 8, letterSpacing: 1 },

  progressContainer: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 20 },
  stepBox: { alignItems: 'center', width: 60 },
  stepCircle: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', zIndex: 2 },
  stepActive: { backgroundColor: '#000' },
  stepText: { fontSize: 10, color: '#aaa', marginTop: 6, fontWeight: 'bold' },
  stepTextActive: { color: '#000' },
  progressLine: { flex: 1, height: 3, backgroundColor: '#ddd', marginTop: 16, marginHorizontal: -10, zIndex: 1 },
  lineActive: { backgroundColor: '#000' },

  dateRow: { borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12, marginTop: 5 },
  dateLabel: { fontSize: 12, color: '#777', marginBottom: 4 },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemImg: { width: 50, height: 60, backgroundColor: '#f0f0f0', borderRadius: 4 },
  itemInfo: { flex: 1, marginLeft: 12 },
  itemName: { fontSize: 13, color: '#000', fontWeight: '500' },
  itemMeta: { fontSize: 11, color: '#888', marginTop: 4 },
  itemPrice: { fontSize: 14, color: '#000', fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 },
  totalLabel: { fontSize: 14, color: '#000', fontWeight: '900' },
  totalValue: { fontSize: 18, color: '#000', fontWeight: '900' },
});