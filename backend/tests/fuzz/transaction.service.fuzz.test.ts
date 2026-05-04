import { jest } from '@jest/globals';

const mockFindByCriteria = jest.fn() as any;

jest.unstable_mockModule("../../src/database/repositories/transaction.repository.js", () => ({
    TransactionRepository: {
        findByCriteria: mockFindByCriteria
    }
}));

const { TransactionService } = await import("../../src/core/services/transaction.service.js");
const { TransactionRepository } = await import("../../src/database/repositories/transaction.repository.js");

const generateRandomString = (length: number) => {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:",.<>?/';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateRandomDate = () => {
    const start = new Date(1970, 0, 1).getTime();
    const end = new Date(2050, 11, 31).getTime();
    return new Date(start + Math.random() * (end - start));
};

const generateFuzzFilters = () => {
    const sorts = ["date_asc", "date_desc", "amount_asc", "amount_desc", "invalid_sort", "", null, undefined];
    const types = ["INCOME", "EXPENSE", "INVALID_TYPE", generateRandomString(10), undefined];

    return {
        search: Math.random() > 0.5 ? generateRandomString(Math.floor(Math.random() * 100)) : undefined,
        type: types[Math.floor(Math.random() * types.length)] as any,
        category_id: Math.random() > 0.5 ? Math.floor(Math.random() * 1000) : (Math.random() > 0.5 ? generateRandomString(5) as any : undefined),
        begin_date: Math.random() > 0.5 ? generateRandomDate() : (Math.random() > 0.5 ? generateRandomString(10) as any : undefined),
        end_date: Math.random() > 0.5 ? generateRandomDate() : undefined,
        sort: sorts[Math.floor(Math.random() * sorts.length)] as any,
    };
};

describe("TransactionService - Fuzz Test - searchTransactions", () => {
    const userId = 1;

    beforeEach(() => {
        jest.restoreAllMocks();
        jest.spyOn(TransactionRepository, 'findByCriteria').mockResolvedValue([
            { id: 1, amount: 1000, date: new Date() },
            { id: 2, amount: 2000, date: new Date() }
        ] as any);
    });

    it("không được crash (ném Unhandled Exception) với hàng loạt input ngẫu nhiên (Fuzzing)", async () => {
        const ITERATIONS = 1000;
        let crashes = 0;

        for (let i = 0; i < ITERATIONS; i++) {
            const fuzzInput = generateFuzzFilters();
            try {
                await TransactionService.searchTransactions(userId, fuzzInput);
            } catch (error: any) {
                // If it's a known ApiError (expected validation error etc), it's fine
                // If it's an unhandled TypeError, we count it as a crash
                if (!(error.message.includes("Lỗi dịch vụ") || error.statusCode)) {
                    crashes++;
                    console.error("Fuzz crash with input:", fuzzInput, "Error:", error);
                }
            }
        }

        expect(crashes).toBe(0);
    });
});
