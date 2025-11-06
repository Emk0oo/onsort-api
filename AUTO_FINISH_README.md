# 🎯 Système d'Auto-finish des Games

## ✅ Fonctionnalités implémentées

Le système de vote dispose maintenant de 3 mécanismes de fermeture automatique :

### 1. 🏁 Auto-finish quand tous les participants ont voté
Dès que le dernier participant vote, la game passe automatiquement en statut `finished`.

### 2. ⏱️ Auto-finish après timeout (60 minutes par défaut)
Si une game reste en statut `voting` pendant plus de X minutes, elle passe automatiquement en `finished` lors de la prochaine consultation.

### 3. 👤 Fermeture manuelle par le créateur
Le créateur peut toujours forcer la fermeture avec `PATCH /games/:id/status`.

---

## 📦 Fichiers modifiés

### 1. **Migration SQL** - `migration_add_voting_started_at.sql`
```sql
ALTER TABLE `game`
ADD COLUMN `voting_started_at` DATETIME DEFAULT NULL
COMMENT 'Date et heure du début du vote'
AFTER `updated_at`;
```

**Comment appliquer :**
```bash
mysql -u root -p onsort < migration_add_voting_started_at.sql
```

### 2. **Game Model** - `src/app/models/game.model.js`

**Méthode modifiée : `updateStatus()`** (ligne 111-125)
- Enregistre `voting_started_at = NOW()` quand status passe à 'voting'

**Nouvelle méthode : `checkAndAutoFinishIfExpired()`** (ligne 127-167)
- Vérifie si timeout dépassé
- Auto-finish si nécessaire
- Retourne `{ auto_finished: boolean, reason: string, elapsed_minutes: number }`

### 3. **Game Controller** - `src/app/controller/game.controller.js`

**`vote()` modifié** (ligne 620-643)
- Après enregistrement du vote, vérifie si tous ont voté
- Si oui → Auto-finish avec message spécial

**`getGame()` modifié** (ligne 87-89)
- Vérifie timeout avant de retourner les données

**Nouvelle méthode : `getGameStatus()`** (ligne 176-253)
- Endpoint dédié au statut
- Retourne progression détaillée
- Vérifie timeout automatiquement

### 4. **Game Router** - `src/app/routes/game.router.js`

**Nouvelle route** (ligne 198)
```javascript
router.get("/:id/status", auth, gameController.getGameStatus);
```

---

## 🔧 Configuration

### Variable d'environnement (optionnelle)

Ajoutez dans votre `.env` :
```env
# Timeout du vote en minutes (défaut: 60)
GAME_VOTING_TIMEOUT_MINUTES=60
```

Par défaut, si non spécifié : **60 minutes**

---

## 🚀 Utilisation

### Endpoint : GET /games/:id/status

**URL :** `http://localhost:3001/api/games/:id/status`

**Headers :**
```
Authorization: Bearer <access_token>
```

**Réponse exemple :**
```json
{
  "game": {
    "idgame": 1,
    "status": "voting",
    "created_at": "2025-01-15T10:00:00.000Z",
    "voting_started_at": "2025-01-15T10:30:00.000Z",
    "time_elapsed_minutes": 15,
    "time_remaining_minutes": 45,
    "timeout_minutes": 60
  },
  "voting_progress": {
    "total_participants": 5,
    "completed_count": 3,
    "completion_rate": 60,
    "all_participants_voted": false
  },
  "participants": [
    {
      "iduser": 1,
      "name": "John",
      "surname": "Doe",
      "is_creator": true,
      "has_voted_all": true,
      "progress_percentage": 100
    },
    {
      "iduser": 2,
      "name": "Jane",
      "surname": "Smith",
      "is_creator": false,
      "has_voted_all": true,
      "progress_percentage": 100
    },
    {
      "iduser": 3,
      "name": "Bob",
      "surname": "Martin",
      "is_creator": false,
      "has_voted_all": false,
      "progress_percentage": 60
    }
  ]
}
```

---

## 🎬 Scénarios d'utilisation

### Scénario 1 : Tous votent avant le timeout

```
10h00 - Game lancée (status: voting, voting_started_at: 10h00)
10h05 - User A vote → 1/5 terminé
10h10 - User B vote → 2/5 terminé
10h15 - User C vote → 3/5 terminé
10h20 - User D vote → 4/5 terminé
10h25 - User E vote → 5/5 terminé ✅ AUTO-FINISH (all_participants_voted)
```

**Réponse du dernier vote :**
```json
{
  "message": "Vote enregistré avec succès. Tous les participants ont voté, la room est terminée !",
  "auto_finished": true,
  "voting_stats": {
    "total_participants": 5,
    "completion_rate": 100
  }
}
```

### Scénario 2 : Timeout dépassé

```
10h00 - Game lancée (status: voting, voting_started_at: 10h00)
10h05 - User A vote → 1/5 terminé
10h10 - User B vote → 2/5 terminé
...
11h05 - User consulte GET /games/:id/status
        → Timeout dépassé (65 minutes > 60 minutes)
        → ✅ AUTO-FINISH (timeout)
        → Retourne status: "finished"
```

### Scénario 3 : Fermeture manuelle

```
10h00 - Game lancée (status: voting)
10h05 - Créateur appelle PATCH /games/:id/status { "status": "finished" }
       → ✅ FINISH manuel
```

---

## 📊 Endpoints affectés par l'auto-finish

Les endpoints suivants vérifient automatiquement le timeout :

1. **GET /games/:id** - Vérifie avant de retourner les détails
2. **GET /games/:id/status** - Vérifie avant de retourner le statut
3. **POST /games/:id/vote** - Vérifie après le vote (all_participants_voted)

---

## 🔍 Détails techniques

### Quand `voting_started_at` est-il enregistré ?

Lors de l'appel à `PATCH /games/:id/status` avec `status = "voting"` :
```javascript
await Game.updateStatus(idgame, 'voting');
// → UPDATE game SET status = 'voting', voting_started_at = NOW() WHERE idgame = ?
```

### Comment fonctionne la vérification du timeout ?

```javascript
// Calcul SQL
TIMESTAMPDIFF(MINUTE, voting_started_at, NOW()) >= timeout_minutes
```

Si vrai → `Game.updateStatus(idgame, 'finished')` est appelé automatiquement.

### Pourquoi "on-demand" et pas cron job ?

✅ **Avantages de l'approche on-demand :**
- Pas d'infrastructure supplémentaire (pas de cron, scheduler, etc.)
- Vérifié seulement quand nécessaire (quand un user interagit)
- Suffisant pour ce cas d'usage
- Moins de charge serveur

❌ **Inconvénients :**
- La game ne se ferme pas exactement à 10h60, mais au prochain accès
- Acceptable pour une application de vote entre amis

---

## ✨ Améliorations futures possibles

1. **Notifications push** quand la game se termine
2. **Webhook** pour notifier des services externes
3. **Statistiques** : temps moyen de vote, taux de completion, etc.
4. **Email/SMS** de rappel aux participants qui n'ont pas voté
5. **Timeout personnalisé** par game (dans la table)

---

## 🧪 Tester les fonctionnalités

### Test 1 : Auto-finish après tous les votes

```bash
# 1. Créer une game avec 2 participants
POST /api/games { activity_types: [1], allowed_prices: [1], dates: [...] }

# 2. Inviter un ami
POST /api/games/:id/join { invite_code: "..." }

# 3. Lancer le vote
PATCH /api/games/:id/status { status: "voting" }

# 4. Les 2 votent sur toutes les activités
POST /api/games/:id/vote { idactivity: 1, vote: true }
# ... répéter pour toutes les activités

# 5. Au dernier vote → Auto-finish !
```

### Test 2 : Auto-finish après timeout (RAPIDE)

Pour tester sans attendre 60 minutes :

**Option 1 : Modifier le timeout dans .env**
```env
GAME_VOTING_TIMEOUT_MINUTES=1  # 1 minute au lieu de 60
```

**Option 2 : Modifier manuellement voting_started_at**
```sql
-- Mettre voting_started_at à 61 minutes dans le passé
UPDATE game
SET voting_started_at = DATE_SUB(NOW(), INTERVAL 61 MINUTE)
WHERE idgame = 1;
```

Puis :
```bash
# Consulter le statut → Auto-finish !
GET /api/games/1/status
```

---

## 📖 Documentation Swagger

Accédez à la documentation interactive :
```
http://localhost:3001/api-docs
```

Cherchez l'endpoint : **GET /games/{id}/status**

---

## ✅ Checklist d'installation

- [ ] Appliquer la migration SQL `migration_add_voting_started_at.sql`
- [ ] Redémarrer le serveur Node.js
- [ ] (Optionnel) Ajouter `GAME_VOTING_TIMEOUT_MINUTES` dans `.env`
- [ ] Tester GET /games/:id/status
- [ ] Tester le vote avec auto-finish
- [ ] Consulter Swagger pour voir la nouvelle route

---

**Version :** 2.1.0
**Date :** 2025-11-06
**Status :** ✅ Production Ready
