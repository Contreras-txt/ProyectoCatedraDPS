import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, apiHandlers } from '../config/api';
import { AlertContext } from './AlertContext'; // Importamos las alertas globales

export const CartContext = createContext();

const CART_KEY = '@novatrend_cart';
const SESSION_KEY = '@novatrend_session';

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [userSession, setUserSession] = useState(null);
  const [ready, setReady] = useState(false);

  // Consumimos el contexto de alertas
  const { showAlert, showToast } = useContext(AlertContext);

  useEffect(() => {
    (async () => {
      try {
        const [storedCart, storedSession] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(SESSION_KEY),
        ]);
        if (storedCart) setCart(JSON.parse(storedCart));
        if (storedSession) setUserSession(JSON.parse(storedSession));
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  // Guardar el carrito cuando haya cambios
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(CART_KEY, JSON.stringify(cart)).catch(() => {});
  }, [cart, ready]);

  // ── INTERCEPCIÓN GLOBAL DE LA API ──
  useEffect(() => {
    apiHandlers.onNetworkError = () => {
      showToast({ message: 'Sin conexión a internet. Revisa tu red.', type: 'danger' });
    };

    apiHandlers.onSessionExpired = () => {
      showAlert({
        title: 'Sesión Expirada',
        message: 'Tu sesión ha caducado por seguridad. Por favor, inicia sesión nuevamente.',
        type: 'warning',
        actions: [{ 
          text: 'ENTENDIDO', 
          onPress: () => logoutClient() // Cierra sesión automáticamente
        }]
      });
    };
  }, []); // Se ejecuta una sola vez al cargar el proveedor

  // Métodos del carrito
  const addToCart = (product, size, qty = 1) => {
    const cantidad = Math.max(1, Math.min(99, parseInt(qty, 10) || 1));
    setCart((prev) => {
      const existing = prev.find((i) => i.IDProducto === product.IDProducto && i.talla === size);
      if (existing) {
        return prev.map((i) =>
          i.IDProducto === product.IDProducto && i.talla === size
            ? { ...i, cantidad: Math.min(99, i.cantidad + cantidad) }
            : i
        );
      }
      return [...prev, { ...product, talla: size, cantidad }];
    });
    // Toast opcional para feedback al usuario
    showToast({ message: 'Agregado al carrito', type: 'success' });
  };

  const updateQuantity = (productId, size, change) => {
    setCart((prev) =>
      prev.map((i) =>
        i.IDProducto === productId && i.talla === size
          ? { ...i, cantidad: Math.max(1, Math.min(99, i.cantidad + change)) }
          : i
      )
    );
  };

  const removeFromCart = (productId, size) => {
    setCart((prev) => prev.filter((i) => !(i.IDProducto === productId && i.talla === size)));
  };

  const clearCart = () => setCart([]);

  // Sesión
  const loginClient = async (userData) => {
    setUserSession(userData);
    await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(userData));
  };

  const logoutClient = async () => {
    const previous = userSession;
    setUserSession(null);
    await AsyncStorage.removeItem(SESSION_KEY);
    if (previous?.token) {
      fetch(`${API_BASE}/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idCliente: previous.id, token: previous.token }),
      }).catch(() => {});
    }
  };

  const cartTotal = cart.reduce((sum, i) => sum + parseFloat(i.Precio) * i.cantidad, 0);
  const cartCount = cart.reduce((n, i) => n + i.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        cart, addToCart, updateQuantity, removeFromCart, clearCart,
        cartTotal, cartCount, userSession, loginClient, logoutClient, ready,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};