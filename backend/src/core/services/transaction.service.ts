import { CategoryRepository } from "../../database/repositories/category.repository.js";
import { TransactionRepository } from "../../database/repositories/transaction.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { CreateTransactionDTO, SearchTransactionDTO } from "../dtos/transaction.dto.js";
import { BudgetService } from "./budget.service.js";

export class TransactionService {

    static async getTransaction(userId: number) {
        const transaction = await TransactionRepository.getByUser(userId);
        return transaction;
    }
    
    // --- 1. THÊM GIAO DỊCH (Có kiểm tra ngân sách) ---
    static async createTransaction(userId: number, data: CreateTransactionDTO) {
        const category = await CategoryRepository.findByPk(data.categoryId);
        if (!category) {
            throw new ApiError('Danh mục không tồn tại!', 404);
        }

        const result = await TransactionRepository.create({
            userId: userId,
            amount: data.amount,
            type: category.type,
            categoryId: data.categoryId,
            description: data.description,
            date: new Date(data.date)
        });

        let budgetAlert = null;

        // Nếu là khoản CHI, gọi BudgetService để kiểm tra cảnh báo
        if (category.type === 'EXPENSE') {
            const date = new Date(data.date);
            budgetAlert = await BudgetService.checkBudgetAlert(
                userId,
                data.categoryId,
                date.getMonth() + 1,
                date.getFullYear()
            );
        }

        return {
            ...result,
            budgetAlert
        };
    }

    // --- 2. XÓA GIAO DỊCH ---
    static async deleteTransaction(userId: number, transactionId: number) {
        const transaction = await TransactionRepository.findByPk(transactionId);
        if (!transaction) {
            throw new ApiError('Giao dịch không tồn tại!', 404);
        }

        if (transaction.userId !== userId) {
            throw new ApiError('Bạn không có quyền xóa giao dịch của người khác!', 403);
        }

        await TransactionRepository.delete(transactionId);

        return { message: "Xóa giao dịch thành công!" };
    }

    // --- 3. SỬA GIAO DỊCH (Có kiểm tra chéo ngân sách cũ & mới) ---
    static async updateTransaction(userId: number, transactionId: number, data: CreateTransactionDTO) {
        const oldTransaction = await TransactionRepository.findByPk(transactionId);

        if (!oldTransaction) {
            throw new ApiError('Giao dịch không tồn tại!', 404);
        }

        if (oldTransaction.userId !== userId) {
            throw new ApiError('Bạn không có quyền sửa giao dịch của người khác!', 403);
        }

        const newCategory = await CategoryRepository.findByPk(data.categoryId);
        if (!newCategory) {
            throw new ApiError('Danh mục không tồn tại!', 404);
        }

        const result = await TransactionRepository.update(transactionId, data);

        // Kiểm tra ngân sách cho cả danh mục cũ và danh mục mới (nếu có thay đổi)
        const affectedCategories = new Set<number>();
        affectedCategories.add(oldTransaction.categoryId);
        affectedCategories.add(data.categoryId);

        const alerts: any[] = [];
        const date = new Date(data.date);

        for (const catId of affectedCategories) {
            const category = await CategoryRepository.findByPk(catId);

            if (category?.type === 'EXPENSE') {
                const alert = await BudgetService.checkBudgetAlert(
                    userId,
                    catId,
                    date.getMonth() + 1,
                    date.getFullYear()
                );

                if (alert) {
                    alerts.push({ categoryId: catId, ...alert });
                }
            }
        }

        return {
            ...result,
            budgetAlerts: alerts
        };
    }

    // --- 4. TÌM KIẾM VÀ LỌC LỊCH SỬ GIAO DỊCH ---
    static async searchTransactions(userId: number, data: SearchTransactionDTO) {
        try {
            const { sort, ...filters } = data;

            const transactions = await TransactionRepository.findByCriteria(
                userId,
                filters 
            );

            if (sort === "date_desc") {
                return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
            }

            if (sort === "date_asc") {
                return transactions.sort((a, b) => a.date.getTime() - b.date.getTime());
            }

            if (sort === "amount_desc") {
                return transactions.sort((a, b) => b.amount - a.amount);
            }

            if (sort === "amount_asc") {
                return transactions.sort((a, b) => a.amount - b.amount);
            }

            return transactions;
        } catch (error: any) {
            if (error instanceof ApiError) throw error;
            throw new ApiError(`Lỗi dịch vụ khi tìm kiếm giao dịch: ${error.message}`, 500);
        }
    }
}