# 🤖 AI Agent Rules — Student Lost & Found

## 1. Tổng quan dự án

Đây là web app giúp sinh viên đăng tin mất đồ / nhặt được đồ và ghép cặp để tìm lại đồ.

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express.js (REST API)
- **Database**: MySQL 8 (Docker container local, sau deploy lên RDS)
- **Storage**: Local disk `/uploads/` (sau deploy lên S3)
- **Email**: Nodemailer + Mailtrap (local test), sau dùng SES
- **Auth**: JWT (access token trong localStorage)
- **Deploy (sau)**: EC2 + Docker + Nginx + CloudFront + RDS + S3

---

## 2. Cấu trúc module

### Frontend (`/frontend/src/`)
| Thư mục | Chứa gì |
|---|---|
| `pages/` | Mỗi file = 1 route/trang |
| `components/` | UI tái sử dụng, chia theo feature |
| `services/` | Tất cả call API, không fetch trực tiếp trong component |
| `hooks/` | Custom hooks bọc logic phức tạp |
| `context/` | Global state (chỉ dùng cho auth) |
| `utils/` | Hàm thuần túy, không có side effect |

### Backend (`/backend/src/`)
| Thư mục | Chứa gì |
|---|---|
| `modules/<feature>/` | routes → controller → service (3 lớp) |
| `config/` | Kết nối DB, S3, SES — khởi tạo một lần |
| `middlewares/` | auth, validate, errorHandler |
| `utils/` | Hàm helper không phụ thuộc Express |

---

## 3. Quy tắc viết code

### Chung
- Dùng **tiếng Anh** cho tên biến, hàm, file, comment trong code
- Dùng **tiếng Việt** cho string hiển thị ra UI
- Không hardcode string lặp lại — đưa vào `constants.js`
- Mỗi file chỉ làm **một việc**, không gộp nhiều logic vào nhau
- Không commit file `.env` lên git

### Frontend
- Mỗi component chỉ nhận data qua **props hoặc hook**, không gọi API trực tiếp
- Gọi API qua `services/` (Axios instance trong `api.js`), không dùng `fetch` thô
- Dùng Tailwind class, không viết CSS inline ngoại trừ style động
- Xử lý loading state và error state cho mọi API call
- Không đặt logic phức tạp trong JSX — tách ra biến hoặc hàm riêng

### Backend
- Luôn đi theo luồng: `routes → controller → service → DB`
- Controller chỉ nhận request, gọi service, trả response — không chứa logic
- Service chứa toàn bộ business logic, không biết gì về Express (req/res)
- Mọi lỗi đều được `throw` lên và xử lý ở `errorHandler` middleware
- Validate input ở middleware trước khi vào controller
- Dùng parameterized query (`?` placeholder), tuyệt đối không nối chuỗi SQL

### Database
- Tên bảng: số nhiều, snake_case (`users`, `posts`, `messages`)
- Tên cột: snake_case (`created_at`, `user_id`, `post_type`)
- Mọi bảng đều có `id` (UUID hoặc AUTO_INCREMENT), `created_at`
- Foreign key phải có index
- Không xóa dữ liệu thật — dùng `is_deleted` (soft delete) hoặc `status`

---

## 4. API Convention

### URL format
```
GET    /api/posts              # Danh sách
GET    /api/posts/:id          # Chi tiết
POST   /api/posts              # Tạo mới
PUT    /api/posts/:id          # Cập nhật toàn bộ
PATCH  /api/posts/:id/status   # Cập nhật 1 trường
DELETE /api/posts/:id          # Xóa
```

### Response format thống nhất
```json
// Thành công
{
  "success": true,
  "data": { ... },
  "message": "Đăng bài thành công"
}

// Thất bại
{
  "success": false,
  "message": "Không tìm thấy bài đăng",
  "error": "NOT_FOUND"
}
```

### HTTP Status Code
| Code | Dùng khi |
|---|---|
| 200 | Thành công (GET, PUT, PATCH) |
| 201 | Tạo mới thành công (POST) |
| 400 | Input sai / validation fail |
| 401 | Chưa đăng nhập |
| 403 | Không có quyền |
| 404 | Không tìm thấy |
| 500 | Lỗi server |

---

## 5. Auth & Bảo mật

- JWT payload chỉ chứa `{ id, email, role }` — không bỏ thêm gì
- Token hết hạn sau **7 ngày**
- Password hash bằng `bcrypt` với **salt rounds = 10**
- Route cần auth → thêm middleware `auth`
- Route chỉ admin → thêm `auth` + `isAdmin`
- Không bao giờ trả password (dù đã hash) về client

---

## 6. Enum & Constants

### Post type
```js
POST_TYPE = { LOST: 'lost', FOUND: 'found' }
```

### Post status
```js
POST_STATUS = { SEARCHING: 'searching', RESOLVED: 'resolved' }
```

### User role
```js
USER_ROLE = { STUDENT: 'student', ADMIN: 'admin' }
```

### Item categories (dùng cho filter & matching)
```js
ITEM_CATEGORIES = [
  'Ví / Túi xách',
  'Điện thoại',
  'Laptop / Máy tính bảng',
  'Thẻ sinh viên / CCCD',
  'Tai nghe',
  'Chìa khóa',
  'Sách / Tài liệu',
  'Khác'
]
```

---

## 7. Matching Engine — Thuật toán ghép cặp

Khi tạo/cập nhật bài `lost` hoặc `found`, chạy query tìm bài đối diện:

**Tính điểm khớp (score-based):**
```
+3  — category giống nhau
+2  — location chứa từ khóa trùng nhau
+2  — FULLTEXT title/description khớp
+1  — date chênh lệch ≤ 7 ngày
```
Ngưỡng hiển thị gợi ý: **score ≥ 3**

Lưu kết quả vào bảng `matches(lost_post_id, found_post_id, score)`.

---

## 8. Upload ảnh (Local — giai đoạn dev)

Dùng **Multer** lưu ảnh vào thư mục `backend/uploads/` trên máy local.

Flow:
1. Client gửi `POST /api/upload` với `multipart/form-data` (field `image`)
2. Multer lưu file vào `backend/uploads/{uuid}-{originalname}`
3. Backend trả về `{ imageUrl: '/uploads/{filename}' }`
4. Client lưu `imageUrl` vào form rồi submit bài đăng

Config Multer:
- Chỉ chấp nhận `image/jpeg`, `image/png`, `image/webp`
- Giới hạn kích thước: **5MB / ảnh**
- Tối đa **5 ảnh / request** (dùng `upload.array('images', 5)`)
- Filename: `{Date.now()}-{uuid}.{ext}` — không giữ tên gốc (tránh trùng, tránh ký tự lạ)

Serve file tĩnh:
- Trong `app.js`: `app.use('/uploads', express.static(path.join(__dirname, '../uploads')))`
- Client truy cập ảnh qua: `http://localhost:5000/uploads/{filename}`

> ⚠️ Khi deploy AWS: thay Multer bằng S3 presigned URL, không cần sửa FE (chỉ đổi `imageUrl` từ `/uploads/...` sang `https://s3...`)

---

## 9. Email thông báo (Nodemailer + Mailtrap — giai đoạn dev)

Dùng **Nodemailer** với **Mailtrap** để test email local (không tốn tiền, không cần domain).

Setup Mailtrap:
1. Tạo tài khoản miễn phí tại mailtrap.io
2. Vào Inbox → SMTP Settings → copy host, port, user, pass vào `.env`

Gửi email khi:
- Có người nhắn tin lần đầu trong cuộc trò chuyện → báo người nhận
- Hệ thống tìm được match mới cho bài đăng của bạn

Template email phải có:
- Tiêu đề rõ ràng
- Link dẫn thẳng vào trang liên quan (`CLIENT_URL`)
- Footer: "Không muốn nhận email? Liên hệ admin."

> ⚠️ Khi deploy AWS: đổi Nodemailer transport sang SES, không cần sửa template

---

## 10. Thứ tự implement (theo sprint)

```
Sprint 1 — Nền tảng
  ✅ Docker setup (MySQL container + BE + FE)
  ✅ Schema DB + seed data
  ✅ Auth API (register, login, me)
  ✅ Auth UI (Login, Register page)
  ✅ Axios instance + AuthContext

Sprint 2 — Posts
  ✅ CRUD Posts API
  ✅ Home page (danh sách, filter)
  ✅ PostDetail page
  ✅ CreatePost form

Sprint 3 — Upload & Matching
  ✅ Upload ảnh local (Multer)
  ✅ Matching engine
  ✅ MatchSuggestion component

Sprint 4 — Chat
  ✅ Messages API
  ✅ Chat UI (polling mỗi 5 giây)
  ✅ Email thông báo (Nodemailer + Mailtrap)

Sprint 5 — Admin & Polish
  ✅ Admin dashboard
  ✅ Biểu đồ thống kê (Chart.js)
  ✅ Responsive mobile
  ✅ Kiểm thử toàn bộ local

--- Sau khi hoàn thiện ---
Sprint 6 — Deploy AWS
  ☐ Đổi Multer → S3 presigned URL
  ☐ Đổi Nodemailer → SES
  ☐ Đổi MySQL container → RDS
  ☐ Deploy EC2 + Docker + Nginx + CloudFront
```

---

## 11. Môi trường biến (.env)

### Backend (local)
```env
PORT=5000
NODE_ENV=development

DB_HOST=db          # tên service trong docker-compose
DB_PORT=3306
DB_NAME=lost_found_db
DB_USER=root
DB_PASSWORD=rootpassword123

JWT_SECRET=dev_secret_minimum_32_characters_abc
JWT_EXPIRES_IN=7d

# Upload local
UPLOAD_DIR=uploads  # thư mục tương đối từ backend/

# Email (Mailtrap)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USER=           # lấy từ Mailtrap inbox
MAIL_PASS=           # lấy từ Mailtrap inbox
MAIL_FROM=noreply@lostandfound.local

CLIENT_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_URL=http://localhost:5000/api
```

> Khi deploy AWS: thêm các biến AWS_REGION, S3_BUCKET, SES_FROM_EMAIL vào file `.env.production` riêng

---

## 12. Những thứ KHÔNG làm

- ❌ Không viết SQL thô nối chuỗi (SQL injection)
- ❌ Không lưu ảnh vào DB — lưu vào `uploads/` local (sau dùng S3)
- ❌ Không để JWT_SECRET mặc định hay ngắn hơn 32 ký tự
- ❌ Không gọi API trực tiếp trong JSX component
- ❌ Không return password dù đã hash
- ❌ Không dùng `SELECT *` trong production query
- ❌ Không quên đóng DB connection sau khi query xong
- ❌ Không cài AWS SDK ở giai đoạn local — tránh confusion
