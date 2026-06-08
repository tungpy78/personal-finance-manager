import { jest } from '@jest/globals';
import { mockTransactions, mockSearchFilters } from "../mocks/transaction.mock.js";

const mockFindByCriteria = jest.fn() as any;

jest.unstable_mockModule("../../src/database/repositories/transaction.repository.js", () => ({
    TransactionRepository: {
        findByCriteria: mockFindByCriteria
    }
}));

const { TransactionService } = await import("../../src/core/services/transaction.service.js");
const { TransactionRepository } = await import("../../src/database/repositories/transaction.repository.js");

describe("TransactionService - Unit Test - searchTransactions", () => {
    const userId = 1;

    beforeEach(() => {
        mockFindByCriteria.mockReset();
    });

    it("TC01: nên trả về tất cả transactions của user khi không có filter", async () => {
        const userTransactions = mockTransactions.filter(t => t.userId === userId);
        mockFindByCriteria.mockResolvedValue(userTransactions as any);

        const result = await TransactionService.searchTransactions(userId, mockSearchFilters.empty);

        expect(mockFindByCriteria).toHaveBeenCalledWith(userId, {});
        expect(result).toHaveLength(3);
    });

    it("TC08: nên sắp xếp theo date_desc đúng cách", async () => {
        const userTransactions = mockTransactions.filter(t => t.userId === userId);
        mockFindByCriteria.mockResolvedValue([...userTransactions] as any);

        const result = await TransactionService.searchTransactions(userId, mockSearchFilters.withSortDateDesc);

        expect(result[0]?.id).toBe(3); // Date 2026-05-03
        expect(result[1]?.id).toBe(2); // Date 2026-05-02
        expect(result[2]?.id).toBe(1); // Date 2026-05-01
    });

    it("TC10: nên sắp xếp theo amount_asc đúng cách", async () => {
        const userTransactions = mockTransactions.filter(t => t.userId === userId);
        mockFindByCriteria.mockResolvedValue([...userTransactions] as any);

        const result = await TransactionService.searchTransactions(userId, mockSearchFilters.withSortAmountAsc);

        expect(result[0]?.amount).toBe(100000); // id: 3
        expect(result[1]?.amount).toBe(200000); // id: 2
        expect(result[2]?.amount).toBe(500000); // id: 1
    });

    it("TC09: nên sắp xếp theo date_asc đúng cách", async () => {
        const userTransactions = mockTransactions.filter(t => t.userId === userId);
        mockFindByCriteria.mockResolvedValue([...userTransactions] as any);

        const result = await TransactionService.searchTransactions(userId, mockSearchFilters.withSortDateAsc);

        expect(result[0]?.id).toBe(1); // Date 2026-05-01
        expect(result[1]?.id).toBe(2); // Date 2026-05-02
        expect(result[2]?.id).toBe(3); // Date 2026-05-03
    });

    it("TC07: nên sắp xếp theo amount_desc đúng cách", async () => {
        const userTransactions = mockTransactions.filter(t => t.userId === userId);
        mockFindByCriteria.mockResolvedValue([...userTransactions] as any);

        const result = await TransactionService.searchTransactions(userId, mockSearchFilters.withSortAmountDesc);

        expect(result[0]?.amount).toBe(500000); // id: 1
        expect(result[1]?.amount).toBe(200000); // id: 2
        expect(result[2]?.amount).toBe(100000); // id: 3
    });

    it("TC21: nên ném ra lỗi nếu repository ném lỗi", async () => {
        mockFindByCriteria.mockRejectedValue(new Error("DB Error"));

        await expect(TransactionService.searchTransactions(userId, mockSearchFilters.empty))
            .rejects
            .toThrow("Lỗi dịch vụ khi tìm kiếm giao dịch: DB Error");
    });

    it("TC22: nên ném ra chính xác ApiError nếu repository ném ra ApiError", async () => {
        const { default: ApiError } = await import("../../src/utils/ErrorClass.js");
        const apiError = new ApiError("Lỗi tuỳ chỉnh", 400);
        mockFindByCriteria.mockRejectedValue(apiError);

        await expect(TransactionService.searchTransactions(userId, mockSearchFilters.empty))
            .rejects
            .toThrow(apiError);
    });
});
