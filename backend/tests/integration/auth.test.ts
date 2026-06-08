import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';
import User from '../../src/database/models/User.js'; // Bắt buộc import Model để dọn dẹp

describe('Kiểm thử Tích hợp: Phân hệ Authentication (Có dọn dẹp rác)', () => {
    
    // Biến lưu trữ email động và ID để dọn dẹp
    let dynamicTestEmail: string;
    let createdUserId: number | null = null;

    beforeAll(async () => {
        // Đảm bảo DB đã kết nối
        await sequelize.authenticate();
        
        // Sinh ra một email duy nhất cho mỗi lần chạy test suite này
        dynamicTestEmail = `test_auth_${Date.now()}@gmail.com`;
    });

    // TC-AUTH-01 & TC-AUTH-02: Đăng ký
    describe('POST /api/v1/auth/register', () => {
        
        it('TC-AUTH-01: Phải đăng ký thành công với dữ liệu hợp lệ', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                username: "User Test Auth",
                email: dynamicTestEmail, // Dùng email động thay vì hardcode
                password: "password123"
            });
            
            expect([200, 201]).toContain(res.status); // Chấp nhận 200 hoặc 201
            expect(res.body.message).toContain("thành công");

            // QUAN TRỌNG: Lưu lại ID user vừa tạo để cuối cùng đem đi xóa
            // (Nếu API của bạn trả về ID ở res.body.data.id thì lấy trực tiếp, 
            // nếu không thì query DB để tìm)
            if (res.body.data && res.body.data.id) {
                createdUserId = res.body.data.id;
            } else {
                const user = await User.findOne({ where: { email: dynamicTestEmail } });
                if (user) createdUserId = user.id;
            }
        });

        it('TC-AUTH-02: Phải chặn đăng ký nếu Email đã tồn tại', async () => {
            const res = await request(app).post('/api/v1/auth/register').send({
                username: "User Test Auth 2",
                email: dynamicTestEmail, // Cố tình dùng lại email vừa đăng ký thành công ở TC-AUTH-01
                password: "password123"
            });
            
            expect([400, 409]).toContain(res.status); 
            expect(res.body.message).toContain("đã được sử dụng");
        });
    });

    // TC-AUTH-05: Boundary Zod Validation
    describe('POST /api/v1/auth/login', () => {
        it('TC-AUTH-05: Phải báo lỗi Zod khi mật khẩu quá ngắn', async () => {
            const res = await request(app).post('/api/v1/auth/login').send({
                email: dynamicTestEmail, // Có thể dùng email bất kỳ vì nó sẽ tạch ở khâu Validate trước khi query DB
                password: "123" // Chỉ có 3 ký tự
            });
            
            expect(res.status).toBe(400);
            expect(res.body.message).toContain("ít nhất 6 ký tự");
        });
    });

    // TC-AUTH-07: Bảo mật không Header
    describe('Bảo mật Middleware', () => {
        it('TC-AUTH-07: Phải chặn API yêu cầu xác thực nếu thiếu Header Authorization', async () => {
            const res = await request(app).get('/api/v1/transactions'); // Gọi bừa một route cần Auth
            
            expect(res.status).toBe(401);
            expect(res.body.message).toContain("Vui lòng đăng nhập"); // Sửa lại text cho khớp với thông báo lỗi hệ thống của bạn
        });
    });

    // HOOK CHỐNG RÁC DỮ LIỆU
    afterAll(async () => {
        // Xóa User rác đã tạo trong database
        if (createdUserId) {
            await User.destroy({ 
                where: { id: createdUserId },
                force: true // Xóa cứng
            });
        } else {
            // Fallback (dự phòng): Nếu không có ID, xóa bằng email động
            await User.destroy({ 
                where: { email: dynamicTestEmail },
                force: true 
            });
        }

        // Đóng kết nối Database
        if (sequelize) {
            await sequelize.close(); 
        }
    });
});