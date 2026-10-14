import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

// CORRECCIÓN: Importamos API_BASE desde la configuración centralizada.
import { API_BASE } from '../config/api';

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/admin/categorias/lista`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error al obtener categorías:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createCategory = async (catData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/categorias/crear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Éxito', 'Categoría creada correctamente');
        getCategories();
        return true;
      } else {
        Alert.alert('Error', data.message || 'No se pudo crear');
        return false;
      }
    } catch (error) {
      console.error('Error al crear categoría:', error);
      return false;
    }
  };

  const updateCategory = async (catData) => {
    try {
      const response = await fetch(`${API_BASE}/admin/categorias/editar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(catData),
      });
      const data = await response.json();
      if (data.status === 'success') {
        Alert.alert('Éxito', 'Categoría actualizada correctamente');
        getCategories();
        return true;
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar');
        return false;
      }
    } catch (error) {
      console.error('Error al actualizar categoría:', error);
      return false;
    }
  };

  return {
    categories,
    isLoading,
    getCategories,
    createCategory,
    updateCategory,
  };
}