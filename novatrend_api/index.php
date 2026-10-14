<?php
// index.php — Punto de entrada único de la aplicación NovaTrend
// Todo el tráfico pasa por aquí gracias al .htaccess

require_once __DIR__ . '/routes/router.php';

// Permitir acceso desde cualquier origen (tu app móvil)
header("Access-Control-Allow-Origin: *");
// Definir que todas las respuestas de esta API serán en formato JSON
header("Content-Type: application/json; charset=UTF-8");
// Métodos HTTP permitidos
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Manejo de las peticiones pre-flight de seguridad
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
