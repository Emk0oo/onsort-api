-- =============================================================
-- SEED DATA - Onsort - Activités réalistes en Normandie
-- Exécuter : docker exec -i <mysql_container> mysql -u root -p$DB_PASSWORD onsort < seed.sql
-- =============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET FOREIGN_KEY_CHECKS = 0;
START TRANSACTION;

-- =============================================================
-- ROLES
-- =============================================================
DELETE FROM `role`;
INSERT INTO `role` (`idrole`, `name`) VALUES
(1, 'Admin'),
(2, 'User'),
(3, 'User_company');

-- =============================================================
-- ACTIVITY TYPES (10)
-- =============================================================
DELETE FROM `activity_type`;
INSERT INTO `activity_type` (`idactivity_type`, `name`, `icon`) VALUES
(1, 'Bowling', 'sports_score'),
(2, 'Karting', 'directions_car'),
(3, 'Escape Game', 'lock_open'),
(4, 'Laser Game', 'flashlight'),
(5, 'Paintball', 'target'),
(6, 'Accrobranche', 'forest'),
(7, 'Cinéma', 'movie'),
(8, 'Restaurant', 'restaurant'),
(9, 'Spa & Bien-être', 'spa'),
(10, 'Parc d''attractions', 'attractions');

-- =============================================================
-- FEATURES (20)
-- =============================================================
DELETE FROM `feature`;
INSERT INTO `feature` (`idfeature`, `name`) VALUES
(1, 'Parking gratuit'),
(2, 'Accessible PMR'),
(3, 'Wifi gratuit'),
(4, 'Bar sur place'),
(5, 'Terrasse'),
(6, 'Climatisation'),
(7, 'Vestiaires'),
(8, 'Réservation en ligne'),
(9, 'Groupe possible (+10 pers.)'),
(10, 'Restauration sur place'),
(11, 'Anniversaire & événements'),
(12, 'Équipement fourni'),
(13, 'Adapté aux enfants'),
(14, 'Carte bancaire acceptée'),
(15, 'Accès bus/tram'),
(16, 'Son & lumière'),
(17, 'Salle privatisable'),
(18, 'Nocturne disponible'),
(19, 'Plein air'),
(20, 'Moniteur / Animateur');

-- =============================================================
-- ACTIVITIES (25 - Normandie)
-- =============================================================
DELETE FROM `activity`;
INSERT INTO `activity` (`idactivity`, `name`, `description`, `minor_forbidden`, `address`, `price_range`, `idactivity_type`, `latitude`, `longitude`) VALUES
-- Bowling (type 1)
(1, 'Bowling de Caen', 'Bowling moderne avec 22 pistes, ambiance soirée avec DJ le weekend. Idéal pour les groupes et anniversaires.', 0, '17 Rue de Bras, 14000 Caen', 1, 1, 49.18560, -0.36530),
(2, 'Bowling de Mondeville', 'Espace bowling familial avec pistes lumineuses et espace jeux. Formules goûter disponibles.', 0, 'Centre Commercial Mondeville 2, 14120 Mondeville', 1, 1, 49.17200, -0.33100),

-- Karting (type 2)
(3, 'Karting de Pont-l''Évêque', 'Circuit de karting en extérieur avec karts 270cc et 390cc. Stages de pilotage et compétitions.', 0, 'Route de Lisieux, 14130 Pont-l''Évêque', 2, 2, 49.28600, 0.18100),
(4, 'Caen Kart Indoor', 'Piste de karting indoor de 500m. Sessions chronométrées, grands prix entre amis.', 0, 'Zone Industrielle, 14460 Colombelles', 2, 2, 49.20100, -0.33800),

-- Escape Game (type 3)
(5, 'Escape Hunt Caen', 'Escape game immersif avec 5 salles thématiques : enquête policière, aventure, horreur. De 2 à 6 joueurs.', 0, '46 Rue Saint-Pierre, 14000 Caen', 2, 3, 49.18400, -0.37000),
(6, 'Enigmatic Rouen', 'Escape room avec décors cinématographiques. 4 univers différents de 60 à 90 minutes.', 0, '15 Rue du Gros-Horloge, 76000 Rouen', 2, 3, 49.44100, 1.09400),
(7, 'Mystery Escape Deauville', 'Escape game face à la mer. Scénarios uniques inspirés de la Normandie et du Débarquement.', 0, '22 Rue Désiré Le Hoc, 14800 Deauville', 2, 3, 49.35700, 0.07400),

-- Laser Game (type 4)
(8, 'Laser Game Evolution Caen', 'Arène de laser game sur 2 niveaux avec effets spéciaux. Parties de 20 minutes, sessions illimitées.', 0, '3 Avenue de Tourville, 14000 Caen', 1, 4, 49.19700, -0.39200),
(9, 'Laser Quest Rouen', 'Centre de laser game dernière génération. Arène futuriste de 700m², brouillard et lumières UV.', 0, '10 Rue de la République, 76000 Rouen', 1, 4, 49.44300, 1.09900),

-- Paintball (type 5)
(10, 'Paintball Normandie', 'Terrain de paintball en forêt avec 5 scénarios différents. Équipement complet fourni, à partir de 12 ans.', 0, 'Chemin des Bois, 14210 Évrecy', 2, 5, 49.09800, -0.50200),
(11, 'D-Day Paintball', 'Paintball thématique Débarquement en Normandie. Terrains reproduisant les plages du D-Day.', 0, 'Route d''Omaha, 14710 Colleville-sur-Mer', 2, 5, 49.34600, -0.85200),

-- Accrobranche (type 6)
(12, 'Accrobranche Aventure Caen', 'Parc acrobatique en hauteur avec 8 parcours de difficulté croissante. Tyroliennes géantes.', 0, 'Bois de Lébisey, 14460 Colombelles', 1, 6, 49.20800, -0.34600),
(13, 'Forêt Adrénaline Deauville', 'Accrobranche en forêt normande face à la mer. Parcours baby dès 3 ans, parcours extrême adulte.', 0, 'Route de Villers, 14800 Deauville', 1, 6, 49.35200, 0.08900),
(14, 'Arbr''o Parc Lisieux', 'Parc aventure avec ponts de singe, sauts de Tarzan et parcours nocturnes en été.', 0, 'Forêt de Touques, 14100 Lisieux', 1, 6, 49.15100, 0.22700),

-- Cinéma (type 7)
(15, 'Pathé Caen Rives de l''Orne', 'Multiplexe 12 salles dont IMAX et 4DX. Dolby Atmos, sièges inclinables.', 0, 'Centre Rives de l''Orne, 14000 Caen', 1, 7, 49.17600, -0.37500),
(16, 'CGR Cherbourg Odéon', 'Cinéma 8 salles au coeur de Cherbourg. Salle ICE avec écran XXL et son immersif.', 0, '24 Rue du Maréchal Foch, 50100 Cherbourg', 1, 7, 49.63700, -1.61600),

-- Restaurant (type 8)
(17, 'Le Bouchon Normand', 'Restaurant traditionnel normand. Spécialités camembert rôti, tripes à la mode de Caen, tarte aux pommes.', 0, '44 Rue du Vaugueux, 14000 Caen', 2, 8, 49.18500, -0.36200),
(18, 'La Table du Marais', 'Cuisine gastronomique face aux marais du Cotentin. Produits locaux, menu dégustation.', 0, '12 Place de la République, 50500 Carentan', 3, 8, 49.30300, -1.24300),
(19, 'Crêperie Ty Breizh Honfleur', 'Crêperie bretonne en plein coeur du Vieux Bassin. Galettes de sarrasin et cidre fermier.', 0, '8 Quai Sainte-Catherine, 14600 Honfleur', 1, 8, 49.41900, 0.23300),

-- Spa & Bien-être (type 9)
(20, 'Thalasso Deauville by Algotherm', 'Centre de thalassothérapie face à la mer. Piscine d''eau de mer chauffée, soins du corps, hammam.', 0, '1 Rue Sem, 14800 Deauville', 3, 9, 49.35900, 0.07100),
(21, 'Spa O''Pure Caen', 'Espace bien-être au coeur de Caen. Sauna, jacuzzi, modelages. Forfaits duo et solo.', 1, '28 Rue Écuyère, 14000 Caen', 2, 9, 49.18700, -0.36800),

-- Parc d'attractions (type 10)
(22, 'Festyland', 'Parc d''attractions familial avec plus de 30 attractions. Montagnes russes, manèges et spectacles.', 0, 'Route de Caumont, 14760 Bretteville-sur-Odon', 2, 10, 49.16100, -0.42500),
(23, 'Zoo de Cerza', 'Parc zoologique de 70 hectares avec plus de 1500 animaux. Safari train et parcours aventure.', 0, 'Route de Lisieux, 14100 Hermival-les-Vaux', 2, 10, 49.12600, 0.28700),
(24, 'Cité de la Mer Cherbourg', 'Musée maritime interactif dans l''ancienne gare transatlantique. Sous-marin Le Redoutable visitable.', 0, 'Allée du Président Menut, 50100 Cherbourg', 2, 10, 49.64600, -1.61800),
(25, 'Mémorial de Caen', 'Musée pour la paix retraçant la Seconde Guerre mondiale. Expositions interactives et jardins du souvenir.', 0, 'Esplanade Général Eisenhower, 14050 Caen', 2, 10, 49.21400, -0.38500);

-- =============================================================
-- ACTIVITY OPENING HOURS
-- =============================================================
DELETE FROM `activity_opening_hour`;
INSERT INTO `activity_opening_hour` (`id`, `idactivity`, `day_of_week`, `opening_morning`, `closing_morning`, `opening_afternoon`, `closing_afternoon`) VALUES
-- Bowling de Caen (1) : fermé lundi, ouvert mar-dim
(1, 1, 'Mardi', '14:00:00', NULL, NULL, '23:00:00'),
(2, 1, 'Mercredi', '10:00:00', '12:00:00', '14:00:00', '23:00:00'),
(3, 1, 'Jeudi', '14:00:00', NULL, NULL, '23:00:00'),
(4, 1, 'Vendredi', '14:00:00', NULL, NULL, '01:00:00'),
(5, 1, 'Samedi', '10:00:00', NULL, NULL, '01:00:00'),
(6, 1, 'Dimanche', '10:00:00', NULL, NULL, '22:00:00'),

-- Bowling de Mondeville (2)
(7, 2, 'Lundi', '14:00:00', NULL, NULL, '22:00:00'),
(8, 2, 'Mardi', '14:00:00', NULL, NULL, '22:00:00'),
(9, 2, 'Mercredi', '10:00:00', NULL, NULL, '22:00:00'),
(10, 2, 'Jeudi', '14:00:00', NULL, NULL, '22:00:00'),
(11, 2, 'Vendredi', '14:00:00', NULL, NULL, '23:00:00'),
(12, 2, 'Samedi', '10:00:00', NULL, NULL, '23:00:00'),
(13, 2, 'Dimanche', '10:00:00', NULL, NULL, '22:00:00'),

-- Karting Pont-l'Évêque (3) : mer-dim
(14, 3, 'Mercredi', '10:00:00', '12:00:00', '14:00:00', '18:00:00'),
(15, 3, 'Jeudi', '10:00:00', '12:00:00', '14:00:00', '18:00:00'),
(16, 3, 'Vendredi', '10:00:00', '12:00:00', '14:00:00', '18:00:00'),
(17, 3, 'Samedi', '10:00:00', NULL, NULL, '19:00:00'),
(18, 3, 'Dimanche', '10:00:00', NULL, NULL, '18:00:00'),

-- Caen Kart Indoor (4) : mar-dim
(19, 4, 'Mardi', '14:00:00', NULL, NULL, '21:00:00'),
(20, 4, 'Mercredi', '10:00:00', NULL, NULL, '21:00:00'),
(21, 4, 'Jeudi', '14:00:00', NULL, NULL, '21:00:00'),
(22, 4, 'Vendredi', '14:00:00', NULL, NULL, '22:00:00'),
(23, 4, 'Samedi', '10:00:00', NULL, NULL, '22:00:00'),
(24, 4, 'Dimanche', '10:00:00', NULL, NULL, '20:00:00'),

-- Escape Hunt Caen (5) : tous les jours
(25, 5, 'Lundi', '10:00:00', NULL, NULL, '22:00:00'),
(26, 5, 'Mardi', '10:00:00', NULL, NULL, '22:00:00'),
(27, 5, 'Mercredi', '10:00:00', NULL, NULL, '22:00:00'),
(28, 5, 'Jeudi', '10:00:00', NULL, NULL, '22:00:00'),
(29, 5, 'Vendredi', '10:00:00', NULL, NULL, '23:00:00'),
(30, 5, 'Samedi', '10:00:00', NULL, NULL, '23:00:00'),
(31, 5, 'Dimanche', '10:00:00', NULL, NULL, '21:00:00'),

-- Enigmatic Rouen (6) : mar-dim
(32, 6, 'Mardi', '10:30:00', NULL, NULL, '22:00:00'),
(33, 6, 'Mercredi', '10:30:00', NULL, NULL, '22:00:00'),
(34, 6, 'Jeudi', '10:30:00', NULL, NULL, '22:00:00'),
(35, 6, 'Vendredi', '10:30:00', NULL, NULL, '23:00:00'),
(36, 6, 'Samedi', '10:00:00', NULL, NULL, '23:00:00'),
(37, 6, 'Dimanche', '10:00:00', NULL, NULL, '21:00:00'),

-- Mystery Escape Deauville (7) : mer-dim
(38, 7, 'Mercredi', '14:00:00', NULL, NULL, '20:00:00'),
(39, 7, 'Jeudi', '14:00:00', NULL, NULL, '20:00:00'),
(40, 7, 'Vendredi', '14:00:00', NULL, NULL, '22:00:00'),
(41, 7, 'Samedi', '10:00:00', NULL, NULL, '22:00:00'),
(42, 7, 'Dimanche', '10:00:00', NULL, NULL, '20:00:00'),

-- Laser Game Evolution Caen (8) : mer-dim
(43, 8, 'Mercredi', '14:00:00', NULL, NULL, '20:00:00'),
(44, 8, 'Jeudi', '14:00:00', NULL, NULL, '20:00:00'),
(45, 8, 'Vendredi', '14:00:00', NULL, NULL, '22:00:00'),
(46, 8, 'Samedi', '10:00:00', NULL, NULL, '22:00:00'),
(47, 8, 'Dimanche', '10:00:00', NULL, NULL, '20:00:00'),

-- Laser Quest Rouen (9) : lun-dim
(48, 9, 'Lundi', '14:00:00', NULL, NULL, '21:00:00'),
(49, 9, 'Mardi', '14:00:00', NULL, NULL, '21:00:00'),
(50, 9, 'Mercredi', '10:00:00', NULL, NULL, '21:00:00'),
(51, 9, 'Jeudi', '14:00:00', NULL, NULL, '21:00:00'),
(52, 9, 'Vendredi', '14:00:00', NULL, NULL, '23:00:00'),
(53, 9, 'Samedi', '10:00:00', NULL, NULL, '23:00:00'),
(54, 9, 'Dimanche', '10:00:00', NULL, NULL, '20:00:00'),

-- Paintball Normandie (10) : sam-dim + mer après-midi
(55, 10, 'Mercredi', '14:00:00', NULL, NULL, '18:00:00'),
(56, 10, 'Samedi', '09:00:00', '12:00:00', '14:00:00', '18:00:00'),
(57, 10, 'Dimanche', '09:00:00', '12:00:00', '14:00:00', '18:00:00'),

-- D-Day Paintball (11) : sam-dim + jeu-ven
(58, 11, 'Jeudi', '10:00:00', NULL, NULL, '18:00:00'),
(59, 11, 'Vendredi', '10:00:00', NULL, NULL, '18:00:00'),
(60, 11, 'Samedi', '09:00:00', NULL, NULL, '19:00:00'),
(61, 11, 'Dimanche', '09:00:00', NULL, NULL, '18:00:00'),

-- Accrobranche Aventure Caen (12) : mer-dim (saison)
(62, 12, 'Mercredi', '10:00:00', NULL, NULL, '18:00:00'),
(63, 12, 'Jeudi', '10:00:00', NULL, NULL, '18:00:00'),
(64, 12, 'Vendredi', '10:00:00', NULL, NULL, '18:00:00'),
(65, 12, 'Samedi', '09:30:00', NULL, NULL, '19:00:00'),
(66, 12, 'Dimanche', '09:30:00', NULL, NULL, '18:30:00'),

-- Forêt Adrénaline Deauville (13) : mer-dim
(67, 13, 'Mercredi', '10:00:00', NULL, NULL, '18:00:00'),
(68, 13, 'Samedi', '09:30:00', NULL, NULL, '19:00:00'),
(69, 13, 'Dimanche', '09:30:00', NULL, NULL, '18:00:00'),

-- Arbr'o Parc Lisieux (14) : mer-dim
(70, 14, 'Mercredi', '10:00:00', NULL, NULL, '18:30:00'),
(71, 14, 'Samedi', '09:30:00', NULL, NULL, '19:00:00'),
(72, 14, 'Dimanche', '09:30:00', NULL, NULL, '18:30:00'),

-- Pathé Caen (15) : tous les jours
(73, 15, 'Lundi', '10:00:00', NULL, NULL, '23:00:00'),
(74, 15, 'Mardi', '10:00:00', NULL, NULL, '23:00:00'),
(75, 15, 'Mercredi', '10:00:00', NULL, NULL, '23:30:00'),
(76, 15, 'Jeudi', '10:00:00', NULL, NULL, '23:00:00'),
(77, 15, 'Vendredi', '10:00:00', NULL, NULL, '00:00:00'),
(78, 15, 'Samedi', '10:00:00', NULL, NULL, '00:00:00'),
(79, 15, 'Dimanche', '10:00:00', NULL, NULL, '23:00:00'),

-- CGR Cherbourg (16) : tous les jours
(80, 16, 'Lundi', '13:30:00', NULL, NULL, '22:30:00'),
(81, 16, 'Mardi', '13:30:00', NULL, NULL, '22:30:00'),
(82, 16, 'Mercredi', '10:00:00', NULL, NULL, '22:30:00'),
(83, 16, 'Jeudi', '13:30:00', NULL, NULL, '22:30:00'),
(84, 16, 'Vendredi', '13:30:00', NULL, NULL, '23:00:00'),
(85, 16, 'Samedi', '10:00:00', NULL, NULL, '23:00:00'),
(86, 16, 'Dimanche', '10:00:00', NULL, NULL, '22:30:00'),

-- Le Bouchon Normand (17) : mar-sam
(87, 17, 'Mardi', '12:00:00', '14:00:00', '19:00:00', '22:00:00'),
(88, 17, 'Mercredi', '12:00:00', '14:00:00', '19:00:00', '22:00:00'),
(89, 17, 'Jeudi', '12:00:00', '14:00:00', '19:00:00', '22:00:00'),
(90, 17, 'Vendredi', '12:00:00', '14:00:00', '19:00:00', '22:30:00'),
(91, 17, 'Samedi', '12:00:00', '14:30:00', '19:00:00', '23:00:00'),

-- La Table du Marais (18) : jeu-lun
(92, 18, 'Jeudi', '12:00:00', '14:00:00', '19:30:00', '21:30:00'),
(93, 18, 'Vendredi', '12:00:00', '14:00:00', '19:30:00', '22:00:00'),
(94, 18, 'Samedi', '12:00:00', '14:30:00', '19:30:00', '22:00:00'),
(95, 18, 'Dimanche', '12:00:00', '14:30:00', NULL, NULL),

-- Crêperie Ty Breizh (19) : mar-dim
(96, 19, 'Mardi', '11:30:00', '14:30:00', '18:30:00', '21:30:00'),
(97, 19, 'Mercredi', '11:30:00', '14:30:00', '18:30:00', '21:30:00'),
(98, 19, 'Jeudi', '11:30:00', '14:30:00', '18:30:00', '21:30:00'),
(99, 19, 'Vendredi', '11:30:00', '14:30:00', '18:30:00', '22:00:00'),
(100, 19, 'Samedi', '11:30:00', '15:00:00', '18:30:00', '22:00:00'),
(101, 19, 'Dimanche', '11:30:00', '15:00:00', NULL, NULL),

-- Thalasso Deauville (20) : tous les jours
(102, 20, 'Lundi', '09:00:00', NULL, NULL, '19:00:00'),
(103, 20, 'Mardi', '09:00:00', NULL, NULL, '19:00:00'),
(104, 20, 'Mercredi', '09:00:00', NULL, NULL, '19:00:00'),
(105, 20, 'Jeudi', '09:00:00', NULL, NULL, '19:00:00'),
(106, 20, 'Vendredi', '09:00:00', NULL, NULL, '20:00:00'),
(107, 20, 'Samedi', '09:00:00', NULL, NULL, '20:00:00'),
(108, 20, 'Dimanche', '09:00:00', NULL, NULL, '19:00:00'),

-- Spa O'Pure (21) : mar-sam
(109, 21, 'Mardi', '10:00:00', NULL, NULL, '19:00:00'),
(110, 21, 'Mercredi', '10:00:00', NULL, NULL, '19:00:00'),
(111, 21, 'Jeudi', '10:00:00', NULL, NULL, '19:00:00'),
(112, 21, 'Vendredi', '10:00:00', NULL, NULL, '20:00:00'),
(113, 21, 'Samedi', '09:30:00', NULL, NULL, '19:00:00'),

-- Festyland (22) : mer-dim (saison)
(114, 22, 'Mercredi', '10:30:00', NULL, NULL, '18:00:00'),
(115, 22, 'Jeudi', '10:30:00', NULL, NULL, '18:00:00'),
(116, 22, 'Vendredi', '10:30:00', NULL, NULL, '18:00:00'),
(117, 22, 'Samedi', '10:00:00', NULL, NULL, '19:00:00'),
(118, 22, 'Dimanche', '10:00:00', NULL, NULL, '18:30:00'),

-- Zoo de Cerza (23) : tous les jours
(119, 23, 'Lundi', '10:00:00', NULL, NULL, '17:30:00'),
(120, 23, 'Mardi', '10:00:00', NULL, NULL, '17:30:00'),
(121, 23, 'Mercredi', '10:00:00', NULL, NULL, '17:30:00'),
(122, 23, 'Jeudi', '10:00:00', NULL, NULL, '17:30:00'),
(123, 23, 'Vendredi', '10:00:00', NULL, NULL, '17:30:00'),
(124, 23, 'Samedi', '09:30:00', NULL, NULL, '18:00:00'),
(125, 23, 'Dimanche', '09:30:00', NULL, NULL, '18:00:00'),

-- Cité de la Mer (24) : tous les jours
(126, 24, 'Lundi', '09:30:00', NULL, NULL, '18:00:00'),
(127, 24, 'Mardi', '09:30:00', NULL, NULL, '18:00:00'),
(128, 24, 'Mercredi', '09:30:00', NULL, NULL, '18:00:00'),
(129, 24, 'Jeudi', '09:30:00', NULL, NULL, '18:00:00'),
(130, 24, 'Vendredi', '09:30:00', NULL, NULL, '18:00:00'),
(131, 24, 'Samedi', '09:30:00', NULL, NULL, '19:00:00'),
(132, 24, 'Dimanche', '09:30:00', NULL, NULL, '18:00:00'),

-- Mémorial de Caen (25) : tous les jours
(133, 25, 'Lundi', '09:00:00', NULL, NULL, '18:00:00'),
(134, 25, 'Mardi', '09:00:00', NULL, NULL, '18:00:00'),
(135, 25, 'Mercredi', '09:00:00', NULL, NULL, '18:00:00'),
(136, 25, 'Jeudi', '09:00:00', NULL, NULL, '18:00:00'),
(137, 25, 'Vendredi', '09:00:00', NULL, NULL, '18:00:00'),
(138, 25, 'Samedi', '09:00:00', NULL, NULL, '19:00:00'),
(139, 25, 'Dimanche', '09:00:00', NULL, NULL, '18:00:00');

-- =============================================================
-- PICTURES (25 - une par activité)
-- =============================================================
DELETE FROM `picture`;
INSERT INTO `picture` (`idpicture`, `url`, `alt`) VALUES
(1, 'uploads/image-1758205898685-75826773.jpg', 'Bowling de Caen - Pistes éclairées'),
(2, 'uploads/image-1758206044355-422057553.jpg', 'Bowling de Mondeville - Espace familial'),
(3, 'uploads/image-1760522752483-175141464.png', 'Karting de Pont-l''Évêque - Circuit extérieur'),
(4, 'uploads/image-1758205898685-75826773.jpg', 'Caen Kart Indoor - Piste couverte'),
(5, 'uploads/image-1758206044355-422057553.jpg', 'Escape Hunt Caen - Salle mystère'),
(6, 'uploads/image-1760522752483-175141464.png', 'Enigmatic Rouen - Décor immersif'),
(7, 'uploads/image-1758205898685-75826773.jpg', 'Mystery Escape Deauville - Ambiance normande'),
(8, 'uploads/image-1758206044355-422057553.jpg', 'Laser Game Evolution Caen - Arène'),
(9, 'uploads/image-1760522752483-175141464.png', 'Laser Quest Rouen - Arène futuriste'),
(10, 'uploads/image-1758205898685-75826773.jpg', 'Paintball Normandie - Terrain forêt'),
(11, 'uploads/image-1758206044355-422057553.jpg', 'D-Day Paintball - Terrain thématique'),
(12, 'uploads/image-1760522752483-175141464.png', 'Accrobranche Aventure Caen - Parcours en hauteur'),
(13, 'uploads/image-1758205898685-75826773.jpg', 'Forêt Adrénaline Deauville - Tyrolienne'),
(14, 'uploads/image-1758206044355-422057553.jpg', 'Arbr''o Parc Lisieux - Parcours aventure'),
(15, 'uploads/image-1760522752483-175141464.png', 'Pathé Caen - Salle IMAX'),
(16, 'uploads/image-1758205898685-75826773.jpg', 'CGR Cherbourg Odéon - Salle ICE'),
(17, 'uploads/image-1758206044355-422057553.jpg', 'Le Bouchon Normand - Salle chaleureuse'),
(18, 'uploads/image-1760522752483-175141464.png', 'La Table du Marais - Vue sur les marais'),
(19, 'uploads/image-1758205898685-75826773.jpg', 'Crêperie Ty Breizh - Vieux Bassin'),
(20, 'uploads/image-1758206044355-422057553.jpg', 'Thalasso Deauville - Piscine face mer'),
(21, 'uploads/image-1760522752483-175141464.png', 'Spa O''Pure Caen - Espace détente'),
(22, 'uploads/image-1758205898685-75826773.jpg', 'Festyland - Montagnes russes'),
(23, 'uploads/image-1758206044355-422057553.jpg', 'Zoo de Cerza - Safari'),
(24, 'uploads/image-1760522752483-175141464.png', 'Cité de la Mer - Sous-marin'),
(25, 'uploads/image-1758205898685-75826773.jpg', 'Mémorial de Caen - Musée');

-- =============================================================
-- ACTIVITY_PICTURE (une picture par activité)
-- =============================================================
DELETE FROM `activity_picture`;
INSERT INTO `activity_picture` (`idactivity`, `idpicture`) VALUES
(1, 1), (2, 2), (3, 3), (4, 4), (5, 5),
(6, 6), (7, 7), (8, 8), (9, 9), (10, 10),
(11, 11), (12, 12), (13, 13), (14, 14), (15, 15),
(16, 16), (17, 17), (18, 18), (19, 19), (20, 20),
(21, 21), (22, 22), (23, 23), (24, 24), (25, 25);

-- =============================================================
-- ACTIVITY_FEATURE (2-4 features par activité)
-- =============================================================
DELETE FROM `activity_feature`;
INSERT INTO `activity_feature` (`idactivity`, `idfeature`) VALUES
-- Bowling de Caen : Parking, Bar, Groupe, Son & lumière, Anniversaire
(1, 1), (1, 4), (1, 9), (1, 16), (1, 11),
-- Bowling Mondeville : Parking, Adapté enfants, CB, Climatisation
(2, 1), (2, 13), (2, 14), (2, 6),
-- Karting Pont-l'Évêque : Parking, Vestiaires, Équipement fourni, Moniteur
(3, 1), (3, 7), (3, 12), (3, 20),
-- Caen Kart Indoor : Parking, Réservation en ligne, CB, Climatisation
(4, 1), (4, 8), (4, 14), (4, 6),
-- Escape Hunt Caen : Réservation en ligne, Climatisation, Groupe, Salle privatisable
(5, 8), (5, 6), (5, 9), (5, 17),
-- Enigmatic Rouen : Réservation en ligne, Accès bus, CB
(6, 8), (6, 15), (6, 14),
-- Mystery Escape Deauville : Réservation en ligne, CB, Climatisation
(7, 8), (7, 14), (7, 6),
-- Laser Game Caen : Vestiaires, Anniversaire, Groupe, Son & lumière
(8, 7), (8, 11), (8, 9), (8, 16),
-- Laser Quest Rouen : Parking, Vestiaires, CB, Nocturne
(9, 1), (9, 7), (9, 14), (9, 18),
-- Paintball Normandie : Parking, Plein air, Équipement fourni, Groupe
(10, 1), (10, 19), (10, 12), (10, 9),
-- D-Day Paintball : Parking, Plein air, Équipement fourni, Moniteur
(11, 1), (11, 19), (11, 12), (11, 20),
-- Accrobranche Caen : Parking, Plein air, Adapté enfants, Moniteur
(12, 1), (12, 19), (12, 13), (12, 20),
-- Forêt Adrénaline Deauville : Parking, Plein air, Adapté enfants, Réservation en ligne
(13, 1), (13, 19), (13, 13), (13, 8),
-- Arbr'o Parc Lisieux : Parking, Plein air, Nocturne, Groupe
(14, 1), (14, 19), (14, 18), (14, 9),
-- Pathé Caen : Parking, Accessible PMR, CB, Accès bus
(15, 1), (15, 2), (15, 14), (15, 15),
-- CGR Cherbourg : Accessible PMR, CB, Climatisation
(16, 2), (16, 14), (16, 6),
-- Le Bouchon Normand : Terrasse, CB, Réservation en ligne
(17, 5), (17, 14), (17, 8),
-- La Table du Marais : Terrasse, CB, Réservation en ligne, Salle privatisable
(18, 5), (18, 14), (18, 8), (18, 17),
-- Crêperie Ty Breizh : Terrasse, CB, Adapté enfants
(19, 5), (19, 14), (19, 13),
-- Thalasso Deauville : Parking, Vestiaires, Réservation en ligne, Restauration
(20, 1), (20, 7), (20, 8), (20, 10),
-- Spa O'Pure : Vestiaires, Réservation en ligne, CB, Climatisation
(21, 7), (21, 8), (21, 14), (21, 6),
-- Festyland : Parking, Adapté enfants, Restauration, Accessible PMR
(22, 1), (22, 13), (22, 10), (22, 2),
-- Zoo de Cerza : Parking, Adapté enfants, Restauration, Accessible PMR, Plein air
(23, 1), (23, 13), (23, 10), (23, 2), (23, 19),
-- Cité de la Mer : Parking, Accessible PMR, Restauration, CB, Accès bus
(24, 1), (24, 2), (24, 10), (24, 14), (24, 15),
-- Mémorial de Caen : Parking, Accessible PMR, Restauration, CB, Wifi
(25, 1), (25, 2), (25, 10), (25, 14), (25, 3);

-- =============================================================
-- COMPANIES (3)
-- =============================================================
DELETE FROM `company`;
INSERT INTO `company` (`idcompany`, `name`, `description`) VALUES
(1, 'Normandie Loisirs SAS', 'Groupe normand de loisirs indoor : bowling, laser game et escape game dans le Calvados.'),
(2, 'Aventure & Nature Normandie', 'Spécialiste des activités plein air en Normandie : accrobranche, paintball et parcours aventure.'),
(3, 'Saveurs & Détente Normande', 'Restauration et bien-être en pays d''Auge et côte Fleurie.');

-- =============================================================
-- COMPANY_ACTIVITY
-- =============================================================
DELETE FROM `company_activity`;
INSERT INTO `company_activity` (`idcompany`, `idactivity`) VALUES
-- Normandie Loisirs : Bowling Caen, Bowling Mondeville, Laser Game Caen, Escape Hunt Caen
(1, 1), (1, 2), (1, 8), (1, 5),
-- Aventure & Nature : Accrobranche Caen, Accrobranche Deauville, Paintball Normandie
(2, 12), (2, 13), (2, 10),
-- Saveurs & Détente : Le Bouchon Normand, Crêperie Honfleur, Spa O'Pure
(3, 17), (3, 19), (3, 21);

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;
