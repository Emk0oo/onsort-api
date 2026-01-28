-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 28 jan. 2026 à 15:16
-- Version du serveur : 8.3.0
-- Version de PHP : 8.2.18

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `onsort`
--

-- --------------------------------------------------------

--
-- Structure de la table `activity`
--

DROP TABLE IF EXISTS `activity`;
CREATE TABLE IF NOT EXISTS `activity` (
  `idactivity` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `minor_forbidden` tinyint(1) NOT NULL,
  `address` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_range` int DEFAULT NULL,
  `idactivity_type` int DEFAULT NULL,
  PRIMARY KEY (`idactivity`),
  KEY `fk_activity_type` (`idactivity_type`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activity`
--

INSERT INTO `activity` (`idactivity`, `name`, `description`, `minor_forbidden`, `address`, `price_range`, `idactivity_type`) VALUES
(1, 'Bolwing Caen', 'Bowling sur piste intérieur, soirée blabla', 0, '2 rue de l\'avenue', 1, 1),
(2, 'Karting de Pont-L\'évêque', 'Karting & circuit automobile', 0, '1 impasse de la rue, 14700 Pt Leveque', 2, 2);

-- --------------------------------------------------------

--
-- Structure de la table `activity_feature`
--

DROP TABLE IF EXISTS `activity_feature`;
CREATE TABLE IF NOT EXISTS `activity_feature` (
  `idactivity` int NOT NULL,
  `idfeature` int NOT NULL,
  PRIMARY KEY (`idactivity`,`idfeature`),
  KEY `idfeature` (`idfeature`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activity_feature`
--

INSERT INTO `activity_feature` (`idactivity`, `idfeature`) VALUES
(1, 1),
(1, 2),
(2, 3),
(2, 4),
(2, 5);

-- --------------------------------------------------------

--
-- Structure de la table `activity_opening_hour`
--

DROP TABLE IF EXISTS `activity_opening_hour`;
CREATE TABLE IF NOT EXISTS `activity_opening_hour` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idactivity` int NOT NULL,
  `day_of_week` enum('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche') COLLATE utf8mb4_unicode_ci NOT NULL,
  `opening_morning` time DEFAULT NULL,
  `closing_morning` time DEFAULT NULL,
  `opening_afternoon` time DEFAULT NULL,
  `closing_afternoon` time DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idactivity` (`idactivity`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activity_opening_hour`
--

INSERT INTO `activity_opening_hour` (`id`, `idactivity`, `day_of_week`, `opening_morning`, `closing_morning`, `opening_afternoon`, `closing_afternoon`) VALUES
(1, 1, '', NULL, NULL, NULL, NULL),
(2, 1, '', NULL, NULL, NULL, NULL),
(3, 2, 'Lundi', '09:54:24', '12:54:24', '14:54:24', '18:54:24'),
(4, 2, 'Mercredi', '09:54:24', '12:54:24', '14:54:24', '18:54:24'),
(5, 2, 'Vendredi', '09:54:24', '12:54:24', '14:54:24', '18:54:24');

-- --------------------------------------------------------

--
-- Structure de la table `activity_picture`
--

DROP TABLE IF EXISTS `activity_picture`;
CREATE TABLE IF NOT EXISTS `activity_picture` (
  `idactivity` int NOT NULL,
  `idpicture` int NOT NULL,
  PRIMARY KEY (`idactivity`,`idpicture`),
  KEY `idpicture` (`idpicture`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activity_picture`
--

INSERT INTO `activity_picture` (`idactivity`, `idpicture`) VALUES
(1, 1),
(2, 2);

-- --------------------------------------------------------

--
-- Structure de la table `activity_type`
--

DROP TABLE IF EXISTS `activity_type`;
CREATE TABLE IF NOT EXISTS `activity_type` (
  `idactivity_type` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `icon` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idactivity_type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activity_type`
--

INSERT INTO `activity_type` (`idactivity_type`, `name`, `icon`) VALUES
(1, 'Bowling', 'chevron_right'),
(2, 'Karting', 'chevron_right');

-- --------------------------------------------------------

--
-- Structure de la table `company`
--

DROP TABLE IF EXISTS `company`;
CREATE TABLE IF NOT EXISTS `company` (
  `idcompany` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`idcompany`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `company`
--

INSERT INTO `company` (`idcompany`, `name`, `description`) VALUES
(1, 'Entreprise 1', 'Entreprise de type test');

-- --------------------------------------------------------

--
-- Structure de la table `company_activity`
--

DROP TABLE IF EXISTS `company_activity`;
CREATE TABLE IF NOT EXISTS `company_activity` (
  `idcompany` int NOT NULL,
  `idactivity` int NOT NULL,
  PRIMARY KEY (`idcompany`,`idactivity`),
  KEY `idactivity` (`idactivity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `company_picture`
--

DROP TABLE IF EXISTS `company_picture`;
CREATE TABLE IF NOT EXISTS `company_picture` (
  `idcompany` int NOT NULL,
  `idpicture` int NOT NULL,
  PRIMARY KEY (`idcompany`,`idpicture`),
  KEY `idpicture` (`idpicture`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `feature`
--

DROP TABLE IF EXISTS `feature`;
CREATE TABLE IF NOT EXISTS `feature` (
  `idfeature` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`idfeature`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `feature`
--

INSERT INTO `feature` (`idfeature`, `name`) VALUES
(1, '22 pistes de jeu'),
(2, 'Bar sur place'),
(3, 'Karting, 20 personnes, 10 tours'),
(4, 'Tour de circuit voiture sportive'),
(5, 'Stage de pilotage');

-- --------------------------------------------------------

--
-- Structure de la table `game`
--

DROP TABLE IF EXISTS `game`;
CREATE TABLE IF NOT EXISTS `game` (
  `idgame` int NOT NULL AUTO_INCREMENT,
  `idcreator` int NOT NULL,
  `invite_code` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` enum('waiting_for_launch','voting_dates','voting','finished') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting_for_launch',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `voting_started_at` datetime DEFAULT NULL COMMENT 'Date et heure du début du vote (passage en status voting)',
  `date_voting_started_at` datetime DEFAULT NULL COMMENT 'Timestamp du début du vote des dates',
  `winning_date` datetime DEFAULT NULL COMMENT 'La date gagnante du vote',
  PRIMARY KEY (`idgame`),
  UNIQUE KEY `invite_code` (`invite_code`),
  KEY `idcreator` (`idcreator`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game`
--

INSERT INTO `game` (`idgame`, `idcreator`, `invite_code`, `status`, `created_at`, `updated_at`, `voting_started_at`, `date_voting_started_at`, `winning_date`) VALUES
(1, 2, 'OAOYLDQ6TU', 'waiting_for_launch', '2025-11-05 11:34:16', '2025-11-05 11:34:16', NULL, NULL, NULL),
(2, 2, 'JC23OJXXOY', 'waiting_for_launch', '2025-11-05 14:52:32', '2025-11-05 14:52:32', NULL, NULL, NULL),
(3, 2, 'V4KHW8Z', 'waiting_for_launch', '2025-11-06 11:16:01', '2025-11-06 11:16:01', NULL, NULL, NULL),
(4, 2, 'IKMEOIYSK0', 'waiting_for_launch', '2025-11-06 11:24:06', '2025-11-06 11:24:06', NULL, NULL, NULL),
(5, 2, '6SXEFZB', 'waiting_for_launch', '2025-11-06 11:25:10', '2025-11-06 11:25:10', NULL, NULL, NULL),
(6, 2, '3AGNQ3', 'waiting_for_launch', '2025-11-06 11:25:19', '2025-11-06 11:25:19', NULL, NULL, NULL),
(7, 2, 'PIFJICF', 'waiting_for_launch', '2025-11-06 11:40:43', '2025-11-06 11:40:43', NULL, NULL, NULL),
(8, 2, 'TRZRCWX8', 'waiting_for_launch', '2025-11-06 11:43:34', '2025-11-06 11:43:34', NULL, NULL, NULL),
(10, 2, 'STCJ2JU4Y', 'finished', '2025-11-06 11:46:50', '2025-11-06 11:48:42', NULL, NULL, NULL),
(11, 2, '8FBBXL4OR', 'finished', '2025-11-06 11:48:54', '2025-11-06 11:58:26', NULL, NULL, NULL),
(12, 2, 'VWZ38JX', 'waiting_for_launch', '2025-11-06 11:51:52', '2025-11-06 11:51:52', NULL, NULL, NULL),
(13, 2, 'M7LCWQJ', 'waiting_for_launch', '2025-11-06 11:51:53', '2025-11-06 11:51:53', NULL, NULL, NULL),
(14, 2, 'DXTK0OX', 'waiting_for_launch', '2025-11-06 11:52:13', '2025-11-06 11:52:13', NULL, NULL, NULL),
(15, 2, 'CL3OWYWG0', 'voting', '2025-11-06 13:50:21', '2025-11-06 13:51:20', NULL, NULL, NULL),
(16, 2, 'YW3OZB', 'waiting_for_launch', '2025-11-06 13:51:09', '2025-11-06 13:51:09', NULL, NULL, NULL),
(17, 2, 'DRM06NKY3', 'waiting_for_launch', '2025-11-06 13:53:41', '2025-11-06 13:53:41', NULL, NULL, NULL),
(18, 2, '6B92EI7M71', 'waiting_for_launch', '2025-11-06 13:55:52', '2025-11-06 13:55:52', NULL, NULL, NULL),
(19, 2, 'OTVO9IBGRM', 'waiting_for_launch', '2025-11-06 13:56:00', '2025-11-06 13:56:00', NULL, NULL, NULL),
(20, 2, 'RJAP5MSRZJ', 'waiting_for_launch', '2025-11-06 13:56:26', '2025-11-06 13:56:26', NULL, NULL, NULL),
(21, 2, 'EE7P7OZ', 'waiting_for_launch', '2025-11-06 14:00:01', '2025-11-06 14:00:01', NULL, NULL, NULL),
(22, 2, 'R546X45', 'waiting_for_launch', '2025-11-06 14:20:23', '2025-11-06 14:20:23', NULL, NULL, NULL),
(23, 2, '9VONA5XHGA', 'waiting_for_launch', '2025-11-06 14:21:51', '2025-11-06 14:21:51', NULL, NULL, NULL),
(24, 2, 'V2RBQKGO', 'voting', '2025-11-06 14:43:32', '2025-11-06 14:44:44', '2025-11-06 14:44:44', NULL, NULL),
(25, 2, '9VHKTSMI7M', 'waiting_for_launch', '2025-11-06 14:46:08', '2025-11-06 14:46:08', NULL, NULL, NULL),
(26, 2, 'DNJ9FOCHA', 'waiting_for_launch', '2025-11-06 14:46:49', '2025-11-06 14:46:49', NULL, NULL, NULL),
(27, 2, 'CYTYZV6PG', 'waiting_for_launch', '2025-11-06 14:49:33', '2025-11-06 14:49:33', NULL, NULL, NULL),
(28, 2, 'HJ1SBWXZP', 'waiting_for_launch', '2025-11-06 14:52:04', '2025-11-06 14:52:04', NULL, NULL, NULL),
(29, 2, 'KT0G0WD', 'waiting_for_launch', '2025-11-06 14:52:58', '2025-11-06 14:52:58', NULL, NULL, NULL),
(30, 2, '48AOEZ', 'waiting_for_launch', '2025-11-06 14:57:57', '2025-11-06 14:57:57', NULL, NULL, NULL),
(31, 2, 'BIJC0M', 'voting', '2025-11-06 14:58:57', '2025-11-06 14:59:00', '2025-11-06 14:59:00', NULL, NULL),
(32, 2, 'LO30Z52RN0', 'voting', '2025-11-06 15:00:02', '2025-11-06 15:00:05', '2025-11-06 15:00:05', NULL, NULL),
(33, 2, 'EU25YTN', 'voting', '2025-11-06 15:00:49', '2025-11-06 15:00:52', '2025-11-06 15:00:52', NULL, NULL),
(34, 2, 'KK5SG0C13', 'voting', '2025-11-06 15:02:10', '2025-11-06 15:02:13', '2025-11-06 15:02:13', NULL, NULL),
(35, 2, 'QSG2UKGT', 'voting', '2025-11-06 15:03:00', '2025-11-06 15:03:03', '2025-11-06 15:03:03', NULL, NULL),
(36, 2, 'T6UV6AJRMQ', 'voting', '2025-11-06 15:04:27', '2025-11-06 15:04:30', '2025-11-06 15:04:30', NULL, NULL),
(37, 2, '4TFJR9P7', 'voting', '2025-11-06 15:12:41', '2025-11-06 15:12:44', '2025-11-06 15:12:44', NULL, NULL),
(38, 2, 'GNAYZ1H', 'finished', '2025-11-06 15:13:47', '2025-11-06 15:26:37', '2025-11-06 15:13:50', NULL, NULL),
(39, 2, 'YCXN46X', 'finished', '2025-11-06 15:28:44', '2025-11-06 15:36:32', '2025-11-06 15:28:51', NULL, NULL),
(40, 1, '47D8TNW', 'finished', '2025-11-06 15:30:33', '2025-11-06 15:32:24', '2025-11-06 15:31:54', NULL, NULL),
(41, 2, 'X88ZV1R', 'finished', '2025-11-06 15:53:31', '2025-11-06 15:55:43', '2025-11-06 15:55:22', NULL, NULL),
(42, 2, '0VICVJBZ', 'waiting_for_launch', '2026-01-28 11:22:40', '2026-01-28 11:22:40', NULL, NULL, NULL),
(43, 2, '42GL56YA', 'finished', '2026-01-28 12:00:38', '2026-01-28 12:02:16', '2026-01-28 12:02:13', NULL, NULL),
(44, 2, '6T6LPI', 'waiting_for_launch', '2026-01-28 13:01:37', '2026-01-28 13:01:37', NULL, NULL, NULL),
(45, 2, '9XRQDVOGC', 'waiting_for_launch', '2026-01-28 13:16:42', '2026-01-28 13:16:42', NULL, NULL, NULL),
(46, 2, '3NI463UQB8', 'waiting_for_launch', '2026-01-28 13:24:38', '2026-01-28 13:24:38', NULL, NULL, NULL),
(47, 2, '3QHNJ25R5', 'waiting_for_launch', '2026-01-28 13:25:25', '2026-01-28 13:25:25', NULL, NULL, NULL),
(48, 2, 'H6K5KO', 'waiting_for_launch', '2026-01-28 13:27:11', '2026-01-28 13:27:11', NULL, NULL, NULL),
(49, 2, 'W86QA75', 'waiting_for_launch', '2026-01-28 13:54:42', '2026-01-28 13:54:42', NULL, NULL, NULL),
(50, 2, '3KP8V0G3', 'voting_dates', '2026-01-28 14:13:59', '2026-01-28 14:14:58', NULL, '2026-01-28 14:14:58', NULL),
(51, 2, 'IITI9LB4R3', 'voting', '2026-01-28 14:16:06', '2026-01-28 14:16:16', '2026-01-28 14:16:16', '2026-01-28 14:16:08', '2026-02-06 00:00:00'),
(52, 2, 'M9H28V', 'voting', '2026-01-28 14:19:52', '2026-01-28 14:19:58', '2026-01-28 14:19:58', '2026-01-28 14:19:54', '2026-02-06 00:00:00'),
(53, 2, 'WU5N1WVF', 'voting', '2026-01-28 14:25:46', '2026-01-28 14:26:57', '2026-01-28 14:26:57', '2026-01-28 14:25:50', '2026-02-06 00:00:00'),
(54, 2, '7O3WY8BZR', 'voting', '2026-01-28 14:32:02', '2026-01-28 14:32:07', '2026-01-28 14:32:07', '2026-01-28 14:32:04', '2026-02-06 00:00:00'),
(55, 2, 'KMNAARWU', 'voting', '2026-01-28 14:32:54', '2026-01-28 14:32:58', '2026-01-28 14:32:58', '2026-01-28 14:32:55', '2026-02-06 00:00:00'),
(56, 2, 'C4BYEKF2S7', 'voting', '2026-01-28 14:37:12', '2026-01-28 14:37:20', '2026-01-28 14:37:20', '2026-01-28 14:37:15', '2026-01-29 00:00:00'),
(57, 2, 'X559P62C7', 'voting', '2026-01-28 14:41:23', '2026-01-28 14:41:27', '2026-01-28 14:41:27', '2026-01-28 14:41:25', '2026-01-29 00:00:00'),
(58, 2, 'FW41P29', 'finished', '2026-01-28 14:44:19', '2026-01-28 14:50:32', '2026-01-28 14:44:23', '2026-01-28 14:44:20', '2026-01-29 00:00:00'),
(59, 2, 'KX3DUY5B', 'finished', '2026-01-28 14:51:20', '2026-01-28 14:51:26', '2026-01-28 14:51:22', NULL, '2026-01-31 00:00:00'),
(60, 2, '5465ETCL', 'finished', '2026-01-28 14:52:46', '2026-01-28 14:53:00', '2026-01-28 14:52:50', NULL, '2026-01-28 00:00:00'),
(61, 2, 'RL5A7U1XL0', 'finished', '2026-01-28 15:01:01', '2026-01-28 15:01:04', '2026-01-28 15:01:02', NULL, '2026-01-31 00:00:00'),
(62, 2, 'IYYIM5WOUG', 'finished', '2026-01-28 15:03:21', '2026-01-28 15:03:24', '2026-01-28 15:03:23', NULL, '2026-01-30 00:00:00'),
(63, 2, 'RCWZ5M', 'finished', '2026-01-28 15:09:47', '2026-01-28 15:09:53', '2026-01-28 15:09:51', NULL, '2026-01-28 00:00:00'),
(64, 2, 'UXG7RFMBU', 'finished', '2026-01-28 15:13:37', '2026-01-28 15:13:47', '2026-01-28 15:13:44', NULL, '2026-01-28 00:00:00'),
(65, 2, 'AKLVT9XGV6', 'finished', '2026-01-28 15:14:19', '2026-01-28 15:14:23', '2026-01-28 15:14:21', NULL, '2026-01-29 00:00:00'),
(66, 2, 'QKHGHNSHQ', 'finished', '2026-01-28 15:31:47', '2026-01-28 15:31:54', '2026-01-28 15:31:49', NULL, '2026-01-29 00:00:00'),
(67, 2, 'B7XDP5FGW', 'finished', '2026-01-28 15:42:13', '2026-01-28 15:42:28', '2026-01-28 15:42:20', '2026-01-28 15:42:15', '2026-01-29 00:00:00'),
(68, 2, 'KI0PMGHJF8', 'finished', '2026-01-28 15:44:27', '2026-01-28 15:44:40', '2026-01-28 15:44:33', '2026-01-28 15:44:29', '2026-01-29 00:00:00'),
(69, 2, '8QFC78O', 'waiting_for_launch', '2026-01-28 15:50:19', '2026-01-28 15:50:19', NULL, NULL, NULL),
(70, 2, '4F2YYJD9K4', 'finished', '2026-01-28 15:50:47', '2026-01-28 15:51:03', '2026-01-28 15:50:55', '2026-01-28 15:50:52', '2026-01-29 00:00:00'),
(71, 2, 'KYP2C2IQL', 'waiting_for_launch', '2026-01-28 15:56:36', '2026-01-28 15:56:36', NULL, NULL, NULL),
(72, 2, 'MK7ZR41SX', 'finished', '2026-01-28 15:57:02', '2026-01-28 15:57:17', '2026-01-28 15:57:09', '2026-01-28 15:57:04', '2026-01-29 00:00:00'),
(73, 2, 'O63WPOPVTQ', 'finished', '2026-01-28 15:59:58', '2026-01-28 16:00:16', '2026-01-28 16:00:05', '2026-01-28 16:00:00', '2026-01-29 00:00:00'),
(74, 2, 'M9BLYJB2', 'finished', '2026-01-28 16:10:00', '2026-01-28 16:10:12', '2026-01-28 16:10:05', '2026-01-28 16:10:02', '2026-01-29 00:00:00'),
(75, 2, 'RTMJGZHT', 'finished', '2026-01-28 16:10:44', '2026-01-28 16:10:55', '2026-01-28 16:10:48', '2026-01-28 16:10:45', '2026-01-29 00:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `game_activity`
--

DROP TABLE IF EXISTS `game_activity`;
CREATE TABLE IF NOT EXISTS `game_activity` (
  `idgame` int NOT NULL,
  `idactivity` int NOT NULL,
  `added_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idgame`,`idactivity`),
  KEY `idactivity` (`idactivity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game_activity`
--

INSERT INTO `game_activity` (`idgame`, `idactivity`, `added_at`) VALUES
(7, 1, '2025-11-06 11:40:43'),
(8, 1, '2025-11-06 11:43:34'),
(10, 1, '2025-11-06 11:46:50'),
(11, 1, '2025-11-06 11:48:54'),
(14, 1, '2025-11-06 11:52:13'),
(15, 1, '2025-11-06 13:50:21'),
(16, 1, '2025-11-06 13:51:09'),
(17, 1, '2025-11-06 13:53:41'),
(18, 1, '2025-11-06 13:55:52'),
(19, 1, '2025-11-06 13:56:00'),
(20, 1, '2025-11-06 13:56:26'),
(21, 1, '2025-11-06 14:00:01'),
(22, 1, '2025-11-06 14:20:23'),
(23, 1, '2025-11-06 14:21:51'),
(24, 1, '2025-11-06 14:43:32'),
(25, 1, '2025-11-06 14:46:08'),
(26, 1, '2025-11-06 14:46:49'),
(27, 1, '2025-11-06 14:49:33'),
(28, 1, '2025-11-06 14:52:04'),
(29, 1, '2025-11-06 14:52:58'),
(30, 1, '2025-11-06 14:57:57'),
(31, 1, '2025-11-06 14:58:57'),
(32, 1, '2025-11-06 15:00:02'),
(33, 1, '2025-11-06 15:00:49'),
(34, 1, '2025-11-06 15:02:10'),
(35, 1, '2025-11-06 15:03:00'),
(36, 1, '2025-11-06 15:04:27'),
(37, 1, '2025-11-06 15:12:41'),
(38, 1, '2025-11-06 15:13:47'),
(39, 1, '2025-11-06 15:28:44'),
(40, 1, '2025-11-06 15:30:33'),
(41, 1, '2025-11-06 15:53:31'),
(42, 1, '2026-01-28 11:22:40'),
(42, 2, '2026-01-28 11:22:40'),
(43, 1, '2026-01-28 12:00:38'),
(44, 1, '2026-01-28 13:01:37'),
(44, 2, '2026-01-28 13:01:37'),
(45, 1, '2026-01-28 13:16:42'),
(45, 2, '2026-01-28 13:16:42'),
(46, 1, '2026-01-28 13:24:38'),
(46, 2, '2026-01-28 13:24:38'),
(47, 1, '2026-01-28 13:25:25'),
(47, 2, '2026-01-28 13:25:25'),
(48, 1, '2026-01-28 13:27:11'),
(48, 2, '2026-01-28 13:27:11'),
(49, 1, '2026-01-28 13:54:42'),
(49, 2, '2026-01-28 13:54:42'),
(50, 1, '2026-01-28 14:13:59'),
(50, 2, '2026-01-28 14:13:59'),
(51, 1, '2026-01-28 14:16:06'),
(51, 2, '2026-01-28 14:16:06'),
(52, 1, '2026-01-28 14:19:52'),
(52, 2, '2026-01-28 14:19:52'),
(53, 1, '2026-01-28 14:25:46'),
(53, 2, '2026-01-28 14:25:46'),
(54, 1, '2026-01-28 14:32:02'),
(54, 2, '2026-01-28 14:32:02'),
(55, 1, '2026-01-28 14:32:54'),
(55, 2, '2026-01-28 14:32:54'),
(56, 1, '2026-01-28 14:37:12'),
(56, 2, '2026-01-28 14:37:12'),
(57, 1, '2026-01-28 14:41:23'),
(57, 2, '2026-01-28 14:41:23'),
(58, 1, '2026-01-28 14:44:19'),
(58, 2, '2026-01-28 14:44:19'),
(59, 1, '2026-01-28 14:51:20'),
(59, 2, '2026-01-28 14:51:20'),
(60, 1, '2026-01-28 14:52:46'),
(60, 2, '2026-01-28 14:52:46'),
(61, 1, '2026-01-28 15:01:01'),
(61, 2, '2026-01-28 15:01:01'),
(62, 1, '2026-01-28 15:03:21'),
(62, 2, '2026-01-28 15:03:21'),
(63, 1, '2026-01-28 15:09:47'),
(63, 2, '2026-01-28 15:09:47'),
(64, 1, '2026-01-28 15:13:37'),
(65, 1, '2026-01-28 15:14:19'),
(66, 1, '2026-01-28 15:31:47'),
(66, 2, '2026-01-28 15:31:47'),
(67, 1, '2026-01-28 15:42:13'),
(68, 1, '2026-01-28 15:44:27'),
(69, 1, '2026-01-28 15:50:19'),
(70, 1, '2026-01-28 15:50:47'),
(71, 1, '2026-01-28 15:56:36'),
(72, 1, '2026-01-28 15:57:02'),
(73, 1, '2026-01-28 15:59:58'),
(74, 1, '2026-01-28 16:10:00'),
(75, 1, '2026-01-28 16:10:44');

-- --------------------------------------------------------

--
-- Structure de la table `game_activity_types`
--

DROP TABLE IF EXISTS `game_activity_types`;
CREATE TABLE IF NOT EXISTS `game_activity_types` (
  `idgame` int NOT NULL,
  `idactivity_type` int NOT NULL,
  PRIMARY KEY (`idgame`,`idactivity_type`),
  KEY `idactivity_type` (`idactivity_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game_activity_types`
--

INSERT INTO `game_activity_types` (`idgame`, `idactivity_type`) VALUES
(6, 1),
(7, 1),
(8, 1),
(10, 1),
(11, 1),
(14, 1),
(15, 1),
(16, 1),
(17, 1),
(18, 1),
(19, 1),
(20, 1),
(21, 1),
(22, 1),
(23, 1),
(24, 1),
(25, 1),
(26, 1),
(27, 1),
(28, 1),
(29, 1),
(30, 1),
(31, 1),
(32, 1),
(33, 1),
(34, 1),
(35, 1),
(36, 1),
(37, 1),
(38, 1),
(39, 1),
(40, 1),
(41, 1),
(42, 1),
(43, 1),
(44, 1),
(45, 1),
(46, 1),
(47, 1),
(48, 1),
(49, 1),
(50, 1),
(51, 1),
(52, 1),
(53, 1),
(54, 1),
(55, 1),
(56, 1),
(57, 1),
(58, 1),
(59, 1),
(60, 1),
(61, 1),
(62, 1),
(63, 1),
(64, 1),
(65, 1),
(66, 1),
(67, 1),
(68, 1),
(69, 1),
(70, 1),
(71, 1),
(72, 1),
(73, 1),
(74, 1),
(75, 1),
(42, 2),
(44, 2),
(45, 2),
(46, 2),
(47, 2),
(48, 2),
(49, 2),
(50, 2),
(51, 2),
(52, 2),
(53, 2),
(54, 2),
(55, 2),
(56, 2),
(57, 2),
(58, 2),
(59, 2),
(60, 2),
(61, 2),
(62, 2),
(63, 2),
(64, 2),
(66, 2);

-- --------------------------------------------------------

--
-- Structure de la table `game_dates`
--

DROP TABLE IF EXISTS `game_dates`;
CREATE TABLE IF NOT EXISTS `game_dates` (
  `idgamedate` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `date_option` datetime NOT NULL,
  PRIMARY KEY (`idgamedate`),
  KEY `idgame` (`idgame`)
) ENGINE=InnoDB AUTO_INCREMENT=129 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game_dates`
--

INSERT INTO `game_dates` (`idgamedate`, `idgame`, `date_option`) VALUES
(1, 7, '2025-12-15 14:00:00'),
(2, 7, '2025-12-16 18:00:00'),
(3, 8, '2025-12-15 14:00:00'),
(4, 8, '2025-12-16 18:00:00'),
(5, 10, '2025-12-15 14:00:00'),
(6, 10, '2025-12-16 18:00:00'),
(7, 11, '2025-12-15 14:00:00'),
(8, 11, '2025-12-16 18:00:00'),
(9, 14, '2025-12-15 14:00:00'),
(10, 14, '2025-12-16 18:00:00'),
(11, 15, '2025-12-15 14:00:00'),
(12, 15, '2025-12-16 18:00:00'),
(13, 16, '2025-11-06 00:00:00'),
(14, 17, '2025-11-06 00:00:00'),
(15, 18, '2025-11-06 00:00:00'),
(16, 19, '2025-11-06 00:00:00'),
(17, 20, '2025-11-06 00:00:00'),
(18, 21, '2025-11-06 00:00:00'),
(19, 22, '2025-11-06 00:00:00'),
(20, 23, '2025-12-15 14:00:00'),
(21, 23, '2025-12-16 18:00:00'),
(22, 24, '2025-11-06 00:00:00'),
(23, 25, '2025-11-06 00:00:00'),
(24, 26, '2025-11-06 00:00:00'),
(25, 27, '2025-11-06 00:00:00'),
(26, 28, '2025-11-06 00:00:00'),
(27, 29, '2025-11-06 00:00:00'),
(28, 30, '2025-11-06 00:00:00'),
(29, 31, '2025-11-06 00:00:00'),
(30, 32, '2025-11-06 00:00:00'),
(31, 33, '2025-11-06 00:00:00'),
(32, 34, '2025-11-06 00:00:00'),
(33, 35, '2025-11-06 00:00:00'),
(34, 36, '2025-11-06 00:00:00'),
(35, 37, '2025-11-06 00:00:00'),
(36, 38, '2025-11-06 00:00:00'),
(37, 39, '2025-11-06 00:00:00'),
(38, 40, '2025-12-15 14:00:00'),
(39, 40, '2025-12-16 18:00:00'),
(40, 41, '2025-11-06 00:00:00'),
(41, 42, '2026-02-04 00:00:00'),
(42, 42, '2026-02-06 00:00:00'),
(43, 42, '2026-02-13 00:00:00'),
(44, 42, '2026-02-18 00:00:00'),
(45, 43, '2026-02-05 00:00:00'),
(46, 43, '2026-02-06 00:00:00'),
(47, 43, '2026-02-13 00:00:00'),
(48, 43, '2026-02-18 00:00:00'),
(49, 44, '2026-02-12 00:00:00'),
(50, 44, '2026-02-05 00:00:00'),
(51, 44, '2026-02-20 00:00:00'),
(52, 45, '2026-02-12 00:00:00'),
(53, 45, '2026-02-05 00:00:00'),
(54, 45, '2026-02-20 00:00:00'),
(55, 46, '2026-02-12 00:00:00'),
(56, 46, '2026-02-05 00:00:00'),
(57, 46, '2026-02-20 00:00:00'),
(58, 47, '2026-02-12 00:00:00'),
(59, 47, '2026-02-05 00:00:00'),
(60, 47, '2026-02-20 00:00:00'),
(61, 48, '2026-02-06 00:00:00'),
(62, 48, '2026-02-13 00:00:00'),
(63, 48, '2026-02-20 00:00:00'),
(64, 49, '2026-02-06 00:00:00'),
(65, 49, '2026-02-13 00:00:00'),
(66, 49, '2026-02-20 00:00:00'),
(67, 50, '2026-02-06 00:00:00'),
(68, 50, '2026-02-13 00:00:00'),
(69, 50, '2026-02-20 00:00:00'),
(70, 51, '2026-02-06 00:00:00'),
(71, 51, '2026-02-13 00:00:00'),
(72, 51, '2026-02-20 00:00:00'),
(73, 52, '2026-02-06 00:00:00'),
(74, 52, '2026-02-13 00:00:00'),
(75, 52, '2026-02-20 00:00:00'),
(76, 53, '2026-02-06 00:00:00'),
(77, 53, '2026-02-13 00:00:00'),
(78, 53, '2026-02-20 00:00:00'),
(79, 54, '2026-02-06 00:00:00'),
(80, 54, '2026-02-13 00:00:00'),
(81, 54, '2026-02-20 00:00:00'),
(82, 55, '2026-02-06 00:00:00'),
(83, 55, '2026-02-13 00:00:00'),
(84, 55, '2026-02-20 00:00:00'),
(85, 56, '2026-01-29 00:00:00'),
(86, 56, '2026-01-30 00:00:00'),
(87, 56, '2026-01-31 00:00:00'),
(88, 57, '2026-01-29 00:00:00'),
(89, 57, '2026-01-30 00:00:00'),
(90, 57, '2026-01-31 00:00:00'),
(91, 58, '2026-01-29 00:00:00'),
(92, 58, '2026-01-30 00:00:00'),
(93, 58, '2026-01-31 00:00:00'),
(94, 59, '2026-01-31 00:00:00'),
(95, 60, '2026-01-28 00:00:00'),
(96, 61, '2026-01-31 00:00:00'),
(97, 62, '2026-01-30 00:00:00'),
(98, 63, '2026-01-28 00:00:00'),
(99, 64, '2026-01-28 00:00:00'),
(100, 65, '2026-01-29 00:00:00'),
(101, 66, '2026-01-29 00:00:00'),
(102, 67, '2026-01-29 00:00:00'),
(103, 67, '2026-01-30 00:00:00'),
(104, 67, '2026-01-31 00:00:00'),
(105, 68, '2026-01-29 00:00:00'),
(106, 68, '2026-01-30 00:00:00'),
(107, 68, '2026-01-31 00:00:00'),
(108, 69, '2026-01-29 00:00:00'),
(109, 69, '2026-01-30 00:00:00'),
(110, 69, '2026-01-31 00:00:00'),
(111, 70, '2026-01-29 00:00:00'),
(112, 70, '2026-01-30 00:00:00'),
(113, 70, '2026-01-31 00:00:00'),
(114, 71, '2026-01-29 00:00:00'),
(115, 71, '2026-01-30 00:00:00'),
(116, 71, '2026-01-31 00:00:00'),
(117, 72, '2026-01-29 00:00:00'),
(118, 72, '2026-01-30 00:00:00'),
(119, 72, '2026-01-31 00:00:00'),
(120, 73, '2026-01-29 00:00:00'),
(121, 73, '2026-01-30 00:00:00'),
(122, 73, '2026-01-31 00:00:00'),
(123, 74, '2026-01-29 00:00:00'),
(124, 74, '2026-01-30 00:00:00'),
(125, 74, '2026-01-31 00:00:00'),
(126, 75, '2026-01-29 00:00:00'),
(127, 75, '2026-01-30 00:00:00'),
(128, 75, '2026-01-31 00:00:00');

-- --------------------------------------------------------

--
-- Structure de la table `game_date_vote`
--

DROP TABLE IF EXISTS `game_date_vote`;
CREATE TABLE IF NOT EXISTS `game_date_vote` (
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `idgamedate` int NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=Oui, 0=Non',
  `voted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idgame`,`iduser`,`idgamedate`),
  KEY `idx_gdv_game` (`idgame`),
  KEY `idx_gdv_user` (`iduser`),
  KEY `idx_gdv_gamedate` (`idgamedate`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game_date_vote`
--

INSERT INTO `game_date_vote` (`idgame`, `iduser`, `idgamedate`, `vote`, `voted_at`) VALUES
(51, 2, 70, 1, '2026-01-28 14:16:14'),
(51, 2, 71, 0, '2026-01-28 14:16:15'),
(51, 2, 72, 1, '2026-01-28 14:16:16'),
(52, 2, 73, 1, '2026-01-28 14:19:56'),
(52, 2, 74, 0, '2026-01-28 14:19:57'),
(52, 2, 75, 1, '2026-01-28 14:19:58'),
(53, 2, 76, 1, '2026-01-28 14:26:55'),
(53, 2, 77, 0, '2026-01-28 14:26:56'),
(53, 2, 78, 1, '2026-01-28 14:26:57'),
(54, 2, 79, 1, '2026-01-28 14:32:05'),
(54, 2, 80, 0, '2026-01-28 14:32:06'),
(54, 2, 81, 1, '2026-01-28 14:32:07'),
(55, 2, 82, 1, '2026-01-28 14:32:57'),
(55, 2, 83, 0, '2026-01-28 14:32:57'),
(55, 2, 84, 1, '2026-01-28 14:32:58'),
(56, 2, 85, 1, '2026-01-28 14:37:18'),
(56, 2, 86, 0, '2026-01-28 14:37:19'),
(56, 2, 87, 1, '2026-01-28 14:37:20'),
(57, 2, 88, 1, '2026-01-28 14:41:26'),
(57, 2, 89, 0, '2026-01-28 14:41:27'),
(57, 2, 90, 1, '2026-01-28 14:41:27'),
(58, 2, 91, 1, '2026-01-28 14:44:22'),
(58, 2, 92, 0, '2026-01-28 14:44:23'),
(58, 2, 93, 1, '2026-01-28 14:44:23'),
(67, 2, 102, 1, '2026-01-28 15:42:18'),
(67, 2, 103, 0, '2026-01-28 15:42:19'),
(67, 2, 104, 0, '2026-01-28 15:42:20'),
(68, 2, 105, 1, '2026-01-28 15:44:31'),
(68, 2, 106, 0, '2026-01-28 15:44:32'),
(68, 2, 107, 1, '2026-01-28 15:44:33'),
(70, 2, 111, 1, '2026-01-28 15:50:54'),
(70, 2, 112, 0, '2026-01-28 15:50:55'),
(70, 2, 113, 1, '2026-01-28 15:50:55'),
(72, 2, 117, 1, '2026-01-28 15:57:07'),
(72, 2, 118, 0, '2026-01-28 15:57:08'),
(72, 2, 119, 1, '2026-01-28 15:57:09'),
(73, 2, 120, 1, '2026-01-28 16:00:02'),
(73, 2, 121, 0, '2026-01-28 16:00:03'),
(73, 2, 122, 1, '2026-01-28 16:00:05'),
(74, 2, 123, 1, '2026-01-28 16:10:03'),
(74, 2, 124, 0, '2026-01-28 16:10:04'),
(74, 2, 125, 1, '2026-01-28 16:10:05'),
(75, 2, 126, 1, '2026-01-28 16:10:46'),
(75, 2, 127, 0, '2026-01-28 16:10:48'),
(75, 2, 128, 1, '2026-01-28 16:10:48');

-- --------------------------------------------------------

--
-- Structure de la table `game_filters`
--

DROP TABLE IF EXISTS `game_filters`;
CREATE TABLE IF NOT EXISTS `game_filters` (
  `idfilter` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `allowed_prices` json DEFAULT NULL COMMENT 'Array des prix autorisés ex: [1,2,3]',
  PRIMARY KEY (`idfilter`),
  KEY `idgame` (`idgame`)
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game_filters`
--

INSERT INTO `game_filters` (`idfilter`, `idgame`, `location`, `allowed_prices`) VALUES
(1, 7, 'Caen', '[1]'),
(2, 8, 'Caen', '[1]'),
(3, 10, 'Caen', '[1]'),
(4, 11, 'Caen', '[1]'),
(5, 14, 'Caen', '[1]'),
(6, 15, 'Caen', '[1]'),
(7, 16, 'Caen', '[1]'),
(8, 17, 'Caen', '[1]'),
(9, 18, 'Caen', '[1]'),
(10, 19, 'Caen', '[1]'),
(11, 20, 'Caen', '[1]'),
(12, 21, 'Caen', '[1]'),
(13, 22, 'Caen', '[1]'),
(14, 23, 'Caen', '[1]'),
(15, 24, 'Caen', '[1]'),
(16, 25, 'Caen', '[1]'),
(17, 26, 'Caen', '[1]'),
(18, 27, 'Caen', '[1]'),
(19, 28, 'Caen', '[1]'),
(20, 29, 'Caen', '[1]'),
(21, 30, 'Caen', '[1]'),
(22, 31, 'Caen', '[1]'),
(23, 32, 'Caen', '[1]'),
(24, 33, 'Caen', '[1]'),
(25, 34, 'Caen', '[1]'),
(26, 35, 'Caen', '[1]'),
(27, 36, 'Caen', '[1]'),
(28, 37, 'Caen', '[1]'),
(29, 38, 'Caen', '[1]'),
(30, 39, 'Caen', '[1]'),
(31, 40, 'Caen', '[1]'),
(32, 41, 'Caen', '[1]'),
(33, 42, 'Caen', '[1, 2]'),
(34, 43, 'Caen', '[1]'),
(35, 44, 'Caen', '[1, 2]'),
(36, 45, 'Caen', '[1, 2]'),
(37, 46, 'Caen', '[1, 2]'),
(38, 47, 'Caen', '[1, 2]'),
(39, 48, 'Caen', '[1, 2]'),
(40, 49, 'Caen', '[1, 2]'),
(41, 50, 'Caen', '[1, 2]'),
(42, 51, 'Caen', '[1, 2]'),
(43, 52, 'Caen', '[1, 2]'),
(44, 53, 'Caen', '[1, 2]'),
(45, 54, 'Caen', '[1, 2]'),
(46, 55, 'Caen', '[1, 2]'),
(47, 56, 'Caen', '[1, 2]'),
(48, 57, 'Caen', '[1, 2]'),
(49, 58, 'Caen', '[1, 2]'),
(50, 59, 'Caen', '[1, 2]'),
(51, 60, 'Caen', '[1, 2]'),
(52, 61, 'Caen', '[1, 2]'),
(53, 62, 'Caen', '[1, 2]'),
(54, 63, 'Caen', '[1, 2]'),
(55, 64, 'Caen', '[1]'),
(56, 65, 'Caen', '[1]'),
(57, 66, 'Caen', '[1, 2]'),
(58, 67, 'Caen', '[1]'),
(59, 68, 'Caen', '[1]'),
(60, 69, 'Caen', '[1]'),
(61, 70, 'Caen', '[1]'),
(62, 71, 'Caen', '[1]'),
(63, 72, 'Caen', '[1]'),
(64, 73, 'Caen', '[1]'),
(65, 74, 'Caen', '[1]'),
(66, 75, 'Caen', '[1]');

-- --------------------------------------------------------

--
-- Structure de la table `game_user`
--

DROP TABLE IF EXISTS `game_user`;
CREATE TABLE IF NOT EXISTS `game_user` (
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `is_creator` tinyint(1) DEFAULT '0',
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idgame`,`iduser`),
  KEY `iduser` (`iduser`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game_user`
--

INSERT INTO `game_user` (`idgame`, `iduser`, `is_creator`, `joined_at`) VALUES
(1, 2, 1, '2025-11-05 11:34:16'),
(2, 2, 1, '2025-11-05 14:52:32'),
(3, 2, 1, '2025-11-06 11:16:01'),
(4, 2, 1, '2025-11-06 11:24:06'),
(5, 2, 1, '2025-11-06 11:25:10'),
(6, 2, 1, '2025-11-06 11:25:19'),
(7, 2, 1, '2025-11-06 11:40:43'),
(8, 2, 1, '2025-11-06 11:43:34'),
(10, 2, 1, '2025-11-06 11:46:50'),
(11, 2, 1, '2025-11-06 11:48:54'),
(12, 2, 1, '2025-11-06 11:51:52'),
(13, 2, 1, '2025-11-06 11:51:53'),
(14, 2, 1, '2025-11-06 11:52:13'),
(15, 2, 1, '2025-11-06 13:50:21'),
(15, 3, 0, '2025-11-06 13:50:52'),
(16, 2, 1, '2025-11-06 13:51:09'),
(17, 2, 1, '2025-11-06 13:53:41'),
(18, 2, 1, '2025-11-06 13:55:52'),
(19, 2, 1, '2025-11-06 13:56:00'),
(20, 2, 1, '2025-11-06 13:56:26'),
(21, 2, 1, '2025-11-06 14:00:01'),
(22, 2, 1, '2025-11-06 14:20:23'),
(23, 2, 1, '2025-11-06 14:21:51'),
(24, 2, 1, '2025-11-06 14:43:32'),
(25, 2, 1, '2025-11-06 14:46:08'),
(26, 2, 1, '2025-11-06 14:46:49'),
(27, 2, 1, '2025-11-06 14:49:33'),
(28, 2, 1, '2025-11-06 14:52:04'),
(29, 2, 1, '2025-11-06 14:52:58'),
(30, 2, 1, '2025-11-06 14:57:57'),
(31, 2, 1, '2025-11-06 14:58:57'),
(32, 2, 1, '2025-11-06 15:00:02'),
(33, 2, 1, '2025-11-06 15:00:49'),
(34, 2, 1, '2025-11-06 15:02:10'),
(35, 2, 1, '2025-11-06 15:03:00'),
(36, 2, 1, '2025-11-06 15:04:27'),
(37, 2, 1, '2025-11-06 15:12:41'),
(38, 2, 1, '2025-11-06 15:13:47'),
(39, 2, 1, '2025-11-06 15:28:44'),
(40, 1, 1, '2025-11-06 15:30:33'),
(40, 2, 0, '2025-11-06 15:30:46'),
(41, 1, 0, '2025-11-06 15:55:05'),
(41, 2, 1, '2025-11-06 15:53:31'),
(42, 2, 1, '2026-01-28 11:22:40'),
(43, 2, 1, '2026-01-28 12:00:38'),
(44, 2, 1, '2026-01-28 13:01:37'),
(45, 2, 1, '2026-01-28 13:16:42'),
(46, 2, 1, '2026-01-28 13:24:38'),
(47, 2, 1, '2026-01-28 13:25:25'),
(48, 2, 1, '2026-01-28 13:27:11'),
(49, 2, 1, '2026-01-28 13:54:42'),
(50, 2, 1, '2026-01-28 14:13:59'),
(51, 2, 1, '2026-01-28 14:16:06'),
(52, 2, 1, '2026-01-28 14:19:52'),
(53, 2, 1, '2026-01-28 14:25:46'),
(54, 2, 1, '2026-01-28 14:32:02'),
(55, 2, 1, '2026-01-28 14:32:54'),
(56, 2, 1, '2026-01-28 14:37:12'),
(57, 2, 1, '2026-01-28 14:41:23'),
(58, 2, 1, '2026-01-28 14:44:19'),
(59, 2, 1, '2026-01-28 14:51:20'),
(60, 2, 1, '2026-01-28 14:52:46'),
(61, 2, 1, '2026-01-28 15:01:01'),
(62, 2, 1, '2026-01-28 15:03:21'),
(63, 2, 1, '2026-01-28 15:09:47'),
(64, 2, 1, '2026-01-28 15:13:37'),
(65, 2, 1, '2026-01-28 15:14:19'),
(66, 2, 1, '2026-01-28 15:31:47'),
(67, 2, 1, '2026-01-28 15:42:13'),
(68, 2, 1, '2026-01-28 15:44:27'),
(69, 2, 1, '2026-01-28 15:50:19'),
(70, 2, 1, '2026-01-28 15:50:47'),
(71, 2, 1, '2026-01-28 15:56:36'),
(72, 2, 1, '2026-01-28 15:57:02'),
(73, 2, 1, '2026-01-28 15:59:58'),
(74, 2, 1, '2026-01-28 16:10:00'),
(75, 2, 1, '2026-01-28 16:10:44');

-- --------------------------------------------------------

--
-- Structure de la table `game_vote`
--

DROP TABLE IF EXISTS `game_vote`;
CREATE TABLE IF NOT EXISTS `game_vote` (
  `idvote` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `idactivity` int NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=Oui (swipe droite), 0=Non (swipe gauche)',
  `voted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idvote`),
  UNIQUE KEY `unique_vote` (`idgame`,`iduser`,`idactivity`),
  KEY `idgame` (`idgame`),
  KEY `iduser` (`iduser`),
  KEY `idactivity` (`idactivity`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game_vote`
--

INSERT INTO `game_vote` (`idvote`, `idgame`, `iduser`, `idactivity`, `vote`, `voted_at`) VALUES
(1, 11, 2, 1, 1, '2025-11-06 11:57:05'),
(2, 15, 3, 1, 1, '2025-11-06 13:51:51'),
(4, 15, 2, 1, 1, '2025-11-06 13:52:40'),
(5, 38, 2, 1, 1, '2025-11-06 15:26:37'),
(6, 40, 2, 1, 0, '2025-11-06 15:32:16'),
(7, 40, 1, 1, 1, '2025-11-06 15:32:24'),
(8, 39, 2, 1, 1, '2025-11-06 15:36:32'),
(9, 41, 2, 1, 1, '2025-11-06 15:55:28'),
(10, 41, 1, 1, 0, '2025-11-06 15:55:43'),
(11, 43, 2, 1, 1, '2026-01-28 12:02:16'),
(12, 58, 2, 1, 1, '2026-01-28 14:50:32'),
(13, 59, 2, 1, 0, '2026-01-28 14:51:26'),
(14, 60, 2, 1, 1, '2026-01-28 14:53:00'),
(15, 61, 2, 1, 1, '2026-01-28 15:01:04'),
(16, 62, 2, 1, 0, '2026-01-28 15:03:24'),
(17, 63, 2, 1, 0, '2026-01-28 15:09:53'),
(18, 64, 2, 1, 0, '2026-01-28 15:13:47'),
(19, 65, 2, 1, 1, '2026-01-28 15:14:23'),
(20, 66, 2, 1, 1, '2026-01-28 15:31:54'),
(21, 67, 2, 1, 1, '2026-01-28 15:42:28'),
(22, 68, 2, 1, 1, '2026-01-28 15:44:40'),
(23, 70, 2, 1, 1, '2026-01-28 15:51:03'),
(24, 72, 2, 1, 1, '2026-01-28 15:57:17'),
(25, 73, 2, 1, 1, '2026-01-28 16:00:16'),
(26, 74, 2, 1, 1, '2026-01-28 16:10:12'),
(27, 75, 2, 1, 1, '2026-01-28 16:10:55');

-- --------------------------------------------------------

--
-- Structure de la table `picture`
--

DROP TABLE IF EXISTS `picture`;
CREATE TABLE IF NOT EXISTS `picture` (
  `idpicture` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idpicture`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `picture`
--

INSERT INTO `picture` (`idpicture`, `url`, `alt`) VALUES
(1, 'uploads\\image-1758206044355-422057553.jpg', 'string'),
(2, 'uploads\\image-1760522752483-175141464.png', 'Qr');

-- --------------------------------------------------------

--
-- Structure de la table `role`
--

DROP TABLE IF EXISTS `role`;
CREATE TABLE IF NOT EXISTS `role` (
  `idrole` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`idrole`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `role`
--

INSERT INTO `role` (`idrole`, `name`) VALUES
(-1, 'Admin'),
(1, 'User'),
(2, 'User_company');

-- --------------------------------------------------------

--
-- Structure de la table `session`
--

DROP TABLE IF EXISTS `session`;
CREATE TABLE IF NOT EXISTS `session` (
  `idsession` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  PRIMARY KEY (`idsession`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `session_activity`
--

DROP TABLE IF EXISTS `session_activity`;
CREATE TABLE IF NOT EXISTS `session_activity` (
  `idsession` int NOT NULL,
  `idactivity` int NOT NULL,
  PRIMARY KEY (`idsession`,`idactivity`),
  KEY `idactivity` (`idactivity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

DROP TABLE IF EXISTS `user`;
CREATE TABLE IF NOT EXISTS `user` (
  `iduser` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `surname` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `username` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `is_minor` tinyint(1) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `idrole` int DEFAULT NULL,
  PRIMARY KEY (`iduser`),
  UNIQUE KEY `email` (`email`),
  KEY `fk_user_role` (`idrole`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`iduser`, `name`, `surname`, `email`, `username`, `password`, `date_of_birth`, `is_minor`, `is_active`, `idrole`) VALUES
(1, 'test', 'test', 'test', 'test', '$2b$10$hxpWRiXghgUzG8iH4HpXI.iGLP9H3qFFDKhxXAlw3W3miHtpKoL1q', '2025-10-15', 0, 1, NULL),
(2, 'Emir', 'Javor', 'admin', 'admin', '$2b$10$bd/.LbdzzWdr74XxuUhOQe6zL0GkFtQFQaQQD2hWd.YLvE7rtPGFy', '2002-05-20', 0, 1, 1),
(3, 'test', 'test', 'test@example.com', 'test', '$2b$10$hPrnRTybd/XLnae09u5XH.9O03W8fjn4yGd8A/HYFPb2T/EyuxnhG', '2025-11-06', 1, 1, 1);

-- --------------------------------------------------------

--
-- Structure de la table `user_company`
--

DROP TABLE IF EXISTS `user_company`;
CREATE TABLE IF NOT EXISTS `user_company` (
  `iduser` int NOT NULL,
  `idcompany` int NOT NULL,
  PRIMARY KEY (`iduser`,`idcompany`),
  KEY `idcompany` (`idcompany`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `user_review_activity`
--

DROP TABLE IF EXISTS `user_review_activity`;
CREATE TABLE IF NOT EXISTS `user_review_activity` (
  `idreview` int NOT NULL AUTO_INCREMENT,
  `idactivity` int NOT NULL,
  `rating` int DEFAULT NULL,
  `comment` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `date` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idreview`),
  KEY `idactivity` (`idactivity`)
) ;

--
-- Déchargement des données de la table `user_review_activity`
--

INSERT INTO `user_review_activity` (`idreview`, `idactivity`, `rating`, `comment`, `date`) VALUES
(1, 2, 5, 'Bien, chère, long, court, rapide', '2025-10-15 12:03:57');

-- --------------------------------------------------------

--
-- Structure de la table `user_session`
--

DROP TABLE IF EXISTS `user_session`;
CREATE TABLE IF NOT EXISTS `user_session` (
  `iduser` int NOT NULL,
  `idsession` int NOT NULL,
  PRIMARY KEY (`iduser`,`idsession`),
  KEY `idsession` (`idsession`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `activity`
--
ALTER TABLE `activity`
  ADD CONSTRAINT `fk_activity_type` FOREIGN KEY (`idactivity_type`) REFERENCES `activity_type` (`idactivity_type`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `activity_opening_hour`
--
ALTER TABLE `activity_opening_hour`
  ADD CONSTRAINT `activity_opening_hour_ibfk_1` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `activity_picture`
--
ALTER TABLE `activity_picture`
  ADD CONSTRAINT `activity_picture_ibfk_1` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `activity_picture_ibfk_2` FOREIGN KEY (`idpicture`) REFERENCES `picture` (`idpicture`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `company_activity`
--
ALTER TABLE `company_activity`
  ADD CONSTRAINT `company_activity_ibfk_1` FOREIGN KEY (`idcompany`) REFERENCES `company` (`idcompany`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `company_activity_ibfk_2` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `company_picture`
--
ALTER TABLE `company_picture`
  ADD CONSTRAINT `company_picture_ibfk_1` FOREIGN KEY (`idcompany`) REFERENCES `company` (`idcompany`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `company_picture_ibfk_2` FOREIGN KEY (`idpicture`) REFERENCES `picture` (`idpicture`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game`
--
ALTER TABLE `game`
  ADD CONSTRAINT `game_ibfk_1` FOREIGN KEY (`idcreator`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game_activity`
--
ALTER TABLE `game_activity`
  ADD CONSTRAINT `game_activity_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_activity_ibfk_2` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game_activity_types`
--
ALTER TABLE `game_activity_types`
  ADD CONSTRAINT `game_activity_types_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_activity_types_ibfk_2` FOREIGN KEY (`idactivity_type`) REFERENCES `activity_type` (`idactivity_type`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game_dates`
--
ALTER TABLE `game_dates`
  ADD CONSTRAINT `game_dates_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game_date_vote`
--
ALTER TABLE `game_date_vote`
  ADD CONSTRAINT `fk_gdv_date` FOREIGN KEY (`idgamedate`) REFERENCES `game_dates` (`idgamedate`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gdv_game` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_gdv_user` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game_filters`
--
ALTER TABLE `game_filters`
  ADD CONSTRAINT `game_filters_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game_user`
--
ALTER TABLE `game_user`
  ADD CONSTRAINT `game_user_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_user_ibfk_2` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `game_vote`
--
ALTER TABLE `game_vote`
  ADD CONSTRAINT `game_vote_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_vote_ibfk_2` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `game_vote_ibfk_3` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `session_activity`
--
ALTER TABLE `session_activity`
  ADD CONSTRAINT `session_activity_ibfk_1` FOREIGN KEY (`idsession`) REFERENCES `session` (`idsession`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `session_activity_ibfk_2` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `user`
--
ALTER TABLE `user`
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`idrole`) REFERENCES `role` (`idrole`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_company`
--
ALTER TABLE `user_company`
  ADD CONSTRAINT `user_company_ibfk_1` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_company_ibfk_2` FOREIGN KEY (`idcompany`) REFERENCES `company` (`idcompany`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_review_activity`
--
ALTER TABLE `user_review_activity`
  ADD CONSTRAINT `user_review_activity_ibfk_1` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Contraintes pour la table `user_session`
--
ALTER TABLE `user_session`
  ADD CONSTRAINT `user_session_ibfk_1` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_session_ibfk_2` FOREIGN KEY (`idsession`) REFERENCES `session` (`idsession`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
