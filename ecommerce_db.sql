-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 30, 2026 at 08:54 AM
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
-- Database: `ecommerce_db`
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
(23, 'string', 'string', 'string', '$2y$10$acb074TZlIBXs.cXlUXdV.53ne4P8jcliodVT6T50H1BiZRKIAh3W', 'Admin', 'Archived', NULL),
(75, 'John', 'Doe', 'jhon.doe@example.com', '$2b$12$ILXIEO8S82lfj.nn.8DhT.z6NOprf8BjKx.DNTCMSwIS6batQaf2a', 'Regular', 'Active', NULL);

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

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `CART_ITEM_ID` int(11) NOT NULL,
  `USER_ID` int(11) NOT NULL,
  `ITEM_ID` int(11) NOT NULL,
  `QUANTITY` int(11) NOT NULL DEFAULT 1,
  `CREATED_AT` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`CART_ITEM_ID`, `USER_ID`, `ITEM_ID`, `QUANTITY`, `CREATED_AT`) VALUES
(29, 75, 70, 4, '2026-10-25 08:40:55');

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
  `ITEM_IMAGE` varchar(255) DEFAULT 'default.jpg',
  `ITEM_CATEGORY` varchar(100) DEFAULT 'Uncategorized'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `items`
--

INSERT INTO `items` (`ITEM_ID`, `ITEM_NAME`, `ITEM_DESCRIPTION`, `ITEM_STATUS`, `ADDED_BY`, `ITEM_PRICE`, `ITEM_IMAGE`, `ITEM_CATEGORY`) VALUES
(65, 'Wireless Headphones', 'Noise-cancelling over-ear headphones with 30-hour battery life.', 'Pending', 23, 2500.00, 'default.png', 'Electronics'),
(66, 'Mechanical Keyboard', 'sample', 'Approved', 23, 2000.00, 'default.png', 'Accessories'),
(67, 'Smart Watch Pro', 'Waterproof fitness tracker with heart rate monitor.', 'Approved', 23, 3200.00, 'default.png', 'Accessories'),
(68, 'Portable Power Bank', '20,000mAh fast-charging portable battery pack.', 'Approved', 23, 1200.00, 'default.png', 'Accessories'),
(69, 'Bluetooth Speaker', 'Compact waterproof speaker with deep bass.', 'Approved', 23, 950.00, 'default.png', 'Electronics'),
(70, 'Gaming Mouse', '7200 DPI ergonomic gaming mouse with programmable buttons.', 'Approved', 23, 750.00, 'default.png', 'Accessories'),
(71, 'USB-C Hub', '7-in-1 adapter with HDMI, USB 3.0, and SD card slot.', 'Approved', 23, 1100.00, 'default.png', 'Accessories'),
(72, 'Electric Kettle', '1.7L stainless steel rapid-boil electric kettle.', 'Approved', 23, 890.00, 'default.png', 'Accessories'),
(73, 'Laptop Stand', 'Adjustable aluminum cooling stand for laptops.', 'Approved', 23, 550.00, 'default.png', 'Electronics'),
(74, 'Desk Lamp', 'LED desk lamp with wireless charging base.', 'Approved', 23, 1350.00, 'default.png', 'Accessories'),
(75, 'Wireless Mouse', 'Silent 2.4GHz wireless mouse for office use.', 'Approved', 23, 400.00, 'default.png', 'Accessories'),
(76, 'External SSD', '500GB portable solid state drive with high speed.', 'Approved', 23, 4500.00, 'default.png', 'Accessories'),
(77, 'Webcam 1080p', 'Full HD webcam with built-in microphone for streaming.', 'Approved', 23, 1600.00, 'default.png', 'Accessories'),
(78, 'Coffee Maker', 'Single-serve drip coffee machine with reusable filter.', 'Approved', 23, 2100.00, 'default.png', 'Accessories'),
(79, 'Yoga Mat', 'Eco-friendly non-slip exercise mat (6mm thickness).', 'Approved', 23, 650.00, 'default.png', 'Accessories'),
(80, 'Air Purifier', 'HEPA filter air cleaner for home and office.', 'Approved', 23, 5200.00, 'default.png', 'Accessories'),
(81, 'Microphone Kit', 'Condenser microphone with boom arm for podcasting.', 'Approved', 23, 2800.00, 'default.png', 'Electronics'),
(82, 'Smart Light Bulb', 'Wi-Fi enabled RGB LED bulb compatible with Alexa.', 'Approved', 23, 450.00, 'default.png', 'Accessories'),
(83, 'Phone Tripod', 'Extendable tripod with remote shutter for smartphones.', 'Approved', 23, 350.00, 'default.png', 'Electronics'),
(84, 'Monitor Mount', 'Single arm gas spring monitor desk mount.', 'Approved', 23, 1900.00, 'default.png', 'Accessories'),
(85, 'Gaming Headset', 'Surround sound headset with noise-canceling mic.', 'Approved', 23, 1800.00, 'default.png', 'Electronics'),
(86, 'Drawing Tablet', 'Graphic tablet with battery-free stylus and hotkeys.', 'Approved', 23, 3500.00, 'default.png', 'Electronics'),
(87, 'Action Camera', '4K waterproof sports camera with stabilization.', 'Approved', 23, 4200.00, 'default.png', 'Accessories'),
(88, 'Mini Projector', 'Portable 1080p supported home theater projector.', 'Approved', 23, 6500.00, 'default.png', 'Accessories'),
(89, 'Digital Scale', 'High-precision smart body fat composition scale.', 'Approved', 23, 1100.00, 'default.png', 'Accessories'),
(90, 'Fitness Band', 'Ultra-light tracker with sleep and step monitoring.', 'Approved', 23, 850.00, 'default.png', 'Accessories'),
(91, 'Vertical Mouse', 'Ergonomic vertical mouse to reduce wrist strain.', 'Approved', 23, 900.00, 'default.png', 'Accessories'),
(92, 'Ring Light', '10-inch LED ring light with tripod stand for vlogs.', 'Approved', 23, 1200.00, 'default.png', 'Accessories'),
(93, 'E-Reader Case', 'Premium leather smart-shell cover for e-readers.', 'Approved', 23, 500.00, 'default.png', 'Accessories'),
(94, 'Capture Card', 'HDMI to USB 3.0 video capture for live streaming.', 'Approved', 23, 2400.00, 'default.png', 'Accessories'),
(95, 'Wall Charger', '65W GaN fast charger with dual USB-C ports.', 'Approved', 23, 1500.00, 'default.png', 'Accessories'),
(96, 'Wi-Fi Extender', 'Dual-band range booster for home network.', 'Approved', 23, 1750.00, 'default.png', 'Accessories'),
(97, 'Electric Toothbrush', 'Sonic vibrating toothbrush with 5 cleaning modes.', 'Approved', 23, 2100.00, 'default.png', 'Accessories'),
(98, 'Massager Gun', 'Handheld percussion massager for muscle relief.', 'Approved', 23, 3300.00, 'default.png', 'Accessories'),
(99, 'Bluetooth Adapter', 'USB receiver for wireless PC connectivity.', 'Approved', 23, 450.00, 'default.png', 'Accessories'),
(100, 'Privacy Filter', 'Anti-glare screen protector for 15.6 inch laptops.', 'Approved', 23, 700.00, 'default.png', 'Accessories'),
(101, 'Cable Organizer', 'Magnetic silicone cable management clips.', 'Approved', 23, 300.00, 'default.png', 'Accessories'),
(102, 'Gaming Chair Mat', 'Non-slip floor protector for rolling chairs.', 'Approved', 23, 1150.00, 'default.png', 'Accessories'),
(103, 'Rice Cooker', '5L multi-functional non-stick rice cooker.', 'Approved', 23, 2600.00, 'default.png', 'Accessories'),
(104, 'Smart Plug', 'Voice-controlled outlet with energy monitoring.', 'Approved', 23, 600.00, 'default.png', 'Accessories'),
(105, 'Hard Drive Case', 'Shockproof carrying bag for portable hard drives.', 'Approved', 23, 350.00, 'default.png', 'Accessories'),
(106, 'Laptop Sleeve', 'Padded water-resistant laptop carrying case.', 'Approved', 23, 800.00, 'default.png', 'Electronics'),
(107, 'VR Headset', 'Standalone virtual reality headset with controllers.', 'Approved', 23, 18500.00, 'default.png', 'Electronics'),
(108, 'MicroSD Card', '128GB high-speed memory card for cameras.', 'Approved', 23, 950.00, 'default.png', 'Accessories'),
(109, 'Stylus Pen', 'Active stylus pen compatible with iPad/Tablets.', 'Approved', 23, 1400.00, 'default.png', 'Accessories'),
(110, 'Cooling Fan', 'Portable rechargeable neck fan for summer.', 'Approved', 23, 650.00, 'default.png', 'Accessories'),
(111, 'Backlit Mat', 'Large RGB gaming mouse pad with 10 light modes.', 'Approved', 23, 850.00, 'default.png', 'Accessories'),
(112, 'Travel Adapter', 'Universal all-in-one international plug adapter.', 'Approved', 23, 750.00, 'default.png', 'Accessories'),
(113, 'Bluetooth Car Kit', 'FM transmitter and hands-free calling adapter.', 'Approved', 23, 550.00, 'default.png', 'Accessories'),
(114, 'Night Light', 'Motion sensor LED night light for hallways.', 'Pending', 23, 250.00, 'default.png', 'Accessories');

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
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`CART_ITEM_ID`),
  ADD UNIQUE KEY `uq_user_item` (`USER_ID`,`ITEM_ID`),
  ADD KEY `ITEM_ID` (`ITEM_ID`);

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
  MODIFY `USER_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `activity_logs`
--
ALTER TABLE `activity_logs`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=182;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `CART_ITEM_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT for table `items`
--
ALTER TABLE `items`
  MODIFY `ITEM_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`USER_ID`) REFERENCES `accounts` (`USER_ID`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`ITEM_ID`) REFERENCES `items` (`ITEM_ID`) ON DELETE CASCADE;

--
-- Constraints for table `items`
--
ALTER TABLE `items`
  ADD CONSTRAINT `items_ibfk_1` FOREIGN KEY (`ADDED_BY`) REFERENCES `accounts` (`USER_ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
