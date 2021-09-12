-- phpMyAdmin SQL Dump
-- version 5.1.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 12, 2021 at 08:38 PM
-- Server version: 10.6.4-MariaDB
-- PHP Version: 8.0.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `onsystem`
--

-- --------------------------------------------------------

--
-- Table structure for table `auth`
--

CREATE TABLE `auth` (
  `id` int(50) NOT NULL,
  `user` int(50) NOT NULL,
  `session` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `secret` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `verifycode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` int(11) NOT NULL COMMENT '0=pending,1=ready,2=blocked'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth`
--

INSERT INTO `auth` (`id`, `user`, `session`, `secret`, `verifycode`, `status`) VALUES
(1, 1, '98911', '98911', '1010', 1),
(2, 2, '98912', '98912', '1111', 1),
(3, 3, '98913', '98913', '1212', 1),
(4, 4, '98914', '98914', '1313', 1);

-- --------------------------------------------------------

--
-- Table structure for table `message`
--

CREATE TABLE `message` (
  `id` int(50) NOT NULL,
  `room` int(50) NOT NULL,
  `user` int(50) NOT NULL,
  `type` int(2) NOT NULL COMMENT '0=text|1=file|2=voice',
  `caption` varchar(5000) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filename` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `edited` int(11) NOT NULL DEFAULT 0 COMMENT '0=not edited,1=editted'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `message`
--

INSERT INTO `message` (`id`, `room`, `user`, `type`, `caption`, `filename`, `edited`) VALUES
(27, 1, 1, 0, 'سلام گروه یک از مکس!', NULL, 0),
(28, 2, 1, 0, 'سلام گروه دو از مکس', NULL, 0),
(29, 3, 1, 0, 'سلام حساب دو از مکس', NULL, 0),
(30, 4, 1, 0, 'سلام حساب سه از مکس', NULL, 0),
(31, 5, 1, 0, 'سلام ج. چرا جواب نمیدی؟', NULL, 0),
(32, 6, 3, 0, 'سلام ج. خوبی؟ از تستر', NULL, 0),
(41, 20, 4, 0, 'سلام', NULL, 0),
(42, 20, 4, 0, 'سلام', NULL, 0),
(43, 20, 4, 0, 'سلام', NULL, 0),
(44, 20, 4, 0, 'سلام', NULL, 0),
(45, 20, 1, 0, 'Hi!', NULL, 0),
(46, 20, 1, 0, 'Hi!', NULL, 0),
(47, 4, 1, 0, 'Hi!', NULL, 0),
(48, 20, 1, 0, 'Hi!', NULL, 0),
(49, 4, 1, 0, 'Hi!', NULL, 0),
(50, 20, 1, 0, 'سلام', NULL, 0),
(51, 20, 1, 0, 'Hi!', NULL, 0),
(52, 20, 4, 0, 'سلام', NULL, 0),
(53, 20, 4, 0, 'خوبی؟', NULL, 0),
(54, 20, 1, 0, 'مرسی عزیزم', NULL, 0),
(55, 20, 1, 0, 'Hi!', NULL, 0),
(56, 20, 4, 0, 'سلام اقای حمید خوبید؟', NULL, 0),
(57, 20, 1, 0, 'ممنون اقای ملکی', NULL, 0),
(58, 20, 1, 0, 'سلام خوبی', NULL, 0),
(59, 21, 1, 0, 'Hi!', NULL, 0),
(60, 20, 1, 0, 'سلام خوبی', NULL, 0),
(61, 20, 1, 0, 'چطوری', NULL, 0),
(62, 20, 1, 0, 'چکارا میکنی جمشید', NULL, 0),
(63, 20, 1, 0, 'سلام', NULL, 0),
(64, 20, 1, 0, 'خوبی', NULL, 0),
(65, 20, 1, 0, 'چطوری', NULL, 0),
(66, 20, 1, 0, 'چه خبر مجید', NULL, 0),
(67, 21, 4, 0, 'Hi', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `room`
--

CREATE TABLE `room` (
  `id` int(50) NOT NULL,
  `server` int(50) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isgroup` int(2) NOT NULL COMMENT '0=user,1=group'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room`
--

INSERT INTO `room` (`id`, `server`, `name`, `image`, `isgroup`) VALUES
(1, 1, 'Mathematics', '', 1),
(2, 1, 'Test Room', '', 1),
(3, 1, NULL, NULL, 0),
(4, 1, NULL, NULL, 0),
(5, 1, NULL, NULL, 0),
(6, 1, NULL, NULL, 0),
(7, 1, NULL, NULL, 0),
(20, 1, NULL, NULL, 0),
(21, 1, 'Kashan City', NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `room_member`
--

CREATE TABLE `room_member` (
  `id` int(50) NOT NULL,
  `room` int(50) NOT NULL,
  `user` int(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `room_member`
--

INSERT INTO `room_member` (`id`, `room`, `user`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 2, 1),
(5, 2, 2),
(6, 3, 1),
(7, 3, 2),
(8, 4, 3),
(9, 4, 1),
(10, 6, 3),
(11, 6, 2),
(22, 20, 4),
(23, 20, 1),
(25, 21, 4);

-- --------------------------------------------------------

--
-- Table structure for table `server`
--

CREATE TABLE `server` (
  `id` int(50) NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `server`
--

INSERT INTO `server` (`id`, `name`, `image`) VALUES
(1, 'University of Kashan', '');

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

CREATE TABLE `user` (
  `id` int(50) NOT NULL,
  `phonenumber` varchar(12) COLLATE utf8mb4_unicode_ci NOT NULL,
  `firstname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id`, `phonenumber`, `firstname`, `lastname`, `image`) VALUES
(1, '98911', 'Max', 'Base', ''),
(2, '98912', 'Javad', 'S', ''),
(3, '98933', 'Mr', 'Tester', ''),
(4, '98914', 'M.', 'Malekian', '');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `auth`
--
ALTER TABLE `auth`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `message`
--
ALTER TABLE `message`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `room_member`
--
ALTER TABLE `room_member`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `server`
--
ALTER TABLE `server`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth`
--
ALTER TABLE `auth`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `message`
--
ALTER TABLE `message`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=68;

--
-- AUTO_INCREMENT for table `room`
--
ALTER TABLE `room`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT for table `room_member`
--
ALTER TABLE `room_member`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `server`
--
ALTER TABLE `server`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(50) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
