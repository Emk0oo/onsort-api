-- =====================================================
-- Migration du système de Game (Rooms de vote)
-- =====================================================
-- Ce script ajoute toutes les modifications nécessaires
-- pour implémenter le système de vote collaboratif
-- =====================================================

USE onsort;

-- =====================================================
-- 1. Créer la table game_vote
-- =====================================================
-- Cette table enregistre les votes des participants
-- pour chaque activité dans une room
-- =====================================================

CREATE TABLE IF NOT EXISTS `game_vote` (
  `idvote` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `idactivity` int NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=Oui (swipe droite), 0=Non (swipe gauche)',
  `voted_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idvote`),
  UNIQUE KEY `unique_vote` (`idgame`, `iduser`, `idactivity`),
  KEY `idgame` (`idgame`),
  KEY `iduser` (`iduser`),
  KEY `idactivity` (`idactivity`),
  CONSTRAINT `game_vote_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `game_vote_ibfk_2` FOREIGN KEY (`iduser`) REFERENCES `user` (`iduser`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `game_vote_ibfk_3` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. Modifier les statuts de la table game
-- =====================================================
-- Mise à jour des statuts ENUM pour utiliser les
-- nouveaux statuts du workflow :
-- - waiting_for_launch : En attente de participants
-- - voting : Vote en cours
-- - finished : Terminé
-- =====================================================

ALTER TABLE `game`
MODIFY COLUMN `status` ENUM('waiting_for_launch', 'voting', 'finished')
COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting_for_launch';

-- =====================================================
-- 3. Ajouter la colonne joined_at à game_user
-- =====================================================
-- Cette colonne permet de tracker quand un utilisateur
-- a rejoint la room (utile pour l'affichage)
-- =====================================================

ALTER TABLE `game_user`
ADD COLUMN `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `is_creator`;

-- =====================================================
-- Migration terminée
-- =====================================================

SELECT 'Migration terminée avec succès !' AS message;
SELECT 'Nouvelles tables créées : game_vote' AS info1;
SELECT 'Tables modifiées : game (statuts), game_user (joined_at)' AS info2;
