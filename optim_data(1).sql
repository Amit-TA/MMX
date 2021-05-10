-- phpMyAdmin SQL Dump
-- version 4.7.4
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 20, 2018 at 09:07 AM
-- Server version: 10.1.28-MariaDB
-- PHP Version: 7.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `cbc`
--

-- --------------------------------------------------------

--
-- Table structure for table `optim_data`
--

CREATE TABLE `optim_data` (
  `TotalSpend` float(20,2) NOT NULL,
  `DM` float(20,2) DEFAULT NULL,
  `Digital` float(20,2) DEFAULT NULL,
  `Email` float(20,2) DEFAULT NULL,
  `Ext_Email` float(20,2) DEFAULT NULL,
  `MAGAZINE` float(20,2) DEFAULT NULL,
  `OOH` float(20,2) DEFAULT NULL,
  `PR` float(20,2) DEFAULT NULL,
  `Paid_Search` float(20,2) DEFAULT NULL,
  `Print` float(20,2) DEFAULT NULL,
  `RADIO` float(20,2) DEFAULT NULL,
  `TRADE_COOP` float(20,2) DEFAULT NULL,
  `TRADE_DM` float(20,2) DEFAULT NULL,
  `TV` float(20,2) DEFAULT NULL,
  `base_year` float(20,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `optim_data`
--

INSERT INTO `optim_data` (`TotalSpend`, `DM`, `Digital`, `Email`, `Ext_Email`, `MAGAZINE`, `OOH`, `PR`, `Paid_Search`, `Print`, `RADIO`, `TRADE_COOP`, `TRADE_DM`, `TV`, `base_year`) VALUES
(5.00, -0.10, 0.04, 0.20, 0.10, 0.10, 0.00, 0.10, 0.10, -0.10, 0.20, 0.10, -0.10, 0.10, 2016.00),
(10.00, 0.08, 0.10, 0.20, 0.10, 0.10, 0.00, 0.10, 0.10, 0.10, 0.20, 0.10, 0.10, 0.10, 2016.00);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `optim_data`
--
ALTER TABLE `optim_data`
  ADD PRIMARY KEY (`TotalSpend`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
