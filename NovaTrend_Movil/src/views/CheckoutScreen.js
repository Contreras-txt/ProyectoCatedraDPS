import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Image,
  KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { AlertContext } from '../context/AlertContext'; // NUEVO
import SelectField from '../components/SelectField';
import { DEPARTAMENTOS } from '../utils/departamentos';
import { apiPost, getImageUrl } from '../config/api';

// ── Fechas (DD/MM/YYYY en pantalla, YYYY-MM-DD hacia el servidor) ──
const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const fechaMinima = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3);
  return d;
};
const parseFecha = (txt) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(txt);
  if (!m) return null;
  const d = +m[1], mo = +m[2], y = +m[3];
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
};
const maskFecha = (t) => {
  const d = t.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

const Label = ({ text, required }) => (
  <Text style={styles.label}>{text}{required ? <Text style={styles.req}> *</Text> : null}</Text>
);

export default function CheckoutScreen({ navigation }) {
  const { cart, cartTotal, clearCart, userSession, logoutClient, ready } = useContext(CartContext);
  const { showAlert } = useContext(AlertContext); // NUEVO

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [fechaEntrega, setFechaEntrega] = useState('');
  const [metodoPago, setMetodoPago] = useState('Transferencia');

  const [enviando, setEnviando] = useState(false);
  const [orden, setOrden] = useState(null);

  useEffect(() => {
    if (!userSession) return;
    setNombre((p) => p || userSession.nombre || '');
    setApellido((p) => p || userSession.apellido || '');
    setDireccion((p) => p || userSession.direccion || '');
    setCiudad((p) => p || userSession.ciudad || '');
    setDepartamento((p) => p || userSession.departamento || '');
    setTelefono((p) => p || (userSession.telefono || '').replace(/\D/g, '').slice(0, 8));
  }, [userSession]);

  useEffect(() => {
    if (ready && !userSession && !orden) navigation.replace('Login');
  }, [ready, userSession, orden, navigation]);

  const soloLetras = (t) => t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 35);
  const minima = fechaMinima();

  const confirmarPedido = async () => {
    if (!nombre.trim() || !apellido.trim() || !direccion.trim() || !ciudad.trim() || !departamento || !telefono || !fechaEntrega) {
      showAlert({ title: 'Faltan datos', message: 'Por favor completa todos los campos obligatorios (*).', type: 'warning' });
      return;
    }
    if (telefono.length !== 8) {
      showAlert({ title: 'Teléfono inválido', message: 'El número de teléfono debe tener exactamente 8 dígitos.', type: 'warning' });
      return;
    }
    const fecha = parseFecha(fechaEntrega);
    if (!fecha || fecha < minima) {
      showAlert({ title: 'Fecha inválida', message: `Ingresa una fecha válida a partir del ${fmt(minima)} (DD/MM/YYYY).`, type: 'warning' });
      return;
    }

    setEnviando(true);
    try {
      const res = await apiPost('/checkout', {
        idCliente: userSession.id,
        token: userSession.token,
        metodoPago,
        envio: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          direccion: direccion.trim(),
          ciudad: ciudad.trim(),
          departamento,
          telefono,
          fechaEntrega: `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`,
        },
        items: cart.map((i) => ({ idProducto: i.IDProducto, talla: i.talla, cantidad: i.cantidad })),
      });
      setOrden({ idOrden: res.data.idOrden, total: res.data.total, metodoPago });
      clearCart();
    } catch (err) {
      // Aunque apiPost captura SESSION_EXPIRED globalmente, si llega aquí mostramos la alerta custom con botón
      if (err.status === 401 || err.message === 'SESSION_EXPIRED') {
        showAlert({ 
          title: 'Sesión expirada', 
          message: 'Tu sesión caducó, necesitas iniciar sesión nuevamente.', 
          type: 'warning',
          actions: [{ text: 'INICIAR SESIÓN', onPress: () => logoutClient() }]
        });
      } else if (err.message !== 'NETWORK_ERROR') {
        showAlert({ title: 'No se pudo confirmar el pedido', message: err.message, type: 'danger' });
      }
    } finally {
      setEnviando(false);
    }
  };

  const irATienda = () => navigation.reset({ index: 0, routes: [{ name: 'Home' }] });

  // ── PANTALLA DE ÉXITO ──
  if (orden) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <ScrollView contentContainerStyle={styles.successContent}>
          <Image source={require('../../assets/p-compra.jpg')} style={styles.successImage} resizeMode="contain" />
          <Text style={styles.successTitle}>¡PEDIDO CONFIRMADO!</Text>
          <View style={styles.orderPill}>
            <Text style={styles.orderPillLabel}>NÚMERO DE ORDEN</Text>
            <Text style={styles.orderPillNumber}>#{orden.idOrden}</Text>
          </View>
          <Text style={styles.successText}>
            Tu pedido por ${Number(orden.total).toFixed(2)} fue procesado con éxito.{'\n'}
            {orden.metodoPago === 'Transferencia'
              ? 'Envía tu comprobante a (+503) 7492-1085 indicando tu número de orden para dar seguimiento.'
              : 'Pagarás en efectivo al recibir tu pedido.'}
          </Text>
          <TouchableOpacity style={styles.btnPrimary} onPress={irATienda}>
            <Text style={styles.btnPrimaryText}>VOLVER A LA TIENDA</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── CARRITO VACÍO ──
  if (ready && cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Header navigation={navigation} />
        <View style={styles.emptyBox}>
          <Ionicons name="bag-outline" size={46} color="#aaa" />
          <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
          <TouchableOpacity style={[styles.btnPrimary, { alignSelf: 'stretch' }]} onPress={irATienda}>
            <Text style={styles.btnPrimaryText}>VOLVER A LA TIENDA</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── FORMULARIO (Se mantiene igual a nivel de etiquetas y estilos) ──
  return (
    <SafeAreaView style={styles.container}>
      <Header navigation={navigation} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* 1. DIRECCIÓN */}
          <View style={styles.card}>
            <CardTitle step="1" title="DIRECCIÓN DE ENTREGA" />
            <View style={styles.cardBody}>
              <Label text="PAÍS / REGIÓN" />
              <View style={[styles.input, styles.inputDisabled, styles.countryRow]}>
                <Text style={{ color: '#666', fontSize: 14 }}>El Salvador</Text>
                <Ionicons name="chevron-down" size={16} color="#aaa" />
              </View>

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Label text="NOMBRE" required />
                  <TextInput style={styles.input} value={nombre} onChangeText={(t) => setNombre(soloLetras(t))} placeholder="Ej. Mayerlyn" placeholderTextColor="#999" />
                </View>
                <View style={{ flex: 1 }}>
                  <Label text="APELLIDO" required />
                  <TextInput style={styles.input} value={apellido} onChangeText={(t) => setApellido(soloLetras(t))} placeholder="Ej. Escobar" placeholderTextColor="#999" />
                </View>
              </View>

              <Label text="DIRECCIÓN EXACTA" required />
              <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} placeholder="Colonia, calle, número de casa..." placeholderTextColor="#999" maxLength={100} />

              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Label text="CIUDAD" required />
                  <TextInput style={styles.input} value={ciudad} onChangeText={setCiudad} placeholder="Ej. Santa Tecla" placeholderTextColor="#999" maxLength={50} />
                </View>
                <View style={{ flex: 1 }}>
                  <Label text="DEPARTAMENTO" required />
                  <SelectField value={departamento} onChange={setDepartamento} options={DEPARTAMENTOS} placeholder="Selecciona" title="DEPARTAMENTO" />
                </View>
              </View>

              <Label text="TELÉFONO DE CONTACTO" required />
              <TextInput style={styles.input} value={telefono} onChangeText={(t) => setTelefono(t.replace(/\D/g, '').slice(0, 8))} placeholder="Ej. 70000000" placeholderTextColor="#999" keyboardType="number-pad" />

              <Label text="FECHA DE ENTREGA DESEADA" required />
              <TextInput style={styles.input} value={fechaEntrega} onChangeText={(t) => setFechaEntrega(maskFecha(t))} placeholder="DD/MM/YYYY" placeholderTextColor="#999" keyboardType="number-pad" maxLength={10} />
              <TouchableOpacity onPress={() => setFechaEntrega(fmt(minima))} style={styles.helperRow}>
                <Ionicons name="information-circle-outline" size={14} color="#c0392b" />
                <Text style={styles.helperText}>
                  La entrega se realizará en un período de 3 días hábiles. Primera fecha disponible: {fmt(minima)} (toca para usarla).
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. MÉTODO DE PAGO */}
          <View style={styles.card}>
            <CardTitle step="2" title="MÉTODO DE PAGO" />
            <View style={styles.cardBody}>
              <TouchableOpacity
                style={[styles.radioCard, metodoPago === 'Transferencia' && styles.radioCardActive]}
                onPress={() => setMetodoPago('Transferencia')}
                activeOpacity={0.85}
              >
                <View style={styles.radioHead}>
                  <Ionicons name={metodoPago === 'Transferencia' ? 'radio-button-on' : 'radio-button-off'} size={20} color="#000" />
                  <View style={styles.radioTextContainer}>
                    <Text style={styles.radioTitle}>DEPÓSITO O TRANSFERENCIA BANCARIA</Text>
                    <Text style={styles.radioSubtitle}>PAGA DESDE TU BANCA EN LÍNEA</Text>
                  </View>
                </View>
                {metodoPago === 'Transferencia' && (
                  <View style={styles.bankBox}>
                    <Text style={styles.bankText}>Realiza tu pago a nuestra cuenta bancaria y envía el comprobante.</Text>
                    <Text style={styles.bankBold}>Banco Agrícola — Cuenta: 3045-8912-04</Text>
                    <Text style={styles.bankBold}>Envía el comprobante a: (+503) 7492-1085</Text>
                    <Text style={styles.bankText}>Importante: Para el seguimiento de su pedido es importante que envíe su comprobante.</Text>
                  </View>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.radioCard, metodoPago === 'Efectivo' && styles.radioCardActive]}
                onPress={() => setMetodoPago('Efectivo')}
                activeOpacity={0.85}
              >
                <View style={styles.radioHead}>
                  <Ionicons name={metodoPago === 'Efectivo' ? 'radio-button-on' : 'radio-button-off'} size={20} color={metodoPago === 'Efectivo' ? '#000' : '#888'} />
                  <View style={styles.radioTextContainer}>
                    <Text style={styles.radioTitle}>EFECTIVO CONTRA ENTREGA</Text>
                    <Text style={styles.radioSubtitle}>PAGA EN EFECTIVO AL RECIBIR TU PEDIDO</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. RESUMEN */}
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <View style={styles.stepCircle}><Ionicons name="checkmark" size={14} color="#fff" /></View>
              <Text style={styles.cardTitle}>RESUMEN DEL PEDIDO</Text>
            </View>
            <View style={styles.cardBody}>
              {cart.map((item) => (
                <View key={`${item.IDProducto}-${item.talla}`} style={styles.sumItem}>
                  <View>
                    <Image source={{ uri: getImageUrl(item.Imagen) }} style={styles.sumImg} />
                    <View style={styles.sumQty}><Text style={styles.sumQtyText}>{item.cantidad}</Text></View>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.sumName} numberOfLines={2}>{item.NombreProducto}</Text>
                    <Text style={styles.sumMeta}>Talla {item.talla}</Text>
                  </View>
                  <Text style={styles.sumPrice}>${(item.Precio * item.cantidad).toFixed(2)}</Text>
                </View>
              ))}

              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Subtotal</Text>
                <Text style={styles.sumLabel}>${cartTotal.toFixed(2)}</Text>
              </View>
              <View style={styles.sumRow}>
                <Text style={styles.sumLabel}>Envío</Text>
                <Text style={styles.free}>✓ GRATIS</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalText}>TOTAL</Text>
                <Text style={styles.totalText}>${cartTotal.toFixed(2)}</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={[styles.btnPrimary, enviando && { opacity: 0.7 }]} onPress={confirmarPedido} disabled={enviando}>
            {enviando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>CONFIRMAR PEDIDO</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const Header = ({ navigation }) => (
  <View style={styles.header}>
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerSide}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
    <Image source={require('../../assets/2.png')} style={styles.headerLogo} resizeMode="contain" />
    <View style={styles.headerSide} />
  </View>
);

const CardTitle = ({ step, title }) => (
  <View style={styles.cardTitleRow}>
    <View style={styles.stepCircle}><Text style={styles.stepText}>{step}</Text></View>
    <Text style={styles.cardTitle}>{title}</Text>
  </View>
);

// ... (El bloque const styles = StyleSheet.create({...}) se mantiene idéntico, omitido por brevedad en este documento para no extenderlo, pero por favor déjalo intacto en tu archivo).
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F4F2', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#000', paddingHorizontal: 15, paddingVertical: 12 },
  headerSide: { width: 30 },
  headerLogo: { width: 100, height: 34 },
  scrollContent: { padding: 15, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 6, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2, overflow: 'hidden' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  stepCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  stepText: { color: '#fff', fontWeight: 'bold', fontSize: 11 },
  cardTitle: { color: '#000', fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  cardBody: { padding: 16 },
  label: { color: '#555', fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  req: { color: '#c0392b' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', color: '#000', paddingHorizontal: 12, paddingVertical: 13, borderRadius: 4, marginBottom: 15, fontSize: 14 },
  inputDisabled: { backgroundColor: '#F4F4F4', borderColor: '#E8E8E8' },
  countryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row' },
  helperRow: { flexDirection: 'row', alignItems: 'flex-start', marginTop: -6 },
  helperText: { color: '#c0392b', fontSize: 10, marginLeft: 5, flex: 1, lineHeight: 14 },
  radioCard: { borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 4, marginBottom: 10, overflow: 'hidden' },
  radioCardActive: { borderColor: '#000', borderWidth: 1.5 },
  radioHead: { flexDirection: 'row', alignItems: 'center', padding: 14 },
  radioTextContainer: { marginLeft: 10, flex: 1 },
  radioTitle: { color: '#000', fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  radioSubtitle: { color: '#8a8a8a', fontSize: 9, marginTop: 3, letterSpacing: 1 },
  bankBox: { backgroundColor: '#F2F2F0', padding: 14, borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  bankText: { color: '#555', fontSize: 11, lineHeight: 17, marginBottom: 2 },
  bankBold: { color: '#000', fontSize: 11, fontWeight: 'bold', lineHeight: 17 },
  sumItem: { flexDirection: 'row', alignItems: 'center', paddingBottom: 14, marginBottom: 14, borderBottomWidth: 1, borderBottomColor: '#EEE' },
  sumImg: { width: 46, height: 56, backgroundColor: '#F0EEEA', borderRadius: 3 },
  sumQty: { position: 'absolute', top: -6, right: -6, backgroundColor: '#000', borderRadius: 9, minWidth: 18, height: 18, paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center' },
  sumQtyText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  sumName: { color: '#000', fontSize: 13 },
  sumMeta: { color: '#888', fontSize: 10, marginTop: 2 },
  sumPrice: { color: '#000', fontSize: 14, fontWeight: '900' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { color: '#777', fontSize: 13 },
  free: { color: '#2E8B57', fontSize: 11, fontWeight: 'bold', letterSpacing: 1 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, paddingTop: 12, borderTopWidth: 2, borderTopColor: '#000' },
  totalText: { color: '#000', fontSize: 20, fontWeight: '900' },
  btnPrimary: { backgroundColor: '#000', paddingVertical: 17, borderRadius: 3, alignItems: 'center', justifyContent: 'center', minHeight: 54 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },
  emptyBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { color: '#777', fontSize: 15, marginVertical: 14 },
  successContainer: { flex: 1, backgroundColor: '#fff' },
  successContent: { flexGrow: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  successImage: { width: 260, height: 260, marginBottom: 16 },
  successTitle: { color: '#000', fontSize: 24, fontWeight: '900', letterSpacing: 1, marginBottom: 14 },
  orderPill: { backgroundColor: '#F4F4F2', borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 6, paddingVertical: 10, paddingHorizontal: 26, alignItems: 'center', marginBottom: 16 },
  orderPillLabel: { color: '#777', fontSize: 9, letterSpacing: 2, fontWeight: 'bold' },
  orderPillNumber: { color: '#000', fontSize: 28, fontWeight: '900', marginTop: 2 },
  successText: { color: '#555', fontSize: 13, textAlign: 'center', lineHeight: 20, marginBottom: 26, paddingHorizontal: 10 },
});