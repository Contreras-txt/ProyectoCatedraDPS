import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { AlertContext } from '../context/AlertContext'; // NUEVO
import { apiPost } from '../config/api';
import { validateEmail, validatePassword } from '../utils/validators';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  const { loginClient } = useContext(CartContext);
  const { showAlert, showToast } = useContext(AlertContext); // NUEVO

  const handleLogin = async () => {
    const emailError = validateEmail(email);
    const passError = validatePassword(password);
    
    if (emailError || passError) {
      setErrors({ email: emailError, password: passError });
      return;
    }
    
    setErrors({});
    setLoading(true);
    
    try {
      const res = await apiPost('/login', { email: email.trim(), password });
      await loginClient(res.data);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      // REEMPLAZO DE ALERTA NATIVA
      showAlert({ title: 'No se pudo iniciar sesión', message: err.message, type: 'danger' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => navigation.navigate('AdminLoginScreen')} activeOpacity={0.8}>
            <Image source={require('../../assets/1.png')} style={styles.logo} resizeMode="contain" />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(t) => { setEmail(t); setErrors({...errors, email: null}); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.label}>CONTRASEÑA</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder="Tu contraseña"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={(t) => { setPassword(t); setErrors({...errors, password: null}); }}
              onSubmitEditing={handleLogin}
            />
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <TouchableOpacity style={[styles.btnPrimary, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>INICIAR SESIÓN</Text>}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>o continúa con</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={styles.btnGoogle} 
              onPress={() => showToast({ message: 'Inicio con Google en desarrollo', type: 'info' })} // REEMPLAZO
            >
              <Ionicons name="logo-google" size={18} color="#DB4437" style={{ marginRight: 10 }} />
              <Text style={styles.btnGoogleText}>Continuar con Google</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>¿Aún no tienes cuenta?</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Register')}>
              <Text style={styles.btnSecondaryText}>CREAR CUENTA</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
              <Text style={styles.backButtonText}>← Volver a la tienda</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ... (El bloque const styles = StyleSheet.create({...}) se mantiene idéntico)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#ffffff', paddingTop: Platform.OS === 'android' ? 24 : 0 },
  content: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  logo: { width: 200, height: 80, marginBottom: 30 },
  formContainer: { width: '100%', maxWidth: 400 },
  label: { color: '#000', fontSize: 11, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 14, borderRadius: 2, marginBottom: 5, fontSize: 14, color: '#000' },
  inputError: { borderColor: '#E74C3C', borderWidth: 1.5 },
  errorText: { color: '#E74C3C', fontSize: 11, marginBottom: 15, marginTop: 2, marginLeft: 2 },
  btnPrimary: { backgroundColor: '#000', padding: 16, borderRadius: 2, alignItems: 'center', marginBottom: 26, minHeight: 50, justifyContent: 'center', marginTop: 15 },
  btnPrimaryText: { color: '#fff', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e5e5' },
  dividerText: { color: '#888', paddingHorizontal: 15, fontSize: 11 },
  btnGoogle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#ccc', padding: 14, borderRadius: 2, marginBottom: 26 },
  btnGoogleText: { color: '#333', fontSize: 13, fontWeight: '500' },
  btnSecondary: { borderWidth: 1, borderColor: '#000', padding: 16, borderRadius: 2, alignItems: 'center', marginBottom: 20 },
  btnSecondaryText: { color: '#000', fontWeight: 'bold', fontSize: 13, letterSpacing: 2 },
  backButton: { alignItems: 'center', marginTop: 6 },
  backButtonText: { color: '#777', fontSize: 12 },
});