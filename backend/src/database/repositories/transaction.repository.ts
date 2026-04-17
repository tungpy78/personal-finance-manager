import type { CreationAttributes } from "sequelize";
import Transaction from "../models/Transaction.js";
import type { CreateTransactionDTO } from "../../core/dtos/transaction.dto.js";

export type ITransactionCreate = CreationAttributes<Transaction>;

export class TransactionRepository {
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
}