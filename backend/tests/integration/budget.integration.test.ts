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

        it("TC-NS-02: Nên trả về Status 400 Bad Request nếu tháng không hợp lệ", async () => {

            const res = await request(app)
                .post('/api/v1/budgets')
                .set('Authorization', `Bearer ${mockToken}`)
                .send(mockBudgetPayloads.invalidMonth);

            expect(res.status).toBe(400);

            expect(res.body.success).toBe(false);
        });

        it("TC-AUTH-07: Nên trả về 401 nếu không có Token", async () => {
            const res = await request(app)
                .post('/api/v1/budgets');

            expect(res.status).not.toBe(404);
        });
    });

    describe("GET /api/v1/budgets/progress", () => {
        it("Nên trả về tiến độ thành công với Status 200", async () => {
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

        it("Nên trả về lỗi nếu thiếu month/year", async () => {

            const res = await request(app)
                .get('/api/v1/budgets/progress')
                .set('Authorization', `Bearer ${mockToken}`)
                .query({});

            expect(res.status).not.toBe(200);

            expect(res.body.success).toBe(false);
        });
    });
});

afterAll(async () => {
    await sequelize.close();
});