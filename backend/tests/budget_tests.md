Báo Cáo Kịch Bản Kiểm Thử (Test Report): Quản Lý Ngân Sách (Budget Management)

Tài liệu này ghi lại chi tiết các kịch bản kiểm thử (test cases) và phương pháp luận đã được áp dụng để kiểm thử toàn diện chức năng **Quản Lý Ngân Sách** (`UpsertBudget`, `GetProgress`, `CheckAlert`) trong hệ thống Quản lý Tài chính Cá nhân.

## 1. Mục Đích
Đảm bảo độ tin cậy, tính chính xác trong các phép toán tính tỷ lệ %, hiệu năng khi gọi Stored Procedure, và khả năng chịu lỗi của chức năng thiết lập ngân sách thông qua một chu trình kiểm thử chuẩn SQA bao gồm: **Unit Test**, **Integration Test**, **Fuzz Test**, và **Load Test**.

---

## 2. Các Mức Độ Kiểm Thử Đã Thực Hiện

### 2.1. Unit Test (Kiểm Thử Mức Đơn Vị)
- **Tệp thực thi:** `tests/unit/budget.service.test.ts` và `tests/unit/budget.dto.test.ts`
- **Mục tiêu:** Kiểm tra "bức tường lửa" Zod DTO và phần logic nghiệp vụ lõi (Service Layer) độc lập với Database.
- **Phương pháp:** Sử dụng `jest.unstable_mockModule` để giả lập `BudgetRepository` và `CategoryRepository`.
- **Các kịch bản (Test Cases) cụ thể:**
  1. **DTO:** Chặn đứng các dữ liệu rác ngay từ đầu (báo lỗi HTTP 400 nếu số tiền âm, hoặc tháng không hợp lệ như tháng 13).
  2. **Service (Upsert):** Cho phép thiết lập ngân sách thành công đối với danh mục Chi (`EXPENSE`).
  3. **Service (SQA Rule):** Bẫy lỗi thành công, chặn không cho phép lập ngân sách đối với danh mục Thu (`INCOME`).
  4. **Service (Alerts):** Hàm `checkBudgetAlert` tính toán và trả về chính xác cảnh báo `WARNING` (đạt 80%) và `DANGER` (vượt 100%).

### 2.2. Integration Test (Kiểm Thử Tích Hợp API)
- **Tệp thực thi:** `tests/integration/budget.api.test.ts`
- **Mục tiêu:** Kiểm tra sự tương tác giữa Controller, Service và Database. Đảm bảo Middleware xác thực và câu lệnh CSDL (đặc biệt là cơ chế Upsert và Stored Procedure) hoạt động chính xác.
- **Phương pháp:** Sử dụng `supertest` kết nối tới Express app, truyền Token giả lập để bắn các HTTP Requests.
- **Các kịch bản (Test Cases) cụ thể:**
  1. `POST /api/v1/budgets`: Thiết lập thành công (Status 201).
  2. `POST /api/v1/budgets`: Lỗi Validation Zod trả về đúng HTTP 400.
  3. `POST /api/v1/budgets`: Lỗi bảo mật (TC-AUTH-07), không có Token trả về HTTP 401 Unauthorized.
  4. `GET /api/v1/budgets/progress`: Gọi thành công Stored Procedure `sp_TinhTienDoNganSach` và trả về kết quả tiến độ (Status 200).

### 2.3. Fuzz Test (Kiểm Thử Mờ/Bơm Rác)
- **Tệp thực thi:** `tests/fuzz/budget.service.fuzz.test.ts`
- **Mục tiêu:** Đảm bảo tính chống chịu (Resilience) của hệ thống khi API bị dội bom bởi các tham số không định dạng.
- **Phương pháp:** Tự sinh hàng nghìn Payload rác (amount là string, month là null, category_id là số âm,...) và đẩy liên tục vào endpoint.
- **Tiêu chí đánh giá:** Hệ thống bắt lỗi gọn gàng qua Global Error Handler, trả về JSON lỗi chuẩn xác mà không bị crash Node.js.

### 2.4. Load Test (Kiểm Thử Chịu Tải)
- **Tệp thực thi:** `tests/load/budget.load.test.ts`
- **Mục tiêu:** Đo lường giới hạn chịu tải của CSDL khi phải liên tục thực thi Stored Procedure tính toán tiến độ.
- **Phương pháp:** Sử dụng công cụ `autocannon`. Giả lập 100 users kết nối đồng thời liên tục bắn request `GET /api/v1/budgets/progress` trong 10 giây.
- **Chỉ số theo dõi:**
  - Tổng lượng request xử lý thành công.
  - Latency trung bình và Latency p99.
  - Tỉ lệ lỗi (Error rate / Non-2xx Responses) để xem DB có bị "nghẽn cổ chai" (bottleneck) không.

---

## 3. Cấu Trúc Dữ Liệu Ảo (Mock Data)
- **Tệp chứa dữ liệu:** `tests/mocks/budget.mock.ts`
- **Được thiết kế bao gồm:**
  - `mockCategories`: Phân loại sẵn các danh mục thành `INCOME` (để test bẫy lỗi) và `EXPENSE` (để test luồng thành công).
  - `mockBudgets`: Các mảng dữ liệu giả lập bảng Budgets dưới DB.
  - `mockBudgetPayloads`: Các kịch bản JSON đầu vào được định nghĩa sẵn (`valid`, `invalidAmount`, `invalidMonth`, `incomeCategory`) giúp tái sử dụng code dễ dàng trong các Unit Test.

---

## 4. Hướng Dẫn Thực Thi

Bạn có thể chạy các kịch bản kiểm thử trực tiếp thông qua NPM Scripts đã cấu hình:

- **Chạy toàn bộ Unit, Integration và Fuzz Test:**
  ```bash
  npm run test
  ```
- **Chạy từng loại kiểm thử cụ thể:**
  - `npm run test:unit`
  - `npm run test:integration`
  - `npm run test:fuzz`
- **Chạy kiểm thử chịu tải (Load Test):**
  1. Khởi động server trong một terminal khác (`npm run dev`).
  2. Tại terminal hiện tại chạy: 
     ```bash
     npm run test:load
     ```
   *(Lưu ý: Bạn có thể cần set biến môi trường `TEST_JWT_TOKEN` chứa token hợp lệ trong file cấu hình load test trước khi chạy).*