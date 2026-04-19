# 🌾 Sổ tay Nông dân số (AgriKnowledge_Web)

Sổ tay Nông dân số là nền tảng web hỗ trợ nông nghiệp theo mô hình Client - Server, gồm dashboard thông tin, dự báo thời tiết, tin tức nông nghiệp, theo dõi giá nông sản, giao thương (marketplace) và khu vực quản trị.

Dự án sử dụng:
- Frontend: HTML/CSS/Vanilla JavaScript (không cần build)
- Backend: Node.js + Express
- Database: MySQL (tự động tạo database/bảng khi chạy lần đầu)

## ✨ Tính năng chính

- Xác thực và phân quyền JWT với 3 vai trò: `farmer`, `merchant`, `admin`.
- Dashboard người dùng:
  - Xem thời tiết theo khu vực.
  - Xem biểu đồ giá nông sản (dữ liệu crawl + cache).
  - Theo dõi thông tin tổng hợp trên giao diện SaaS.
- Tin tức nông nghiệp:
  - Người dùng xem danh sách/chi tiết bài viết đã xuất bản.
  - Admin tạo/sửa/xóa/xuất bản bài viết.
- Giao thương (Marketplace):
  - Đăng tin cần bán/cần mua theo vai trò.
  - Lọc theo loại tin, người đăng, nhóm cây trồng, khu vực.
  - Hiển thị thời gian + ngày đăng tin.
  - Nhắn tin trực tiếp giữa các tài khoản.
- Khu vực quản trị:
  - Quản lý nông sản theo dõi giá (`products`).
  - Quản lý tài khoản nông dân.
  - Quản lý tin đăng giao thương.

## 🏗️ Kiến trúc tổng quan

```text
Frontend (HTML/CSS/JS) <-> REST API (Express) <-> MySQL
                           |
                           +-> Scraping giá nông sản (Axios + Cheerio)
```

- Frontend được phục vụ trực tiếp bởi `express.static(...)` từ `backend/server.js`.
- Backend tự động khởi tạo DB và các bảng trong `backend/config/db.js`.

## 📂 Cấu trúc thư mục

```text
AgriKnowledge_Web/
|- backend/
|  |- config/
|  |  |- db.js
|  |- controllers/
|  |- middleware/
|  |- routes/
|  |  |- authRoutes.js
|  |  |- adminRoutes.js
|  |  |- priceRoutes.js
|  |  |- newsRoutes.js
|  |  |- marketplaceRoutes.js
|  |  |- messageRoutes.js
|  |- services/
|  |  |- priceService.js
|  |- utils/
|  |  |- priceParser.js
|  |- server.js
|  |- package.json
|  |- .env
|- css/
|- js/
|  |- auth.js
|  |- script.js
|  |- weather.js
|  |- marketplace.js
|- index.html
|- login.html
|- register.html
|- dashboard.html
|- weather.html
|- news.html
|- news-detail.html
|- marketplace.html
|- profile.html
|- admin-products.html
|- admin-farmers.html
|- admin-news.html
|- admin-marketplace.html
|- README.md
```

## ⚙️ Yêu cầu hệ thống

- Node.js 16+ (khuyến nghị Node.js 18+)
- MySQL 8.x (hoặc MySQL từ XAMPP/WAMP)

## 🚀 Cài đặt và chạy dự án

1) Cài dependencies backend

```bash
cd backend
npm install
```

2) Tạo/cập nhật file `backend/.env`

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agriknowledge
DB_PORT=3306
JWT_SECRET=replace_with_a_strong_secret
PORT=3000
```

3) Chạy server

```bash
node server.js
```

4) Mở ứng dụng

- Truy cập: `http://localhost:3000/index.html`
- Hoặc các trang khác: `http://localhost:3000/login.html`, `http://localhost:3000/marketplace.html`, ...

Lưu ý:
- Backend sẽ tự động tạo database và các bảng nếu chưa tồn tại.
- Không cần build frontend.

## 👥 Tài khoản và phân quyền

- Đăng ký từ giao diện `register.html`: tạo tài khoản `farmer` hoặc `merchant`.
- Tạo admin bằng API (nếu cần):

```http
POST /api/auth/create-admin
Content-Type: application/json

{
  "email": "admin1@agri.com",
  "password": "123456",
  "display_name": "Quản trị viên"
}
```

## 🔌 API chính

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/create-admin`
- `PUT /api/auth/profile` (Bearer token)

### Prices
- `GET /api/prices`

### News
- Public:
  - `GET /api/news`
  - `GET /api/news/:id`
- Admin:
  - `GET /api/news/admin/list`
  - `GET /api/news/admin/:id`
  - `POST /api/news`
  - `PUT /api/news/:id`
  - `DELETE /api/news/:id`

### Marketplace
- `GET /api/marketplace`
- `POST /api/marketplace` (Bearer token)
- `PUT /api/marketplace/:id` (Bearer token)
- `DELETE /api/marketplace/:id` (Bearer token)
- `PUT /api/marketplace/:id/verify` (Admin)

### Messages
- `GET /api/messages/conversations` (Bearer token)
- `GET /api/messages/unread-count` (Bearer token)
- `GET /api/messages/:partnerId` (Bearer token)
- `POST /api/messages` (Bearer token)

### Admin
- `GET /api/admin/dashboard`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `DELETE /api/admin/products/:id`
- `GET /api/admin/farmers`
- `POST /api/admin/farmers`
- `PUT /api/admin/farmers/:id`
- `DELETE /api/admin/farmers/:id`

## 🗄️ Database được tạo tự động

Khi server khởi động, hệ thống tự động tạo/cập nhật các bảng:
- `users`
- `products`
- `news`
- `marketplace_posts`
- `messages`

## 🔐 Bảo mật và vận hành

- Mật khẩu được băm bằng `bcrypt`.
- Xác thực API bằng `JWT` trong header `Authorization: Bearer <token>`.
- Khuyến nghị:
  - Không commit `backend/.env`.
  - Đặt `JWT_SECRET` mạnh.
  - Sử dụng mật khẩu DB riêng cho mỗi môi trường.

## 🧪 Ghi chú phát triển

- Dữ liệu giá nông sản được crawl và cache 15 phút để tránh gọi nguồn quá nhiều.
- Frontend hiện tại là Vanilla JS, phù hợp cho triển khai nhanh và dễ bảo trì.
- Chưa có bộ test tự động (script `npm test` hiện đang là placeholder).

## 📝 License

Dự án được chia sẻ cho mục đích học tập và phát triển nội bộ. Hãy bổ sung giấy phép cụ thể (MIT/Apache-2.0/Proprietary) nếu bạn triển khai công khai.
