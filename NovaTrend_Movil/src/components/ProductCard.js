import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getImageUrl } from '../config/api';

export default function ProductCard({ item, categoryName, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.imageContainer}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>NUEVO</Text>
        </View>
        <Image source={{ uri: getImageUrl(item.Imagen) }} style={styles.image} resizeMode="cover" />
      </View>
      <View style={styles.info}>
        <Text style={styles.category}>{categoryName ? categoryName.toUpperCase() : 'CATEGORÍA'}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.NombreProducto}</Text>

        <View style={styles.sizeContainer}>
          {item.TallasDisp
            ? item.TallasDisp.split(',').slice(0, 5).map((talla, index) => (
                <View key={index} style={styles.sizeBox}>
                  <Text style={styles.sizeText}>{talla.trim()}</Text>
                </View>
              ))
            : null}
        </View>

        <Text style={styles.price}>${Number(item.Precio).toFixed(2)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', margin: 5 },
  imageContainer: { width: '100%', aspectRatio: 0.75, backgroundColor: '#F2F2F2', position: 'relative' },
  image: { width: '100%', height: '100%' },
  badge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#000', paddingHorizontal: 6, paddingVertical: 3, zIndex: 1 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  info: { paddingVertical: 10, paddingHorizontal: 2 },
  category: { color: '#8a8a8a', fontSize: 9, letterSpacing: 1, marginBottom: 3 },
  name: { color: '#000', fontSize: 12, fontWeight: '600', marginBottom: 8, minHeight: 32 },
  sizeContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  sizeBox: { borderWidth: 1, borderColor: '#D5D5D5', backgroundColor: '#F7F7F7', paddingHorizontal: 6, paddingVertical: 2, marginRight: 4, marginBottom: 4 },
  sizeText: { color: '#555', fontSize: 9 },
  price: { color: '#000', fontSize: 16, fontWeight: '900' },
});
