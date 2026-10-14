<?php
// controllers/PerfilController.php

require_once __DIR__ . '/../models/ClienteModel.php';
require_once __DIR__ . '/../models/AuthModel.php';

class PerfilController
{
    private ClienteModel $clienteModel;
    private AuthModel $authModel;

    public function __construct(PDO $pdo)
    {
        $this->clienteModel = new ClienteModel($pdo);
        $this->authModel = new AuthModel($pdo);
    }

    // ── Helpers ───────────────────────────────────────────────

    private function responder(int $codigo, array $payload): void
    {
        http_response_code($codigo);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit;
    }

    private function entrada(): array
    {
        $datos = json_decode(file_get_contents('php://input'), true);
        return is_array($datos) ? $datos : [];
    }

    /**
     * Valida la autenticación por token en el body y retorna el cliente.
     */
    private function autenticar(): array|false
    {
        $datos = $this->entrada();
        $idCliente = (int)($datos['idCliente'] ?? 0);
        $token = trim($datos['token'] ?? '');

        if ($idCliente <= 0 || $token === '') {
            $this->responder(401, ["status" => "error", "message" => "No autorizado. Sesión inválida."]);
            return false; // El método responder termina la ejecución, pero por seguridad
        }

        $clienteAuth = $this->authModel->clientePorToken($idCliente, $token);
        if (!$clienteAuth) {
            $this->responder(401, ["status" => "error", "message" => "No autorizado. Token inválido o expirado."]);
            return false;
        }

        return $clienteAuth;
    }

    // ── Endpoints ─────────────────────────────────────────────

    /**
     * GET (usamos POST por seguridad para enviar el token en el body): /perfil
     * Devuelve los datos del perfil y las órdenes del cliente.
     */
    public function index(): void
    {
        $clienteAuth = $this->autenticar();
        if (!$clienteAuth) return;

        $id = (int)$clienteAuth['IDCliente'];
        
        // Obtener datos completos (con ciudad y departamento)
        $perfil = $this->clienteModel->obtenerPorId($id);
        
        // Obtener las órdenes
        $ordenes = $this->clienteModel->obtenerOrdenes($id);
        
        // Formatear las órdenes para agregar el detalle a cada una
        foreach ($ordenes as &$orden) {
            $orden['detalle'] = $this->clienteModel->obtenerDetalleOrden((int)$orden['IDOrden'], $id);
        }

        $this->responder(200, [
            "status" => "success",
            "data" => [
                "perfil" => $perfil,
                "ordenes" => $ordenes
            ]
        ]);
    }

    /**
     * POST: /perfil/actualizar
     * Actualiza los datos editables y, opcionalmente, la contraseña.
     */
    public function actualizar(): void
    {
        $clienteAuth = $this->autenticar();
        if (!$clienteAuth) return;

        $id = (int)$clienteAuth['IDCliente'];
        $datos = $this->entrada();
        $errores = [];

        // 1. Validar y actualizar datos generales
        $nombre       = trim($datos['nombre'] ?? '');
        $apellido     = trim($datos['apellido'] ?? '');
        $telefono     = preg_replace('/\D/', '', (string)($datos['telefono'] ?? ''));
        $direccion    = trim($datos['direccion'] ?? '');
        $ciudad       = trim($datos['ciudad'] ?? '');
        $departamento = trim($datos['departamento'] ?? '');

        if (empty($nombre) || empty($apellido)) {
            $errores[] = "Nombre y apellido son obligatorios.";
        }
        if ($telefono !== '' && strlen($telefono) !== 8) {
            $errores[] = "El teléfono debe tener 8 dígitos.";
        }

        // 2. Lógica de cambio de contraseña (Opcional)
        $passwordActual = (string)($datos['passwordActual'] ?? '');
        $passwordNueva = (string)($datos['passwordNueva'] ?? '');

        if ($passwordNueva !== '') {
            if (strlen($passwordNueva) < 6) {
                $errores[] = "La nueva contraseña debe tener al menos 6 caracteres.";
            } elseif (empty($passwordActual)) {
                $errores[] = "Debes ingresar tu contraseña actual para cambiarla.";
            } else {
                $hashActualBD = $this->clienteModel->obtenerHash($id);
                if (!password_verify($passwordActual, $hashActualBD)) {
                    $errores[] = "La contraseña actual es incorrecta.";
                } else {
                    // Actualizar contraseña
                    $nuevoHash = password_hash($passwordNueva, PASSWORD_BCRYPT);
                    $this->clienteModel->cambiarContrasena($id, $nuevoHash);
                }
            }
        }

        if (!empty($errores)) {
            $this->responder(400, ["status" => "error", "errores" => $errores]);
            return;
        }

        // Ejecutar actualización de datos generales
        $datosUpdate = [
            'nombre'       => $nombre,
            'apellido'     => $apellido,
            'telefono'     => $telefono,
            'direccion'    => $direccion,
            'ciudad'       => $ciudad,
            'departamento' => $departamento,
        ];

        if ($this->clienteModel->actualizar($id, $datosUpdate)) {
            $this->responder(200, [
                "status" => "success", 
                "message" => "Perfil actualizado correctamente.",
                "data" => $datosUpdate // Devolvemos los datos para actualizar la sesión en React Native
            ]);
        } else {
            $this->responder(500, ["status" => "error", "message" => "No se pudo actualizar el perfil."]);
        }
    }
}