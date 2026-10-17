import React, { useState, useContext } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Modal, FlatList 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useInventory } from '../viewmodels/useInventory';
import { AlertContext } from '../context/AlertContext';
import { validateImageSize, validatePrice } from '../utils/validators';

export default function NewProductScreen({ navigation, route }) {
  const parseTallas = (detalleStr) => {
    const t = { xs: '0', s: '0', m: '0', l: '0', xl: '0' };
    if (!detalleStr) return t;
    
    detalleStr.split(',').forEach(item => {
      const [talla, stock] = item.split(':');
      if (talla && stock !== undefined) {
        const key = talla.trim().toLowerCase();
        if (t.hasOwnProperty(key)) {
          t[key] = stock.trim();
        }
      }
    });
    return t;
  };

  const productoAEditar = route.params?.product || null;

  const [nombre, setNombre] = useState(productoAEditar ? productoAEditar.NombreProducto : '');
  const [categoriaId, setCategoriaId] = useState(productoAEditar ? productoAEditar.IDCategoria : '');
  const [categoriaNombre, setCategoriaNombre] = useState(productoAEditar?.NombreCategoria || 'Seleccione...');
  const [modalVisible, setModalVisible] = useState(false);
  const [precio, setPrecio] = useState(productoAEditar ? productoAEditar.Precio.toString() : '');
  const [colores, setColores] = useState(productoAEditar ? productoAEditar.Colores : '');
  const [imagen, setImagen] = useState(productoAEditar ? productoAEditar.Imagen : '');
  const [descripcion, setDescripcion] = useState(productoAEditar ? productoAEditar.Descripcion : '');
  
  const [tallas, setTallas] = useState(
    productoAEditar ? parseTallas(productoAEditar.DetalleTallas) : { xs: '0', s: '0', m: '0', l: '0', xl: '0' }
  );

  const { createProduct, updateProduct, categories } = useInventory();
  const { showAlert, showToast } = useContext(AlertContext);

  const seleccionarImagen = async () => {
    // CORRECCIÓN: Actualizado a la sintaxis moderna para evitar el warning amarillo
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], 
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets && result.assets.length > 0 && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      
      const errorTamano = validateImageSize(base64Image, 2);
      if (errorTamano) {
        showAlert({ 
          title: 'Imagen muy pesada', 
          message: errorTamano, 
          type: 'warning', 
          theme: 'dark' 
        });
        return;
      }

      setImagen(base64Image);
      showToast({ message: 'Fotografía procesada en Base64', type: 'success', theme: 'dark' });
    }
  };

  const handleTallaChange = (talla, valor) => {
    // Remover caracteres que no sean números para evitar enviar letras al servidor
    const valorLimpio = valor.replace(/[^0-9]/g, '');
    setTallas({ ...tallas, [talla]: valorLimpio });
  };

  const handleSave = async () => {
    // Limpiamos espacios antes de validar
    const nombreLimpio = nombre.trim();
    const precioLimpio = precio.trim();

    if (!nombreLimpio || !precioLimpio || !categoriaId) {
      showAlert({ 
        title: 'Campos Incompletos', 
        message: 'El nombre, precio y categoría son obligatorios.', 
        type: 'warning', 
        theme: 'dark' 
      });
      return;
    }

    const errorPrecio = validatePrice(precioLimpio);
    if (errorPrecio) {
      showAlert({ 
        title: 'Precio Inválido', 
        message: errorPrecio, 
        type: 'warning', 
        theme: 'dark' 
      });
      return;
    }

    // Validación extra para evitar rechazos del servidor (Reglas estrictas de PHP)
    const totalTallas = Object.values(tallas).reduce((acc, val) => acc + (parseInt(val) || 0), 0);
    if (totalTallas <= 0) {
      showAlert({ 
        title: 'Inventario Inválido', 
        message: 'Debes asignar al menos 1 unidad en cualquier talla para poder guardar el producto.', 
        type: 'warning', 
        theme: 'dark' 
      });
      return;
    }
    
    if (!colores.trim()) {
       showAlert({ 
        title: 'Colores faltantes', 
        message: 'Debes especificar los colores del producto.', 
        type: 'warning', 
        theme: 'dark' 
      });
      return;
    }

    let imagenFinal = imagen;
    if (!imagenFinal || imagenFinal.startsWith('file:')) {
      imagenFinal = 'default.jpg';
    }

    const productoData = {
      id: productoAEditar ? productoAEditar.IDProducto : null,
      nombre: nombreLimpio,
      categoria: categoriaId,
      precio: parseFloat(precioLimpio),
      colores: colores.trim(),
      imagen: imagenFinal,
      tallas,
      descripcion: descripcion.trim()
    };

    let exito = false;
    if (productoAEditar) {
      exito = await updateProduct(productoData);
    } else {
      exito = await createProduct(productoData);
    }

    if (exito) {
      // El Toast verde ya se manda desde el useInventory, solo retrocedemos
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text style={styles.headerSubtitle}>GESTIÓN DE INVENTARIO</Text>
            <Text style={styles.headerTitle}>{productoAEditar ? 'EDITAR PRODUCTO' : 'NUEVO PRODUCTO'}</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Nombre del Producto</Text>
            <TextInput style={styles.input} placeholder="Ej. Camiseta" placeholderTextColor="#444" value={nombre} onChangeText={setNombre} maxLength={100} />

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Categoría</Text>
                <TouchableOpacity style={[styles.input, styles.selectButton]} onPress={() => setModalVisible(true)}>
                  <Text style={styles.selectButtonText} numberOfLines={1}>{categoriaNombre}</Text>
                  <Text style={{ color: '#888' }}>▼</Text>
                </TouchableOpacity>

                <Modal visible={modalVisible} transparent={true} animationType="fade">
                  <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                      <Text style={styles.modalTitle}>Seleccione una categoría</Text>
                      <FlatList
                        data={categories}
                        keyExtractor={(item) => item.IDCategoria.toString()}
                        renderItem={({ item }) => (
                          <TouchableOpacity 
                            style={styles.modalItem}
                            onPress={() => {
                              setCategoriaId(item.IDCategoria);
                              setCategoriaNombre(item.NombreCategoria);
                              setModalVisible(false);
                            }}
                          >
                            <Text style={styles.modalItemText}>{item.NombreCategoria} ({item.Seccion})</Text>
                          </TouchableOpacity>
                        )}
                      />
                      <TouchableOpacity style={styles.modalCloseButton} onPress={() => setModalVisible(false)}>
                        <Text style={styles.modalCloseText}>Cancelar</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </View>

              <View style={styles.halfWidth}>
                <Text style={styles.label}>Precio ($)</Text>
                <TextInput style={styles.input} placeholder="0.00" placeholderTextColor="#444" keyboardType="numeric" value={precio} onChangeText={setPrecio} />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Colores</Text>
                <TextInput style={styles.input} placeholder="Ej. Negro, Blanco" placeholderTextColor="#444" value={colores} onChangeText={setColores} maxLength={50} />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.label}>Imagen del Producto</Text>
                <TouchableOpacity 
                  style={[styles.input, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#202020' }]} 
                  onPress={seleccionarImagen}
                >
                  <Text style={{ color: '#fff', fontSize: 11, textAlign: 'center' }} numberOfLines={1}>
                    {imagen && imagen.startsWith('data:image') ? 'Nueva foto lista' : (imagen || 'Subir desde galería')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.label}>Inventario de tallas (Debe haber al menos 1 unidad en total):</Text>
            <View style={styles.tallasContainer}>
              {['xs', 's', 'm', 'l', 'xl'].map((talla) => (
                <View key={talla} style={styles.tallaBox}>
                  <Text style={styles.tallaLabel}>{talla.toUpperCase()}</Text>
                  <TextInput
                    style={styles.tallaInput}
                    keyboardType="number-pad"
                    value={tallas[talla]}
                    onChangeText={(val) => handleTallaChange(talla, val)}
                  />
                </View>
              ))}
            </View>

            <Text style={styles.label}>Descripción:</Text>
            <TextInput style={[styles.input, styles.textArea]} placeholder="Descripción..." placeholderTextColor="#444" multiline value={descripcion} onChangeText={setDescripcion} maxLength={500} />

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{productoAEditar ? 'Actualizar Producto' : 'Guardar Producto'}</Text>
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
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  headerSubtitle: { color: '#888', fontSize: 10, letterSpacing: 2, marginBottom: 5 },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  formContainer: { width: '100%' },
  label: { color: '#b0b0b0', fontSize: 12, marginBottom: 6, fontWeight: 'bold' },
  input: { backgroundColor: '#151515', borderWidth: 1, borderColor: '#252525', color: '#ffffff', padding: 12, borderRadius: 4, marginBottom: 15 },
  selectButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  selectButtonText: { color: '#ffffff' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#151515', borderRadius: 8, borderWidth: 1, borderColor: '#333', padding: 20, maxHeight: '60%' },
  modalTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#222' },
  modalItemText: { color: '#ddd', fontSize: 14 },
  modalCloseButton: { marginTop: 15, backgroundColor: '#333', padding: 12, borderRadius: 4, alignItems: 'center' },
  modalCloseText: { color: '#fff', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfWidth: { width: '48%' },
  tallasContainer: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#151515', borderColor: '#252525', borderRadius: 8, padding: 12, marginBottom: 15, borderWidth: 1 },
  tallaBox: { alignItems: 'center' },
  tallaLabel: { color: '#fff', fontSize: 11, fontWeight: 'bold', marginBottom: 5 },
  tallaInput: { backgroundColor: '#000', borderWidth: 1, borderColor: '#333', color: '#fff', width: 38, height: 35, textAlign: 'center', borderRadius: 4 },
  textArea: { height: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#ffffff', paddingVertical: 14, borderRadius: 4, alignItems: 'center', marginTop: 5, marginBottom: 10 },
  saveButtonText: { color: '#000000', fontWeight: 'bold', fontSize: 14 },
  cancelButton: { alignItems: 'center', paddingVertical: 8 },
  cancelButtonText: { color: '#555', fontSize: 14 }
});
