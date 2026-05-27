import request from 'supertest';
import { jest } from '@jest/globals';
import { mockBudgetPayloads } from '../mocks/budget.mock.js';
import sequelize from '../../src/config/database.js';

jest.unstable_mockModule(
    "../../src/api/middlewares/authMiddleware.ts",
    () => ({
        protect: (req: any, res: any, next: any) => {

            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                });
            }

            req.user = {
                id: 1
            };

            next();
        }
    })
);

const { default: app } = await import('../../src/app.js');

const mockToken = 'mocked-jwt-token-for-testing';

describe("Integration Test: Budget APIs (Quản lý ngân sách)", () => {

    describe("POST /api/v1/budgets", () => {

        it("TC-NS-01: Nên trả về Status 201 Created khi thiết lập thành công", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.valid);

            expect(res.status).toBe(201);

            expect(res.body.success).toBe(true);
        });

        it("TC-NS-02: Nên trả về Status 400 Bad Request nếu số tiền âm", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.invalidAmount);

            expect(res.status).toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-NS-03: Nên trả về Status 400 Bad Request nếu tháng không hợp lệ", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.invalidMonth);

            expect(res.status).toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-NS-04: Nên trả về Status 400 nếu năm ở quá khứ", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.invalidYear);

            expect(res.status).toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-NS-05: Nên trả về Status 400 nếu thiếu dữ liệu bắt buộc", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.emptyPayload);

            expect(res.status).toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-NS-06: Nên trả về Status 400 nếu dữ liệu là null", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.nullPayload);

            expect(res.status).toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-NS-07: Nên trả về Status 400 nếu kiểu dữ liệu không hợp lệ", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.stringPayload);

            expect(res.status).toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-NS-08: Nên trả về lỗi nếu thiết lập ngân sách cho danh mục INCOME", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.incomeCategory);

            expect(res.status).not.toBe(201);

            expect(res.body.success).toBe(false);
        });

        it("TC-AUTH-09: Nên trả về 401 nếu không có Token", async () => {

            const res = await request(app)
                .post('/api/v1/budgets');

            expect(res.status).toBe(401);

            expect(res.body.success).toBe(false);
        });
    });

    describe("GET /api/v1/budgets/progress", () => {

        it("TC-NS-10: Nên trả về tiến độ thành công với Status 200", async () => {

            const res = await request(app)
                .get('/api/v1/budgets/progress')
                .set('Authorization', `Bearer ${mockToken}`)
                .query({
                    month: 5,
                    year: 2026
                });

            expect(res.status).toBe(200);

            expect(res.body.success).toBe(true);

            expect(res.body.data).toBeDefined();
        });

        it("TC-NS-11: Nên trả về lỗi nếu thiếu month/year", async () => {

            const res = await request(app)
                .get('/api/v1/budgets/progress')
                .set('Authorization', `Bearer ${mockToken}`)
                .query({});

            expect(res.status).not.toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-NS-12: Nên trả về lỗi nếu month không hợp lệ", async () => {

            const res = await request(app)
                .get('/api/v1/budgets/progress')
                .set('Authorization', `Bearer ${mockToken}`)
                .query({
                    month: 13,
                    year: 2026
                });

            expect(res.status).not.toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-AUTH-13: Nên trả về 401 nếu không có token khi xem tiến độ", async () => {

            const res = await request(app)
                .get('/api/v1/budgets/progress');

            expect(res.status).toBe(401);

            expect(res.body.success).toBe(false);
        });
    });
});

afterAll(async () => {
    await sequelize.close();
});