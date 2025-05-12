FROM node:18-alpine AS development

# Création du répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste du code source
COPY . .

# Build de l'application
RUN npm run build

FROM node:18-alpine AS production

# Arguments d'environnement
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# Répertoire de travail
WORKDIR /usr/src/app

# Copie des fichiers de dépendances
COPY package*.json ./

# Installation des dépendances de production uniquement
RUN npm ci --only=production

# Copie du build depuis l'étape précédente
COPY --from=development /usr/src/app/dist ./dist

# Exposition du port utilisé par l'application
EXPOSE 1337

# Commande pour démarrer l'application
CMD ["node", "dist/main"]