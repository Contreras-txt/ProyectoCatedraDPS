import React, { useEffect, useRef, useState } from 'react';
import { Modal, View, Animated, Pressable, StyleSheet, Dimensions, Platform, StatusBar } from 'react-native';

// Panel lateral (izquierda o derecha) con animación, como en el diseño de "Departamentos" y "Tu carrito".
export default function SideDrawer({ visible, onClose, side = 'left', children }) {
  const width = Math.min(Dimensions.get('window').width * 0.86, 420);
  const [mounted, setMounted] = useState(visible);
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setMounted(true);
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start(({ finished }) => {
        if (finished) setMounted(false);
      });
    }
  }, [visible, anim]);

  const dir = side === 'left' ? -1 : 1;
  const translateX = anim.interpolate({ inputRange: [0, 1], outputRange: [dir * width, 0] });

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose} statusBarTranslucent>
      <View style={[styles.root, { justifyContent: side === 'left' ? 'flex-start' : 'flex-end' }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.55)', opacity: anim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>
        <Animated.View style={[styles.panel, { width, transform: [{ translateX }] }]}>
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  panel: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 8 : 54,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
