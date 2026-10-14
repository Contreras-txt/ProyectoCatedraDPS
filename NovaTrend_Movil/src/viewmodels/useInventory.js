import { useState, useCallback, useEffect, useContext } from 'react';
import { API_BASE, apiPost } from '../config/api';
import { AlertContext } from '../context/AlertContext';

export const useInventory = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Consumimos las nuevas alertas globales
  const { showAlert, showToast } = useContext(AlertContext);

  const getCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/categorias`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      showToast({ message: 'Error al obtener categorías', type: 'danger', theme: 'dark' });
    }
  }, [showToast]);

  const getProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/productos`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      showAlert({ title: 'Error', message: 'Hubo un problema al cargar el inventario.', type: 'danger', theme: 'dark' });
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    getCategories();
  }, [getCategories]);

  const createProduct = async (productData) => {
    try {
      const data = await apiPost('/admin/productos/crear', productData);
      if (data.status === 'success') {
        showToast({ message: 'Producto guardado exitosamente', type: 'success', theme: 'dark' });
        getProducts(); 
        return true;
      }
    } catch (error) {
      showAlert({ title: 'Error al crear', message: error.message, type: 'danger', theme: 'dark' });
      return false;
    }
  };

  const updateProduct = async (productData) => {
    try {
      const data = await apiPost('/admin/productos/editar', productData);
      if (data.status === 'success') {
        showToast({ message: 'Producto actualizado exitosamente', type: 'success', theme: 'dark' });
        getProducts(); 
        return true;
      }
    } catch (error) {
      showAlert({ title: 'Error al actualizar', message: error.message, type: 'danger', theme: 'dark' });
      return false;
    }
  };

  const deleteProduct = async (id) => {
    // Usamos el nuevo modal global para acciones destructivas
    showAlert({
      title: 'Confirmar eliminación',
      message: '¿Estás seguro de eliminar este producto del inventario?',
      type: 'warning',
      theme: 'dark',
      actions: [
        { text: 'CANCELAR', style: 'cancel' },
        { 
          text: 'ELIMINAR', 
          style: 'destructive',
          onPress: async () => {
            try {
              const data = await apiPost('/admin/productos/eliminar', { id });
              if (data.status === 'success') {
                showToast({ message: 'Producto eliminado', type: 'success', theme: 'dark' });
                getProducts(); 
              }
            } catch (error) {
              // Aquí mostrará el mensaje que enviamos desde el Catch de PHP
              showAlert({ title: 'No se pudo eliminar', message: error.message, type: 'danger', theme: 'dark' });
            }
          }
        }
      ]
    });
  };

  return {
    products,
    categories,
    isLoading,
    getProducts,
    getCategories,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};