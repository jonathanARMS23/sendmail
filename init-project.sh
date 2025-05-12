#!/bin/bash

# Fonction pour vérifier si une commande s'est bien exécutée
check_error() {
    if [ $? -ne 0 ]; then
        echo "❌ Erreur: $1"
        exit 1
    fi
}

# Copier le fichier .env.example vers .env s'il n'existe pas déjà
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Fichier .env créé à partir de .env.example"
else
    echo "ℹ️ Le fichier .env existe déjà"
fi

# Nettoyer l'environnement Docker
echo "🧹 Nettoyage de l'environnement Docker..."
docker-compose down -v
docker system prune -f --volumes

# Construire et démarrer les conteneurs Docker
echo "🏗️ Construction et démarrage des conteneurs Docker..."
docker-compose build --no-cache api
check_error "La construction de l'image a échoué"

echo "🚀 Démarrage des conteneurs..."
docker-compose up -d
check_error "Le démarrage des conteneurs a échoué"

# Attendre que la base de données soit prête
echo "⏳ Attente du démarrage complet de PostgreSQL..."
sleep 15

# Vérifier que le conteneur api est en cours d'exécution
# if ! docker-compose ps | grep -q "api.*running"; then
#    echo "❌ Le conteneur api n'est pas en cours d'exécution"
#    docker-compose logs api
#    exit 1
# fi

# Installation des dépendances dans le conteneur
echo "📦 Installation des dépendances..."
docker-compose exec -T api npm install
check_error "L'installation des dépendances a échoué"

# Exécuter les migrations Prisma
echo "🔄 Exécution des migrations Prisma... (DEV)"
docker-compose exec -T api npx prisma migrate dev --name init
check_error "Les migrations Prisma (dev) ont échoué"

echo "🔄 Exécution des migrations Prisma... (DEPLOY)"
docker-compose exec -T api npm run prisma:migrate:deploy
check_error "Les migrations Prisma (deploy) ont échoué"

# Exécuter le seed pour initialiser la base de données
echo "🌱 Initialisation des données avec le seed..."
docker-compose exec -T api npm run prisma:seed
check_error "L'initialisation des données a échoué"

echo "✨ Initialisation du projet terminée!"
echo "🌐 L'API est accessible à l'adresse: http://localhost:1337"
echo "🔍 Interface Prisma Studio accessible via: docker-compose exec api npm run prisma:studio"