// src/utils/validators.js

export const validateEmail = (email) => {
  if (!email) return 'El correo es obligatorio.';
  if (email.length > 100) return 'El correo no puede exceder 100 caracteres.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email) ? null : 'Ingresa un correo electrónico válido.';
};

export const validatePassword = (password) => {
  if (!password) return 'La contraseña es obligatoria.';
  if (password.length < 6) return 'Debe tener al menos 6 caracteres.';
  return null;
};

export const validateName = (name, fieldName = 'El campo') => {
  if (!name || !name.trim()) return `${fieldName} es obligatorio.`;
  if (name.length > 35) return `${fieldName} no puede exceder 35 caracteres.`;
  const re = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  return re.test(name) ? null : `${fieldName} solo puede contener letras.`;
};

export const validatePhone = (phone) => {
  if (!phone) return 'El teléfono es obligatorio.';
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 8) return 'El teléfono debe tener exactamente 8 dígitos.';
  return null;
};

export const validateAddress = (address, max = 100) => {
  if (!address || !address.trim()) return 'La dirección es obligatoria.';
  if (address.length > max) return `No puede exceder ${max} caracteres.`;
  return null;
};

export const validatePrice = (price) => {
  if (price === '' || price === null || price === undefined) return 'El precio es obligatorio.';
  const num = parseFloat(price);
  if (isNaN(num) || num < 0) return 'El precio debe ser un número positivo.';
  return null;
};

export const validateImageSize = (base64String, maxSizeMB = 2) => {
  if (!base64String || !base64String.includes('base64,')) return null; // Es una URL o string normal
  
  // Calcular tamaño aproximado del base64 en bytes
  const base64Length = base64String.length - (base64String.indexOf(',') + 1);
  const padding = (base64String.match(/=/g) || []).length;
  const sizeInBytes = (base64Length * 3 / 4) - padding;
  
  const sizeInMB = sizeInBytes / (1024 * 1024);
  if (sizeInMB > maxSizeMB) return `La imagen pesa ${sizeInMB.toFixed(2)}MB. El máximo es ${maxSizeMB}MB.`;
  return null;
};