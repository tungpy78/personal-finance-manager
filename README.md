# 🚀 Hệ Thống Quản Lý Chi Tiêu Cá Nhân - Backend Core

Chào mừng team đến với kho lưu trữ Backend của dự án! 
Kho lưu trữ này đã được thiết lập sẵn toàn bộ nền móng kiến trúc chuẩn SQA (Bảo mật, Bắt lỗi toàn cục, Kết nối DB). 

Dưới đây là tài liệu hướng dẫn để anh em phát triển các tính năng tiếp theo (Giao dịch, Ngân sách, Danh mục) một cách đồng nhất và chuyên nghiệp.

---

## 🛠 1. Hướng dẫn Cài đặt (Dành cho thành viên mới)

Khi clone code về máy lần đầu, hãy thực hiện các bước sau:

**1. Clone dự án (từ nhánh develop):**
```bash
git clone [https://github.com/tungpy78/personal-finance-manager.git](https://github.com/tungpy78/personal-finance-manager.git)
cd personal-finance-manager
git checkout develop
```

**2. Cài đặt thư viện:**
```bash
cd backend
npm install
```

**3. Thiết lập biến môi trường:**
Tạo một file `.env` nằm trong thư mục `backend` và copy cấu hình sau (thay đổi thông tin DB cho khớp với máy cá nhân):
```text
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=mat_khau_cua_ban
DB_NAME=finance_manager
JWT_SECRET=Chuyen_Nghanh_IT_PTIT_2026
JWT_EXPIRES_IN=1d
```

**4. Chạy Server:**
```bash
npm run dev
```

---

## 🏗 2. Kiến trúc 3 Lớp Chuẩn SQA (Layered Architecture)

Hệ thống tuân thủ nghiêm ngặt mô hình 3 lớp. **Tuyệt đối không viết query Database trong Controller!**

Luồng đi của một API chuẩn sẽ như sau:
**`Client`** ➡ **`Router`** (Kẹp Middleware bảo vệ/Zod) ➡ **`Controller`** (Nhận/Trả kết quả) ➡ **`Service`** (Xử lý nghiệp vụ) ➡ **`Repository/DAO`** (Tương tác Database).

### Quy định Code cho từng Lớp:
* **📁 dtos (Data Transfer Object):** Nơi chứa `Zod Schema`. Mọi dữ liệu đầu vào (body, params) phải được validate ở đây trước khi vào hệ thống.
* **📁 controllers:** Chỉ làm 2 việc: Nhận Request và dùng `AppResponse` trả về Response. Mọi lỗi nghiệp vụ cứ `throw`, Global Error Handler sẽ tự bắt.
* **📁 services:** "Trái tim" của hệ thống. Chứa if/else, tính toán logic. **Không** import Express hay Sequelize vào đây.
* **📁 repositories:** Lớp duy nhất được phép gọi lệnh của Sequelize (`User.create`, `Transaction.findAll`...). Hàm ở đây phải trả về dữ liệu thuần (`.toJSON()`), không trả về object của Sequelize.

---

## 🌿 3. Quy trình làm việc Git (Git Flow)

Để tránh xung đột code (Conflict) và bảo vệ mã nguồn, team tuân thủ quy trình sau:

**🔥 Nhánh Tối cao:**
* `main`: Code hoàn chỉnh 100%, sẵn sàng nộp bài (Tuyệt đối không tự ý đụng vào).
* `develop`: Nhánh làm việc chung của cả team.

**👨‍💻 Quy trình code Tính năng mới:**

**Bước 1:** Cập nhật code mới nhất từ team trước khi làm:
```bash
git checkout develop
git pull origin develop
```

**Bước 2:** Tạo nhánh riêng cho tính năng của mình (Ví dụ làm Giao dịch):
```bash
git checkout -b feature/transaction
```

**Bước 3:** Code, Test bằng Postman cẩn thận.

**Bước 4:** Lưu và Đẩy code lên mạng:
```bash
git add .
git commit -m "feat: Hoàn thành API Thêm giao dịch"
git push origin feature/transaction
```

**Bước 5:** Lên GitHub, tạo **Pull Request (PR)** gửi vào nhánh `develop`. Lead (Tùng) sẽ review code, nếu đạt chuẩn SQA mới cho phép Merge.

---

## 🛡 4. Tiêu chuẩn Đảm bảo Chất lượng (SQA)
1. **Không dùng `any`:** Trong logic hệ thống, phải định nghĩa `interface` hoặc `type` đàng hoàng.
2. **Xử lý Response:** Luôn dùng `AppResponse.success` hoặc `AppResponse.error` để Frontend dễ đọc.
3. **Bảo mật API:** Các API nhạy cảm phải được gắn middleware `protect` (đã viết sẵn trong thư mục middlewares).
4. **Viết Testcase:** Mỗi tính năng code xong phải có testcase trên Postman (chuẩn bị sẵn để ghi vào báo cáo).

**Chúc anh em code mượt, không bug! 🚀**
