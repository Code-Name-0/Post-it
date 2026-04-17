# Social Post-it

Application web collaborative en temps réel : tableau de post-its partagé entre plusieurs utilisateurs.

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js + Express (architecture MVC) |
| Base de données | MongoDB + Mongoose |
| Temps réel | Socket.IO |
| Authentification | JWT dans cookie HTTP-only |
| Transport sécurisé | HTTPS (certificat auto-signé) |
| Frontend | React 18 + Vite + React Router v6 |

---

## Prérequis

- **Node.js** >= 18
- **MongoDB** en local (`mongod`) ou une URI Atlas

---

## Installation et démarrage

### 1. Générer les certificats HTTPS (auto-signés)

```bash
cd backend
mkdir -p certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout certs/key.pem \
  -out    certs/cert.pem \
  -subj "/C=FR/ST=IDF/L=Paris/O=Dev/CN=localhost"
```

> Sans certificats, le serveur démarre en HTTP sur le port 3001 (fallback automatique).

### 2. Configurer l'environnement backend

```bash
cd backend
cp .env.example .env
# Éditez .env :
# MONGO_URI     = votre URI MongoDB
# JWT_SECRET    = une chaîne aléatoire longue (min 32 caractères)
# CLIENT_URL    = http://localhost:5173 (URL du frontend Vite)
```

### 3. Installer et lancer le backend

```bash
cd backend
npm install
npm run dev        # nodemon — relance automatique
# ou : npm start   # démarrage simple
```

Le serveur écoute sur :
- **HTTPS** : `https://localhost:3443` (si certificats présents)
- **HTTP** : `http://localhost:3001` (fallback)

### 4. Installer et lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

Ouvrez **http://localhost:5173** dans le navigateur.

> Le proxy Vite redirige automatiquement `/api` et `/socket.io` vers le backend.

---

## Créer un compte administrateur

Après avoir créé un compte via l'interface :

```bash
# Dans le shell MongoDB
mongosh social-postit
db.users.updateOne({ username: "votre_nom" }, { $set: { role: "admin" } })
```

---

## Rôles et permissions

| Rôle | Niveau | Droits |
|------|--------|--------|
| **guest** | 0 | Lecture seule (non connecté) |
| **creator** | 1 | Créer et déplacer ses propres post-its |
| **editor** | 2 | Modifier ses propres post-its (+ droits creator) |
| **eraser** | 3 | Supprimer ses propres post-its (+ droits editor) |
| **admin** | 4 | Tout faire + page d'administration des rôles |

Les nouveaux inscrits reçoivent le rôle **creator** par défaut.

---

## Utilisation

| Action | Geste |
|--------|-------|
| Créer un post-it | Double-clic sur le fond du tableau |
| Déplacer un post-it | Cliquer-glisser (ou touch-drag sur mobile) |
| Modifier le texte | Double-clic sur le texte du post-it |
| Supprimer | Bouton × en haut du post-it (confirmation) |
| Changer de tableau | Clic dans la barre latérale |
| Créer un tableau | Bouton "+ Nouveau tableau" (admin seulement) |

---

## Structure du projet

```
Post-it/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # signup / login / logout / me
│   │   ├── boardController.js     # CRUD tableaux
│   │   ├── postitController.js    # CRUD post-its + socket
│   │   └── adminController.js     # gestion des rôles
│   ├── middleware/
│   │   ├── auth.js                # JWT cookie → req.user
│   │   └── roleCheck.js           # requireRole(minRole)
│   ├── models/
│   │   ├── User.js
│   │   ├── Board.js
│   │   └── PostIt.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── boardRoutes.js
│   │   ├── postitRoutes.js
│   │   └── adminRoutes.js
│   ├── db.js                      # connexion Mongoose
│   ├── server.js                  # point d'entrée + seed
│   └── socket.js                  # initSocket / getIO
└── frontend/
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.jsx    # état utilisateur global
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   ├── Board.jsx          # tableau + Socket.IO
    │   │   ├── PostIt.jsx         # drag & drop + édition
    │   │   └── LoginForm.jsx
    │   └── pages/
    │       ├── BoardPage.jsx      # sidebar + Board
    │       ├── SignupPage.jsx
    │       └── AdminPage.jsx
    ├── index.html
    └── vite.config.js             # proxy → backend
```

---

## API REST

| Méthode | Route | Accès | Description |
|---------|-------|-------|-------------|
| POST | `/api/signup` | public | Créer un compte |
| POST | `/api/login` | public | Connexion |
| POST | `/api/logout` | auth | Déconnexion |
| GET | `/api/me` | public | Utilisateur courant |
| GET | `/api/boards` | public | Liste des tableaux |
| GET | `/api/boards/:slug` | public | Tableau par slug |
| POST | `/api/boards` | admin | Créer un tableau |
| GET | `/api/liste/:boardId` | public | Post-its du tableau |
| POST | `/api/ajouter` | creator+ | Créer un post-it |
| PUT | `/api/modifier/:id` | editor+ ou auteur | Modifier le texte |
| DELETE | `/api/effacer/:id` | eraser+ ou auteur | Supprimer |
| PUT | `/api/deplacer/:id` | creator+ et auteur | Déplacer |
| GET | `/api/admin/users` | admin | Liste des utilisateurs |
| PUT | `/api/admin/users/:id/role` | admin | Changer un rôle |

## Événements Socket.IO

| Événement | Direction | Données |
|-----------|-----------|---------|
| `join:board` | client → serveur | `boardId` |
| `leave:board` | client → serveur | `boardId` |
| `postit:added` | serveur → room | objet PostIt complet |
| `postit:updated` | serveur → room | objet PostIt complet |
| `postit:deleted` | serveur → room | `{ _id }` |
| `postit:moved` | serveur → room | `{ _id, x, y, z_index }` |
