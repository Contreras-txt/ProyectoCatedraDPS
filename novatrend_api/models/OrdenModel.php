<?php
// models/OrdenModel.php
// Crea órdenes de compra de forma transaccional.

class OrdenModel
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * @param array $envio  nombre, apellido, direccion, ciudad, departamento, telefono, fechaEntrega (Y-m-d)
     * @param array $items  [ ['idProducto'=>int, 'talla'=>string, 'cantidad'=>int], ... ]
     * @return array ['idOrden' => int, 'total' => float]
     * @throws RuntimeException con mensaje apto para mostrar al cliente
     */
    public function crearOrden(int $idCliente, array $envio, string $metodoPago, array $items): array
    {
        // 1) Consolidar líneas repetidas (mismo producto + talla)
        $lineas = [];
        foreach ($items as $it) {
            $id    = (int) ($it['idProducto'] ?? 0);
            $talla = trim((string) ($it['talla'] ?? ''));
            $cant  = (int) ($it['cantidad'] ?? 0);
            if ($id <= 0 || $cant <= 0 || $cant > 99) {
                throw new RuntimeException('Hay productos o cantidades inválidas en tu carrito.');
            }
            $key = $id . '|' . $talla;
            $lineas[$key] = [
                'id'    => $id,
                'talla' => $talla,
                'cant'  => ($lineas[$key]['cant'] ?? 0) + $cant,
            ];
        }
        ksort($lineas); // orden fijo de bloqueo → evita deadlocks entre pedidos simultáneos

        $this->pdo->beginTransaction();
        try {
            $stProd  = $this->pdo->prepare("SELECT NombreProducto, Precio FROM productos WHERE IDProducto = :id");
            $stStock = $this->pdo->prepare("SELECT Stock FROM producto_tallas WHERE IDProducto = :id AND Talla = :talla FOR UPDATE");
            $stDesc  = $this->pdo->prepare("UPDATE producto_tallas SET Stock = Stock - :cant WHERE IDProducto = :id AND Talla = :talla");

            // 2) Validar producto, precio real (de la BD) y stock
            $detalle = [];
            $total   = 0.0;
            foreach ($lineas as $l) {
                $stProd->execute([':id' => $l['id']]);
                $prod = $stProd->fetch();
                if (!$prod) {
                    throw new RuntimeException('Uno de los productos de tu carrito ya no está disponible.');
                }

                $tallaDb = ($l['talla'] === '' || $l['talla'] === 'Única') ? null : $l['talla'];
                if ($tallaDb !== null) {
                    $stStock->execute([':id' => $l['id'], ':talla' => $tallaDb]);
                    $row   = $stStock->fetch();
                    $stock = $row ? (int) $row['Stock'] : 0;
                    if ($stock < $l['cant']) {
                        $msg = $stock > 0
                            ? "Stock insuficiente: «{$prod['NombreProducto']}» talla {$tallaDb} (disponible: {$stock})."
                            : "«{$prod['NombreProducto']}» talla {$tallaDb} está agotado.";
                        throw new RuntimeException($msg);
                    }
                }

                $precio    = (float) $prod['Precio'];
                $total    += $precio * $l['cant'];
                $detalle[] = ['id' => $l['id'], 'talla' => $tallaDb, 'cant' => $l['cant'], 'precio' => $precio];
            }

            // 3) Cabecera de la orden
            $stOrden = $this->pdo->prepare("
                INSERT INTO ordenes
                    (IDCliente, FechaEntrega, EstadoOrden,
                     NombreEnvio, DireccionEnvio, CiudadEnvio, DepartamentoEnvio, TelefonoEnvio)
                VALUES
                    (:cli, :entrega, 'Pendiente', :nom, :dir, :ciu, :dep, :tel)
            ");
            $stOrden->execute([
                ':cli'     => $idCliente,
                ':entrega' => $envio['fechaEntrega'] . ' 00:00:00',
                ':nom'     => trim($envio['nombre'] . ' ' . $envio['apellido']),
                ':dir'     => $envio['direccion'],
                ':ciu'     => $envio['ciudad'],
                ':dep'     => $envio['departamento'],
                ':tel'     => $envio['telefono'],
            ]);
            $idOrden = (int) $this->pdo->lastInsertId();

            // 4) Detalle + descuento de stock
            $stDet = $this->pdo->prepare("
                INSERT INTO detalles_orden (IDOrden, IDProducto, Talla, Cantidad, PrecioUnitario, Metodo_Pago)
                VALUES (:orden, :prod, :talla, :cant, :precio, :metodo)
            ");
            foreach ($detalle as $d) {
                $stDet->execute([
                    ':orden'  => $idOrden,
                    ':prod'   => $d['id'],
                    ':talla'  => $d['talla'],
                    ':cant'   => $d['cant'],
                    ':precio' => $d['precio'],
                    ':metodo' => $metodoPago,
                ]);
                if ($d['talla'] !== null) {
                    $stDesc->execute([':cant' => $d['cant'], ':id' => $d['id'], ':talla' => $d['talla']]);
                }
            }

            $this->pdo->commit();
            return ['idOrden' => $idOrden, 'total' => round($total, 2)];
        } catch (Throwable $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            throw $e;
        }
    }
}
