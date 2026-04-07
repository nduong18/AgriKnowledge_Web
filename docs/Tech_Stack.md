# Nền Tảng Kỹ Thuật và Công Nghệ (Tech Stack)

Dự án: **Sổ tay Nông dân số** (Nền tảng Hỗ trợ Nông nghiệp Thông minh)
Kiến trúc tổng thể của hệ thống được xây dựng theo mô hình **Client-Server** (Khách - Chủ) linh hoạt, phân tách rõ ràng giữa giao diện người dùng (Frontend) và máy chủ xử lý phân tích (Backend).

## 1. Giao diện người dùng (Frontend)
Hệ thống Frontend không sử dụng các framework hạng nặng (như React/Vue) để đảm bảo tốc độ tải trang cực mượt ở nơi điều kiện mạng kém, phù hợp cho người nông dân:
- **Ngôn ngữ cốt lõi:** HTML5, CSS3, JavaScript (ES6+ / Vanilla JS).
- **Thư viện UI & Nền tảng hiển thị:**
  - **Google Fonts (Inter):** Cung cấp hệ thống phông chữ không chân hiện đại, tối ưu cho giao diện dạng Bảng điều khiển (Dashboard / SaaS).
  - **FontAwesome (v6.4.0):** Hệ thống bộ icon vector phong phú để minh họa các nút chức năng, dự báo thời tiết trực quan.
  - **Chart.js:** Thư viện vẽ biểu đồ JavaScript phục vụ cho việc trực quan hóa sự biến động giá cả của thị trường nông sản và dự báo xu hướng.
- **Thiết kế & Layout:**
  - Ứng dụng CSS Flexbox/Grid và Custom Variables, hỗ trợ hiển thị đáp ứng (Responsive) tương thích tốt trên cả Mobile (nông dân xem ở ruộng) và Web Desktop (cho thương lái/doanh nghiệp).

## 2. Máy chủ & Xử lý nghiệp vụ (Backend)
Backend được thiết kế dưới dạng RESTful API, hoàn toàn tách biệt, sẵn sàng mở rộng và kết nối với các hệ thống Mobile Apps sau này:
- **Môi trường & Framework Web:**
  - **Node.js:** Nền tảng thực thi mã JavaScript phía máy chủ, đạt hiệu năng cao nhờ kiến trúc xử lý I/O không đồng bộ.
  - **Express.js (v5.2.1):** Web framework phổ biến nhất của Node, cấu hình Routing, xử lý Middleware mạnh mẽ để điều phối hệ thống API.
- **Bảo mật hệ thống (Security):**
  - **Bcrypt (v6.0.0):** Hàm băm (hash) mật khẩu của nông dân/doanh nghiệp, đảm bảo dữ liệu đăng nhập an toàn ngay cả khi bị rò rỉ CSDL.
  - **JSON Web Token - JWT (v9.0.3):** Hệ thống sinh Token (stateless) phân quyền và quản lý phiên tiếp xúc (người nông dân, môi giới thu mua, admin).
  - Tích hợp **CORS** và biến môi trường **Dotenv**.
- **Thu thập Dữ liệu tự động (Crawl / Scraping):**
  - Hệ thống sử dụng **Axios** kết hợp **Cheerio** để tạo ra các con bot (crawler) chuyên đi lấy và cập nhật giá nông sản, thông tin thị trường, khuyến nông từ báo mạng định kỳ để đưa về Dashboard.

## 3. Hệ thống Cơ sở dữ liệu (Database Layer)
Dự án áp dụng mô hình thiết kế Polyglot Persistence (hỗn hợp Cơ sở dữ liệu) để giải quyết đặc thù của ngành Nông nghiệp thông minh:
- **Cơ sở dữ liệu Quan hệ - MySQL:**
  - Giao tiếp qua package `mysql2`.
  - Nhiệm vụ: Lưu trữ các dữ liệu hành chính chuẩn hóa (Thông tin người dùng, Lịch sử lệnh thu mua, Trạng thái phiên làm việc).
- **Cơ sở dữ liệu Đồ thị - Neo4j (Knowledge Graph Component):**
  - Nhiệm vụ: Đóng vai trò là Bộ não phân tích Kỹ thuật (AI Đồ thị Tri Thức).
  - Lợi ích: Thay thế RDBMS truyền thống để thiết lập kết nối logic dạng đa chiều giữa: `(Cây_Trồng) ↔ (Dịch_Bệnh) ↔ (Đặc_Điểm_Môi_Trường) ↔ (Hóa_Chất/Thuốc)`. Nhờ công nghệ Graph, thao tác nhập "Biểu hiện bệnh" lập tức truy vết ra kết luận và giải pháp cục bộ cực nhanh.

## 4. Tóm lược Kiến trúc Hệ thống
1. Người nông dân vào Web/Dashboard nhập biểu hiện cây bệnh -> Yêu cầu (Request) đẩy qua API.
2. NodeJS (Backend) tiếp nhận, kiểm tra phân quyền bằng JWT.
3. Node truy vấn qua Neo4j (Graph DB) để tìm kiếm nút Tri thức giải quyết theo Thời tiết lấy bằng Axios.
4. Trả về giải pháp và Nông dân xem biểu đồ hiển thị trên Chart.js ở giao diện. Lệnh mua bán được lưu tại MySQL.
