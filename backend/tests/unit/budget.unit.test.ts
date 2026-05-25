import { jest } from '@jest/globals';
import { mockCategories, mockBudgetPayloads } from '../mocks/budget.mock.js';

// ============================================================================
// 1. KHỞI TẠO MOCK FUNCTIONS
// ============================================================================
const mockUpsertBudget = jest.fn() as any;
const mockGetSpentAmount = jest.fn() as any;
const mockGetBudgetByCategory = jest.fn() as any;
const mockGetBudgetsByMonth = jest.fn() as any;

// QUAN TRỌNG: đổi thành findByPk
const mockFindCategoryByPk = jest.fn() as any;

// ============================================================================
// 2. MOCK MODULES
// ============================================================================
jest.unstable_mockModule(
    "../../src/database/repositories/budget.repository.js",
    () => ({
        BudgetRepository: {
            upsertBudget: mockUpsertBudget,
            getSpentAmount: mockGetSpentAmount,
            getBudgetByCategory: mockGetBudgetByCategory,
            getBudgetsByMonth: mockGetBudgetsByMonth
        }
    })
);

jest.unstable_mockModule(
    "../../src/database/repositories/category.repository.js",
    () => ({
        CategoryRepository: {
            // QUAN TRỌNG: phải là findByPk
            findByPk: mockFindCategoryByPk
        }
    })
);

// ============================================================================
// 3. IMPORT SERVICE
// ============================================================================
const { BudgetService } = await import(
    "../../src/core/services/budget.service.js"
);

// ============================================================================
// 4. TEST CASES
// ============================================================================
describe("Unit Test: BudgetService", () => {
    const userId = 1;

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // =========================================================================
    // setupBudget
    // =========================================================================
    describe("Nghiệp vụ: setupBudget (Thiết lập ngân sách)", () => {

        it("TC-NS-01: Nên thiết lập ngân sách thành công cho danh mục EXPENSE", async () => {

            mockFindCategoryByPk.mockResolvedValue(mockCategories[0]);

            mockUpsertBudget.mockResolvedValue(true);

            await BudgetService.setupBudget(
                userId,
                mockBudgetPayloads.valid
            );

            expect(mockFindCategoryByPk)
                .toHaveBeenCalledWith(
                    mockBudgetPayloads.valid.category_id
                );

            expect(mockUpsertBudget)
                .toHaveBeenCalledWith({
                    userId: userId,
                    categoryId: mockBudgetPayloads.valid.category_id,
                    amount: mockBudgetPayloads.valid.amount_limit,
                    month: mockBudgetPayloads.valid.month,
                    year: mockBudgetPayloads.valid.year
                });
        });

        it("Nên báo lỗi nếu danh mục không tồn tại trong DB", async () => {

            mockFindCategoryByPk.mockResolvedValue(null);

            await expect(
                BudgetService.setupBudget(
                    userId,
                    mockBudgetPayloads.notFoundCategory
                )
            )
            .rejects
            .toThrow();
        });

        it("Bẫy lỗi SQA: Nên chặn không cho thiết lập ngân sách đối với danh mục INCOME", async () => {

            mockFindCategoryByPk.mockResolvedValue(
                mockCategories[2]
            );

            await expect(
                BudgetService.setupBudget(
                    userId,
                    mockBudgetPayloads.incomeCategory
                )
            )
            .rejects
            .toThrow(
                "Chỉ có thể thiết lập ngân sách cho danh mục loại Chi tiêu."
            );
        });
    });

    // =========================================================================
    // checkBudgetAlert
    // =========================================================================
    describe("Nghiệp vụ: checkBudgetAlert (Trái tim phát cảnh báo)", () => {

        const testMonth = 5;
        const testYear = 2026;

        it("Nên trả về null nếu chưa có ngân sách", async () => {

            mockGetBudgetByCategory.mockResolvedValue(null);

            const alert =
                await BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                );

            expect(alert).toBeNull();
        });

        it("TC-NS-04: WARNING khi đạt 80%", async () => {

            mockGetBudgetByCategory.mockResolvedValue({
                amount: 5000000
            });

            mockGetSpentAmount.mockResolvedValue(4100000);

            const alert =
                await BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                );

            expect(alert).toBeDefined();

            expect(alert?.level)
                .toBe('WARNING');

            expect(alert?.message)
                .toContain('80%');
        });

        it("TC-NS-05: DANGER khi vượt 100%", async () => {

            mockGetBudgetByCategory.mockResolvedValue({
                amount: 5000000
            });

            mockGetSpentAmount.mockResolvedValue(5600000);

            const alert =
                await BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                );

            expect(alert).toBeDefined();

            expect(alert?.level)
                .toBe('DANGER');

            expect(alert?.message)
                .toContain('vượt');
        });
    });
});