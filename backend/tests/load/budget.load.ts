import autocannon from 'autocannon';
import 'dotenv/config';

// Cấu hình URL trỏ thẳng vào API Xem tiến độ kèm Query Parameters
const URL = process.env.API_URL_BUDGET || 'http://localhost:5000/api/v1/budgets/progress?month=5&year=2026';
const JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXNlcm5hbWUiOiJ0dW5nIGFuaCIsImlhdCI6MTc3Nzg4MzUzMCwiZXhwIjoxNzc3OTY5OTMwfQ.pD4SX6HWOWi2XiqDY52sutiCEN5R19Va4gTW32APWE4'; 

async function runBudgetLoadTest() {
    console.log(`Bắt đầu Load Test cho API Tiến độ Ngân sách: ${URL}`);
    console.log(`Mục tiêu: Kiểm tra giới hạn chịu tải của Stored Procedure sp_TinhTienDoNganSach`);

    const instance = autocannon({
        url: URL,
        connections: 100, // Số lượng người dùng giả lập kết nối đồng thời
        pipelining: 1,
        duration: 10,     // Thời gian dội bom API (giây)
        method: 'GET',    // SQA: API lấy dữ liệu sử dụng GET, tuyệt đối không gửi body
        headers: {
            'Authorization': `Bearer ${JWT_TOKEN}`
        }
    }, (err, result) => {
        if (err) {
            console.error('Lỗi khi chạy Load Test:', err);
            return;
        }
        
        console.log('\n--- KẾT QUẢ LOAD TEST (QUẢN LÝ NGÂN SÁCH) ---');
        console.log(`Tổng số request hoàn thành: ${result.requests.total}`);
        console.log(`Số request xử lý mỗi giây (Req/Sec): ${result.requests.average}`);
        console.log(`Latency trung bình: ${result.latency.average} ms`);
        console.log(`Latency p99 (99% request nhanh hơn mức này): ${result.latency.p99} ms`);
        console.log(`Số lỗi (Non-2xx): ${result.non2xx}`);
        console.log(`Số requests bị timeout: ${result.timeouts}`);
        console.log('-----------------------------------------------\n');

        if (result.non2xx > 0) {
            console.warn("CẢNH BÁO: Có request bị văng lỗi. Hãy kiểm tra lại Token hoặc xem DB có bị quá tải không!");
        }
        
        if (result.latency.average > 500) {
            console.warn("CẢNH BÁO: Latency trung bình đang cao hơn 500ms. Cần xem xét tối ưu lại Index trong Database hoặc Caching!");
        }
    });

    autocannon.track(instance, { renderProgressBar: true });
}

runBudgetLoadTest();