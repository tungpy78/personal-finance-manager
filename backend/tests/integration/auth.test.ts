import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';

describe('Kiểm thử Tích hợp: Phân hệ Authentication', () => {
    
    // TC-AUTH-01 & TC-AUTH-02: Đăng ký
    describe('POST /api/v1/auth/register', () => {
        it('TC-AUTH-01: Phải đăng ký thành công với dữ liệu hợp lệ', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                username: "User Test",
                email: "testuser@gmail.com",
                password: "password123"
            });
            expect(res.status).toBe(201); // Hoặc 200
            expect(res.body.message).toContain("thành công");
        });

        it('TC-AUTH-02: Phải chặn đăng ký nếu Email đã tồn tại', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                username: "User Test 2",
                email: "testuser@gmail.com", // Trùng email test ở trên
                password: "password123"
            });
            expect(res.status).toBe(400); // Hoặc 409
            expect(res.body.message).toContain("đã được sử dụng");
        });
    });

    // TC-AUTH-05: Boundary Zod Validation
    describe('POST /api/auth/login', () => {
        it('TC-AUTH-05: Phải báo lỗi Zod khi mật khẩu quá ngắn', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: "testuser@gmail.com",
                password: "123" // Chỉ có 3 ký tự
            });
            expect(res.status).toBe(400);
            expect(res.body.message).toContain("ít nhất 6 ký tự");
        });
    });

    // TC-AUTH-07: Bảo mật không Header
    it('TC-AUTH-07: Phải chặn API yêu cầu xác thực nếu thiếu Header Authorization', async () => {
        const res = await request(app).get('/api/v1/transactions'); // Thử lấy giao dịch mà không gửi token
        expect(res.status).toBe(401);
        expect(res.body.message).toContain("Vui lòng đăng nhập");
    });

    afterAll(async () => {
        // Đóng kết nối Database
        if (sequelize) {
            await sequelize.close(); 
        }
        // (Hoặc nếu Server có hàm close thì gọi server.close())
    });
});