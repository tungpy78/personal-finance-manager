import type { Response, NextFunction } from "express";
import { BudgetService } from "../../core/services/budget.service.js";
import AppResponse from "../../utils/AppResponse.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import { GetBudgetProgressSchema, type UpsertBudgetDTO } from "../../core/dtos/budget.dto.js";

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
            const validatedQuery =
            GetBudgetProgressSchema.parse(req.query);
            const result =
                await BudgetService.getBudgetProgress(
                    req.user.id,
                    validatedQuery.month,
                    validatedQuery.year
                );

            return res.status(200).json({
                success: true,
                data: result
            });
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