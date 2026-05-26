import { TransactionService } from "../../src/core/services/transaction.service.js";
import Transaction from "../../src/database/models/Transaction.js";
import User from "../../src/database/models/User.js";
import Category from "../../src/database/models/Category.js";
import Budget from "../../src/database/models/Budget.js";
import sequelize from "../../src/config/database.js";
import { mockSearchFilters } from "../mocks/transaction.mock.js";
import { SearchTransactionSchema } from "../../src/core/dtos/transaction.dto.js";

describe("TransactionService - Integration Test - searchTransactions", () => {
    let testUserId: number;
    let testCategoryIncomeId: number;
    let testCategoryExpenseId: number;
    let createdTransactionIds: number[] = [];
    let testBudgetId: number;

    beforeAll(async () => {
        // Authenticate database connection
        await sequelize.authenticate();

        // 1. Create a test user
        const user = await User.create({
            username: `testuser_${Date.now()}`,
            email: `test_${Date.now()}@example.com`,
            password: "hashedpassword123"
        });
        testUserId = user.id;

        // 2. Create test categories
        const catIncome = await Category.create({
            name: `Test Income ${Date.now()}`,
            type: "INCOME"
        });
        testCategoryIncomeId = catIncome.id;

        const catExpense = await Category.create({
            name: `Test Expense ${Date.now()}`,
            type: "EXPENSE"
        });
        testCategoryExpenseId = catExpense.id;

        // 3. Create Budget
        const budget = await Budget.create({
            userId: testUserId,
            categoryId: testCategoryExpenseId,
            amount: 1000000,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        testBudgetId = budget.id;

        // 4. Create sample records for testing
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
        // Cleanup test data in reverse order of creation
        await Transaction.destroy({ where: { id: createdTransactionIds } });
        await Budget.destroy({ where: { id: testBudgetId } });
        await Category.destroy({ where: { id: [testCategoryIncomeId, testCategoryExpenseId] } });
        await User.destroy({ where: { id: testUserId } });
        
        // Cần thiết để ngắt kết nối
        await sequelize.close();
    });

    it("nên trả về dữ liệu thật từ database khi query với search filter rỗng", async () => {
        const result = await TransactionService.searchTransactions(testUserId, {});

        expect(result.length).toBeGreaterThanOrEqual(2);
        const descriptions = result.map(t => t.description);
        expect(descriptions).toContain("Junk Lương Test");
        expect(descriptions).toContain("Junk Mua sắm Test");
    });

    it("nên lọc đúng dữ liệu dựa theo description (search string)", async () => {
        const result = await TransactionService.searchTransactions(testUserId, { search: "Lương" });

        expect(result.length).toBeGreaterThanOrEqual(1);
        if (result[0]) {
            expect(result[0].description).toContain("Lương");
        }
    });

    it("nên lọc đúng dữ liệu theo type = EXPENSE", async () => {
        const result = await TransactionService.searchTransactions(testUserId, { type: "EXPENSE" });

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.every(t => t.type === "EXPENSE")).toBeTruthy();
    });

    it("nên lọc đúng dữ liệu theo type = INCOME", async () => {
        const result = await TransactionService.searchTransactions(testUserId, { type: "INCOME" });

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.every(t => t.type === "INCOME")).toBeTruthy();
    });

    it("nên lọc đúng dữ liệu theo categoryId", async () => {
        const result = await TransactionService.searchTransactions(testUserId, {
            categoryId: testCategoryExpenseId
        });

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result.every(t => t.categoryId === testCategoryExpenseId)).toBeTruthy();
    });

    it("nên lọc đúng dữ liệu theo khoảng thời gian hợp lệ", async () => {
        const result = await TransactionService.searchTransactions(testUserId, {
            begin_date: new Date("2026-05-01"),
            end_date: new Date("2026-05-02")
        });

        expect(result.length).toBe(2);
    });

    it("BẢO MẬT (Chống IDOR): Hệ thống không được trả về giao dịch của người khác ngay cả khi truyền tham số tìm kiếm khớp", async () => {
        // 1. Tạo một User khác để tránh vi phạm ràng buộc khóa ngoại (Foreign Key)
        const otherUser = await User.create({
            username: `otheruser_${Date.now()}`,
            email: `other_${Date.now()}@example.com`,
            password: "hashedpassword123"
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

        // 3. Thực hiện tìm kiếm với userId của chính mình (testUserId) và từ khóa "Lương"
        const result = await TransactionService.searchTransactions(testUserId, { search: "Lương" });

        // Kết quả kỳ vọng: 
        // 1. Tìm thấy giao dịch "Junk Lương Test" của chính mình.
        // 2. Tuyệt đối KHÔNG tìm thấy giao dịch "Junk Lương của người khác" (IDOR được ngăn chặn).
        const descriptions = result.map(t => t.description);
        expect(descriptions).toContain("Junk Lương Test");
        expect(descriptions).not.toContain("Junk Lương của người khác");

        // 4. Dọn dẹp dữ liệu test bảo mật
        await Transaction.destroy({ where: { id: otherUserTransaction.id } });
        await User.destroy({ where: { id: otherUser.id } });
    });

    it("nên lọc đúng dữ liệu khi kết hợp nhiều bộ lọc cùng một lúc (Decision Table - Quy tắc 1)", async () => {
        const result = await TransactionService.searchTransactions(testUserId, {
            search: "Lương",
            categoryId: testCategoryIncomeId,
            type: "INCOME",
            begin_date: new Date("2026-05-01"),
            end_date: new Date("2026-05-02")
        });

        expect(result.length).toBe(1);
        expect(result[0]?.description).toContain("Lương");
        expect(result[0]?.categoryId).toBe(testCategoryIncomeId);
        expect(result[0]?.type).toBe("INCOME");
    });

    it("TC06: nên trả về mảng rỗng khi tìm kiếm với từ khóa không tồn tại", async () => {
        const result = await TransactionService.searchTransactions(testUserId, { search: "abcxyz" });
        expect(result.length).toBe(0);
    });

    it("TC07: nên báo lỗi khi ngày bắt đầu lớn hơn ngày kết thúc", async () => {
        const invalidFilter = {
            begin_date: new Date("2026-05-03"),
            end_date: new Date("2026-05-01")
        };
        await expect(SearchTransactionSchema.parseAsync(invalidFilter))
            .rejects
            .toThrow("Ngày kết thúc phải >= ngày bắt đầu");
    });

    it("TC08: nên báo lỗi khi ID danh mục âm (-1)", async () => {
        const invalidFilter = {
            categoryId: -1
        };
        await expect(SearchTransactionSchema.parseAsync(invalidFilter))
            .rejects
            .toThrow("ID danh mục phải là số nguyên dương");
    });

    it("TC09: nên trả về mảng rỗng và không crash khi tìm kiếm ký tự đặc biệt", async () => {
        const result = await TransactionService.searchTransactions(testUserId, { search: "@@@@" });
        expect(result.length).toBe(0);
    });

    it("TC10: nên báo lỗi khi kiểu sắp xếp không hợp lệ", async () => {
        const invalidFilter = {
            sort: "abc" as any
        };
        await expect(SearchTransactionSchema.parseAsync(invalidFilter))
            .rejects
            .toThrow();
    });
});
