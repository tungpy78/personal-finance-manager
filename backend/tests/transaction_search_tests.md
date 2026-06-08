# Báo Cáo Kịch Bản Kiểm Thử (Test Report): Search Transaction

Tài liệu này ghi lại chi tiết các kịch bản kiểm thử (test cases) và phương pháp luận đã được áp dụng để kiểm thử toàn diện chức năng **Tìm Kiếm Giao Dịch** (`searchTransactions`) trong hệ thống Quản lý Tài chính Cá nhân.

## 1. Mục Đích
Đảm bảo độ tin cậy, chính xác, hiệu năng và khả năng chịu lỗi của chức năng tìm kiếm giao dịch thông qua một chu trình kiểm thử chuẩn bao gồm: **Unit Test**, **Integration Test**, **Fuzz Test**, và **Load Test**.

---

## 2. Các Mức Độ Kiểm Thử Đã Thực Hiện

### 2.1. Unit Test (Kiểm Thử Mức Đơn Vị)
- **Tệp thực thi:** `tests/unit/transaction.service.unit.test.ts`
- **Mục tiêu:** Kiểm tra phần logic nghiệp vụ (Service Layer) độc lập với Database.
- **Phương pháp:** Sử dụng `jest.mock()` để giả lập (mock) `TransactionRepository.findByCriteria`. Thay vì gọi tới cơ sở dữ liệu thật, trả về tập dữ liệu ảo (Mock Data).
- **Các kịch bản (Test Cases) cụ thể:**
  1. Trả về toàn bộ danh sách giao dịch của user khi bộ lọc (filters) rỗng.
  2. Xác minh logic sắp xếp theo thời gian mới nhất (`date_desc`) hoạt động chính xác trên bộ nhớ (in-memory sort).
  3. Xác minh logic sắp xếp theo số tiền tăng dần (`amount_asc`) hoạt động chính xác.
  4. Đảm bảo Service ném lỗi (Throw Error) với message thích hợp khi Database Repository gặp sự cố (bị lỗi).

### 2.2. Integration Test (Kiểm Thử Tích Hợp)
- **Tệp thực thi:** `tests/integration/transaction.service.integration.test.ts`
- **Mục tiêu:** Kiểm tra tích hợp toàn diện từ đầu vào API Endpoint (`POST /api/v1/transactions/search`), đi qua các Middleware (xác thực `protect`, validate `SearchTransactionSchema`) đến Controller, Service và kết nối Database thực tế.
- **Phương pháp:** Khởi động ứng dụng Express trên một cổng ngẫu nhiên, sử dụng Native `fetch` gửi HTTP requests thật mang JWT Token và Payload kiểm thử tới máy chủ, thực hiện truy vấn xuống CSDL MySQL thật và kiểm tra phản hồi HTTP (mã trạng thái 200, 400, dữ liệu trả về) sau đó dọn dẹp (cleanup) toàn bộ dữ liệu test.
- **Các kịch bản (Test Cases) cụ thể:**
  1. Truy vấn thành công dữ liệu từ DB với điều kiện filter rỗng qua HTTP (HTTP 200).
  2. Lọc chính xác thông qua mệnh đề `LIKE` của SQL (tìm kiếm mờ theo chuỗi `description`) qua HTTP (HTTP 200).
  3. Lọc chính xác dữ liệu theo `type` (ví dụ: chỉ lấy loại EXPENSE) qua HTTP (HTTP 200).

### 2.3. Fuzz Test (Kiểm Thử Mờ/Bơm Rác)
- **Tệp thực thi:** `tests/fuzz/transaction.service.fuzz.test.ts`
- **Mục tiêu:** Đảm bảo tính ổn định và tính chống chịu (Resilience) của hệ thống trước các đầu vào không mong muốn, đầu vào rác, cực đoan.
- **Phương pháp:** Viết một hàm tự sinh dữ liệu rác (chuỗi ngẫu nhiên, số âm, null, undefined, format datetime sai lệch...) để cấu thành hàng nghìn object `filters`. Gửi lặp đi lặp lại hàng nghìn lần vào Service.
- **Tiêu chí đánh giá:** Hệ thống không bị crash, không bắn ra các Unhandled Exception (ngoại lệ chưa được bắt dẫn đến sập Node.js). Việc ném ra các lỗi có chủ đích như `ApiError` được xem là xử lý thành công.

### 2.4. Load Test (Kiểm Thử Chịu Tải)
- **Tệp thực thi:** `tests/load/search.load.ts`
- **Mục tiêu:** Đo lường độ trễ (Latency), số lượng request tối đa trên giây (RPS/TPS) mà API endpoint tìm kiếm có thể phục vụ được.
- **Phương pháp:** Sử dụng công cụ `autocannon`. Giả lập môi trường có hàng trăm user (connections) liên tục gửi POST Request tìm kiếm dữ liệu về API REST.
- **Chỉ số theo dõi:**
  - Tổng lượng request xử lý thành công.
  - Latency trung bình và Latency p99 (độ trễ lớn nhất của 99% request).
  - Tỉ lệ lỗi (Error rate / Non-2xx Responses).
  - Số lượng request bị timeout.

---

## 3. Cấu Trúc Dữ Liệu Ảo (Mock Data)
- **Tệp chứa dữ liệu:** `tests/mocks/transaction.mock.ts`
- Được thiết kế bao gồm:
  - Một tập hợp cố định các Object `Transaction` của nhiều Users khác nhau, đa dạng về `type`, `amount`, `categoryId` và `date`.
  - Một tập hợp `mockSearchFilters` chứa các hằng số bộ lọc có sẵn (Lọc theo danh mục, ngày tháng, tìm kiếm chuỗi...) để chuẩn hóa input cho các unit tests.

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