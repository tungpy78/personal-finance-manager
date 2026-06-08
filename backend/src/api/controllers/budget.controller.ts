import type { Response, NextFunction } from "express";
import { BudgetService } from "../../core/services/budget.service.js";
import AppResponse from "../../utils/AppResponse.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";
import type { UpsertBudgetDTO } from "../../core/dtos/budget.dto.js";
import { z } from "zod";
import { ProgressQuerySchema } from '../../core/dtos/budget.dto.js';

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
            const validation = ProgressQuerySchema.safeParse(req.query);

            if (!validation.success) {
                return res.status(400).json({
                    success: false,
                    statusCode: 400,
                    message: "Dữ liệu tháng/năm không hợp lệ",
                    errors: validation.error.errors, // Trả về chi tiết lỗi
                    data: null
                });
            }
            
            const { month, year } = validation.data;
            const result = await BudgetService.getBudgetProgress(userId, month, year);
            return AppResponse.success(res, result, 'Lấy tiến độ ngân sách thành công', 200);
        } catch (error) {
            next(error);
        }
    }
}