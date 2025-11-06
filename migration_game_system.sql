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
-- Suppression de price_range_min et price_range_max (obsolètes)
-- Conservation uniquement de allowed_prices (JSON) et location
-- =====================================================

-- Vérifier et supprimer activity_type si elle existe
SET @col_exists_activity_type = 0;
SELECT COUNT(*) INTO @col_exists_activity_type
FROM information_schema.columns
WHERE table_schema = 'onsort'
  AND table_name = 'game_filters'
  AND column_name = 'activity_type';

SET @drop_query = IF(@col_exists_activity_type > 0,
  'ALTER TABLE `game_filters` DROP COLUMN `activity_type`',
  'SELECT "Column activity_type does not exist" AS message'
);

PREPARE stmt FROM @drop_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier et supprimer price_range_min si elle existe
SET @col_exists_min = 0;
SELECT COUNT(*) INTO @col_exists_min
FROM information_schema.columns
WHERE table_schema = 'onsort'
  AND table_name = 'game_filters'
  AND column_name = 'price_range_min';

SET @drop_min_query = IF(@col_exists_min > 0,
  'ALTER TABLE `game_filters` DROP COLUMN `price_range_min`',
  'SELECT "Column price_range_min does not exist" AS message'
);

PREPARE stmt FROM @drop_min_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier et supprimer price_range_max si elle existe
SET @col_exists_max = 0;
SELECT COUNT(*) INTO @col_exists_max
FROM information_schema.columns
WHERE table_schema = 'onsort'
  AND table_name = 'game_filters'
  AND column_name = 'price_range_max';

SET @drop_max_query = IF(@col_exists_max > 0,
  'ALTER TABLE `game_filters` DROP COLUMN `price_range_max`',
  'SELECT "Column price_range_max does not exist" AS message'
);

PREPARE stmt FROM @drop_max_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Vérifier et ajouter allowed_prices si elle n'existe pas
SET @col_exists_prices = 0;
SELECT COUNT(*) INTO @col_exists_prices
FROM information_schema.columns
WHERE table_schema = 'onsort'
  AND table_name = 'game_filters'
  AND column_name = 'allowed_prices';

SET @add_query = IF(@col_exists_prices = 0,
  'ALTER TABLE `game_filters` ADD COLUMN `allowed_prices` JSON DEFAULT NULL COMMENT ''Array des prix autorisés ex: [1,2,3]'' AFTER `location`',
  'SELECT "Column allowed_prices already exists" AS message'
);

PREPARE stmt FROM @add_query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

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
SELECT 'Tables modifiées : game (statuts), game_user (joined_at)' AS info2;
SELECT 'game_filters : Colonnes supprimées (activity_type, price_range_min, price_range_max), Colonne ajoutée (allowed_prices JSON)' AS info3;
