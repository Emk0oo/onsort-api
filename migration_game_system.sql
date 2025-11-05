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

-- Vérifier et ajouter joined_at seulement si elle n'existe pas
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.columns
WHERE table_schema = 'onsort'
  AND table_name = 'game_user'
  AND column_name = 'joined_at';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE `game_user` ADD COLUMN `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `is_creator`',
  'SELECT "Column joined_at already exists" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- 4. Créer la table game_activity (pivot)
-- =====================================================
-- Cette table associe les activités filtrées à une game
-- Les activités sont sélectionnées automatiquement à la
-- création de la room selon les critères (types + prix)
-- =====================================================

CREATE TABLE IF NOT EXISTS `game_activity` (
  `idgame` int NOT NULL,
  `idactivity` int NOT NULL,
  `added_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idgame`, `idactivity`),
  KEY `idactivity` (`idactivity`),
  CONSTRAINT `game_activity_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `game_activity_ibfk_2` FOREIGN KEY (`idactivity`) REFERENCES `activity` (`idactivity`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. Modifier la table game_filters
-- =====================================================
-- Suppression de activity_type (VARCHAR) car maintenant
-- on utilise une relation Many-to-Many via game_activity_types
-- Ajout de allowed_prices (JSON) pour stocker les prix acceptés
-- =====================================================

ALTER TABLE `game_filters`
DROP COLUMN IF EXISTS `activity_type`,
ADD COLUMN `allowed_prices` JSON DEFAULT NULL COMMENT 'Array des prix autorisés ex: [1,2,3]' AFTER `location`;

-- =====================================================
-- 6. Créer la table game_activity_types (jonction)
-- =====================================================
-- Cette table stocke les types d'activité sélectionnés
-- pour chaque game (Many-to-Many)
-- =====================================================

CREATE TABLE IF NOT EXISTS `game_activity_types` (
  `idgame` int NOT NULL,
  `idactivity_type` int NOT NULL,
  PRIMARY KEY (`idgame`, `idactivity_type`),
  KEY `idactivity_type` (`idactivity_type`),
  CONSTRAINT `game_activity_types_ibfk_1` FOREIGN KEY (`idgame`) REFERENCES `game` (`idgame`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `game_activity_types_ibfk_2` FOREIGN KEY (`idactivity_type`) REFERENCES `activity_type` (`idactivity_type`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- Migration terminée
-- =====================================================

SELECT 'Migration terminée avec succès !' AS message;
SELECT 'Nouvelles tables créées : game_vote, game_activity, game_activity_types' AS info1;
SELECT 'Tables modifiées : game (statuts), game_user (joined_at), game_filters (allowed_prices)' AS info2;
