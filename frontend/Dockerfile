# Frontend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copia package files
COPY package*.json ./

# Installa dipendenze
RUN npm install

# Copia il codice
COPY . .

# Build dell'app
RUN npm run build

# Stage di produzione con nginx
FROM nginx:alpine

# Copia i file buildati
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia configurazione nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
