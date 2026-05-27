import request from 'supertest';
import { jest } from '@jest/globals';

// Mock middleware auth để bypass JWT
jest.unstable_mockModule('../../src/api/middlewares/authMiddleware.js', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = {
            id: 1,
            accountId: 1,
            profileId: 1,
            role: 'User'
        };

        next();
    }
}));

// Import app SAU KHI mock
const { default: app } = await import('../../src/app.js');

const mockToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_payload.mock_signature";

// ==========================================
// 1. HÀM TỰ SINH DỮ LIỆU RÁC (FUZZ GENERATOR)
// ==========================================
const generateGarbagePayload = () => {

    // 20% tạo payload gần hợp lệ
    const shouldGenerateSemiValid = Math.random() < 0.2;

    if (shouldGenerateSemiValid) {
        return {
            category_id: 1,
            amount_limit: Math.floor(Math.random() * 1000000) + 1,
            month: Math.floor(Math.random() * 12) + 1,
            year: 2026
        };
    }

    // 80% dữ liệu rác
    const garbageTypes = [
        null,
        undefined,
        "",
        "   ",
        {},
        [],
        true,
        false,
        "SQL INJECT ' OR 1=1; --",
        "<script>alert('XSS')</script>",
        -999999,
        -1,
        0,
        13,
        999999999,
        3.14159,
        Number.MAX_SAFE_INTEGER,
        Number.MIN_SAFE_INTEGER,
        Number.MAX_VALUE,
        Infinity,
        NaN,
        "2026-05-01",
        "123",
        "null",
        "undefined"
    ];

    const randomElement = () =>
        garbageTypes[Math.floor(Math.random() * garbageTypes.length)];

    return {
        category_id: randomElement(),
        amount_limit: randomElement(),
        month: randomElement(),
        year: randomElement(),
        random_extra_field: randomElement()
    };
};

// ==========================================
// 2. KỊCH BẢN KIỂM THỬ FUZZ TEST
// ==========================================
describe("Fuzz Test: Budget API (Bơm rác hệ thống)", () => {

    // Tăng thời gian Timeout vì Fuzz test sẽ bắn hàng trăm request liên tục
    jest.setTimeout(60000);

    it("Hệ thống không được phát sinh lỗi nghiêm trọng khi nhận dữ liệu bất thường", async () => {

        const ITERATIONS = 500;

        let internalServerErrorCount = 0;
        let badRequestCount = 0;

        const statusMap: Record<number, number> = {};

        console.log(`\n🚀 Bắt đầu Fuzz Test: Bắn ${ITERATIONS} payload bất thường vào API Thiết lập Ngân sách...`);

        for (let i = 0; i < ITERATIONS; i++) {

            const payload = generateGarbagePayload();

            const start = Date.now();

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(payload);

            const responseTime = Date.now() - start;

            // Ghi nhận phản hồi của Server
            statusMap[res.status] = (statusMap[res.status] || 0) + 1;

            if (res.status === 500) {
                internalServerErrorCount++;
                console.log('\n❌ PAYLOAD GÂY LỖI 500:');
                console.log(payload);

                console.log('RESPONSE:');
                console.log(res.body);
            }
            else if (res.status === 400) {
                badRequestCount++;
            }

            // Hệ thống không được lỗi hạ tầng nghiêm trọng
            expect(res.status).not.toBe(502);
            expect(res.status).not.toBe(503);
            expect(res.status).not.toBe(504);

            // Warning nếu response quá chậm
            if (responseTime > 3000) {
                console.warn(
                    `⚠️ Request #${i + 1} phản hồi chậm: ${responseTime}ms`
                );
            }
        }

        console.log(`\n🛡️ KẾT QUẢ FUZZ TEST`);
        console.log(`========================================`);

        console.log(`- Tổng số request: ${ITERATIONS}`);

        console.log(`- Thống kê Status Code:`);
        console.log(statusMap);

        console.log(`- Số request bị Validation chặn (HTTP 400): ${badRequestCount}/${ITERATIONS}`);

        console.log(`- Số request gây lỗi Internal Server Error (HTTP 500): ${internalServerErrorCount}/${ITERATIONS}`);

        console.log(`========================================`);

        // TIÊU CHÍ ĐÁNH GIÁ SQA:
        // Không được có lỗi crash/unhandled exception server
        expect(internalServerErrorCount).toBe(0);

        if (internalServerErrorCount === 0) {

            console.log(`
                ✅ KẾT LUẬN: PASS
                Hệ thống xử lý ổn định trước dữ liệu bất thường.
            `);
        }
        else{
                console.log(`
                    ❌ KẾT LUẬN: FAIL
                    Hệ thống phát sinh lỗi nghiêm trọng khi fuzz testing.
                `);
            }
    });
});