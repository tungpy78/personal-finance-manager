import request from 'supertest';
import app from '../../src/app.js';
import sequelize from '../../src/config/database.js';
import { AuthService } from "../../src/core/services/auth.service.js";
import Transaction from "../../src/database/models/Transaction.js";
import User from "../../src/database/models/User.js";
import Category from "../../src/database/models/Category.js";
import Budget from "../../src/database/models/Budget.js";

describe('Kiểm thử Tích hợp: Phân hệ Quản lý Giao dịch (Có dọn dẹp rác)', () => {
    // Biến lưu trữ Token
    let tokenUserA: string;
    let tokenUserB: string;

    // Biến theo dõi ID để dọn dẹp sau khi test
    let testUserAId: number;
    let testUserBId: number;
    let testCategoryId: number;
    let testBudgetId: number;
    let createdTransactionIds: number[] = []; // Mảng chứa ID các giao dịch sinh ra trong lúc test

    beforeAll(async () => {
        // 1. Khởi tạo Database
        await sequelize.authenticate();

        // 2. Tạo User A (Chủ sở hữu dữ liệu)
        const userAEmail = `user_a_${Date.now()}@example.com`;
        const userA = await AuthService.registerUser({
            username: `User_A_${Date.now()}`,
            email: userAEmail,
            password: "Password123!"
        });
        testUserAId = userA.id;

        // Login User A lấy token
        const resA = await request(app).post('/api/v1/auth/login').send({ email: userAEmail, password: "Password123!" });
        tokenUserA = `Bearer ${resA.body.data.accessToken}`;

        // 3. Tạo User B (Dùng để test bảo mật IDOR)
        const userBEmail = `user_b_${Date.now()}@example.com`;
        const userB = await AuthService.registerUser({
            username: `User_B_${Date.now()}`,
            email: userBEmail,
            password: "Password123!"
        });
        testUserBId = userB.id;

        // Login User B lấy token
        const resB = await request(app).post('/api/v1/auth/login').send({ email: userBEmail, password: "Password123!" });
        tokenUserB = `Bearer ${resB.body.data.accessToken}`;

        // 4. Tạo Danh mục (Category) ảo cho User A (Tránh lỗi khóa ngoại khi nhập categoryId: 1)
        const category = await Category.create({
            name: `Test Expense ${Date.now()}`,
            type: "EXPENSE",
            userId: testUserAId
        });
        testCategoryId = category.id;

        // 5. Tạo Ngân sách (Budget) ảo cho User A để test cảnh báo DANGER
        const budget = await Budget.create({
            userId: testUserAId,
            categoryId: testCategoryId,
            amount: 1000000, // Hạn mức 1 triệu
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        testBudgetId = budget.id;
    });

    // TC-GD-01: Thêm hợp lệ
    it('TC-GD-01: Thêm giao dịch hợp lệ phải trả về 201 và lưu DB', async () => {
        const res = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', tokenUserA)
            .send({
                amount: 50000,
                type: 'EXPENSE',
                categoryId: testCategoryId, // Dùng ID động thay vì số 1 hardcode
                date: new Date().toISOString().split('T')[0], // Lấy ngày hiện tại
                description: 'Ăn sáng test'
            });
        
        expect(res.status).toBe(201);
        expect(res.body.data).toHaveProperty('id');
        
        // QUAN TRỌNG: Lưu lại ID để dọn dẹp
        createdTransactionIds.push(res.body.data.id); 
    });

    // TC-GD-03: Ràng buộc số âm
    it('TC-GD-03: Phải chặn giao dịch có số tiền âm', async () => {
        const res = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', tokenUserA)
            .send({
                amount: -100, 
                type: 'EXPENSE',
                categoryId: testCategoryId,
                date: new Date().toISOString().split('T')[0]
            });
            
        expect(res.status).toBe(400);
        expect(res.body.message).toContain("lớn hơn 0");
    });

    // TC-GD-09: Tấn công IDOR 
    it('TC-GD-09: User B không thể Xóa/Sửa giao dịch của User A (Chống IDOR)', async () => {
        // Lấy ID giao dịch hợp lệ vừa tạo ở TC-GD-01
        const targetTransactionId = createdTransactionIds[0];

        const res = await request(app)
            .delete(`/api/v1/transactions/${targetTransactionId}`)
            .set('Authorization', tokenUserB); // Dùng token User B

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
                categoryId: testCategoryId,
                date: '2030-01-01' 
            });
            
        expect(res.status).toBe(400);
        expect(res.body.message).toContain("không được vượt quá thời điểm hiện tại");
    });

    // TC-GD-13 Cảnh báo ngân sách
    it('TC-GD-13: Trả về cảnh báo DANGER khi chi tiêu vượt hạn mức', async () => {
        const res = await request(app)
            .post('/api/v1/transactions')
            .set('Authorization', tokenUserA)
            .send({
                amount: 99999999, // Ép vỡ ngân sách 1 triệu đã tạo ở beforeAll
                type: 'EXPENSE',
                categoryId: testCategoryId,
                date: new Date().toISOString().split('T')[0]
            });
        
        expect(res.status).toBe(201);
        expect(res.body.data.budgetAlert).toBeDefined();
        expect(res.body.data.budgetAlert.level).toBe('DANGER');

        // QUAN TRỌNG: Lưu lại ID để dọn dẹp
        createdTransactionIds.push(res.body.data.id);
    });

    // HOOK CHỐNG RÁC DỮ LIỆU
    afterAll(async () => {
        // Xóa theo thứ tự ngược lại lúc tạo (để tránh lỗi Khóa ngoại - Foreign Key constraint)
        
        // 1. Xóa tất cả các giao dịch đã được tạo ra trong các test case
        if (createdTransactionIds.length > 0) {
            await Transaction.destroy({ where: { id: createdTransactionIds }, force: true });
        }

        // 2. Xóa Ngân sách ảo
        if (testBudgetId) {
            await Budget.destroy({ where: { id: testBudgetId }, force: true });
        }

        // 3. Xóa Danh mục ảo
        if (testCategoryId) {
            await Category.destroy({ where: { id: testCategoryId }, force: true });
        }

        // 4. Xóa 2 User ảo
        await User.destroy({ where: { id: [testUserAId, testUserBId] }, force: true });

        // 5. Đóng kết nối DB
        if (sequelize) {
            await sequelize.close(); 
        }
    });
});