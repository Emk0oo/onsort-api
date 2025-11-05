-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1:3306
-- Généré le : mer. 05 nov. 2025 à 13:10
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
  PRIMARY KEY (`idactivity_type`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `activity_type`
--

INSERT INTO `activity_type` (`idactivity_type`, `name`) VALUES
(1, 'Bowling'),
(2, 'Karting');

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
  `status` enum('waiting_for_launch','voting','finished') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting_for_launch',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idgame`),
  UNIQUE KEY `invite_code` (`invite_code`),
  KEY `idcreator` (`idcreator`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `game`
--

INSERT INTO `game` (`idgame`, `idcreator`, `invite_code`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'OAOYLDQ6TU', 'waiting_for_launch', '2025-11-05 11:34:16', '2025-11-05 11:34:16');

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Structure de la table `game_filters`
--

DROP TABLE IF EXISTS `game_filters`;
CREATE TABLE IF NOT EXISTS `game_filters` (
  `idfilter` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `activity_type` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `price_range_min` int DEFAULT NULL,
  `price_range_max` int DEFAULT NULL,
  `location` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`idfilter`),
  KEY `idgame` (`idgame`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
(1, 2, 1, '2025-11-05 11:34:16');

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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`iduser`, `name`, `surname`, `email`, `username`, `password`, `date_of_birth`, `is_minor`, `is_active`, `idrole`) VALUES
(1, 'test', 'test', 'test', 'test', '$2b$10$hxpWRiXghgUzG8iH4HpXI.iGLP9H3qFFDKhxXAlw3W3miHtpKoL1q', '2025-10-15', 0, 1, NULL),
(2, 'Emir', 'Javor', 'emir@emir.com', 'admin', '$2b$10$bd/.LbdzzWdr74XxuUhOQe6zL0GkFtQFQaQQD2hWd.YLvE7rtPGFy', '2002-05-20', 0, 1, 1);

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
-- Contraintes pour la table `game_dates`
--
ALTER TABLE `game_dates`
  ADD CONSTRAINT `game_dates_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE;

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
