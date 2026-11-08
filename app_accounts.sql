-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 09, 2026 at 12:34 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `app_accounts`
--

-- --------------------------------------------------------

--
-- Table structure for table `accounts`
--

CREATE TABLE `accounts` (
  `USER_ID` int(11) NOT NULL,
  `USER_FIRST_NAME` varchar(50) NOT NULL,
  `USER_LAST_NAME` varchar(50) NOT NULL,
  `USER_EMAIL` varchar(100) NOT NULL,
  `USER_PASSWORD` varchar(255) NOT NULL,
  `USER_ROLE` enum('Regular','Admin','Super Admin') NOT NULL DEFAULT 'Regular',
  `USER_STATUS` enum('Active','Archived') DEFAULT 'Active',
  `REMEMBER_TOKEN` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accounts`
--

INSERT INTO `accounts` (`USER_ID`, `USER_FIRST_NAME`, `USER_LAST_NAME`, `USER_EMAIL`, `USER_PASSWORD`, `USER_ROLE`, `USER_STATUS`, `REMEMBER_TOKEN`) VALUES
(22, 'regular', 'regular', 'regular@gmail.com', '$2y$10$7hxQQCT9zZlaajtvgWLr1eFbRKdcl4mqzJtVFu2YAwURwonWTLNXm', 'Regular', 'Active', NULL),
(23, 'admin', 'admin', 'admin@gmail.com', '$2y$10$acb074TZlIBXs.cXlUXdV.53ne4P8jcliodVT6T50H1BiZRKIAh3W', 'Admin', 'Archived', NULL),
(64, 'rap', 'aguirre', 'admin1@gmail.com', '$2y$10$T/elvo8D9Zv6dPIN7kU/Te4fgY0.8EF41UDfHE/3YGOxmYzo1GONO', 'Regular', 'Active', NULL),
(70, 'rap', 'rap', 'admin2@gmail.com', '$2y$10$kMJ5GLclZr8p/I.CQ3LYUeegqu5PO6zOPeu6hoyVFr4EOwk4cLmJO', 'Regular', 'Active', NULL),
(71, 'super', 'admin', 'superadmin@gmail.com', '$2y$10$WPWASGjbzKrwX6GO27EcRO7kSO0597/8wR2QOssudbDCgirGD4d7u', 'Super Admin', 'Active', NULL),
(72, 'Nazar', 'Mercedes', 'ivanmercedes@gmail.com', '$2y$10$GyBL/zMsFSrRWJgbojK6hOy8y3ghgtRWQW5./n6rIIXoT8MYkO3W2', 'Regular', 'Active', NULL),
(74, 'rap', 'rap', 'admin5@gmail.com', '$2y$10$SnBEAjluF5rZBc6TEAprKOE7GedrccptXmkhFOQaFVvit9WpLYKIa', 'Regular', 'Active', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `activity_logs`
--

CREATE TABLE `activity_logs` (
  `log_id` int(11) NOT NULL,
  `performer_id` int(11) NOT NULL,
  `action_type` varchar(50) DEFAULT NULL,
  `target_user_id` int(11) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `activity_logs`
--

INSERT INTO `activity_logs` (`log_id`, `performer_id`, `action_type`, `target_user_id`, `details`, `created_at`) VALUES
(177, 23, 'Item Update', NULL, 'Update Item #119. Changes: Price: \'0.00\' -> 100', '2026-05-06 06:50:10'),
(178, 23, 'Item Approved', NULL, 'Admin approved Item ID:119', '2026-05-06 06:52:05'),
(179, 23, 'Item Archived', NULL, 'Admin archive Item ID:114', '2026-05-06 06:52:26'),
(180, 23, 'Add User', NULL, 'Addedd regular user', '2026-05-06 06:59:01'),
(181, 71, 'Item Update', NULL, 'Update Item #66. Changes: Description: sample, Price: \'1850.00\' -> 2000', '2026-05-06 07:03:24');

-- --------------------------------------------------------

--
-- Table structure for table `items`
--

CREATE TABLE `items` (
  `ITEM_ID` int(11) NOT NULL,
  `ITEM_NAME` varchar(255) NOT NULL,
  `ITEM_DESCRIPTION` text DEFAULT NULL,
  `ITEM_STATUS` enum('Pending','Approved','Archived') DEFAULT 'Pending',
  `ADDED_BY` int(11) DEFAULT NULL,
  `ITEM_PRICE` decimal(10,2) DEFAULT 0.00,
  `ITEM_IMAGE` varchar(255) DEFAULT 'default.jpg'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`ITEM_ID`, `ITEM_NAME`, `ITEM_DESCRIPTION`, `ITEM_STATUS`, `ADDED_BY`, `ITEM_PRICE`, `ITEM_IMAGE`) VALUES
(65, 'Wireless Headphones', 'Noise-cancelling over-ear headphones with 30-hour battery life.', 'Pending', 23, 2500.00, 'default.png'),
(66, 'Mechanical Keyboard', 'sample', 'Approved', 23, 2000.00, 'default.png'),
(67, 'Smart Watch Pro', 'Waterproof fitness tracker with heart rate monitor.', 'Approved', 23, 3200.00, 'default.png'),
(68, 'Portable Power Bank', '20,000mAh fast-charging portable battery pack.', 'Approved', 23, 1200.00, 'default.png'),
(69, 'Bluetooth Speaker', 'Compact waterproof speaker with deep bass.', 'Approved', 23, 950.00, 'default.png'),
(70, 'Gaming Mouse', '7200 DPI ergonomic gaming mouse with programmable buttons.', 'Approved', 23, 750.00, 'default.png'),
(71, 'USB-C Hub', '7-in-1 adapter with HDMI, USB 3.0, and SD card slot.', 'Approved', 23, 1100.00, 'default.png'),
(72, 'Electric Kettle', '1.7L stainless steel rapid-boil electric kettle.', 'Approved', 23, 890.00, 'default.png'),
(73, 'Laptop Stand', 'Adjustable aluminum cooling stand for laptops.', 'Approved', 23, 550.00, 'default.png'),
(74, 'Desk Lamp', 'LED desk lamp with wireless charging base.', 'Approved', 23, 1350.00, 'default.png'),
(75, 'Wireless Mouse', 'Silent 2.4GHz wireless mouse for office use.', 'Approved', 23, 400.00, 'default.png'),
(76, 'External SSD', '500GB portable solid state drive with high speed.', 'Approved', 23, 4500.00, 'default.png'),
(77, 'Webcam 1080p', 'Full HD webcam with built-in microphone for streaming.', 'Approved', 23, 1600.00, 'default.png'),
(78, 'Coffee Maker', 'Single-serve drip coffee machine with reusable filter.', 'Approved', 23, 2100.00, 'default.png'),
(79, 'Yoga Mat', 'Eco-friendly non-slip exercise mat (6mm thickness).', 'Approved', 23, 650.00, 'default.png'),
(80, 'Air Purifier', 'HEPA filter air cleaner for home and office.', 'Approved', 23, 5200.00, 'default.png'),
(81, 'Microphone Kit', 'Condenser microphone with boom arm for podcasting.', 'Approved', 23, 2800.00, 'default.png'),
(82, 'Smart Light Bulb', 'Wi-Fi enabled RGB LED bulb compatible with Alexa.', 'Approved', 23, 450.00, 'default.png'),
(83, 'Phone Tripod', 'Extendable tripod with remote shutter for smartphones.', 'Approved', 23, 350.00, 'default.png'),
(84, 'Monitor Mount', 'Single arm gas spring monitor desk mount.', 'Approved', 23, 1900.00, 'default.png'),
(85, 'Gaming Headset', 'Surround sound headset with noise-canceling mic.', 'Approved', 23, 1800.00, 'default.png'),
(86, 'Drawing Tablet', 'Graphic tablet with battery-free stylus and hotkeys.', 'Approved', 23, 3500.00, 'default.png'),
(87, 'Action Camera', '4K waterproof sports camera with stabilization.', 'Approved', 23, 4200.00, 'default.png'),
(88, 'Mini Projector', 'Portable 1080p supported home theater projector.', 'Approved', 23, 6500.00, 'default.png'),
(89, 'Digital Scale', 'High-precision smart body fat composition scale.', 'Approved', 23, 1100.00, 'default.png'),
(90, 'Fitness Band', 'Ultra-light tracker with sleep and step monitoring.', 'Approved', 23, 850.00, 'default.png'),
(91, 'Vertical Mouse', 'Ergonomic vertical mouse to reduce wrist strain.', 'Approved', 23, 900.00, 'default.png'),
(92, 'Ring Light', '10-inch LED ring light with tripod stand for vlogs.', 'Approved', 23, 1200.00, 'default.png'),
(93, 'E-Reader Case', 'Premium leather smart-shell cover for e-readers.', 'Approved', 23, 500.00, 'default.png'),
(94, 'Capture Card', 'HDMI to USB 3.0 video capture for live streaming.', 'Approved', 23, 2400.00, 'default.png'),
(95, 'Wall Charger', '65W GaN fast charger with dual USB-C ports.', 'Approved', 23, 1500.00, 'default.png'),
(96, 'Wi-Fi Extender', 'Dual-band range booster for home network.', 'Approved', 23, 1750.00, 'default.png'),
(97, 'Electric Toothbrush', 'Sonic vibrating toothbrush with 5 cleaning modes.', 'Approved', 23, 2100.00, 'default.png'),
(98, 'Massager Gun', 'Handheld percussion massager for muscle relief.', 'Approved', 23, 3300.00, 'default.png'),
(99, 'Bluetooth Adapter', 'USB receiver for wireless PC connectivity.', 'Approved', 23, 450.00, 'default.png'),
(100, 'Privacy Filter', 'Anti-glare screen protector for 15.6 inch laptops.', 'Approved', 23, 700.00, 'default.png'),
(101, 'Cable Organizer', 'Magnetic silicone cable management clips.', 'Approved', 23, 300.00, 'default.png'),
(102, 'Gaming Chair Mat', 'Non-slip floor protector for rolling chairs.', 'Approved', 23, 1150.00, 'default.png'),
(103, 'Rice Cooker', '5L multi-functional non-stick rice cooker.', 'Approved', 23, 2600.00, 'default.png'),
(104, 'Smart Plug', 'Voice-controlled outlet with energy monitoring.', 'Approved', 23, 600.00, 'default.png'),
(105, 'Hard Drive Case', 'Shockproof carrying bag for portable hard drives.', 'Approved', 23, 350.00, 'default.png'),
(106, 'Laptop Sleeve', 'Padded water-resistant laptop carrying case.', 'Approved', 23, 800.00, 'default.png'),
(107, 'VR Headset', 'Standalone virtual reality headset with controllers.', 'Approved', 23, 18500.00, 'default.png'),
(108, 'MicroSD Card', '128GB high-speed memory card for cameras.', 'Approved', 23, 950.00, 'default.png'),
(109, 'Stylus Pen', 'Active stylus pen compatible with iPad/Tablets.', 'Approved', 23, 1400.00, 'default.png'),
(110, 'Cooling Fan', 'Portable rechargeable neck fan for summer.', 'Approved', 23, 650.00, 'default.png'),
(111, 'Backlit Mat', 'Large RGB gaming mouse pad with 10 light modes.', 'Approved', 23, 850.00, 'default.png'),
(112, 'Travel Adapter', 'Universal all-in-one international plug adapter.', 'Approved', 23, 750.00, 'default.png'),
(113, 'Bluetooth Car Kit', 'FM transmitter and hands-free calling adapter.', 'Approved', 23, 550.00, 'default.png'),
(114, 'Night Light', 'Motion sensor LED night light for hallways.', 'Pending', 23, 250.00, 'default.png'),
(119, 'sample', 'sample', 'Approved', 22, 100.00, 'default.png'),
(120, 'adidas', '<script>alert(\'you are hacked\');</script>', 'Pending', 22, 0.00, 'default.png');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accounts`
--
ALTER TABLE `accounts`
  ADD PRIMARY KEY (`USER_ID`),
  ADD UNIQUE KEY `USER_EMAIL` (`USER_EMAIL`);

--
-- Indexes for table `activity_logs`
--
ALTER TABLE `activity_logs`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `items`
--
ALTER TABLE `items`
  ADD PRIMARY KEY (`ITEM_ID`),
  ADD KEY `added_by` (`ADDED_BY`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accounts`
--
ALTER TABLE `accounts`
  MODIFY `USER_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=182;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `ITEM_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`ADDED_BY`) REFERENCES `accounts` (`USER_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
