import { TransactionService } from "../../src/core/services/transaction.service.js";
import Transaction from "../../src/database/models/Transaction.js";
import User from "../../src/database/models/User.js";
import Category from "../../src/database/models/Category.js";
import Budget from "../../src/database/models/Budget.js";
import sequelize from "../../src/config/database.js";
import { mockSearchFilters } from "../mocks/transaction.mock.js";

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
});
