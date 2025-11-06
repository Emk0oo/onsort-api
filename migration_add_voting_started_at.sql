-- =====================================================
-- Migration : Ajout du champ voting_started_at
-- =====================================================
-- Ce champ permet de tracker quand le vote a commencé
-- pour implémenter l'auto-fermeture après timeout
-- =====================================================

USE onsort;

-- Ajouter la colonne voting_started_at à la table game
ALTER TABLE `game`
ADD COLUMN `voting_started_at` DATETIME DEFAULT NULL
COMMENT 'Date et heure du début du vote (passage en status voting)'
AFTER `updated_at`;

SELECT 'Migration terminée : Colonne voting_started_at ajoutée à la table game' AS message;
