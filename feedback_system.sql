-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 11, 2025 at 07:17 AM
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
-- Database: `feedback_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `feedback_responses`
--

CREATE TABLE `feedback_responses` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `answers` longtext NOT NULL,
  `suggestion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `feedback_responses`
--

INSERT INTO `feedback_responses` (`id`, `username`, `subject`, `answers`, `suggestion`, `created_at`) VALUES
(1, 'Madan007', 'Artificial Intelligence', '{\"q1\":\"excellent\",\"q2\":\"excellent\",\"q3\":\"excellent\",\"q4\":\"excellent\",\"q5\":\"excellent\",\"q6\":\"excellent\",\"q7\":\"excellent\",\"q8\":\"excellent\",\"q9\":\"excellent\",\"q10\":\"excellent\",\"q11\":\"excellent\",\"q12\":\"excellent\",\"q13\":\"excellent\",\"q14\":\"excellent\",\"q15\":\"excellent\"}', NULL, '2025-12-10 20:05:25');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `email`, `mobile`, `password_hash`, `role`, `created_at`) VALUES
(1, 'alice', 'alice@example.com', '9876543210', '$2y$10$Nh8YJltebeH2LRT0R8Ak3O/zXBFvrT1Ubaa3UMzG7vmgswNCCf3n6', 'student', '2025-12-10 19:57:05'),
(2, 'Madan007', 'madanvaidya007@gmail.com', '8767857372', '$2y$10$/06jtWakN7EGDR0ivPNWy.Mx1gjZ.sxyStUjvEj6Wz7DLWWxAofri', 'student', '2025-12-10 19:58:51'),
(3, 'mv', 'madan@gmail.com', '8767857370', '$2y$10$ISbTqY88LckR8Ts8gGDyWe4eH1o0UvtANNRMWTSjpnst/7FuHogXy', 'admin', '2025-12-10 20:10:00');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `feedback_responses`
--
ALTER TABLE `feedback_responses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_username` (`username`),
  ADD UNIQUE KEY `uniq_email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `feedback_responses`
--
ALTER TABLE `feedback_responses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
