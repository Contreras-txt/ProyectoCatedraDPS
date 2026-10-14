<?php
require_once __DIR__ . '/../models/ProductoModel.php';
require_once __DIR__ . '/../models/ClienteModel.php';
require_once __DIR__ . '/../models/AuthModel.php';
require_once __DIR__ . '/../models/OrdenModel.php';

class StoreController
{
    private ProductoModel $model;
    private AuthModel $auth;
    private OrdenModel $ordenes;
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->model   = new ProductoModel($pdo);
        $this->auth    = new AuthModel($pdo);
        $this->ordenes = new OrdenModel($pdo);
        $this->pdo     = $pdo;
    }

    private function responder(int $codigo, array $payload): void
    {
        http_response_code($codigo);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    }

    public function index(): void
    {
        $seccion    = $_GET['seccion'] ?? null;
        $categorias = $this->model->obtenerCategorias();
        $productos  = $seccion
            ? $this->model->obtenerPorSeccion($seccion)
            : $this->model->obtenerTodos();
        $nuevos = $this->model->obtenerNuevos(8);

        $this->responder(200, [
            "status" => "success",
            "data"   => ["categorias" => $categorias, "productos" => $productos, "nuevos" => $nuevos],
        ]);
    }

    /**
     * POST /checkout
     * { idCliente, token, metodoPago, envio:{...}, items:[{idProducto,talla,cantidad}] }
     */
    public function checkout(): void
    {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            $this->responder(405, ["status" => "error", "message" => "Método no permitido"]);
            return;
        }

        $in = json_decode(file_get_contents('php://input'), true);
        if (!is_array($in)) {
            $this->responder(400, ["status" => "error", "message" => "Solicitud inválida."]);
            return;
        }

        // 1) Autenticación: el pedido solo puede hacerlo el dueño de la sesión
        $idCliente = (int) ($in['idCliente'] ?? 0);
        $cliente   = $this->auth->clientePorToken($idCliente, (string) ($in['token'] ?? ''));
        if (!$cliente) {
            $this->responder(401, ["status" => "error", "message" => "Tu sesión expiró. Inicia sesión nuevamente."]);
            return;
        }

        // 2) Validaciones
        $e = $in['envio'] ?? [];
        $envio = [
            'nombre'       => trim($e['nombre']       ?? ''),
            'apellido'     => trim($e['apellido']     ?? ''),
            'direccion'    => trim($e['direccion']    ?? ''),
            'ciudad'       => trim($e['ciudad']       ?? ''),
            'departamento' => trim($e['departamento'] ?? ''),
            'telefono'     => preg_replace('/\D/', '', (string) ($e['telefono'] ?? '')),
            'fechaEntrega' => trim($e['fechaEntrega'] ?? ''),
        ];

        $errores = [];
        foreach (['nombre', 'apellido'] as $c) {
            if (!preg_match('/^[\p{L}\s]{1,35}$/u', $envio[$c])) {
                $errores[] = "El campo {$c} no es válido.";
            }
        }
        if ($envio['direccion'] === '' || mb_strlen($envio['direccion']) > 100) $errores[] = "La dirección es obligatoria (máx. 100 caracteres).";
        if ($envio['ciudad'] === ''    || mb_strlen($envio['ciudad']) > 50)     $errores[] = "La ciudad es obligatoria.";
        if ($envio['departamento'] === '' || mb_strlen($envio['departamento']) > 50) $errores[] = "El departamento es obligatorio.";
        if (strlen($envio['telefono']) !== 8) $errores[] = "El teléfono debe tener 8 dígitos.";

        $tz    = new DateTimeZone('America/El_Salvador');
        $fecha = DateTimeImmutable::createFromFormat('!Y-m-d', $envio['fechaEntrega'], $tz);
        $min   = (new DateTimeImmutable('today', $tz))->modify('+3 days');
        if (!$fecha || $fecha->format('Y-m-d') !== $envio['fechaEntrega'] || $fecha < $min) {
            $errores[] = "La fecha de entrega debe ser a partir de 3 días desde hoy.";
        }

        $metodoMap  = ['Transferencia' => 'Transferencia', 'Efectivo' => 'Contra_Entrega', 'Contra_Entrega' => 'Contra_Entrega'];
        $metodoPago = $metodoMap[$in['metodoPago'] ?? ''] ?? null;
        if (!$metodoPago) $errores[] = "Selecciona un método de pago válido.";

        $items = $in['items'] ?? [];
        if (!is_array($items) || count($items) === 0 || count($items) > 50) {
            $errores[] = "Tu carrito está vacío.";
        }

        if (!empty($errores)) {
            $this->responder(400, ["status" => "error", "errores" => $errores]);
            return;
        }

        // 3) Crear la orden
        try {
            $r = $this->ordenes->crearOrden($idCliente, $envio, $metodoPago, $items);
            $this->responder(201, ["status" => "success", "data" => $r]);
        } catch (RuntimeException $ex) {
            $this->responder(409, ["status" => "error", "message" => $ex->getMessage()]);
        } catch (Throwable $ex) {
            error_log('Checkout error: ' . $ex->getMessage());
            $this->responder(500, ["status" => "error", "message" => "No se pudo procesar el pedido. Intenta de nuevo."]);
        }
    }
}
