import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_BASE = 'http://192.168.3.46/novatrend_api';

const PLACEHOLDER = 'https://dummyimage.com/300x400/e5e5e5/777777.jpg&text=Sin+Imagen';

export const getImageUrl = (name) => {
  if (!name || name.startsWith('file:')) return PLACEHOLDER;
  if (name.startsWith('http')) return name;
  return `${API_BASE}/img/${name}`;
};

export const apiHandlers = {
  onSessionExpired: null,
  onNetworkError: null
};

export async function apiPost(path, body) {
  // 1. LLAVE MAESTRA DE RESCATE PARA LA EXPOSICIÓN
  let token = 'llave_maestra_expo_2026'; 
  
  try {
    let sessionData = await AsyncStorage.getItem('@novatrend_session');
    if (!sessionData) sessionData = await AsyncStorage.getItem('adminSession');
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      if (session.token) token = session.token;
    }
  } catch (e) {}

  // 2. INYECCIÓN OBLIGATORIA DE CABECERAS
  const headers = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-Auth-Token': token 
  };

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (apiHandlers.onNetworkError) apiHandlers.onNetworkError();
    throw new Error('NETWORK_ERROR');
  }

  let data = null;
  try { data = await res.json(); } catch (e) {}

  const isLoginRequest = path.includes('login');

  if (res.status === 401 && !isLoginRequest) {
    if (apiHandlers.onSessionExpired) apiHandlers.onSessionExpired();
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok || !data || data.status === 'error') {
    const msg = (Array.isArray(data?.errores) && data.errores.join('\n')) || data?.message || 'Error en la solicitud.';
    const err = new Error(msg);
    err.status = res.status;
    throw err; 
  }
  
  return data;
}
