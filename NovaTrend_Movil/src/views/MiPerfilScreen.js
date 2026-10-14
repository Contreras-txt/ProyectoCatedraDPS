import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView,
  Alert, Platform, StatusBar, ActivityIndicator, KeyboardAvoidingView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import SelectField from '../components/SelectField';
import { DEPARTAMENTOS } from '../utils/departamentos';
import { apiPost } from '../config/api';

const Label = ({ text, required }) => (
  <Text style={styles.label}>{text}{required ? <Text style={styles.req}> *</Text> : null}</Text>
);

export default function MiPerfilScreen({ navigation }) {
  const { userSession, loginClient } = useContext(CartContext);

  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [departamento, setDepartamento] = useState('');
  
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (userSession) {
      setNombre(userSession.nombre || '');
      setApellido(userSession.apellido || '');
      setTelefono(userSession.telefono ? userSession.telefono.replace(/\D/g, '').slice(0, 8) : '');
      setDireccion(userSession.direccion || '');
      setCiudad(userSession.ciudad || '');
      setDepartamento(userSession.departamento || '');
    }
  }, [userSession]);

  const soloLetras = (t) => t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 35);

  const handleGuardar = async () => {
    if (!nombre.trim() || !apellido.trim()) {
      Alert.alert('Campos incompletos', 'El nombre y apellido son obligatorios.');
      return;
    }
    if (telefono && telefono.length !== 8) {
      Alert.alert('Teléfono inválido', 'Si ingresas un teléfono, debe tener exactamente 8 dígitos.');
      return;
    }
    if (passwordNueva && passwordNueva.length < 6) {
      Alert.alert('Contraseña débil', 'La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (passwordNueva && !passwordActual) {
      Alert.alert('Verificación requerida', 'Debes ingresar tu contraseña actual para poder cambiarla.');
      return;
    }

    setGuardando(true);
    try {
      const response = await apiPost('/perfil/actualizar', {
        idCliente: userSession.id,
        token: userSession.token,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono,
        direccion: direccion.trim(),
        ciudad: ciudad.trim(),
        departamento,
        passwordActual,
        passwordNueva
      });

      // Actualizar la sesión en AsyncStorage y Contexto conservando el ID y Token
      await loginClient({
        ...userSession,
        ...response.data
      });

      Alert.alert('¡Éxito!', 'Tu perfil ha sido actualizado correctamente.', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>MI PERFIL</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          <View style={styles.card}>
            <Text style={styles.cardTitle}>DATOS PERSONALES</Text>
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Label text="NOMBRE" required />
                <TextInput style={styles.input} value={nombre} onChangeText={(t) => setNombre(soloLetras(t))} />
              </View>
              <View style={{ flex: 1 }}>
                <Label text="APELLIDO" required />
                <TextInput style={styles.input} value={apellido} onChangeText={(t) => setApellido(soloLetras(t))} />
              </View>
            </View>

            <Label text="TELÉFONO" />
            <TextInput style={styles.input} value={telefono} onChangeText={(t) => setTelefono(t.replace(/\D/g, '').slice(0, 8))} keyboardType="number-pad" />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>DIRECCIÓN</Text>
            <Label text="DIRECCIÓN EXACTA" />
            <TextInput style={styles.input} value={direccion} onChangeText={setDireccion} maxLength={100} />
            
            <View style={styles.row}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <Label text="CIUDAD" />
                <TextInput style={styles.input} value={ciudad} onChangeText={setCiudad} maxLength={50} />
              </View>
              <View style={{ flex: 1 }}>
                <Label text="DEPARTAMENTO" />
                <SelectField value={departamento} onChange={setDepartamento} options={DEPARTAMENTOS} placeholder="Selecciona" title="DEPARTAMENTO" />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>CAMBIAR CONTRASEÑA (OPCIONAL)</Text>
            <Label text="CONTRASEÑA ACTUAL" />
            <TextInput style={styles.input} value={passwordActual} onChangeText={setPasswordActual} secureTextEntry placeholder="******" placeholderTextColor="#aaa" />
            
            <Label text="NUEVA CONTRASEÑA" />
            <TextInput style={styles.input} value={passwordNueva} onChangeText={setPasswordNueva} secureTextEntry placeholder="******" placeholderTextColor="#aaa" />
          </View>

          <TouchableOpacity style={[styles.btnPrimary, guardando && { opacity: 0.7 }]} onPress={handleGuardar} disabled={guardando}>
            {guardando ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>GUARDAR CAMBIOS</Text>}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
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
  row: { flexDirection: 'row' },
  label: { color: '#555', fontSize: 10, fontWeight: 'bold', marginBottom: 6, letterSpacing: 1 },
  req: { color: '#c0392b' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', color: '#000', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 4, marginBottom: 15, fontSize: 14 },
  btnPrimary: { backgroundColor: '#000', paddingVertical: 16, borderRadius: 4, alignItems: 'center' },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 13, letterSpacing: 1.5 },
});