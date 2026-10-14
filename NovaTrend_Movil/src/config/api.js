// src/config/api.js
export const API_BASE = 'http://192.168.X.X/novatrend_api';

const PLACEHOLDER = 'https://dummyimage.com/300x400/e5e5e5/777777.jpg&text=Sin+Imagen';

export const getImageUrl = (name) => {
  // Quitamos la restricción de 'default.jpg'
  if (!name || name.startsWith('file:')) return PLACEHOLDER;
  if (name.startsWith('http')) return name;
  // Ahora sí enlazará hacia http://192.168.3.46/novatrend_api/img/default.jpg
  return `${API_BASE}/img/${name}`;
};

// Objeto global para conectar la API con el contexto de React (Alertas y Sesión)
export const apiHandlers = {
  onSessionExpired: null,
  onNetworkError: null
};

// POST JSON.
export async function apiPost(path, body) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch (e) {
    if (apiHandlers.onNetworkError) apiHandlers.onNetworkError();
    throw new Error('NETWORK_ERROR'); // Detenemos la ejecución silenciosamente
  }

  let data = null;
  try { data = await res.json(); } catch (e) { /* respuesta no JSON */ }

  // CORRECCIÓN: Verificamos si la ruta es de login (ej. '/login' o '/admin/login')
  const isLoginRequest = path.includes('login');

  // Interceptar Error 401 (Token Expirado) SOLO si no estamos intentando iniciar sesión
  if (res.status === 401 && !isLoginRequest) {
    if (apiHandlers.onSessionExpired) apiHandlers.onSessionExpired();
    throw new Error('SESSION_EXPIRED'); // El handler global se encargará de esto
  }

  // Manejar errores normales (incluyendo contraseña incorrecta durante el login)
  if (!res.ok || !data || data.status === 'error') {
    const msg = (Array.isArray(data?.errores) && data.errores.join('\n'))
      || data?.message
      || 'No se pudo completar la solicitud.';
    const err = new Error(msg);
    err.status = res.status;
    throw err; // Esto enviará el texto "Correo o contraseña incorrectos" directo a tu pantalla de Login
  }
  
  return data;
}
