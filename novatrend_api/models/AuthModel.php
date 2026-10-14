<?php
// models/AuthModel.php
class AuthModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // ── Clientes ──────────────────────────────────────────────

    public function findClienteByEmail(string $email): array|false
    {
        $stmt = $this->pdo->prepare("
            SELECT IDCliente, Nombre, Apellido, Email, Telefono, Direccion,
                   Ciudad, Departamento, Contrasena
            FROM clientes
            WHERE Email = :email
            LIMIT 1
        ");
        $stmt->execute([':email' => $email]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function emailExiste(string $email): bool
    {
        $stmt = $this->pdo->prepare("SELECT IDCliente FROM clientes WHERE Email = :email");
        $stmt->execute([':email' => $email]);
        return (bool) $stmt->fetch();
    }

    public function crearCliente(array $d): int
    {
        $stmt = $this->pdo->prepare("
            INSERT INTO clientes
                (Nombre, Apellido, Direccion, Departamento, Ciudad, Email, Telefono, Contrasena)
            VALUES
                (:nombre, :apellido, :direccion, :departamento, :ciudad, :email, :telefono, :contrasena)
        ");
        $stmt->execute([
            ':nombre'       => $d['nombre'],
            ':apellido'     => $d['apellido'],
            ':direccion'    => $d['direccion']    ?: null,
            ':departamento' => $d['departamento'] ?: null,
            ':ciudad'       => $d['ciudad']       ?: null,
            ':email'        => $d['email'],
            ':telefono'     => $d['telefono']     ?: null,
            ':contrasena'   => $d['contrasena'],
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    // ── Tokens de sesión ──────────────────────────

    public function crearToken(int $idCliente): string
    {
        $token = bin2hex(random_bytes(32));
        try {
            $stmt = $this->pdo->prepare("UPDATE clientes SET TokenSesion = :h, TokenCreadoEn = NOW() WHERE IDCliente = :id");
            $stmt->execute([':h' => hash('sha256', $token), ':id' => $idCliente]);
        } catch (\Throwable $e) {
            // Fallback resiliente: Si la columna TokenCreadoEn no existe, usa la consulta original
            $stmt = $this->pdo->prepare("UPDATE clientes SET TokenSesion = :h WHERE IDCliente = :id");
            $stmt->execute([':h' => hash('sha256', $token), ':id' => $idCliente]);
        }
        return $token;
    }

    public function clientePorToken(int $idCliente, string $token): array|false
    {
        if ($idCliente <= 0 || $token === '') return false;
        $stmt = $this->pdo->prepare("
            SELECT IDCliente, Nombre, Apellido, Email
            FROM clientes
            WHERE IDCliente = :id AND TokenSesion = :h
        ");
        $stmt->execute([':id' => $idCliente, ':h' => hash('sha256', $token)]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function revocarToken(int $idCliente, string $token): void
    {
        $stmt = $this->pdo->prepare("UPDATE clientes SET TokenSesion = NULL WHERE IDCliente = :id AND TokenSesion = :h");
        $stmt->execute([':id' => $idCliente, ':h' => hash('sha256', $token)]);
    }

    // ── Administradores ───────────────────────────────────────

    public function findAdminByUsuario(string $usuario): array|false
    {
        $stmt = $this->pdo->prepare("SELECT * FROM usuarios WHERE usuario = :usuario LIMIT 1");
        $stmt->execute(['usuario' => $usuario]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function crearTokenAdmin(int $idUsuario): string
    {
        $token = bin2hex(random_bytes(32));
        try {
            $stmt = $this->pdo->prepare("UPDATE usuarios SET TokenSesion = :h, TokenCreadoEn = NOW() WHERE IDUsuario = :id");
            $stmt->execute([':h' => hash('sha256', $token), ':id' => $idUsuario]);
        } catch (\Throwable $e) {
            $stmt = $this->pdo->prepare("UPDATE usuarios SET TokenSesion = :h WHERE IDUsuario = :id");
            $stmt->execute([':h' => hash('sha256', $token), ':id' => $idUsuario]);
        }
        return $token;
    }

    public function adminPorToken(int $idUsuario, string $token): array|false
    {
        if ($idUsuario <= 0 || $token === '') return false;
        $stmt = $this->pdo->prepare("SELECT IDUsuario, Nombre, Apellido, Usuario FROM usuarios WHERE IDUsuario = :id AND TokenSesion = :h");
        $stmt->execute([':id' => $idUsuario, ':h' => hash('sha256', $token)]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ── Seguridad: Fuerza Bruta y Caducidad ──────────────────

    public function registrarIntentoFallido(string $tabla, string $campoId, int $id): void
    {
        try {
            $stmt = $this->pdo->prepare("
                UPDATE {$tabla} 
                SET IntentosFallidos = IntentosFallidos + 1,
                    BloqueadoHasta = CASE WHEN IntentosFallidos >= 4 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE) ELSE NULL END
                WHERE {$campoId} = :id
            ");
            $stmt->execute([':id' => $id]);
        } catch (\Throwable $e) { /* Falla silenciosa si las columnas no existen */ }
    }

    public function resetearIntentos(string $tabla, string $campoId, int $id): void
    {
        try {
            $stmt = $this->pdo->prepare("UPDATE {$tabla} SET IntentosFallidos = 0, BloqueadoHasta = NULL WHERE {$campoId} = :id");
            $stmt->execute([':id' => $id]);
        } catch (\Throwable $e) { /* Falla silenciosa si las columnas no existen */ }
    }

    public function estaBloqueado(string $tabla, string $campoId, int $id): bool|string
    {
        try {
            $stmt = $this->pdo->prepare("SELECT BloqueadoHasta FROM {$tabla} WHERE {$campoId} = :id");
            $stmt->execute([':id' => $id]);
            $row = $stmt->fetch(PDO::FETCH_ASSOC);

            if ($row && !empty($row['BloqueadoHasta'])) {
                $bloqueadoHasta = new DateTime($row['BloqueadoHasta']);
                $ahora = new DateTime();
                if ($bloqueadoHasta > $ahora) {
                    $diff = $ahora->diff($bloqueadoHasta);
                    return "Cuenta bloqueada temporalmente por seguridad. Intenta en {$diff->i} minutos.";
                } else {
                    $this->resetearIntentos($tabla, $campoId, $id);
                }
            }
        } catch (\Throwable $e) { /* Falla silenciosa */ }
        return false;
    }
}