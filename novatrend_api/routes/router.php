<?php
// routes/router.php
// Front Controller: punto de entrada único que despacha rutas a controladores.
// Incluir desde index.php con: require_once 'routes/router.php';

session_start();
require_once __DIR__ . '/../config/conexion.php';

// ── PERMISOS DE RED (CORS) PARA REACT NATIVE ──
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Authorization, Content-Type, X-Auth-Token");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// Si es la petición fantasma de verificación, la dejamos pasar
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Obtener la ruta limpia
$base = BASE_URL;
$uri  = substr(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH), strlen($base));
$uri  = rtrim($uri, '/') ?: '/';

// ── Tabla de rutas ────────────────────────────────────────────
// [ método HTTP, patrón URI ] => [Controlador, método]
$routes = [
    // ── Tienda pública (LIBRE ACCESO) ────────────────
    ['GET|POST', '/',                    'StoreController',  'index'],
    ['GET',      '/productos',           'AdminController',  'listarProductos'],  // NUEVO: Ruta pública
    ['GET',      '/categorias',          'AdminController',  'listarCategorias'], // NUEVO: Ruta pública
    ['GET|POST', '/checkout',            'StoreController',  'checkout'],

    // ── Autenticación clientes ────────────────
    ['GET|POST', '/login',               'AuthController',   'loginCliente'],
    ['GET|POST', '/registro',            'AuthController',   'registro'],
    ['GET|POST', '/logout',              'AuthController',   'logout'],
    ['POST',     '/perfil',              'PerfilController', 'index'],
    ['POST',     '/perfil/actualizar',   'PerfilController', 'actualizar'],

    // ── Autenticación administrador ────────────────
    ['GET|POST', '/admin/login',         'AuthController',   'loginAdmin'],

    // ── Panel de Administración: Productos (PROTEGIDAS) ────────────────
    ['GET',      '/admin/dashboard',           'AdminController',  'dashboard'],
    ['GET',      '/admin/productos',           'AdminController',  'listarProductos'],
    ['GET|POST', '/admin/productos/crear',     'AdminController',  'crearProducto'],
    ['GET|POST', '/admin/productos/editar',    'AdminController',  'editarProducto'],
    ['POST',     '/admin/productos/eliminar',  'AdminController',  'eliminarProducto'],
    ['GET',      '/admin/producto/detalle',    'AdminController',  'obtenerProductoPorId'],

    // ── Panel de Administración: Categorías (PROTEGIDAS) ────────────────
    ['GET',      '/admin/categorias',          'AdminController',  'listarCategorias'],
    ['GET',      '/admin/categorias/lista',    'AdminController',  'listarCategoriasAdmin'],
    ['GET',      '/admin/categorias/detalle',  'AdminController',  'obtenerCategoriaDetalle'],
    ['POST',     '/admin/categorias/crear',    'AdminController',  'crearCategoria'],
    ['POST',     '/admin/categorias/editar',   'AdminController',  'editarCategoria'],

    // ── Panel de Administración: Pedidos y Clientes (PROTEGIDAS) ────────────────
    ['GET',      '/admin/pedidos',             'AdminController',  'listarPedidos'],
    ['GET',      '/admin/pedidos/detalle',     'AdminController',  'detallePedido'],
    ['POST',     '/admin/pedidos/estado',      'AdminController',  'actualizarEstadoPedido'],
    ['GET',      '/admin/clientes',            'AdminController',  'listarClientes'],
];

$method = $_SERVER['REQUEST_METHOD'];
$dispatched = false;

// ── CAPA DE SEGURIDAD (MIDDLEWARE) ────────────────
if (strpos($uri, '/admin/') === 0 && $uri !== '/admin/login') {
    
    // 1. Buscamos el Pase VIP que XAMPP no puede borrar
    $token = $_SERVER['HTTP_X_AUTH_TOKEN'] ?? '';
    
    // 2. Si no viene, intentamos el método tradicional
    if (!$token) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
        if (!$authHeader && function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            $authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';
        }
        if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
            $token = $matches[1];
        }
    }
    
    // Si definitivamente no hay token, bloqueamos
    if (!$token) {
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "SESSION_EXPIRED"]);
        exit;
    }
}

// ── DESPACHO DE RUTAS ────────────────
foreach ($routes as [$allowedMethods, $pattern, $controller, $action]) {
    if (in_array($method, explode('|', $allowedMethods)) && $uri === $pattern) {

        $controllerFile = __DIR__ . "/../controllers/{$controller}.php";

        if (!file_exists($controllerFile)) {
            http_response_code(500);
            die("Controlador no encontrado: {$controller}");
        }

        require_once $controllerFile;
        $instance = new $controller($pdo);
        $instance->$action();
        $dispatched = true;
        break;
    }
}

if (!$dispatched) {
    http_response_code(404);
    echo json_encode([
        "status" => "error", 
        "message" => "Endpoint no encontrado"
    ]);
}
