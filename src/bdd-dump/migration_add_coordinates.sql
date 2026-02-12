-- Migration: Ajout des coordonnées géographiques (latitude/longitude)
-- Date: 2026-02-12
-- Description: Ajoute les colonnes latitude et longitude à la table activity

ALTER TABLE `activity`
  ADD COLUMN `latitude` DECIMAL(10,8) DEFAULT NULL COMMENT 'Latitude de l\'activité',
  ADD COLUMN `longitude` DECIMAL(11,8) DEFAULT NULL COMMENT 'Longitude de l\'activité';
