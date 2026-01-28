-- Migration: Ajout du vote des dates
-- Date: 2026-01-28
-- Description: Ajoute la phase de vote des dates avant le vote des activités

-- 1. Étendre l'ENUM status pour inclure 'voting_dates'
ALTER TABLE `game`
  MODIFY COLUMN `status`
    ENUM('waiting_for_launch','voting_dates','voting','finished')
    CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    NOT NULL DEFAULT 'waiting_for_launch';

-- 2. Ajouter les colonnes pour le vote des dates
ALTER TABLE `game`
  ADD COLUMN `date_voting_started_at` DATETIME DEFAULT NULL
    COMMENT 'Timestamp du début du vote des dates'
    AFTER `voting_started_at`,
  ADD COLUMN `winning_date` DATETIME DEFAULT NULL
    COMMENT 'La date gagnante du vote'
    AFTER `date_voting_started_at`;

-- 3. Créer la table des votes de dates
CREATE TABLE IF NOT EXISTS `game_date_vote` (
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `idgamedate` int NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=Oui, 0=Non',
  `voted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idgame`, `iduser`, `idgamedate`),
  KEY `idx_gdv_game` (`idgame`),
  KEY `idx_gdv_user` (`iduser`),
  KEY `idx_gdv_gamedate` (`idgamedate`),
  CONSTRAINT `fk_gdv_game` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_gdv_user` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_gdv_date` FOREIGN KEY (`idgamedate`) REFERENCES `game_dates` (`idgamedate`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
