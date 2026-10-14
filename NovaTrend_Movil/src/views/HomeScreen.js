import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, FlatList, TextInput, TouchableOpacity,
  Platform, StatusBar, ActivityIndicator, ScrollView, Image, Modal, Pressable,
  ImageBackground
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProductCard from '../components/ProductCard';
import SideDrawer from '../components/SideDrawer';
import { CartContext } from '../context/CartContext';
import { AlertContext } from '../context/AlertContext'; // IMPORTAMOS TU CONTEXTO
import { API_BASE, getImageUrl } from '../config/api';

const TAB_A_SECCION = { HOMBRES: 'Caballeros', MUJERES: 'Damas', NIÑOS: 'Niños' };
const SECCION_A_TAB = { Caballeros: 'HOMBRES', Damas: 'MUJERES', Niños: 'NIÑOS' };
const ORDEN_MENU = ['Damas', 'Caballeros', 'Niños'];

export default function HomeScreen({ navigation, route }) {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [seccionActiva, setSeccionActiva] = useState('INICIO');
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');

  const [menuLateral, setMenuLateral] = useState(false);
  const [menuCarrito, setMenuCarrito] = useState(false);
  const [menuUsuario, setMenuUsuario] = useState(false);

  const { cart, cartTotal, cartCount, removeFromCart, updateQuantity, userSession, logoutClient } = useContext(CartContext);
  const { showAlert } = useContext(AlertContext); // USAMOS TU CONTEXTO OSCURO
  const listRef = useRef(null);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      // ── AQUÍ SE CAMBIÓ LA RUTA (YA NO USA /ADMIN/) ──
      const [rp, rc] = await Promise.all([
        fetch(`${API_BASE}/productos`),
        fetch(`${API_BASE}/categorias`),
      ]);
      if (!rp.ok || !rc.ok) throw new Error('HTTP');
      setProductos(await rp.json());
      setCategorias(await rc.json());
    } catch (err) {
      console.error('Error conectando con el backend:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarDatos(); }, [cargarDatos]);

  useEffect(() => {
    if (route?.params?.openCart) {
      setMenuCarrito(true);
      navigation.setParams({ openCart: false });
    }
  }, [route?.params?.openCart]);

  const getCategoria = (idCat) => categorias.find((c) => Number(c.IDCategoria) === Number(idCat));
  const getNombreCategoria = (idCat) => getCategoria(idCat)?.NombreCategoria || '';
  const getSeccionCategoria = (idCat) => getCategoria(idCat)?.Seccion || '';

  const productosFiltrados = productos.filter((p) => {
    const cat = getCategoria(p.IDCategoria);
    if (seccionActiva !== 'INICIO' && cat?.Seccion !== TAB_A_SECCION[seccionActiva]) return false;
    if (filtroCategoria !== 'Todos' && Number(p.IDCategoria) !== Number(filtroCategoria)) return false;
    if (busqueda.trim() !== '') {
      const t = busqueda.trim().toLowerCase();
      const ok = p.NombreProducto.toLowerCase().includes(t) || (cat?.NombreCategoria || '').toLowerCase().includes(t);
      if (!ok) return false;
    }
    return true;
  });

  const categoriasActuales = seccionActiva === 'INICIO'
    ? categorias
    : categorias.filter((c) => c.Seccion === TAB_A_SECCION[seccionActiva]);

  const tituloLista = filtroCategoria !== 'Todos'
    ? getNombreCategoria(filtroCategoria).toUpperCase()
    : seccionActiva === 'INICIO' ? 'TODOS LOS PRODUCTOS' : seccionActiva;

  const irAProductos = () => listRef.current?.scrollToOffset({ offset: 250, animated: true });

  const abrirProducto = (item) =>
    navigation.navigate('ProductDetail', {
      product: item,
      categoryName: getNombreCategoria(item.IDCategoria),
      section: getSeccionCategoria(item.IDCategoria),
    });

  const handleUsuario = () => (userSession ? setMenuUsuario(true) : navigation.navigate('Login'));

  const handleLogout = () => {
    setMenuUsuario(false);
    // ── CAMBIO: AHORA USA EL CONTEXTO EN LUGAR DEL ALERT NATIVO ──
    showAlert({
      title: 'Cerrar sesión',
      message: '¿Seguro que quieres cerrar tu sesión?',
      type: 'warning',
      theme: 'light',
      actions: [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesión', style: 'destructive', onPress: () => logoutClient() },
      ]
    });
  };

  const handleCheckout = () => {
    setMenuCarrito(false);
    navigation.navigate(userSession ? 'CheckoutScreen' : 'Login');
  };

  const listHeader = (
    <View>
      <ImageBackground 
        source={require('../../assets/p-inicio.jpg')} 
        style={styles.bannerContainer}
        imageStyle={{ resizeMode: 'cover' }}
      >
        <View style={styles.bannerOverlay}>
          <Text style={styles.bannerSeason}>TEMPORADA 2026</Text>
          <Text style={styles.bannerTitle}>NUEVA{'\n'}COLECCIÓN</Text>
          <TouchableOpacity style={styles.bannerBtn} onPress={irAProductos}>
            <Text style={styles.bannerBtnText}>¡DESCÚBRELA AHORA!</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>

      <View style={styles.filterBar}>
        <Text style={styles.filterLabel}>FILTRAR POR:</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={filtroCategoria === 'Todos' ? styles.pillActive : styles.pill} onPress={() => setFiltroCategoria('Todos')}>
            <Text style={filtroCategoria === 'Todos' ? styles.pillTextActive : styles.pillText}>Todos</Text>
          </TouchableOpacity>
          {categoriasActuales.map((cat) => {
            const activo = Number(filtroCategoria) === Number(cat.IDCategoria);
            return (
              <TouchableOpacity key={cat.IDCategoria} style={activo ? styles.pillActive : styles.pill} onPress={() => setFiltroCategoria(cat.IDCategoria)}>
                <Text style={activo ? styles.pillTextActive : styles.pillText}>{cat.NombreCategoria}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.sectionTitle}>{tituloLista}</Text>
        <Text style={styles.productCount}>{productosFiltrados.length} productos</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <View style={styles.header}>
        <View style={styles.topBar}>
          <TouchableOpacity onPress={() => setMenuLateral(true)}>
            <Ionicons name="menu" size={30} color="#fff" />
          </TouchableOpacity>

          <Image source={require('../../assets/2.png')} style={styles.logoImg} resizeMode="contain" />

          <View style={styles.topBarIcons}>
            <TouchableOpacity onPress={handleUsuario} style={{ marginRight: 18 }}>
              <Ionicons name={userSession ? 'person' : 'person-outline'} size={23} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setMenuCarrito(true)}>
              <Ionicons name="bag-outline" size={23} color="#fff" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#777" />
          <TextInput
            placeholder="Buscar producto o categoría..."
            placeholderTextColor="#999"
            style={styles.searchInput}
            value={busqueda}
            onChangeText={setBusqueda}
            returnKeyType="search"
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={() => setBusqueda('')}>
              <Ionicons name="close-circle" size={18} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.navTabs}>
          {['INICIO', 'HOMBRES', 'MUJERES', 'NIÑOS'].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.navTabBtn, seccionActiva === tab && styles.navTabBtnActive]}
              onPress={() => { setSeccionActiva(tab); setFiltroCategoria('Todos'); }}
            >
              <Text style={[styles.navTab, seccionActiva === tab && styles.navTabActive]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        {loading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#000" /></View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={44} color="#999" />
            <Text style={styles.emptyText}>No pudimos cargar los productos.</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={cargarDatos}>
              <Text style={styles.retryText}>REINTENTAR</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={productosFiltrados}
            keyExtractor={(item) => item.IDProducto.toString()}
            renderItem={({ item }) => (
              <View style={styles.cell}>
                <ProductCard item={item} categoryName={getNombreCategoria(item.IDCategoria)} onPress={() => abrirProducto(item)} />
              </View>
            )}
            numColumns={2}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={40} color="#bbb" />
                <Text style={styles.emptyText}>No tenemos lo que buscas.</Text>
              </View>
            }
          />
        )}
      </View>

      <Modal visible={menuUsuario} transparent animationType="fade" onRequestClose={() => setMenuUsuario(false)}>
        <View style={{ flex: 1 }}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setMenuUsuario(false)} />
          <View style={styles.userMenu}>
            <Text style={styles.userName} numberOfLines={1}>Hola, {userSession?.nombre}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{userSession?.email}</Text>
            
            <TouchableOpacity 
              style={[styles.logoutRow, { borderTopWidth: 0, paddingBottom: 12, paddingTop: 6 }]} 
              onPress={() => { setMenuUsuario(false); navigation.navigate('MiPerfilScreen'); }}
            >
              <Ionicons name="person-circle-outline" size={20} color="#000" />
              <Text style={styles.logoutText}>MI PERFIL</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.logoutRow, { borderTopWidth: 0, paddingBottom: 16, paddingTop: 0 }]} 
              onPress={() => { setMenuUsuario(false); navigation.navigate('MisPedidosScreen'); }}
            >
              <Ionicons name="cube-outline" size={20} color="#000" />
              <Text style={styles.logoutText}>MIS PEDIDOS</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutRow} onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={20} color="#000" />
              <Text style={styles.logoutText}>CERRAR SESIÓN</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <SideDrawer visible={menuLateral} onClose={() => setMenuLateral(false)} side="left">
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>DEPARTAMENTOS</Text>
          <TouchableOpacity onPress={() => setMenuLateral(false)}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          {ORDEN_MENU.map((seccion) => (
            <View key={seccion} style={styles.menuSection}>
              <Text style={styles.menuSectionTitle}>{SECCION_A_TAB[seccion]}</Text>
              {categorias.filter((c) => c.Seccion === seccion).map((cat) => (
                <TouchableOpacity
                  key={cat.IDCategoria}
                  style={styles.menuItem}
                  onPress={() => {
                    setSeccionActiva(SECCION_A_TAB[seccion]);
                    setFiltroCategoria(cat.IDCategoria);
                    setMenuLateral(false);
                  }}
                >
                  <Text style={styles.menuItemText}>{cat.NombreCategoria}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#000" />
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </SideDrawer>

      <SideDrawer visible={menuCarrito} onClose={() => setMenuCarrito(false)} side="right">
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>TU CARRITO</Text>
          <TouchableOpacity onPress={() => setMenuCarrito(false)}>
            <Ionicons name="close" size={28} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {cart.map((item) => (
            <View key={`${item.IDProducto}-${item.talla}`} style={styles.cartItem}>
              <Image source={{ uri: getImageUrl(item.Imagen) }} style={styles.cartItemImg} />
              <View style={styles.cartItemInfo}>
                <Text style={styles.cartItemName} numberOfLines={2}>{item.NombreProducto}</Text>
                <Text style={styles.cartItemDesc}>{getNombreCategoria(item.IDCategoria)} · Talla {item.talla}</Text>

                <View style={styles.cartItemActions}>
                  <View style={styles.qtyControls}>
                    <TouchableOpacity
                      onPress={() => updateQuantity(item.IDProducto, item.talla, -1)}
                      style={[styles.qtyBtn, item.cantidad <= 1 && { opacity: 0.35 }]}
                      disabled={item.cantidad <= 1}
                    >
                      <Ionicons name="remove" size={15} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.cantidad}</Text>
                    <TouchableOpacity onPress={() => updateQuantity(item.IDProducto, item.talla, 1)} style={styles.qtyBtn}>
                      <Ionicons name="add" size={15} color="#000" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.cartItemPrice}>${(item.Precio * item.cantidad).toFixed(2)}</Text>
                </View>

                <TouchableOpacity onPress={() => removeFromCart(item.IDProducto, item.talla)}>
                  <Text style={styles.removeText}>Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {cart.length === 0 && <Text style={styles.emptyCartText}>Tu carrito está vacío.</Text>}
        </ScrollView>

        {cart.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Subtotal</Text>
              <Text style={styles.sumValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            <View style={styles.sumRow}>
              <Text style={styles.sumLabel}>Envío</Text>
              <Text style={styles.sumValue}>Gratis</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL</Text>
              <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout}>
              <Text style={styles.checkoutBtnText}>
                {userSession ? 'PROCEDER AL PAGO' : 'INICIAR SESIÓN PARA COMPRAR'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </SideDrawer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#000', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  body: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: { backgroundColor: '#000' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 15, paddingVertical: 10 },
  logoImg: { width: 110, height: 38 },
  topBarIcons: { flexDirection: 'row', alignItems: 'center' },
  cartBadge: { position: 'absolute', top: -7, right: -9, backgroundColor: '#fff', borderRadius: 9, minWidth: 18, height: 18, paddingHorizontal: 3, justifyContent: 'center', alignItems: 'center' },
  cartBadgeText: { color: '#000', fontSize: 10, fontWeight: 'bold' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 15, height: 42, paddingHorizontal: 12, borderRadius: 2, marginBottom: 12 },
  searchInput: { flex: 1, fontSize: 14, color: '#000', marginLeft: 8, paddingVertical: 0 },
  navTabs: { flexDirection: 'row' },
  navTabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  navTabBtnActive: { borderBottomColor: '#fff' },
  navTab: { fontSize: 11, fontWeight: 'bold', color: '#8c8c8c', letterSpacing: 1 },
  navTabActive: { color: '#fff' },

  listContainer: { paddingBottom: 30 },
  cell: { width: '50%', paddingHorizontal: 5 },

  bannerContainer: { width: '100%', height: 230 },
  bannerOverlay: { flex: 1, justifyContent: 'flex-end', padding: 22, backgroundColor: 'rgba(0,0,0,0.3)' },
  bannerSeason: { color: '#fff', fontSize: 9, letterSpacing: 2, fontWeight: 'bold', marginBottom: 6, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 1}, textShadowRadius: 3 },
  bannerTitle: { color: '#fff', fontSize: 26, fontWeight: '900', lineHeight: 28, marginBottom: 14, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
  bannerBtn: { backgroundColor: '#fff', alignSelf: 'flex-start', paddingHorizontal: 14, paddingVertical: 8, elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width: 0, height: 2}, shadowRadius: 3 },
  bannerBtnText: { fontSize: 11, fontWeight: 'bold', color: '#000', letterSpacing: 0.5 },

  filterBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F2F2F2', paddingHorizontal: 15, paddingVertical: 12 },
  filterLabel: { fontSize: 9, fontWeight: 'bold', color: '#777', marginRight: 10, letterSpacing: 1 },
  pillActive: { backgroundColor: '#000', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8 },
  pillTextActive: { color: '#fff', fontSize: 12, fontWeight: '600' },
  pill: { backgroundColor: '#fff', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#D5D5D5' },
  pillText: { color: '#444', fontSize: 12 },

  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingHorizontal: 15, paddingTop: 18, paddingBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#000', letterSpacing: 0.5, flexShrink: 1 },
  productCount: { fontSize: 10, color: '#888' },
  emptyContainer: { alignItems: 'center', paddingVertical: 50 },
  emptyText: { color: '#777', marginTop: 10, fontSize: 14 },
  retryBtn: { marginTop: 16, backgroundColor: '#000', paddingHorizontal: 22, paddingVertical: 12 },
  retryText: { color: '#fff', fontWeight: 'bold', letterSpacing: 1, fontSize: 12 },

  userMenu: { position: 'absolute', top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 52 : 100, right: 12, width: 230, backgroundColor: '#fff', borderRadius: 6, padding: 16, elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  userName: { fontSize: 15, fontWeight: '900', color: '#000' },
  userEmail: { fontSize: 11, color: '#777', marginTop: 2, marginBottom: 12 },
  logoutRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 12 },
  logoutText: { marginLeft: 8, fontSize: 12, fontWeight: 'bold', letterSpacing: 1, color: '#000' },

  drawerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#E5E5E5', marginBottom: 6 },
  drawerTitle: { color: '#000', fontSize: 20, fontWeight: '900', letterSpacing: 0.5 },
  menuSection: { marginTop: 18, marginBottom: 6 },
  menuSectionTitle: { color: '#000', fontSize: 14, fontWeight: '900', marginBottom: 6, letterSpacing: 0.5 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11 },
  menuItemText: { color: '#222', fontSize: 14 },

  cartItem: { flexDirection: 'row', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EFEFEF' },
  cartItemImg: { width: 70, height: 92, backgroundColor: '#F2F2F2' },
  cartItemInfo: { flex: 1, marginLeft: 12 },
  cartItemName: { color: '#000', fontSize: 14, fontWeight: '500' },
  cartItemDesc: { color: '#888', fontSize: 11, marginTop: 2, marginBottom: 8 },
  cartItemActions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  qtyControls: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { borderWidth: 1, borderColor: '#999', borderRadius: 13, width: 26, height: 26, justifyContent: 'center', alignItems: 'center' },
  qtyText: { color: '#000', marginHorizontal: 12, fontSize: 13 },
  cartItemPrice: { color: '#000', fontSize: 15, fontWeight: '900' },
  removeText: { color: '#555', fontSize: 11, textDecorationLine: 'underline', marginTop: 8 },
  emptyCartText: { color: '#888', textAlign: 'center', marginTop: 40, fontSize: 14 },
  cartFooter: { paddingTop: 14, borderTopWidth: 1, borderTopColor: '#E5E5E5' },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  sumLabel: { color: '#555', fontSize: 13 },
  sumValue: { color: '#333', fontSize: 13 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, paddingTop: 12, borderTopWidth: 2, borderTopColor: '#000', marginBottom: 14 },
  totalLabel: { color: '#000', fontSize: 16, fontWeight: '900' },
  totalValue: { color: '#000', fontSize: 20, fontWeight: '900' },
  checkoutBtn: { backgroundColor: '#000', paddingVertical: 16, alignItems: 'center' },
  checkoutBtnText: { color: '#fff', fontWeight: '900', fontSize: 12, letterSpacing: 1.5 },
});