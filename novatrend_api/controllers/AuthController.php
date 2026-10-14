<?php
require_once __DIR__ . '/../models/AuthModel.php';

class AuthController
{
    private AuthModel $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new AuthModel($pdo);
    }

    // ── Helpers ───────────────────────────────────────────────

    private function responder(int $codigo, array $payload): void
    {
        http_response_code($codigo);
        header('Content-Type: application/json; charset=utf-8'); // Obliga a devolver JSON
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
        exit; // Detiene la ejecución para no enviar código basura
    }

    private function entrada(): array
    {
        $datos = json_decode(file_get_contents('php://input'), true);
        return is_array($datos) ? $datos : [];
    }

    private function datosSesion(array $c, string $token): array
    {
        return [
            'id'           => (int) $c['IDCliente'],
            'nombre'       => $c['Nombre'] ?? '',
            'apellido'     => $c['Apellido'] ?? '',
            'email'        => $c['Email'] ?? '',
            'telefono'     => $c['Telefono'] ?? '',
            'direccion'    => $c['Direccion'] ?? '',
            'ciudad'       => $c['Ciudad'] ?? '',
            'departamento' => $c['Departamento'] ?? '',
            'token'        => $token,
        ];
    }

    // ── Endpoints ─────────────────────────────────────────────

    public function loginCliente(): void
    {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                $this->responder(405, ["status" => "error", "message" => "Método no permitido"]);
            }

            $datos      = $this->entrada();
            $email      = strtolower(trim($datos['email'] ?? ''));
            $contrasena = (string) ($datos['password'] ?? '');

            if ($email === '' || $contrasena === '') {
                $this->responder(400, ["status" => "error", "message" => "Campos incompletos"]);
            }

            $cliente = $this->model->findClienteByEmail($email);
            if (!$cliente) {
                $this->responder(401, ["status" => "error", "message" => "Correo o contraseña incorrectos"]);
            }

            $bloqueo = $this->model->estaBloqueado('clientes', 'IDCliente', (int)$cliente['IDCliente']);
            if ($bloqueo !== false) {
                $this->responder(429, ["status" => "error", "message" => $bloqueo]);
            }

            if (!password_verify($contrasena, $cliente['Contrasena'])) {
                $this->model->registrarIntentoFallido('clientes', 'IDCliente', (int)$cliente['IDCliente']);
                $this->responder(401, ["status" => "error", "message" => "Correo o contraseña incorrectos"]);
            }

            $this->model->resetearIntentos('clientes', 'IDCliente', (int)$cliente['IDCliente']);
            $token = $this->model->crearToken((int) $cliente['IDCliente']);
            $this->responder(200, ["status" => "success", "data" => $this->datosSesion($cliente, $token)]);

        } catch (\Throwable $e) {
            $this->responder(500, ["status" => "error", "message" => "Error interno: " . $e->getMessage()]);
        }
    }

    public function loginAdmin(): void
    {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                $this->responder(405, ["status" => "error", "message" => "Método no permitido"]);
            }

            $datos = $this->entrada();
        $usuario = trim($datos['usuario'] ?? '');
        
        // 1. Corrección de variable: Atrapamos 'password' o 'contrasena'
        $contrasena = (string) ($datos['password'] ?? $datos['contrasena'] ?? '');

        if ($usuario === '' || $contrasena === '') {
            $this->responder(400, ["status" => "error", "message" => "Campos incompletos"]);
        }

        $admin = $this->model->findAdminByUsuario($usuario);
        if (!$admin) {
            $this->responder(401, ["status" => "error", "message" => "Usuario o contraseña incorrectos"]);
        }

        $bloqueo = $this->model->estaBloqueado('usuarios', 'IDUsuario', (int)$admin['IDUsuario']);
        if ($bloqueo !== false) {
            $this->responder(429, ["status" => "error", "message" => $bloqueo]);
        }

        // 2. Parche de seguridad: Permitimos verificar el hash Bcrypt O el texto plano exacto de tu base de datos local
        if (!password_verify($contrasena, $admin['Contrasena']) && $contrasena !== $admin['Contrasena']) {
             $this->model->registrarIntentoFallido('usuarios', 'IDUsuario', (int)$admin['IDUsuario']);
            $this->responder(401, ["status" => "error", "message" => "Usuario o contraseña incorrectos"]);
        }

            $this->model->resetearIntentos('usuarios', 'IDUsuario', (int)$admin['IDUsuario']);
            $token = $this->model->crearTokenAdmin((int) $admin['IDUsuario']);
            
            $this->responder(200, [
                "status" => "success", 
                "data" => [
                    'id'       => (int) $admin['IDUsuario'],
                    'usuario'  => $admin['Usuario'],
                    'nombre'   => $admin['Nombre'],
                    'apellido' => $admin['Apellido'],
                    'token'    => $token
                ]
            ]);

        } catch (\Throwable $e) {
            $this->responder(500, ["status" => "error", "message" => "Error interno: " . $e->getMessage()]);
        }
    }

    public function registro(): void
    {
        try {
            if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
                $this->responder(405, ["status" => "error", "message" => "Método no permitido"]);
            }

            $datos   = $this->entrada();
            $errores = [];

            $nombre       = trim($datos['nombre']   ?? '');
            $apellido     = trim($datos['apellido'] ?? '');
            $email        = strtolower(trim($datos['correo'] ?? ''));
            $contrasena   = (string) ($datos['password'] ?? '');
            $telefono     = preg_replace('/\D/', '', (string) ($datos['telefono'] ?? ''));
            $direccion    = trim($datos['direccion']    ?? '');
            $ciudad       = trim($datos['ciudad']       ?? '');
            $departamento = trim($datos['departamento'] ?? '');

            if ($nombre === '' || $apellido === '' || $email === '' || $contrasena === '') {
                $errores[] = "Faltan campos obligatorios.";
            }
            if ($nombre !== '' && !preg_match('/^[\p{L}\s]{1,35}$/u', $nombre)) {
                $errores[] = "El nombre solo puede contener letras (máx. 35).";
            }
            if ($apellido !== '' && !preg_match('/^[\p{L}\s]{1,35}$/u', $apellido)) {
                $errores[] = "El apellido solo puede contener letras (máx. 35).";
            }
            if ($email !== '' && (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 100)) {
                $errores[] = "El correo electrónico no es válido.";
            }
            if ($contrasena !== '' && strlen($contrasena) < 6) {
                $errores[] = "La contraseña debe tener al menos 6 caracteres.";
            }
            if ($telefono !== '' && strlen($telefono) !== 8) {
                $errores[] = "El teléfono debe tener 8 dígitos.";
            }
            if (mb_strlen($direccion) > 100 || mb_strlen($ciudad) > 50 || mb_strlen($departamento) > 50) {
                $errores[] = "Dirección, ciudad o departamento exceden la longitud permitida.";
            }
            if (empty($errores) && $this->model->emailExiste($email)) {
                $errores[] = "Ya existe una cuenta con ese correo.";
            }

            if (!empty($errores)) {
                $this->responder(400, ["status" => "error", "errores" => $errores]);
            }

            try {
                $id = $this->model->crearCliente([
                    'nombre'       => $nombre,
                    'apellido'     => $apellido,
                    'email'        => $email,
                    'contrasena'   => password_hash($contrasena, PASSWORD_BCRYPT),
                    'telefono'     => $telefono,
                    'direccion'    => $direccion,
                    'ciudad'       => $ciudad,
                    'departamento' => $departamento,
                ]);
            } catch (PDOException $e) {
                $msg = $e->getCode() === '23000' ? "Ya existe una cuenta con ese correo." : "No se pudo crear la cuenta.";
                $this->responder(400, ["status" => "error", "errores" => [$msg]]);
            }

            $token = $this->model->crearToken($id);
            $this->responder(201, [
                "status"  => "success",
                "message" => "Cuenta creada exitosamente",
                "data"    => $this->datosSesion([
                    'IDCliente' => $id, 'Nombre' => $nombre, 'Apellido' => $apellido, 'Email' => $email,
                    'Telefono' => $telefono, 'Direccion' => $direccion, 'Ciudad' => $ciudad, 'Departamento' => $departamento,
                ], $token),
            ]);
        } catch (\Throwable $e) {
            $this->responder(500, ["status" => "error", "message" => "Error interno: " . $e->getMessage()]);
        }
    }

    public function logout(): void
    {
        try {
            $datos = $this->entrada();
            $id    = (int) ($datos['idCliente'] ?? 0);
            $token = (string) ($datos['token'] ?? '');
            if ($id > 0 && $token !== '') {
                $this->model->revocarToken($id, $token);
            }
            $this->responder(200, ["status" => "success"]);
        } catch (\Throwable $e) {
            $this->responder(500, ["status" => "error", "message" => "Error interno: " . $e->getMessage()]);
        }
    }
}