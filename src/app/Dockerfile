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

# Expose le port utilisé par ton app
EXPOSE 3000

# Démarre le serveur
CMD ["node", "server.js"]