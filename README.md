# API d'Envoi d'Emails - NestJS, Prisma et BullMQ

Ce projet implémente une API RESTful pour l'envoi d'emails en utilisant NestJS, Prisma (PostgreSQL) et BullMQ. L'API permet d'envoyer des emails en fonction du type, de la langue et du workspace, avec un système intelligent de fallback pour la sélection des templates.

## Fonctionnalités

- **Sélection intelligente de templates**: Résolution automatique du template d'email approprié en fonction du type, de la langue et du workspace.
- **Système de fallback**: Si un template n'est pas disponible dans une langue spécifique, le système utilise un template par défaut.
- **Templates spécifiques par workspace**: Possibilité de définir des templates d'emails personnalisés par workspace.
- **File d'attente pour les emails**: Utilisation de BullMQ pour gérer les envois d'emails en arrière-plan.

## Architecture du projet

```
src/
├── email/                     # Module d'envoi d'emails
│   ├── email.controller.ts    # Gestion des requêtes HTTP
│   ├── email.service.ts       # Service d'envoi d'emails
│   ├── email.processor.ts     # Consommateur de la file d'envoi
│   ├── template-resolver.service.ts # Logique de résolution des templates
│   ├── dto/                   # Data Transfer Objects
│   │   ├── send-email.dto.ts
│   │   └── ...
│   └── email.module.ts        # Module NestJS
├── prisma/                    # Configuration Prisma
│   ├── schema.prisma          # Schéma de la base de données
│   └── seed.ts                # Script d'initialisation des données
└── app.module.ts              # Module principal de l'application
```

## Structure de la base de données

La base de données est composée de trois tables principales :

1. **workspaces** : Contient les informations sur les workspaces
2. **templates** : Stocke les templates d'emails (contenu HTML, version, etc.)
3. **email_template_mappings** : Fait le lien entre le type d'email, la langue, le workspace et le template

## Prérequis

- [Node.js](https://nodejs.org/) (v16 ou supérieur)
- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/jonathanARMS23/sendmail.git
cd sendmail
```

### 2. Configurer l'environnement

Créez un fichier `.env` à partir du modèle :

```bash
cp .env.example .env
```

Par défaut, la configuration suivante sera utilisée :

```
# Application
NODE_ENV=development
PORT=1337

# Database - URL de connexion pour Prisma
DATABASE_URL=postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=emailapi
DB_HOST=postgres
DB_PORT=5432

# Redis (pour BullMQ)
REDIS_HOST=redis
REDIS_PORT=6379
```

Vous pouvez modifier ces valeurs selon vos besoins.

### 3. Lancer le projet avec Docker

Rendez le script d'initialisation exécutable et lancez-le :

```bash
chmod +x init-project.sh
./init-project.sh
```

Ce script va :

1. Créer le fichier `.env` s'il n'existe pas déjà
2. Construire et démarrer les conteneurs Docker
3. Générer le client Prisma
4. Exécuter les migrations de la base de données
5. Initialiser les données avec le script de seed

### 4. Lancement manuel (alternative)

Si vous préférez lancer le projet manuellement :

```bash
# Démarrer les conteneurs
docker-compose up -d

# Générer le client Prisma
docker-compose exec api npm run prisma:generate

# Exécuter les migrations
docker-compose exec api npm run prisma:migrate:dev -- --name init

# Initialiser les données
docker-compose exec api npm run prisma:seed
```

## Utilisation de l'API

Une fois le projet démarré, l'API est accessible à l'adresse : `http://localhost:3000`

### Envoyer un email

```http
POST {{baseURL}}/api/email/send
Content-Type: application/json

body:
{
  "to": "destinataire@example.com",
  "from": "expediteur@example.com",
  "subject": "Sujet de l'email",
  "type": "welcome",
  "lang": "fr",
  "workspaceId": "uuid-du-workspace"
}
```

### Exemples de requêtes

Voici quelques exemples de requêtes pour différents types d'emails :

#### Email de bienvenue (Welcome)

```json
{
  "to": "jean.dupont@example.com",
  "from": "noreply@yourcompany.com",
  "subject": "Bienvenue sur notre service !",
  "type": "welcome",
  "lang": "fr",
  "workspaceId": "550e8400-e29b-41d4-a716-446655440000"
}
```

#### Email OTP (One-Time Password)

```json
{
  "to": "marie.martin@example.com",
  "from": "securite@yourcompany.com",
  "subject": "Votre code de vérification",
  "type": "otp",
  "lang": "fr"
}
```

#### Email de réinitialisation de mot de passe

```json
{
  "to": "pierre.durand@example.com",
  "from": "securite@yourcompany.com",
  "subject": "Réinitialisation de votre mot de passe",
  "type": "reset_password",
  "lang": "fr",
  "workspaceId": "6ba7b810-9dad-11d1-80b4-00c04fd430c8"
}
```

### Types d'emails supportés

L'API supporte actuellement les types d'emails suivants :

- `welcome` : Email de bienvenue
- `otp` : Email de code de vérification
- `reset_password` : Email de réinitialisation de mot de passe

Chaque type d'email peut être envoyé en différentes langues (fr, en) et peut être associé à un workspace spécifique.

## Développement

### Commandes utiles

```bash
# Visualiser les logs de l'API
docker-compose logs -f api

# Accéder à Prisma Studio pour explorer la base de données
docker-compose exec api npm run prisma:studio

# Arrêter tous les conteneurs
docker-compose down

# Supprimer également les volumes pour repartir de zéro
docker-compose down -v
```

### Modification du schéma Prisma

Si vous modifiez le fichier `prisma/schema.prisma`, vous devez générer à nouveau le client et exécuter les migrations :

```bash
# Générer le client Prisma
docker-compose exec api npm run prisma:generate

# Créer une nouvelle migration
docker-compose exec api npm run prisma:migrate:dev -- --name nom_de_la_migration
```

## Tests

Pour exécuter les tests unitaires :

```bash
docker-compose exec api npm run test
```

## Architecture technique

### Docker

Le projet utilise Docker et Docker Compose pour créer un environnement de développement isolé avec trois services :

- **api** : L'application NestJS
- **postgres** : Base de données PostgreSQL
- **redis** : Serveur Redis pour BullMQ

### Prisma

Prisma est utilisé comme ORM pour :

- Définir le schéma de la base de données
- Générer le client TypeScript pour interagir avec la base de données
- Gérer les migrations de la base de données

### BullMQ

BullMQ est utilisé pour :

- Créer une file d'attente pour les emails
- Gérer les tentatives de réessai en cas d'échec
- Traiter les emails en arrière-plan

## Licence

Ce projet est sous licence [MIT](LICENSE).
