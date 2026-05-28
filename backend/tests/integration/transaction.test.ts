import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';

describe('Kiểm thử Tích hợp: Phân hệ Quản lý Giao dịch', () => {
    let tokenUserA: string;
    let tokenUserB: string;
    let transactionIdUserA: number;

    // Hook chạy trước khi test: Login 2 user để lấy Token
    beforeAll(async () => {
        // Giả sử đã có hàm/API lấy token cho User A và User B
        const resA = await request(app).post('/api/v1/auth/login').send({ email: "tung@gmail.com", password: "tung12345" });
        tokenUserA = `Bearer ${resA.body.data.accessToken}`;
        
        const resB = await request(app).post('/api/v1/auth/login').send({ email: "tung1@gmail.com", password: "tung12345" });
        tokenUserB = `Bearer ${resB.body.data.accessToken}`;
    });

    // TC-GD-01: Thêm hợp lệ
    it('TC-GD-01: Thêm giao dịch hợp lệ phải trả về 201 và lưu DB', async () => {
        const res = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', tokenUserA)
            .send({
                amount: 50000,
                type: 'EXPENSE',
                categoryId: 1,
                date: '2026-05-20',
                description: 'Ăn sáng'
            });
        
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        transactionIdUserA = res.body.data.id; // Lưu lại ID để test tính năng Xóa/Sửa bên dưới
    });

    // TC-GD-03: Ràng buộc số âm
    it('TC-GD-03: Phải chặn giao dịch có số tiền âm', async () => {
        const res = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', tokenUserA)
            .send({
                amount: -100, // Cố tình nhập số âm
                type: 'EXPENSE',
                categoryId: 1,
                date: '2026-05-20'
            });
        expect(res.status).toBe(400);
        expect(res.body.message).toContain("lớn hơn 0");
    });

    // TC-GD-09: Tấn công IDOR (Test Case bảo mật ĂN ĐIỂM tuyệt đối)
    it('TC-GD-09: User B không thể Xóa/Sửa giao dịch của User A (Chống IDOR)', async () => {
        const res = await request(app)
            .delete(`/api/v1/transactions/${transactionIdUserA}`)
            // CỐ TÌNH DÙNG TOKEN CỦA USER B ĐỂ XÓA DỮ LIỆU USER A
            .set('Authorization', tokenUserB); 

        // Phải bị chặn với lỗi 403 (Forbidden) hoặc 404
        expect([403, 404]).toContain(res.status); 
    });

    // TC-GD-12: Ràng buộc ngày tháng tương lai
    it('TC-GD-12: Phải chặn không cho nhập ngày giao dịch ở tương lai xa', async () => {
        const res = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', tokenUserA)
            .send({
                amount: 50000,
                type: 'EXPENSE',
                categoryId: 1,
                date: '2030-01-01' // Tương lai
            });
        expect(res.status).toBe(400);
        expect(res.body.message).toContain("không được vượt quá thời điểm hiện tại");
    });

    // KỊCH BẢN BỔ SUNG (Quan trọng): TC-GD-13 Cảnh báo ngân sách
    it('TC-GD-13: Trả về cảnh báo DANGER khi chi tiêu vượt hạn mức', async () => {
        const res = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', tokenUserA)
            .send({
                amount: 99999999, // Tiêu số tiền cực lớn để ép vỡ ngân sách
                type: 'EXPENSE',
                categoryId: 1,
                date: '2026-05-20'
            });
        
        // Vẫn lưu thành công nhưng có cảnh báo
        expect(res.status).toBe(201);
        expect(res.body.data.budgetAlert).toBeDefined();
        expect(res.body.data.budgetAlert.level).toBe('DANGER');
    });

    afterAll(async () => {
        // Đóng kết nối Database
        if (sequelize) {
            await sequelize.close(); 
        }
        // (Hoặc nếu Server có hàm close thì gọi server.close())
    });
});