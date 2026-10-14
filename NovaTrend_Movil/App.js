import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { CartProvider } from './src/context/CartContext';
import { AlertProvider } from './src/context/AlertContext';

export default function App() {
  return (
    <AlertProvider>
      <CartProvider>
        <AppNavigator />
      </CartProvider>
    </AlertProvider>
  );
}