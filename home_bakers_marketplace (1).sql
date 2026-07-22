-- File: home_bakers_marketplace (1).sql
-- Purpose: Database schema or seed script for the project.
-- Main exports: Exports or main definitions

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 27, 2026 at 06:33 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `home_bakers_marketplace`
--

-- --------------------------------------------------------

--
-- Table structure for table `delivery_settings`
--

CREATE TABLE `delivery_settings` (
  `baker_id` varchar(64) NOT NULL,
  `min_order_value` decimal(10,2) DEFAULT 0.00,
  `max_delivery_km` decimal(6,2) DEFAULT 0.00,
  `delivery_fee_per_km` decimal(10,2) DEFAULT 0.00,
  `base_delivery_fee` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_settings`
--

INSERT INTO `delivery_settings` (`baker_id`, `min_order_value`, `max_delivery_km`, `delivery_fee_per_km`, `base_delivery_fee`) VALUES
('user_1779702567843_3stgi7f', 500.00, 10.00, 50.00, 150.00),
('user_1779819984730_zgax008', 500.00, 10.00, 50.00, 150.00);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` varchar(64) NOT NULL,
  `customer_id` varchar(64) DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `baker_id` varchar(64) DEFAULT NULL,
  `baker_name` varchar(255) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `delivery_fee` decimal(10,2) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','preparing','out_for_delivery','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `delivery_address` text DEFAULT NULL,
  `distance_km` decimal(6,2) DEFAULT 0.00,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `customer_id`, `customer_name`, `baker_id`, `baker_name`, `subtotal`, `delivery_fee`, `total`, `status`, `delivery_address`, `distance_km`, `created_at`, `updated_at`) VALUES
('ord_1779700509317_4f8sj36', 'user_1779700381343_rbevp2y', 'zainab', 'user_baker_1', 'Sarahs Sweets', 560.00, 600.00, 1160.00, 'pending', 'colombo', 9.00, '2026-05-25 14:45:09', '2026-05-25 14:45:09'),
('ord_1779702187552_j9277tn', 'user_1779702109399_atu3pwn', 'nifla', 'user_baker_1', 'Sarahs Sweets', 700.00, 450.00, 1150.00, 'pending', 'narambala', 6.00, '2026-05-25 15:13:07', '2026-05-25 15:13:07'),
('ord_1779705209246_j5s8rnv', 'user_1779705052403_f7tgpw6', 'mifrah', 'user_baker_1', 'Sarahs Sweets', 1890.00, 400.00, 2290.00, 'pending', 'kandy', 5.00, '2026-05-25 16:03:29', '2026-05-25 16:03:29'),
('ord_1779809207422_1cirimo', 'user_1779700381343_rbevp2y', 'zainab', 'user_baker_1', 'Sarahs Sweets', 1800.00, 250.00, 2050.00, 'pending', 'colombo', 2.00, '2026-05-26 20:56:47', '2026-05-26 20:56:47');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` varchar(64) NOT NULL,
  `order_id` varchar(64) NOT NULL,
  `product_id` varchar(64) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `name`, `price`, `quantity`) VALUES
('item_1779700509381_045tgfn', 'ord_1779700509317_4f8sj36', NULL, 'bun', 70.00, 8),
('item_1779702187557_06bzt73', 'ord_1779702187552_j9277tn', NULL, 'bun', 70.00, 10),
('item_1779705209253_ypuajk3', 'ord_1779705209246_j5s8rnv', NULL, 'bun', 70.00, 27),
('item_1779809207429_vdj8r62', 'ord_1779809207422_1cirimo', NULL, 'bun', 90.00, 20);

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` varchar(64) NOT NULL,
  `baker_id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `category` enum('sweet','savory','cakes','seasonal') NOT NULL,
  `image_url` varchar(1024) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `is_available` tinyint(1) NOT NULL DEFAULT 1,
  `rating` decimal(3,2) DEFAULT 0.00,
  `review_count` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `baker_id`, `name`, `description`, `price`, `category`, `image_url`, `stock`, `is_available`, `rating`, `review_count`, `created_at`) VALUES
('prod_1779819784968_q80urbs', 'user_baker_1', 'Brownies', 'Rich, fudgy chocolate brownies with a soft and gooey center, perfectly baked for an indulgent and satisfying sweet treat.\n', 150.00, 'cakes', 'http://localhost:4000/uploads/1779819742566-701057822.jfif', 40, 1, 0.00, 0, '2026-05-26 23:53:04'),
('prod_1779820402278_7eh6id5', 'user_1779819984730_zgax008', 'Bento cakes', 'Cute and customizable mini cakes, beautifully decorated with soft sponge layers and creamy frosting, perfect for small celebrations and heartfelt surprises.\n', 1500.00, 'cakes', 'http://localhost:4000/uploads/1779820384908-722820430.jpg', 20, 1, 0.00, 0, '2026-05-27 00:03:22'),
('prod_1779820601874_zizsoho', 'user_1779819984730_zgax008', 'Donuts', 'Soft and fluffy homemade donuts, freshly fried and coated with delicious glazes or toppings for a sweet and irresistible treat.\n', 180.00, 'sweet', 'http://localhost:4000/uploads/1779820568659-470991845.jpg', 70, 1, 0.00, 0, '2026-05-27 00:06:41'),
('prod_1779820876518_ydp948e', 'user_1779819984730_zgax008', 'Jar desserts', 'Delicious layered desserts served in cute jars, filled with creamy textures, rich flavors, and sweet toppings for a perfect grab-and-enjoy treat.\n', 220.00, 'cakes', 'http://localhost:4000/uploads/1779820834646-498327808.webp', 45, 1, 0.00, 0, '2026-05-27 00:11:16'),
('prod_1779821025416_59c0z11', 'user_1779819984730_zgax008', 'Cinnamon rolls', 'Soft and fluffy cinnamon rolls swirled with a sweet cinnamon filling and topped with creamy glaze for a warm, comforting, and delicious treat.\n', 250.00, 'sweet', 'http://localhost:4000/uploads/1779820968638-773733771.jpg', 35, 1, 0.00, 0, '2026-05-27 00:13:45'),
('prod_1779821334226_v2iivox', 'user_1779819984730_zgax008', 'Cake pops', 'Bite-sized cake pops made from moist cake crumbs mixed with creamy frosting, dipped in chocolate coating and decorated for a fun and delightful sweet treat.\n', 60.00, 'cakes', 'http://localhost:4000/uploads/1779821286634-634642554.webp', 45, 1, 0.00, 0, '2026-05-27 00:18:54'),
('prod_1779822797456_8ebk8r8', 'user_1779819984730_zgax008', 'Eid gift hampers', 'Thoughtfully curated Eid gift hampers filled with a mix of sweet treats, baked goodies, and festive surprises, beautifully packaged to share joy and celebrate the spirit of Eid with loved ones.\n', 2900.00, 'sweet', 'http://localhost:4000/uploads/1779822742481-196252860.jpg', 26, 1, 0.00, 0, '2026-05-27 00:43:17'),
('prod_sri_1_1', 'user_baker_1', 'Malu Paan (Fish Bun)', 'Soft triangular bun filled with a spicy, savory fish and potato curry.', 90.00, 'sweet', 'http://localhost:4000/uploads/1779818853348-121594338.jfif', 50, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_1_2', 'user_baker_1', 'Kimbula Banis', 'Iconic Sri Lankan crocodile-shaped sweet bun sprinkled with sugar.', 80.00, 'sweet', 'http://localhost:4000/uploads/1779818910945-998179921.jfif', 50, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_1_4', 'user_baker_1', 'Mini pizzas', 'Bite-sized homemade pizzas topped with rich sauce, melted cheese, and flavorful toppings, baked fresh for a soft, cheesy, and satisfying snack.\n', 180.00, 'savory', 'http://localhost:4000/uploads/1779819556671-720657198.jfif', 50, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_1_7', 'user_baker_1', 'Gulabjaamun', 'A soft and syrup-soaked South Asian dessert made from deep-fried milk dough balls, flavored with cardamom and served warm for a rich, melt-in-the-mouth sweetness.\n', 30.00, 'sweet', 'http://localhost:4000/uploads/1779819339822-772498648.jfif', 50, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_2_1', 'user_baker_2', 'Malu Paan (Fish Bun)', 'Soft triangular bun filled with a spicy, savory fish and potato curry.', 70.00, 'sweet', 'http://localhost:4000/uploads/1779812220228-590383431.jpg', 41, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_2_2', 'user_baker_2', 'Kimbula Banis', 'Iconic Sri Lankan crocodile-shaped sweet bun sprinkled with sugar.', 60.00, 'sweet', 'http://localhost:4000/uploads/1779813550227-776351337.jfif', 40, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_2_3', 'user_baker_2', 'Sri Lankan Love Cake', 'Traditional rich cake made with semolina, cashews, honey, and spices.', 290.00, 'cakes', 'http://localhost:4000/uploads/1779818534980-951322199.jfif', 40, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_2_4', 'user_baker_2', 'Seeni Sambol Bun', 'Fluffy bun stuffed with sweet and spicy caramelized onion sambol.', 70.00, 'sweet', 'http://localhost:4000/uploads/1779813779167-764400973.webp', 40, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_2_5', 'user_baker_2', 'Butter Cake(1kg)', 'Classic Sri Lankan soft butter cake, perfect with a cup of Ceylon tea.', 800.00, 'cakes', 'http://localhost:4000/uploads/1779817805890-137846901.jfif', 40, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_2_6', 'user_baker_2', 'Tea Bun', 'Classic Sri Lankan sweet tea bun, perfectly baked with a golden crust.', 50.00, 'sweet', 'http://localhost:4000/uploads/1779817897301-818654586.jfif', 40, 1, 0.00, 0, '2026-05-26 21:04:31'),
('prod_sri_2_7', 'user_baker_2', 'Chocolate Biscuit Pudding', 'A beloved Sri Lankan dessert with layers of Marie biscuits and rich chocolate cream.', 350.00, 'seasonal', 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=600&q=80', 40, 1, 0.00, 0, '2026-05-26 21:04:31');

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` varchar(64) NOT NULL,
  `order_id` varchar(64) DEFAULT NULL,
  `product_id` varchar(64) NOT NULL,
  `customer_id` varchar(64) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `rating` tinyint(4) NOT NULL,
  `comment` text DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(64) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `role` enum('customer','baker','admin') NOT NULL DEFAULT 'customer',
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `avatar` varchar(1024) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `bakery_name` varchar(255) DEFAULT NULL,
  `specialties` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specialties`)),
  `rating` decimal(3,2) DEFAULT 0.00,
  `total_orders` int(11) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `address`, `avatar`, `is_active`, `bakery_name`, `specialties`, `rating`, `total_orders`, `is_approved`, `created_at`) VALUES
('user_1779647750175', 'ahadh', 'ahadh@gmail.com', '1234', 'customer', '1234567', 'dhhfkf', NULL, 1, NULL, NULL, 0.00, 0, NULL, '2026-05-25 00:05:50'),
('user_1779649804724_6f9ddhv', 'Test Customer', 'test.customer@example.com', 'test123', 'customer', '+94 77 999 0000', '456 Test Road, Colombo', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-05-25 00:40:04'),
('user_1779658990878_wvxk5h8', 'fathima', 'fathima@gmail.com', '123', 'customer', '1233333', 'kandy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-05-25 03:13:10'),
('user_1779700381343_rbevp2y', 'zainab', 'zainab@gmail.com', 'zai123', 'customer', '1223444', 'colombo', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-05-25 14:43:01'),
('user_1779702109399_atu3pwn', 'nifla', 'nifla@gmail.com', 'nif123', 'customer', '13254765879', 'narambala', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-05-25 15:11:49'),
('user_1779702567843_3stgi7f', 'Irfan', '5rosebaker87@gmail.com', '@123123', 'baker', '0776550369', NULL, NULL, 0, '5Rose', '[\"Bread roll\"]', 0.00, 0, 1, '2026-05-25 15:19:27'),
('user_1779705052403_f7tgpw6', 'mifrah', 'mifrah@gmail.com', '123', 'customer', '1213232', 'kandy', NULL, 1, NULL, NULL, NULL, NULL, NULL, '2026-05-25 16:00:52'),
('user_1779819984730_zgax008', 'Fathima Mifrah', 'mifrah05@gmail.com', '0527', 'baker', '2143254765', NULL, NULL, 1, 'Deen Cakery', '[\"Cakes\",\"deserts&buns\"]', 0.00, 0, 1, '2026-05-26 23:56:24'),
('user_admin_1', 'Admin User', 'admin@gmail.com', 'admin123', 'admin', '1234567890', 'Admin Office', NULL, 1, NULL, NULL, 0.00, 0, 1, '2026-05-24 23:32:21'),
('user_baker_1', 'Sarah the Baker', 'sarah@example.com', 'baker123', 'baker', '0987654321', '123 Sweet Street', NULL, 1, 'Sarahs Sweets', '[\"Cakes\",\"Cookies\"]', 0.00, 0, 1, '2026-05-24 23:32:21'),
('user_baker_2', 'John Dough', 'john@example.com', 'baker123', 'baker', '5551112233', '456 Savory Avenue', NULL, 1, 'The Dough House', '[\"Bread\",\"Pastries\"]', 0.00, 0, 1, '2026-05-24 23:32:21'),
('user_customer_1', 'Alice Customer', 'alice@example.com', 'customer123', 'customer', '5559998888', '789 Tasting Lane', NULL, 0, NULL, NULL, 0.00, 0, NULL, '2026-05-24 23:32:21'),
('user_customer_2', 'Bob Customer', 'bob@example.com', 'customer123', 'customer', '5557776666', '101 Buyer Blvd', NULL, 1, NULL, NULL, 0.00, 0, NULL, '2026-05-24 23:32:21');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `delivery_settings`
--
ALTER TABLE `delivery_settings`
  ADD PRIMARY KEY (`baker_id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders_customer` (`customer_id`),
  ADD KEY `fk_orders_baker` (`baker_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_order_items_order` (`order_id`),
  ADD KEY `fk_order_items_product` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_products_baker` (`baker_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_reviews_order` (`order_id`),
  ADD KEY `fk_reviews_product` (`product_id`),
  ADD KEY `fk_reviews_customer` (`customer_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Constraints for dumped tables
--

--
-- Constraints for table `delivery_settings`
--
ALTER TABLE `delivery_settings`
  ADD CONSTRAINT `fk_delivery_baker` FOREIGN KEY (`baker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_baker` FOREIGN KEY (`baker_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_orders_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_order_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_baker` FOREIGN KEY (`baker_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_customer` FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reviews_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
