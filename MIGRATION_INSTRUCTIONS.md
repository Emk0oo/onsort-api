# 🔧 Instructions de Migration - Correction du Système de Game

## ✅ Problème résolu

**Erreur initiale :**
```
{
  "error": "Champ 'activity_type' inconnu dans field list"
}
```

**Cause :** Incohérence entre la structure de la base de données et le code de l'application.

---

## 📋 Changements effectués

### 1. **Migration SQL** (`migration_game_system.sql`)
- ✅ Suppression des colonnes obsolètes de `game_filters`:
  - `activity_type` (VARCHAR)
  - `price_range_min` (INT)
  - `price_range_max` (INT)
- ✅ Conservation uniquement de:
  - `allowed_prices` (JSON) - tableau des prix autorisés [1,2,3]
  - `location` (VARCHAR) - localisation

### 2. **Modèle Game** (`src/app/models/game.model.js`)
- ✅ Méthode `createFilters()` mise à jour pour utiliser `allowed_prices` et `location`
- ✅ Méthode `updateFilters()` mise à jour (appelle `createFilters`)

### 3. **Contrôleur Game** (`src/app/controller/game.controller.js`)
- ✅ Suppression des endpoints obsolètes `createFilters()` et `updateFilters()`
- ✅ Méthode `getFilters()` mise à jour pour retourner:
  - Prix autorisés (JSON parsé)
  - Localisation
  - Types d'activité (via `game_activity_types`)
- ✅ `createGame()` déjà correct (configuration lors de la création)

### 4. **Router Game** (`src/app/routes/game.router.js`)
- ✅ Documentation Swagger de `GET /games/:id/filters` mise à jour avec la nouvelle structure de réponse

### 5. **Documentation**
- ✅ `API_DOCUMENTATION.md` - Exemples de payload mis à jour
- ✅ `GAME_SYSTEM_README.md` - Workflow corrigé

---

## 🚀 Étapes d'application

### Étape 1 : Appliquer la migration SQL

```bash
mysql -u root -p onsort < migration_game_system.sql
```

**Ce que fait cette migration :**
1. Supprime la colonne `activity_type` de `game_filters` (si elle existe)
2. Supprime les colonnes `price_range_min` et `price_range_max` (si elles existent)
3. Ajoute la colonne `allowed_prices` JSON (si elle n'existe pas déjà)
4. Crée la table `game_activity_types` (si elle n'existe pas)
5. Crée la table `game_vote` (si elle n'existe pas)
6. Crée la table `game_activity` (si elle n'existe pas)

### Étape 2 : Redémarrer le serveur

```bash
cd src/app
npm start
```

### Étape 3 : Tester le nouveau payload

**Endpoint :** `POST /api/games`

**Payload correct :**
```json
{
  "activity_types": [1],
  "allowed_prices": [1],
  "location": "Caen",
  "dates": [
    "2025-12-15 14:00:00",
    "2025-12-16 18:00:00"
  ]
}
```

**Réponse attendue :**
```json
{
  "message": "Room créée avec succès",
  "game": {
    "idgame": 1,
    "idcreator": 1,
    "invite_code": "ABC123XYZ",
    "status": "waiting_for_launch",
    "activities_count": 15,
    "activity_types": [1],
    "allowed_prices": [1],
    "dates_count": 2
  }
}
```

---

## 📊 Nouvelle structure de données

### Table `game_filters` (après migration)
```sql
CREATE TABLE `game_filters` (
  `idfilter` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `allowed_prices` json DEFAULT NULL COMMENT 'Array des prix autorisés ex: [1,2,3]',
  `location` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`idfilter`),
  KEY `idgame` (`idgame`)
)
```

### Table `game_activity_types` (nouvelle)
```sql
CREATE TABLE `game_activity_types` (
  `idgame` int NOT NULL,
  `idactivity_type` int NOT NULL,
  PRIMARY KEY (`idgame`, `idactivity_type`),
  KEY `idactivity_type` (`idactivity_type`)
)
```

---

## 🎯 Endpoints mis à jour

| Endpoint | Méthode | Changement |
|----------|---------|------------|
| `/api/games` | POST | ✅ Payload mis à jour avec `activity_types` et `allowed_prices` |
| `/api/games/:id/filters` | GET | ✅ Réponse inclut maintenant `activity_types`, `allowed_prices`, `location` |
| `/api/games/:id/filters` | POST | ❌ **SUPPRIMÉ** - Configuration lors de POST /api/games |
| `/api/games/:id/filters` | PUT | ❌ **SUPPRIMÉ** - Configuration lors de POST /api/games |

---

## 📝 Documentation Swagger

Accédez à la documentation interactive mise à jour :
```
http://localhost:3001/api-docs
```

Toutes les routes dans la section **Games** ont été mises à jour avec les nouveaux exemples.

---

## ✅ Vérifications post-migration

### 1. Vérifier la structure de la table
```sql
DESCRIBE game_filters;
```

**Résultat attendu :**
```
+----------------+--------------+------+-----+---------+----------------+
| Field          | Type         | Null | Key | Default | Extra          |
+----------------+--------------+------+-----+---------+----------------+
| idfilter       | int          | NO   | PRI | NULL    | auto_increment |
| idgame         | int          | NO   | MUL | NULL    |                |
| allowed_prices | json         | YES  |     | NULL    |                |
| location       | varchar(255) | YES  |     | NULL    |                |
+----------------+--------------+------+-----+---------+----------------+
```

### 2. Vérifier la table game_activity_types
```sql
DESCRIBE game_activity_types;
```

**Résultat attendu :**
```
+------------------+------+------+-----+---------+-------+
| Field            | Type | Null | Key | Default | Extra |
+------------------+------+------+-----+---------+-------+
| idgame           | int  | NO   | PRI | NULL    |       |
| idactivity_type  | int  | NO   | PRI | NULL    |       |
+------------------+------+------+-----+---------+-------+
```

### 3. Tester la création d'une room
Utilisez Swagger ou curl :
```bash
curl -X POST http://localhost:3001/api/games \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activity_types": [1],
    "allowed_prices": [1, 2],
    "location": "Caen",
    "dates": ["2025-12-15 14:00:00"]
  }'
```

---

## 🎉 Résultat

✅ Plus d'erreur "Champ 'activity_type' inconnu"
✅ Structure de données cohérente
✅ Documentation à jour
✅ Swagger fonctionnel avec exemples corrects
✅ Architecture plus flexible (support de plusieurs types d'activité)

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez que la migration SQL s'est bien exécutée sans erreur
2. Vérifiez que le serveur a bien redémarré
3. Consultez les logs du serveur pour identifier l'erreur
4. Vérifiez la structure des tables avec `DESCRIBE table_name`

**Date de migration :** 2025-11-06
**Version :** 2.0.0
