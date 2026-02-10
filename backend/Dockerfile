# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm install --production

# Copia il codice
COPY . .

# Esponi la porta
EXPOSE 3000

# Avvia il server
CMD ["npm", "start"]
