import React, { createContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const AlertContext = createContext();

const { width } = Dimensions.get('window');

export const AlertProvider = ({ children }) => {
  // Estado para el Modal de Alerta / Confirmación
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info', // 'info', 'success', 'warning', 'danger'
    theme: 'light', // 'light' (cliente), 'dark' (admin)
    actions: [] // [{ text: 'OK', onPress: () => {}, style: 'default' | 'destructive' | 'cancel' }]
  });

  // Estado para el Toast
  const [toastConfig, setToastConfig] = useState({
    visible: false,
    message: '',
    type: 'success',
    theme: 'light'
  });

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-50)).current;

  // ── Funciones Expuestas ──────────────────────────────────────

  const showAlert = useCallback(({ title, message, type = 'info', theme = 'light', actions = [] }) => {
    setAlertConfig({ visible: true, title, message, type, theme, actions });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  }, []);

  const showToast = useCallback(({ message, type = 'success', theme = 'light', duration = 3000 }) => {
    setToastConfig({ visible: true, message, type, theme });
    
    Animated.parallel([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.spring(toastTranslateY, { toValue: 50, useNativeDriver: true })
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.spring(toastTranslateY, { toValue: -50, useNativeDriver: true })
      ]).start(() => setToastConfig(prev => ({ ...prev, visible: false })));
    }, duration);
  }, []);

  // ── Renderizado de UI ───────────────────────────────────────

  const isDark = alertConfig.theme === 'dark';
  const modalBg = isDark ? '#151515' : '#ffffff';
  const textColor = isDark ? '#ffffff' : '#000000';
  const textMuted = isDark ? '#aaaaaa' : '#666666';
  const borderColor = isDark ? '#333333' : '#eeeeee';

  const getIcon = (type) => {
    switch (type) {
      case 'success': return <Ionicons name="checkmark-circle" size={40} color="#27ae60" />;
      case 'danger': return <Ionicons name="warning" size={40} color="#e74c3c" />;
      case 'warning': return <Ionicons name="alert-circle" size={40} color="#f39c12" />;
      default: return <Ionicons name="information-circle" size={40} color="#2980b9" />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert, showToast }}>
      {children}

      {/* MODAL DE ALERTA */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.alertBox, { backgroundColor: modalBg }]}>
            <View style={styles.iconContainer}>{getIcon(alertConfig.type)}</View>
            <Text style={[styles.alertTitle, { color: textColor }]}>{alertConfig.title}</Text>
            <Text style={[styles.alertMessage, { color: textMuted }]}>{alertConfig.message}</Text>
            
            <View style={styles.actionsContainer}>
              {alertConfig.actions.length === 0 ? (
                // Botón por defecto si no se envían acciones
                <TouchableOpacity style={[styles.button, { backgroundColor: textColor }]} onPress={hideAlert}>
                  <Text style={[styles.buttonText, { color: modalBg }]}>ACEPTAR</Text>
                </TouchableOpacity>
              ) : (
                alertConfig.actions.map((action, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.actionButton,
                      action.style === 'destructive' ? styles.btnDestructive : (action.style === 'cancel' ? [styles.btnCancel, { borderColor }] : { backgroundColor: textColor }),
                      alertConfig.actions.length > 1 && { flex: 1, marginHorizontal: 5 }
                    ]}
                    onPress={() => {
                      hideAlert();
                      if (action.onPress) action.onPress();
                    }}
                  >
                    <Text style={[
                      styles.actionText,
                      action.style === 'destructive' ? styles.textWhite : (action.style === 'cancel' ? { color: textColor } : { color: modalBg })
                    ]}>
                      {action.text}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* TOAST FLOTANTE */}
      {toastConfig.visible && (
        <Animated.View style={[
          styles.toastContainer, 
          { backgroundColor: toastConfig.theme === 'dark' ? '#222' : '#333', opacity: toastOpacity, transform: [{ translateY: toastTranslateY }] }
        ]}>
          <Ionicons 
            name={toastConfig.type === 'success' ? 'checkmark-circle' : (toastConfig.type === 'danger' ? 'close-circle' : 'information-circle')} 
            size={20} color="#fff" style={{ marginRight: 10 }} 
          />
          <Text style={styles.toastText}>{toastConfig.message}</Text>
        </Animated.View>
      )}
    </AlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  alertBox: { width: '100%', maxWidth: 340, borderRadius: 12, padding: 24, alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 },
  iconContainer: { marginBottom: 15 },
  alertTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center', letterSpacing: 0.5 },
  alertMessage: { fontSize: 14, textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  actionsContainer: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
  button: { width: '100%', paddingVertical: 14, borderRadius: 6, alignItems: 'center' },
  buttonText: { fontWeight: 'bold', fontSize: 13, letterSpacing: 1 },
  actionButton: { paddingVertical: 12, borderRadius: 6, alignItems: 'center', justifyContent: 'center', minWidth: 100 },
  btnDestructive: { backgroundColor: '#e74c3c' },
  btnCancel: { backgroundColor: 'transparent', borderWidth: 1 },
  actionText: { fontWeight: 'bold', fontSize: 12, letterSpacing: 1 },
  textWhite: { color: '#ffffff' },

  toastContainer: { position: 'absolute', top: 0, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 30, elevation: 6, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, zIndex: 9999 },
  toastText: { color: '#ffffff', fontSize: 13, fontWeight: '600' }
});