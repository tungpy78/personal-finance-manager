import autocannon from 'autocannon';
import 'dotenv/config';

// Ensure your server is running before executing this load test
const URL = process.env.API_URL || 'http://localhost:5000/api/v1/transactions/search';
const JWT_TOKEN = process.env.TEST_JWT_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsInVzZXJuYW1lIjoiaHVuZyIsImlhdCI6MTc3OTc1OTE2OSwiZXhwIjoxNzc5ODQ1NTY5fQ.9Ac15iM_MbiZhEhmLXA4FlZl01S6glxObJ_KBRaQb0I'; // Cần một token hợp lệ để test API có auth

async function runLoadTest() {
    console.log(`Bắt đầu Load Test cho endpoint: ${URL}`);

    const instance = autocannon({
        url: URL,
        connections: 100, // Số lượng kết nối đồng thời
        pipelining: 1,
        duration: 10, // Thời gian chạy test (giây)
        method: 'POST', // API search sử dụng POST
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${JWT_TOKEN}`
        },
        body: JSON.stringify({
            search: "",
            begin_date: "",
            end_date: "",
            sort: "",
            category_id: "",
            type: ""
        })
    }, (err, result) => {
        if (err) {
            console.error('Lỗi khi chạy Load Test:', err);
            return;
        }
        console.log('\n--- KẾT QUẢ LOAD TEST ---');
        console.log(`Tổng số request hoàn thành: ${result.requests.total}`);
        console.log(`Latency trung bình: ${result.latency.average} ms`);
        console.log(`Latency p99: ${result.latency.p99} ms`);
        console.log(`Số lỗi (Non-2xx): ${result.non2xx}`);
        console.log(`Số requests bị timeout: ${result.timeouts}`);
        console.log('-------------------------\n');

        if (result.non2xx > 0) {
            console.warn("CẢNH BÁO: Có request bị lỗi, kiểm tra lại server hoặc token!");
        }
    });

    autocannon.track(instance, { renderProgressBar: true });
}

runLoadTest();
