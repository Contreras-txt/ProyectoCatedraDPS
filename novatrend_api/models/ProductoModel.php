<?php
// models/ProductoModel.php

class ProductoModel {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    private function baseQuery(): string {
        /*
         * CORRECCIÓN: Se recalcula TallasDisp al vuelo basándose en producto_tallas con Stock > 0.
         * Esto garantiza que la tienda siempre muestre las tallas reales disponibles,
         * incluso después de una compra.
         */
        return "SELECT p.*, cat.NombreCategoria, cat.Seccion,
                (SELECT COALESCE(SUM(Stock), 0) FROM producto_tallas WHERE IDProducto = p.IDProducto) as TotalStock,
                (SELECT GROUP_CONCAT(CONCAT(Talla, ':', Stock) ORDER BY FIELD(Talla, 'XS', 'S', 'M', 'L', 'XL')) 
                 FROM producto_tallas WHERE IDProducto = p.IDProducto) as DetalleTallas,
                (SELECT GROUP_CONCAT(Talla ORDER BY FIELD(Talla, 'XS', 'S', 'M', 'L', 'XL'))
                 FROM producto_tallas WHERE IDProducto = p.IDProducto AND Stock > 0) as TallasDispReal
                FROM productos p 
                LEFT JOIN categorias cat ON p.IDCategoria = cat.IDCategoria";
    }

    // ── MÉTODOS DE LA TIENDA Y ADMIN─────────────

    public function obtenerTodos(string $busqueda = ''): array {
        $sql = $this->baseQuery();
        $params = [];

        //la busqueda de productos
        if (!empty($busqueda)) {
            $sql .= " WHERE p.NombreProducto LIKE :busqueda";
            $params[':busqueda'] = '%' . $busqueda . '%';
        }

        $sql .= " ORDER BY p.IDProducto DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);

        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // CORRECCIÓN: Reemplazamos la columna TallasDisp con el valor real calculado
        foreach ($resultados as &$fila) {
             $fila['TallasDisp'] = $fila['TallasDispReal'] ?: '';
             unset($fila['TallasDispReal']);
        }
        return $resultados;
    }

    public function obtenerPorSeccion(string $seccion): array {
        $stmt = $this->pdo->prepare($this->baseQuery() . " WHERE cat.Seccion = :seccion ORDER BY p.IDProducto DESC");
        $stmt->execute([':seccion' => $seccion]);
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // CORRECCIÓN: Reemplazamos la columna TallasDisp con el valor real calculado
        foreach ($resultados as &$fila) {
             $fila['TallasDisp'] = $fila['TallasDispReal'] ?: '';
             unset($fila['TallasDispReal']);
        }
        return $resultados;
    }

    public function obtenerNuevos(int $limite = 8): array {
        $stmt = $this->pdo->prepare($this->baseQuery() . " ORDER BY p.IDProducto DESC LIMIT :limite");
        $stmt->bindValue(':limite', $limite, PDO::PARAM_INT);
        $stmt->execute();
        $resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // CORRECCIÓN: Reemplazamos la columna TallasDisp con el valor real calculado
        foreach ($resultados as &$fila) {
             $fila['TallasDisp'] = $fila['TallasDispReal'] ?: '';
             unset($fila['TallasDispReal']);
        }
        return $resultados;
    }

    public function obtenerCategorias(): array {
        return $this->pdo->query("SELECT * FROM categorias ORDER BY Seccion, NombreCategoria")->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerPorId(int $id): array|false {
        $stmt = $this->pdo->prepare($this->baseQuery() . " WHERE p.IDProducto = :id");
        $stmt->execute([':id' => $id]);
        $producto = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($producto) {
            // CORRECCIÓN: Reemplazamos la columna TallasDisp con el valor real calculado
            $producto['TallasDisp'] = $producto['TallasDispReal'] ?: '';
            unset($producto['TallasDispReal']);
            
            $stmtTallas = $this->pdo->prepare("SELECT Talla, Stock FROM producto_tallas WHERE IDProducto = ?");
            $stmtTallas->execute([$id]);
            $producto['inventario_tallas'] = $stmtTallas->fetchAll(PDO::FETCH_KEY_PAIR);
        }
        return $producto;
    }

    // ── metodos del admin para insertar ────────
    // (El resto del archivo permanece igual, omitido por brevedad. Asegúrate de conservar insertarProducto, actualizarProducto, eliminarProducto, etc.)
// ... (Código sin cambios)
    public function insertarProducto(array $d, array $tallasStock): bool {
        try {
            $this->pdo->beginTransaction();
            
            $stmt = $this->pdo->prepare("INSERT INTO productos (NombreProducto, IDCategoria, Precio, Descripcion, TallasDisp, Colores, Imagen) 
                                         VALUES (:nom, :cat, :pre, :des, :tal, :col, :img)");
            $stmt->execute([
                ':nom' => $d['NombreProducto'], ':cat' => $d['IDCategoria'], ':pre' => $d['Precio'],
                ':des' => $d['Descripcion'],    ':tal' => $d['TallasDisp'], ':col' => $d['Colores'],
                ':img' => $d['Imagen']
            ]);
            
            $id = $this->pdo->lastInsertId();
            
            $stmtT = $this->pdo->prepare("INSERT INTO producto_tallas (IDProducto, Talla, Stock) VALUES (?, ?, ?)");
            foreach ($tallasStock as $talla => $stock) {
                $stmtT->execute([$id, $talla, $stock]);
            }
            
            return $this->pdo->commit();
        } catch (Exception $e) { 
            $this->pdo->rollBack(); 
            return false; 
        }
    }

    public function actualizarProducto(array $d, array $tallasStock): bool {
        try {
            $this->pdo->beginTransaction();
            
            $stmt = $this->pdo->prepare("UPDATE productos SET NombreProducto=:nom, IDCategoria=:cat, Precio=:pre, Descripcion=:des, TallasDisp=:tal, Colores=:col, Imagen=:img WHERE IDProducto=:id");
            $stmt->execute([
                ':id'  => $d['IDProducto'],     ':nom' => $d['NombreProducto'], ':cat' => $d['IDCategoria'],
                ':pre' => $d['Precio'],         ':des' => $d['Descripcion'],    ':tal' => $d['TallasDisp'], 
                ':col' => $d['Colores'],        ':img' => $d['Imagen']
            ]);

            $stmtT = $this->pdo->prepare("INSERT INTO producto_tallas (IDProducto, Talla, Stock) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE Stock = VALUES(Stock)");
            foreach ($tallasStock as $talla => $stock) {
                $stmtT->execute([$d['IDProducto'], $talla, $stock]);
            }
            
            return $this->pdo->commit();
        } catch (Exception $e) { 
            $this->pdo->rollBack(); 
            return false; 
        }
    }

   public function eliminarProducto(int $id): bool {
        try {
            // Opcional: Eliminar primero el stock en tallas para evitar basura huérfana
            $this->pdo->prepare("DELETE FROM producto_tallas WHERE IDProducto = ?")->execute([$id]);
            
            // Intentamos eliminar el producto
            return $this->pdo->prepare("DELETE FROM productos WHERE IDProducto = ?")->execute([$id]);
        } catch (PDOException $e) {
            // El código 23000 corresponde a violación de restricción de integridad (ej. Foreign Key)
            if ($e->getCode() == '23000') {
                throw new Exception("No puedes eliminar este producto porque ya está registrado en el historial de pedidos de los clientes. Intenta poner su stock en 0.");
            }
            throw new Exception("Error al intentar eliminar el producto de la base de datos.");
        }
    }
    public function obtenerCategoriasAdmin(): array {
        $stmt = $this->pdo->query("SELECT * FROM categorias ORDER BY IDCategoria DESC");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerCategoriaPorId(int $id): array|false {
        $stmt = $this->pdo->prepare("SELECT * FROM categorias WHERE IDCategoria = ?");
        $stmt->execute([$id]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function insertarCategoria(array $datos): bool {
        $stmt = $this->pdo->prepare("INSERT INTO categorias (NombreCategoria, Seccion, Descripcion) VALUES (:nombre, :seccion, :descripcion)");
        return $stmt->execute([
            ':nombre' => $datos['NombreCategoria'],
            ':seccion' => $datos['Seccion'],
            ':descripcion' => $datos['Descripcion']
        ]);
    }

    public function actualizarCategoria(array $datos): bool {
        $stmt = $this->pdo->prepare("UPDATE categorias SET NombreCategoria = :nombre, Seccion = :seccion, Descripcion = :descripcion WHERE IDCategoria = :id");
        return $stmt->execute([
            ':id' => $datos['IDCategoria'],
            ':nombre' => $datos['NombreCategoria'],
            ':seccion' => $datos['Seccion'],
            ':descripcion' => $datos['Descripcion']
        ]);
    }
    // ── MÉTODOS DEL ADMIN PARA PEDIDOS ────────

    public function obtenerPedidosAdmin(): array {
        $stmt = $this->pdo->query("
            SELECT o.*, c.Nombre, c.Apellido, c.Email,
                   (SELECT SUM(Cantidad * PrecioUnitario) FROM detalles_orden WHERE IDOrden = o.IDOrden) AS Total
            FROM ordenes o
            JOIN clientes c ON o.IDCliente = c.IDCliente
            ORDER BY o.IDOrden DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function obtenerDetallePedidoAdmin(int $idOrden): array {
        $stmt = $this->pdo->prepare("
            SELECT d.*, p.NombreProducto, p.Imagen
            FROM detalles_orden d
            JOIN productos p ON d.IDProducto = p.IDProducto
            WHERE d.IDOrden = :id
        ");
        $stmt->execute([':id' => $idOrden]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function actualizarEstadoPedido(int $idOrden, string $estado): bool {
        $stmt = $this->pdo->prepare("UPDATE ordenes SET EstadoOrden = :estado WHERE IDOrden = :id");
        return $stmt->execute([':estado' => $estado, ':id' => $idOrden]);
    }

    public function devolverStockPedido(int $idOrden): void {
        $detalles = $this->obtenerDetallePedidoAdmin($idOrden);
        $stmt = $this->pdo->prepare("UPDATE producto_tallas SET Stock = Stock + :cant WHERE IDProducto = :prod AND Talla = :talla");
        foreach($detalles as $d) {
            $stmt->execute([':cant' => $d['Cantidad'], ':prod' => $d['IDProducto'], ':talla' => $d['Talla']]);
        }
    }
    // ── MÉTODOS DEL ADMIN PARA CLIENTES ────────

    public function obtenerClientesAdmin(): array {
        $stmt = $this->pdo->query("
            SELECT c.IDCliente, c.Nombre, c.Apellido, c.Email, c.Telefono, 
                   c.Ciudad, c.Departamento, c.BloqueadoHasta,
                   (SELECT COUNT(IDOrden) FROM ordenes WHERE IDCliente = c.IDCliente) AS TotalPedidos
            FROM clientes c
            ORDER BY c.IDCliente DESC
        ");
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}