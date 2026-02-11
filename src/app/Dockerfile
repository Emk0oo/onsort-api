# Utilise une image Node légère
FROM node:20-alpine

# Crée le répertoire de travail
WORKDIR /usr/src/app

# Copie les fichiers du projet
COPY package*.json ./

# Installe les dépendances
RUN npm install --production

# Copie le reste du code
COPY . .

# Crée le répertoire de logs
RUN mkdir -p /usr/src/app/logs

# Expose le port utilisé par ton app
EXPOSE 3000

# Healthcheck: vérifie que /health répond
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Démarre le serveur
CMD ["node", "server.js"]
