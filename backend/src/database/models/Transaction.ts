import { DataTypes, Model } from 'sequelize';
import sequelize from '../../config/database.js';

class Transaction extends Model {
  public id!: number;
  public amount!: number;
  public type!: string;
  public date!: Date;
  public description!: string;
  public category_id!: number;
  public user_id!: number;
}

Transaction.init({
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
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