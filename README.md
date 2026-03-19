# 🌾 Sổ tay Nông dân số (AgriKnowledge_Web)

Sổ tay Nông dân số là hệ thống bảng điều khiển (Dashboard) thiết kế theo phong cách SaaS hiện đại chuyên cung cấp thông tin, biểu đồ phân tích, diễn biến giá cả các mặt hàng nông sản và nền tảng quản lý chuyên nghiệp cho Nông dân cũng như Quản trị viên (Admin).

Dự án sử dụng cơ sở dữ liệu **MySQL**, hoạt động độc lập giữa Client (Frontend) và RESTful API (Backend).

## ✨ Tính năng chính

- **Giao diện Dashboard SaaS hiện đại:** Thân thiện, đáp ứng các biểu đồ trực quan (Chart.js), cập nhật dữ liệu liên tục.
- **Hệ thống Tài khoản & Phân quyền:** Xác thực qua Token (JWT API), tự động phân luồng giao diện:
  - Tài khoản mặc định (**Nông dân**): Xem các thông số môi trường, thời tiết, lệnh thu mua và biến động giá nông sản. 
  - Tài khoản **Quản trị (Admin)**: Trang `admin-dashboard.html` quản lý danh sách nông dân, lệnh thu mua. Bảo mật chống truy cập trái phép bằng Local Storage Token Guard.
- **Phân tích Xu hướng Thị trường:**
  - Cào dữ liệu gốc (Web Scraping) và chuẩn hóa dữ liệu tự động (Cron-like realtime).
- **RESTful API Backend & Cơ sở dữ liệu:** Hệ thống API Controller - Routes chịu tải cao, tích hợp CSDL **MySQL** tự động khởi tạo bảng (Auto-Migration) cực kỳ tiện lợi.

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, thư viện Chart.js.
- **Backend:** Node.js, Express.js.
  - **Dependencies:** `mysql2` (Kết nối CSDL), `bcrypt` (Bảo mật Mật khẩu), `jsonwebtoken` (Xác minh đăng nhập/Phiên làm việc), `dotenv` (Biến môi trường), `cheerio` & `axios` (Cào dữ liệu thị trường), `cors`.

## 📂 Cấu trúc dự án

```text
AgriKnowledge_Web/
├── backend/                  # REST API Backend
│   ├── config/db.js          # Kết nối MySQL & Auto-migrate database
│   ├── controllers/          # Nhận và xử lý yêu cầu phản hồi HTTP (Auth, Prices)
│   ├── routes/               # Quản lý đường dẫn (authRoutes, priceRoutes)
│   ├── services/             # Logic nghiệp vụ, cào dữ liệu (Cheerio)
│   ├── utils/                # Hàm định dạng bổ trợ
│   ├── server.js             # Máy chủ khởi chạy Backend
│   ├── .env                  # Cấu hình Database & Security Keys
│   └── package.json
├── css/                      # Stylesheet (CSS)
├── js/                       # JS Logic (auth.js, script.js)
├── index.html                # Trang Landing Page
├── login.html                # Trang Đăng nhập
├── register.html             # Trang Đăng ký
├── dashboard.html            # Trang Bảng điều khiển Hệ thống dành cho Nông dân
└── admin-dashboard.html      # Trang Quản trị thông số toàn cục dành cho Admin
```

## 🚀 Hướng dẫn Cài đặt & Sử dụng

### 1. Yêu cầu hệ thống
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 16.x trở lên).
- **MySQL Server**: Khởi chạy qua XAMPP, WAMP, Docker hoặc App MySQL riêng lẻ trên Window.

### 2. Cài đặt CSDL và Backend API
Chạy máy chủ Backend để ứng dụng kết nối dữ liệu. Bạn phải cấu hình kết nối DB trước tiên:

1. Di chuyển tới thư mục backend và cài đặt thư viện
```bash
cd backend
npm install
```

2. Kiểm tra nội dung file `backend/.env` (Nếu cài mật khẩu root MySQL cho Database, hãy sửa thông số ở lệnh: `DB_PASSWORD` tương ứng, mặc định để trống nếu đang dùng XAMPP gốc).
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=agriknowledge
DB_PORT=3306
JWT_SECRET=supersecretkey_agriknowledge_2026
PORT=3000
```

3. Khởi chạy mã nguồn backend:
```bash
node server.js
```
*Lưu ý: Hệ thống sẽ **tự động** khởi tạo CSDL `agriknowledge` và các Table (bảng người dùng) tại lần chạy đầu tiên. Bạn không cần tự viết lệnh tạo script SQL thủ công.* Console sẽ báo `✅ Cơ sở dữ liệu MySQL và bảng users đã sẵn sàng.`

### 3. Khởi tạo tài khoản và Quản trị Web
Frontend được thiết kế gọn nhẹ không qua build. Bạn chỉ cần click đúp vào các file `.html` hoặc khởi chạy qua **Live Server** (VSC) để tương tác:

- Bấm nút **Đăng ký** trang `register.html` hoặc tại website. Bất kỳ tài khoản mới nào tự tạo đều được giới hạn ở phân quyền **Nông dân**.
- Để cấp tài khoản **Admin** cho quản trị viên, dùng Postman hoặc Thunder Client REST API gửi một Request HTTP Method **POST** vào endpoint tự tạo Admin:
  - **URL:** `http://localhost:3000/api/auth/create-admin`
  - **Body (JSON):** 
    ```json
    {
      "email": "admin1@agri.com",
      "password": "123"
    }
    ```

Đăng nhập bằng các tài khoản tương ứng, hệ thống sẽ bảo mật và tự điều hướng chuẩn xác đến bảng phân quyền Admin hoặc Người dùng mà ta đã thiết lập! Cảm ơn bạn.

## 📝 Giấy phép
Dự án mở tuỳ biến. Nghiêm cấm sử dụng vào mục đích thương mại trái quy định gốc.
