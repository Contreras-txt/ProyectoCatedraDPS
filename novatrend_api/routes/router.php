<?php
// routes/router.php
// Front Controller: punto de entrada único que despacha rutas a controladores.
// Incluir desde index.php con: require_once 'routes/router.php';

session_start();
require_once __DIR__ . '/../config/conexion.php';

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
// Si la ruta empieza con "/admin/" (y no es el login), verificamos el Token
if (strpos($uri, '/admin/') === 0 && $uri !== '/admin/login') {
    
    $headers = apache_request_headers();
    $authHeader = $headers['Authorization'] ?? '';
    
    // Extraemos el token ("Bearer dkf83...")
    $token = '';
    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
    }
    
    // Si no hay token en el header, detenemos la petición y devolvemos 401
    if (!$token) {
        http_response_code(401);
        echo json_encode([
            "status" => "error", 
            "message" => "Acceso denegado. Se requiere autenticación de administrador."
        ]);
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