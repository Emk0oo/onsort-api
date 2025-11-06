# Documentation API Onsort

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du projet](#architecture-du-projet)
3. [Configuration](#configuration)
4. [Authentification](#authentification)
5. [Endpoints disponibles](#endpoints-disponibles)
   - [Users](#users)
   - [Roles](#roles)
   - [Companies](#companies)
   - [Activities](#activities)
   - [Pictures](#pictures)
   - [Games (Rooms de vote)](#games-rooms-de-vote)
6. [Système de vote et règles métier](#système-de-vote-et-règles-métier)
7. [Modèles de données](#modèles-de-données)
8. [Middleware](#middleware)
9. [Guide de démarrage](#guide-de-démarrage)
10. [Documentation Swagger](#documentation-swagger)
11. [Points forts et améliorations](#points-forts-et-améliorations)

---

## Vue d'ensemble

**Onsort API** est une API REST complète pour une **application de sondage d'activités entre amis** avec interface Flutter.

### 🎯 Concept de l'application

**Onsort** permet à des groupes d'amis de choisir ensemble une activité de loisirs via un système de vote collaboratif type "Tinder" :

1. Un utilisateur **crée une room** et configure les critères (prix, type d'activité, dates)
2. Il **invite ses amis** avec un code unique
3. Chaque participant **vote** sur les activités proposées (swipe gauche/droite)
4. À la fin, un **récapitulatif** affiche les activités les plus populaires

### ✨ Fonctionnalités principales

- **Authentification JWT** (access + refresh tokens)
- **Gestion des utilisateurs** avec détection automatique de minorité
- **Système de Rooms/Games** avec codes d'invitation et workflow de statuts
- **Vote collaboratif** type Tinder (swipe oui/non)
- **Filtrage intelligent** des activités selon critères et âge des participants
- **Gestion des entreprises** et leurs activités
- **Système de reviews** et notations
- **Upload d'images**
- **Horaires d'ouverture** flexibles
- **Protection des mineurs** avec filtrage automatique

### 🔄 Workflow d'une Room

```
1. CRÉATION (status: waiting_for_launch)
   └─> Le créateur configure les filtres (prix, type, dates)
   └─> Génération d'un code d'invitation unique

2. INVITATION
   └─> Les amis rejoignent avec le code
   └─> Possible uniquement en statut "waiting_for_launch"

3. LANCEMENT DU VOTE (status: voting)
   └─> Seul le créateur peut lancer
   └─> Impossible de rejoindre après le lancement
   └─> Sélection automatique des activités selon critères
   └─> Filtrage automatique si mineurs présents

4. VOTE
   └─> Chaque participant vote sur TOUTES les activités
   └─> Swipe gauche = Non, Swipe droite = Oui

5. RÉSULTATS (status: finished)
   └─> Fin automatique après un certain temps
   └─> Récapitulatif avec classement par % de votes positifs
   └─> Historique conservé pour consultation
```

### 🛠️ Technologies

- **Node.js + Express.js** - Backend REST API
- **MySQL avec mysql2/promise** - Base de données relationnelle
- **JWT** - Authentification sécurisée
- **Multer** - Upload de fichiers
- **Bcrypt** - Hashage des mots de passe
- **Swagger** - Documentation interactive

---

## Architecture du projet

```
onsort-api/
├── src/
│   ├── app/
│   │   ├── config/
│   │   │   └── db.js                      # Configuration de la connexion MySQL
│   │   ├── controller/
│   │   │   ├── activity.controller.js     # Logique métier des activités
│   │   │   ├── company.controller.js      # Logique métier des entreprises
│   │   │   ├── openingHour.controller.js  # Logique des horaires
│   │   │   ├── picture.controller.js      # Gestion des images
│   │   │   ├── role.controller.js         # Gestion des rôles
│   │   │   ├── user.controller.js         # Authentification et users
│   │   │   ├── userReview.controller.js   # Gestion des avis
│   │   │   └── game.controller.js         # Logique du système de vote (à implémenter)
│   │   ├── middleware/
│   │   │   ├── auth.js                    # Vérification des JWT access tokens
│   │   │   ├── refreshAuth.js             # Vérification des refresh tokens
│   │   │   ├── role.js                    # Autorisation par rôle
│   │   │   └── upload.js                  # Configuration Multer
│   │   ├── models/
│   │   │   ├── activity.model.js          # Accès données activités
│   │   │   ├── activityOpeningHour.model.js
│   │   │   ├── company.model.js
│   │   │   ├── feature.model.js
│   │   │   ├── picture.model.js
│   │   │   ├── role.model.js
│   │   │   ├── user.model.js
│   │   │   ├── userReviewActivity.model.js
│   │   │   ├── game.model.js              # Accès données games (à implémenter)
│   │   │   └── gameVote.model.js          # Accès données votes (à implémenter)
│   │   ├── routes/
│   │   │   ├── activity.router.js         # Routes des activités
│   │   │   ├── company.router.js          # Routes des entreprises
│   │   │   ├── picture.router.js          # Routes des images
│   │   │   ├── role.router.js             # Routes des rôles
│   │   │   ├── user.router.js             # Routes des utilisateurs
│   │   │   └── game.router.js             # Routes des games (à implémenter)
│   │   ├── uploads/                       # Dossier de stockage des images
│   │   └── server.js                      # Point d'entrée principal
│   └── bdd-dump/
│       └── onsort15_10_25.sql            # Schéma de la base de données
└── package.json
```

---

## Configuration

### Variables d'environnement (.env)

```env
# Base de données
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=onsort
DB_PORT=3306

# JWT
JWT_SECRET=votre_secret_jwt
JWT_REFRESH_SECRET=votre_secret_refresh  # Optionnel, sinon utilise JWT_SECRET

# Serveur
API_PORT=3001
```

### Connexion à la base de données

- **Pool de connexions** : 10 connexions max
- **Auto-reconnexion** : Activée
- **Charset** : utf8mb4
- **Driver** : mysql2/promise (support async/await)

---

## Authentification

### Système JWT

L'API utilise un système de double token :

**Access Token :**
- Durée de vie : 15 minutes
- Utilisation : Authentification des requêtes API
- Header : `Authorization: Bearer <access_token>`

**Refresh Token :**
- Durée de vie : 7 jours
- Utilisation : Renouveler l'access token
- Endpoint dédié : `POST /api/users/refresh`

### Contenu des tokens

```json
{
  "id": 1,
  "email": "user@example.com",
  "role": 1,
  "is_minor": 0
}
```

### Flow d'authentification

1. **Inscription** → `POST /api/users/register` → Retourne access + refresh tokens
2. **Connexion** → `POST /api/users/login` → Retourne access + refresh tokens
3. **Utilisation** → Ajouter `Authorization: Bearer <access_token>` dans les headers
4. **Expiration** → Utiliser `POST /api/users/refresh` avec le refresh token
5. **Déconnexion** → `POST /api/users/logout` (côté client, supprimer les tokens)

---

## Endpoints disponibles

### Users

**Base URL :** `/api/users`

| Méthode | Endpoint | Auth | Admin | Description |
|---------|----------|------|-------|-------------|
| POST | `/register` | ❌ | ❌ | Inscription d'un nouvel utilisateur |
| POST | `/login` | ❌ | ❌ | Connexion utilisateur |
| GET | `/profile` | ✅ | ❌ | Récupérer le profil de l'utilisateur connecté |
| GET | `/user/:id` | ✅ | ❌ | Récupérer un utilisateur par ID (soi-même uniquement) |
| PUT | `/user/:id` | ✅ | ❌ | Modifier un utilisateur (soi-même uniquement) |
| DELETE | `/user/:id` | ✅ | ✅ | Supprimer un utilisateur (admin seulement) |
| POST | `/refresh` | 🔄 | ❌ | Renouveler l'access token |
| POST | `/logout` | ✅ | ❌ | Déconnexion |
| PATCH | `/:id/password` | ✅ | ❌ | Modifier le mot de passe |

#### Détails des endpoints Users

**POST /api/users/register**
```json
// Request Body
{
  "name": "John",
  "surname": "Doe",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "password123",
  "date_of_birth": "2000-01-15"
}

// Response (201 Created)
{
  "message": "Utilisateur créé avec succès",
  "userId": 1,
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**POST /api/users/login**
```json
// Request Body
{
  "email": "john.doe@example.com",
  "password": "password123"
}

// Response (200 OK)
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John",
    "surname": "Doe",
    "is_minor": 0,
    "role": "User"
  }
}
```

**PATCH /api/users/:id/password**
```json
// Request Body
{
  "old_password": "password123",
  "new_password": "newpassword456"
}

// Response (200 OK)
{
  "message": "Mot de passe modifié avec succès"
}
```

---

### Roles

**Base URL :** `/api/roles`

| Méthode | Endpoint | Auth | Admin | Description |
|---------|----------|------|-------|-------------|
| GET | `/` | ✅ | ❌ | Récupérer tous les rôles |
| GET | `/:id` | ✅ | ❌ | Récupérer un rôle par ID |
| POST | `/` | ✅ | ✅ | Créer un nouveau rôle |
| PUT | `/:id` | ✅ | ✅ | Modifier un rôle |
| DELETE | `/:id` | ✅ | ✅ | Supprimer un rôle |

#### Rôles disponibles

- `idrole: -1` → Admin
- `idrole: 1` → User
- `idrole: 2` → User_company

---

### Companies

**Base URL :** `/api/companies`

| Méthode | Endpoint | Auth | Admin | Description |
|---------|----------|------|-------|-------------|
| GET | `/` | ✅ | ❌ | Récupérer toutes les entreprises |
| GET | `/my` | ✅ | ❌ | Récupérer l'entreprise de l'utilisateur connecté |
| GET | `/:id` | ✅ | ❌ | Récupérer une entreprise par ID |
| POST | `/` | ✅ | ❌ | Créer une entreprise |
| PUT | `/:id` | ✅ | ❌ | Modifier une entreprise |
| DELETE | `/:id` | ✅ | ❌ | Supprimer une entreprise |
| GET | `/:id/activities` | ✅ | ❌ | Récupérer les activités d'une entreprise |

#### Exemple Company

```json
// POST /api/companies
{
  "name": "Bowling de Caen",
  "description": "Centre de bowling familial"
}

// Response
{
  "message": "Entreprise créée avec succès",
  "companyId": 1
}
```

---

### Activities

**Base URL :** `/api/activities`

| Méthode | Endpoint | Auth | Admin | Description |
|---------|----------|------|-------|-------------|
| GET | `/` | ✅ | ❌ | Récupérer toutes les activités (avec filtres) |
| GET | `/:id` | ✅ | ❌ | Récupérer une activité par ID |
| POST | `/` | ✅ | ❌ | Créer une activité |
| PUT | `/:id` | ✅ | ❌ | Modifier une activité |
| DELETE | `/:id` | ✅ | ❌ | Supprimer une activité |

#### Paramètres de requête (GET)

- `is_minor` (0 ou 1) : Filtre les activités interdites aux mineurs
- `include` : Données à inclure (opening_hours, reviews)

#### Features (Caractéristiques)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/:id/features` | ✅ | Récupérer les features d'une activité |
| POST | `/:id/features` | ✅ | Ajouter/modifier des features |
| DELETE | `/:id/features/:featureName` | ✅ | Supprimer une feature |

**POST /api/activities/:id/features**
```json
{
  "features": ["Bar sur place", "Parking gratuit", "WiFi"]
}
```

#### Horaires d'ouverture

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/opening_hours/:id` | ✅ | Récupérer les horaires d'une activité |
| POST | `/opening_hours/activity/:id` | ✅ | Créer des horaires |
| PUT | `/opening_hours/activity/:id` | ✅ | Modifier les horaires |
| DELETE | `/opening_hours/:id_hour` | ✅ | Supprimer un horaire spécifique |

**POST /api/activities/opening_hours/activity/:id**
```json
{
  "day_of_week": "lundi,mardi,mercredi",  // Jours séparés par virgule
  "opening_morning": "09:00:00",
  "closing_morning": "12:00:00",
  "opening_afternoon": "14:00:00",
  "closing_afternoon": "18:00:00"
}
```

#### Reviews (Avis)

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/:id/reviews` | ✅ | Créer un avis |
| GET | `/:id/reviews` | ✅ | Récupérer tous les avis d'une activité |
| GET | `/:id/reviews/:id_review` | ✅ | Récupérer un avis spécifique |
| DELETE | `/:id/reviews/:id_review` | ✅ | Supprimer un avis |

**POST /api/activities/:id/reviews**
```json
{
  "rating": 5,        // Entre 1 et 5
  "title": "Excellent !",
  "comment": "Très bonne expérience, je recommande !"
}

// Response
{
  "message": "Avis créé avec succès",
  "reviewId": 1
}
```

#### Exemple Activity complet

```json
// GET /api/activities/1
{
  "idactivity": 1,
  "name": "Bowling Caen",
  "description": "Bowling sur piste intérieur, soirée ambiance",
  "minor_forbidden": 0,
  "address": "2 rue de l'avenue",
  "price_range": 1,
  "idactivity_type": 1,
  "activity_type_name": "Bowling",
  "pictures": [
    {
      "idpicture": 1,
      "url": "uploads/image-1758206044355-422057553.jpg",
      "alt": "Photo du bowling"
    }
  ],
  "opening_hours": [
    {
      "id": 1,
      "day_of_week": "Lundi",
      "opening_morning": "09:00:00",
      "closing_morning": "12:00:00",
      "opening_afternoon": "14:00:00",
      "closing_afternoon": "18:00:00"
    }
  ],
  "features": [
    {
      "idfeature": 1,
      "name": "22 pistes de jeu"
    },
    {
      "idfeature": 2,
      "name": "Bar sur place"
    }
  ]
}
```

---

### Pictures

**Base URL :** `/api/pictures`

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/` | ✅ | Récupérer toutes les images |
| GET | `/:id` | ✅ | Récupérer une image par ID |
| GET | `/activity/:activityId` | ✅ | Récupérer les images d'une activité |
| POST | `/` | ✅ | Upload d'une image |
| PUT | `/:id` | ✅ | Modifier une image |
| DELETE | `/:id` | ✅ | Supprimer une image |

#### Upload d'image

**POST /api/pictures**

```
Content-Type: multipart/form-data

Fields:
- image: File (obligatoire, max 5MB, images uniquement)
- alt: String (optionnel, texte alternatif)
- idactivity: Integer (optionnel, associe l'image à une activité)
```

**Exemple avec curl :**
```bash
curl -X POST http://localhost:3001/api/pictures \
  -H "Authorization: Bearer <token>" \
  -F "image=@/path/to/image.jpg" \
  -F "alt=Photo du bowling" \
  -F "idactivity=1"
```

**Response :**
```json
{
  "message": "Image uploadée avec succès",
  "pictureId": 1,
  "url": "uploads/image-1758206044355-422057553.jpg"
}
```

---

### Games (Rooms de vote)

**Base URL :** `/api/games`

> **Note :** Cette section documente les endpoints qui seront implémentés pour le système de sondage collaboratif.

#### Gestion des Rooms

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/` | ✅ | Créer une nouvelle room |
| GET | `/:id` | ✅ | Récupérer les détails d'une room |
| GET | `/code/:invite_code` | ✅ | Trouver une room par son code d'invitation |
| GET | `/my-games` | ✅ | Historique des rooms de l'utilisateur |
| POST | `/:id/join` | ✅ | Rejoindre une room avec le code |
| PATCH | `/:id/status` | ✅ | Changer le statut de la room (créateur uniquement) |
| DELETE | `/:id` | ✅ | Supprimer une room (créateur uniquement) |

#### Configuration des filtres

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/:id/filters` | ✅ | Configurer les critères de sélection (créateur) |
| GET | `/:id/filters` | ✅ | Récupérer les filtres d'une room |
| PUT | `/:id/filters` | ✅ | Modifier les filtres (créateur, uniquement en waiting_for_launch) |

#### Gestion des dates proposées

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| POST | `/:id/dates` | ✅ | Ajouter des dates proposées (créateur) |
| GET | `/:id/dates` | ✅ | Récupérer les dates d'une room |
| DELETE | `/:id/dates/:date_id` | ✅ | Supprimer une date (créateur) |

#### Activités et votes

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/:id/activities` | ✅ | Liste des activités à voter (filtrées automatiquement) |
| POST | `/:id/vote` | ✅ | Voter sur une activité (oui/non) |
| GET | `/:id/votes/my-votes` | ✅ | Mes votes pour cette room |
| GET | `/:id/results` | ✅ | Récapitulatif des votes (disponible après statut finished) |

#### Participants

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/:id/participants` | ✅ | Liste des participants de la room |
| DELETE | `/:id/participants/:user_id` | ✅ | Retirer un participant (créateur uniquement) |

---

#### Détails des endpoints Games

**POST /api/games** - Créer une room avec configuration et sélection automatique des activités
```json
// Request Body
{
  "activity_types": [1, 2],           // Obligatoire, IDs des types d'activité
  "allowed_prices": [1, 2, 3],        // Obligatoire, Prix autorisés (1-5)
  "location": "Caen",                 // Optionnel, localisation
  "dates": [                          // Optionnel, dates proposées
    "2025-12-15 14:00:00",
    "2025-12-16 18:00:00"
  ]
}

// Response (201 Created)
{
  "message": "Room créée avec succès",
  "game": {
    "idgame": 1,
    "idcreator": 1,
    "invite_code": "ABC123XYZ",
    "status": "waiting_for_launch",
    "activities_count": 15,
    "activity_types": [1, 2],
    "allowed_prices": [1, 2, 3],
    "dates_count": 2
  }
}

// Error si aucune activité ne correspond (400 Bad Request)
{
  "message": "Aucune activité ne correspond aux critères sélectionnés. Veuillez ajuster vos filtres."
}
```

**Note:** Les endpoints POST/PUT `/api/games/:id/filters` ont été supprimés. La configuration des filtres se fait maintenant directement lors de la création de la room.

**POST /api/games/:id/dates** - Ajouter des dates (Obsolète - utiliser le champ dates lors de POST /games)
```json
// Request Body
{
  "dates": [
    "2025-12-15 14:00:00",
    "2025-12-16 18:00:00",
    "2025-12-20 20:00:00"
  ]
}

// Response (201 Created)
{
  "message": "Dates ajoutées avec succès",
  "count": 3
}
```

**POST /api/games/:id/join** - Rejoindre une room
```json
// Request Body
{
  "invite_code": "ABC123XYZ"
}

// Response (200 OK)
{
  "message": "Vous avez rejoint la room avec succès",
  "game": {
    "idgame": 1,
    "status": "waiting_for_launch",
    "creator": "John Doe",
    "participants_count": 5
  }
}

// Error si statut != waiting_for_launch (403 Forbidden)
{
  "error": "Impossible de rejoindre, la room a déjà démarré"
}
```

**PATCH /api/games/:id/status** - Changer le statut
```json
// Request Body
{
  "status": "voting"  // waiting_for_launch, voting, ou finished
}

// Response (200 OK)
{
  "message": "Statut mis à jour avec succès",
  "status": "voting"
}

// Règles de transition :
// - waiting_for_launch → voting : Seul le créateur
// - voting → finished : Automatique après timeout OU créateur manuellement
// - Impossible de revenir en arrière
```

**GET /api/games/:id/activities** - Activités à voter
```json
// Response (200 OK)
{
  "activities": [
    {
      "idactivity": 1,
      "name": "Bowling Caen",
      "description": "Bowling sur piste intérieur",
      "address": "2 rue de l'avenue",
      "price_range": 1,
      "minor_forbidden": 0,
      "activity_type_name": "Bowling",
      "pictures": [...],
      "features": [...],
      "opening_hours": [...],
      "matches_dates": true  // true si disponible à au moins une des dates proposées
    }
  ],
  "total": 15,
  "filtered_for_minors": true  // true si au moins un participant est mineur
}

// Note : Activités filtrées automatiquement selon :
// 1. Les critères définis (type, prix)
// 2. La présence de mineurs dans la room
// 3. La disponibilité aux dates proposées (opening_hours)
```

**POST /api/games/:id/vote** - Voter sur une activité
```json
// Request Body
{
  "idactivity": 1,
  "vote": true  // true = Oui (swipe droite), false = Non (swipe gauche)
}

// Response (201 Created)
{
  "message": "Vote enregistré avec succès"
}

// Error si déjà voté (409 Conflict)
{
  "error": "Vous avez déjà voté pour cette activité"
}

// Error si statut != voting (403 Forbidden)
{
  "error": "Le vote n'est pas encore ouvert"
}
```

**GET /api/games/:id/votes/my-votes** - Mes votes
```json
// Response (200 OK)
{
  "votes": [
    {
      "idactivity": 1,
      "activity_name": "Bowling Caen",
      "vote": true,
      "voted_at": "2025-11-05T14:30:00Z"
    },
    {
      "idactivity": 2,
      "activity_name": "Karting Pont-L'évêque",
      "vote": false,
      "voted_at": "2025-11-05T14:31:00Z"
    }
  ],
  "total_activities": 15,
  "voted_count": 2,
  "progress_percentage": 13
}
```

**GET /api/games/:id/results** - Récapitulatif des votes
```json
// Response (200 OK)
// Disponible seulement si status = finished
{
  "game": {
    "idgame": 1,
    "status": "finished",
    "created_at": "2025-11-05T10:00:00Z",
    "finished_at": "2025-11-05T18:00:00Z",
    "total_participants": 8,
    "total_activities": 15
  },
  "results": [
    {
      "idactivity": 1,
      "name": "Bowling Caen",
      "description": "Bowling sur piste intérieur",
      "address": "2 rue de l'avenue",
      "price_range": 1,
      "pictures": [...],
      "total_votes": 8,
      "positive_votes": 7,
      "negative_votes": 1,
      "approval_rate": 87.5,  // Pourcentage de votes positifs
      "rank": 1
    },
    {
      "idactivity": 5,
      "name": "Escape Game Caen",
      "total_votes": 8,
      "positive_votes": 6,
      "negative_votes": 2,
      "approval_rate": 75.0,
      "rank": 2
    }
    // ... classement par approval_rate décroissant
  ],
  "top_3": [1, 5, 3],  // IDs des 3 activités les plus plébiscitées
  "voting_stats": {
    "all_participants_voted": true,
    "completion_rate": 100  // % de participants ayant voté sur toutes les activités
  }
}

// Error si status != finished (403 Forbidden)
{
  "error": "Les résultats ne sont pas encore disponibles"
}
```

**GET /api/games/my-games** - Historique des rooms
```json
// Response (200 OK)
{
  "games": [
    {
      "idgame": 1,
      "invite_code": "ABC123",
      "status": "finished",
      "is_creator": true,
      "created_at": "2025-11-05T10:00:00Z",
      "participants_count": 8,
      "activities_count": 15,
      "winner_activity": {
        "idactivity": 1,
        "name": "Bowling Caen",
        "approval_rate": 87.5
      }
    },
    {
      "idgame": 2,
      "invite_code": "XYZ789",
      "status": "voting",
      "is_creator": false,
      "creator_name": "Marie Dupont",
      "created_at": "2025-11-06T14:00:00Z",
      "participants_count": 5,
      "my_voting_progress": 40  // % d'activités sur lesquelles j'ai voté
    }
  ],
  "total": 2
}
```

**GET /api/games/:id/participants** - Liste des participants
```json
// Response (200 OK)
{
  "participants": [
    {
      "iduser": 1,
      "name": "John",
      "surname": "Doe",
      "is_creator": true,
      "is_minor": 0,
      "joined_at": "2025-11-05T10:00:00Z",
      "has_voted_all": true  // A voté sur toutes les activités (si status = voting)
    },
    {
      "iduser": 2,
      "name": "Jane",
      "surname": "Smith",
      "is_creator": false,
      "is_minor": 1,
      "joined_at": "2025-11-05T10:15:00Z",
      "has_voted_all": false,
      "voting_progress": 60  // % d'activités votées
    }
  ],
  "total": 8,
  "has_minors": true  // Important pour le filtrage des activités
}
```

---

## Système de vote et règles métier

### Statuts de la Room

Une room passe par 3 statuts distincts :

| Statut | Description | Actions possibles |
|--------|-------------|-------------------|
| `waiting_for_launch` | Room créée, en attente de participants | - Inviter des amis<br>- Configurer filtres/dates<br>- Rejoindre la room<br>- Modifier les paramètres |
| `voting` | Vote en cours | - Voter sur les activités<br>- Consulter la liste des activités<br>- Voir sa progression<br>- **IMPOSSIBLE de rejoindre** |
| `finished` | Vote terminé | - Consulter les résultats<br>- Voir le classement<br>- Accéder à l'historique |

### Transitions de statuts

```
waiting_for_launch ──[Créateur lance le vote]──> voting

voting ──[Timeout OU Créateur termine]──> finished

⚠️ Impossible de revenir en arrière
```

### Règles métier importantes

#### 1. Création et configuration
- ✅ N'importe quel utilisateur peut créer une room
- ✅ Code d'invitation unique généré automatiquement (6-10 caractères alphanumériques)
- ✅ Le créateur peut configurer les filtres et dates **uniquement** en statut `waiting_for_launch`
- ✅ Pas de limite de participants

#### 2. Rejoindre une room
- ✅ Possible uniquement si `status = waiting_for_launch`
- ❌ Impossible si `status = voting` ou `finished`
- ✅ Un utilisateur ne peut rejoindre qu'une seule fois la même room

#### 3. Lancement du vote
- ✅ **Seul le créateur** peut changer le statut de `waiting_for_launch` à `voting`
- ✅ Une fois lancé, impossible de modifier les filtres ou dates
- ✅ Impossible de rejoindre après le lancement

#### 4. Sélection des activités
- 🤖 **Sélection automatique** basée sur :
  - Type d'activité (si spécifié dans les filtres)
  - Fourchette de prix (si spécifiée)
  - Disponibilité à **au moins une** des dates proposées
  - **Filtrage automatique** des activités `minor_forbidden=1` si au moins un participant est mineur

#### 5. Processus de vote
- ✅ Chaque participant doit voter sur **TOUTES** les activités
- ✅ Vote binaire : Oui (swipe droite) ou Non (swipe gauche)
- ❌ Impossible de changer son vote une fois enregistré
- ✅ Possible uniquement si `status = voting`

#### 6. Résultats
- ✅ Calcul du taux d'approbation : `(votes positifs / total votes) * 100`
- ✅ Classement par taux d'approbation décroissant
- ✅ Accessible uniquement si `status = finished`
- ✅ Affichage du top 3 des activités les plus plébiscitées

#### 7. Fin de la room
- ⏱️ Transition automatique vers `finished` après un timeout (à définir, ex: 24h)
- ✅ Le créateur peut terminer manuellement
- ✅ Une fois terminée, la room est consultable dans l'historique

#### 8. Protection des mineurs
- 🔒 Si **au moins un participant** a `is_minor = 1` :
  - ❌ Exclusion automatique de toutes les activités avec `minor_forbidden = 1`
  - ℹ️ Indication dans la réponse : `"filtered_for_minors": true`
- ✅ Vérification effectuée à chaque appel de `GET /:id/activities`

#### 9. Historique
- ✅ Toutes les rooms (quel que soit le statut) sont conservées
- ✅ Un utilisateur peut consulter :
  - Les rooms qu'il a créées
  - Les rooms auxquelles il a participé
- ✅ Accès aux résultats des rooms terminées

---

## Modèles de données

### User

**Table :** `user`

| Champ | Type | Description |
|-------|------|-------------|
| iduser | INT (PK) | Identifiant unique |
| name | VARCHAR(50) | Prénom |
| surname | VARCHAR(50) | Nom de famille |
| email | VARCHAR(100) UNIQUE | Email (unique) |
| username | VARCHAR(50) | Nom d'utilisateur |
| password | VARCHAR(255) | Mot de passe hashé (bcrypt) |
| date_of_birth | DATE | Date de naissance |
| is_minor | TINYINT(1) | 1 si < 18 ans (calculé automatiquement) |
| is_active | TINYINT(1) | 1 si compte actif |
| idrole | INT (FK) | Référence vers role.idrole |

**Relations :**
- Appartient à un Role (Many-to-One)
- Peut être lié à plusieurs Companies (Many-to-Many via `user_company`)
- Peut créer plusieurs Games (One-to-Many)
- Peut écrire plusieurs Reviews (One-to-Many)

---

### Role

**Table :** `role`

| Champ | Type | Description |
|-------|------|-------------|
| idrole | INT (PK) | Identifiant unique |
| name | VARCHAR(50) | Nom du rôle |

**Rôles par défaut :**
- `-1` : Admin
- `1` : User
- `2` : User_company

---

### Company

**Table :** `company`

| Champ | Type | Description |
|-------|------|-------------|
| idcompany | INT (PK) | Identifiant unique |
| name | VARCHAR(100) | Nom de l'entreprise |
| description | TEXT | Description |

**Relations :**
- Peut avoir plusieurs Users (Many-to-Many via `user_company`)
- Peut proposer plusieurs Activities (Many-to-Many via `company_activity`)
- Peut avoir plusieurs Pictures (Many-to-Many via `company_picture`)

---

### Activity

**Table :** `activity`

| Champ | Type | Description |
|-------|------|-------------|
| idactivity | INT (PK) | Identifiant unique |
| name | VARCHAR(100) | Nom de l'activité |
| description | TEXT | Description |
| minor_forbidden | TINYINT(1) | 1 si interdit aux mineurs |
| address | VARCHAR(255) | Adresse physique |
| price_range | INT | Fourchette de prix (1-5) |
| idactivity_type | INT (FK) | Type d'activité |

**Relations :**
- Appartient à un ActivityType (Many-to-One)
- Peut avoir plusieurs Pictures (Many-to-Many via `activity_picture`)
- Peut avoir plusieurs Features (Many-to-Many via `activity_feature`)
- Peut avoir plusieurs OpeningHours (One-to-Many)
- Peut avoir plusieurs Reviews (One-to-Many)
- Peut être proposée par plusieurs Companies (Many-to-Many via `company_activity`)

---

### Activity_Type

**Table :** `activity_type`

| Champ | Type | Description |
|-------|------|-------------|
| idactivity_type | INT (PK) | Identifiant unique |
| name | VARCHAR(100) | Nom du type (ex: Bowling, Karting) |

---

### Feature

**Table :** `feature`

| Champ | Type | Description |
|-------|------|-------------|
| idfeature | INT (PK) | Identifiant unique |
| name | VARCHAR(100) | Nom de la caractéristique |

**Exemples :**
- "22 pistes de jeu"
- "Bar sur place"
- "Parking gratuit"
- "WiFi"

**Relations :**
- Peut être associée à plusieurs Activities (Many-to-Many via `activity_feature`)

---

### Activity_Opening_Hour

**Table :** `activity_opening_hour`

| Champ | Type | Description |
|-------|------|-------------|
| id | INT (PK) | Identifiant unique |
| idactivity | INT (FK) | Référence vers activity |
| day_of_week | ENUM | Lundi, Mardi, Mercredi, Jeudi, Vendredi, Samedi, Dimanche |
| opening_morning | TIME | Heure d'ouverture matin |
| closing_morning | TIME | Heure de fermeture matin |
| opening_afternoon | TIME | Heure d'ouverture après-midi |
| closing_afternoon | TIME | Heure de fermeture après-midi |

---

### Picture

**Table :** `picture`

| Champ | Type | Description |
|-------|------|-------------|
| idpicture | INT (PK) | Identifiant unique |
| url | VARCHAR(255) | Chemin du fichier |
| alt | VARCHAR(255) | Texte alternatif |

**Relations :**
- Peut être associée à plusieurs Activities (Many-to-Many via `activity_picture`)
- Peut être associée à plusieurs Companies (Many-to-Many via `company_picture`)

---

### User_Review_Activity

**Table :** `user_review_activity`

| Champ | Type | Description |
|-------|------|-------------|
| idreview | INT (PK) | Identifiant unique |
| idactivity | INT (FK) | Activité évaluée |
| iduser | INT (FK) | Utilisateur auteur |
| rating | INT | Note de 1 à 5 |
| title | VARCHAR(100) | Titre de l'avis |
| comment | TEXT | Commentaire |
| date | DATETIME | Date de création |

---

### Game (Room de vote)

**Table :** `game`

| Champ | Type | Description |
|-------|------|-------------|
| idgame | INT (PK) | Identifiant unique |
| idcreator | INT (FK) | Créateur de la room (référence vers user) |
| invite_code | VARCHAR(50) UNIQUE | Code d'invitation unique |
| status | ENUM | `waiting_for_launch`, `voting`, `finished` |
| created_at | DATETIME | Date de création |
| updated_at | DATETIME | Dernière modification |

**Relations :**
- Appartient à un créateur User (Many-to-One)
- Plusieurs participants (Many-to-Many via `game_user`)
- Plusieurs dates proposées (One-to-Many via `game_dates`)
- Des filtres de sélection (One-to-One via `game_filters`)
- Plusieurs votes (One-to-Many via `game_vote`)

**Statuts possibles :**
- `waiting_for_launch` : En attente de participants
- `voting` : Vote en cours
- `finished` : Terminé

---

### Game_User (Participants d'une room)

**Table :** `game_user`

| Champ | Type | Description |
|-------|------|-------------|
| idgame | INT (PK, FK) | Référence vers game |
| iduser | INT (PK, FK) | Référence vers user |
| is_creator | TINYINT(1) | 1 si créateur de la room |
| joined_at | DATETIME | Date de rejointe (à ajouter) |

**Relations :**
- Lie un User à un Game (table de jonction)

---

### Game_Dates (Dates proposées)

**Table :** `game_dates`

| Champ | Type | Description |
|-------|------|-------------|
| idgamedate | INT (PK) | Identifiant unique |
| idgame | INT (FK) | Référence vers game |
| date_option | DATETIME | Date et heure proposées |

**Relations :**
- Appartient à un Game (Many-to-One)

---

### Game_Filters (Critères de sélection)

**Table :** `game_filters`

| Champ | Type | Description |
|-------|------|-------------|
| idfilter | INT (PK) | Identifiant unique |
| idgame | INT (FK) | Référence vers game |
| allowed_prices | JSON | Prix autorisés ex: [1,2,3] |
| location | VARCHAR(255) | Localisation |

**Relations :**
- Appartient à un Game (One-to-One)

**Note importante :**
- Les **types d'activité** ne sont plus stockés ici mais dans la table `game_activity_types` (relation Many-to-Many)
- Les colonnes obsolètes `activity_type`, `price_range_min`, `price_range_max` ont été supprimées
- La nouvelle colonne `allowed_prices` stocke un tableau JSON des prix acceptés (plus flexible)

---

### Game_Activity_Types (Types d'activité sélectionnés)

**Table :** `game_activity_types`

| Champ | Type | Description |
|-------|------|-------------|
| idgame | INT (PK, FK) | Référence vers game |
| idactivity_type | INT (PK, FK) | Référence vers activity_type |

**Relations :**
- Many-to-Many entre Game et Activity_Type
- Permet de sélectionner plusieurs types d'activité par game

**Note :** Cette table remplace l'ancien champ `activity_type` VARCHAR de `game_filters` pour permettre la sélection de plusieurs types d'activité.

---

### Game_Vote (Votes des participants) ⭐ NOUVELLE TABLE

**Table :** `game_vote` (à créer)

| Champ | Type | Description |
|-------|------|-------------|
| idvote | INT (PK) | Identifiant unique |
| idgame | INT (FK) | Référence vers game |
| iduser | INT (FK) | Référence vers user (participant) |
| idactivity | INT (FK) | Référence vers activity |
| vote | TINYINT(1) | 1 = Oui (swipe droite), 0 = Non (swipe gauche) |
| voted_at | DATETIME | Date et heure du vote |

**Contraintes :**
- UNIQUE KEY (`idgame`, `iduser`, `idactivity`) : Un utilisateur ne peut voter qu'une seule fois pour une activité dans une room donnée

**Relations :**
- Appartient à un Game (Many-to-One)
- Appartient à un User (Many-to-One)
- Référence une Activity (Many-to-One)

**SQL de création :**
```sql
CREATE TABLE IF NOT EXISTS `game_vote` (
  `idvote` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `idactivity` int NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=Oui, 0=Non',
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

---

## Migrations de base de données nécessaires

Pour implémenter le système de Game complet, les modifications suivantes sont nécessaires dans la base de données :

### 1. Créer la table `game_vote`

```sql
CREATE TABLE IF NOT EXISTS `game_vote` (
  `idvote` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `idactivity` int NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=Oui, 0=Non',
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
```

### 2. Modifier la table `game` pour corriger les statuts

```sql
-- Modifier l'ENUM pour utiliser les nouveaux statuts
ALTER TABLE `game`
MODIFY COLUMN `status` ENUM('waiting_for_launch', 'voting', 'finished')
COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting_for_launch';
```

### 3. Ajouter la colonne `joined_at` à `game_user` (optionnel mais recommandé)

```sql
ALTER TABLE `game_user`
ADD COLUMN `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `is_creator`;
```

### 4. Script de migration complet

Vous pouvez exécuter ce script pour appliquer toutes les modifications :

```sql
USE onsort;

-- 1. Créer la table game_vote
CREATE TABLE IF NOT EXISTS `game_vote` (
  `idvote` int NOT NULL AUTO_INCREMENT,
  `idgame` int NOT NULL,
  `iduser` int NOT NULL,
  `idactivity` int NOT NULL,
  `vote` tinyint(1) NOT NULL COMMENT '1=Oui, 0=Non',
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

-- 2. Modifier les statuts de la table game
ALTER TABLE `game`
MODIFY COLUMN `status` ENUM('waiting_for_launch', 'voting', 'finished')
COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting_for_launch';

-- 3. Ajouter joined_at à game_user
ALTER TABLE `game_user`
ADD COLUMN IF NOT EXISTS `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP AFTER `is_creator`;

SELECT 'Migration terminée avec succès !' AS message;
```

**Comment appliquer :**
```bash
mysql -u root -p onsort < migration_game_system.sql
```

---

## Middleware

### auth.js - Authentification JWT

**Fonction :** `verifyToken`

- Vérifie la présence du header `Authorization: Bearer <token>`
- Valide le JWT avec `JWT_SECRET`
- Attache les données utilisateur à `req.user`
- Retourne 401 si token absent, 403 si invalide

**Utilisation :**
```javascript
router.get('/profile', verifyToken, controller.getProfile);
```

---

### refreshAuth.js - Refresh Token

**Fonction :** `verifyRefreshToken`

- Similaire à `verifyToken` mais utilise `JWT_REFRESH_SECRET`
- Utilisé uniquement pour l'endpoint `/refresh`

---

### role.js - Autorisation par rôle

**Fonctions :**
- `isAdmin()` : Vérifie si `req.user.role === 1`
- `hasRole(requiredRole)` : Vérifie si l'utilisateur a le rôle requis

**Utilisation :**
```javascript
router.delete('/user/:id', verifyToken, isAdmin, controller.deleteUser);
```

---

### upload.js - Upload de fichiers

**Configuration Multer :**
- **Destination :** `uploads/`
- **Nom de fichier :** `fieldname-timestamp-random.ext`
- **Filtre :** Images uniquement (image/jpeg, image/png, image/jpg, image/gif)
- **Taille max :** 5MB

**Utilisation :**
```javascript
router.post('/', verifyToken, upload.single('image'), controller.uploadPicture);
```

---

## Guide de démarrage

### 1. Installation

```bash
# Cloner le projet
git clone <votre-repo>
cd onsort-api

# Installer les dépendances
npm install
```

### 2. Configuration de la base de données

```bash
# Créer la base de données MySQL
mysql -u root -p

mysql> CREATE DATABASE onsort CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
mysql> exit;

# Importer le schéma
mysql -u root -p onsort < src/bdd-dump/onsort15_10_25.sql
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env` à la racine :

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=onsort
DB_PORT=3306

JWT_SECRET=votre_secret_super_securise_ici
JWT_REFRESH_SECRET=votre_refresh_secret_super_securise_ici

API_PORT=3001
```

### 4. Lancer le serveur

```bash
npm start
```

Le serveur démarre sur `http://localhost:3001`

### 5. Tester l'API

**Inscription :**
```bash
curl -X POST http://localhost:3001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John",
    "surname": "Doe",
    "email": "john@example.com",
    "username": "johndoe",
    "password": "password123",
    "date_of_birth": "2000-01-15"
  }'
```

**Connexion :**
```bash
curl -X POST http://localhost:3001/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

**Utiliser le token :**
```bash
curl -X GET http://localhost:3001/api/users/profile \
  -H "Authorization: Bearer <votre_access_token>"
```

---

## Documentation Swagger

L'API inclut une documentation interactive Swagger/OpenAPI.

**Accès :** [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

La documentation Swagger permet :
- De visualiser tous les endpoints
- De tester les requêtes directement depuis le navigateur
- De voir les schémas de données
- D'obtenir des exemples de requêtes/réponses

---

## Points forts et améliorations

### ✅ Points forts

1. **Architecture MVC bien organisée** - Séparation claire des responsabilités
2. **Authentification robuste** - JWT avec refresh tokens
3. **Gestion des rôles** - Système d'autorisation flexible
4. **Protection des mineurs** - Filtrage automatique du contenu
5. **Requêtes complexes optimisées** - Utilisation de JSON_ARRAYAGG pour agréger les données
6. **Upload sécurisé** - Validation des types de fichiers
7. **Documentation complète** - Swagger intégré
8. **Hashage sécurisé** - Bcrypt avec 10 rounds de salt
9. **Relations complexes** - Gestion many-to-many efficace
10. **API RESTful** - Respect des conventions REST

### 🔧 Améliorations possibles

1. **Validation centralisée** - Utiliser `express-validator` pour valider les inputs
2. **Gestion d'erreurs globale** - Middleware centralisé pour les erreurs
3. **Rate limiting** - Protection contre les abus (express-rate-limit)
4. **Pagination** - Pour les listes de données volumineuses
5. **Transactions SQL** - Pour les opérations multi-étapes
6. **Logs structurés** - Winston ou Pino pour le logging
7. **Tests unitaires** - Jest pour tester les controllers et models
8. **CORS configuré** - Définir les origines autorisées
9. **Compression** - Middleware de compression des réponses
10. **Helmet** - Sécurité HTTP headers
11. **Recovery password** - Système de réinitialisation de mot de passe
12. **Email verification** - Vérification des emails à l'inscription
13. **Soft delete** - Marquer comme supprimé au lieu de supprimer
14. **Audit trail** - Logs des modifications importantes
15. **Cache** - Redis pour les données fréquemment consultées

### 📊 Statistiques du projet

**Actuellement implémenté :**
- **Endpoints opérationnels :** 40+
- **Tables de base de données :** 15 (+ 1 à créer : game_vote)
- **Modèles :** 8
- **Controllers :** 7
- **Middleware :** 4
- **Routes :** 5 fichiers
- **Relations Many-to-Many :** 5
- **Authentification :** JWT (Access + Refresh)

**À implémenter (Système de Game) :**
- **Nouveaux endpoints :** 15+ pour le système de vote
- **Nouveaux modèles :** 2 (game.model.js, gameVote.model.js)
- **Nouveau controller :** 1 (game.controller.js)
- **Nouvelles routes :** 1 fichier (game.router.js)
- **Table à créer :** 1 (game_vote)
- **Table à modifier :** 1 (game - statuts ENUM)

---

## Support et contribution

Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue ou une pull request.

**Version :** 1.0.0
**Dernière mise à jour :** 2025-11-05
