import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AdminClientesScreen from '../views/AdminClientesScreen';
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/RegisterScreen';
import HomeScreen from '../views/HomeScreen';
import AdminLoginScreen from '../views/AdminLoginScreen';
import AdminDashboardScreen from '../views/AdminDashboardScreen';
import InventoryScreen from '../views/InventoryScreen';
import NewProductScreen from '../views/NewProductScreen';
import CategoriesScreen from '../views/CategoriesScreen';
import NewCategoryScreen from '../views/NewCategoryScreen';
import CheckoutScreen from '../views/CheckoutScreen';
import ProductDetailScreen from '../views/ProductDetailScreen';

// --- NUEVAS PANTALLAS ---
import MiPerfilScreen from '../views/MiPerfilScreen';
import MisPedidosScreen from '../views/MisPedidosScreen';
import DetallePedidoScreen from '../views/DetallePedidoScreen';
import AdminPedidosScreen from '../views/AdminPedidosScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CheckoutScreen" component={CheckoutScreen} options={{ headerShown: false }}/>
        
        {/* Rutas Cliente Perfil */}
        <Stack.Screen name="MiPerfilScreen" component={MiPerfilScreen} options={{ headerShown: false }} />
        <Stack.Screen name="MisPedidosScreen" component={MisPedidosScreen} options={{ headerShown: false }} />
        <Stack.Screen name="DetallePedidoScreen" component={DetallePedidoScreen} options={{ headerShown: false }} />

        {/* Rutas Admin */}
        <Stack.Screen name="AdminLoginScreen" component={AdminLoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ headerShown: false }} />
        <Stack.Screen name="InventoryScreen" component={InventoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="NewProductScreen" component={NewProductScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CategoriesScreen" component={CategoriesScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="NewCategoryScreen" component={NewCategoryScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AdminPedidosScreen" component={AdminPedidosScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="AdminClientesScreen" component={AdminClientesScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}