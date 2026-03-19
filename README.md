# 🌾 Sổ tay Nông dân số (AgriKnowledge_Web)

Sổ tay Nông dân số là hệ thống bảng điều khiển (Dashboard) thiết kế theo phong cách SaaS hiện đại chuyên cung cấp thông tin, biểu đồ phân tích và diễn biến giá cả các mặt hàng nông sản (Cà phê, Ca cao, Gạo, Ngô, Đậu nành...).

Dự án này sử dụng kiến trúc hoạt động độc lập giữa Client (Frontend) và API data (Backend).

## ✨ Tính năng chính

- **Giao diện Dashboard SaaS hiện đại:** Màn hình quản lý chuyên nghiệp, thân thiện và đáp ứng đầy đủ với biểu đồ trực quan (Chart.js).
- **Phân tích Xu hướng Thị trường Nông sản:**
  - Bảng tỷ giá và thống kê biến động giá cập nhật qua 7 ngày.
  - Tự động cào dữ liệu gốc (Web Scraping) và chuẩn hoá theo thời gian thực (real-time).
- **RESTful API Backend:** Được thiết kế logic theo mô hình Controller - Router - Service đảm bảo việc gọi dữ liệu từ Client chạy mượt mà, chịu tải cao cùng cơ chế Caching chống spam.

## 🛠️ Công nghệ sử dụng

- **Frontend:** HTML5, CSS3, Vanilla JavaScript, thư viện Chart.js.
- **Backend:** Node.js, Express.js.
  - **Dependencies:** `axios` (gọi HTTP requests), `cheerio` (phân tích HTML DOM - Web Scraping), `cors` (xử lý cross-origin).

## 📂 Cấu trúc dự án

```text
AgriKnowledge_Web/
├── backend/                  # Nơi chứa mã nguồn REST API Backend
│   ├── config/               
│   ├── controllers/          # Nhận và xử lý yêu cầu phản hồi HTTP
│   ├── routes/               # Quản lý đường dẫn (ví dụ: /api/prices)
│   ├── services/             # Xử lý logic nghiệp vụ, cào dữ liệu (Cheerio)
│   ├── utils/                # Hàm tiện ích (định dạng cấu trúc tiền)
│   ├── server.js             # Điểm khởi chạy của Backend
│   └── package.json
├── css/                      # Stylesheet tĩnh (CSS)
├── js/                       # Mã Javascript cho Frontend
├── index.html                # Trang Landing Page (nếu có)
├── login.html                # Trang Đăng nhập
├── register.html             # Trang Đăng ký
└── dashboard.html            # Trang Bảng điều khiển (SaaS Dashboard)
```

## 🚀 Hướng dẫn Cài đặt & Sử dụng

### 1. Yêu cầu hệ thống
- [Node.js](https://nodejs.org/) (khuyến nghị phiên bản 16.x trở lên).

### 2. Cài đặt Backend API
Do frontend cần lấy dữ liệu từ API, bạn phải khởi động server backend trước:

```bash
# Di chuyển tới thư mục backend
cd backend

# Cài đặt các thư viện cần thiết
npm install

# Khởi chạy máy chủ (sẽ chạy mặc định trên port 3000)
node server.js
```
Khi chạy thành công, console sẽ hiển thị:
`Backend API đang chạy tại http://localhost:3000`

### 3. Chạy Frontend
Bạn không cần một máy chủ cục bộ cầu kỳ cho Frontend. Bạn chỉ cần mở các file `.html` trực tiếp trên trình duyệt của bạn:

- Chuột phải vào file `login.html` hoặc `dashboard.html` $\rightarrow$ chọn **Open with Live Server** (nếu sử dụng VSCode extension), hoặc click đúp chuột mở trực tiếp bằng Chrome/Edge.
- API Backend sẽ được tự động gọi để lấy dữ liệu đổ vào biểu đồ của Dashboard.

## 📝 Giấy phép
Dự án được bảo lưu bản quyền. Không sử dụng vào mục đích thương mại khi chưa có sự cho phép.
