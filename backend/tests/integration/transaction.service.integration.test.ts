import { TransactionService } from "../../src/core/services/transaction.service.js";
import Transaction from "../../src/database/models/Transaction.js";
import User from "../../src/database/models/User.js";
import Category from "../../src/database/models/Category.js";
import Budget from "../../src/database/models/Budget.js";
import sequelize from "../../src/config/database.js";
import app from "../../src/app.js";
import { AuthService } from "../../src/core/services/auth.service.js";
import type { Server } from "http";

describe("TransactionService - API Integration Test - searchTransactions", () => {
    let server: Server;
    let baseURL: string;
    let token: string;
    let testUserId: number;
    let testCategoryIncomeId: number;
    let testCategoryExpenseId: number;
    let createdTransactionIds: number[] = [];
    let testBudgetId: number;
    let testUserEmail: string;
    const testUserPassword = "Password123!";

    beforeAll(async () => {
        // Khởi động kết nối CSDL MySQL thật
        await sequelize.authenticate();

        // 1. Tạo tài khoản test ngẫu nhiên qua AuthService để mã hóa mật khẩu chính xác
        testUserEmail = `integration_${Date.now()}@example.com`;
        const user = await AuthService.registerUser({
            username: `integration_${Date.now()}`,
            email: testUserEmail,
            password: testUserPassword
        });
        testUserId = user.id;

        // 2. Khởi động server Express động trên port ngẫu nhiên
        server = app.listen(0, () => {
            const address = server.address();
            if (address && typeof address !== 'string') {
                baseURL = `http://localhost:${address.port}`;
            }
        });

        // Đợi baseURL được gán cổng
        await new Promise<void>((resolve) => {
            const check = () => {
                if (baseURL) resolve();
                else setTimeout(check, 10);
            };
            check();
        });

        // 3. Đăng nhập qua API lấy Token
        const loginResponse = await fetch(`${baseURL}/api/v1/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: testUserEmail,
                password: testUserPassword
            })
        });
        const loginResult = await loginResponse.json() as any;
        if (!loginResponse.ok || !loginResult.success) {
            throw new Error(`Đăng nhập test integration thất bại: ${JSON.stringify(loginResult)}`);
        }
        token = loginResult.data.accessToken;

        // 4. Tạo các danh mục test
        const catIncome = await Category.create({
            name: `Test Income ${Date.now()}`,
            type: "INCOME",
            userId: testUserId
        });
        testCategoryIncomeId = catIncome.id;

        const catExpense = await Category.create({
            name: `Test Expense ${Date.now()}`,
            type: "EXPENSE",
            userId: testUserId
        });
        testCategoryExpenseId = catExpense.id;

        // 5. Tạo ngân sách test
        const budget = await Budget.create({
            userId: testUserId,
            categoryId: testCategoryExpenseId,
            amount: 1000000,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        testBudgetId = budget.id;

        // 6. Tạo các giao dịch ảo làm dữ liệu mẫu
        const t1 = await Transaction.create({
            userId: testUserId,
            amount: 500000,
            type: "INCOME",
            categoryId: testCategoryIncomeId,
            description: "Junk Lương Test",
            date: new Date("2026-05-01")
        });
        const t2 = await Transaction.create({
            userId: testUserId,
            amount: 200000,
            type: "EXPENSE",
            categoryId: testCategoryExpenseId,
            description: "Junk Mua sắm Test",
            date: new Date("2026-05-02")
        });

        createdTransactionIds.push(t1.id, t2.id);
    });

    afterAll(async () => {
        // Dọn dẹp dữ liệu ảo ngược thứ tự tạo
        await Transaction.destroy({ where: { id: createdTransactionIds } });
        await Budget.destroy({ where: { id: testBudgetId } });
        await Category.destroy({ where: { id: [testCategoryIncomeId, testCategoryExpenseId] } });
        await User.destroy({ where: { id: testUserId } });
        
        // Đóng server Express
        if (server) {
            await new Promise<void>((resolve) => server.close(() => resolve()));
        }

        // Đóng kết nối DB
        await sequelize.close();
    });

    it("TC01: nên trả về dữ liệu thật từ database khi query với search filter rỗng", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({})
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThanOrEqual(2);
        
        const descriptions = result.data.map((t: any) => t.description);
        expect(descriptions).toContain("Junk Lương Test");
        expect(descriptions).toContain("Junk Mua sắm Test");
    });

    it("TC02: nên lọc đúng dữ liệu dựa theo description (search string)", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ search: "Lương" })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data[0].description).toContain("Lương");
    });

    it("TC04: nên lọc đúng dữ liệu theo type = EXPENSE", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type: "EXPENSE" })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((t: any) => t.type === "EXPENSE")).toBeTruthy();
    });

    it("TC05: nên lọc đúng dữ liệu theo type = INCOME", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type: "INCOME" })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((t: any) => t.type === "INCOME")).toBeTruthy();
    });

    it("TC03: nên lọc đúng dữ liệu theo categoryId", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ categoryId: testCategoryExpenseId })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.every((t: any) => t.categoryId === testCategoryExpenseId)).toBeTruthy();
    });

    it("TC06: nên lọc đúng dữ liệu theo khoảng thời gian hợp lệ", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                begin_date: "2026-05-01T00:00:00.000Z",
                end_date: "2026-05-02T23:59:59.000Z"
            })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(2);
    });

    it("TC19: BẢO MẬT (Chống IDOR): Hệ thống không được trả về giao dịch của người khác ngay cả khi truyền tham số tìm kiếm khớp", async () => {
        // 1. Tạo một User khác qua AuthService
        const otherUserEmail = `other_integration_${Date.now()}@example.com`;
        const otherUser = await AuthService.registerUser({
            username: `other_integration_${Date.now()}`,
            email: otherUserEmail,
            password: "Password123!"
        });

        // 2. Tạo một giao dịch thuộc về User khác này nhưng có từ khóa "Lương"
        const otherUserTransaction = await Transaction.create({
            userId: otherUser.id,
            amount: 900000,
            type: "INCOME",
            categoryId: testCategoryIncomeId,
            description: "Junk Lương của người khác",
            date: new Date("2026-05-01")
        });

        // 3. Thực hiện tìm kiếm bằng token của chính mình (testUser) với từ khóa "Lương"
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ search: "Lương" })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);

        // Kết quả kỳ vọng: 
        // 1. Tìm thấy giao dịch "Junk Lương Test" của chính mình.
        // 2. Tuyệt đối KHÔNG tìm thấy giao dịch "Junk Lương của người khác" (IDOR được ngăn chặn).
        const descriptions = result.data.map((t: any) => t.description);
        expect(descriptions).toContain("Junk Lương Test");
        expect(descriptions).not.toContain("Junk Lương của người khác");

        // 4. Dọn dẹp dữ liệu test bảo mật
        await Transaction.destroy({ where: { id: otherUserTransaction.id } });
        await User.destroy({ where: { id: otherUser.id } });
    });

    it("TC12: nên lọc đúng dữ liệu khi kết hợp nhiều bộ lọc cùng một lúc (Decision Table - Quy tắc 1)", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                search: "Lương",
                categoryId: testCategoryIncomeId,
                type: "INCOME",
                begin_date: "2026-05-01T00:00:00.000Z",
                end_date: "2026-05-02T23:59:59.000Z"
            })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(1);
        expect(result.data[0].description).toContain("Lương");
        expect(result.data[0].categoryId).toBe(testCategoryIncomeId);
        expect(result.data[0].type).toBe("INCOME");
    });

    it("TC11: nên trả về mảng rỗng khi tìm kiếm với từ khóa không tồn tại", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ search: "abcxyz" })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(0);
    });

    it("TC16: nên báo lỗi khi ngày bắt đầu lớn hơn ngày kết thúc", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                begin_date: "2026-05-03",
                end_date: "2026-05-01"
            })
        });

        expect(response.status).toBe(400);
        const result = await response.json() as any;
        expect(result.success).toBe(false);
        expect(result.message).toContain("Ngày kết thúc phải >= ngày bắt đầu");
    });

    it("TC14: nên báo lỗi khi ID danh mục âm (-1)", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ categoryId: -1 })
        });

        expect(response.status).toBe(400);
        const result = await response.json() as any;
        expect(result.success).toBe(false);
        expect(result.message).toContain("ID danh mục phải là số nguyên dương");
    });

    it("TC15: nên báo lỗi khi loại giao dịch không hợp lệ (type = INVALID_TYPE)", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ type: "abc" })
        });

        expect(response.status).toBe(400);
        const result = await response.json() as any;
        expect(result.success).toBe(false);
    });

    it("TC13: nên trả về mảng rỗng và không crash khi tìm kiếm ký tự đặc biệt", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ search: "@@@@" })
        });

        expect(response.status).toBe(200);
        const result = await response.json() as any;
        expect(result.success).toBe(true);
        expect(result.data.length).toBe(0);
    });

    it("TC17: nên báo lỗi khi kiểu sắp xếp không hợp lệ", async () => {
        const response = await fetch(`${baseURL}/api/v1/transactions/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sort: "abc" })
        });

        expect(response.status).toBe(400);
        const result = await response.json() as any;
        expect(result.success).toBe(false);
    });
});