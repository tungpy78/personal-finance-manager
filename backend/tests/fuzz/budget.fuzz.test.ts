import request from 'supertest';
import { jest } from '@jest/globals';
import type { protect } from '../../src/api/middlewares/authMiddleware.js';

// Mock middleware auth để bypass JWT
jest.unstable_mockModule('../../src/api/middlewares/authMiddleware', () => ({
    protect: (req: any, res: any, next: any) => {
        req.user = {
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
        "2026-05-01",
        "123",
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

    it("Hệ thống phải sống sót (không crash) khi dội bom 500 request chứa dữ liệu rác", async () => {
        const ITERATIONS = 200;
        let internalServerErrorCount = 0;
        let badRequestCount = 0;
        const statusMap: Record<number, number> = {};

        console.log(`\n🚀 Bắt đầu Fuzz Test: Bắn ${ITERATIONS} payload rác vào API Thiết lập Ngân sách...`);

        for (let i = 0; i < ITERATIONS; i++) {
            const payload = generateGarbagePayload();
            
            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(payload);

            // Ghi nhận phản hồi của Server
            statusMap[res.status] = (statusMap[res.status] || 0) + 1;
            if (res.status === 500) {
                internalServerErrorCount++;
            } else if (res.status === 400) {
                badRequestCount++;
            }
        }

        console.log(`🛡️ Kết quả Fuzz Test:`);

        console.log(`- Thống kê toàn bộ Status Code:`);
        console.log(statusMap);

        console.log(`- Số request bị Zod chặn (HTTP 400): ${badRequestCount}/${ITERATIONS}`);

        console.log(`- Số request làm lọt lỗi sập Server (HTTP 500): ${internalServerErrorCount}/${ITERATIONS}`);

        // TIÊU CHÍ ĐÁNH GIÁ SQA: Tuyệt đối không có request nào làm Crash/Unhandled Exception Server
        expect(internalServerErrorCount).toBe(0);
    });
});