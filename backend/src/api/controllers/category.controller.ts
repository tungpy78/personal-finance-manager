import type { Response, NextFunction, Request } from "express";
import { CategoryService } from "../../core/services/category.service.js";
import AppResponse from "../../utils/AppResponse.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

export class CategoryController {

    static async getCategories(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { keyword, type } = req.query;
            const filters: { keyword?: string; type?: string } = {};
            if (typeof keyword === 'string') filters.keyword = keyword;
            if (typeof type === 'string') filters.type = type;
            
            const categories = await CategoryService.getCategories(req.user.id, filters);
            return AppResponse.success(res, categories, 'Lấy danh sách danh mục thành công');
        } catch (error) {
            next(error);
        }
    }

    static async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const category = await CategoryService.createCategory(req.user.id, req.body);
            return AppResponse.success(res, category, 'Thêm danh mục thành công', 201);
        } catch (error) {
            next(error);
        }
    }

    static async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                throw new Error('ID không hợp lệ');
            }
            const category = await CategoryService.updateCategory(id, req.user.id, req.body);
            return AppResponse.success(res, category, 'Cập nhật danh mục thành công');
        } catch (error) {
            next(error);
        }
    }

    static async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const id = parseInt(req.params.id as string);
            if (isNaN(id)) {
                throw new Error('ID không hợp lệ');
            }
            const result = await CategoryService.deleteCategory(id, req.user.id);
            return AppResponse.success(res, null, result.message);
        } catch (error) {
            next(error);
        }
    }
}
