import Category from "../../database/models/Category.js";
import { CategoryRepository } from "../../database/repositories/category.repository.js";
import { TransactionRepository } from "../../database/repositories/transaction.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { CreateTransactionDTO } from "../dtos/transaction.dto.js";

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

}