import { CategoryRepository } from "../../database/repositories/category.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { CategoryDTO } from "../dtos/category.dto.js";

export class CategoryService {

    static async getCategories(filters: { keyword?: string, type?: string }) {
        return await CategoryRepository.findAll(filters);
    }

    static async createCategory(data: CategoryDTO) {
        // Kiểm tra trùng lặp (Tên + Loại)
        const existing = await CategoryRepository.findOneByNameAndType(data.name, data.type);
        if (existing) {
            throw new ApiError('Danh mục này đã tồn tại trong hệ thống!', 409);
        }

        return await CategoryRepository.create(data);
    }

    static async updateCategory(id: number, data: CategoryDTO) {
        const category = await CategoryRepository.findByPk(id);
        if (!category) {
            throw new ApiError('Danh mục không tồn tại!', 404);
        }

        // Kiểm tra nếu tên mới trùng với danh mục khác cùng loại
        const existing = await CategoryRepository.findOneByNameAndType(data.name, data.type);
        if (existing && existing.id !== id) {
            throw new ApiError('Tên danh mục mới đã trùng với một danh mục khác!', 409);
        }

        return await CategoryRepository.update(id, data);
    }

    static async deleteCategory(id: number) {
        const category = await CategoryRepository.findByPk(id);
        if (!category) {
            throw new ApiError('Danh mục không tồn tại!', 404);
        }

        // Kiểm tra toàn vẹn dữ liệu: Không cho phép xóa nếu có giao dịch liên quan
        const isUsed = await CategoryRepository.isCategoryUsed(id);
        if (isUsed) {
            throw new ApiError('Không thể xóa danh mục này vì đang có giao dịch liên quan!', 400);
        }

        await CategoryRepository.delete(id);
        return { message: "Xóa danh mục thành công!" };
    }
}
