# AgriKnowledge Web - Sổ Tay Nông Dân Số

AgriKnowledge Web là ứng dụng web hỗ trợ nông nghiệp theo mô hình client-server. Dự án cung cấp dashboard thông tin, thời tiết, giá nông sản, tin tức, marketplace mua bán nông sản, nhắn tin và khu vực quản trị.

Frontend dùng HTML/CSS/Vanilla JavaScript và được phục vụ như static files. Backend dùng Node.js + Express, kết nối MySQL và cung cấp REST API.

## Mục Lục

- [Tính năng](#tính-năng)
- [Kiến trúc](#kiến-trúc)
- [Cấu trúc thư mục](#cấu-trúc-thư-mục)
- [Yêu cầu môi trường](#yêu-cầu-môi-trường)
- [Cài đặt và chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Tài khoản và phân quyền](#tài-khoản-và-phân-quyền)
- [API](#api)
- [Database](#database)
- [Quy tắc phát triển](#quy-tắc-phát-triển)
- [Troubleshooting](#troubleshooting)

## Tính Năng

### Người dùng

- Đăng ký tài khoản nông dân hoặc thương lái.
- Đăng nhập bằng email và mật khẩu.
- Cập nhật hồ sơ cá nhân, tên hiển thị, ảnh đại diện và mật khẩu.
- Xem dashboard tổng quan.
- Xem thời tiết theo khu vực.
- Xem biểu đồ giá nông sản.
- Đọc danh sách tin tức và chi tiết bài viết.
- Xem marketplace, lọc tin mua/bán, nhắn tin với người đăng.

### Thương lái

- Đăng tin cần mua nông sản.
- Quản lý tin đã đăng.
- Nhắn tin trực tiếp với người bán.

### Nông dân

- Đăng tin cần bán nông sản.
- Quản lý tin đã đăng.
- Nhắn tin trực tiếp với người mua.

### Admin

- Quản lý danh sách nông sản theo dõi giá.
- Quản lý tài khoản nông dân.
- Quản lý tin tức.
- Quản lý và xác minh tin marketplace.
- Có quyền truy cập các API `/api/admin/...`.

## Kiến Trúc

```text
Browser
  |
  | Static HTML/CSS/JS from public/
  v
Express Server
  |
  | REST API /api/...
  v
MySQL

Express Server
  |
  | Axios + Cheerio
  v
Nguồn dữ liệu giá nông sản bên ngoài
```

Điểm quan trọng:

- Frontend nằm trong `public/`.
- Backend nằm trong `backend/src/`.
- Backend chỉ serve thư mục `public/`, không serve toàn bộ repo.
- API dùng đường dẫn tương đối `/api/...`, không phụ thuộc hardcode `localhost`.
- File môi trường thật là `backend/.env` và không được commit.
- `backend/node_modules` không được commit.

## Cấu Trúc Thư Mục

```text
AgriKnowledge_Web/
|- public/
|  |- index.html
|  |- login.html
|  |- register.html
|  |- dashboard.html
|  |- weather.html
|  |- market-price.html
|  |- marketplace.html
|  |- news.html
|  |- news-detail.html
|  |- profile.html
|  |- admin-products.html
|  |- admin-farmers.html
|  |- admin-news.html
|  |- admin-marketplace.html
|  |- css/
|  |  |- style.css
|  |- js/
|     |- auth.js
|     |- script.js
|     |- weather.js
|     |- market-price.js
|     |- marketplace.js
|- backend/
|  |- src/
|  |  |- config/
|  |  |  |- db.js
|  |  |  |- env.js
|  |  |- controllers/
|  |  |- middleware/
|  |  |- routes/
|  |  |- services/
|  |  |- utils/
|  |  |- server.js
|  |- server.js
|  |- .env.example
|  |- package.json
|  |- package-lock.json
|- .editorconfig
|- .gitignore
|- README.md
```

Ghi chú:

- `backend/src/server.js` là entrypoint chính.
- `backend/server.js` là wrapper để command cũ `node backend/server.js` vẫn chạy được.
- Thư mục `docs/` đã được bỏ vì README hiện là tài liệu chính.

## Yêu Cầu Môi Trường

- Node.js 18+.
- npm.
- MySQL 8.x hoặc MySQL từ XAMPP/WAMP.
- Trình duyệt hiện đại như Chrome, Edge hoặc Firefox.

Phiên bản Node mới hơn vẫn có thể chạy, nhưng nếu gặp lỗi dependency native như `bcrypt`, nên dùng Node LTS.

## Cài Đặt Và Chạy Dự Án

### 1. Cài dependency backend

```bash
cd backend
npm install
```

### 2. Tạo file môi trường

Tạo file `backend/.env` dựa trên `backend/.env.example`.

```bash
copy .env.example .env
```

Trên PowerShell có thể dùng:

```powershell
Copy-Item .env.example .env
```

Sau đó chỉnh lại thông tin database và `JWT_SECRET`.

### 3. Chạy backend

Cách khuyến nghị:

```bash
cd backend
npm start
```

Cách tương thích với command cũ:

```bash
node backend/server.js
```

### 4. Mở ứng dụng

```text
http://localhost:3000
```

Một số trang thường dùng:

- `http://localhost:3000/index.html`
- `http://localhost:3000/login.html`
- `http://localhost:3000/register.html`
- `http://localhost:3000/dashboard.html`
- `http://localhost:3000/marketplace.html`
- `http://localhost:3000/admin-products.html`

## Scripts

Chạy trong thư mục `backend/`.

```bash
npm start
```

Chạy server.

```bash
npm run dev
```

Hiện đang tương đương `npm start`.

```bash
npm test
```

Kiểm tra cú pháp entrypoint backend bằng `node --check`.

```bash
npm run check
```

Kiểm tra cú pháp `backend/src/server.js`.

## Cấu Hình Môi Trường

File mẫu: `backend/.env.example`.

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=agriknowledge
DB_PORT=3306
JWT_SECRET=replace_with_a_strong_secret
PORT=3000
```

Ý nghĩa:

- `DB_HOST`: host MySQL.
- `DB_USER`: user MySQL.
- `DB_PASSWORD`: mật khẩu MySQL.
- `DB_NAME`: tên database ứng dụng.
- `DB_PORT`: port MySQL, thường là `3306`.
- `JWT_SECRET`: secret để ký JWT, bắt buộc phải đặt giá trị mạnh.
- `PORT`: port chạy web server, mặc định `3000`.

Không commit `backend/.env`.

Nếu secret hoặc mật khẩu database từng bị chia sẻ ra ngoài, hãy đổi lại giá trị mới.

## Tài Khoản Và Phân Quyền

Hệ thống có 3 role:

- `farmer`: nông dân.
- `merchant`: thương lái.
- `admin`: quản trị viên.

Người dùng thường có thể đăng ký từ `register.html`.

Admin có thể được tạo qua API:

```http
POST /api/auth/create-admin
Content-Type: application/json

{
  "email": "admin1@agri.com",
  "password": "123456",
  "display_name": "Quản trị viên"
}
```

Sau khi đăng nhập, client lưu JWT trong `localStorage` và gửi token bằng header:

```http
Authorization: Bearer <token>
```

## API

Base URL khi chạy local:

```text
http://localhost:3000/api
```

Frontend dùng URL tương đối `/api/...`, nên khi deploy cùng server sẽ không cần đổi cấu hình.

### Auth

```http
POST /api/auth/register
POST /api/auth/login
POST /api/auth/create-admin
PUT  /api/auth/profile
```

`PUT /api/auth/profile` yêu cầu JWT.

### Prices

```http
GET /api/prices
```

Lấy dữ liệu giá nông sản. Backend có cache để giảm số lần gọi nguồn bên ngoài.

### News

Public:

```http
GET /api/news
GET /api/news/:id
```

Admin:

```http
GET    /api/news/admin/list
GET    /api/news/admin/:id
POST   /api/news
PUT    /api/news/:id
DELETE /api/news/:id
```

Các route admin yêu cầu JWT admin.

### Marketplace

```http
GET    /api/marketplace
POST   /api/marketplace
PUT    /api/marketplace/:id
DELETE /api/marketplace/:id
PUT    /api/marketplace/:id/verify
```

Ghi chú:

- `GET /api/marketplace` là public.
- Tạo, sửa, xóa tin yêu cầu JWT.
- Xác minh tin yêu cầu admin.

### Messages

```http
GET  /api/messages/conversations
GET  /api/messages/unread-count
GET  /api/messages/:partnerId
POST /api/messages
```

Tất cả route messages yêu cầu JWT.

### Admin

```http
GET    /api/admin/dashboard
GET    /api/admin/products
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
GET    /api/admin/farmers
POST   /api/admin/farmers
PUT    /api/admin/farmers/:id
DELETE /api/admin/farmers/:id
```

Tất cả route `/api/admin/...` yêu cầu JWT admin.

## Database

Backend tự tạo database và bảng khi khởi động nếu chưa tồn tại.

Các bảng chính:

- `users`: tài khoản, mật khẩu đã hash, role, avatar.
- `products`: danh sách nông sản để theo dõi giá.
- `news`: bài viết tin tức.
- `marketplace_posts`: tin mua/bán nông sản.
- `messages`: tin nhắn giữa người dùng.

File xử lý kết nối và khởi tạo database:

```text
backend/src/config/db.js
```

## Frontend

Frontend không có bước build.

Các file HTML nằm trong `public/` vì Express serve thư mục này trực tiếp:

```text
public/index.html
public/dashboard.html
public/marketplace.html
...
```

CSS dùng chung:

```text
public/css/style.css
```

JavaScript dùng chung và theo từng module:

```text
public/js/script.js
public/js/auth.js
public/js/weather.js
public/js/market-price.js
public/js/marketplace.js
```

## Backend

Backend chia theo các lớp chính:

- `routes/`: khai báo endpoint.
- `controllers/`: xử lý request/response.
- `services/`: logic nghiệp vụ phụ trợ, ví dụ crawl giá.
- `middleware/`: xác thực JWT và kiểm tra quyền admin.
- `config/`: cấu hình môi trường và database.
- `utils/`: hàm tiện ích nhỏ.

## Quy Tắc Phát Triển

- Không commit `backend/.env`.
- Không commit `backend/node_modules`.
- Không đặt secret trực tiếp trong source code.
- Khi thêm API mới, khai báo route trong `backend/src/routes/` và xử lý trong `backend/src/controllers/`.
- Khi thêm file frontend mới, đặt trong `public/`.
- Khi gọi API từ frontend, dùng `/api/...`, không hardcode `http://localhost:3000/api/...`.
- Khi đổi schema database, cập nhật logic khởi tạo trong `backend/src/config/db.js`.
- Sau khi sửa backend, chạy:

```bash
cd backend
npm test
```

## Git

Repo đã có `.gitignore` để loại trừ:

- `node_modules/`
- `backend/node_modules/`
- `.env`
- `backend/.env`
- log, build output và file editor/OS.

Nếu lỡ cài dependency, chỉ commit `package.json` và `package-lock.json`, không commit `node_modules`.

## Troubleshooting

### Lỗi `Cannot find module backend/server.js`

Command cũ là:

```bash
node backend/server.js
```

Repo hiện đã có wrapper `backend/server.js`, nên command này vẫn chạy được. Cách khuyến nghị hơn là:

```bash
cd backend
npm start
```

### Lỗi thiếu `JWT_SECRET`

Tạo `backend/.env` và đảm bảo có dòng:

```env
JWT_SECRET=replace_with_a_strong_secret
```

### Lỗi kết nối MySQL

Kiểm tra:

- MySQL đã chạy chưa.
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_PORT` trong `backend/.env` đúng chưa.
- User MySQL có quyền tạo database không.

### PowerShell chặn `npm`

Nếu PowerShell báo không chạy được `npm.ps1`, dùng:

```powershell
npm.cmd start
```

hoặc:

```powershell
npm.cmd test
```

### Port 3000 đã được dùng

Đổi `PORT` trong `backend/.env`:

```env
PORT=3001
```

Sau đó mở:

```text
http://localhost:3001
```

## Trạng Thái Hiện Tại

Dự án hiện phù hợp cho demo, học tập và phát triển nội bộ. Nếu triển khai production, nên bổ sung:

- HTTPS.
- Rate limiting.
- Validation chặt hơn cho request body.
- Logging chuẩn hơn.
- Migration database riêng thay vì auto-migrate trong runtime.
- Test tự động cho controller/service.
- Cơ chế upload ảnh thay vì lưu ảnh base64 dài trong database.
