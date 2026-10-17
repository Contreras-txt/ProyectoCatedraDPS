# NovaTrend - E-Commerce App

NovaTrend es una plataforma de comercio electrónico integral (Aplicación Móvil + API REST) diseñada para ofrecer una experiencia de compra fluida a los usuarios y un panel de control robusto para la administración del negocio. Desarrollado con React Native (Expo) en el frontend y PHP puro en el backend, el proyecto emplea una arquitectura MVC/MVVM y un estricto control de estado y seguridad[cite: 6, 8].

---

## Funcionalidades del Ecosistema

### 1. Aplicación de Tienda (Para el Cliente)
* **Catálogo Dinámico y Búsqueda:** Exploración de productos filtrados por categorías (Caballeros, Damas, Niños) y barra de búsqueda en tiempo real.
* **Módulo de Registro Inteligente (GPS):** Creación de cuentas con integración nativa de `expo-location` para el autocompletado de la dirección de entrega mediante *Reverse Geocoding*.
* **Gestión de Carrito y Checkout:** Sistema global de carrito que permite agregar productos por talla, calcular subtotales y procesar la orden de compra[cite: 7, 8].
* **Perfiles de Usuario:** Edición de información personal y actualización de contraseñas manteniendo el token de sesión activo[cite: 7, 8].
* **Historial de Pedidos:** Seguimiento en tiempo real de las compras pasadas con funcionalidad *Pull-to-refresh* y una línea de tiempo gráfica para ver el progreso del pedido (Pendiente, Aprobado, Entregado, Cancelado)[cite: 8].

### 2. Panel de Administración (Para el Negocio)
El acceso a este módulo está restringido mediante validación de token y presenta un tema visual oscuro de diseño responsivo basado en Tarjetas (Cards)[cite: 9]:
* **Gestión de Inventario (CRUD):** Creación y edición de productos. Incluye la carga de fotografías procesadas en Base64 (con límite de peso de 2MB)[cite: 7].
* **Control de Stock Dinámico:** Las "Tallas Disponibles" se recalculan dinámicamente según la tabla de inventario real[cite: 8]. Incluye alertas visuales automáticas cuando un producto registra "Stock Bajo" (5 unidades o menos).
* **Gestión de Categorías:** Módulo para administrar las secciones del catálogo[cite: 7].
* **Gestión Bidireccional de Pedidos:** Panel para revisar las órdenes entrantes y actualizar su estado. **Regla de negocio implementada:** Si el administrador "Cancela" un pedido, el stock se devuelve automáticamente al inventario disponible[cite: 7, 8].
* **Métricas de Clientes:** Listado completo de usuarios registrados, historial total de pedidos realizados y visualización del estado de seguridad de sus cuentas (ej. bloqueos)[cite: 7, 8].

### 3. Seguridad y Arquitectura Backend
La API está construida en PHP sin frameworks (vía XAMPP y PDO) y se comunica exclusivamente mediante JSON plano.
* **Protección contra Fuerza Bruta:** Bloqueo temporal de cuentas (15 minutos) tras 5 intentos fallidos de inicio de sesión[cite: 7, 8].
* **Autenticación Resiliente:** Sesiones gestionadas mediante tokens aleatorios de 64 caracteres hexadecimales (cifrados en SHA-256) con una caducidad de 30 días[cite: 7, 8].
* **Middlewares de Rutas:** Protección estricta en el `router.php`. Todos los endpoints que inician con `/admin/` exigen un Bearer Token válido en las cabeceras.
* **Integridad de Base de Datos:** Validaciones en cascada y manejo de claves foráneas para evitar que la aplicación colapse si un administrador intenta eliminar un producto que ya pertenece a una orden de compra histórica[cite: 8].

### 4. Experiencia de Usuario (UI/UX)
* **Sistema Global de Alertas (`AlertContext`):** La aplicación intercepta errores 401 (Sesión Expirada) y errores de red de manera silenciosa[cite: 7]. Se reemplazaron todas las alertas nativas del sistema operativo por modales y Toasts flotantes personalizados[cite: 8].

---

## Stack Tecnológico

* **Frontend:** React Native 0.86, Expo SDK 57, React Navigation 7, Context API.
* **Backend:** PHP 8+ (Controladores Frontales, PDO).
* **Base de Datos:** MySQL / MariaDB[cite: 6].

---

## Instrucciones de Instalación y Ejecución

Para evaluar el proyecto correctamente en un entorno local, siga estos pasos:

### 1. Configuración de la Base de Datos
1. Inicie **Apache** y **MySQL** en su panel de XAMPP[cite: 6].
2. Abra phpMyAdmin y cree una base de datos llamada `novatrend` (Cotejamiento `utf8mb4_unicode_ci`)[cite: 6].
3. Importe el archivo principal de la base de datos ubicado en `bd/novatrend.sql`[cite: 6].
4. **IMPORTANTE:** Ejecute obligatoriamente el script `bd/migracion_cliente.sql` para agregar las columnas de seguridad requeridas (`IntentosFallidos`, `BloqueadoHasta`, `TokenCreadoEn`) en las tablas `clientes` y `usuarios`[cite: 6].

### 2. Configuración del Backend (API)
1. Mueva la carpeta `novatrend_api` (que contiene los directorios `controllers`, `models`, `routes`, y `img`) dentro de la carpeta `C:\xampp\htdocs\`[cite: 6].
2. Verifique que la carpeta de imágenes (`htdocs/novatrend_api/img/`) contenga las fotografías del catálogo y el archivo `default.jpg`.

### 3. Configuración del Frontend (React Native)
1. Abra la terminal, navegue a la carpeta del frontend (`NovaTrend_Movil`) y ejecute:
   ```bash
   npm install
PASO CRÍTICO: Abra el archivo src/config/api.js[cite: 6]. Modifique la constante API_BASE reemplazando la IP por la dirección IPv4 local de su computadora (ej. 192.168.1.15). No utilice localhost ya que el emulador/dispositivo físico no lo reconocerá.
export const API_BASE = 'http://SU_DIRECCION_IPV4/novatrend_api';

Inicie el servidor de desarrollo de Expo[cite: 6]:
npx expo start

Escanee el código QR con la aplicación Expo Go en su dispositivo físico o presione a para abrir en el emulador de Android.

Credenciales de Acceso
Panel de Administración:
Usuario: admin
Contraseña: admin123

Tienda (Cliente):
Se recomienda crear un usuario nuevo desde la aplicación móvil utilizando el botón "Usar mi ubicación" para evaluar el módulo nativo de GPS y la creación del Token de sesión.
npx expo install @react-native-community/calendar
npx expo install @react-native-community/datetimepicker
