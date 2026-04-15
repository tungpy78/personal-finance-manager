import type { CreationAttributes } from "sequelize";
import Transaction from "../models/Transaction.js";

export type ITransactionCreate = CreationAttributes<Transaction>;

export class TransactionRepository {
    static async create(data: ITransactionCreate) {
        const newTransaction = await Transaction.create(data);

        return newTransaction.toJSON();
    }
}