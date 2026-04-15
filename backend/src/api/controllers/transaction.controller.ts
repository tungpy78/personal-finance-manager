import type { Response, NextFunction } from "express";
import { TransactionService } from "../../core/services/transaction.service.js";
import AppResponse from "../../utils/AppResponse.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

export class TransactionController {
    static async create(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const userId = req.user.id;
            const transactionData = req.body;

            const result = await TransactionService.createTransaction(userId, transactionData);
            return AppResponse.success(res, result, 'Thêm giao dịch thành công!', 201);
        } catch (error) {
            next(error);
        }
    }
}