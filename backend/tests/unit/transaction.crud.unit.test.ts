import { jest } from '@jest/globals';
import sequelize from "../../src/config/database.js";

const mockFindByPk = jest.fn() as any;
const mockDelete = jest.fn() as any;
const mockCreate = jest.fn() as any;
const mockUpdate = jest.fn() as any;
const mockCatFindByPk = jest.fn() as any;
const mockCheckBudgetAlert = jest.fn() as any;

jest.unstable_mockModule("../../src/database/repositories/transaction.repository.js", () => ({
    TransactionRepository: { findByPk: mockFindByPk, delete: mockDelete, create: mockCreate, update: mockUpdate }
}));
jest.unstable_mockModule("../../src/database/repositories/category.repository.js", () => ({
    CategoryRepository: { findByPk: mockCatFindByPk }
}));
jest.unstable_mockModule("../../src/core/services/budget.service.js", () => ({
    BudgetService: { checkBudgetAlert: mockCheckBudgetAlert }
}));

const { TransactionService } = await import("../../src/core/services/transaction.service.js");

describe("TransactionService - Unit Test (Luồng CRUD)", () => {
    const userId = 1;

    beforeEach(() => {
        mockFindByPk.mockReset();
        mockDelete.mockReset();
        mockCreate.mockReset();
        mockUpdate.mockReset();
        mockCatFindByPk.mockReset();
        mockCheckBudgetAlert.mockReset();
    });

    afterAll(async () => { await sequelize.close(); });

    it("TC-GD-01: Thêm giao dịch - Nhập đầy đủ: Tiền (50000), Loại (Chi), Ngày (Hôm nay), Danh mục (Ăn uống)", async () => {
        mockCatFindByPk.mockResolvedValueOnce({ id: 1, type: 'EXPENSE' });
        mockCreate.mockResolvedValueOnce({ id: 10, amount: 50000, categoryId: 1, description: "Ăn uống" });
        mockCheckBudgetAlert.mockResolvedValueOnce(null);

        const result = await TransactionService.createTransaction(userId, { amount: 50000, categoryId: 1, date: new Date().toISOString(), description: "Ăn uống" } as any);
        
        expect(result).toHaveProperty("id");
        expect(result.amount).toBe(50000);
        expect(mockCreate).toHaveBeenCalled();
    });

    it("TC-GD-06: Sửa giao dịch - Positive: Thay đổi số tiền hợp lệ (vd: 50k -> 100k) và đổi mô tả, bấm Lưu", async () => {
        mockFindByPk.mockResolvedValueOnce({ id: 10, userId: 1, categoryId: 1 }); // GD cũ
        mockCatFindByPk.mockResolvedValue({ id: 1, type: 'EXPENSE' }); // Danh mục mới
        mockUpdate.mockResolvedValueOnce({ id: 10, amount: 100000, description: "Sửa mô tả" });

        const result = await TransactionService.updateTransaction(userId, 10, { amount: 100000, categoryId: 1, date: new Date().toISOString() } as any);
        
        expect(mockUpdate).toHaveBeenCalledWith(10, expect.any(Object));
        expect(result.amount).toBe(100000);
    });

    it("TC-GD-08: Sửa / Xóa giao dịch - Negative (Not Found): Gọi API Sửa/Xóa với một id không tồn tại trong DB", async () => {
        mockFindByPk.mockResolvedValueOnce(null);
        await expect(TransactionService.updateTransaction(userId, 9999, {} as any))
            .rejects.toThrow('Giao dịch không tồn tại!');
    });

    it("TC-GD-09: Sửa / Xóa giao dịch - Negative (Bảo mật IDOR): Dùng Token của User A, truyền id giao dịch của User B", async () => {
        mockFindByPk.mockResolvedValueOnce({ id: 10, userId: 2 }); // Của user khác
        await expect(TransactionService.deleteTransaction(userId, 10))
            .rejects.toThrow('Bạn không có quyền xóa giao dịch của người khác!');
    });

    it("TC-GD-04: Xóa giao dịch - Bấm icon Thùng rác -> Chọn 'Đồng ý'", async () => {
        mockFindByPk.mockResolvedValueOnce({ id: 10, userId: 1 });
        mockDelete.mockResolvedValueOnce(1);
        const result = await TransactionService.deleteTransaction(userId, 10);
        expect(result.message).toBe("Xóa giao dịch thành công!");
    });

    // Note SQA: TC-GD-05 (Bấm Hủy bỏ) là test UI Frontend, API Backend không bắt sự kiện này.
});