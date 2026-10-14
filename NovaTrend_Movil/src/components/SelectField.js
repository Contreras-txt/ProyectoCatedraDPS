import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Selector tipo "dropdown" sin dependencias extra (como el <select> del diseño web).
export default function SelectField({ value, onChange, options, placeholder = 'Selecciona…', title = 'Selecciona una opción' }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TouchableOpacity style={styles.field} onPress={() => setOpen(true)} activeOpacity={0.8}>
        <Text style={value ? styles.value : styles.placeholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.overlay}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => setOpen(false)} />
          <View style={styles.sheet}>
            <Text style={styles.title}>{title}</Text>
            <FlatList
              data={options}
              keyExtractor={(o) => o}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => { onChange(item); setOpen(false); }}
                >
                  <Text style={[styles.optionText, item === value && styles.optionActive]}>{item}</Text>
                  {item === value && <Ionicons name="checkmark" size={18} color="#000" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: { height: 50, borderWidth: 1, borderColor: '#E0E0E0', borderRadius: 4, paddingHorizontal: 15, backgroundColor: '#FAFAFA', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15 },
  value: { fontSize: 15, color: '#000', flex: 1 },
  placeholder: { fontSize: 15, color: '#7F8C8D', flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14, maxHeight: '65%', paddingTop: 16, paddingBottom: 20 },
  title: { fontSize: 13, fontWeight: '900', letterSpacing: 1, textAlign: 'center', marginBottom: 8, color: '#000' },
  option: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 22, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  optionText: { fontSize: 15, color: '#333' },
  optionActive: { fontWeight: 'bold', color: '#000' },
});
