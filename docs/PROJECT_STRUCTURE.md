# 📁 Student Lost & Found — Cấu trúc thư mục

```
student-lost-found/
│
├── docker-compose.yml                  # Chạy toàn bộ app: fe + be + db
├── docker-compose.dev.yml              # Override cho môi trường dev (hot reload)
├── .env                                # Biến môi trường chung (git ignore)
├── .env.example                        # Mẫu .env để điền
├── README.md
│
│
├── 📁 frontend/                        # React (Vite)
│   ├── Dockerfile                      # Build image production (nginx serve)
│   ├── Dockerfile.dev                  # Dev image (hot reload Vite)
│   ├── nginx.conf                      # Nginx config bên trong container FE
│   ├── vite.config.js                  # Proxy /api → localhost:5000 (dev)
│   │
│   ├── public/
│   │   └── favicon.ico
│   │
│   └── src/
│       ├── 📁 assets/
│       │
│       ├── 📁 components/
│       │   ├── common/
│       │   │   ├── Navbar.jsx
│       │   │   ├── Footer.jsx
│       │   │   ├── Button.jsx
│       │   │   ├── Modal.jsx
│       │   │   ├── Badge.jsx
│       │   │   └── ImageUpload.jsx     # Upload multipart lên /api/upload
│       │   │
│       │   ├── post/
│       │   │   ├── PostCard.jsx
│       │   │   ├── PostForm.jsx
│       │   │   ├── PostFilter.jsx
│       │   │   └── MatchSuggestion.jsx
│       │   │
│       │   └── chat/
│       │       ├── ChatBox.jsx
│       │       └── MessageBubble.jsx
│       │
│       ├── 📁 pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── PostDetail.jsx
│       │   ├── CreatePost.jsx
│       │   ├── MyPosts.jsx
│       │   ├── Chat.jsx
│       │   └── admin/
│       │       ├── AdminLayout.jsx
│       │       ├── Dashboard.jsx
│       │       ├── ManageUsers.jsx
│       │       └── ManagePosts.jsx
│       │
│       ├── 📁 hooks/
│       │   ├── useAuth.js
│       │   ├── usePosts.js
│       │   └── useChat.js
│       │
│       ├── 📁 context/
│       │   └── AuthContext.jsx
│       │
│       ├── 📁 services/
│       │   ├── api.js                  # Axios instance + interceptor
│       │   ├── authService.js
│       │   ├── postService.js
│       │   ├── chatService.js
│       │   └── uploadService.js        # POST multipart /api/upload
│       │
│       ├── 📁 utils/
│       │   ├── formatDate.js
│       │   └── constants.js
│       │
│       ├── App.jsx
│       └── main.jsx
│
│
├── 📁 backend/
│   ├── Dockerfile
│   ├── Dockerfile.dev
│   │
│   ├── 📁 uploads/                     # Ảnh upload lưu ở đây (local)
│   │   └── .gitkeep                    # Giữ folder trong git, bỏ qua nội dung
│   │
│   ├── 📁 src/
│   │   ├── 📁 config/
│   │   │   ├── db.js                   # MySQL pool (mysql2/promise)
│   │   │   └── mailer.js               # Nodemailer transport (Mailtrap)
│   │   │
│   │   ├── 📁 middlewares/
│   │   │   ├── auth.js
│   │   │   ├── isAdmin.js
│   │   │   ├── validate.js
│   │   │   └── errorHandler.js
│   │   │
│   │   ├── 📁 modules/
│   │   │   ├── 📁 auth/
│   │   │   │   ├── auth.routes.js
│   │   │   │   ├── auth.controller.js
│   │   │   │   └── auth.service.js
│   │   │   │
│   │   │   ├── 📁 posts/
│   │   │   │   ├── posts.routes.js
│   │   │   │   ├── posts.controller.js
│   │   │   │   └── posts.service.js
│   │   │   │
│   │   │   ├── 📁 matches/
│   │   │   │   ├── matches.routes.js
│   │   │   │   ├── matches.controller.js
│   │   │   │   └── matches.service.js
│   │   │   │
│   │   │   ├── 📁 chat/
│   │   │   │   ├── chat.routes.js
│   │   │   │   ├── chat.controller.js
│   │   │   │   └── chat.service.js
│   │   │   │
│   │   │   ├── 📁 upload/
│   │   │   │   ├── upload.routes.js    # POST /api/upload (Multer)
│   │   │   │   └── upload.controller.js
│   │   │   │
│   │   │   └── 📁 admin/
│   │   │       ├── admin.routes.js
│   │   │       ├── admin.controller.js
│   │   │       └── admin.service.js
│   │   │
│   │   ├── 📁 utils/
│   │   │   └── sendEmail.js            # Wrapper Nodemailer
│   │   │
│   │   └── app.js
│   │
│   ├── 📁 database/
│   │   ├── schema.sql
│   │   └── seed.sql
│   │
│   ├── server.js
│   └── package.json
```

---

## Docker — Sơ đồ các container

```
docker-compose.yml
│
├── 🐳 fe       (React + Vite)       port 5173  ← dev hot reload
├── 🐳 be       (Node.js)            port 5000
└── 🐳 db       (MySQL 8)            port 3306
```

## Lưu ý

- **Dev (local):** `docker compose -f docker-compose.yml -f docker-compose.dev.yml up`
  → FE Vite hot reload, BE nodemon, DB MySQL container, ảnh lưu `backend/uploads/`
- **Không cần AWS** ở giai đoạn này — email dùng Mailtrap, ảnh lưu local
- **Khi deploy:** thêm `docker-compose.prod.yml` override đổi DB → RDS, thêm S3/SES
- Volume `mysql_data` persistent — xóa bằng `docker volume rm` nếu muốn reset DB sạch
