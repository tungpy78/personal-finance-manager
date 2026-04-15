import Category from "../../database/models/Category.js";
import { TransactionRepository } from "../../database/repositories/transaction.repository.js";
import ApiError from "../../utils/ErrorClass.js";
import type { CreateTransactionDTO } from "../dtos/transaction.dto.js";

export class TransactionService {
    static async createTransaction(userId: number, data: CreateTransactionDTO){
        const category = await Category.findByPk(data.categoryId);
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
}