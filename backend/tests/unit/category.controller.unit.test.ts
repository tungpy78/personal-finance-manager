import { jest } from '@jest/globals';

const mockGetCategories = jest.fn() as any;
const mockCreateCategory = jest.fn() as any;
const mockUpdateCategory = jest.fn() as any;
const mockDeleteCategory = jest.fn() as any;

jest.unstable_mockModule("../../src/core/services/category.service.js", () => ({
    CategoryService: {
        getCategories: mockGetCategories,
        createCategory: mockCreateCategory,
        updateCategory: mockUpdateCategory,
        deleteCategory: mockDeleteCategory,
    }
}));

const { CategoryController } = await import("../../src/api/controllers/category.controller.js");

describe("CategoryController - Unit Test", () => {
    let req: any;
    let res: any;
    let next: any;

    beforeEach(() => {
        req = {
            query: {},
            params: {},
            body: {},
            user: { id: 1 } // Giả lập user đã login
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis(),
        };
        next = jest.fn();
        jest.clearAllMocks();
    });

    describe("getCategories", () => {
        it("nên gọi CategoryService.getCategories và trả về thành công", async () => {
            const mockData = [{ id: 1, name: 'Test' }];
            mockGetCategories.mockResolvedValue(mockData);

            await CategoryController.getCategories(req, res, next);

            expect(mockGetCategories).toHaveBeenCalledWith(1, {});
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                success: true,
                data: mockData
            }));
        });
    });

    describe("createCategory", () => {
        it("nên gọi CategoryService.createCategory và trả về 201", async () => {
            const mockData = { id: 1, name: 'New' };
            req.body = { name: 'New', type: 'EXPENSE' };
            mockCreateCategory.mockResolvedValue(mockData);

            await CategoryController.createCategory(req, res, next);

            expect(mockCreateCategory).toHaveBeenCalledWith(1, req.body);
            expect(res.status).toHaveBeenCalledWith(201);
        });
    });

    describe("updateCategory", () => {
        it("nên báo lỗi nếu ID không hợp lệ", async () => {
            req.params.id = "abc";
            await CategoryController.updateCategory(req, res, next);
            expect(next).toHaveBeenCalledWith(expect.any(Error));
        });

        it("nên cập nhật thành công", async () => {
            req.params.id = "1";
            req.body = { name: 'Updated' };
            mockUpdateCategory.mockResolvedValue({ id: 1, name: 'Updated' });

            await CategoryController.updateCategory(req, res, next);

            expect(mockUpdateCategory).toHaveBeenCalledWith(1, 1, req.body);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });

    describe("deleteCategory", () => {
        it("nên xóa thành công", async () => {
            req.params.id = "1";
            mockDeleteCategory.mockResolvedValue({ message: "Deleted" });

            await CategoryController.deleteCategory(req, res, next);

            expect(mockDeleteCategory).toHaveBeenCalledWith(1, 1);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
        });
    });
});