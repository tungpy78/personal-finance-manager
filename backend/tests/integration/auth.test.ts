import request from 'supertest';
import jwt from 'jsonwebtoken';

import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';
import User from '../../src/database/models/User.js';

describe('Kiểm thử Tích hợp: Phân hệ Authentication', () => {
    let dynamicTestEmail: string;
    let createdUserId: number | null = null;

    beforeAll(async () => {
        await sequelize.authenticate();

        dynamicTestEmail = `test_auth_${Date.now()}@gmail.com`;
    });

    // =========================
    // ĐĂNG KÝ
    // =========================

    describe('POST /api/v1/auth/register', () => {
        it('TC-AUTH-01: Đăng ký thành công với dữ liệu hợp lệ', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    username: 'User Test Auth',
                    email: dynamicTestEmail,
                    password: 'password123'
                });

            expect([200, 201]).toContain(res.status);

            expect(res.body.message).toContain('thành công');

            if (res.body.data?.id) {
                createdUserId = res.body.data.id;
            } else {
                const user = await User.findOne({
                    where: {
                        email: dynamicTestEmail
                    }
                });

                if (user) {
                    createdUserId = user.id;
                }
            }

            // Kiểm tra user đã lưu DB

            const userInDb = await User.findOne({
                where: {
                    email: dynamicTestEmail
                }
            });

            expect(userInDb).not.toBeNull();

            // Mật khẩu phải được hash

            expect(userInDb?.password).not.toBe('password123');
        });

        it('TC-AUTH-02: Chặn đăng ký khi Email đã tồn tại', async () => {
            const res = await request(app)
                .post('/api/v1/auth/register')
                .send({
                    username: 'User Test Auth 2',
                    email: dynamicTestEmail,
                    password: 'password123'
                });

            expect([400, 409]).toContain(res.status);

            expect(res.body.message)
                .toContain('đã được sử dụng');
        });
    });

    // =========================
    // ĐĂNG NHẬP
    // =========================

    describe('POST /api/v1/auth/login', () => {
        it('TC-AUTH-03: Đăng nhập thành công với Email và Password hợp lệ', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: dynamicTestEmail,
                    password: 'password123'
                });

            expect(res.status).toBe(200);

            expect(res.body.data)
                .toHaveProperty('accessToken');

            expect(res.body.message)
                .toContain('Đăng nhập tài khoản thành công');
        });

        it('TC-AUTH-04: Không cho đăng nhập khi mật khẩu sai', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: dynamicTestEmail,
                    password: 'saimatkhau123'
                });

            expect(res.status).toBe(401);

            expect(res.body.message)
                .toContain('Mật khẩu không chính xác');
        });

        it('TC-AUTH-05: Báo lỗi Validation khi mật khẩu quá ngắn', async () => {
            const res = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: dynamicTestEmail,
                    password: '123'
                });

            expect(res.status).toBe(400);

            expect(res.body.message)
                .toContain('ít nhất 6 ký tự');
        });
    });

    // =========================
    // BẢO MẬT JWT
    // =========================

    describe('JWT Security', () => {
        it('TC-AUTH-06: Chặn Access Token đã hết hạn', async () => {
            const expiredToken = jwt.sign(
                {
                    id: createdUserId ?? 999
                },
                process.env.JWT_SECRET as string,
                {
                    expiresIn: '-1d'
                }
            );

            const res = await request(app)
                .get('/api/v1/transactions')
                .set(
                    'Authorization',
                    `Bearer ${expiredToken}`
                );

            expect(res.status).toBe(401);

            expect(res.body.message)
                .toContain('Token');
        });

        it('TC-AUTH-07: Chặn truy cập khi thiếu Authorization Header', async () => {
            const res = await request(app)
                .get('/api/v1/transactions');

            expect(res.status).toBe(401);

            expect(res.body.message)
                .toContain('Vui lòng đăng nhập');
        });
    });

    // =========================
    // DỌN DẸP DỮ LIỆU TEST
    // =========================

    afterAll(async () => {
        try {
            if (createdUserId) {
                await User.destroy({
                    where: {
                        id: createdUserId
                    },
                    force: true
                });
            } else {
                await User.destroy({
                    where: {
                        email: dynamicTestEmail
                    },
                    force: true
                });
            }
        } finally {
            await sequelize.close();
        }
    });
});