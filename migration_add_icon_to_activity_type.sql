-- =====================================================
-- Migration: Ajouter colonne icon à activity_type
-- =====================================================
-- Cette migration ajoute une colonne icon pour stocker
-- les noms d'icônes Flutter
-- =====================================================

USE onsort;

-- Vérifier et ajouter la colonne icon si elle n'existe pas
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.columns
WHERE table_schema = 'onsort'
  AND table_name = 'activity_type'
  AND column_name = 'icon';

SET @query = IF(@col_exists = 0,
  'ALTER TABLE `activity_type` ADD COLUMN `icon` VARCHAR(100) DEFAULT NULL COMMENT ''Nom de l''icône Flutter (ex: Icons.bowling)'' AFTER `name`',
  'SELECT "Column icon already exists" AS message'
);

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- =====================================================
-- Migration terminée
-- =====================================================

SELECT 'Migration terminée : colonne icon ajoutée à activity_type' AS message;
