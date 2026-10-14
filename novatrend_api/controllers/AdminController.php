<?php
// controllers/AdminController.php

require_once __DIR__ . '/../models/ProductoModel.php';

class AdminController
{
    private ProductoModel $model;

    public function __construct(PDO $pdo)
    {
        $this->model = new ProductoModel($pdo);
    }

    public function dashboard(): void
    {
        echo json_encode(["status" => "success", "message" => "Bienvenido al dashboard API"]);
        exit;
    }

    public function listarProductos(): void
    {
        $busqueda = trim($_GET['q'] ?? '');
        $productos = $this->model->obtenerTodos($busqueda);
        
        echo json_encode($productos);
        exit;
    }

    public function listarCategorias(): void
    {
        $categorias = $this->model->obtenerCategorias();
        
        echo json_encode($categorias);
        exit;
    }

    // Función auxiliar para guardar imágenes enviadas en Base64 desde la app
    private function guardarImagenBase64(?string $base64String, string $imagenActual = 'default.jpg'): string
    {
        if (empty($base64String)) {
            return $imagenActual;
        }

        // Si ya es un nombre de archivo simple y no viene en base64, lo retornamos tal cual
        if (!str_contains($base64String, 'base64,')) {
            return $base64String;
        }

        try {
            [$header, $data] = explode(';', $base64String);
            [$type, $data] = explode(',', $data);
            $data = base64_decode($data);

            if ($data === false) {
                return $imagenActual;
            }

            $extension = 'jpg';
            if (str_contains($type, 'png')) $extension = 'png';
            if (str_contains($type, 'webp')) $extension = 'webp';

            $nombreArchivo = md5(uniqid(rand(), true)) . '.' . $extension;
            $carpetaDestino = __DIR__ . '/../img/';

            if (!is_dir($carpetaDestino)) {
                mkdir($carpetaDestino, 0755, true);
            }

            file_put_contents($carpetaDestino . $nombreArchivo, $data);
            return $nombreArchivo;
        } catch (\Exception $e) {
            return $imagenActual;
        }
    }

    public function crearProducto(): void
    {
        $input = json_decode(file_get_contents("php://input"), true);
        $errores = [];

        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $input) {
            $nombre      = trim($input['nombre'] ?? '');
            $categoria   = (int)($input['categoria'] ?? 0);
            $precio      = (float)($input['precio'] ?? 0);
            $descripcion = trim($input['descripcion'] ?? '');
            $colores     = trim($input['colores'] ?? '');
            
            // ── NUEVAS VALIDACIONES ESTRICTAS DE BACKEND ──
            if (empty($nombre)) $errores[] = "El nombre es obligatorio.";
            if (mb_strlen($nombre) > 100) $errores[] = "El nombre del producto no puede exceder los 100 caracteres.";
            if ($precio < 0) $errores[] = "El precio no puede ser negativo.";
            if (empty($colores)) $errores[] = "Los colores son obligatorios.";
            if (mb_strlen($colores) > 50) $errores[] = "El texto de colores no puede exceder los 50 caracteres.";
            if (mb_strlen($descripcion) > 500) $errores[] = "La descripción no puede exceder los 500 caracteres.";
            if ($categoria <= 0) $errores[] = "Debes seleccionar una categoría válida.";

            // Procesamos la imagen en Base64 si viene incluida y validamos tamaño
            $imagenInput = $input['imagen'] ?? 'default.jpg';
            if (str_contains($imagenInput, 'base64,')) {
                $longitud = strlen($imagenInput) - strpos($imagenInput, ',') - 1;
                $sizeMB = ($longitud * (3/4)) / (1024 * 1024);
                if ($sizeMB > 2) {
                     $errores[] = "La imagen supera el límite de 2MB.";
                }
            }
            
            if (empty($errores)) {
                $imagenFinal = $this->guardarImagenBase64($imagenInput, 'default.jpg');
            }

            $tallasInput = $input['tallas'] ?? [];
            $tallasStock = [
                'XS' => (int)($tallasInput['xs'] ?? 0),
                'S'  => (int)($tallasInput['s']  ?? 0),
                'M'  => (int)($tallasInput['m']  ?? 0),
                'L'  => (int)($tallasInput['l']  ?? 0),
                'XL' => (int)($tallasInput['xl'] ?? 0)
            ];

            $totalStock = array_sum($tallasStock);
            if ($totalStock <= 0) $errores[] = "El inventario total no puede ser 0.";

            if (empty($errores)) {
                $disponibles = array_keys(array_filter($tallasStock, fn($s) => $s > 0));
                
                $datos = [
                    'NombreProducto' => $nombre,
                    'IDCategoria'    => $categoria,
                    'Precio'         => $precio,
                    'Descripcion'    => $descripcion,
                    'TallasDisp'     => implode(', ', $disponibles),
                    'Colores'        => $colores,
                    'Imagen'         => $imagenFinal ?? 'default.jpg' // Por si hubo error antes de generar imagenFinal
                ];

                if ($this->model->insertarProducto($datos, $tallasStock)) {
                    echo json_encode(["status" => "success", "message" => "Producto agregado con éxito."]);
                    exit;
                } else {
                    $errores[] = "Error SQL al guardar en la base de datos.";
                }
            }
        } else {
            $errores[] = "No se recibieron datos válidos.";
        }

        http_response_code(400);
        echo json_encode(["status" => "error", "message" => implode(" ", $errores)]);
        exit;
    }

    public function obtenerProductoPorId(): void
    {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $producto = $this->model->obtenerPorId((int)$id);
            echo json_encode($producto);
            exit;
        }
        echo json_encode(["status" => "error", "message" => "ID no proporcionado"]);
        exit;
    }

    public function editarProducto(): void
    {
        $input = json_decode(file_get_contents("php://input"), true);
        $errores = [];
        
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $input) {
            $id          = $input['id'] ?? null;
            $nombre      = trim($input['nombre'] ?? '');
            $categoria   = (int)($input['categoria'] ?? 0);
            $precio      = (float)($input['precio'] ?? 0);
            $descripcion = trim($input['descripcion'] ?? '');
            $colores     = trim($input['colores'] ?? '');
            
            if (!$id) $errores[] = "ID de producto no proporcionado.";
            
            // ── NUEVAS VALIDACIONES ESTRICTAS DE BACKEND ──
            if (empty($nombre)) $errores[] = "El nombre es obligatorio.";
            if (mb_strlen($nombre) > 100) $errores[] = "El nombre del producto no puede exceder los 100 caracteres.";
            if ($precio < 0) $errores[] = "El precio no puede ser negativo.";
            if (empty($colores)) $errores[] = "Los colores son obligatorios.";
            if (mb_strlen($colores) > 50) $errores[] = "El texto de colores no puede exceder los 50 caracteres.";
            if (mb_strlen($descripcion) > 500) $errores[] = "La descripción no puede exceder los 500 caracteres.";
            if ($categoria <= 0) $errores[] = "Debes seleccionar una categoría válida.";
            
            // Buscamos la imagen actual del producto en la base de datos por si no se cambia
            $productoActual = $this->model->obtenerPorId((int)$id);
            $imagenAnterior = $productoActual['Imagen'] ?? 'default.jpg';

            // Validar peso de imagen Base64 (aproximado)
            $imagenInput = $input['imagen'] ?? $imagenAnterior;
            if (str_contains($imagenInput, 'base64,')) {
                $longitud = strlen($imagenInput) - strpos($imagenInput, ',') - 1;
                $sizeMB = ($longitud * (3/4)) / (1024 * 1024);
                if ($sizeMB > 2) {
                     $errores[] = "La imagen supera el límite de 2MB.";
                }
            }

            if(empty($errores)){
                // Procesamos la nueva imagen en Base64 si el usuario seleccionó una
                $imagenFinal = $this->guardarImagenBase64($imagenInput, $imagenAnterior);
            }

            $tallasInput = $input['tallas'] ?? [];
            $tallasStock = [
                'XS' => (int)($tallasInput['xs'] ?? 0),
                'S'  => (int)($tallasInput['s']  ?? 0),
                'M'  => (int)($tallasInput['m']  ?? 0),
                'L'  => (int)($tallasInput['l']  ?? 0),
                'XL' => (int)($tallasInput['xl'] ?? 0)
            ];

            $totalStock = array_sum($tallasStock);
            if ($totalStock <= 0) $errores[] = "El inventario total no puede ser 0.";

            if (empty($errores)) {
                $disponibles = array_keys(array_filter($tallasStock, fn($s) => $s > 0));

                $datos = [
                    'IDProducto'     => (int)$id,
                    'NombreProducto' => $nombre,
                    'IDCategoria'    => $categoria,
                    'Precio'         => $precio,
                    'Descripcion'    => $descripcion,
                    'TallasDisp'     => implode(', ', $disponibles),
                    'Colores'        => $colores,
                    'Imagen'         => $imagenFinal ?? $imagenAnterior
                ];

                if ($this->model->actualizarProducto($datos, $tallasStock)) {
                    echo json_encode(["status" => "success", "message" => "Producto actualizado correctamente."]);
                    exit;
                } else {
                    $errores[] = "Error SQL al actualizar.";
                }
            }
        }

        http_response_code(400);
        echo json_encode(["status" => "error", "message" => implode(" ", $errores)]);
        exit;
    }

   public function eliminarProducto(): void
    {
        try {
            $input = json_decode(file_get_contents("php://input"), true);
            
            if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($input['id'])) {
                if ($this->model->eliminarProducto((int)$input['id'])) {
                    echo json_encode(["status" => "success", "message" => "Producto eliminado del inventario."]);
                    exit;
                }
            }
            
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Error al intentar eliminar el producto."]);
            exit;
        } catch (Exception $e) {
            // Atrapamos la restricción SQL y respondemos con un 400 (Bad Request) y el mensaje JSON
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => $e->getMessage()]);
            exit;
        }
    }

    public function listarCategoriasAdmin(): void
    {
        $categorias = $this->model->obtenerCategoriasAdmin();
        echo json_encode($categorias);
        exit;
    }

    public function obtenerCategoriaDetalle(): void
    {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $cat = $this->model->obtenerCategoriaPorId((int)$id);
            echo json_encode($cat);
            exit;
        }
        echo json_encode(["status" => "error", "message" => "ID no proporcionado"]);
        exit;
    }

    public function crearCategoria(): void
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $input) {
            $nombre = trim($input['nombre'] ?? '');
            $seccion = trim($input['seccion'] ?? 'Caballeros');
            $descripcion = trim($input['descripcion'] ?? '');

            if (empty($nombre)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "El nombre de la categoría es obligatorio."]);
                exit;
            }

            $datos = [
                'NombreCategoria' => $nombre,
                'Seccion' => $seccion,
                'Descripcion' => $descripcion
            ];

            if ($this->model->insertarCategoria($datos)) {
                echo json_encode(["status" => "success", "message" => "Categoría creada con éxito."]);
                exit;
            }
        }
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al guardar la categoría."]);
        exit;
    }

    public function editarCategoria(): void
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $input) {
            $id = $input['id'] ?? null;
            $nombre = trim($input['nombre'] ?? '');
            $seccion = trim($input['seccion'] ?? 'Caballeros');
            $descripcion = trim($input['descripcion'] ?? '');

            if (!$id || empty($nombre)) {
                http_response_code(400);
                echo json_encode(["status" => "error", "message" => "Datos incompletos."]);
                exit;
            }

            $datos = [
                'IDCategoria' => (int)$id,
                'NombreCategoria' => $nombre,
                'Seccion' => $seccion,
                'Descripcion' => $descripcion
            ];

            if ($this->model->actualizarCategoria($datos)) {
                echo json_encode(["status" => "success", "message" => "Categoría actualizada correctamente."]);
                exit;
            }
        }
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Error al actualizar la categoría."]);
        exit;
    }
    // ── Gestión de Pedidos ────────────────────────────────────────

    public function listarPedidos(): void
    {
        $pedidos = $this->model->obtenerPedidosAdmin();
        echo json_encode($pedidos);
        exit;
    }

    public function detallePedido(): void
    {
        $id = $_GET['id'] ?? null;
        if ($id) {
            $detalle = $this->model->obtenerDetallePedidoAdmin((int)$id);
            echo json_encode($detalle);
            exit;
        }
        echo json_encode(["status" => "error", "message" => "ID no proporcionado"]);
        exit;
    }

    public function actualizarEstadoPedido(): void
    {
        $input = json_decode(file_get_contents("php://input"), true);
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && $input) {
            $id = (int)($input['id'] ?? 0);
            $estado = trim($input['estado'] ?? '');

            if ($id > 0 && !empty($estado)) {
                // Regla de negocio: Si se cancela, devolvemos el stock a las tallas
                if ($estado === 'Cancelada') {
                    $this->model->devolverStockPedido($id);
                }
                
                if ($this->model->actualizarEstadoPedido($id, $estado)) {
                    echo json_encode(["status" => "success", "message" => "Estado actualizado a $estado."]);
                    exit;
                }
            }
        }
        http_response_code(400);
        echo json_encode(["status" => "error", "message" => "Datos inválidos para actualizar estado."]);
        exit;
    }
    // ── Gestión de Clientes ───────────────────────────────────────
    public function listarClientes(): void
    {
        try {
            $clientes = $this->model->obtenerClientesAdmin();
            http_response_code(200);
            header('Content-Type: application/json; charset=utf-8');
            echo json_encode($clientes, JSON_UNESCAPED_UNICODE);
            exit;
        } catch (\Throwable $e) {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Error al obtener clientes: " . $e->getMessage()]);
            exit;
        }
    }
}