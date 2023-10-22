
FROM node:14-alpine
WORKDIR /app
COPY . .
RUN npm install --only=production
EXPOSE 8080
CMD ["node", "backend-b.js"]
