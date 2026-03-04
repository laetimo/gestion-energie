FROM node:18-alpine

WORKDIR /app

# Copier les fichiers
COPY package*.json ./
COPY src ./src
COPY public ./public

# Installer les dépendances (node-gyp pour les modules natifs)
RUN apk add --no-cache python3 make g++ && \
    npm ci --only=production && \
    apk del python3 make g++

# Créer le répertoire data
RUN mkdir -p /app/data

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
