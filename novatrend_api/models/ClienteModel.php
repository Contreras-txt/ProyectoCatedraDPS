<?php
// models/ClienteModel.php
// Consultas SQL para datos del cliente y sus pedidos.

class ClienteModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

   /**
     * Devuelve los datos del cliente por ID.
     */
    public function obtenerPorId(int $id): array|false
    {
        $stmt = $this->pdo->prepare("
            SELECT IDCliente, Nombre, Apellido, Email, Telefono, Direccion, Ciudad, Departamento
            FROM clientes
            WHERE IDCliente = :id
        ");
        $stmt->execute([':id' => $id]);
        return $stmt->fetch(PDO::FETCH_ASSOC); // Aseguramos que retorne un array asociativo
    }

    /**
     * Actualiza los datos editables del cliente.
     */
    public function actualizar(int $id, array $datos): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE clientes
            SET Nombre       = :nombre,
                Apellido     = :apellido,
                Telefono     = :telefono,
                Direccion    = :direccion,
                Ciudad       = :ciudad,
                Departamento = :departamento
            WHERE IDCliente = :id
        ");
        return $stmt->execute([
            ':nombre'       => $datos['nombre'],
            ':apellido'     => $datos['apellido'],
            ':telefono'     => $datos['telefono']     ?: null,
            ':direccion'    => $datos['direccion']    ?: null,
            ':ciudad'       => $datos['ciudad']       ?: null,
            ':departamento' => $datos['departamento'] ?: null,
            ':id'           => $id,
        ]);
    }

    /**
     * Cambia la contraseña del cliente (ya recibe el hash).
     */
    public function cambiarContrasena(int $id, string $hash): bool
    {
        $stmt = $this->pdo->prepare("
            UPDATE clientes SET Contrasena = :hash WHERE IDCliente = :id
        ");
        return $stmt->execute([':hash' => $hash, ':id' => $id]);
    }

    /**
     * Devuelve la contraseña actual (hash) para verificarla antes de cambiarla.
     */
    public function obtenerHash(int $id): string|false
    {
        $stmt = $this->pdo->prepare("
            SELECT Contrasena FROM clientes WHERE IDCliente = :id
        ");
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();
        return $row ? $row['Contrasena'] : false;
    }

    /**
     * Devuelve todas las órdenes del cliente con su total calculado.
     */
    public function obtenerOrdenes(int $idCliente): array
    {
        $stmt = $this->pdo->prepare("
            SELECT
                o.IDOrden,
                o.FechaPedido,
                o.FechaEntrega,
                o.EstadoOrden,
                SUM(d.Cantidad * d.PrecioUnitario) AS Total,
                COUNT(d.IDDetalleOrden)             AS NumProductos
            FROM ordenes o
            LEFT JOIN detalles_orden d ON o.IDOrden = d.IDOrden
            WHERE o.IDCliente = :id
            GROUP BY o.IDOrden
            ORDER BY o.FechaPedido DESC
        ");
        $stmt->execute([':id' => $idCliente]);
        return $stmt->fetchAll();
    }

    /**
     * Devuelve el detalle de una orden específica (solo si pertenece al cliente).
     */
    /**
     * Devuelve el detalle de una orden específica (solo si pertenece al cliente).
     */
    public function obtenerDetalleOrden(int $idOrden, int $idCliente): array
    {
        $stmt = $this->pdo->prepare("
            SELECT
                d.Cantidad,
                d.Talla,
                d.PrecioUnitario,
                p.NombreProducto,
                p.IDProducto,
                COALESCE(NULLIF(p.Imagen, ''), 'default.jpg') AS Imagen
            FROM detalles_orden d
            JOIN productos p ON d.IDProducto = p.IDProducto
            JOIN ordenes o   ON d.IDOrden    = o.IDOrden
            WHERE d.IDOrden = :orden AND o.IDCliente = :cliente
        ");
        $stmt->execute([':orden' => $idOrden, ':cliente' => $idCliente]);
        $detalles = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Validación de seguridad para asegurar la imagen por defecto
        foreach ($detalles as &$fila) {
            if (empty($fila['Imagen'])) {
                $fila['Imagen'] = 'default.jpg';
            }
        }

        return $detalles;
    }
}
