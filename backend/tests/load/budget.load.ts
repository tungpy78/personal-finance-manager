import autocannon from 'autocannon';
import 'dotenv/config';

// Cấu hình URL trỏ thẳng vào API Xem tiến độ kèm Query Parameters
const URL = process.env.API_URL_BUDGET || 'http://localhost:5000/api/v1/budgets/progress?month=5&year=2026';
const JWT_TOKEN = process.env.TEST_JWT_TOKEN;

if (!JWT_TOKEN) {
    throw new Error(
        "Thiếu TEST_JWT_TOKEN trong file .env"
    );
}

const MAX_ACCEPTABLE_LATENCY = 500;
const MAX_P99_LATENCY = 1000;
const MAX_NON_2XX = 0;
const MAX_TIMEOUTS = 0;


async function runBudgetLoadTest() {
    console.log(`Bắt đầu Load Test cho API Tiến độ Ngân sách: ${URL}`);
    console.log(`Mục tiêu: Kiểm tra giới hạn chịu tải của Stored Procedure sp_TinhTienDoNganSach`);

    const instance = autocannon({
        url: URL,
        connections: 50, // Số lượng người dùng giả lập kết nối đồng thời
        pipelining: 1,
        duration: 30,     // Thời gian dội bom API (giây)
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
        console.log(`
        ==================================================
        ĐÁNH GIÁ KẾT QUẢ
        ==================================================
        `);
        
        const isLatencyPass =
            result.latency.average <=
            MAX_ACCEPTABLE_LATENCY;

        const isP99Pass =
            result.latency.p99 <=
            MAX_P99_LATENCY;

        const isNon2xxPass =
            result.non2xx <=
            MAX_NON_2XX;

        const isTimeoutPass =
            result.timeouts <=
            MAX_TIMEOUTS;

        if (
            isLatencyPass &&
            isP99Pass &&
            isNon2xxPass &&
            isTimeoutPass
        ) {
            console.log(`
                KẾT LUẬN: PASS
                Hệ thống đáp ứng yêu cầu hiệu năng.
            `);
        }
        else {
            console.log(`
                KẾT LUẬN: FAIL
                Hệ thống chưa đáp ứng yêu cầu hiệu năng.
            `);

            if (!isLatencyPass) {

                console.warn(
                    `Latency trung bình vượt ngưỡng ${MAX_ACCEPTABLE_LATENCY} ms`
                );
            }

            if (!isP99Pass) {

                console.warn(
                    `Latency p99 vượt ngưỡng ${MAX_P99_LATENCY} ms`
                );
            }

            if (!isNon2xxPass) {

                console.warn(
                    'Có request trả về lỗi Non-2xx'
                );
            }

            if (!isTimeoutPass) {

                console.warn(
                    'Có request bị timeout'
                );
            }
        }
        
        console.log(`
        ==================================================
        KẾT THÚC LOAD TEST
        ==================================================
        `);
    });

    autocannon.track(instance, { renderProgressBar: true });
}

runBudgetLoadTest();