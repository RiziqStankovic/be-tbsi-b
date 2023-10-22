FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN base64 -d note.txt >> .env || exit 0
RUN npm install
# RUN npm run build
# RUN npm install -g serve

EXPOSE 8080
# CMD [ "serve", "-s", "/app/dist" ]
CMD ["node", "index.js"]

# Install manajer proses (contoh: PM2)
# RUN npm install -g pm2
# EXPOSE 8080
# CMD ["pm2-runtime", "index.js"]