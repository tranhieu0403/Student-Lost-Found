# 🎨 UI_RULES.md — Student Lost & Found
# Powered by taste-skill (github.com/Leonxlnx/taste-skill)

---

## 0. Cài đặt taste-skill vào project

```bash
# Cài CLI
npm install -g skills-cli

# Cài skill vào project (chạy ở root)
npx skills add https://github.com/Leonxlnx/taste-skill --skill "design-taste-frontend"
```

Sau khi cài, file `SKILL.md` tự load vào Cursor / Claude Code khi bạn làm việc trong folder.

---

## 1. Dial Settings cho dự án này

```
DESIGN_VARIANCE:  5   → Layout cân bằng, không quá đối xứng, không loạn
MOTION_INTENSITY: 4   → Transition mượt, không rườm rà, không Framer nặng
VISUAL_DENSITY:   5   → App hằng ngày của sinh viên, không quá thưa, không quá chật
```

> Lý do chọn vậy: Đây là tool thực dụng cho sinh viên, không phải landing page marketing.
> Ưu tiên rõ ràng, dễ dùng, load nhanh trên điện thoại 4G.

---

## 2. Stack & Convention

- **Framework:** React (CRA hoặc Vite) — không dùng Next.js
- **Styling:** Tailwind CSS v3
- **Icons:** `@phosphor-icons/react` — strokeWidth thống nhất `1.5` toàn app
- **Font:** `Geist` (heading) + `Inter` bị BAN → dùng `Outfit` hoặc `Geist` cho body
- **Animation:** CSS transition thông thường, không cần Framer Motion
- **Image placeholder:** `https://picsum.photos/seed/{random}/800/600` — không dùng Unsplash

---

## 3. Color Palette — Lost & Found Theme

```css
/* Màu nền */
--bg-base:       #f8f9fa;   /* Nền trang chính */
--bg-card:       #ffffff;   /* Card */
--bg-subtle:     #f1f3f5;   /* Input, sidebar */

/* Accent duy nhất: Teal — gợi cảm giác tin tưởng, tìm lại được */
--accent:        #0d9488;   /* teal-600 */
--accent-light:  #ccfbf1;   /* teal-100 */
--accent-hover:  #0f766e;   /* teal-700 */

/* Trạng thái bài đăng */
--lost-color:    #dc2626;   /* red-600 — Đang mất */
--found-color:   #16a34a;   /* green-600 — Nhặt được */
--resolved-color:#6b7280;   /* gray-500 — Đã tìm thấy */

/* Text */
--text-primary:  #111827;   /* gray-900 */
--text-muted:    #6b7280;   /* gray-500 */

/* Border */
--border:        #e5e7eb;   /* gray-200 */
```

> Không dùng màu tím/xanh dương neon kiểu AI (THE LILA BAN từ taste-skill).
> Không dùng `#000000` thuần — dùng gray-900.

---

## 4. Typography

```css
/* Font chính */
font-family: 'Geist', 'Outfit', system-ui, sans-serif;

/* Scale */
Heading 1 (Trang chủ):    text-3xl md:text-4xl font-semibold tracking-tight
Heading 2 (Section):      text-xl font-semibold
Heading 3 (Card title):   text-base font-medium
Body:                     text-sm text-gray-600 leading-relaxed
Caption / label:          text-xs text-gray-500
Số liệu thống kê (admin): font-mono text-2xl font-semibold
```

**Cấm:**
- `Inter` font
- H1 quá to gây cảm giác la hét
- Gradient text trên heading lớn
- Serif font (không phù hợp với web app thực dụng)

---

## 5. Layout Rules

### Trang chính (Home)
- **Không dùng centered Hero full-page** — Layout split: filter sidebar trái, danh sách phải
- Grid bài đăng: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`
- Dùng CSS Grid, không dùng flexbox percentage math
- Container tối đa: `max-w-6xl mx-auto px-4`

### Bài đăng (PostCard)
- Không dùng 3 card ngang bằng nhau (3-column equal card là **BANNED** theo taste-skill)
- Thay bằng: card dọc trong lưới 2-3 cột, hoặc list dạng horizontal card (ảnh trái + nội dung phải)
- Badge "Mất đồ" / "Nhặt được" phải nổi rõ, góc trên card

### Form (đăng bài, đăng nhập)
- Label luôn ở trên input (không placeholder thay label)
- `gap-2` giữa label và input
- Error text ngay dưới input, màu red-600
- Helper text optional nhưng nên có trong markup

### Mobile first
- Mọi layout asymmetric phải về `w-full single column` ở `< 768px`
- Không để tràn ngang trên mobile
- Dùng `min-h-[100dvh]` thay vì `h-screen`

---

## 6. Component Rules

### Badge trạng thái
```jsx
// Luôn dùng pattern này cho badge
const badgeClass = {
  lost:     'bg-red-100 text-red-700 border border-red-200',
  found:    'bg-green-100 text-green-700 border border-green-200',
  resolved: 'bg-gray-100 text-gray-500 border border-gray-200',
}
// rounded-full px-2.5 py-0.5 text-xs font-medium
```

### Button
```jsx
// Primary
'bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium
 transition-colors active:scale-[0.98]'

// Secondary
'border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm
 font-medium transition-colors active:scale-[0.98]'

// Danger
'border border-red-200 hover:bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm
 font-medium transition-colors'
```

> Thêm `active:scale-[0.98]` để có tactile feedback (yêu cầu của taste-skill)

### Card
```jsx
'bg-white border border-gray-200/70 rounded-2xl overflow-hidden
 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_16px_-4px_rgba(0,0,0,0.1)]
 transition-shadow'
```
> Shadow tint nhẹ theo màu nền, không dùng shadow đen đậm

### Input / Select
```jsx
'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm
 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500
 placeholder:text-gray-400 transition-colors'
```

### Skeleton loader
- Luôn implement skeleton loader khớp với layout thật
- Dùng `animate-pulse bg-gray-100 rounded` — không dùng spinner tròn generic
- Skeleton PostCard phải có cùng chiều cao với card thật

### Empty state
- Phải có icon (Phosphor), heading, mô tả ngắn, và CTA button
- Ví dụ: "Chưa có bài đăng nào. Hãy là người đầu tiên đăng tin!"
- Không để trang trống trắng

---

## 7. UI Patterns cụ thể cho từng trang

### Home — Danh sách bài đăng
```
┌─ Navbar ──────────────────────────────────┐
├─ Filter bar (horizontal, sticky top) ─────┤
│  [Tất cả] [Mất đồ] [Nhặt được]  [Danh mục ▾] [Khu vực ▾]
├─ Grid bài đăng ───────────────────────────┤
│  ┌────┐ ┌────┐ ┌────┐
│  │Card│ │Card│ │Card│   ← 3 cols desktop
│  └────┘ └────┘ └────┘
│  ┌────┐ ┌────┐           ← 2 cols tablet
│  └────┘ └────┘
│  ┌──────────┐            ← 1 col mobile
│  └──────────┘
```

### PostCard — Cấu trúc
```
┌─────────────────────────────┐
│ [Ảnh]                       │
│  ┌─badge: MẤT ĐỒ ─────┐    │
│  └─────────────────────┘    │
│ Title (2 dòng max, truncate)│
│ 📍 Thư viện  🕐 20/05/2026  │
│ [Xem chi tiết →]            │
└─────────────────────────────┘
```

### PostDetail — Chi tiết bài
- Layout 2 cột: nội dung trái (8/12), sidebar phải (4/12)
- Sidebar: Match suggestions + nút nhắn tin
- Ảnh: carousel hoặc grid nhỏ nếu nhiều ảnh

### Match Suggestion
```
┌── Gợi ý khớp ──────────────────────────┐
│ Hệ thống tìm thấy 2 bài đăng tương tự  │
│                                         │
│ ┌─ Match card ──────────────────────┐   │
│ │ [Nhặt được ví màu đen]            │   │
│ │ Tầng 1 Thư viện · 22/05/2026      │   │
│ │ Score: ●●●○○   [Liên hệ →]       │   │
│ └───────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

### Admin Dashboard
- VISUAL_DENSITY tăng lên 7 cho trang này
- Dùng `divide-y` thay card box cho table data
- Số liệu: `font-mono`, không làm tròn đẹp giả (99.9%) — dùng số thật
- Biểu đồ: Chart.js, nền trắng, không đổ màu loạn

---

## 8. Motion & Transition

Với `MOTION_INTENSITY: 4`, chỉ dùng CSS transition, không cần Framer Motion:

```css
/* Transition mặc định cho tất cả interactive element */
transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);

/* Page change (dùng CSS class) */
.page-enter { opacity: 0; transform: translateY(8px); }
.page-enter-active { opacity: 1; transform: translateY(0); transition: all 0.25s ease; }

/* Card hover */
.card:hover { transform: translateY(-2px); }

/* Stagger list items */
.post-item:nth-child(1) { animation-delay: 0ms; }
.post-item:nth-child(2) { animation-delay: 80ms; }
.post-item:nth-child(3) { animation-delay: 160ms; }
```

**Cấm:**
- Animate `top`, `left`, `width`, `height`
- Chỉ animate `transform` và `opacity`
- Không spam `z-50` bừa bãi

---

## 9. Content & Data — Anti Slop Rules (từ taste-skill)

**Dữ liệu mẫu (seed.sql) phải dùng:**
- Tên sinh viên thật: `Nguyễn Minh Khôi`, `Trần Thị Bảo Châu` — không phải `John Doe`
- Địa điểm thật trong trường: `Thư viện tầng 3`, `Căn tin A`, `Sân bóng`, `Ký túc xá B3`
- Thời gian có vẻ organic: `2026-05-13 08:42`, `2026-05-21 14:07` — không phải `2026-05-01 00:00`
- Mô tả tự nhiên: "Ví da màu nâu, có dán sticker gấu" — không phải "Ví màu đen"
- Số điện thoại organic: `0912 847 391` — không phải `0912 345 678`

**UI copy phải:**
- Dùng động từ cụ thể: "Đăng tin mất đồ", "Tìm người nhặt được" — không phải "Seamless", "Elevate"
- Thông báo rõ ràng: "Bạn có 1 gợi ý khớp mới" — không phải "New notification"

---

## 10. Responsive Breakpoints

```
Mobile:   < 640px   → 1 cột, full width, bottom nav
Tablet:   640-1024px → 2 cột, sidebar ẩn
Desktop:  > 1024px  → 3 cột grid, sidebar hiện
```

**Navbar mobile:** Dùng bottom navigation bar (giống app điện thoại) thay top nav ở mobile.
Tabs: Home · Đăng tin · Tin nhắn · Cá nhân

---

## 11. Prompt mẫu để dùng với AI agent

Copy đoạn này khi muốn generate 1 component mới:

```
Đọc UI_RULES.md và SKILL.md (taste-skill) trước khi viết code.

Tạo component [TÊN COMPONENT] cho project Student Lost & Found.

Context:
- Stack: React + Tailwind CSS v3
- Font: Geist / Outfit
- Accent: teal-600 (#0d9488)
- Icons: @phosphor-icons/react strokeWidth=1.5
- DESIGN_VARIANCE: 5, MOTION_INTENSITY: 4, VISUAL_DENSITY: 5

Yêu cầu:
- [Mô tả chức năng]
- Phải có: loading state, empty state, error state
- Responsive: mobile-first, 1 cột dưới 640px
- Không dùng Inter font, không dùng 3 card ngang bằng nhau
- Active state button: active:scale-[0.98]
- Shadow card nhẹ, không shadow đen đậm

Output: JSX , clean code, không comment thừa.
```

---

## 12. File tham chiếu khi làm việc

| Cần gì | Đọc file nào |
|---|---|
| Kiến trúc folder | `PROJECT_STRUCTURE.md` |
| API, DB, logic backend | `AGENT_RULES.md` |
| UI, component, style | `UI_RULES.md` (file này) |
| Design taste, motion, layout | `SKILL.md` (taste-skill) |
