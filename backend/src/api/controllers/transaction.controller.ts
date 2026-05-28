import type { Response, NextFunction } from "express";
import { TransactionService } from "../../core/services/transaction.service.js";
import AppResponse from "../../utils/AppResponse.js";
import type { AuthRequest } from "../middlewares/authMiddleware.js";

export class TransactionController {
    static async getAll(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;

            const result = await TransactionService.getTransaction(userId);
            return AppResponse.success(res, result, 'Lấy lịch sử giao dịch thành công!', 200)

        } catch (error) {
            next(error)
        }
    }

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

    static async delete(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const userId = req.user.id;
            const {id} = req.params;

            const result = await TransactionService.deleteTransaction(userId, Number(id));
            return AppResponse.success(res, result, 'Xóa giao dịch thành công!', 200);
        } catch (error) {
            next(error)
        }
    }
    
    static async update(req: AuthRequest, res: Response, next: NextFunction){
        try {
            const userId = req.user.id;
            const {id} = req.params;
            const transactionData = req.body;


            const result = await TransactionService.updateTransaction(userId, Number(id), transactionData);

            return AppResponse.success(res, result, 'Cập nhật giao dịch thành công', 200);

        } catch (error) {
            next(error);
        }
    }

    static async search(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const filters = req.body;
            const result = await TransactionService.searchTransactions(userId, filters);
            return AppResponse.success(res, result, "Tìm kiếm thành công", 200);
        } catch (error) {
            next(error);
        }
    }

}