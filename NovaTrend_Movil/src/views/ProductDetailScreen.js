import React, { useState, useContext } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, Image, TouchableOpacity, Platform, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartContext } from '../context/CartContext';
import { AlertContext } from '../context/AlertContext'; // NUEVO
import { getImageUrl } from '../config/api';

export default function ProductDetailScreen({ route, navigation }) {
  const { product, categoryName = '', section = '' } = route.params;
  const { addToCart, cartCount } = useContext(CartContext);
  const { showAlert } = useContext(AlertContext); // NUEVO

  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const tallasDisponibles = product.TallasDisp ? product.TallasDisp.split(',').map((t) => t.trim()).filter(Boolean) : [];
  
  const getStockForSize = (size) => {
    if (!size || !product.DetalleTallas) return 1;
    const tallasArray = product.DetalleTallas.split(',');
    const match = tallasArray.find(item => item.startsWith(`${size}:`));
    if (match) {
      return parseInt(match.split(':')[1], 10);
    }
    return 1;
  };

  const handleSizeChange = (talla) => {
      setSelectedSize(talla);
      const maxStockForNewSize = getStockForSize(talla);
      if (quantity > maxStockForNewSize) {
          setQuantity(maxStockForNewSize);
      }
  };

  const handleAddToCart = () => {
    if (tallasDisponibles.length > 0 && !selectedSize) {
      showAlert({ title: 'Selecciona una talla', message: 'Por favor, elige una talla antes de agregar al carrito.', type: 'warning' });
      return;
    }

    addToCart(product, selectedSize || 'Única', quantity);

    // REEMPLAZO: Alerta con botones dinámicos usando nuestro Contexto
    showAlert({
      title: '¡Agregado al carrito!',
      message: `${quantity} × ${product.NombreProducto}${selectedSize ? ` (Talla ${selectedSize})` : ''}`,
      type: 'success',
      actions: [
        { text: 'SEGUIR COMPRANDO', style: 'cancel', onPress: () => navigation.goBack() },
        { text: 'VER CARRITO', onPress: () => navigation.navigate('Home', { openCart: true }) }
      ]
    });
  };

  const currentMaxStock = getStockForSize(selectedSize);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.roundBtn}>
          <Ionicons name="arrow-back" size={22} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Home', { openCart: true })} style={styles.roundBtn}>
          <Ionicons name="bag-outline" size={22} color="#000" />
          {cartCount > 0 && (
            <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text></View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          {!!categoryName && <View style={styles.badge}><Text style={styles.badgeText}>{categoryName.toUpperCase()}</Text></View>}
          <Image source={{ uri: getImageUrl(product.Imagen) }} style={styles.image} resizeMode="cover" />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.tagsRow}>
            {!!section && <Text style={styles.tag}>{section.toUpperCase()}</Text>}
            {!!categoryName && <Text style={styles.tag}>{categoryName.toUpperCase()}</Text>}
          </View>

          <Text style={styles.title}>{product.NombreProducto.toUpperCase()}</Text>
          <Text style={styles.price}>${Number(product.Precio).toFixed(2)} <Text style={styles.currency}>USD</Text></Text>

          <View style={styles.descriptionBox}>
            <Text style={styles.descriptionText}>
              {product.Descripcion || 'Sin descripción disponible para este producto.'}
            </Text>
          </View>

          {tallasDisponibles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>TALLA</Text>
              <View style={styles.sizeRow}>
                {tallasDisponibles.map((talla) => (
                  <TouchableOpacity
                    key={talla}
                    style={[styles.sizeBtn, selectedSize === talla && styles.sizeBtnActive]}
                    onPress={() => handleSizeChange(talla)}
                  >
                    <Text style={[styles.sizeBtnText, selectedSize === talla && styles.sizeBtnTextActive]}>{talla}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>CANTIDAD {selectedSize ? `(Disp: ${currentMaxStock})` : ''}</Text>
            <View style={styles.quantityRow}>
              <TouchableOpacity style={[styles.qtyBtn, quantity <= 1 && { opacity: 0.35 }]} onPress={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>
                <Ionicons name="remove" size={18} color="#000" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={[styles.qtyBtn, quantity >= currentMaxStock && { opacity: 0.35 }]} onPress={() => setQuantity((q) => Math.min(currentMaxStock, q + 1))} disabled={quantity >= currentMaxStock}>
                <Ionicons name="add" size={18} color="#000" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.addToCartBtn} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>+ AGREGAR AL CARRITO</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (Estilos idénticos, omitidos por brevedad)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, position: 'absolute', top: Platform.OS === 'android' ? StatusBar.currentHeight : 0, left: 0, right: 0, zIndex: 10 },
  roundBtn: { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, width: 40, height: 40, justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  cartBadge: { position: 'absolute', top: -3, right: -3, backgroundColor: '#000', borderRadius: 9, minWidth: 18, height: 18, paddingHorizontal: 3, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  imageContainer: { width: '100%', height: 450, backgroundColor: '#F2F2F2' },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', bottom: 16, left: 16, backgroundColor: '#000', paddingHorizontal: 10, paddingVertical: 5, zIndex: 1 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  detailsContainer: { padding: 20 },
  tagsRow: { flexDirection: 'row', marginBottom: 10 },
  tag: { borderWidth: 1, borderColor: '#D5D5D5', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 15, marginRight: 8, color: '#666', fontSize: 9, letterSpacing: 1 },
  title: { color: '#000', fontSize: 24, fontWeight: '900', letterSpacing: 0.5, marginBottom: 10 },
  price: { color: '#000', fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  currency: { fontSize: 12, color: '#888', fontWeight: 'normal' },
  descriptionBox: { backgroundColor: '#F7F7F7', padding: 15, borderRadius: 4, marginBottom: 25, borderWidth: 1, borderColor: '#EAEAEA' },
  descriptionText: { color: '#444', fontSize: 13, lineHeight: 20 },
  section: { marginBottom: 25 },
  sectionLabel: { color: '#555', fontSize: 11, fontWeight: 'bold', letterSpacing: 1, marginBottom: 10 },
  sizeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  sizeBtn: { borderWidth: 1, borderColor: '#BBB', minWidth: 46, height: 46, paddingHorizontal: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10, marginBottom: 10, backgroundColor: '#fff' },
  sizeBtnActive: { backgroundColor: '#000', borderColor: '#000' },
  sizeBtnText: { color: '#000', fontSize: 12, fontWeight: 'bold' },
  sizeBtnTextActive: { color: '#fff' },
  quantityRow: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { width: 40, height: 40, borderWidth: 1, borderColor: '#999', justifyContent: 'center', alignItems: 'center', borderRadius: 20 },
  qtyText: { color: '#000', fontSize: 16, fontWeight: 'bold', width: 44, textAlign: 'center' },
  addToCartBtn: { backgroundColor: '#000', padding: 18, alignItems: 'center', marginBottom: 30 },
  addToCartText: { color: '#fff', fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },
});