import { jest } from '@jest/globals';
import { mockCategories } from "../mocks/category.mock.js";

const mockFindAll = jest.fn() as any;
const mockFindOneByNameAndType = jest.fn() as any;
const mockCreate = jest.fn() as any;
const mockFindByPk = jest.fn() as any;
const mockUpdate = jest.fn() as any;
const mockDelete = jest.fn() as any;
const mockIsCategoryUsed = jest.fn() as any;

jest.unstable_mockModule("../../src/database/repositories/category.repository.js", () => ({
    CategoryRepository: {
        findAll: mockFindAll,
        findOneByNameAndType: mockFindOneByNameAndType,
        create: mockCreate,
        findByPk: mockFindByPk,
        update: mockUpdate,
        delete: mockDelete,
        isCategoryUsed: mockIsCategoryUsed,
    }
}));

const { CategoryService } = await import("../../src/core/services/category.service.js");

describe("CategoryService - Unit Test", () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("getCategories", () => {
        it("nên trả về danh sách danh mục", async () => {
            mockFindAll.mockResolvedValue(mockCategories);
            const result = await CategoryService.getCategories({});
            expect(result).toEqual(mockCategories);
            expect(mockFindAll).toHaveBeenCalled();
        });
    });

    describe("createCategory", () => {
        it("nên tạo danh mục mới nếu chưa tồn tại", async () => {
            const newCategory = { name: 'Thú cưng', type: 'EXPENSE', icon: 'pet' };
            mockFindOneByNameAndType.mockResolvedValue(null);
            mockCreate.mockResolvedValue({ id: 5, ...newCategory });

            const result = await CategoryService.createCategory(newCategory as any);

            expect(result.id).toBe(5);
            expect(mockCreate).toHaveBeenCalledWith(newCategory);
        });

        it("nên ném lỗi nếu danh mục đã tồn tại", async () => {
            const existingCategory = mockCategories[0];
            mockFindOneByNameAndType.mockResolvedValue(existingCategory);

            await expect(CategoryService.createCategory(existingCategory as any))
                .rejects
                .toThrow('Danh mục này đã tồn tại trong hệ thống!');
        });
    });

    describe("updateCategory", () => {
        it("nên cập nhật danh mục thành công", async () => {
            const updateData = { name: 'Ăn uống ngon', type: 'EXPENSE', icon: 'food' };
            mockFindByPk.mockResolvedValue(mockCategories[0]);
            mockFindOneByNameAndType.mockResolvedValue(null);
            mockUpdate.mockResolvedValue({ ...mockCategories[0], ...updateData });

            const result = await CategoryService.updateCategory(1, updateData as any);

            expect(result.name).toBe('Ăn uống ngon');
            expect(mockUpdate).toHaveBeenCalledWith(1, updateData);
        });

        it("nên ném lỗi nếu danh mục không tồn tại", async () => {
            mockFindByPk.mockResolvedValue(null);
            await expect(CategoryService.updateCategory(999, {} as any))
                .rejects
                .toThrow('Danh mục không tồn tại!');
        });

        it("nên ném lỗi nếu tên mới trùng với danh mục khác cùng loại", async () => {
            mockFindByPk.mockResolvedValue(mockCategories[0]);
            mockFindOneByNameAndType.mockResolvedValue(mockCategories[1]); // Trùng với ID 2

            await expect(CategoryService.updateCategory(1, { name: 'Di chuyển', type: 'EXPENSE' } as any))
                .rejects
                .toThrow('Tên danh mục mới đã trùng với một danh mục khác!');
        });
    });

    describe("deleteCategory", () => {
        it("nên xóa danh mục thành công", async () => {
            mockFindByPk.mockResolvedValue(mockCategories[0]);
            mockIsCategoryUsed.mockResolvedValue(false);
            mockDelete.mockResolvedValue(true);

            const result = await CategoryService.deleteCategory(1);

            expect(result.message).toBe("Xóa danh mục thành công!");
            expect(mockDelete).toHaveBeenCalledWith(1);
        });

        it("nên ném lỗi nếu danh mục đang được sử dụng", async () => {
            mockFindByPk.mockResolvedValue(mockCategories[0]);
            mockIsCategoryUsed.mockResolvedValue(true);

            await expect(CategoryService.deleteCategory(1))
                .rejects
                .toThrow('Không thể xóa danh mục này vì đang có giao dịch liên quan!');
        });
    });
});
