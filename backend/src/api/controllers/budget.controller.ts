import type { Response, NextFunction } from "express";
import { BudgetService } from "../../core/services/budget.service.js";
import AppResponse from "../../utils/AppResponse.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import type { UpsertBudgetDTO } from "../../core/dtos/budget.dto.js";

export class BudgetController {
    static async setupBudget(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            
            const budgetData = req.body as UpsertBudgetDTO;

            const result = await BudgetService.setupBudget(userId, budgetData);

            return AppResponse.success(res, result, 'Thiết lập thành công', 201);
            
        } catch (error) {
            next(error);
        }
    }

    static async getBudgetProgress(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            
            const month = Number(req.query.month);
            const year = Number(req.query.year);

            if (!month || !year) {
                throw new Error("Vui lòng cung cấp tháng và năm hợp lệ để xem tiến độ.");
            }

            const result = await BudgetService.getBudgetProgress(userId, month, year);

            return AppResponse.success(res, result, 'Lấy tiến độ ngân sách thành công', 200);
            
        } catch (error) {
            next(error);
        }
    }

    static async getTotalAmount(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const categoryId = Number(req.query.category_id);
            const month = Number(req.query.month);
            const year = Number(req.query.year);

            // SQA: Kiểm tra chặn dữ liệu rác/thiếu
            if (!categoryId || !month || !year) {
                throw new Error("Vui lòng cung cấp category_id, tháng và năm hợp lệ.");
            }

            // Gọi thẳng xuống Service mới để tính tổng tiền (áp dụng được cho cả INCOME và EXPENSE)
            const result = await BudgetService.getTotalAmountByCategory(userId, categoryId, month, year);

            return AppResponse.success(res, result, 'Tính tổng tiền danh mục thành công', 200);
            
        } catch (error) {
            next(error);
        }
    }
}