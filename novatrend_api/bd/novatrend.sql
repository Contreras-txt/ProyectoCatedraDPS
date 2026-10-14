-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 12-10-2026 a las 18:04:35
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `novatrend`
--
CREATE DATABASE IF NOT EXISTS `novatrend` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `novatrend`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `IDCategoria` int(11) NOT NULL,
  `NombreCategoria` varchar(50) NOT NULL,
  `Seccion` enum('Caballeros','Damas','Niños') NOT NULL,
  `Descripcion` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`IDCategoria`, `NombreCategoria`, `Seccion`, `Descripcion`) VALUES
(1, 'Camisetas', 'Caballeros', NULL),
(2, 'Pantalones', 'Caballeros', NULL),
(3, 'Vestidos', 'Damas', NULL),
(4, 'Blusas', 'Damas', NULL),
(5, 'Ropa Niño', 'Niños', NULL),
(6, 'Camisas', 'Caballeros', 'Camisas formales e informales para hombre'),
(7, 'Chaquetas Hombre', 'Caballeros', 'Chaquetas y abrigos para hombre'),
(8, 'Chaquetas Mujer', 'Damas', 'Chaquetas y abrigos para mujer'),
(9, 'Conjuntos', 'Damas', 'Conjuntos y sets de dos piezas para mujer'),
(10, 'Deportivo', 'Damas', 'Ropa deportiva y activewear para mujer'),
(11, 'Ropa Niña', 'Niños', 'Ropa casual y de moda para niñas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `IDCliente` int(11) NOT NULL,
  `Nombre` varchar(35) NOT NULL,
  `Apellido` varchar(35) NOT NULL,
  `Direccion` varchar(100) DEFAULT NULL,
  `Departamento` varchar(50) DEFAULT NULL,
  `Ciudad` varchar(50) DEFAULT NULL,
  `Email` varchar(100) NOT NULL,
  `Telefono` varchar(15) DEFAULT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `IntentosFallidos` int(11) NOT NULL DEFAULT 0,
  `BloqueadoHasta` datetime DEFAULT NULL,
  `TokenSesion` char(64) DEFAULT NULL,
  `TokenCreadoEn` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `clientes`
--

INSERT INTO `clientes` (`IDCliente`, `Nombre`, `Apellido`, `Direccion`, `Departamento`, `Ciudad`, `Email`, `Telefono`, `Contrasena`, `IntentosFallidos`, `BloqueadoHasta`, `TokenSesion`, `TokenCreadoEn`) VALUES
(1, 'Mayerlyn', 'Escobar', 'La Libertad', 'La Libertad', 'Ciudad Merliot', 'maye@gmail.com', '79232132', '$2y$10$soPwV65VgSEKf775M6rByugBw/iUQQBsD/NtvSwc8MePg9vpK.4Aq', 0, NULL, NULL, NULL),
(2, 'Carlos', 'Contreras', 'Jardines de la Hacienda', 'Ahuachapán', 'Ciudad Merliot', 'carlos@gmail.com', '2567894', '$2y$10$rKbRjb0ROeWQJXZsk25B2uHD8M/6YvlSA./oPPHMyPp8VO7UnNPre', 0, NULL, NULL, NULL),
(3, 'Ana', 'Martínez', 'Col. Escalón, Calle Los Pinos #45', 'San Salvador', 'San Salvador', 'ana.martinez@gmail.com', '7721-3345', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(4, 'Roberto', 'Flores', 'Res. Santa Elena, Pasaje 3 #12', 'La Libertad', 'Antiguo Cuscatlán', 'roberto.flores@gmail.com', '7834-2210', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(5, 'Sofía', 'Hernández', 'Barrio San Jacinto, Av. Independencia #78', 'San Salvador', 'San Salvador', 'sofia.hdez@hotmail.com', '7612-8890', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(6, 'Diego', 'Ramos', 'Col. San Benito, Calle El Mirador #9', 'San Salvador', 'San Salvador', 'diego.ramos@gmail.com', '7945-1123', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(7, 'Valentina', 'Cruz', 'Urb. Jardines de Guadalupe, Casa 4B', 'La Libertad', 'Ciudad Merliot', 'vale.cruz@gmail.com', '7523-6678', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(8, 'Marcos', 'Aguilar', 'Colonia Médica, Av. Roosevelt #201', 'San Salvador', 'San Salvador', 'marcos.aguilar@yahoo.com', '7867-4412', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(9, 'Lucía', 'Portillo', 'Res. Las Colinas, Calle Principal #33', 'Santa Ana', 'Santa Ana', 'lucia.portillo@gmail.com', '7334-9901', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(10, 'Andrés', 'Vásquez', 'Bo. San Miguelito, Calle Arce #67', 'San Salvador', 'San Salvador', 'andres.vasquez@gmail.com', '7756-2234', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(11, 'Camila', 'Orellana', 'Urb. La Floresta, Calle Bambú #18', 'Sonsonate', 'Sonsonate', 'camila.ore@gmail.com', '7489-5567', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(12, 'Fernando', 'Gutiérrez', 'Col. Utila, Pasaje Los Álamos #5', 'La Libertad', 'Santa Tecla', 'fer.gutierrez@hotmail.com', '7678-3390', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 0, NULL, NULL, NULL),
(13, 'Stephanie', 'Urias', 'Avenida norte 1', 'La Libertad', 'Merliot', 'step@gmail.com', '76908525', '$2y$10$DUlgs1mPpJ9d9fFknj.tzuuRFMeZIp9UUyG2qbOp5YhQ9aV7mpm66', 0, NULL, NULL, '2026-10-12 09:31:59'),
(14, 'Diego', 'Cuellar', 'Santa Tecla', 'La Libertad', 'Santa Tecla', 'cuellar@gmail.con', '70003838', '$2y$10$0BT/z8pa9oAFm6PPbrSl9.tmR9Rx2efiOIakWdTV9HXEpIQbm7qBW', 0, NULL, NULL, NULL),
(15, 'Diego', 'Cuéllar', 'Bethania', 'Cabañas', 'Merliot', 'cuellar16@gmail.com', '75758281', '$2y$10$gNHmbZQEcJqdOI8FLzoPleE1BMbui/68j4ASZbBQYsURY6iorkDxW', 0, NULL, NULL, '2026-10-12 10:02:08'),
(16, 'prueba', 'Prueba', NULL, NULL, NULL, 'prueba@gmail.com', NULL, '$2y$10$OVGLQjpwwvCBaIkuCv26werKG3el1Rr9G8ZjY2DTS5hqrXpTNRqLi', 2, NULL, NULL, '2026-10-11 20:21:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalles_orden`
--

CREATE TABLE `detalles_orden` (
  `IDDetalleOrden` int(11) NOT NULL,
  `IDOrden` int(11) NOT NULL,
  `IDProducto` int(11) NOT NULL,
  `Talla` varchar(5) DEFAULT NULL,
  `Cantidad` int(11) NOT NULL,
  `PrecioUnitario` decimal(10,2) NOT NULL,
  `Metodo_Pago` enum('Transferencia','Contra_Entrega') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `detalles_orden`
--

INSERT INTO `detalles_orden` (`IDDetalleOrden`, `IDOrden`, `IDProducto`, `Talla`, `Cantidad`, `PrecioUnitario`, `Metodo_Pago`) VALUES
(48, 1, 5, 'S', 1, 29.99, 'Transferencia'),
(49, 1, 4, 'M', 1, 39.99, 'Transferencia'),
(50, 2, 18, 'S', 1, 64.99, 'Contra_Entrega'),
(51, 2, 19, 'M', 1, 32.99, 'Contra_Entrega'),
(52, 3, 23, 'XS', 1, 27.99, 'Transferencia'),
(53, 4, 8, 'L', 1, 34.99, 'Transferencia'),
(54, 4, 3, 'L', 1, 49.99, 'Transferencia'),
(55, 5, 17, 'M', 1, 79.99, 'Contra_Entrega'),
(56, 6, 20, 'L', 1, 39.99, 'Transferencia'),
(57, 6, 21, 'L', 2, 22.99, 'Transferencia'),
(58, 7, 10, 'S', 1, 44.99, 'Contra_Entrega'),
(59, 7, 5, 'S', 1, 29.99, 'Contra_Entrega'),
(60, 8, 14, 'M', 1, 49.99, 'Transferencia'),
(61, 8, 9, 'S', 1, 54.99, 'Transferencia'),
(62, 9, 18, 'XS', 1, 64.99, 'Contra_Entrega'),
(63, 10, 13, 'M', 1, 59.99, 'Contra_Entrega'),
(64, 10, 8, 'M', 1, 34.99, 'Contra_Entrega'),
(65, 11, 24, 'L', 1, 89.99, 'Transferencia'),
(66, 11, 3, 'M', 1, 49.99, 'Transferencia'),
(67, 12, 4, 'XS', 1, 39.99, 'Contra_Entrega'),
(68, 12, 5, 'XS', 1, 29.99, 'Contra_Entrega'),
(69, 13, 9, 'M', 1, 54.99, 'Transferencia'),
(70, 13, 22, 'M', 1, 19.99, 'Transferencia'),
(71, 14, 25, 'S', 1, 74.99, 'Contra_Entrega'),
(72, 15, 1, 'XL', 1, 19.99, 'Transferencia'),
(73, 15, 3, 'XL', 1, 49.99, 'Transferencia'),
(74, 16, 17, 'L', 1, 79.99, 'Contra_Entrega'),
(75, 16, 8, 'L', 1, 34.99, 'Contra_Entrega'),
(76, 17, 24, 'M', 1, 89.99, 'Transferencia'),
(77, 18, 19, 'L', 1, 32.99, 'Contra_Entrega'),
(78, 18, 23, 'M', 2, 27.99, 'Contra_Entrega'),
(79, 19, 18, 'S', 1, 64.99, 'Transferencia'),
(80, 19, 22, 'S', 1, 19.99, 'Transferencia'),
(81, 20, 13, 'L', 1, 59.99, 'Contra_Entrega'),
(82, 20, 2, 'L', 1, 24.99, 'Contra_Entrega'),
(83, 21, 20, 'M', 1, 39.99, 'Transferencia'),
(84, 21, 17, 'M', 1, 79.99, 'Transferencia'),
(85, 22, 21, 'M', 2, 22.99, 'Contra_Entrega'),
(86, 23, 10, 'M', 1, 44.99, 'Transferencia'),
(87, 23, 14, 'S', 1, 49.99, 'Transferencia'),
(88, 24, 4, 'S', 1, 39.99, 'Contra_Entrega'),
(89, 24, 5, 'M', 1, 29.99, 'Contra_Entrega'),
(90, 25, 8, 'XL', 1, 34.99, 'Transferencia'),
(91, 25, 1, 'L', 1, 19.99, 'Transferencia'),
(92, 26, 24, 'XL', 1, 89.99, 'Contra_Entrega'),
(93, 26, 20, 'XL', 1, 39.99, 'Contra_Entrega'),
(94, 27, 17, 'XL', 1, 79.99, 'Transferencia'),
(95, 28, 5, 'M', 1, 29.99, 'Transferencia'),
(96, 29, 25, 'S', 2, 74.99, 'Contra_Entrega'),
(97, 29, 28, 'M', 3, 25.00, 'Contra_Entrega'),
(98, 29, 30, 'S', 1, 25.00, 'Contra_Entrega'),
(99, 30, 30, 'XS', 2, 25.00, 'Contra_Entrega'),
(100, 31, 30, 'S', 4, 25.00, 'Contra_Entrega'),
(101, 32, 20, 'XL', 2, 39.99, 'Contra_Entrega'),
(102, 32, 30, 'M', 2, 25.00, 'Contra_Entrega'),
(103, 32, 30, 'XS', 2, 25.00, 'Contra_Entrega'),
(104, 33, 21, 'L', 2, 22.99, 'Contra_Entrega'),
(105, 34, 18, 'M', 2, 64.99, 'Contra_Entrega'),
(106, 35, 24, 'M', 3, 89.99, 'Contra_Entrega');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `IDOrden` int(11) NOT NULL,
  `IDCliente` int(11) NOT NULL,
  `FechaPedido` datetime NOT NULL DEFAULT current_timestamp(),
  `FechaEntrega` datetime DEFAULT NULL,
  `EstadoOrden` varchar(30) NOT NULL DEFAULT 'Pendiente',
  `NombreEnvio` varchar(80) DEFAULT NULL,
  `DireccionEnvio` varchar(100) DEFAULT NULL,
  `CiudadEnvio` varchar(50) DEFAULT NULL,
  `DepartamentoEnvio` varchar(50) DEFAULT NULL,
  `TelefonoEnvio` varchar(15) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `ordenes`
--

INSERT INTO `ordenes` (`IDOrden`, `IDCliente`, `FechaPedido`, `FechaEntrega`, `EstadoOrden`, `NombreEnvio`, `DireccionEnvio`, `CiudadEnvio`, `DepartamentoEnvio`, `TelefonoEnvio`) VALUES
(1, 3, '2026-01-08 10:23:00', '2026-01-13 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(2, 3, '2026-03-15 14:05:00', '2026-03-20 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(3, 3, '2026-05-02 09:10:00', '2026-05-09 00:00:00', 'Aprobada', NULL, NULL, NULL, NULL, NULL),
(4, 4, '2026-01-20 11:30:00', '2026-01-27 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(5, 4, '2026-02-14 16:45:00', '2026-02-20 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(6, 4, '2026-04-10 08:00:00', '2026-04-17 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(7, 5, '2026-01-30 13:20:00', '2026-02-05 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(8, 5, '2026-03-22 10:55:00', '2026-03-28 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(9, 5, '2026-05-05 15:30:00', '2026-05-12 00:00:00', 'Pendiente', NULL, NULL, NULL, NULL, NULL),
(10, 6, '2026-02-03 09:45:00', '2026-02-10 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(11, 6, '2026-04-18 12:00:00', '2026-04-25 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(12, 7, '2026-02-20 17:10:00', '2026-02-27 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(13, 7, '2026-03-05 11:25:00', '2026-03-12 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(14, 7, '2026-05-01 10:00:00', '2026-05-08 00:00:00', 'Aprobada', NULL, NULL, NULL, NULL, NULL),
(15, 8, '2026-01-12 14:30:00', '2026-01-19 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(16, 8, '2026-03-28 09:15:00', '2026-04-04 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(17, 8, '2026-05-06 16:20:00', '2026-05-13 00:00:00', 'Pendiente', NULL, NULL, NULL, NULL, NULL),
(18, 9, '2026-02-08 10:00:00', '2026-02-15 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(19, 9, '2026-04-22 13:40:00', '2026-04-29 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(20, 10, '2026-01-25 08:50:00', '2026-02-01 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(21, 10, '2026-03-10 15:00:00', '2026-03-17 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(22, 10, '2026-05-07 11:05:00', '2026-05-14 00:00:00', 'Pendiente', NULL, NULL, NULL, NULL, NULL),
(23, 11, '2026-02-28 12:30:00', '2026-03-06 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(24, 11, '2026-04-05 09:20:00', '2026-04-12 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(25, 12, '2026-01-17 16:00:00', '2026-01-24 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(26, 12, '2026-03-01 10:45:00', '2026-03-08 00:00:00', 'Entregada', NULL, NULL, NULL, NULL, NULL),
(27, 12, '2026-05-04 14:15:00', '2026-05-11 00:00:00', 'Pendiente', NULL, NULL, NULL, NULL, NULL),
(28, 2, '2026-05-09 13:39:55', '2026-05-21 00:00:00', 'Aprobada', NULL, NULL, NULL, NULL, NULL),
(29, 13, '2026-10-10 23:28:19', '2026-10-13 00:00:00', 'Entregada', 'Stephanie Urias', 'Ciudad Merliot', 'Ciudad Merliot', 'La Libertad', '78134654'),
(30, 13, '2026-10-11 10:43:54', '2026-10-14 00:00:00', 'Entregada', 'Stephanie Urias', 'La libertad', 'Merliot', 'La Libertad', '70002222'),
(31, 13, '2026-10-11 10:44:38', '2026-10-14 00:00:00', 'Cancelada', 'Stephanie Urias', 'Santa tecla', 'Merliot', 'La Libertad', '70002230'),
(32, 14, '2026-10-11 14:45:03', '2026-10-14 00:00:00', 'Entregada', 'Diego Cuellar', 'Santa Tecla', 'Santa Tecla', 'La Libertad', '70003838'),
(33, 15, '2026-10-11 19:11:36', '2026-10-14 00:00:00', 'Entregada', 'Diego Cuéllar', 'Santa tecla', 'Merliot', 'Cabañas', '75758282'),
(34, 15, '2026-10-11 20:04:43', '2026-10-14 00:00:00', 'Entregada', 'Diego Cuéllar', 'Santa tecla', 'Merliot', 'Cabañas', '75758282'),
(35, 15, '2026-10-11 20:11:28', '2026-10-15 00:00:00', 'Entregada', 'Diego Cuéllar', 'Bethania', 'Merliot', 'Cabañas', '75758281');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `IDProducto` int(11) NOT NULL,
  `NombreProducto` varchar(100) NOT NULL,
  `Descripcion` varchar(500) DEFAULT NULL,
  `Precio` decimal(10,2) NOT NULL,
  `IDCategoria` int(11) NOT NULL,
  `TallasDisp` varchar(50) DEFAULT NULL,
  `Colores` varchar(50) DEFAULT NULL,
  `Imagen` varchar(255) DEFAULT 'default.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`IDProducto`, `NombreProducto`, `Descripcion`, `Precio`, `IDCategoria`, `TallasDisp`, `Colores`, `Imagen`) VALUES
(1, 'Camiseta Básica Negra', 'Camiseta de algodón color negro, corte recto, esencial en cualquier guardarropa', 19.99, 1, 'S, M, L', 'Negro', 'f32acbefbb03935674f075e40e488a96.jpg'),
(2, 'Camiseta Oversize Blanca', 'Camiseta de algodón color blanco con corte oversize, esencial en cualquier guardarropa', 24.99, 1, 'M, L, XL', 'Blanco', '61e5c99b91c7f3e49b4830a564be4ca0.jpg'),
(3, 'Jeans Slim Fit', 'Pantalones básicos de mezclilla, corte recto.', 49.99, 2, 'S, M, L, XL', 'Azul', 'b13f03d61c01957206791532ad4ca3df.jpg'),
(4, 'Vestido Floral', 'Elegante Vestido Floral para Verano', 39.99, 3, 'XS,S,M,L', 'Multicolor', 'c38b4b58eb40c3aa3de8ab7a6fa40517.jpg'),
(5, 'Blusa Elegante', 'Blusa blanca elegante, ideal para look formal.', 29.99, 4, 'XS, S, M, L', 'Blanco', '09b1023a64dcf5ae05b08c3bc3d0a72d.jpg'),
(7, 'Hoodie Oversize', 'Hoodie color beige, corte holgado, ideal para épocas de frío.', 29.99, 8, 'S, M, L, XL', 'Beige', 'b764d3467bcfddb717f9bf847a22ce3a.jpg'),
(8, 'Camisa Cuadros Oversize', 'Camisa de franela con estampado de cuadros en tonos azul y negro, corte holgado, ideal para look casual', 34.99, 6, 'XS, S, M, L, XL', 'Azul/Negro', '5e61f390f8aa2c9d5698732a0da1596f.jpg'),
(9, 'Conjunto Jean Wide-Leg', 'Set de dos piezas: top corto y pantalón ancho estilo palazzo en denim celeste, look urbano y cómodo', 54.99, 9, 'XS, S, M, L', 'Celeste', '97e50f76bc2e43fa6b8f054bb3d33cec.jpg'),
(10, 'Set Deportivo Fitness', 'Top deportivo de tiras con leggins grises de alto rendimiento, tela transpirable con compresión suave', 44.99, 10, 'XS, S, M, L', 'Rosa/Gris', 'c4fb3f425bab4ea22cad4bab263c2045.jpg'),
(11, 'Conjunto Niña Chaqueta Casual', 'Chaqueta acolchada color café con camiseta blanca y shorts a juego, perfecta para clima fresco', 38.99, 11, 'XS, S, M, L', 'Café/Blanco', '2efccab8576cdb3f400da901de3b56a6.jpg'),
(13, 'Overol Denim Caballero', 'Overol de mezclilla azul claro con camiseta blanca incluida, estilo retro urbano', 59.99, 2, 'S, M, L, XL', 'Azul', 'b2976bdd1f84ed6e3804c7a309929eca.jpg'),
(14, 'Overol Mujer Con Detalles', 'Overol de mezclilla con top rosa interior, diseño juvenil y divertido para uso diario', 49.99, 9, 'XS, S, M, L', 'Azul/Rosa', '1546bd230e0ed52403a66d579d09cfd3.jpg'),
(15, 'Conjunto Niño Denim Total Look', 'Camisa denim, jeans y gorro a juego, conjunto completo estilo urbano para niños activos', 42.99, 5, 'XS, S, M, L', 'Azul', 'c4e4171e910a394720791538aaa94571.jpg'),
(16, 'Chaqueta Niño Casual Azul', 'Cahqueta color azul marino de manga larga, corte relajado, ideal para uso escolar y casual', 24.99, 5, 'XS, S, M, L', 'Azul', 'ce2e9cd4f23ab1b71a791a87f3491dee.png'),
(17, 'Blazer Casual Hombre', 'Blazer estructurado color gris medio, corte slim fit, ideal para ocasiones formales y de negocios', 79.99, 6, 'S, M, L, XL', 'Gris', 'ac63b9c5a5f5225b15f397ee149a25ca.jpg'),
(18, 'Conjunto Camisola Elegante', 'Set de camisola satinada y pantalón ancho en tono beige, look sofisticado para salidas y eventos', 64.99, 9, 'XS, S, M, L', 'Beige', '87175211c2a7215a9bf6c3d902a0391f.jpg'),
(19, 'Blusa Oversize Minimalista', 'Blusa de tela suave en tono rosa palo con corte oversize y manga corta, estilo minimalista moderno', 32.99, 4, 'XS, S, M, L', 'Rosa', '31f2dcb4abacc3eabe2681428a2a3f40.jpg'),
(20, 'Suéter Cuello V Hombre', 'Suéter de punto fino color negro con escote en V, corte slim, versátil para looks casuales y semi-formales', 39.99, 1, 'S, M, L, XL', 'Negro', 'c91e5069392e82d27fe6cf4eee3a7c0d.jpg'),
(21, 'Camiseta Básica Manga Larga', 'Camiseta de algodón color blanco con manga larga, corte recto, esencial en cualquier guardarropa', 22.99, 1, 'S, M, L, XL', 'Blanco', 'aa40dce74ac43f9dec95a9ccef11a010.jpg'),
(22, 'Top Básico Mujer', 'Top ajustado color blanco de tela suave, ideal para combinar con jeans o faldas en looks cotidianos', 19.99, 4, 'XS, S, M, L', 'Blanco', '6314654491b172eefbf789cbf353019b.jpg'),
(23, 'Blusa Cuello Alto Negro', 'Blusa de cuello alto color negro, tela elástica de tacto suave, estilo chic y elegante para toda ocasión', 27.99, 4, 'XS, S, M, L', 'Negro', 'e63450fc375d969b8ec50c082561d972.jpg'),
(24, 'Chaqueta Cuero Sintético Hombre', 'Chaqueta de cuero sintético color negro, estilo motero con cremallera lateral, look urbano y atrevido', 89.99, 7, 'S, M, L, XL', 'Negro', '70f724391679293e2f877ddac2246680.jpg'),
(25, 'Chaqueta Oversize Mujer', 'Chaqueta larga estilo abrigo en tono gris y beige, tejido suave y abrigado, perfecta para otoño e invierno', 74.99, 8, 'XS, S, M, L', 'Gris/Beige', '3eebc3afbf9e6ae86f9a472e4aa3d717.jpg'),
(26, 'Leggins Acampanados', 'Leggins acampanados grises, corte estilizado y cómodo.', 19.99, 10, 'S, M, L', 'Gris', '2f22acc25cf3d3320dbc88ae646ebeef.jpg'),
(28, 'Centro', 'Centro de algodon', 25.00, 1, 'S', 'Blanco', '3a20bac1e090e7efa523154f99755f37.jpg'),
(30, 'Centro', 'Centro de algodón', 25.00, 4, 'L', 'Blanco', '0b19fb668e198877485a5057d8bb728d.jpg'),
(31, 'Conjunto para niño', 'Conjunto para niño', 25.00, 5, 'XS, M, L, XL', 'Azul', '5d56af11638759aef421667009f258b0.jpg');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_tallas`
--

CREATE TABLE `producto_tallas` (
  `IDProductoTalla` int(11) NOT NULL,
  `IDProducto` int(11) NOT NULL,
  `Talla` varchar(5) NOT NULL,
  `Stock` int(11) NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `producto_tallas`
--

INSERT INTO `producto_tallas` (`IDProductoTalla`, `IDProducto`, `Talla`, `Stock`) VALUES
(1, 1, 'S', 17),
(2, 1, 'M', 17),
(3, 1, 'L', 16),
(7, 3, 'S', 5),
(8, 3, 'M', 5),
(9, 3, 'L', 5),
(10, 3, 'XL', 5),
(11, 4, 'XS', 4),
(12, 4, 'S', 1),
(13, 4, 'M', 3),
(14, 4, 'L', 3),
(15, 5, 'XS', 5),
(16, 5, 'S', 5),
(17, 5, 'M', 5),
(18, 5, 'L', 5),
(22, 1, 'XS', 0),
(26, 1, 'XL', 0),
(32, 8, 'S', 10),
(33, 8, 'M', 10),
(34, 8, 'L', 10),
(35, 8, 'XL', 8),
(36, 9, 'XS', 8),
(37, 9, 'S', 10),
(38, 9, 'M', 10),
(39, 9, 'L', 8),
(40, 10, 'XS', 10),
(41, 10, 'S', 10),
(42, 10, 'M', 10),
(43, 10, 'L', 8),
(44, 11, 'XS', 8),
(45, 11, 'S', 8),
(46, 11, 'M', 8),
(47, 11, 'L', 6),
(52, 13, 'S', 8),
(53, 13, 'M', 10),
(54, 13, 'L', 10),
(55, 13, 'XL', 6),
(56, 14, 'XS', 8),
(57, 14, 'S', 10),
(58, 14, 'M', 10),
(59, 14, 'L', 8),
(60, 15, 'XS', 8),
(61, 15, 'S', 8),
(62, 15, 'M', 8),
(63, 15, 'L', 6),
(64, 16, 'XS', 10),
(65, 16, 'S', 10),
(66, 16, 'M', 8),
(67, 16, 'L', 6),
(68, 17, 'S', 8),
(69, 17, 'M', 10),
(70, 17, 'L', 10),
(71, 17, 'XL', 6),
(72, 18, 'XS', 8),
(73, 18, 'S', 10),
(74, 18, 'M', 8),
(75, 18, 'L', 8),
(76, 19, 'XS', 10),
(77, 19, 'S', 10),
(78, 19, 'M', 10),
(79, 19, 'L', 8),
(80, 20, 'S', 10),
(81, 20, 'M', 10),
(82, 20, 'L', 10),
(83, 20, 'XL', 6),
(84, 21, 'S', 12),
(85, 21, 'M', 12),
(86, 21, 'L', 10),
(87, 21, 'XL', 10),
(88, 22, 'XS', 12),
(89, 22, 'S', 12),
(90, 22, 'M', 12),
(91, 22, 'L', 10),
(92, 23, 'XS', 10),
(93, 23, 'S', 10),
(94, 23, 'M', 10),
(95, 23, 'L', 8),
(96, 24, 'S', 8),
(97, 24, 'M', 5),
(98, 24, 'L', 8),
(99, 24, 'XL', 6),
(100, 25, 'XS', 8),
(101, 25, 'S', 6),
(102, 25, 'M', 8),
(103, 25, 'L', 6),
(108, 25, 'XL', 0),
(109, 24, 'XS', 0),
(118, 23, 'XL', 0),
(123, 22, 'XL', 0),
(124, 21, 'XS', 0),
(129, 20, 'XS', 0),
(138, 19, 'XL', 0),
(143, 18, 'XL', 0),
(144, 17, 'XS', 0),
(153, 16, 'XL', 0),
(158, 15, 'XL', 0),
(163, 14, 'XL', 0),
(164, 13, 'XS', 0),
(178, 11, 'XL', 0),
(183, 10, 'XL', 0),
(188, 9, 'XL', 0),
(189, 8, 'XS', 5),
(194, 7, 'S', 4),
(195, 7, 'M', 2),
(196, 7, 'L', 11),
(197, 7, 'XL', 8),
(198, 7, 'XS', 0),
(213, 3, 'XS', 0),
(222, 5, 'XL', 0),
(228, 26, 'XS', 0),
(229, 26, 'S', 4),
(230, 26, 'M', 16),
(231, 26, 'L', 6),
(232, 26, 'XL', 0),
(318, 28, 'XS', 0),
(319, 28, 'S', 25),
(320, 28, 'M', 0),
(321, 28, 'L', 0),
(322, 28, 'XL', 0),
(328, 30, 'XS', 0),
(329, 30, 'S', 0),
(330, 30, 'M', 0),
(331, 30, 'L', 14),
(332, 30, 'XL', 0),
(333, 31, 'XS', 15),
(334, 31, 'S', 0),
(335, 31, 'M', 25),
(336, 31, 'L', 1),
(337, 31, 'XL', 2);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `IDUsuario` int(11) NOT NULL,
  `Nombre` varchar(35) NOT NULL,
  `Apellido` varchar(35) NOT NULL,
  `Usuario` varchar(20) NOT NULL,
  `Contrasena` varchar(255) NOT NULL,
  `IntentosFallidos` int(11) NOT NULL DEFAULT 0,
  `BloqueadoHasta` datetime DEFAULT NULL,
  `TokenSesion` char(64) DEFAULT NULL,
  `TokenCreadoEn` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`IDUsuario`, `Nombre`, `Apellido`, `Usuario`, `Contrasena`, `IntentosFallidos`, `BloqueadoHasta`, `TokenSesion`, `TokenCreadoEn`) VALUES
(1, 'Admin', 'NovaTrend', 'admin', '$2y$10$YgRkn0ssmVb6QdTA3fjAFOPwuTzPnfwfSyPVJjOve7LIp3773ZzIS', 0, NULL, 'a5f1011947b66213293af0e97b34664ec88eb8a83f90f441f9858667288cf128', '2026-10-12 10:01:00');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`IDCategoria`),
  ADD UNIQUE KEY `NombreCategoria` (`NombreCategoria`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`IDCliente`),
  ADD UNIQUE KEY `Email` (`Email`);

--
-- Indices de la tabla `detalles_orden`
--
ALTER TABLE `detalles_orden`
  ADD PRIMARY KEY (`IDDetalleOrden`),
  ADD KEY `fk_detalle_orden` (`IDOrden`),
  ADD KEY `fk_detalle_producto` (`IDProducto`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`IDOrden`),
  ADD KEY `fk_orden_cliente` (`IDCliente`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`IDProducto`),
  ADD KEY `fk_producto_categoria` (`IDCategoria`);

--
-- Indices de la tabla `producto_tallas`
--
ALTER TABLE `producto_tallas`
  ADD PRIMARY KEY (`IDProductoTalla`),
  ADD UNIQUE KEY `uq_producto_talla` (`IDProducto`,`Talla`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`IDUsuario`),
  ADD UNIQUE KEY `Usuario` (`Usuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `IDCategoria` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `IDCliente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `detalles_orden`
--
ALTER TABLE `detalles_orden`
  MODIFY `IDDetalleOrden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `IDOrden` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `IDProducto` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `producto_tallas`
--
ALTER TABLE `producto_tallas`
  MODIFY `IDProductoTalla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=353;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `IDUsuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalles_orden`
--
ALTER TABLE `detalles_orden`
  ADD CONSTRAINT `fk_detalle_orden` FOREIGN KEY (`IDOrden`) REFERENCES `ordenes` (`IDOrden`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_detalle_producto` FOREIGN KEY (`IDProducto`) REFERENCES `productos` (`IDProducto`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `fk_orden_cliente` FOREIGN KEY (`IDCliente`) REFERENCES `clientes` (`IDCliente`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_producto_categoria` FOREIGN KEY (`IDCategoria`) REFERENCES `categorias` (`IDCategoria`) ON UPDATE CASCADE;

--
-- Filtros para la tabla `producto_tallas`
--
ALTER TABLE `producto_tallas`
  ADD CONSTRAINT `fk_pt_producto` FOREIGN KEY (`IDProducto`) REFERENCES `productos` (`IDProducto`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
