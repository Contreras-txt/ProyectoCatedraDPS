import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiPost } from '../config/api';
import { AlertContext } from '../context/AlertContext'; // NUEVO

const AdminLoginScreen = ({ navigation }) => {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { showAlert, showToast } = useContext(AlertContext); // NUEVO

  const handleLogin = async () => {
    if (!usuario || !password) {
      showToast({ message: 'Por favor, ingresa tu usuario y contraseña.', type: 'warning', theme: 'dark' });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiPost('/admin/login', { usuario, password });
      if (response.status === 'success') {
        await AsyncStorage.setItem('@novatrend_admin_session', JSON.stringify(response.data));
        navigation.replace('AdminDashboard');
      }
    } catch (error) {
      showAlert({ title: 'Acceso Denegado', message: error.message || 'Error al intentar iniciar sesión.', type: 'danger', theme: 'dark' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>ACCESO RESTRINGIDO</Text>
            </View>

            <View style={styles.logoContainer}>
              <Image source={require('../../assets/2.png')} style={styles.logo} resizeMode="contain" />
              <Text style={styles.subtitle}>Panel de administración</Text>
            </View>

            <View style={styles.formContainer}>
              <Text style={styles.label}>USUARIO</Text>
              <TextInput style={styles.input} placeholder="nombre de usuario" placeholderTextColor="#444" value={usuario} onChangeText={setUsuario} autoCapitalize="none" editable={!isLoading} />

              <Text style={styles.label}>CONTRASEÑA</Text>
              <TextInput style={styles.input} placeholder="contraseña" placeholderTextColor="#444" value={password} onChangeText={setPassword} secureTextEntry editable={!isLoading} />

              <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.7 }]} onPress={handleLogin} disabled={isLoading}>
                <Text style={styles.buttonText}>{isLoading ? 'VALIDANDO...' : 'INGRESAR AL PANEL'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')} disabled={isLoading}>
                <Text style={styles.backButtonText}>← Volver a la tienda</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ... (El bloque const styles = StyleSheet.create({...}) se mantiene idéntico)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#151515', 
    borderRadius: 8,
    padding: 30,
    borderWidth: 1,
    borderColor: '#1f1f1f',
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 30,
  },
  badgeText: {
    color: '#888',
    fontSize: 10,
    letterSpacing: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: 140,
    height: 50,
    marginBottom: 5,
  },
  subtitle: {
    color: '#666',
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
  },
  label: {
    color: '#b0b0b0',
    fontSize: 12,
    marginBottom: 8,
    letterSpacing: 1.5,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#252525',
    color: '#ffffff',
    padding: 15,
    borderRadius: 4,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  buttonText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 1.5,
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#555',
    fontSize: 14,
  },
});

export default AdminLoginScreen;