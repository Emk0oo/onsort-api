-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : jeu. 18 sep. 2025 à 13:08
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
  PRIMARY KEY (`idactivity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
-- Structure de la table `picture`
--

DROP TABLE IF EXISTS `picture`;
CREATE TABLE IF NOT EXISTS `picture` (
  `idpicture` int NOT NULL AUTO_INCREMENT,
  `url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alt` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idpicture`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`iduser`, `name`, `surname`, `email`, `username`, `password`, `date_of_birth`, `is_minor`, `is_active`, `idrole`) VALUES
(1, 'abrc', 'abtc', 'test', NULL, '$2b$10$hxpWRiXghgUzG8iH4HpXI.iGLP9H3qFFDKhxXAlw3W3miHtpKoL1q', '0000-00-00', 0, 1, NULL);

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
-- Contraintes pour la table `user_session`
--
ALTER TABLE `user_session`
  ADD CONSTRAINT `user_session_ibfk_1` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `user_session_ibfk_2` FOREIGN KEY (`idsession`) REFERENCES `session` (`idsession`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
