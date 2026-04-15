import { DataTypes, Model, type CreationOptional } from 'sequelize';
import sequelize from '../../config/database.js';

class Transaction extends Model {
  declare id: CreationOptional<number>;
  declare userId: number;
  declare amount: number;
  declare type: 'INCOME' | 'EXPENSE';
  declare categoryId: number;
  declare description: string;
  declare date: Date;
}

Transaction.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  userId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'user_id'
  },
  categoryId: { 
    type: DataTypes.INTEGER, 
    allowNull: false,
    field: 'category_id'
  },
  amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  type: { type: DataTypes.ENUM('INCOME', 'EXPENSE'), allowNull: false },
  date: { type: DataTypes.DATE, allowNull: false },
  description: { type: DataTypes.STRING(255), allowNull: true },
}, { 
  sequelize, 
  tableName: 'Transactions',
  timestamps: true 
});

export default Transaction;