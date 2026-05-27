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
                    mockBudgetPayloads.valid.category_id,
                    userId
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

        it("TC-NS-02: Nên báo lỗi nếu danh mục không tồn tại trong DB", async () => {

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

        it("TC-NS-03: Nên chặn không cho thiết lập ngân sách đối với danh mục INCOME", async () => {

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

        it("TC-NS-04: Nên báo lỗi nếu category không thuộc user", async () => {
            mockFindCategoryByPk.mockResolvedValue(null);
            await expect(
                BudgetService.setupBudget(
                    userId,
                    mockBudgetPayloads.valid
                )
            )
            .rejects
            .toThrow(
                "Danh mục chi tiêu không tồn tại hoặc không thuộc quyền sở hữu của bạn."
            );

            expect(mockUpsertBudget)
                .not
                .toHaveBeenCalled();
        });

        it("TC-NS-05: Nên throw error nếu repository lưu ngân sách bị lỗi", async () => {
            mockFindCategoryByPk.mockResolvedValue(
                mockCategories[0]
            );
            mockUpsertBudget.mockRejectedValue(
                new Error("DB Error")
            );
            await expect(
                BudgetService.setupBudget(
                    userId,
                    mockBudgetPayloads.valid
                )
            )
            .rejects
            .toThrow("DB Error");
        });

        it("TC-NS-06: Không được gọi repository save nếu category là INCOME", async () => {
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
            .toThrow();

            expect(mockUpsertBudget)
                .not
                .toHaveBeenCalled();
        });
    });

    // =========================================================================
    // checkBudgetAlert
    // =========================================================================
    describe("Nghiệp vụ: checkBudgetAlert (Trái tim phát cảnh báo)", () => {

        const testMonth = 5;
        const testYear = 2026;

        it("TC-NS-07: Không cảnh báo nếu chi tiêu dưới 80%", async () => {
            mockGetBudgetByCategory.mockResolvedValue({
                amount: 5000000
            });

            mockGetSpentAmount.mockResolvedValue(
                3900000
            );

            const alert =
                await BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                );

            expect(alert).toBeNull();
        });

        it("TC-NS-08: WARNING khi chi tiêu đúng 80%", async () => {
            mockGetBudgetByCategory.mockResolvedValue({
                amount: 5000000
            });

            mockGetSpentAmount.mockResolvedValue(
                4000000
            );

            const alert =
                await BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                );

            expect(alert).toBeDefined();

            expect(alert?.level)
                .toBe("WARNING");

            expect(alert?.percentage)
                .toBe(80);
        });

        it("TC-NS-09: DANGER khi chi tiêu đúng 100%", async () => {
            mockGetBudgetByCategory.mockResolvedValue({
                amount: 5000000
            });

            mockGetSpentAmount.mockResolvedValue(
                5000000
            );

            const alert =
                await BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                );

            expect(alert).toBeDefined();

            expect(alert?.level)
                .toBe("DANGER");

            expect(alert?.percentage)
                .toBe(100);
        });

        it("TC-NS-10: DANGER khi vượt 100%", async () => {
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

        it("TC-NS-11: Nên trả về null nếu ngân sách bằng 0", async () => {
            mockGetBudgetByCategory.mockResolvedValue({
                amount: 0
            });

            const alert =
                await BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                );

            expect(alert).toBeNull();

            expect(mockGetSpentAmount)
                .not
                .toHaveBeenCalled();
        });

        it("TC-NS-12: Nên trả về null nếu chưa có ngân sách", async () => {

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

        it("TC-NS-13: Nên throw error nếu repository lấy số tiền chi tiêu bị lỗi", async () => {
            mockGetBudgetByCategory.mockResolvedValue({
                amount: 5000000
            });

            mockGetSpentAmount.mockRejectedValue(
                new Error("DB Error")
            );

            await expect(
                BudgetService.checkBudgetAlert(
                    userId,
                    1,
                    testMonth,
                    testYear
                )
            )
            .rejects
            .toThrow("DB Error");
        });

        it("TC-NS-14: Nên xử lý chính xác số thực khi tính phần trăm", async () => {
            mockGetBudgetByCategory.mockResolvedValue({
                amount: 5000000
            });

            mockGetSpentAmount.mockResolvedValue(
                3999999
            );

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

            expect(alert?.percentage)
                .toBe(80);  
        });
    });
});