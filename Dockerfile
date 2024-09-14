# Node.js Base Image
FROM node:14

# Arbeitsverzeichnis erstellen
WORKDIR /app

# Abhängigkeiten kopieren und installieren
COPY package*.json ./
RUN npm install

# Restlichen Code kopieren
COPY . .

# Port 5000 für Express freigeben
EXPOSE 5000

# Start des Servers
CMD ["node", "server/index.js"]
