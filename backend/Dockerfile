# Production image — chỉ cài deps runtime, copy source
FROM node:20-alpine
WORKDIR /app

# bcrypt cần build tools alpine
RUN apk add --no-cache python3 make g++

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY database ./database
COPY server.js ./

# Tạo sẵn folder uploads để mount volume không bị permission lỗi
RUN mkdir -p uploads

EXPOSE 5000
CMD ["node", "server.js"]
