import { Op, type CreationAttributes } from "sequelize";
import Transaction from "../models/Transaction.js";
import type { CreateTransactionDTO, SearchTransactionDTO } from "../../core/dtos/transaction.dto.js";
import { tr } from "zod/locales";

export type ITransactionCreate = CreationAttributes<Transaction>;

export class TransactionRepository {
    static async getByUser(userId: number) {
        const transaction = await Transaction.findAll({
            where: {userId: userId}
        })

        return transaction
    }

    static async create(data: ITransactionCreate) {
        const newTransaction = await Transaction.create(data);

        return newTransaction.toJSON();
    }

    static async findByPk(transactionId : number){
        const transaction = await Transaction.findByPk(transactionId);

        return transaction?.toJSON();
    }

    static async delete(transactionId: number) {
        return await Transaction.destroy({
            where: { id: transactionId }
        });
    }

    static async update(transactionId: number, data: CreateTransactionDTO) {

        await Transaction.update(data, {
            where: { id: transactionId }
        });


        return await this.findByPk(transactionId);
    }

    static async findAllByUserId(userId: number) {
        return await Transaction.findAll({
            where: { userId }
        });
    }



    static async findByCriteria(userId: number, filters: Omit<SearchTransactionDTO, "sort">) {
        try {
            return await Transaction.findAll({
                where: {
                    userId,
                    ...(filters.search && { description: { [Op.like]: `%${filters.search}%` } }),
                    ...(filters.type && { type: filters.type.toUpperCase() }),
                    ...(filters.category_id && { category_id: Number(filters.category_id) }),
                    ...(filters.begin_date || filters.end_date
                        ? {
                            date: {
                                ...(filters.begin_date && { [Op.gte]: filters.begin_date }),
                                ...(filters.end_date && { [Op.lte]: filters.end_date }),
                            },
                        }
                        : {}),
                },
            });
        } catch (error: any) {
            throw new Error(`Database error trong quá trình tìm kiếm giao dịch: ${error.message}`);
        }
    }
}