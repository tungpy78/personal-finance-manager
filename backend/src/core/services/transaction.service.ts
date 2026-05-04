import Category from "../../database/models/Category.js";
import { CategoryRepository } from "../../database/repositories/category.repository.js";
import { TransactionRepository } from "../../database/repositories/transaction.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { CreateTransactionDTO, SearchTransactionDTO } from "../dtos/transaction.dto.js";

export class TransactionService {
    static async createTransaction(userId: number, data: CreateTransactionDTO){
        const category = await CategoryRepository.findByPk(data.categoryId)
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

        return result;
    }

    static async deleteTransaction(userId: number, transactionId: number){
        const transaction = await TransactionRepository.findByPk(transactionId);
        if(!transaction){
            throw new ApiError('Giao dịch không tồn tại!', 404)
        }

        if(transaction.userId !== userId){
            throw new ApiError('Bạn không có quyền xóa giao dịch của người khác!', 403);
        }

        await TransactionRepository.delete(transactionId);

        return { message: "Xóa giao dịch thành công!" };

    }

    static async updateTransaction(userId: number, transactionId: number, data: CreateTransactionDTO){
        const transaction = await TransactionRepository.findByPk(transactionId);
        if(!transaction){
            throw new ApiError('Giao dịch không tồn tại!', 404)
        }

        if(transaction.userId !== userId){
            throw new ApiError('Bạn không có quyền sửa giao dịch của người khác!', 403);
        }

        const category = await CategoryRepository.findByPk(data.categoryId)
        if (!category) {
            throw new ApiError('Danh mục không tồn tại!', 404);
        }

        const result = await TransactionRepository.update(transactionId, data);

        return result;
    }

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