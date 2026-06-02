-- Student Lost & Found seed data (Phase 1B)
-- Password for all users: password123
-- bcrypt hash generated with salt rounds=10.

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
  ('Lê Hoàng Phúc', '22110003@student.edu.vn', '$2b$10$5.lqlzb4254CAc7bsnNUee3JJzhsARImsHjV1hiplUVgQ9o5j8G.O', 'student'),
  ('Phạm Thùy Linh', '22110004@student.edu.vn', '$2b$10$5.lqlzb4254CAc7bsnNUee3JJzhsARImsHjV1hiplUVgQ9o5j8G.O', 'student'),
  ('Võ Đức Anh', '22110005@student.edu.vn', '$2b$10$5.lqlzb4254CAc7bsnNUee3JJzhsARImsHjV1hiplUVgQ9o5j8G.O', 'student'),
  ('Quản trị hệ thống', 'admin@lostandfound.edu.vn', '$2b$10$5.lqlzb4254CAc7bsnNUee3JJzhsARImsHjV1hiplUVgQ9o5j8G.O', 'admin');

INSERT INTO posts (user_id, category_id, post_type, title, description, location, incident_date, status) VALUES
  (1, 1, 'lost', 'Mất ví da màu nâu có dán sticker gấu trúc', 'Trong ví có thẻ ATM BIDV và thẻ xe máy, mình làm rơi lúc đi photo tài liệu.', 'Thư viện tầng 3 - khu vực máy tính', '2026-05-13', 'searching'),
  (2, 1, 'found', 'Nhặt được ví da nâu gần thư viện', 'Ví có sticker gấu trúc ở góc phải, bên trong có thẻ xe máy biển số 59A1.', 'Thư viện tầng 2 - cầu thang bộ', '2026-05-13', 'searching'),
  (3, 4, 'lost', 'Làm rơi thẻ SV mang tên Nguyễn Thị Lan', 'Thẻ sinh viên khóa 2024, dây đeo màu xanh dương.', 'Căn tin A gần cổng B', '2026-05-18', 'searching'),
  (4, 4, 'found', 'Nhặt được thẻ sinh viên ở căn tin A', 'Thẻ ghi tên Nguyễn Thị Lan, mình đã gửi tạm ở quầy nước nhưng chưa ai nhận.', 'Căn tin A gần cổng B', '2026-05-18', 'searching'),
  (5, 2, 'lost', 'Mất iPhone 12 màu đen', 'Ốp lưng trong suốt có hình mèo trắng, pin còn khoảng 20 phần trăm lúc mất.', 'Sân bóng sau nhà thi đấu', '2026-05-21', 'resolved'),
  (1, 2, 'found', 'Nhặt được điện thoại iPhone tại sân bóng', 'Máy màu đen, ốp trong suốt, màn hình có vết nứt nhỏ góc trái.', 'Sân bóng sau nhà thi đấu', '2026-05-21', 'resolved'),
  (2, 5, 'lost', 'Mất tai nghe AirPods Pro trong hộp trắng', 'Hộp có khắc chữ BTC2026 ở mặt sau.', 'Giảng đường B2 - phòng 203', '2026-05-24', 'searching'),
  (3, 6, 'found', 'Nhặt được chùm chìa khóa có móc hình xe bus', 'Có 3 chìa, một chìa màu vàng đồng, một thẻ từ ký túc xá B3.', 'Ký túc xá B3 - sảnh tầng trệt', '2026-05-26', 'searching'),
  (4, 7, 'lost', 'Lạc giáo trình Kinh tế vi mô bìa xanh', 'Bên trong có ghi tên Phạm Thùy Linh và số điện thoại 0912 847 391.', 'Giảng đường C1 - dãy ghế cuối', '2026-05-27', 'searching'),
  (5, 8, 'found', 'Nhặt được bình nước giữ nhiệt màu bạc', 'Bình có dán sticker CLB Nhiếp Ảnh, dung tích 750ml.', 'Khu tự học 24/7 tòa nhà A', '2026-05-28', 'searching');

INSERT INTO images (post_id, image_url) VALUES
  (1, '/uploads/wallet-brown-1.jpg'),
  (2, '/uploads/wallet-brown-2.jpg'),
  (3, '/uploads/student-card-1.jpg'),
  (4, '/uploads/student-card-2.jpg'),
  (5, '/uploads/iphone-black-1.jpg'),
  (6, '/uploads/iphone-black-2.jpg');

INSERT INTO messages (sender_id, receiver_id, post_id, content, is_read) VALUES
  (2, 1, 2, 'Chào bạn, mình đang giữ chiếc ví giống mô tả của bạn. Bạn kiểm tra giúp nhé.', 0),
  (1, 2, 1, 'Đúng rồi bạn ơi, ví có sticker gấu trúc phải không? Cảm ơn bạn nhiều!', 0),
  (4, 3, 4, 'Mình nhặt được thẻ sinh viên tên Nguyễn Thị Lan, có phải bạn quen người này không?', 1),
  (3, 4, 3, 'Đúng rồi, bạn mình làm mất thẻ hôm qua. Mình xin thông tin để nhận lại nhé.', 0),
  (1, 5, 6, 'Mình có thể hẹn bạn ở sân bóng lúc 17h để nhận điện thoại được không?', 1);

INSERT INTO matches (lost_post_id, found_post_id, score) VALUES
  (1, 2, 8),
  (3, 4, 8),
  (5, 6, 7);

SET FOREIGN_KEY_CHECKS = 1;
