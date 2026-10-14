import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Platform,
  StatusBar, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location'; // NUEVO: Módulo nativo de GPS
import colors from '../utils/colors';
import { DEPARTAMENTOS } from '../utils/departamentos';
import SelectField from '../components/SelectField';
import { CartContext } from '../context/CartContext';
import { AlertContext } from '../context/AlertContext';
import { apiPost } from '../config/api';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Label = ({ text, required, optional }) => (
  <Text style={styles.label}>
    {text}
    {required ? <Text style={styles.req}> *</Text> : null}
    {optional ? <Text style={styles.opt}>  (OPCIONAL)</Text> : null}
  </Text>
);

export default function RegisterScreen({ navigation }) {
  const [f, setF] = useState({
    nombre: '', apellido: '', correo: '', telefono: '', direccion: '',
    ciudad: '', departamento: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false); // NUEVO: Estado para el botón GPS
  
  const { loginClient } = useContext(CartContext);
  const { showAlert, showToast } = useContext(AlertContext);

  const set = (name, value) => setF((prev) => ({ ...prev, [name]: value }));
  const soloLetras = (t) => t.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '').slice(0, 35);
  const soloDigitos = (t) => t.replace(/\D/g, '').slice(0, 8);

  // NUEVO: Función para autocompletar dirección con GPS
  const obtenerUbicacion = async () => {
    setGpsLoading(true);
    try {
      // 1. Pedir permiso al sistema
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        showAlert({ 
          title: 'Permiso denegado', 
          message: 'No podemos acceder a tu GPS. Por favor ingresa tu dirección manualmente.', 
          type: 'warning' 
        });
        setGpsLoading(false);
        return;
      }

      // 2. Obtener coordenadas
      const location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      
      // 3. Convertir coordenadas a texto (Reverse Geocoding)
      const geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (geocode.length > 0) {
        const place = geocode[0];
        const direccionCompleta = `${place.street || place.name || ''} ${place.streetNumber || ''}`.trim();
        const ciudadDetectada = place.city || place.subregion || '';
        const regionDetectada = place.region || '';
        
        // Autollenar campos
        if(direccionCompleta) set('direccion', direccionCompleta.substring(0, 100));
        if(ciudadDetectada) set('ciudad', ciudadDetectada.substring(0, 50));
        
        // Intentar hacer match automático con el select del departamento
        const deptMatch = DEPARTAMENTOS.find(d => regionDetectada.toLowerCase().includes(d.toLowerCase()));
        if (deptMatch) set('departamento', deptMatch);

        showToast({ message: 'Ubicación autocompletada con éxito', type: 'success' });
      } else {
        showToast({ message: 'No se encontraron detalles de la calle', type: 'warning' });
      }
    } catch (error) {
      showAlert({ 
        title: 'Error de GPS', 
        message: 'No logramos detectar tu ubicación. Revisa tu conexión a internet o GPS.', 
        type: 'danger' 
      });
    } finally {
      setGpsLoading(false);
    }
  };

  const validar = () => {
    const e = [];
    if (!f.nombre.trim() || !f.apellido.trim() || !f.correo.trim() || !f.password || !f.confirmPassword) {
      e.push('Completa los campos obligatorios (*).');
    }
    if (f.correo.trim() && !EMAIL_RE.test(f.correo.trim())) e.push('El correo electrónico no es válido.');
    if (f.telefono && f.telefono.length !== 8) e.push('El teléfono debe tener 8 dígitos.');
    if (f.password && f.password.length < 6) e.push('La contraseña debe tener al menos 6 caracteres.');
    if (f.password && f.confirmPassword && f.password !== f.confirmPassword) e.push('Las contraseñas no coinciden.');
    return e;
  };

  const handleRegister = async () => {
    const errores = validar();
    if (errores.length) {
      showAlert({ title: 'Revisa tus datos', message: errores.join('\n'), type: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const res = await apiPost('/registro', {
        nombre: f.nombre.trim(),
        apellido: f.apellido.trim(),
        correo: f.correo.trim(),
        password: f.password,
        telefono: f.telefono,
        direccion: f.direccion.trim(),
        ciudad: f.ciudad.trim(),
        departamento: f.departamento,
      });
      await loginClient(res.data);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      showAlert({ title: 'No se pudo crear la cuenta', message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  const ph = colors.textSecondary;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Image source={require('../../assets/1.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.subtitle}>Completa tu información para empezar</Text>
          </View>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={() => showToast({ message: 'Registro con Google en desarrollo', type: 'info' })}
          >
            <Ionicons name="logo-google" size={17} color="#DB4437" style={{ marginRight: 10 }} />
            <Text style={styles.googleButtonText}>Registrarse con Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>o crea tu cuenta manualmente</Text>
            <View style={styles.dividerLine} />
          </View>

          <View>
            <Label text="NOMBRE" required />
            <TextInput style={styles.input} placeholder="Ej. Maria" placeholderTextColor={ph} value={f.nombre} onChangeText={(t) => set('nombre', soloLetras(t))} />

            <Label text="APELLIDO" required />
            <TextInput style={styles.input} placeholder="Ej. González" placeholderTextColor={ph} value={f.apellido} onChangeText={(t) => set('apellido', soloLetras(t))} />

            <Label text="CORREO ELECTRÓNICO" required />
            <TextInput style={styles.input} placeholder="correo@ejemplo.com" placeholderTextColor={ph} keyboardType="email-address" autoCapitalize="none" autoCorrect={false} value={f.correo} onChangeText={(t) => set('correo', t)} />

            <Label text="TELÉFONO" optional />
            <TextInput style={styles.input} placeholder="+503 7000-0000" placeholderTextColor={ph} keyboardType="number-pad" value={f.telefono} onChangeText={(t) => set('telefono', soloDigitos(t))} />

            {/* NUEVO: Contenedor con el botón de GPS */}
            <View style={styles.gpsRow}>
              <Label text="DIRECCIÓN DE ENTREGA" optional />
              <TouchableOpacity onPress={obtenerUbicacion} disabled={gpsLoading} style={styles.gpsBtn}>
                {gpsLoading ? <ActivityIndicator size="small" color="#2980b9" /> : <Ionicons name="location" size={16} color="#2980b9" />}
                <Text style={styles.gpsText}>{gpsLoading ? 'BUSCANDO...' : 'USAR MI UBICACIÓN'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput style={styles.input} placeholder="Col. Escalón, San Salvador" placeholderTextColor={ph} maxLength={100} value={f.direccion} onChangeText={(t) => set('direccion', t)} />

            <Label text="CIUDAD" optional />
            <TextInput style={styles.input} placeholder="Ej. Ciudad Merliot" placeholderTextColor={ph} maxLength={50} value={f.ciudad} onChangeText={(t) => set('ciudad', t)} />

            <Label text="DEPARTAMENTO" optional />
            <SelectField
              value={f.departamento}
              onChange={(v) => set('departamento', v)}
              options={DEPARTAMENTOS}
              placeholder="– Selecciona tu departamento –"
              title="DEPARTAMENTO"
            />

            <View style={styles.hr} />

            <Label text="CONTRASEÑA" required />
            <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" placeholderTextColor={ph} secureTextEntry value={f.password} onChangeText={(t) => set('password', t)} />

            <Label text="CONFIRMAR CONTRASEÑA" required />
            <TextInput style={styles.input} placeholder="Repite tu contraseña" placeholderTextColor={ph} secureTextEntry value={f.confirmPassword} onChangeText={(t) => set('confirmPassword', t)} />

            <TouchableOpacity style={[styles.primaryButton, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.primaryButtonText}>CREAR CUENTA</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Volver a la tienda</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  scrollContainer: { paddingHorizontal: 25, paddingBottom: 40, paddingTop: 20 },
  header: { alignItems: 'center', marginBottom: 18 },
  logo: { width: 190, height: 80 },
  subtitle: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  googleButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: colors.border, paddingVertical: 13, borderRadius: 2, backgroundColor: '#FFFFFF', marginBottom: 16 },
  googleButtonText: { color: colors.textPrimary, fontSize: 13, fontWeight: '500' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E5E5' },
  dividerText: { color: colors.textSecondary, paddingHorizontal: 12, fontSize: 11 },
  label: { fontSize: 11, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 7, letterSpacing: 0.5 },
  req: { color: colors.error },
  opt: { fontWeight: 'normal', color: colors.textSecondary, fontSize: 10 },
  input: { height: 50, borderWidth: 1, borderColor: colors.border, borderRadius: 4, paddingHorizontal: 15, fontSize: 15, color: colors.textPrimary, marginBottom: 15, backgroundColor: '#FAFAFA' },
  hr: { height: 1, backgroundColor: '#E5E5E5', marginBottom: 18 },
  primaryButton: { borderWidth: 1.5, borderColor: '#000', backgroundColor: '#fff', paddingVertical: 16, borderRadius: 2, alignItems: 'center', marginTop: 8, marginBottom: 18, minHeight: 52, justifyContent: 'center' },
  primaryButtonText: { color: '#000', fontSize: 13, fontWeight: 'bold', letterSpacing: 2 },
  backButton: { alignItems: 'center', padding: 10 },
  backButtonText: { color: colors.textSecondary, fontSize: 12 },
  // NUEVO: Estilos para el botón de GPS
  gpsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 7 },
  gpsBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eef6fc', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 15 },
  gpsText: { fontSize: 10, color: '#2980b9', marginLeft: 4, fontWeight: 'bold', letterSpacing: 0.5 }
});