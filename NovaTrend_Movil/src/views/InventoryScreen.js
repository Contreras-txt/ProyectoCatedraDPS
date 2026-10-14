import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useInventory } from "../viewmodels/useInventory";
import { AlertContext } from "../context/AlertContext";
import { getImageUrl } from "../config/api"; // Importación para manejar fotos dinámicamente

export default function InventoryScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const { products, isLoading, getProducts, deleteProduct } = useInventory();
  
  // Consumo del sistema global de alertas
  const { showAlert, showToast } = useContext(AlertContext);

  useFocusEffect(
    useCallback(() => {
      getProducts();
    }, [getProducts]),
  );

  const filteredProducts = products.filter(
    (product) =>
      product.NombreProducto &&
      product.NombreProducto.toLowerCase().includes(search.toLowerCase()),
  );

  const confirmarEliminacion = (item) => {
    showAlert({
      title: 'Eliminar Producto',
      message: `¿Estás seguro que deseas eliminar "${item.NombreProducto}" del inventario? Esta acción no se puede deshacer.`,
      type: 'danger',
      theme: 'dark', // Estricto para el admin
      actions: [
        { text: 'CANCELAR', style: 'cancel' },
        { 
          text: 'ELIMINAR', 
          style: 'destructive',
          onPress: async () => {
            await deleteProduct(item.IDProducto);
            showToast({ message: 'Producto eliminado correctamente.', type: 'success', theme: 'dark' });
            getProducts(); // Refrescar la lista
          }
        }
      ]
    });
  };

  const renderProduct = ({ item }) => {
    // Lógica para indicador visual de stock bajo
    const stock = item.TotalStock ?? 0;
    const isLowStock = stock <= 5;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          {isLowStock && (
            <View style={styles.lowStockBadge}>
              <Ionicons name="warning" size={10} color="#fff" style={{ marginRight: 3 }} />
              <Text style={styles.lowStockText}>Stock Bajo ({stock})</Text>
            </View>
          )}
        </View>

        <View style={styles.cardBody}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: getImageUrl(item.Imagen) }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>

          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>{item.NombreProducto}</Text>
            <Text style={styles.productCategory}>{item.NombreCategoria || 'Sin Categoría'}</Text>
            <Text style={styles.productPrice}>${parseFloat(item.Precio).toFixed(2)}</Text>
            
            {!isLowStock && (
              <Text style={styles.stockText}>Stock disponible: {stock}</Text>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity
            style={styles.actionBtnEdit}
            onPress={() => navigation.navigate("NewProductScreen", { product: item })}
          >
            <Ionicons name="pencil" size={14} color="#000" style={{ marginRight: 4 }} />
            <Text style={styles.btnTextEdit}>EDITAR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtnDelete}
            onPress={() => confirmarEliminacion(item)}
          >
            <Ionicons name="trash" size={14} color="#fff" style={{ marginRight: 4 }} />
            <Text style={styles.btnTextDelete}>ELIMINAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>INVENTARIO</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.newButton} onPress={() => navigation.navigate("NewProductScreen")}>
            <Ionicons name="add" size={16} color="#000" style={{ marginRight: 4 }} />
            <Text style={styles.newButtonText}>NUEVO PRODUCTO</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por nombre..."
          placeholderTextColor="#666"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#ffffff" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredProducts}
          keyExtractor={(item) => item.IDProducto.toString()}
          renderItem={renderProduct}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={50} color="#333" />
              <Text style={styles.emptyText}>No se encontraron productos.</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0a0a0a" },
  header: { padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "900", letterSpacing: 1 },
  headerButtons: { flexDirection: "row", alignItems: 'center' },
  backButton: { padding: 8, backgroundColor: "#222", borderRadius: 4, marginRight: 10 },
  newButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#fff", paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  newButtonText: { color: "#000", fontWeight: "bold", fontSize: 11, letterSpacing: 0.5 },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: "#151515", borderWidth: 1, borderColor: "#252525", marginHorizontal: 20, marginBottom: 20, borderRadius: 6, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, color: "#fff", paddingVertical: 12, fontSize: 14 },
  listContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  
  // Diseño de Tarjetas (Cards)
  card: { backgroundColor: "#151515", borderRadius: 10, borderWidth: 1, borderColor: "#222", marginBottom: 15, overflow: 'hidden' },
  cardHeader: { position: 'absolute', top: 10, right: 10, zIndex: 1 },
  lowStockBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e74c3c', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  lowStockText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  
  cardBody: { flexDirection: 'row', padding: 15 },
  imageContainer: { width: 70, height: 70, backgroundColor: "#000", borderRadius: 6, overflow: 'hidden', marginRight: 15 },
  productImage: { width: '100%', height: '100%' },
  
  productInfo: { flex: 1, justifyContent: 'center' },
  productName: { color: "#fff", fontSize: 15, fontWeight: "bold", marginBottom: 4 },
  productCategory: { color: "#888", fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  productPrice: { color: "#2ecc71", fontSize: 16, fontWeight: "900" },
  stockText: { color: "#aaa", fontSize: 11, marginTop: 4 },
  
  cardFooter: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#222' },
  actionBtnEdit: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', paddingVertical: 12 },
  btnTextEdit: { color: "#000", fontSize: 11, fontWeight: "bold", letterSpacing: 1 },
  actionBtnDelete: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#333', paddingVertical: 12 },
  btnTextDelete: { color: "#fff", fontSize: 11, fontWeight: "bold", letterSpacing: 1 },

  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#555', marginTop: 10, fontSize: 14 }
});