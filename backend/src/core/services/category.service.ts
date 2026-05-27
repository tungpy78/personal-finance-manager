import { CategoryRepository } from "../../database/repositories/category.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { CategoryDTO } from "../dtos/category.dto.js";

export class CategoryService {

    static async getCategories(userId: number, filters: { keyword?: string, type?: string }) {
        return await CategoryRepository.findAll(userId, filters);
    }

    static async createCategory(userId: number, data: CategoryDTO) {
        // Kiểm tra trùng lặp (Tên + Loại) của chính user đó
        const existing = await CategoryRepository.findOneByNameAndType(data.name, data.type, userId);
        if (existing) {
            throw new ApiError('Danh mục này đã tồn tại trong danh sách của bạn!', 409);
        }

        return await CategoryRepository.create({ ...data, userId });
    }

    static async updateCategory(id: number, userId: number, data: CategoryDTO) {
        const category = await CategoryRepository.findByPk(id, userId);
        if (!category) {
            throw new ApiError('Danh mục không tồn tại hoặc bạn không có quyền chỉnh sửa!', 404);
        }

        // Kiểm tra nếu tên mới trùng với danh mục khác cùng loại của user đó
        const existing = await CategoryRepository.findOneByNameAndType(data.name, data.type, userId);
        if (existing && existing.id !== id) {
            throw new ApiError('Tên danh mục mới đã trùng với một danh mục khác!', 409);
        }

        return await CategoryRepository.update(id, userId, data);
    }

    static async deleteCategory(id: number, userId: number) {
        const category = await CategoryRepository.findByPk(id, userId);
        if (!category) {
            throw new ApiError('Danh mục không tồn tại hoặc bạn không có quyền xóa!', 404);
        }

        // Kiểm tra toàn vẹn dữ liệu: Không cho phép xóa nếu có giao dịch liên quan
        const isUsed = await CategoryRepository.isCategoryUsed(id);
        if (isUsed) {
            throw new ApiError('Không thể xóa danh mục này vì đang có giao dịch liên quan!', 400);
        }

        await CategoryRepository.delete(id, userId);
        return { message: "Xóa danh mục thành công!" };
    }
}
