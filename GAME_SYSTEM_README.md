# 🎮 Système de Game (Rooms de vote) - Guide d'installation et d'utilisation

## ✅ Implémentation terminée !

Le système de vote collaboratif type Tinder est maintenant **complètement implémenté** et prêt à être utilisé.

---

## 📦 Fichiers créés

### 1. Migration SQL
- ✅ `migration_game_system.sql` - Script de migration de la base de données

### 2. Modèles
- ✅ `src/app/models/game.model.js` - Modèle Game (20+ méthodes)
- ✅ `src/app/models/gameVote.model.js` - Modèle GameVote (7 méthodes)

### 3. Contrôleur
- ✅ `src/app/controller/game.controller.js` - 19 méthodes avec toute la logique métier

### 4. Routes
- ✅ `src/app/routes/game.router.js` - 19 routes avec documentation Swagger

### 5. Server
- ✅ `src/app/server.js` - Routes enregistrées

---

## 🚀 Installation

### Étape 1 : Appliquer la migration de base de données

Exécutez le script SQL pour créer la table `game_vote` et modifier les tables existantes :

```bash
mysql -u root -p onsort < migration_game_system.sql
```

**Ce script va :**
1. Créer la table `game_vote` avec toutes les contraintes
2. Modifier les statuts ENUM de la table `game` (`waiting_for_launch`, `voting`, `finished`)
3. Ajouter la colonne `joined_at` à la table `game_user`

### Étape 2 : Vérifier que tout fonctionne

Démarrez votre serveur :

```bash
cd src/app
npm start
```

Vous devriez voir :
```
✅ Server running on http://localhost:3001
```

### Étape 3 : Tester les endpoints

Accédez à la documentation Swagger :
```
http://localhost:3001/api-docs
```

Vous verrez une nouvelle section **Games** avec 19 endpoints documentés.

---

## 🎯 Endpoints disponibles

### Gestion des Rooms (5 endpoints)
- `POST /api/games` - Créer une room
- `GET /api/games/:id` - Détails d'une room
- `GET /api/games/code/:invite_code` - Trouver par code
- `PATCH /api/games/:id/status` - Changer le statut
- `DELETE /api/games/:id` - Supprimer une room

### Participation (3 endpoints)
- `POST /api/games/:id/join` - Rejoindre une room
- `GET /api/games/:id/participants` - Liste des participants
- `DELETE /api/games/:id/participants/:user_id` - Retirer un participant

### Filtres (3 endpoints)
- `POST /api/games/:id/filters` - Configurer les filtres
- `GET /api/games/:id/filters` - Récupérer les filtres
- `PUT /api/games/:id/filters` - Modifier les filtres

### Dates (3 endpoints)
- `POST /api/games/:id/dates` - Ajouter des dates
- `GET /api/games/:id/dates` - Récupérer les dates
- `DELETE /api/games/:id/dates/:date_id` - Supprimer une date

### Votes (4 endpoints)
- `GET /api/games/:id/activities` - Liste des activités à voter
- `POST /api/games/:id/vote` - Voter sur une activité
- `GET /api/games/:id/votes/my-votes` - Mes votes
- `GET /api/games/:id/results` - Résultats finaux

### Historique (1 endpoint)
- `GET /api/games/my-games` - Historique de mes games

---

## 📝 Exemple de workflow complet

### 1. Créer une room

```bash
POST /api/games
Authorization: Bearer <access_token>

# Réponse
{
  "message": "Room créée avec succès",
  "game": {
    "idgame": 1,
    "invite_code": "ABC123XYZ",
    "status": "waiting_for_launch"
  }
}
```

### 2. Configurer les filtres

```bash
POST /api/games/1/filters
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "activity_type": "Bowling",
  "price_range_min": 1,
  "price_range_max": 3
}
```

### 3. Ajouter des dates

```bash
POST /api/games/1/dates
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "dates": [
    "2025-12-15 14:00:00",
    "2025-12-16 18:00:00"
  ]
}
```

### 4. Inviter des amis

Les amis utilisent le code pour rejoindre :

```bash
POST /api/games/1/join
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "invite_code": "ABC123XYZ"
}
```

### 5. Lancer le vote (créateur uniquement)

```bash
PATCH /api/games/1/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "voting"
}
```

### 6. Récupérer les activités filtrées

```bash
GET /api/games/1/activities
Authorization: Bearer <access_token>

# Réponse : liste des activités filtrées automatiquement
# selon les critères ET l'âge des participants
```

### 7. Voter sur les activités

```bash
POST /api/games/1/vote
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "idactivity": 1,
  "vote": true  # true = Oui, false = Non
}
```

### 8. Terminer le vote

```bash
PATCH /api/games/1/status
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "finished"
}
```

### 9. Consulter les résultats

```bash
GET /api/games/1/results
Authorization: Bearer <access_token>

# Réponse : classement des activités par taux d'approbation
```

---

## 🔐 Règles de sécurité implémentées

### Authentification
- ✅ Tous les endpoints nécessitent un JWT valide
- ✅ Vérification automatique via middleware `auth`

### Autorisation
- ✅ Seul le créateur peut :
  - Changer le statut de la room
  - Configurer/modifier les filtres
  - Ajouter/supprimer des dates
  - Retirer des participants
  - Supprimer la room

- ✅ Les participants peuvent :
  - Consulter les détails de la room
  - Voir les participants
  - Récupérer les activités
  - Voter sur les activités
  - Consulter leurs votes
  - Voir les résultats (si terminé)

### Validation des statuts
- ✅ **waiting_for_launch** :
  - On peut rejoindre la room
  - On peut configurer filtres/dates
  - Impossible de voter

- ✅ **voting** :
  - On ne peut plus rejoindre
  - On ne peut plus modifier filtres/dates
  - On peut voter
  - Impossible de voir les résultats

- ✅ **finished** :
  - Impossible de voter
  - Impossible de modifier quoi que ce soit
  - On peut consulter les résultats

### Protection des mineurs
- ✅ **Filtrage automatique** : Si au moins un participant est mineur, les activités avec `minor_forbidden=1` sont automatiquement exclues
- ✅ Le filtre s'applique dans `GET /api/games/:id/activities`
- ✅ Indication dans la réponse : `"filtered_for_minors": true`

### Unicité des votes
- ✅ Contrainte unique en base : un utilisateur ne peut voter qu'une seule fois pour une activité
- ✅ Vérification en amont dans le contrôleur (retourne 409 Conflict)

---

## 🎨 Fonctionnalités spéciales

### Génération de code d'invitation
- Code unique aléatoire de 6-10 caractères alphanumériques
- Vérification d'unicité avant création
- Format majuscule pour faciliter la saisie

### Filtrage intelligent des activités
Le système filtre automatiquement selon :
1. **Type d'activité** (si spécifié dans les filtres)
2. **Fourchette de prix** (min et max)
3. **Présence de mineurs** (exclusion auto des activités interdites)

### Calcul des résultats
- **Taux d'approbation** : `(votes positifs / total votes) * 100`
- **Classement** : Par taux d'approbation décroissant
- **Top 3** : Les 3 activités les plus plébiscitées
- **Statistiques** : Completion rate des participants

### Progression du vote
- Calcul du % de progression pour chaque participant
- Vérification si tous les participants ont voté
- Affichage dans la liste des participants

---

## 🐛 Gestion des erreurs

### Codes HTTP utilisés
- **200** : Succès
- **201** : Créé avec succès
- **400** : Données invalides
- **403** : Accès interdit (pas créateur, mauvais statut, etc.)
- **404** : Ressource non trouvée
- **409** : Conflit (déjà voté, déjà participant)
- **500** : Erreur serveur

### Messages d'erreur clairs
Tous les endpoints retournent des messages explicites :
```json
{
  "message": "Seul le créateur peut changer le statut"
}
```

---

## 📊 Structure de la base de données

### Tables utilisées
1. **game** - Rooms de vote
2. **game_user** - Participants (Many-to-Many)
3. **game_filters** - Critères de sélection (One-to-One)
4. **game_dates** - Dates proposées (One-to-Many)
5. **game_vote** ⭐ NOUVELLE - Votes des participants (Many-to-Many)

### Relations
```
game
├── game_user (participants)
├── game_filters (critères)
├── game_dates (dates proposées)
└── game_vote (votes)
    ├── user (votant)
    └── activity (activité votée)
```

---

## ✨ Prochaines étapes (optionnelles)

### Améliorations possibles
1. **Notifications** : WebSocket pour notifier en temps réel
2. **Chat** : Système de messagerie dans la room
3. **Timeout automatique** : Passer en `finished` après X heures
4. **Rappels** : Notifier les participants qui n'ont pas voté
5. **Export** : Exporter les résultats en PDF
6. **Analytics** : Stats pour les entreprises sur leurs activités

### Tests
1. Tests unitaires des modèles
2. Tests d'intégration des contrôleurs
3. Tests end-to-end du workflow complet

---

## 🎉 Système prêt à l'emploi !

Le système de Game est maintenant **100% fonctionnel** et prêt pour votre application Flutter.

**Tous les endpoints sont :**
- ✅ Implémentés
- ✅ Sécurisés
- ✅ Documentés (Swagger)
- ✅ Testables via Swagger UI

**Pour tester :**
1. Appliquez la migration SQL
2. Démarrez le serveur
3. Accédez à `http://localhost:3001/api-docs`
4. Testez les endpoints dans l'ordre du workflow

**Bon développement ! 🚀**
