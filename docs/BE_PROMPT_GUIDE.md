# 🛠️ BE_PROMPT_GUIDE.md — Student Lost & Found
# Hướng dẫn prompt AI agent xây dựng Backend + Docker

---

## ⚡ Nạp context mỗi khi mở session mới

```
Trước khi làm bất cứ điều gì, đọc và ghi nhớ nội dung các file sau:
- AGENT_RULES.md (architecture, API convention, security, matching engine)
- PROJECT_STRUCTURE.md (cây thư mục, Docker containers)

Sau khi đọc xong, xác nhận lại:
1. Stack backend là gì?
2. Luồng 3 lớp là gì?
3. Response format thống nhất?
4. Tên 3 Docker containers?
```

---

## 🐳 PHASE 0 — Docker + MySQL local (làm TRƯỚC TIÊN)

> Làm phase này xong mới có môi trường để test các bước sau.

### Bước 0A — docker-compose + .env

```
Đọc PROJECT_STRUCTURE.md và AGENT_RULES.md section 11 (biến môi trường).

Tạo các file sau ở root project student-lost-found/:

1. docker-compose.yml (base)
   - Service `db`: image mysql:8.0, port 3306:3306, volume mysql_data, env MYSQL_ROOT_PASSWORD/MYSQL_DATABASE, healthcheck: mysqladmin ping -h localhost
   - Service `be`: build ./backend, port 5000:5000, depends_on db (condition: service_healthy), env_file .env, volume ./backend/uploads:/app/uploads
   - Service `fe`: build ./frontend, port 5173:5173, depends_on be
   - Network: app-network (bridge)
   - Volumes: mysql_data

2. docker-compose.dev.yml (override cho dev)
   - `be`: build target dev (Dockerfile.dev), volume mount ./backend/src:/app/src (nodemon hot reload)
   - `fe`: build target dev (Dockerfile.dev), volume mount ./frontend/src:/app/src (Vite HMR)
   - `fe` thêm port 5173 explicit

3. .env.example (copy từ AGENT_RULES.md section 11, để trống AWS/mail values)

4. .env (copy từ .env.example, điền:
   DB_HOST=db
   DB_PORT=3306
   DB_NAME=lost_found_db
   DB_USER=root
   DB_PASSWORD=rootpassword123
   JWT_SECRET=dev_secret_minimum_32_characters_abc
   NODE_ENV=development
   PORT=5000
   CLIENT_URL=http://localhost:5173
   UPLOAD_DIR=uploads
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USER=   ← điền sau khi tạo Mailtrap
   MAIL_PASS=   ← điền sau khi tạo Mailtrap)

Yêu cầu:
- be service chỉ start sau khi db healthy
- Volume uploads phải mount để ảnh không mất khi restart container
- Comment rõ từng section

Output: nội dung đầy đủ 4 files.
```

### Bước 0B — Dockerfile cho backend

```
Đọc PROJECT_STRUCTURE.md phần backend/.

Tạo 2 file:

1. backend/Dockerfile (production)
   - Base: node:20-alpine
   - WORKDIR /app
   - Copy package*.json trước, npm ci --only=production
   - Copy src/ và server.js
   - EXPOSE 5000
   - CMD ["node", "server.js"]

2. backend/Dockerfile.dev
   - Base: node:20-alpine
   - npm install (bao gồm devDependencies)
   - CMD ["npx", "nodemon", "server.js"]
   - Không COPY source (sẽ mount volume từ compose)

Yêu cầu: dùng .dockerignore bao gồm node_modules, .env, *.log
Output: nội dung 2 Dockerfile + .dockerignore
```

### Bước 0C — Dockerfile cho frontend

```
Tạo 2 file:

1. frontend/Dockerfile (production - multi-stage build)
   Stage 1 (builder):
   - node:20-alpine
   - npm ci + npm run build
   Stage 2 (runner):
   - nginx:alpine
   - Copy build từ stage 1 vào /usr/share/nginx/html
   - Copy nginx.conf vào /etc/nginx/conf.d/default.conf
   - EXPOSE 80

2. frontend/Dockerfile.dev
   - node:20-alpine
   - npm install
   - EXPOSE 5173
   - CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

3. frontend/nginx.conf
   - serve / → /usr/share/nginx/html/index.html
   - try_files $uri $uri/ /index.html (SPA routing)
   - proxy_pass /api → http://be:5000 (reverse proxy BE)
   - gzip on cho static assets

Output: nội dung 3 files.
```

---

## 🗄️ PHASE 1 — Database Schema + Seed

### Bước 1A — Schema SQL

```
Đọc AGENT_RULES.md section 3 (Database rules) và section 6 (Enums).

Tạo file backend/database/schema.sql với đầy đủ các bảng:

users
- id INT AUTO_INCREMENT PRIMARY KEY
- name VARCHAR(100) NOT NULL
- email VARCHAR(150) UNIQUE NOT NULL
- password VARCHAR(255) NOT NULL
- role ENUM('student','admin') DEFAULT 'student'
- is_locked TINYINT(1) DEFAULT 0
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

categories
- id INT AUTO_INCREMENT PRIMARY KEY
- name VARCHAR(100) NOT NULL

posts
- id INT AUTO_INCREMENT PRIMARY KEY
- user_id INT NOT NULL, FK → users(id)
- category_id INT, FK → categories(id)
- post_type ENUM('lost','found') NOT NULL
- title VARCHAR(255) NOT NULL
- description TEXT
- location VARCHAR(255)
- incident_date DATE
- status ENUM('searching','resolved') DEFAULT 'searching'
- is_deleted TINYINT(1) DEFAULT 0
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- FULLTEXT INDEX ft_search(title, description)

images
- id INT AUTO_INCREMENT PRIMARY KEY
- post_id INT NOT NULL, FK → posts(id) ON DELETE CASCADE
- image_url VARCHAR(500) NOT NULL
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

matches
- id INT AUTO_INCREMENT PRIMARY KEY
- lost_post_id INT NOT NULL, FK → posts(id)
- found_post_id INT NOT NULL, FK → posts(id)
- score INT NOT NULL DEFAULT 0
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- UNIQUE KEY uq_match(lost_post_id, found_post_id)

messages
- id INT AUTO_INCREMENT PRIMARY KEY
- sender_id INT NOT NULL, FK → users(id)
- receiver_id INT NOT NULL, FK → users(id)
- post_id INT, FK → posts(id) (context bài đăng nào)
- content TEXT NOT NULL
- is_read TINYINT(1) DEFAULT 0
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
- INDEX idx_conversation(sender_id, receiver_id)

notifications
- id INT AUTO_INCREMENT PRIMARY KEY
- user_id INT NOT NULL, FK → users(id)
- type ENUM('new_message','new_match') NOT NULL
- content VARCHAR(500)
- is_read TINYINT(1) DEFAULT 0
- related_id INT (post_id hoặc message_id)
- created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

Yêu cầu:
- Mỗi FK phải có INDEX riêng
- Thêm ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 cho mỗi bảng
- Dùng IF NOT EXISTS để idempotent

Output: file schema.sql đầy đủ, có thể chạy nhiều lần không lỗi.
```

### Bước 1B — Seed Data

```
Đọc UI_RULES.md section 9 (Anti Slop — quy tắc dữ liệu mẫu thật).

Tạo backend/database/seed.sql:

INSERT categories: 8 danh mục từ AGENT_RULES.md section 6

INSERT users: 5 sinh viên + 1 admin
- Tên thật người Việt: Nguyễn Minh Khôi, Trần Thị Bảo Châu, Lê Hoàng Phúc, Phạm Thùy Linh, Võ Đức Anh
- Email: studentid@student.edu.vn
- Password: đã hash bcrypt (salt=10) của "password123" → tự tính hash hoặc dùng placeholder và note cách generate
- Admin: admin@lostandfound.edu.vn

INSERT posts: 8-10 bài (mix lost/found/resolved)
- Dữ liệu organic: "Ví da màu nâu có dán sticker gấu trúc", "Thẻ SV mang tên Nguyễn Thị Lan"
- Địa điểm thật: "Thư viện tầng 3 - khu vực máy tính", "Căn tin A gần cổng B"
- Thời gian organic: 2026-05-13, 2026-05-18, v.v

INSERT messages: 4-5 tin nhắn mẫu giữa các user

INSERT matches: 2-3 cặp match mẫu có score

Yêu cầu:
- Seed phải chạy được SAU schema.sql
- Đầu file: SET FOREIGN_KEY_CHECKS = 0; ... SET FOREIGN_KEY_CHECKS = 1;
- Không dùng tên/email fake kiểu "user1@example.com"

Output: file seed.sql.
```

---

## ⚙️ PHASE 2 — Backend Setup

### Bước 2A — Project init + app.js

```
Tạo cấu trúc backend theo PROJECT_STRUCTURE.md.

1. backend/package.json với dependencies:
   express, mysql2, bcryptjs, jsonwebtoken, joi,
   @aws-sdk/client-s3, @aws-sdk/s3-request-presigner,
   @aws-sdk/client-ses, cors, helmet, express-rate-limit, dotenv
   devDependencies: nodemon

2. backend/src/app.js
   - Import express, cors, helmet, express-rate-limit
   - CORS: origin = CLIENT_URL từ env
   - Helmet: bảo mật headers
   - Rate limit: 100 req/15min cho /api/
   - JSON body parser: limit '10mb'
   - Mount tất cả routers (placeholder comment cho từng module)
   - Mount errorHandler middleware ở cuối
   - Export app (không listen ở đây)

3. backend/server.js
   - Import app + dotenv
   - app.listen(PORT) với log "Server running on port X"
   - Graceful shutdown on SIGTERM

4. backend/src/middlewares/errorHandler.js
   - Nhận (err, req, res, next)
   - Log lỗi ra console (stack trace nếu dev)
   - Trả về response format chuẩn từ AGENT_RULES.md section 4
   - Map các error type thường gặp (ValidationError, JWT errors)

5. backend/src/config/db.js
   - Dùng mysql2/promise createPool
   - Pool size: 10
   - waitForConnections: true
   - Export pool, export hàm testConnection()

Yêu cầu: app.js không chứa bất kỳ business logic nào.
Output: nội dung 5 files trên.
```

---

## 🔐 PHASE 3 — Auth Module

### Bước 3A — Auth API

```
Đọc AGENT_RULES.md section 5 (Auth & Bảo mật).

Tạo đầy đủ module auth theo luồng routes → controller → service:

backend/src/modules/auth/auth.routes.js
- POST /api/auth/register
- POST /api/auth/login
- GET  /api/auth/me (cần middleware auth)

backend/src/modules/auth/auth.service.js
register(name, email, password):
  - Check email tồn tại → throw nếu có
  - Hash password bcrypt salt=10
  - INSERT user
  - Return user object (không có password)

login(email, password):
  - Query user by email
  - Compare password bcrypt
  - Sign JWT payload { id, email, role } expires 7d
  - Return { user, token }

getMe(userId):
  - SELECT id, name, email, role, created_at FROM users WHERE id = ?

backend/src/modules/auth/auth.controller.js
  - Gọi service, wrap trong try/catch, trả response format chuẩn

backend/src/middlewares/auth.js
  - Extract Bearer token từ Authorization header
  - Verify JWT
  - Attach req.user = { id, email, role }
  - Throw 401 nếu không có/hết hạn

backend/src/middlewares/isAdmin.js
  - Kiểm tra req.user.role === 'admin'
  - Throw 403 nếu không phải

Validation schema (dùng Joi):
  register: { name: string min 2, email: email required, password: string min 6 }
  login: { email, password }

Output: nội dung đầy đủ 5 files.
```

---

## 📋 PHASE 4 — Posts Module

### Bước 4A — Posts CRUD

```
Đọc AGENT_RULES.md section 4 (API convention) và section 6 (Enums).

Tạo module posts:

Endpoints:
GET    /api/posts          → list với filter (type, category_id, location, status, date_from, date_to, search)
GET    /api/posts/:id      → chi tiết + images + user info (không có password)
POST   /api/posts          → tạo bài (cần auth)
PUT    /api/posts/:id      → cập nhật (chỉ owner hoặc admin)
PATCH  /api/posts/:id/status → đổi status (chỉ owner)
DELETE /api/posts/:id      → soft delete is_deleted=1 (chỉ owner hoặc admin)

posts.service.js:
getPosts(filters, page=1, limit=10):
  - Build query động theo filters
  - FULLTEXT SEARCH nếu có param `search`
  - JOIN với users (chỉ lấy name), categories, images
  - Trả { posts, total, page, totalPages }

getPostById(id):
  - LEFT JOIN images ON images.post_id = posts.id
  - Trả images là array

createPost(userId, data):
  - INSERT post
  - INSERT images nếu có image_urls array
  - Gọi matchingService.findMatches(newPostId) async (không block response)

posts.controller.js: chỉ nhận req, gọi service, trả res

Validation:
  createPost: { post_type: enum lost/found, title: string required min 5, location: string, incident_date: date, category_id: number, description: string, image_urls: array of string }

Yêu cầu:
- Không dùng SELECT *
- Pagination: ?page=1&limit=10
- Filter location dùng LIKE %keyword%

Output: routes + controller + service đầy đủ.
```

---

## 🔗 PHASE 5 — Matching Engine

### Bước 5A

```
Đọc AGENT_RULES.md section 7 (Matching Engine — thuật toán điểm).

Tạo backend/src/modules/matches/:

matches.service.js:
findMatches(postId):
  1. Lấy post vừa tạo (type, category_id, location, incident_date, title, description)
  2. Query tất cả bài đối diện (lost ↔ found) chưa resolved, chưa deleted
  3. Với mỗi bài đối diện, tính score:
     - +3 nếu category_id giống nhau
     - +2 nếu location LIKE %keyword% trùng (tách từ khóa, so sánh từng từ)
     - +2 nếu FULLTEXT MATCH (title, description) AGAINST (title của post mới)
     - +1 nếu ABS(DATEDIFF(incident_date1, incident_date2)) <= 7
  4. Lọc score >= 3
  5. UPSERT vào bảng matches (INSERT ... ON DUPLICATE KEY UPDATE score=VALUES(score))
  6. Gửi notification nếu match mới (gọi notificationService)

getMatchesForPost(postId):
  - Query bảng matches JOIN posts JOIN users
  - Trả array các bài đối diện kèm score

Endpoint:
GET /api/matches/:postId → trả matches sorted by score DESC

Output: routes + controller + service.
```

---

## 💬 PHASE 6 — Chat Module

### Bước 6A

```
Tạo module chat (polling-based, không cần WebSocket):

Endpoints:
GET  /api/messages/conversations     → list cuộc trò chuyện của user hiện tại
GET  /api/messages/:otherUserId      → lịch sử tin nhắn (có pagination)
POST /api/messages                   → gửi tin nhắn
PATCH /api/messages/read/:otherUserId → đánh dấu đã đọc

chat.service.js:
getConversations(userId):
  - Query messages GROUP BY partner, lấy tin nhắn mới nhất mỗi cuộc
  - Đếm is_read=0 để hiển thị badge unread

getMessages(userId, otherUserId, page, limit):
  - WHERE (sender_id=A AND receiver_id=B) OR (sender_id=B AND receiver_id=A)
  - ORDER BY created_at ASC
  - Trả { messages, total, page }

sendMessage(senderId, receiverId, content, postId):
  - INSERT message
  - Gọi notificationService.sendNewMessageNotification() async
  - Chỉ gửi email nếu đây là tin nhắn ĐẦU TIÊN trong conversation (tránh spam)

markAsRead(userId, otherUserId):
  - UPDATE messages SET is_read=1 WHERE receiver_id=userId AND sender_id=otherUserId

Yêu cầu:
- Tất cả route cần auth middleware
- Validate receiverId tồn tại trong DB trước khi INSERT

Output: routes + controller + service.
```

---

## 📸 PHASE 7 — Upload ảnh (Multer local)

### Bước 7A — Multer setup

```
Đọc AGENT_RULES.md section 8 (Upload ảnh local).

1. Cài package: multer uuid

2. backend/src/modules/upload/upload.routes.js
   POST /api/upload — cần auth middleware

3. backend/src/modules/upload/upload.controller.js
   - Dùng multer diskStorage:
     destination: path.join(__dirname, '../../../uploads')
     filename: (req, file, cb) => cb(null, `${Date.now()}-${uuid()}.${ext}`)
   - fileFilter: chỉ chấp nhận image/jpeg, image/png, image/webp
   - limits: fileSize 5MB
   - upload.array('images', 5)
   - Sau khi upload xong: trả về array imageUrls
     imageUrl = `/uploads/${filename}` (path tương đối, FE ghép với baseURL)

4. Trong app.js thêm:
   app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

5. Tạo file backend/uploads/.gitkeep (giữ folder, ignore nội dung)
   Thêm vào .gitignore: uploads/* và !uploads/.gitkeep

Yêu cầu:
- Không lưu path tuyệt đối vào DB — chỉ lưu filename hoặc relative path
- Nếu upload lỗi giữa chừng (5 ảnh upload được 3): vẫn trả về 3 ảnh thành công, không roll back
- Docker: mount volume ./backend/uploads:/app/uploads để ảnh persist khi restart container

Output: upload.routes.js + upload.controller.js + cập nhật app.js + .gitignore.
```

---

## 📧 PHASE 7B — Email (Nodemailer + Mailtrap)

```
Đọc AGENT_RULES.md section 9 (Email Nodemailer).

1. Cài package: nodemailer

2. backend/src/config/mailer.js
   - Tạo Nodemailer transporter dùng SMTP từ env:
     host: MAIL_HOST, port: MAIL_PORT, auth: { user: MAIL_USER, pass: MAIL_PASS }
   - Export transporter

3. backend/src/utils/sendEmail.js
   - Input: { to, subject, html }
   - Gọi transporter.sendMail()
   - Wrap try/catch: log lỗi ra console, KHÔNG throw (email không được crash app)
   - Return true/false

4. Hai hàm gửi email cụ thể (trong utils/sendEmail.js):

sendNewMessageEmail(receiverEmail, senderName, clientUrl):
  Subject: "[Lost & Found] Bạn có tin nhắn mới từ {senderName}"
  Body HTML: thông báo + nút "Xem tin nhắn" → {clientUrl}/chat

sendNewMatchEmail(ownerEmail, postTitle, matchPostTitle, postId, clientUrl):
  Subject: "[Lost & Found] Tìm thấy bài đăng có thể khớp với bạn!"
  Body HTML: tên bài của bạn + tên bài khớp + nút "Xem ngay" → {clientUrl}/posts/{postId}

Yêu cầu:
- Tất cả email gửi ASYNC (không await ở nơi gọi, không block response)
- Footer bắt buộc: "Không muốn nhận email? Liên hệ admin."
- Test bằng cách vào Mailtrap inbox xem email có đến không

Hướng dẫn Mailtrap cho người dùng:
1. Vào mailtrap.io → đăng ký free
2. Email Testing → Inboxes → My Inbox → SMTP Settings
3. Copy host/port/username/password vào .env

Output: mailer.js + sendEmail.js.
```

---

## 👑 PHASE 8 — Admin Module

### Bước 8A

```
Đọc AGENT_RULES.md section 3 (isAdmin middleware).

Tất cả route phải dùng middleware: auth + isAdmin

Endpoints:
GET    /api/admin/stats          → thống kê tổng hợp
GET    /api/admin/users          → danh sách users (có filter, pagination)
PATCH  /api/admin/users/:id/lock → khóa tài khoản (is_locked=1)
PATCH  /api/admin/users/:id/unlock
GET    /api/admin/posts          → tất cả bài (kể cả pending/deleted)
DELETE /api/admin/posts/:id      → hard delete (chỉ admin mới hard delete)

admin.service.js getStats():
  Trả về 1 object:
  {
    totalLostPosts: COUNT posts WHERE post_type='lost' AND is_deleted=0,
    totalFoundPosts: COUNT posts WHERE post_type='found',
    resolvedPosts: COUNT posts WHERE status='resolved',
    successRate: (resolved / total * 100).toFixed(1),
    totalUsers: COUNT users WHERE role='student',
    totalMatches: COUNT matches,
    recentActivity: 7 ngày gần nhất GROUP BY DATE (dùng cho chart)
  }

Yêu cầu:
- getStats() dùng 1 query với multiple subqueries hoặc Promise.all để tránh N+1
- recentActivity trả array 7 phần tử { date, lost_count, found_count }

Output: routes + controller + service.
```

---

## ✅ PHASE 9 — Integration Test

### Bước 9 — Kiểm tra tất cả trước khi kết nối FE

```
Đọc AGENT_RULES.md toàn bộ.

Tạo file backend/src/utils/healthCheck.js:
- Route GET /api/health
- Kiểm tra DB connection (SELECT 1)
- Trả { status: 'ok', db: 'connected', timestamp }

Tạo file backend/database/init.js (chạy 1 lần lúc startup nếu NODE_ENV=development):
- Đọc schema.sql → chạy
- Đọc seed.sql → chạy (chỉ nếu bảng users rỗng)

Viết checklist test thủ công (curl hoặc Postman):
□ POST /api/auth/register → 201
□ POST /api/auth/login → 200 + token
□ GET  /api/auth/me (Bearer token) → 200
□ POST /api/posts (auth) → 201
□ GET  /api/posts?type=lost → 200 + array
□ GET  /api/matches/:postId → 200
□ POST /api/messages (auth) → 201
□ GET  /api/admin/stats (admin token) → 200
□ POST /api/upload/presign (auth) → 200 + uploadUrl

Nếu tất cả pass: docker compose logs không có lỗi, DB có dữ liệu seed.

Output: healthCheck.js + init.js + checklist.
```

---

## 🔌 PHASE 10 — Kết nối FE với BE

### Bước 10 — Cập nhật FE services

```
Đọc PROJECT_STRUCTURE.md (services/) và AGENT_RULES.md section 4 (API format).

Cập nhật frontend/src/services/api.js:
- baseURL = VITE_API_URL (từ .env)
- Request interceptor: tự động thêm Authorization: Bearer {token từ localStorage}
- Response interceptor:
  + Nếu response.data.success === false → throw Error(response.data.message)
  + Nếu status 401 → clear localStorage, redirect /login

Tạo/cập nhật các service files theo đúng endpoint đã tạo ở BE:

authService.js: register, login, getMe
postService.js: getPosts(filters), getPostById, createPost, updatePost, updateStatus, deletePost
matchService.js: getMatchesForPost(postId)
chatService.js: getConversations, getMessages, sendMessage, markAsRead
uploadService.js: getPresignedUrl, uploadToS3(presignedUrl, file)
adminService.js: getStats, getUsers, lockUser, unlockUser, getPosts, deletePost

Mỗi function:
- Gọi axiosInstance (không gọi fetch thô)
- Trả response.data.data (phần data từ format chuẩn)
- Không xử lý lỗi ở đây — để component/hook xử lý

Output: tất cả service files.
```

---

## 📋 Thứ tự chạy các Phase

```
Phase 0  → Docker setup (môi trường)
Phase 1  → Schema + Seed (data)
Phase 2  → Backend setup (nền)
Phase 3  → Auth (login trước)
Phase 4  → Posts (tính năng chính)
Phase 5  → Matching (ăn điểm)
Phase 6  → Chat
Phase 7  → S3 + SES (sau cùng vì cần AWS account)
Phase 8  → Admin
Phase 9  → Integration test
Phase 10 → Kết nối FE
```

---

## 🆘 Prompt cứu nguy

### Khi agent bị lạc context

```
STOP. Đọc lại AGENT_RULES.md và PROJECT_STRUCTURE.md.
Xác nhận: bạn đang làm Phase mấy? File nào đang tạo?
Tiếp tục từ chỗ đã dừng, không tạo lại những gì đã có.
```

### Khi agent vi phạm luồng 3 lớp

```
KHÔNG được viết business logic trong controller.
Luồng PHẢI là: routes → controller (chỉ gọi service) → service (toàn bộ logic) → db.js.
Viết lại [tên file] theo đúng luồng này.
```

### Khi agent nối chuỗi SQL

```
NGHIÊM CẤM nối chuỗi SQL. Dùng parameterized query với ? placeholder.
Ví dụ đúng: db.query('SELECT * FROM users WHERE id = ?', [userId])
Viết lại đoạn query vừa tạo.
```

### Khi không có AWS keys để test S3/SES

```
Bỏ qua Phase 7 tạm thời.
Mock hàm generatePresignedUrl trả về { uploadUrl: 'mock', publicUrl: 'https://picsum.photos/400/300' }
Mock sendEmail chỉ console.log nội dung email.
Ghi TODO comment để biết điền key thật sau.
```

---

## 📁 Files cần đưa cho agent theo Phase

| Phase | Files đưa cho agent |
|-------|---------------------|
| 0 | PROJECT_STRUCTURE.md + AGENT_RULES.md section 11 |
| 1 | AGENT_RULES.md section 3,6 + UI_RULES.md section 9 |
| 2-3 | AGENT_RULES.md section 3,4,5 |
| 4 | AGENT_RULES.md section 3,4,6 |
| 5 | AGENT_RULES.md section 7 |
| 6 | AGENT_RULES.md section 4 |
| 7A | AGENT_RULES.md section 8 |
| 7B | AGENT_RULES.md section 9 |
| 8 | AGENT_RULES.md toàn bộ |
| 9-10 | Tất cả file rules |

---

## 🚀 Ghi chú khi xong local → deploy AWS

Khi muốn deploy, chỉ cần thay 3 thứ, không cần sửa logic:
1. **Multer → S3**: thay upload controller, giữ nguyên FE uploadService
2. **Nodemailer → SES**: thay transporter trong mailer.js, giữ nguyên sendEmail.js
3. **MySQL container → RDS**: đổi DB_HOST trong .env.production
