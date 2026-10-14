import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert 
} from 'react-native';
import { useCategories } from '../viewmodels/useCategories';

export default function NewCategoryScreen({ navigation, route }) {
  const categoriaAEditar = route.params?.category || null;

  const [nombre, setNombre] = useState(categoriaAEditar ? categoriaAEditar.NombreCategoria : '');
  const [seccion, setSeccion] = useState(categoriaAEditar ? categoriaAEditar.Seccion : 'Caballeros');
  const [descripcion, setDescripcion] = useState(categoriaAEditar ? categoriaAEditar.Descripcion : '');

  const { createCategory, updateCategory } = useCategories();

  const handleSave = async () => {
    if (!nombre.trim()) {
      Alert.alert('Error', 'El nombre de la categoría es obligatorio.');
      return;
    }

    const categoriaData = {
      id: categoriaAEditar ? categoriaAEditar.IDCategoria : null,
      nombre,
      seccion,
      descripcion
    };

    let exito = false;
    if (categoriaAEditar) {
      exito = await updateCategory(categoriaData);
    } else {
      exito = await createCategory(categoriaData);
    }

    if (exito) {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>ADMINISTRACIÓN</Text>
            <Text style={styles.headerTitle}>{categoriaAEditar ? 'EDITAR CATEGORÍA' : 'NUEVA CATEGORÍA'}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Nombre de la Categoría</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ej. Chaquetas, Pantalones..." 
              placeholderTextColor="#444" 
              value={nombre} 
              onChangeText={setNombre} 
            />

            <Text style={styles.label}>Sección</Text>
            <View style={styles.seccionContainer}>
              {['Caballeros', 'Damas', 'Unisex'].map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.seccionButton, seccion === item && styles.seccionButtonActive]}
                  onPress={() => setSeccion(item)}
                >
                  <Text style={[styles.seccionButtonText, seccion === item && styles.seccionButtonTextActive]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Descripción</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              placeholder="Breve descripción de la categoría..." 
              placeholderTextColor="#444" 
              multiline 
              value={descripcion} 
              onChangeText={setDescripcion} 
            />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{categoriaAEditar ? 'Actualizar Categoría' : 'Guardar Categoría'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0a' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', marginBottom: 25, marginTop: 10 },
  headerSubtitle: { color: '#888', fontSize: 10, letterSpacing: 2, marginBottom: 5 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  formContainer: { width: '100%' },
  label: { color: '#b0b0b0', fontSize: 12, marginBottom: 8, fontWeight: 'bold' },
  input: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#252525', color: '#ffffff', padding: 12, borderRadius: 4, marginBottom: 20 },
  seccionContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  seccionButton: { flex: 1, backgroundColor: '#151515', paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#252525', marginHorizontal: 4, borderRadius: 4 },
  seccionButtonActive: { backgroundColor: '#fff', borderColor: '#fff' },
  seccionButtonText: { color: '#888', fontSize: 12, fontWeight: 'bold' },
  seccionButtonTextActive: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  textArea: { height: 90, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#ffffff', paddingVertical: 14, borderRadius: 4, alignItems: 'center', marginTop: 10, marginBottom: 15 },
  saveButtonText: { color: '#000000', fontWeight: 'bold', fontSize: 14 },
  cancelButton: { alignItems: 'center', paddingVertical: 8 },
  cancelButtonText: { color: '#555', fontSize: 14 }
});