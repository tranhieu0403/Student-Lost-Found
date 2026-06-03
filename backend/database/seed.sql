-- Seed tối giản: chỉ tài khoản đăng nhập + danh mục (cần cho form đăng bài)
-- Mật khẩu tất cả tài khoản: password123

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE notifications;
TRUNCATE TABLE matches;
TRUNCATE TABLE messages;
TRUNCATE TABLE images;
TRUNCATE TABLE posts;
TRUNCATE TABLE categories;
TRUNCATE TABLE users;

INSERT INTO categories (name) VALUES
  ('Ví / Túi xách'),
  ('Điện thoại'),
  ('Laptop / Máy tính bảng'),
  ('Thẻ sinh viên / CCCD'),
  ('Tai nghe'),
  ('Chìa khóa'),
  ('Sách / Tài liệu'),
  ('Khác');

INSERT INTO users (name, email, password, role) VALUES
  ('Nguyễn Minh Khôi', '22110001@student.edu.vn', '$2b$10$5.lqlzb4254CAc7bsnNUee3JJzhsARImsHjV1hiplUVgQ9o5j8G.O', 'student'),
  ('Trần Thị Bảo Châu', '22110002@student.edu.vn', '$2b$10$5.lqlzb4254CAc7bsnNUee3JJzhsARImsHjV1hiplUVgQ9o5j8G.O', 'student'),
  ('Quản trị hệ thống', 'admin@lostandfound.edu.vn', '$2b$10$5.lqlzb4254CAc7bsnNUee3JJzhsARImsHjV1hiplUVgQ9o5j8G.O', 'admin');

SET FOREIGN_KEY_CHECKS = 1;
