-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 25, 2020 at 10:30 AM
-- Server version: 10.1.36-MariaDB
-- PHP Version: 5.6.38

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `proyek_soa`
--
CREATE DATABASE IF NOT EXISTS `proyek_soa` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `proyek_soa`;

-- --------------------------------------------------------

--
-- Table structure for table `history_buy`
--

DROP TABLE IF EXISTS `history_buy`;
CREATE TABLE `history_buy` (
  `id` int(11) NOT NULL,
  `id_user` int(10) NOT NULL,
  `id_drink` int(10) NOT NULL,
  `status` int(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `history_buy`
--

INSERT INTO `history_buy` (`id`, `id_user`, `id_drink`, `status`) VALUES
(1, 2, 1, 0),
(2, 2, 1, 0),
(3, 2, 1, 0),
(4, 2, 1, 0),
(5, 2, 2, 0);

-- --------------------------------------------------------

--
-- Table structure for table `history_search`
--

DROP TABLE IF EXISTS `history_search`;
CREATE TABLE `history_search` (
  `username` varchar(255) NOT NULL,
  `search` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `history_search`
--

INSERT INTO `history_search` (`username`, `search`) VALUES
('test', 'margaritas'),
('test', 'margaritas'),
('test', 'margaritas'),
('test', 'margarita'),
('test', 'margarita');

-- --------------------------------------------------------

--
-- Table structure for table `minuman`
--

DROP TABLE IF EXISTS `minuman`;
CREATE TABLE `minuman` (
  `id_drink` int(11) NOT NULL,
  `drink_name` varchar(20) NOT NULL,
  `drink_category` varchar(20) NOT NULL,
  `drink_alcoholic` varchar(20) NOT NULL,
  `drink_glass` varchar(20) NOT NULL,
  `drink_price` int(20) NOT NULL,
  `ori_id` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `minuman`
--

INSERT INTO `minuman` (`id_drink`, `drink_name`, `drink_category`, `drink_alcoholic`, `drink_glass`, `drink_price`, `ori_id`) VALUES
(1, 'Margarita', 'Ordinary Drink', 'Alcoholic', 'Cocktail glass', 140000, 11007),
(2, 'Blue Margarita', 'Ordinary Drink', 'Alcoholic', 'Cocktail glass', 110000, 11118);

-- --------------------------------------------------------

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id_user` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `wallet` int(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `user`
--

INSERT INTO `user` (`id_user`, `username`, `password`, `status`, `wallet`) VALUES
(1, 'test', '124', 2, 0),
(2, 'test1', '123', 0, 1470000);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `history_buy`
--
ALTER TABLE `history_buy`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `minuman`
--
ALTER TABLE `minuman`
  ADD PRIMARY KEY (`id_drink`);

--
-- Indexes for table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id_user`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `history_buy`
--
ALTER TABLE `history_buy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `minuman`
--
ALTER TABLE `minuman`
  MODIFY `id_drink` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `user`
--
ALTER TABLE `user`
  MODIFY `id_user` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
