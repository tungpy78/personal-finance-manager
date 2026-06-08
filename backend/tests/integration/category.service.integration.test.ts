import { CategoryService } from "../../src/core/services/category.service.js";
import Category from "../../src/database/models/Category.js";
import sequelize from "../../src/config/database.js";

describe("CategoryService - Integration Test", () => {
    let createdCategoryIds: number[] = [];
    const testUserId = 1;

    beforeAll(async () => {
        await sequelize.authenticate();
    });

    afterAll(async () => {
        if (createdCategoryIds.length > 0) {
            await Category.destroy({ where: { id: createdCategoryIds } });
        }
        await sequelize.close();
    });

    it("nên tạo và lấy được danh mục từ database", async () => {
        const categoryData = {
            name: `Integration Test Cat ${Date.now()}`,
            type: "EXPENSE",
            icon: "test",
            color: "#FFFFFF"
        };

        const created = await CategoryService.createCategory(testUserId, categoryData as any);
        createdCategoryIds.push(created.id);

        expect(created.id).toBeDefined();
        expect(created.name).toBe(categoryData.name);

        const categories = await CategoryService.getCategories(testUserId, { keyword: categoryData.name });
        expect(categories.some(c => c.id === created.id)).toBeTruthy();
    });

    it("nên cập nhật được danh mục", async () => {
        const categoryData = {
            name: `Cat to Update ${Date.now()}`,
            type: "INCOME",
            icon: "test",
            color: "#FFFFFF"
        };

        const created = await CategoryService.createCategory(testUserId, categoryData as any);
        createdCategoryIds.push(created.id);

        const updatedData = { ...categoryData, name: `Updated Cat ${Date.now()}` };
        const updated = await CategoryService.updateCategory(created.id, testUserId, updatedData as any);

        expect(updated.name).toBe(updatedData.name);
        
        const refreshed = await Category.findByPk(created.id);
        expect(refreshed?.name).toBe(updatedData.name);
    });

    it("nên xóa được danh mục", async () => {
        const categoryData = {
            name: `Cat to Delete ${Date.now()}`,
            type: "EXPENSE"
        };

        const created = await CategoryService.createCategory(testUserId, categoryData as any);
        
        await CategoryService.deleteCategory(created.id, testUserId);

        const found = await Category.findByPk(created.id);
        expect(found).toBeNull();
    });

    it("không nên tạo danh mục trùng tên và loại", async () => {
        const name = `Duplicate Cat ${Date.now()}`;
        const categoryData = { name, type: "EXPENSE" };

        const created = await CategoryService.createCategory(testUserId, categoryData as any);
        createdCategoryIds.push(created.id);

        await expect(CategoryService.createCategory(testUserId, categoryData as any))
            .rejects
            .toThrow('Danh mục này đã tồn tại trong danh sách của bạn!');
    });
});
